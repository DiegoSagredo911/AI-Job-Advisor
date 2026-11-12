import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AI Job Advisor | Asesor Inteligente de Postulaciones y Carrera",
    short_name: "AI Job Advisor",
    description:
      "Copiloto inteligente para análisis de vacantes, compatibilidad ATS, optimización de CV a formato Harvard en Word y simulador de entrevistas con IA.",
    start_url: "/",
    display: "standalone",
    background_color: "#090a0f",
    theme_color: "#090a0f",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
