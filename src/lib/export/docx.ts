import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from "docx";
import { CandidateProfile } from "@/types/profile";
import { TailoredResume } from "@/types/advisor";

export type ResumeDocxFormat = "harvard" | "ats";

interface GenerateResumeDocxOptions {
  profile: CandidateProfile;
  tailoredResume?: TailoredResume | null;
  format?: ResumeDocxFormat; // "harvard" (Times New Roman serif clásico) o "ats" (Calibri / Arial sans-serif moderno)
}

/**
 * Genera un archivo Word (.docx) descargable y 100% editable.
 * Cumple con los estándares internacionales Harvard Business / ATS Scanner:
 * - Tipografía estandarizada (Times New Roman para Harvard, Calibri/Arial para ATS)
 * - Sin tablas complejas de maquetación que confundan a los parsers ATS
 * - Estructura semántica clara con viñetas STAR/CAR
 * - Líneas divisorias sobrias y jerarquía tipográfica precisa
 */
export async function createResumeDocx({
  profile,
  tailoredResume,
  format = "harvard",
}: GenerateResumeDocxOptions): Promise<Document> {
  const isHarvard = format === "harvard";
  const fontFamily = isHarvard ? "Times New Roman" : "Calibri";
  const primaryColor = isHarvard ? "1A1A1A" : "0F172A";
  const accentColor = isHarvard ? "2B2B2B" : "1E3A8A";

  // Detección de idioma (Inglés vs Español)
  const isEnglish =
    tailoredResume?.language === "en" ||
    Boolean(
      tailoredResume?.professionalSummary &&
        /\b(experience|skills|engineer|lead|management|responsible|developed|architected|deliver)\b/i.test(
          tailoredResume.professionalSummary
        ) &&
        !/\b(experiencia|habilidades|desarrollo|gestión|liderazgo)\b/i.test(
          tailoredResume.professionalSummary
        )
    );

  const headline = tailoredResume?.targetedRole || profile.headline || (isEnglish ? "Professional" : "Profesional");
  const summaryText =
    tailoredResume?.professionalSummary ||
    profile.about ||
    `${profile.fullName} — ${profile.headline}. ${
      isEnglish
        ? "Professional track record focused on technical excellence and high-impact delivery."
        : "Trayectoria profesional orientada a la excelencia técnica y resolución de desafíos."
    }`;

  // Construir encabezado de datos de contacto
  const contactParts = [
    profile.email,
    profile.phone,
    profile.location,
    ...(profile.urls || []).map((u) => u.url),
  ].filter(Boolean);

  const children: (Paragraph | Table)[] = [];

  // 1. Nombre Completo (Título Principal)
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: profile.fullName.toUpperCase(),
          font: fontFamily,
          size: 32, // 16pt
          bold: true,
          color: primaryColor,
        }),
      ],
    })
  );

  // 2. Subtítulo / Especialidad
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: headline,
          font: fontFamily,
          size: 24, // 12pt
          bold: true,
          color: accentColor,
        }),
      ],
    })
  );

  // 3. Barra de Contacto
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: contactParts.join("  |  "),
          font: fontFamily,
          size: 19, // 9.5pt
          color: "4B5563",
        }),
      ],
    })
  );

  // Función auxiliar para títulos de sección (Harvard Style con línea inferior)
  const createSectionHeader = (title: string): Paragraph => {
    return new Paragraph({
      spacing: { before: 240, after: 120 },
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: 6,
          color: isHarvard ? "333333" : "2563EB",
          space: 2,
        },
      },
      children: [
        new TextRun({
          text: title.toUpperCase(),
          font: fontFamily,
          size: 22, // 11pt
          bold: true,
          color: isHarvard ? "111111" : "1E40AF",
        }),
      ],
    });
  };

  // 4. RESUMEN PROFESIONAL / PERFIL
  children.push(createSectionHeader(isEnglish ? "Professional Summary" : "Resumen Profesional"));
  children.push(
    new Paragraph({
      spacing: { after: 200 },
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({
          text: summaryText,
          font: fontFamily,
          size: 20, // 10pt
          color: "222222",
        }),
      ],
    })
  );

  // 5. COMPETENCIAS & HABILIDADES TÉCNICAS
  children.push(createSectionHeader(isEnglish ? "Core Competencies & Skills" : "Competencias & Habilidades Técnicas"));

  const allSkillsGroups: { label: string; items: string[] }[] = [];

  if (tailoredResume?.highlightedSkills && tailoredResume.highlightedSkills.length > 0) {
    allSkillsGroups.push({
      label: isEnglish ? "Priority Target Competencies" : "Competencias Priorizadas para la Vacante",
      items: tailoredResume.highlightedSkills,
    });
  }

  if (profile.skills.technicalCompetencies?.length) {
    allSkillsGroups.push({ label: isEnglish ? "Technical Competencies" : "Competencias Técnicas", items: profile.skills.technicalCompetencies });
  }
  if (profile.skills.standardsRegulations?.length) {
    allSkillsGroups.push({ label: isEnglish ? "Standards & Regulations" : "Normativas & Estándares", items: profile.skills.standardsRegulations });
  }
  if (profile.skills.softwareTools?.length) {
    allSkillsGroups.push({ label: isEnglish ? "Software & Tools" : "Software & Herramientas", items: profile.skills.softwareTools });
  }
  if (profile.skills.managementOperations?.length) {
    allSkillsGroups.push({ label: isEnglish ? "Management & Operations" : "Gestión & Operaciones", items: profile.skills.managementOperations });
  }
  if (profile.skills.frameworks?.length) {
    allSkillsGroups.push({ label: "Frameworks & Tecnologías", items: profile.skills.frameworks });
  }
  if (profile.skills.languages?.length) {
    allSkillsGroups.push({ label: "Lenguajes", items: profile.skills.languages });
  }
  if (profile.skills.databases?.length) {
    allSkillsGroups.push({ label: "Bases de Datos", items: profile.skills.databases });
  }
  if (profile.skills.cloudDevOps?.length) {
    allSkillsGroups.push({ label: "Cloud & DevOps", items: profile.skills.cloudDevOps });
  }
  if (profile.skills.hardwareRealtime?.length) {
    allSkillsGroups.push({ label: "Hardware & Sistemas Especializados", items: profile.skills.hardwareRealtime });
  }

  for (const group of allSkillsGroups) {
    children.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: `• ${group.label}: `,
            font: fontFamily,
            size: 20,
            bold: true,
            color: "1F2937",
          }),
          new TextRun({
            text: group.items.join(", "),
            font: fontFamily,
            size: 20,
            color: "374151",
          }),
        ],
      })
    );
  }

  // 6. EXPERIENCIA LABORAL
  children.push(createSectionHeader(isEnglish ? "Professional Experience" : "Experiencia Laboral"));

  const experiences =
    tailoredResume?.customExperience && tailoredResume.customExperience.length > 0
      ? tailoredResume.customExperience
      : (profile.experience || []).map((exp) => ({
          company: exp.company,
          role: exp.role,
          period: exp.period,
          bulletPoints: exp.highlights || [],
        }));

  for (const exp of experiences) {
    // Encabezado del puesto: Rol en negrita + Empresa y Periodo
    children.push(
      new Paragraph({
        spacing: { before: 140, after: 60 },
        children: [
          new TextRun({
            text: `${exp.role} `,
            font: fontFamily,
            size: 21, // 10.5pt
            bold: true,
            color: "111827",
          }),
          new TextRun({
            text: `|  ${exp.company}`,
            font: fontFamily,
            size: 20,
            color: isHarvard ? "374151" : "1D4ED8",
            bold: !isHarvard,
          }),
          new TextRun({
            text: `\t(${exp.period})`,
            font: fontFamily,
            size: 19,
            color: "6B7280",
            italics: true,
          }),
        ],
      })
    );

    // Viñetas STAR/CAR
    for (const bullet of exp.bulletPoints) {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 60 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: bullet,
              font: fontFamily,
              size: 20,
              color: "2D3748",
            }),
          ],
        })
      );
    }
  }

  // 7. PROYECTOS DESTACADOS
  const projects =
    tailoredResume?.relevantProjects && tailoredResume.relevantProjects.length > 0
      ? tailoredResume.relevantProjects
      : (profile.projects || []).map((p) => ({
          name: p.name,
          bulletPoints: p.architectureHighlights || [p.description],
        }));

  if (projects.length > 0) {
    children.push(createSectionHeader(isEnglish ? "Key Projects & Deliverables" : "Proyectos Destacados"));
    for (const proj of projects) {
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 60 },
          children: [
            new TextRun({
              text: proj.name,
              font: fontFamily,
              size: 21,
              bold: true,
              color: "111827",
            }),
          ],
        })
      );

      for (const bullet of proj.bulletPoints) {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 60 },
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: bullet,
                font: fontFamily,
                size: 20,
                color: "2D3748",
              }),
            ],
          })
        );
      }
    }
  }

  // 8. EDUCACIÓN
  if (profile.education && profile.education.length > 0) {
    children.push(createSectionHeader(isEnglish ? "Education" : "Educación"));
    for (const edu of profile.education) {
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 40 },
          children: [
            new TextRun({
              text: `${edu.degree} `,
              font: fontFamily,
              size: 20,
              bold: true,
              color: "111827",
            }),
            new TextRun({
              text: `|  ${edu.institution}`,
              font: fontFamily,
              size: 20,
              color: "374151",
            }),
            new TextRun({
              text: `\t(${edu.period})`,
              font: fontFamily,
              size: 19,
              color: "6B7280",
              italics: true,
            }),
          ],
        })
      );
    }
  }

  // 9. CERTIFICACIONES
  if (profile.certifications && profile.certifications.length > 0) {
    children.push(createSectionHeader(isEnglish ? "Certifications & Credentials" : "Certificaciones & Licencias"));
    for (const cert of profile.certifications) {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 40 },
          bullet: { level: 0 },
          children: [
            new TextRun({
              text: `${cert.name} `,
              font: fontFamily,
              size: 20,
              bold: true,
              color: "1F2937",
            }),
            new TextRun({
              text: `— ${cert.issuer} (${cert.year})`,
              font: fontFamily,
              size: 19,
              color: "4B5563",
            }),
          ],
        })
      );
    }
  }

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720, // 0.5 pulgada (Harvard standard margins)
              bottom: 720,
              left: 720,
              right: 720,
            },
          },
        },
        children,
      },
    ],
  });
}
