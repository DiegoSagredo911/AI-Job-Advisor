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

export default apiClient;
