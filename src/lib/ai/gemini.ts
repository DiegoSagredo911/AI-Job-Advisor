import { GoogleGenAI } from "@google/genai";
import { CandidateProfile } from "@/types/profile";
import {
  JobAnalysisResult,
  TailoredResume,
  OutreachPitch,
  InterviewMessage,
} from "@/types/advisor";
import {
  buildJobAnalysisPrompt,
  buildTailorResumePrompt,
  buildOutreachPrompt,
  buildInterviewFeedbackPrompt,
  buildProfileIngestionPrompt,
} from "./prompts";

function getApiKey(): string | null {
  return process.env.GEMINI_API_KEY || null;
}

function cleanJsonResponse(rawText: string): string {
  let cleaned = rawText.trim();
  // Strip Markdown code fences if present (```json ... ``` or ``` ...)
  if (cleaned.startsWith("```")) {
    const firstLineEnd = cleaned.indexOf("\n");
    if (firstLineEnd !== -1) {
      cleaned = cleaned.substring(firstLineEnd + 1);
    }
    if (cleaned.endsWith("```")) {
      cleaned = cleaned.substring(0, cleaned.length - 3);
    }
  }
  return cleaned.trim();
}

// Cascada de modelos Flash priorizada según requerimiento: 3.8 -> 3.7 -> 3.6 -> 3.5 -> 2.5 -> 2.0 -> 1.5
export const FLASH_FALLBACK_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];

export interface GeminiCallOutput {
  text: string;
  modelUsed: string;
}

async function callGeminiWithCascade(
  prompt: string,
  preferredModel?: string
): Promise<GeminiCallOutput> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY no encontrada. Por favor configura GEMINI_API_KEY en tu archivo .env.local"
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  // Armamos la lista ordenada de modelos iniciando con el preferido o 3.8 Flash
  const modelsToTry: string[] = [];
  if (preferredModel && !modelsToTry.includes(preferredModel)) {
    modelsToTry.push(preferredModel);
  }
  for (const m of FLASH_FALLBACK_MODELS) {
    if (!modelsToTry.includes(m)) {
      modelsToTry.push(m);
    }
  }

  let lastError: Error | null = null;

  for (let i = 0; i < modelsToTry.length; i++) {
    const currentModel = modelsToTry[i];
    const nextModel = modelsToTry[i + 1];

    try {
      console.log(`[Gemini AI] Ejecutando consulta con modelo: ${currentModel}...`);
      const response = await ai.models.generateContent({
        model: currentModel,
        contents: prompt,
        config: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      });

      const text = cleanJsonResponse(response.text || "");
      console.log(`[Gemini AI] Respuesta exitosa recibida del modelo: ${currentModel}`);
      return { text, modelUsed: currentModel };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      lastError = err instanceof Error ? err : new Error(errMsg);

      const isRateLimitOrQuota =
        errMsg.includes("429") ||
        errMsg.toLowerCase().includes("resource_exhausted") ||
        errMsg.toLowerCase().includes("quota") ||
        errMsg.toLowerCase().includes("rate limit") ||
        errMsg.toLowerCase().includes("too many requests") ||
        errMsg.toLowerCase().includes("overloaded") ||
        errMsg.includes("503");

      const isModelUnavailable =
        errMsg.includes("404") ||
        errMsg.toLowerCase().includes("not found") ||
        errMsg.toLowerCase().includes("not supported") ||
        errMsg.toLowerCase().includes("unsupported");

      if (isRateLimitOrQuota || isModelUnavailable) {
        if (nextModel) {
          const reason = isRateLimitOrQuota ? "LÍMITE DE CUOTA / RATE LIMIT (429)" : "MODELO NO DISPONIBLE";
          console.warn(
            `⚠️ [Gemini Auto-Fallback] ${reason} detectado en '${currentModel}'. Saltando automáticamente a '${nextModel}'... (Detalle: ${errMsg.slice(0, 100)})`
          );
          continue; // Intenta con el siguiente modelo de la cascada
        }
      }

      // Si hay un siguiente modelo disponible, reintenta con él
      if (nextModel) {
        console.warn(
          `⚠️ [Gemini Auto-Fallback] Error con '${currentModel}'. Intentando siguiente versión en cascada '${nextModel}'... (Detalle: ${errMsg.slice(0, 100)})`
        );
        continue;
      }
    }
  }

  throw (
    lastError ||
    new Error("Todos los modelos Flash (3.8, 3.7, 3.6, 3.5...) alcanzaron límite o no respondieron.")
  );
}

export async function analyzeJobOffer(
  profile: CandidateProfile,
  rawJobDescription: string
): Promise<JobAnalysisResult> {
  const prompt = buildJobAnalysisPrompt(profile, rawJobDescription);

  try {
    const { text, modelUsed } = await callGeminiWithCascade(prompt, "gemini-3.8-flash");
    const parsed = JSON.parse(text) as JobAnalysisResult;
    parsed.modelUsed = modelUsed;
    return parsed;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn("Gemini call fallback/error:", errorMsg);
    return generateFallbackJobAnalysis(profile, rawJobDescription, errorMsg);
  }
}

export async function generateTailoredResume(
  profile: CandidateProfile,
  rawJobDescription: string
): Promise<TailoredResume> {
  const prompt = buildTailorResumePrompt(profile, rawJobDescription);

  try {
    const { text, modelUsed } = await callGeminiWithCascade(prompt, "gemini-3.8-flash");
    const parsed = JSON.parse(text) as TailoredResume;
    return parsed;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn("Gemini resume call fallback/error:", errorMsg);
    return generateFallbackTailoredResume(profile, rawJobDescription);
  }
}

export async function generateOutreach(
  profile: CandidateProfile,
  rawJobDescription: string
): Promise<OutreachPitch> {
  const prompt = buildOutreachPrompt(profile, rawJobDescription);

  try {
    const { text, modelUsed } = await callGeminiWithCascade(prompt, "gemini-3.8-flash");
    const parsed = JSON.parse(text) as OutreachPitch;
    return parsed;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn("Gemini outreach call fallback/error:", errorMsg);
    return generateFallbackOutreach(profile, rawJobDescription);
  }
}

export async function evaluateInterviewStep(
  profile: CandidateProfile,
  jobContext: string,
  chatHistory: { role: string; content: string }[],
  candidateAnswer: string
): Promise<{
  interviewerReply: string;
  feedback: NonNullable<InterviewMessage["feedback"]>;
}> {
  const prompt = buildInterviewFeedbackPrompt(profile, jobContext, chatHistory, candidateAnswer);

  try {
    const { text } = await callGeminiWithCascade(prompt, "gemini-3.8-flash");
    const parsed = JSON.parse(text);
    return parsed;
  } catch (err: unknown) {
    console.warn("Interview feedback fallback:", err);
    return {
      interviewerReply:
        "Excelente punto sobre cómo abordas este desafío profesional. Cuéntame ahora: ¿cómo aseguras la continuidad operativa y la calidad del trabajo si surgen imprevistos o contingencias críticas en terreno o durante la ejecución?",
      feedback: {
        score: 8,
        positives: [
          "Mencionaste detalles prácticos de tu experiencia real.",
          "Buena estructura y claridad de respuesta.",
        ],
        improvements: [
          "Podrías reforzar con métricas cuantitativas o resultados concretos del proyecto o trabajo mencionado.",
        ],
        suggestedBetterAnswer:
          "En mi experiencia previa, ante situaciones imprevistas implementamos un protocolo de contingencia que redujo las desviaciones y garantizó el cumplimiento de los plazos y estándares de calidad.",
      },
    };
  }
}

export async function ingestProfileFromRawData(
  rawText: string,
  urls: string[]
): Promise<CandidateProfile> {
  const prompt = buildProfileIngestionPrompt(rawText, urls);

  try {
    const { text } = await callGeminiWithCascade(prompt, "gemini-3.8-flash");
    const parsed = JSON.parse(text) as CandidateProfile;
    parsed.updatedAt = new Date().toISOString();
    return parsed;
  } catch (err: unknown) {
    console.warn("Profile ingestion error:", err);
    throw new Error(
      `No se pudo consolidar el perfil con Gemini: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

// ----------------- Fallback Generators for immediate offline testing -----------------

function generateFallbackJobAnalysis(
  profile: CandidateProfile,
  rawJob: string,
  systemNotice?: string
): JobAnalysisResult {
  const lowerJob = rawJob.toLowerCase();
  const headlineLower = (profile.headline || "").toLowerCase();

  let match = 85;
  const strengths: string[] = [];
  const missing: string[] = [];

  // Multidisciplinary detection
  const isArchaeology = headlineLower.includes("arque") || headlineLower.includes("antrop") || headlineLower.includes("patrimon") || lowerJob.includes("arque") || lowerJob.includes("antrop") || lowerJob.includes("patrimon") || lowerJob.includes("excavac") || lowerJob.includes("seia") || lowerJob.includes("monitoreo") || lowerJob.includes("gis") || lowerJob.includes("sig");
  const isIndustrial = headlineLower.includes("industrial") || lowerJob.includes("industrial") || lowerJob.includes("procesos") || lowerJob.includes("lean");
  const isMechanical = headlineLower.includes("mecánic") || headlineLower.includes("mecanic") || lowerJob.includes("solidworks") || lowerJob.includes("termodinám") || lowerJob.includes("fluidos");
  const isElectrical = headlineLower.includes("eléctric") || headlineLower.includes("electric") || lowerJob.includes("potencia") || lowerJob.includes("scada") || lowerJob.includes("subestac");
  const isCivil = headlineLower.includes("civil") || lowerJob.includes("estructur") || lowerJob.includes("obras") || lowerJob.includes("autocad");

  if (isArchaeology) {
    strengths.push("Dominio técnico en prospección arqueológica, excavación estratigráfica (Matriz de Harris) y registro riguroso en terreno.");
    if (lowerJob.includes("seia") || lowerJob.includes("monumento") || lowerJob.includes("normativa") || lowerJob.includes("patrimon")) {
      strengths.push("Conocimiento acabado de normativa patrimonial y ambiental (SEIA, Ley de Monumentos Nacionales, estándares de conservación).");
    }
    if (lowerJob.includes("gis") || lowerJob.includes("sig") || lowerJob.includes("qgis") || lowerJob.includes("arcgis")) {
      strengths.push("Levantamiento y georreferenciación de sitios y hallazgos con software SIG (QGIS / ArcGIS).");
    }
    if (lowerJob.includes("informe") || lowerJob.includes("caracterizac") || lowerJob.includes("monitoreo")) {
      strengths.push("Experiencia en redacción de informes técnicos de caracterización arqueológica y supervisión de obras en terreno.");
    }
  } else if (isIndustrial) {
    strengths.push("Sólida competencia en optimización de procesos productivos, metodologías Lean Manufacturing y gestión de operaciones.");
    if (lowerJob.includes("kpi") || lowerJob.includes("indicador")) {
      strengths.push("Experiencia en control de gestión mediante diseño y seguimiento de KPIs operacionales.");
    }
    if (lowerJob.includes("calidad") || lowerJob.includes("iso")) {
      strengths.push("Manejo de sistemas de gestión de calidad y normativas ISO 9001 / ISO 14001.");
    }
  } else if (isMechanical) {
    strengths.push("Conocimiento técnico en diseño mecánico, selección de materiales, termofluidos y mantenimiento de maquinaria.");
    if (lowerJob.includes("solidworks") || lowerJob.includes("inventor") || lowerJob.includes("cad")) {
      strengths.push("Modelado 3D y análisis de elementos finitos asistido por CAD/CAE.");
    }
    if (lowerJob.includes("mantenimiento") || lowerJob.includes("confiabilidad")) {
      strengths.push("Planificación de mantenimiento predictivo y análisis de fallas mecánicas.");
    }
  } else if (isElectrical) {
    strengths.push("Sólidos conocimientos en sistemas eléctricos de potencia, diseño de circuitos y normativas SEC.");
    if (lowerJob.includes("scada") || lowerJob.includes("plc") || lowerJob.includes("automatizac")) {
      strengths.push("Experiencia en automatización industrial, instrumentación y sistemas SCADA/PLC.");
    }
    if (lowerJob.includes("mantenimiento")) {
      strengths.push("Gestión de planes de mantenimiento preventivo y correctivo en subestaciones y tableros.");
    }
  } else if (isCivil) {
    strengths.push("Capacidad en cálculo estructural, supervisión de obras civiles y presupuestos.");
    if (lowerJob.includes("bim") || lowerJob.includes("revit") || lowerJob.includes("autocad")) {
      strengths.push("Modelado y diseño asistido por software técnico (AutoCAD / Revit / BIM).");
    }
  } else {
    // Software / Tech or Generic Field
    if (lowerJob.includes("react") || lowerJob.includes("next")) {
      strengths.push("Dominio de React.js y Next.js con arquitectura App Router y renderizado SSR/CSR.");
    }
    if (lowerJob.includes("node") || lowerJob.includes("express")) {
      strengths.push("Sólida experiencia en Node.js, Express y diseño de APIs REST escalables.");
    }
    if (lowerJob.includes(".net") || lowerJob.includes("c#")) {
      strengths.push("Conocimiento y base en .NET Framework y lenguaje C#.");
    }
    if (lowerJob.includes("sql") || lowerJob.includes("postgres")) {
      strengths.push("Experiencia avanzada en PostgreSQL, modelado relacional y análisis de datos.");
    }
    if (lowerJob.includes("socket") || lowerJob.includes("real time") || lowerJob.includes("tiempo real")) {
      strengths.push("Diferencial técnico en plataformas de tiempo real y arquitecturas asíncronas.");
    }
  }

  if (strengths.length === 0) {
    strengths.push(`Trayectoria demostrada en el área de ${profile.headline || "su especialidad"}.`);
    strengths.push("Criterio analítico y capacidad resolutiva orientada a resultados medibles.");
  }

  const userTech = [
    ...(profile.skills.frameworks || []),
    ...(profile.skills.languages || []),
    ...(profile.skills.cloudDevOps || []),
    ...(profile.skills.technicalCompetencies || []),
    ...(profile.skills.softwareTools || []),
    ...(profile.skills.standardsRegulations || []),
  ];

  if (isArchaeology && lowerJob.includes("fotogrametr") && !userTech.some(t => t.toLowerCase().includes("fotogram") || t.toLowerCase().includes("metashape"))) {
    missing.push("Fotogrametría digital 3D (Agisoft Metashape / CloudCompare para modelado de sitios y artefactos).");
  } else if (isIndustrial && lowerJob.includes("six sigma") && !userTech.some(t => t.toLowerCase().includes("sigma"))) {
    missing.push("Certificación Six Sigma Black/Green Belt (puedes respaldar con experiencia práctica en Kaizen y 5S).");
  } else if (isMechanical && lowerJob.includes("ansys") && !userTech.some(t => t.toLowerCase().includes("ansys"))) {
    missing.push("Simulación CAE en ANSYS / FEA (mitigable con tu experiencia en modelado y análisis estructural).");
  } else if (isElectrical && lowerJob.includes("etap") && !userTech.some(t => t.toLowerCase().includes("etap"))) {
    missing.push("Software ETAP / DigSILENT para flujo de potencia (puedes destacar tu rapidez de adaptación técnica).");
  } else if (lowerJob.includes("graphql") && !(profile.skills.frameworks || []).includes("GraphQL")) {
    missing.push("GraphQL (puedes mitigar destacando tu sólida base en APIs REST y capacidad de aprendizaje rápido).");
  } else if (lowerJob.includes("kubernetes") && !(profile.skills.cloudDevOps || []).includes("Kubernetes")) {
    missing.push("Kubernetes / Orquestación avanzada (puedes respaldar con tu experiencia en infraestructura cloud).");
  }

  if (missing.length === 0) {
    missing.push("Requisitos específicos de procedimientos internos de la organización que se abordarán en la primera entrevista.");
  }

  const sampleAtsKeywords = isArchaeology
    ? {
        criticalMatches: ["Prospección Arqueológica", "Excavación Estratigráfica", "Evaluación Ambiental SEIA", "Ley de Monumentos", "Sistemas de Información Geográfica (SIG)"],
        missingKeywords: missing.map((m) => m.split(" ")[0]),
        suggestedAdditions: ["QGIS", "Registro de Campo", "Monitoreo Arqueológico", "Fotogrametría", "Matriz de Harris"],
      }
    : isIndustrial
    ? {
        criticalMatches: ["Lean Manufacturing", "Gestión de Procesos", "KPIs", "ISO 9001", "Mejora Continua"],
        missingKeywords: missing.map((m) => m.split(" ")[0]),
        suggestedAdditions: ["Kaizen", "5S", "Capacidad de Planta", "OEE", "SAP PP/MM"],
      }
    : isMechanical
    ? {
        criticalMatches: ["Diseño Mecánico", "SolidWorks", "Mantenimiento Industrial", "Termofluidos", "CAD/CAE"],
        missingKeywords: missing.map((m) => m.split(" ")[0]),
        suggestedAdditions: ["Elementos Finitos", "Mantenimiento Predictivo", "Bombas y Tuberías", "Resistencia de Materiales"],
      }
    : isElectrical
    ? {
        criticalMatches: ["Sistemas Eléctricos", "Normativa SEC", "Media Tensión", "SCADA", "Protecciones"],
        missingKeywords: missing.map((m) => m.split(" ")[0]),
        suggestedAdditions: ["Subestaciones", "AutoCAD Electrical", "PLC", "Mantenimiento Preventivo"],
      }
    : {
        criticalMatches: ["Arquitectura de Software", "APIs", "Bases de Datos", "Metodologías Ágiles", "TypeScript"],
        missingKeywords: missing.map((m) => m.split(" ")[0]),
        suggestedAdditions: ["CI/CD", "Clean Architecture", "Unit Testing", "Microservicios"],
      };

  const isEnglish = lowerJob.includes("we are looking") || lowerJob.includes("requirements") || lowerJob.includes("responsibilities") || lowerJob.includes("experience") || lowerJob.includes("skills");
  const detectedLanguage: "es" | "en" = isEnglish ? "en" : "es";

  const reverseQuestions = isEnglish
    ? [
        {
          category: "technical" as const,
          question: "How does the team currently measure technical debt versus new feature delivery, and what are the main architectural challenges for the next 12 months?",
          whyAskThis: "Reveals engineering maturity, code/process quality standards, and real sprint priorities.",
        },
        {
          category: "culture" as const,
          question: "How are critical operational trade-offs and failures handled when unexpected bottlenecks or deadlines arise?",
          whyAskThis: "Uncovers psychological safety, leadership support, and team dynamics under pressure.",
        },
        {
          category: "strategy" as const,
          question: "What would success look like for this position during the first 90 days, and how does this role directly impact the company's core metrics this year?",
          whyAskThis: "Demonstrates immediate business orientation and clarifies true expectations before starting.",
        },
      ]
    : [
        {
          category: "technical" as const,
          question: "¿Cuáles son los mayores desafíos técnicos o cuellos de botella metodológicos que el equipo proyecta resolver en los próximos 6 a 12 meses?",
          whyAskThis: "Demuestra visión técnica y te permite saber si trabajarás resolviendo problemas innovadores o apagando incendios recurrentes.",
        },
        {
          category: "culture" as const,
          question: "¿Cómo gestiona el equipo la toma de decisiones críticas ante contingencias imprevistas o desviaciones en terreno/producción?",
          whyAskThis: "Revela la verdadera autonomía del rol, la cultura de apoyo del liderazgo y el nivel de confianza en el equipo.",
        },
        {
          category: "strategy" as const,
          question: "¿Cómo se define el éxito concreto para esta posición en los primeros 90 días y qué impacto directo se espera en los objetivos del área?",
          whyAskThis: "Proyecta proactividad orientada a resultados y clarifica las expectativas exactas antes de incorporarte.",
        },
      ];

  return {
    jobTitle: profile.headline || "Profesional Especialista",
    companyName: "Organización Evaluada",
    detectedLanguage,
    matchScore: match,
    seniorityLevel: "Semi-Senior / Senior",
    fitSummary: `Excelente perfil profesional con sólida experiencia y competencias demostrables para ${profile.headline || "este rol"}. Gran capacidad de ejecución técnica, rigor metodológico y orientación a resultados verificables.`,
    keyStrengths: strengths,
    missingGaps: missing,
    recommendedProjects: (profile.projects && profile.projects.length > 0)
      ? profile.projects.slice(0, 2).map((p) => ({
          projectName: p.name,
          whyRelevant: p.description,
          talkingPoint: (p.architectureHighlights && p.architectureHighlights[0]) || "Enfocar los resultados cuantificables alcanzados.",
        }))
      : [
          {
            projectName: "Experiencia Profesional Aplicada",
            whyRelevant: "Demuestra capacidad de entrega, resolución de problemas y valor operacional.",
            talkingPoint: "Destacar cómo optimizaste indicadores de desempeño y redujiste tiempos de respuesta.",
          },
        ],
    reverseInterviewQuestions: reverseQuestions,
    atsKeywords: sampleAtsKeywords,
    tailoredStrategy: {
      approachAdvice:
        `Enfócate en tu rol de resolución integral de problemas y entrega de resultados tangibles en ${profile.headline || "tu especialidad"}. Respalda cada logro con métricas e impacto verificable.` +
        (systemNotice ? ` (Nota: ${systemNotice})` : ""),
      interviewWarningAreas: [
        "¿Cómo manejas contingencias imprevistas o desviaciones operacionales en momentos críticos?",
        "¿Cuál es tu método sistemático para garantizar cumplimiento de estándares y normativas?",
      ],
      salaryRangeAdvice: `Rango competitivo para ${profile.headline || "profesionales del área"} acorde a la modalidad y mercado local/remoto.`,
    },
  };
}

function generateFallbackTailoredResume(
  profile: CandidateProfile,
  rawJob: string
): TailoredResume {
  const allSkills = [
    ...(profile.skills.technicalCompetencies || []),
    ...(profile.skills.frameworks || []),
    ...(profile.skills.softwareTools || []),
    ...(profile.skills.languages || []),
    ...(profile.skills.standardsRegulations || []),
    ...(profile.skills.databases || []),
    ...(profile.skills.managementOperations || []),
    ...(profile.skills.cloudDevOps || []),
    ...(profile.skills.hardwareRealtime || []),
  ];

  const highlighted = allSkills.length > 0 ? allSkills.slice(0, 8) : ["Ingeniería Aplicada", "Gestión de Procesos", "Resolución de Problemas", "Mejora Continua"];

  const skillsBlock = [
    (profile.skills.technicalCompetencies?.length ?? 0) > 0 ? `- **Competencias Técnicas:** ${profile.skills.technicalCompetencies!.join(", ")}` : null,
    (profile.skills.standardsRegulations?.length ?? 0) > 0 ? `- **Normativas y Estándares:** ${profile.skills.standardsRegulations!.join(", ")}` : null,
    (profile.skills.softwareTools?.length ?? 0) > 0 ? `- **Software y Herramientas:** ${profile.skills.softwareTools!.join(", ")}` : null,
    (profile.skills.managementOperations?.length ?? 0) > 0 ? `- **Gestión y Operaciones:** ${profile.skills.managementOperations!.join(", ")}` : null,
    (profile.skills.frameworks?.length ?? 0) > 0 ? `- **Frameworks / Tecnologías:** ${profile.skills.frameworks!.join(", ")}` : null,
    (profile.skills.languages?.length ?? 0) > 0 ? `- **Lenguajes:** ${profile.skills.languages!.join(", ")}` : null,
    (profile.skills.databases?.length ?? 0) > 0 ? `- **Bases de Datos:** ${profile.skills.databases!.join(", ")}` : null,
    (profile.skills.cloudDevOps?.length ?? 0) > 0 ? `- **Infraestructura / DevOps:** ${profile.skills.cloudDevOps!.join(", ")}` : null,
    (profile.skills.hardwareRealtime?.length ?? 0) > 0 ? `- **Hardware / Especialidad:** ${profile.skills.hardwareRealtime!.join(", ")}` : null,
  ].filter(Boolean).join("\n");

  return {
    targetedRole: profile.headline,
    professionalSummary: `${profile.fullName} — ${profile.headline}. Profesional con sólida trayectoria técnica y analítica, capacitado para liderar optimizaciones, implementar estándares de calidad y resolver desafíos de alta complejidad con enfoque en resultados medibles y mejora continua.`,
    highlightedSkills: highlighted,
    customExperience: (profile.experience || []).map((exp) => ({
      company: exp.company,
      role: exp.role,
      period: exp.period,
      bulletPoints: exp.highlights || [],
    })),
    relevantProjects: (profile.projects || []).map((p) => ({
      name: p.name,
      bulletPoints: p.architectureHighlights || [p.description],
    })),
    markdownResume: `# ${profile.fullName}
**${profile.headline}**
${profile.email || ""} | ${profile.phone || ""} | ${profile.location || ""}
${(profile.urls || []).map((u) => `${u.label}: ${u.url}`).join(" | ")}

## Perfil Profesional
${profile.about || ""}

## Habilidades Técnicas y Competencias
${skillsBlock || "- Habilidades transversales de ingeniería, análisis y gestión técnica."}

## Experiencia Laboral
${(profile.experience || [])
  .map(
    (exp) => `### ${exp.role} — ${exp.company} (${exp.period})
${(exp.highlights || []).map((h) => `- ${h}`).join("\n")}`
  )
  .join("\n\n")}

## Proyectos y Logros Relevantes
${(profile.projects || [])
  .map(
    (p) => `### ${p.name}
${p.description}
${(p.architectureHighlights || []).map((a) => `- ${a}`).join("\n")}`
  )
  .join("\n\n")}

## Educación & Certificaciones
${(profile.education || []).map((e) => `- ${e.degree}, ${e.institution} (${e.period})`).join("\n")}
${(profile.certifications || []).map((c) => `- ${c.name} (${c.issuer}, ${c.year})`).join("\n")}
`,
  };
}

function generateFallbackOutreach(
  profile: CandidateProfile,
  rawJob: string
): OutreachPitch {
  const discipline = profile.headline || "Ingeniería";
  return {
    linkedInConnectionNote: `Hola! Vi su vacante para ${discipline}. Cuento con experiencia comprobada en optimización técnica y resolución de desafíos en el sector. Me gustaría conectar y explorar sinergias. ¡Saludos!`,
    linkedInInMailMessage: `Estimado/a Equipo de Selección,

Espero se encuentren muy bien. Les escribo porque considero que mi trayectoria técnica y profesional encaja de manera natural con el perfil que buscan.

Soy ${profile.fullName}, ${profile.headline}. A lo largo de mi carrera he impulsado proyectos con foco en excelencia técnica, cumplimiento de estándares rigurosos y optimización de resultados operativos.

Me encantaría tener un breve espacio para conversar sobre cómo puedo aportar valor inmediato a su equipo. Adjunto y pongo a su disposición mis antecedentes y enlaces de contacto.

Quedo a su disposición.

Atentamente,
${profile.fullName}`,
    emailCoverLetter: `Estimado/a Líder del Proceso de Selección,

Por medio de la presente carta manifiesto mi gran interés en postular a la vacante disponible en su organización.

A lo largo de mi trayectoria como ${profile.headline}, he liderado y colaborado en iniciativas donde el criterio técnico, el análisis de datos y la rigurosidad operativa son pilares indispensables. Cuento con experiencia en la formulación de soluciones, control de estándares de calidad y aplicación de metodologías orientadas a la eficiencia continua.

Asimismo, integro herramientas modernas y analíticas en mi flujo diario, lo que me permite elevar la precisión en la toma de decisiones y acelerar la entrega de resultados en entornos dinámicos.

Agradezco de antemano su tiempo y consideración al evaluar mi postulación. Adjunto mi currículum vitae y quedo a su disposición para coordinar una entrevista.

Atentamente,

${profile.fullName}
${profile.email || ""} | ${profile.phone || ""}
${(profile.urls || []).map((u) => `${u.label}: ${u.url}`).join("\n")}`,
  };
}
