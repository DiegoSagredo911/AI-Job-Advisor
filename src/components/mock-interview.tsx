"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { InterviewMessage } from "@/types/advisor";
import { useProfile } from "@/context/profile-context";
import {
  Send,
  Bot,
  User,
  Award,
  CheckCircle,
  AlertCircle,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Radio,
  RotateCcw,
} from "lucide-react";

interface MockInterviewProps {
  initialJobContext?: string;
  applicationId?: string;
  initialMessages?: InterviewMessage[];
}

export function MockInterview({
  initialJobContext = "Entrevista Profesional & Especialidad",
  applicationId,
  initialMessages,
}: MockInterviewProps) {
  const { activeSlug, activeProfile } = useProfile();
  const [jobContext, setJobContext] = useState(initialJobContext);

  // Auto-detección de idioma inicial (Inglés vs Español)
  const isJobEnglish = Boolean(
    initialJobContext &&
      /\b(engineer|developer|experience|responsibilities|requirements|role|full stack|remote|team|skills|scientist|analyst)\b/i.test(
        initialJobContext
      ) &&
      !/\b(experiencia|requisitos|responsabilidades|cargo|puesto|ingeniero|desarrollador)\b/i.test(
        initialJobContext
      )
  );
  const [interviewLanguage, setInterviewLanguage] = useState<"es" | "en">(
    isJobEnglish ? "en" : "es"
  );

  const getWelcomeMessageContent = (lang: "es" | "en") => {
    const firstName = activeProfile?.fullName ? activeProfile.fullName.split(" ")[0] : "";
    if (lang === "en") {
      return `Hello${firstName ? " " + firstName : ""}, welcome to your interview simulation session. I have thoroughly reviewed your background and projects. To get started: Could you tell me about the most impactful challenge or project you have led in your career, and how you ensured its success?`;
    }
    return `Hola${firstName ? " " + firstName : ""}, bienvenido/a a tu simulación de entrevista. He revisado tu perfil y veo una sólida trayectoria profesional. Para comenzar: ¿Podrías describir el proyecto o desafío más relevante que hayas liderado en tu experiencia y cómo garantizaste su éxito?`;
  };

  const [messages, setMessages] = useState<InterviewMessage[]>(
    initialMessages || [
      {
        id: "msg-welcome",
        sender: "interviewer",
        content: getWelcomeMessageContent(isJobEnglish ? "en" : "es"),
        timestamp: new Date().toISOString(),
      },
    ]
  );
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Audio / Speech State (Selector: Solo Chat | Voz Local 0 Tokens | Voz Gemini IA)
  const [voiceMode, setVoiceMode] = useState<"chat_only" | "browser_tts" | "gemini_tts">("browser_tts");
  const [geminiVoice, setGeminiVoice] = useState("Puck");
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);

  // Modo de visualización de Feedback: "on_demand" (se pide con un botón) o "instant" (abierto automáticamente)
  const [feedbackViewMode, setFeedbackViewMode] = useState<"on_demand" | "instant">("on_demand");
  const [expandedFeedbackIds, setExpandedFeedbackIds] = useState<Record<string, boolean>>({});

  const toggleFeedback = (msgId: string) => {
    setExpandedFeedbackIds((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const storageKey = `ai_job_advisor_mock_interview_${activeSlug || "mi-perfil"}`;

  // Cargar sesión persistente al montar el componente (para que nunca se pierda el chat)
  useEffect(() => {
    if (typeof window !== "undefined" && !applicationId && (!initialMessages || initialMessages.length === 0)) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        }
        const savedLang = localStorage.getItem(`${storageKey}_lang`);
        if (savedLang === "es" || savedLang === "en") {
          setInterviewLanguage(savedLang);
        }
      } catch (e) {
        console.warn("Failed to restore saved interview", e);
      }
    }
  }, [activeSlug, applicationId, storageKey, initialMessages]);

  // Guardar automáticamente cada nuevo mensaje en disco (localStorage)
  useEffect(() => {
    if (typeof window !== "undefined" && !applicationId && messages.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(messages));
        localStorage.setItem(`${storageKey}_lang`, interviewLanguage);
      } catch (e) {
        console.warn("Failed to save interview to localStorage", e);
      }
    }
  }, [messages, interviewLanguage, activeSlug, applicationId, storageKey]);

  // Refs for Web Speech & Gemini Audio playback
  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  // Initialize Speech Recognition & Synthesis check
  useEffect(() => {
    if (typeof window !== "undefined") {
      // TTS check
      if ("speechSynthesis" in window) {
        setSpeechSupported(true);
      }

      // STT check (Web Speech API)
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        setSpeechRecognitionSupported(true);
        const recog = new SpeechRecognition();
        recog.continuous = true;
        recog.interimResults = true;
        recog.lang = interviewLanguage === "en" ? "en-US" : "es-ES";

        recog.onresult = (event: any) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            setInputValue((prev) => {
              // Si ya había texto, concatena limpiamente
              if (prev.endsWith(" ") || prev === "") {
                return prev + transcript;
              }
              return prev + " " + transcript;
            });
          }
        };

        recog.onerror = (event: any) => {
          console.warn("Speech recognition event error:", event.error);
          setIsListening(false);
        };

        recog.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recog;
      }
    }

    return () => {
      if (typeof window !== "undefined") {
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
          currentAudioRef.current = null;
        }
      }
    };
  }, []);

  const stopSpeaking = () => {
    if (typeof window !== "undefined") {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        currentAudioRef.current = null;
      }
      setIsSpeaking(false);
      setIsLoadingAudio(false);
    }
  };

  // Text-to-Speech function for AI reply supporting:
  // 1. "chat_only": silence
  // 2. "browser_tts": 0 tokens, local Web Speech API
  // 3. "gemini_tts": Google Gemini Flash ultra-realistic audio
  const speakText = async (text: string, forceVoice = false) => {
    if (typeof window === "undefined") return;

    // Si está en modo solo chat y no se forzó el audio por botón individual, permanecer en silencio
    if (voiceMode === "chat_only" && !forceVoice) {
      return;
    }

    // Detener cualquier audio en curso previo
    stopSpeaking();

    // Opción A: Modo Voz Real de Gemini (Google TTS)
    if (voiceMode === "gemini_tts" && !forceVoice) {
      setIsLoadingAudio(true);
      try {
        const { data } = await axios.post("/api/advisor/speech", {
          text,
          voice: geminiVoice,
        });

        if (data.success && data.audioBase64) {
          setIsSpeaking(true);
          const audio = new Audio("data:audio/wav;base64," + data.audioBase64);
          currentAudioRef.current = audio;

          audio.onended = () => {
            setIsSpeaking(false);
            currentAudioRef.current = null;
          };

          audio.onerror = (e) => {
            console.warn("Fallo reproduciendo audio de Gemini:", e);
            setIsSpeaking(false);
            currentAudioRef.current = null;
          };

          await audio.play();
          return;
        } else {
          throw new Error(data.error || "Respuesta sin datos de audio");
        }
      } catch (err) {
        console.warn("Error en síntesis Gemini TTS, usando voz local del navegador como respaldo:", err);
        // Fallback transparente a voz local del navegador si la API falla o no hay conexión
      } finally {
        setIsLoadingAudio(false);
      }
    }

    // Opción B: Modo Voz Local (0 Tokens / Navegador) o Respaldo
    if ("speechSynthesis" in window) {
      setIsSpeaking(true);

      const isEnglish = interviewLanguage === "en" || /^[a-zA-Z\s,.'?!-]{20,}$/.test(text.slice(0, 50));
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = isEnglish ? "en-US" : "es-ES";
      utterance.rate = 1.05; // Ritmo conversacional ágil
      utterance.pitch = 1.0;

      // Buscar voz nativa según el idioma
      const voices = window.speechSynthesis.getVoices();
      let chosenVoice: SpeechSynthesisVoice | undefined;

      if (isEnglish) {
        chosenVoice =
          voices.find(
            (v) =>
              v.lang.startsWith("en") &&
              (v.name.includes("Google") ||
                v.name.includes("Natural") ||
                v.name.includes("Samantha") ||
                v.name.includes("Daniel") ||
                v.name.includes("Alex"))
          ) || voices.find((v) => v.lang.startsWith("en"));
      } else {
        chosenVoice =
          voices.find(
            (v) =>
              v.lang.startsWith("es") &&
              (v.name.includes("Google") ||
                v.name.includes("Natural") ||
                v.name.includes("Paulina") ||
                v.name.includes("Jorge"))
          ) || voices.find((v) => v.lang.startsWith("es"));
      }

      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  // Push-to-Talk Handlers (Presionar para hablar, soltar para terminar)
  const handleStartPushToTalk = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!speechRecognitionSupported || !recognitionRef.current || isListening) return;

    // Detener la voz del entrevistador si aún está hablando para que no se interfiera
    stopSpeaking();

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.warn("Speech recognition start issue:", err);
    }
  };

  const handleStopPushToTalk = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!recognitionRef.current || !isListening) return;

    try {
      recognitionRef.current.stop();
      setIsListening(false);
    } catch (err) {
      console.warn("Speech recognition stop issue:", err);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isSending) return;

    const answer = inputValue.trim();
    setInputValue("");
    setIsSending(true);

    // Detener cualquier audio previo
    stopSpeaking();

    // Optimistic user message
    const tempUserMsg: InterviewMessage = {
      id: "temp-" + Date.now(),
      sender: "candidate",
      content: answer,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      // Enviar historial completo para mantener memoria contextual
      const chatHistory = messages.map((m) => ({
        role: m.sender === "candidate" ? "user" : "assistant",
        content: m.content,
      }));

      const { data } = await axios.post("/api/advisor/interview", {
        profileSlug: activeSlug,
        jobContext,
        chatHistory,
        candidateAnswer: answer,
        applicationId,
      });

      if (data.success && data.messages) {
        // Reemplazar mensaje temporal con la evaluación del entrevistador
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== tempUserMsg.id),
          ...data.messages,
        ]);

        if (data.messages && data.messages.length > 0) {
          const candMsg = data.messages.find((msg: any) => msg.sender === "candidate");
          if (candMsg && feedbackViewMode === "instant") {
            setExpandedFeedbackIds((prev) => ({
              ...prev,
              [candMsg.id]: true,
            }));
          }
        }

        // Hablar automáticamente la respuesta del entrevistador
        if (data.interviewerReply) {
          speakText(data.interviewerReply);
        }
      }
    } catch (err) {
      console.error("Error in mock interview step with axios:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleToggleLanguage = (lang: "es" | "en") => {
    setInterviewLanguage(lang);
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang === "en" ? "en-US" : "es-ES";
    }
  };

  const handleResetInterview = () => {
    if (window.confirm("¿Deseas reiniciar la simulación de entrevista? La IA olvidará el diálogo actual y comenzará una nueva sesión desde cero.")) {
      stopSpeaking();
      if (typeof window !== "undefined" && !applicationId) {
        localStorage.removeItem(storageKey);
      }
      setExpandedFeedbackIds({});
      setMessages([
        {
          id: "msg-welcome-" + Date.now(),
          sender: "interviewer",
          content: getWelcomeMessageContent(interviewLanguage),
          timestamp: new Date().toISOString(),
        },
      ]);
      setInputValue("");
    }
  };

  return (
    <div className="flex flex-col h-[700px] rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Simulador de Entrevista por Voz & Texto</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                <Radio className="w-2.5 h-2.5 animate-pulse" /> Memoria Contextual Activa
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Perfil evaluado: <strong className="text-slate-200">{activeProfile?.fullName || "Tu Perfil"}</strong>
            </p>
          </div>
        </div>

        {/* Toolbar: Selector de Idioma + Modo de Audio + Reset */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de Idioma (ES / EN) */}
          <div className="flex items-center rounded-xl bg-slate-900 p-0.5 border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleToggleLanguage("es")}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                interviewLanguage === "es"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Simulación en Español (Reconocimiento de voz es-ES)"
            >
              <span>🇪🇸</span>
              <span className="hidden sm:inline">Español</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleLanguage("en")}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                interviewLanguage === "en"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Interview in English (Speech recognition en-US & English TTS)"
            >
              <span>🇺🇸</span>
              <span className="hidden sm:inline">English</span>
            </button>
          </div>

          {/* Selector de Modo de Feedback (Bajo Demanda con Botón vs Automático) */}
          <div className="flex items-center rounded-xl bg-slate-900 p-0.5 border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFeedbackViewMode("on_demand")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                feedbackViewMode === "on_demand"
                  ? "bg-slate-800 text-indigo-300 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Modo Botón: El feedback y nota se consultan haciendo clic en cada respuesta"
            >
              🎯 Con Botón
            </button>
            <button
              type="button"
              onClick={() => setFeedbackViewMode("instant")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                feedbackViewMode === "instant"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Modo Automático: El feedback se despliega automáticamente en cada turno"
            >
              💡 Automático
            </button>
          </div>

          {/* Selector de Modo de Audio: Solo Chat | Voz Local (0 Tokens) | Voz Gemini (IA) */}
          <div className="inline-flex rounded-xl p-0.5 bg-slate-900 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => {
                stopSpeaking();
                setVoiceMode("chat_only");
              }}
              title="Solo Chat: Sin emisión de audio por parlantes"
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                voiceMode === "chat_only"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              💬 Solo Chat
            </button>
            <button
              type="button"
              onClick={() => {
                stopSpeaking();
                setVoiceMode("browser_tts");
              }}
              title="Voz Local del Navegador: 0 Tokens consumidos, sin costo de API"
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                voiceMode === "browser_tts"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🔊 Voz Local (0 Tokens)
            </button>
            <button
              type="button"
              onClick={() => {
                stopSpeaking();
                setVoiceMode("gemini_tts");
              }}
              title="Voz Oficial de Google Gemini: Síntesis de IA hiperrealista"
              className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-all ${
                voiceMode === "gemini_tts"
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Voz Gemini (IA)</span>
            </button>
          </div>

          {/* Selector de Voz específica de Gemini */}
          {voiceMode === "gemini_tts" && (
            <select
              value={geminiVoice}
              onChange={(e) => setGeminiVoice(e.target.value)}
              className="bg-slate-900 border border-indigo-500/40 text-indigo-200 rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:border-indigo-400"
              title="Selecciona el timbre de voz de Gemini"
            >
              <option value="Puck">Voz Puck (Masculina)</option>
              <option value="Aoede">Voz Aoede (Femenina Cálida)</option>
              <option value="Kore">Voz Kore (Femenina Firme)</option>
              <option value="Charon">Voz Charon (Masculina Formal)</option>
              <option value="Fenrir">Voz Fenrir (Enérgica)</option>
              <option value="Zephyr">Voz Zephyr (Brillante)</option>
            </select>
          )}

          {/* Botón de Parar Audio cuando esté sonando */}
          {isSpeaking && (
            <button
              type="button"
              onClick={stopSpeaking}
              title="Detener audio en reproducción"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-rose-500/40 bg-rose-500/20 text-rose-300 text-xs animate-pulse transition-colors"
            >
              <VolumeX className="w-3 h-3" />
              <span>Silenciar</span>
            </button>
          )}

          {isLoadingAudio && (
            <span className="text-[11px] text-indigo-400 flex items-center gap-1 animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="hidden sm:inline">Generando voz Gemini...</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleResetInterview}
            title="Reiniciar conversación y comenzar nueva entrevista"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Reiniciar</span>
          </button>

          <input
            type="text"
            value={jobContext}
            onChange={(e) => setJobContext(e.target.value)}
            placeholder="Contexto o puesto a evaluar..."
            className="text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 max-w-xs"
          />
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 font-sans">
        {messages.map((m) => {
          const isInterviewer = m.sender === "interviewer";
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isInterviewer ? "items-start" : "items-end"}`}
            >
              <div
                className={`flex gap-3 max-w-2xl ${
                  isInterviewer ? "flex-row" : "flex-row-reverse"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isInterviewer
                      ? "bg-indigo-900/80 text-indigo-300 border border-indigo-700 shadow-md"
                      : "bg-blue-600 text-white shadow-md"
                  }`}
                >
                  {isInterviewer ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isInterviewer
                      ? "bg-slate-950 border border-slate-800 text-slate-200"
                      : "bg-blue-600 text-white shadow-md"
                  }`}
                >
                  {m.content}

                  {/* Play audio button on interviewer message */}
                  {isInterviewer && (
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        {voiceMode === "gemini_tts" && (
                          <>
                            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                            <span>Voz Gemini ({geminiVoice})</span>
                          </>
                        )}
                        {voiceMode === "browser_tts" && <span>🔊 Voz Local (0 tokens)</span>}
                        {voiceMode === "chat_only" && <span>💬 Modo Texto</span>}
                      </span>
                      <button
                        onClick={() => speakText(m.content, true)}
                        disabled={isLoadingAudio}
                        className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors disabled:opacity-50"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Escuchar</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Feedback del turno (Bajo Demanda con Botón o Automático) */}
              {m.feedback && (
                <div className="mt-2.5 mr-11 max-w-xl flex flex-col items-end">
                  <button
                    type="button"
                    onClick={() => toggleFeedback(m.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-sm ${
                      (expandedFeedbackIds[m.id] ?? (feedbackViewMode === "instant"))
                        ? "border-indigo-600 bg-indigo-900/60 text-indigo-100"
                        : "border-indigo-800/40 bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-300"
                    }`}
                    title="Clic para ver o esconder la evaluación detallada de esta respuesta"
                  >
                    <Award className="w-3.5 h-3.5 text-indigo-400" />
                    <span>
                      {(expandedFeedbackIds[m.id] ?? (feedbackViewMode === "instant"))
                        ? "Ocultar Evaluación"
                        : "Ver Evaluación & Feedback"}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-indigo-900/90 text-[10px] font-bold text-indigo-200">
                      {m.feedback.score} / 10
                    </span>
                  </button>

                  {(expandedFeedbackIds[m.id] ?? (feedbackViewMode === "instant")) && (
                    <div className="mt-2.5 w-full p-4 rounded-2xl border border-indigo-900/50 bg-indigo-950/30 space-y-2.5 text-xs text-slate-200 shadow-lg animate-in fade-in duration-200">
                      <div className="flex items-center justify-between border-b border-indigo-900/40 pb-2">
                        <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5" />
                          Feedback del Entrevistador
                        </span>
                        <span className="px-2 py-0.5 rounded bg-indigo-900/60 font-bold text-indigo-300 text-[11px]">
                          Puntaje: {m.feedback.score} / 10
                        </span>
                      </div>

                      {m.feedback.positives?.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Puntos Fuertes:
                          </div>
                          <ul className="list-disc list-inside text-slate-300 pl-1 space-y-0.5">
                            {m.feedback.positives.map((p, i) => (
                              <li key={i}>{p}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {m.feedback.improvements?.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-amber-400 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Áreas de Mejora:
                          </div>
                          <ul className="list-disc list-inside text-slate-300 pl-1 space-y-0.5">
                            {m.feedback.improvements.map((imp, i) => (
                              <li key={i}>{imp}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {m.feedback.suggestedBetterAnswer && (
                        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-indigo-900/30 text-[11px] text-slate-300">
                          <span className="font-semibold text-indigo-300">Respuesta recomendada: </span>
                          {m.feedback.suggestedBetterAnswer}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/40 p-3 rounded-2xl border border-slate-800 w-fit">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            <span>El entrevistador está evaluando tus argumentos y formulando la siguiente pregunta...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Push-to-Talk Status Banner */}
      {isListening && (
        <div className="bg-red-500/20 border-t border-red-500/40 px-4 py-2 flex items-center justify-between text-xs text-red-300 animate-pulse">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-red-400 animate-bounce" />
            <span><strong>Grabando micrófono:</strong> Habla de forma natural, suelta el botón para finalizar.</span>
          </div>
          <span className="text-[10px] font-mono uppercase bg-red-950/80 px-2 py-0.5 rounded border border-red-800">
            Escuchando...
          </span>
        </div>
      )}

      {/* Input Form & Push-to-Talk Controls */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
      >
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Escribe tu respuesta técnica o mantén presionado el botón del micrófono para hablar..."
          rows={2}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
        />

        <div className="flex items-center gap-2 shrink-0 justify-end">
          {/* Push-to-Talk Button (MANTENER PRESIONADO PARA HABLAR) */}
          <button
            type="button"
            onMouseDown={handleStartPushToTalk}
            onMouseUp={handleStopPushToTalk}
            onTouchStart={handleStartPushToTalk}
            onTouchEnd={handleStopPushToTalk}
            disabled={!speechRecognitionSupported}
            title={
              speechRecognitionSupported
                ? "Mantén presionado para hablar (Push-to-Talk)"
                : "Reconocimiento de voz no soportado en este navegador"
            }
            className={`px-3.5 py-3 rounded-2xl font-semibold text-xs flex items-center gap-2 select-none transition-all shadow-md active:scale-95 disabled:opacity-40 ${
              isListening
                ? "bg-red-600 text-white ring-4 ring-red-500/30 animate-pulse"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            }`}
          >
            {isListening ? (
              <>
                <Mic className="w-4 h-4 text-white animate-bounce" />
                <span className="font-bold">¡Soltar para enviar!</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-blue-400" />
                <span className="hidden sm:inline">Mantener para Hablar</span>
              </>
            )}
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputValue.trim() || isSending}
            className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 transition-colors shadow-md shadow-blue-600/20"
          >
            <Send className="w-4 h-4" />
            <span>Enviar</span>
          </button>
        </div>
      </form>
    </div>
  );
}
