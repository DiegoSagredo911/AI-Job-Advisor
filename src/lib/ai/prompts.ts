import { CandidateProfile } from "@/types/profile";

export function buildProfileContext(profile: CandidateProfile): string {
  const skillsSections: string[] = [];
  if (profile.skills.languages?.length) skillsSections.push(`- Lenguajes / Códigos: ${profile.skills.languages.join(", ")}`);
  if (profile.skills.frameworks?.length) skillsSections.push(`- Frameworks / Librerías: ${profile.skills.frameworks.join(", ")}`);
  if (profile.skills.databases?.length) skillsSections.push(`- Bases de Datos / Sistemas de Información: ${profile.skills.databases.join(", ")}`);
  if (profile.skills.cloudDevOps?.length) skillsSections.push(`- Infraestructura, Cloud & Planta: ${profile.skills.cloudDevOps.join(", ")}`);
  if (profile.skills.toolsMethods?.length) skillsSections.push(`- Metodologías & Herramientas: ${profile.skills.toolsMethods.join(", ")}`);
  if (profile.skills.hardwareRealtime?.length) skillsSections.push(`- Equipamiento, Hardware & Tiempo Real: ${profile.skills.hardwareRealtime.join(", ")}`);
  if (profile.skills.technicalCompetencies?.length) skillsSections.push(`- Competencias Técnicas de Especialidad: ${profile.skills.technicalCompetencies.join(", ")}`);
  if (profile.skills.softwareTools?.length) skillsSections.push(`- Software de Ingeniería / Modelado (AutoCAD, SAP, SCADA, etc.): ${profile.skills.softwareTools.join(", ")}`);
  if (profile.skills.standardsRegulations?.length) skillsSections.push(`- Normativas, Calidad & Estándares (ISO, HACCP, SEC, etc.): ${profile.skills.standardsRegulations.join(", ")}`);
  if (profile.skills.managementOperations?.length) skillsSections.push(`- Gestión, Procesos & Operaciones (Lean, Six Sigma, TPM): ${profile.skills.managementOperations.join(", ")}`);

  return `
PERFIL PROFESIONAL DEL USUARIO:
- Nombre: ${profile.fullName}
- Título/Rol Profesional: ${profile.headline}
- Email: ${profile.email} | Tel: ${profile.phone} | Ubicación: ${profile.location}
- Acerca de: ${profile.about}

HABILIDADES Y COMPETENCIAS:
${skillsSections.length > 0 ? skillsSections.join("\n") : "Competencias según experiencia laboral y proyectos."}

EXPERIENCIA LABORAL:
${profile.experience
  .map(
    (exp) => `* ${exp.role} en ${exp.company} (${exp.period})
  Herramientas / Métodos / Tecnologías: ${exp.technologies.join(", ")}
  Logros e Hitos Cuantificables:
  ${exp.highlights.map((h) => `  - ${h}`).join("\n")}`
  )
  .join("\n\n")}

PROYECTOS DESTACADOS:
${profile.projects
  .map(
    (p) => `* ${p.name} (Rol: ${p.role}) - ${p.url || ""}
  Descripción: ${p.description}
  Hitos de Ingeniería y Resultados:
  ${p.architectureHighlights.map((a) => `  - ${a}`).join("\n")}
  Herramientas / Tecnologías: ${p.technologies.join(", ")}`
  )
  .join("\n\n")}

EDUCACIÓN:
${profile.education.map((e) => `* ${e.degree} - ${e.institution} (${e.period})`).join("\n")}

CERTIFICACIONES:
${profile.certifications.map((c) => `* ${c.name} - ${c.issuer} (${c.year})`).join("\n")}

ENLACES Y PRESENCIA PROFESIONAL:
${profile.urls.map((u) => `* ${u.label}: ${u.url} (${u.description || ""})`).join("\n")}
`;
}

export function buildJobAnalysisPrompt(profile: CandidateProfile, rawJobDescription: string): string {
  return `
Eres un Asesor Senior de Carrera Profesional y Consultor de Empleabilidad multidisciplinario de élite, experto en evaluar perfiles para cualquier área o disciplina (Arqueología, Antropología, Ciencias Sociales, Humanidades, Salud, Leyes, Ingenierías, Tecnología, Ciencias Aplicadas y Gestión).
Tu misión es analizar la oferta laboral y compararla con el perfil del usuario, calculando la compatibilidad real, identificando fortalezas, posibles brechas y formulando la mejor estrategia de postulación y palabras clave ATS adaptadas a la disciplina específica de la vacante.

${buildProfileContext(profile)}

OFERTA LABORAL A EVALUAR:
"""
${rawJobDescription}
"""

INSTRUCCIONES CRÍTICAS:
1. Detecta automáticamente el idioma de la oferta laboral ("es" para español o "en" para inglés) y asígnalo en "detectedLanguage". Si la vacante está en inglés, formula los análisis, palabras clave y preguntas en inglés profesional.
2. Genera de 3 a 5 preguntas de alto impacto para "Reverse Interview" (preguntas estratégicas que el postulante debe hacerle al entrevistador al final de la entrevista cuando le pregunten "¿Tienes alguna pregunta para nosotros?"), clasificadas en categorías "technical", "culture" y "strategy", explicando brevemente qué se evalúa con cada una ("whyAskThis").
3. Responde ÚNICAMENTE en formato JSON válido que cumpla exactamente la siguiente estructura:
{
  "jobTitle": "Título inferido de la vacante",
  "companyName": "Empresa si se menciona o 'Empresa Confidencial'",
  "detectedLanguage": "es", // "es" o "en" según el idioma principal de la oferta
  "matchScore": 85, // Número entero entre 0 y 100 evaluando compatibilidad real
  "seniorityLevel": "Junior / Semi-Senior / Senior / Lead / Jefatura",
  "fitSummary": "Resumen conciso y profesional de por qué este perfil es o no buen calce para este puesto.",
  "keyStrengths": [
    "Fortaleza 1 ligada a su experiencia real y competencias de su especialidad",
    "Fortaleza 2..."
  ],
  "missingGaps": [
    "Brecha o requisito deseable no explícito en su perfil",
    "Cómo justificar o defender esta brecha en una entrevista con habilidades transferibles"
  ],
  "recommendedProjects": [
    {
      "projectName": "Nombre de proyecto o logro clave del usuario",
      "whyRelevant": "Por qué este proyecto demuestra que cumple con los desafíos del puesto",
      "talkingPoint": "El argumento técnico o métrica concreta que debe mencionar el usuario al reclutador"
    }
  ],
  "reverseInterviewQuestions": [
    {
      "category": "technical", // "technical" | "culture" | "strategy"
      "question": "Pregunta incisiva y estratégica sobre arquitectura, procesos de terreno, herramientas o estándares técnicos.",
      "whyAskThis": "Explica al postulante qué señal proyecta al hacer esta pregunta y qué descubrirá sobre el equipo."
    },
    {
      "category": "culture",
      "question": "Pregunta sobre dinámicas de trabajo, autonomía, colaboración o manejo de contingencias.",
      "whyAskThis": "Qué revela sobre el liderazgo real y el ambiente laboral."
    },
    {
      "category": "strategy",
      "question": "Pregunta sobre el impacto del rol en los objetivos del próximo trimestre/año o desafíos de escala.",
      "whyAskThis": "Demuestra visión de negocio y compromiso con los resultados a largo plazo."
    }
  ],
  "atsKeywords": {
    "criticalMatches": ["Palabras clave o normativas/herramientas de la oferta que ya están en el perfil"],
    "missingKeywords": ["Palabras clave que la vacante busca pero no están explícitas"],
    "suggestedAdditions": ["Términos técnicos exactos a incorporar en su postulación (normas, procesos, herramientas)"]
  },
  "tailoredStrategy": {
    "approachAdvice": "Consejo táctico directo para el usuario al postular",
    "interviewWarningAreas": ["Pregunta difícil o trampa de su especialidad que seguramente le harán"],
    "salaryRangeAdvice": "Orientación de compensación según rol, especialidad y mercado"
  }
}

4. Sé riguroso, honesto y estratégico. NUNCA inventes certificaciones o conocimientos que el usuario no tenga. Si falta algo, explícale cómo defenderlo con habilidades transferibles de su disciplina o especialidad.
`;
}

export function buildTailorResumePrompt(profile: CandidateProfile, rawJobDescription: string): string {
  return `
Eres un redactor experto de currículums profesionales de alto impacto y especialista en optimización para ATS (Applicant Tracking Systems) para cualquier disciplina profesional (Arqueología, Ciencias, Humanidades, Ingeniería, Salud, Negocios, etc.).
Tu tarea es generar una versión optimizada y personalizada del CV del usuario para la siguiente vacante, sin alterar la verdad pero reorganizando el contenido y destacando los hitos con mayor afinidad usando la metodología STAR (Situación, Tarea, Acción, Resultado con métricas).

${buildProfileContext(profile)}

OFERTA LABORAL:
"""
${rawJobDescription}
"""

INSTRUCCIONES:
1. Detecta si la oferta de empleo está en inglés ("en") o en español ("es"). Si está en inglés, redacta todo el CV en INGLÉS profesional utilizando verbos de acción fuertes (Spearheaded, Architected, Designed, Executed, Delivered, Streamlined) acordes al estándar Harvard / ATS de EE.UU. e internacional.
2. Devuelve un JSON con:
{
  "targetedRole": "Título ajustado al que postula (ej. Field Archaeologist / Senior Process Engineer / Full Stack Engineer)",
  "language": "es", // "es" o "en" según el idioma generado
  "professionalSummary": "Párrafo de 3-4 líneas vendedor, enfocado exactamente en lo que esta empresa y puesto necesitan en el idioma objetivo.",
  "highlightedSkills": ["Lista ordenada de competencias, herramientas y normativas clave para esta vacante"],
  "customExperience": [
    {
      "company": "Empresa",
      "role": "Cargo",
      "period": "Periodo",
      "bulletPoints": [
        "Viñeta optimizada con métricas cuantificables y palabras clave ATS sin falsear datos"
      ]
    }
  ],
  "relevantProjects": [
    {
      "name": "Proyecto / Implementación",
      "bulletPoints": ["Hito o impacto relevante para la vacante"]
    }
  ],
  "markdownResume": "Texto completo del CV en formato Markdown limpio, estructurado y listo para descargar o copiar."
}
`;
}

export function buildOutreachPrompt(profile: CandidateProfile, rawJobDescription: string): string {
  return `
Eres un especialista en reclutamiento profesional, headhunting y Cold Outreach para profesionales de cualquier sector (patrimonial, científico, ambiental, tecnológico, industrial, consultoría, etc.).
Genera mensajes de contacto para que el usuario se comunique con el reclutador o líder del área.

${buildProfileContext(profile)}

OFERTA LABORAL:
"""
${rawJobDescription}
"""

INSTRUCCIONES:
1. Si la vacante está en inglés, redacta los tres mensajes en INGLÉS profesional de alto impacto. Si está en español, redáctalos en español.
2. Devuelve un JSON con:
{
  "linkedInConnectionNote": "Mensaje ultra conciso para la solicitud de contacto en LinkedIn (MÁXIMO 280 caracteres). Debe sonar profesional y despertar interés inmediato.",
  "linkedInInMailMessage": "Mensaje directo de 2-3 párrafos persuasivo para InMail o mensaje a reclutador / Gerente de Área, citando proyectos reales y disponibilidad.",
  "emailCoverLetter": "Carta de presentación profesional completa (Cover Letter) adaptada al puesto y cultura de la organización."
}
`;
}

export function buildInterviewFeedbackPrompt(
  profile: CandidateProfile,
  jobContext: string,
  chatHistory: { role: string; content: string }[],
  candidateAnswer: string
): string {
  return `
Eres el Gerente de Contratación / Jefe de Área (de Ingeniería, Ciencias, Arqueología, Software u Operaciones, según corresponda a la vacante) de la empresa que publicó el puesto.
Estás en una sesión de entrevista técnica y de competencias en tiempo real con el/la candidato/a: ${profile.fullName}.

CONTEXTO Y REQUISITOS DEL PUESTO:
${jobContext}

HISTORIAL COMPLETO DE LA CONVERSACIÓN (MEMORIA DE CONTEXTO):
${chatHistory.length > 0 ? chatHistory.map((m) => `${m.role === "user" ? "CANDIDATO" : "ENTREVISTADOR"}: ${m.content}`).join("\n\n") : "(Inicio de la entrevista)"}

ÚLTIMA RESPUESTA EMITIDA POR EL CANDIDATO (VÍA VOZ O TEXTO):
"""
${candidateAnswer}
"""

DIRECTRICES PARA TU RESPUESTA:
1. **IDIOMA DE LA INTERACCIÓN**: Si el candidato responde en inglés o la vacante está en inglés, formula tu réplica y feedback en INGLÉS natural. Si es en español, en español.
2. **MEMORIA Y CONTINUIDAD ORGÁNICA**: Analiza lo que el candidato acaba de decir en relación directa con el historial previo. Si mencionó un proyecto (ej. una campaña de terreno, un sistema, una obra o un estudio previo), una métrica o un método específico, reacciona a ese detalle puntual antes de lanzar la siguiente pregunta.
3. **ESPONTANEIDAD REALISTA**: Actúa como un líder técnico humano auténtico: no hagas preguntas genéricas de manual. Si el candidato titubeó, fue ambiguo o dio una respuesta brillante, haz una repregunta incisiva o pide profundizar en cómo resolvió los problemas reales de ese caso.
4. **MANTENERSE DENTRO DE LOS PARÁMETROS DEL PUESTO**: Todo el diálogo debe estar alineado con los desafíos técnicos, metodológicos, de liderazgo o arquitectónicos que la vacante exige.
5. **LENGUAJE CONVERSACIONAL Y FLUIDO**: Tu respuesta hablada ("interviewerReply") debe sonar natural al ser leída o reproducida por voz (concisa, profesional, estimulante, típicamente de 2 a 4 oraciones).

Responde ÚNICAMENTE en JSON con esta estructura exacta:
{
  "interviewerReply": "Tu reacción como entrevistador al punto que tocó + tu siguiente pregunta espontánea y contextual para continuar el diálogo (en el idioma correspondiente).",
  "feedback": {
    "score": 8, // Calificación de 1 a 10 de su última respuesta
    "positives": ["Qué demostró solvencia o buen criterio en lo que dijo"],
    "improvements": ["Qué faltó fundamentar o cómo sonaría más persuasivo ante un comité"],
    "suggestedBetterAnswer": "Ejemplo concreto de cómo respondería un referente senior con datos o arquitectura real."
  }
}
`;
}

export function buildProfileIngestionPrompt(rawText: string, urls: string[]): string {
  return `
Eres un extractor experto de datos biográficos y profesionales para cualquier disciplina o carrera profesional (Arqueología, Antropología, Ciencias Sociales, Humanidades, Salud, Leyes, Ingenierías, etc.).
A continuación tienes texto extraído de documentos de un usuario (CV, certificados, memorias, informes) y una lista de sus URLs personales.

TEXTO EXTRAÍDO:
"""
${rawText}
"""

URLS DEL USUARIO:
${urls.join("\n")}

TAREA:
Consolida y estructura toda esta información en un único JSON que cumpla fielmente con la estructura CandidateProfile:
{
  "slug": "nombre-apellido",
  "fullName": "Nombre Completo",
  "headline": "Título profesional representativo (ej. Arqueólogo/a / Antropólogo/a / Ing. Civil / Diseñador/a / etc.)",
  "email": "correo@ejemplo.com",
  "phone": "+569...",
  "location": "Ciudad / País / Modalidad",
  "about": "Resumen biográfico profesional sólido destacando su especialidad y áreas de dominio",
  "urls": [
    { "label": "LinkedIn / Portafolio / Redes", "url": "https://..." }
  ],
  "skills": {
    "technicalCompetencies": ["Competencias técnicas de especialidad de su ingeniería"],
    "softwareTools": ["Software especializado (AutoCAD, SAP, MATLAB, Excel, SCADA, etc.)"],
    "standardsRegulations": ["Normativas y estándares (ISO, HACCP, SEC, BPM, etc.)"],
    "managementOperations": ["Metodologías de gestión y operaciones (Lean, Six Sigma, TPM, etc.)"],
    "languages": [],
    "frameworks": [],
    "databases": []
  },
  "experience": [
    {
      "id": "exp-1",
      "company": "Nombre Empresa / Planta / Institución",
      "role": "Cargo",
      "period": "Fechas",
      "highlights": ["Logro 1 con métricas", "Logro 2"],
      "technologies": ["Herramienta/Norma/Técnica 1", "Herramienta/Norma/Técnica 2"]
    }
  ],
  "projects": [
    {
      "id": "proj-1",
      "name": "Nombre Proyecto / Implementación",
      "role": "Rol",
      "description": "Descripción del desafío u obra",
      "url": "",
      "architectureHighlights": ["Hito técnico 1", "Impacto cuantitativo"],
      "technologies": ["Metodologías/Herramientas aplicadas"]
    }
  ],
  "education": [
    { "degree": "Título Profesional", "institution": "Universidad / Instituto", "period": "Años" }
  ],
  "certifications": [
    { "name": "Nombre Certificación / Curso", "issuer": "Institución emisora", "year": "Año" }
  ],
  "updatedAt": "${new Date().toISOString()}"
}

No inventes datos que no aparezcan en los textos. Si algún campo no existe, déjalo vacío o con valores por defecto coherentes.
`;
}
