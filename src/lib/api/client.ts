import axios from "axios";

/**
 * Instancia centralizada de Axios para la aplicación.
 * Provee defaults, interceptores de timeout y manejo uniforme de respuestas.
 */
export const apiClient = axios.create({
  timeout: 60000, // 60s para soportar llamadas a Gemini Flash y generación de documentos
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const key = localStorage.getItem("ai_job_advisor_gemini_api_key");
    const prefModel = localStorage.getItem("ai_job_advisor_gemini_model");
    const fbModel = localStorage.getItem("ai_job_advisor_gemini_fallback_model");

    if (key && !config.headers["x-gemini-api-key"]) {
      config.headers["x-gemini-api-key"] = key;
    }
    if (prefModel && !config.headers["x-gemini-preferred-model"]) {
      config.headers["x-gemini-preferred-model"] = prefModel;
    }
    if (fbModel && !config.headers["x-gemini-fallback-model"]) {
      config.headers["x-gemini-fallback-model"] = fbModel;
    }
  }
  return config;
});

export default apiClient;
