"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import {
  AvailableGeminiModel,
  DEFAULT_FALLBACK_MODELS,
} from "@/lib/ai/gemini";

export type GeminiModelOption = AvailableGeminiModel;

interface ApiKeyContextType {
  apiKey: string;
  model: string;
  fallbackModel: string;
  availableModels: GeminiModelOption[];
  isLoadingModels: boolean;
  hasKey: boolean;
  isValidated: boolean;
  isTesting: boolean;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  saveApiKey: (key: string, modelName?: string, fallbackModelName?: string) => Promise<{ success: boolean; error?: string }>;
  clearApiKey: () => void;
  testKey: (key: string, modelName?: string) => Promise<{ success: boolean; error?: string }>;
  refreshModels: (keyToUse?: string) => Promise<GeminiModelOption[]>;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const STORAGE_KEY = "ai_job_advisor_gemini_api_key";
export const MODEL_STORAGE_KEY = "ai_job_advisor_gemini_model";
export const FALLBACK_MODEL_STORAGE_KEY = "ai_job_advisor_gemini_fallback_model";
export const MODELS_CACHE_KEY = "ai_job_advisor_gemini_models_cache";

export const DEFAULT_MODEL = "gemini-2.5-flash";
export const DEFAULT_FALLBACK_MODEL = "gemini-2.0-flash";
export const AVAILABLE_MODELS = DEFAULT_FALLBACK_MODELS;

// Interceptor global para que cualquier llamada de Axios incluya automáticamente la clave y modelos
if (typeof window !== "undefined") {
  axios.interceptors.request.use((config) => {
    const key = localStorage.getItem(STORAGE_KEY);
    const prefModel = localStorage.getItem(MODEL_STORAGE_KEY) || DEFAULT_MODEL;
    const fbModel = localStorage.getItem(FALLBACK_MODEL_STORAGE_KEY) || DEFAULT_FALLBACK_MODEL;

    if (key && !config.headers["x-gemini-api-key"]) {
      config.headers["x-gemini-api-key"] = key;
    }
    if (prefModel && !config.headers["x-gemini-preferred-model"]) {
      config.headers["x-gemini-preferred-model"] = prefModel;
    }
    if (fbModel && !config.headers["x-gemini-fallback-model"]) {
      config.headers["x-gemini-fallback-model"] = fbModel;
    }
    return config;
  });
}

export function ApiKeyProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKey] = useState<string>("");
  const [model, setModel] = useState<string>(DEFAULT_MODEL);
  const [fallbackModel, setFallbackModel] = useState<string>(DEFAULT_FALLBACK_MODEL);
  const [availableModels, setAvailableModels] = useState<GeminiModelOption[]>(DEFAULT_FALLBACK_MODELS);
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(false);
  const [isValidated, setIsValidated] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const refreshModels = async (keyToUse?: string): Promise<GeminiModelOption[]> => {
    const activeKey = (keyToUse || apiKey || "").trim();
    if (!activeKey) {
      return DEFAULT_FALLBACK_MODELS;
    }

    setIsLoadingModels(true);
    try {
      const { data } = await axios.get("/api/advisor/models?refresh=true", {
        headers: { "x-gemini-api-key": activeKey },
      });

      if (data.success && Array.isArray(data.models) && data.models.length > 0) {
        setAvailableModels(data.models);
        if (typeof window !== "undefined") {
          localStorage.setItem(MODELS_CACHE_KEY, JSON.stringify(data.models));
        }

        if (!data.models.some((m: GeminiModelOption) => m.id === model)) {
          const fallback = data.models[0].id;
          setModel(fallback);
          if (typeof window !== "undefined") {
            localStorage.setItem(MODEL_STORAGE_KEY, fallback);
          }
        }
        return data.models;
      }
    } catch (err) {
      console.warn("Error al refrescar modelos desde Gemini API:", err);
    } finally {
      setIsLoadingModels(false);
    }
    return availableModels;
  };

  useEffect(() => {
    const loadStoredKey = () => {
      try {
        if (typeof window === "undefined") return;

        const storedKey = localStorage.getItem(STORAGE_KEY) || "";
        const storedModel = localStorage.getItem(MODEL_STORAGE_KEY) || DEFAULT_MODEL;
        const storedFallback = localStorage.getItem(FALLBACK_MODEL_STORAGE_KEY) || DEFAULT_FALLBACK_MODEL;
        const cachedModelsStr = localStorage.getItem(MODELS_CACHE_KEY);

        if (cachedModelsStr) {
          try {
            const parsed = JSON.parse(cachedModelsStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setAvailableModels(parsed);
            }
          } catch {}
        }

        if (storedKey) {
          setApiKey(storedKey);
          setIsValidated(true);
          axios.defaults.headers.common["x-gemini-api-key"] = storedKey;
          refreshModels(storedKey).catch(() => {});
        }
        setModel(storedModel);
        setFallbackModel(storedFallback);
      } catch (e) {
        console.error("Error al cargar API Key guardada:", e);
      }
    };

    loadStoredKey();
  }, []);

  const testKey = async (
    keyToTest: string,
    testModel: string = model
  ): Promise<{ success: boolean; error?: string }> => {
    const trimmed = keyToTest.trim();
    if (!trimmed) {
      return { success: false, error: "La API Key no puede estar vacía." };
    }

    setIsTesting(true);
    try {
      const { data } = await axios.get(
        `/api/advisor/models?refresh=true&apiKey=${encodeURIComponent(trimmed)}`,
        { headers: { "x-gemini-api-key": trimmed } }
      );

      if (data.success && Array.isArray(data.models) && data.models.length > 0) {
        setAvailableModels(data.models);
        if (typeof window !== "undefined") {
          localStorage.setItem(MODELS_CACHE_KEY, JSON.stringify(data.models));
        }
        return { success: true };
      }

      return {
        success: false,
        error: data.error || "No se pudo validar la clave con Google Gemini.",
      };
    } catch (err: unknown) {
      console.error("Error al validar Gemini API Key:", err);
      let errorMsg = "Error al conectar con Gemini. Verifica tu clave.";
      if (axios.isAxiosError(err)) {
        const serverError = err.response?.data?.error;
        if (serverError) {
          errorMsg = serverError;
        } else if (err.response?.status === 400 || err.response?.status === 403) {
          errorMsg = "API Key inválida o sin permisos. Verifica que sea correcta en Google AI Studio.";
        } else if (err.response?.status === 429) {
          errorMsg = "Límite de cuota alcanzado en esta API Key.";
        }
      }
      return { success: false, error: errorMsg };
    } finally {
      setIsTesting(false);
    }
  };

  const saveApiKey = async (
    newKey: string,
    newModel: string = model,
    newFallbackModel: string = fallbackModel
  ): Promise<{ success: boolean; error?: string }> => {
    const trimmed = newKey.trim();
    const testResult = await testKey(trimmed, newModel);
    if (!testResult.success) {
      return testResult;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, trimmed);
      localStorage.setItem(MODEL_STORAGE_KEY, newModel);
      localStorage.setItem(FALLBACK_MODEL_STORAGE_KEY, newFallbackModel);
    }

    axios.defaults.headers.common["x-gemini-api-key"] = trimmed;
    axios.defaults.headers.common["x-gemini-preferred-model"] = newModel;
    axios.defaults.headers.common["x-gemini-fallback-model"] = newFallbackModel;

    setApiKey(trimmed);
    setModel(newModel);
    setFallbackModel(newFallbackModel);
    setIsValidated(true);
    return { success: true };
  };

  const clearApiKey = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(MODEL_STORAGE_KEY);
      localStorage.removeItem(FALLBACK_MODEL_STORAGE_KEY);
      localStorage.removeItem(MODELS_CACHE_KEY);
    }
    delete axios.defaults.headers.common["x-gemini-api-key"];
    delete axios.defaults.headers.common["x-gemini-preferred-model"];
    delete axios.defaults.headers.common["x-gemini-fallback-model"];
    setApiKey("");
    setAvailableModels(DEFAULT_FALLBACK_MODELS);
    setIsValidated(false);
  };

  return (
    <ApiKeyContext.Provider
      value={{
        apiKey,
        model,
        fallbackModel,
        availableModels,
        isLoadingModels,
        hasKey: Boolean(apiKey && apiKey.length > 5),
        isValidated,
        isTesting,
        isModalOpen,
        setIsModalOpen,
        saveApiKey,
        clearApiKey,
        testKey,
        refreshModels,
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKey() {
  const context = useContext(ApiKeyContext);
  if (!context) {
    throw new Error("useApiKey debe usarse dentro de un ApiKeyProvider");
  }
  return context;
}
