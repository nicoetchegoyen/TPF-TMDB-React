import { consultarDemo } from "./demo.js";

export const modoDemo = import.meta.env.VITE_DEMO_MODE === "true";

export async function consultar(ruta, parametros = {}, signal) {
  if (modoDemo) return consultarDemo(ruta, parametros);
  // URLSearchParams codifica espacios y caracteres del título buscado.
  const consulta = new URLSearchParams({ ruta, language: "es-AR", ...parametros });
  let respuesta;
  try {
    // El token se agrega en la función del servidor, nunca en React.
    respuesta = await fetch(`/.netlify/functions/tmdb?${consulta}`, {
      headers: { Accept: "application/json" },
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(
      "No se pudo conectar con TMDB. Revisá tu conexión e intentá de nuevo.",
    );
  }
  if (!respuesta.ok) {
    const datos = await respuesta.json().catch(() => ({}));
    throw new Error(datos.message || `No se pudo consultar TMDB (HTTP ${respuesta.status}).`);
  }
  return respuesta.json();
}

export function obtenerTrailers(videos) {
  // Sólo se insertan IDs de YouTube con formato válido, sin HTML externo.
  return videos.filter(
    (video) =>
      video.site === "YouTube" &&
      video.type === "Trailer" &&
      /^[\w-]{11}$/.test(video.key),
  );
}
