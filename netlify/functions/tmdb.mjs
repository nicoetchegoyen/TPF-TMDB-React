const API = "https://api.themoviedb.org/3";

function responder(statusCode, datos) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": statusCode === 200 ? "public, max-age=60" : "no-store",
      "X-Content-Type-Options": "nosniff",
    },
    body: JSON.stringify(datos),
  };
}

export async function handler(event) {
  const parametros = event.queryStringParameters || {};
  const ruta = parametros.ruta;
  // Sólo lectura y rutas del TP: nunca se acepta una URL externa del visitante.
  if (event.httpMethod !== "GET")
    return responder(405, { message: "Sólo se permiten consultas GET." });
  if (!["/movie/popular", "/search/movie"].includes(ruta) &&
      !/^\/movie\/[1-9]\d{0,9}(\/videos)?$/.test(ruta || ""))
    return responder(400, { message: "Ruta de películas inválida." });
  const pagina = Number(parametros.page || 1);
  if (!Number.isInteger(pagina) || pagina < 1 || pagina > 500)
    return responder(400, { message: "La página debe estar entre 1 y 500." });
  const idioma = parametros.language || "es-AR";
  if (!["es-AR", "en-US"].includes(idioma))
    return responder(400, { message: "Idioma inválido." });
  const busqueda = (parametros.query || "").trim();
  if (ruta === "/search/movie" && (!busqueda || busqueda.length > 200))
    return responder(400, { message: "Ingresá un título de hasta 200 caracteres." });
  if (!process.env.TMDB_TOKEN?.trim())
    return responder(503, { message: "Falta configurar TMDB_TOKEN en el servidor." });
  // Se construyen únicamente parámetros conocidos; no se reenvían credenciales del cliente.
  const consulta = new URLSearchParams({ language: idioma });
  if (["/movie/popular", "/search/movie"].includes(ruta))
    consulta.set("page", String(pagina));
  if (ruta === "/search/movie") {
    consulta.set("query", busqueda);
    consulta.set("include_adult", "false");
  }
  try {
    const respuesta = await fetch(`${API}${ruta}?${consulta}`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${process.env.TMDB_TOKEN.trim()}` },
      signal: AbortSignal.timeout(15000),
    });
    if (!respuesta.ok) {
      const mensaje = respuesta.status === 404 ? "Película no encontrada."
        : [401, 403].includes(respuesta.status) ? "TMDB rechazó la credencial del servidor."
        : `No se pudo consultar TMDB (HTTP ${respuesta.status}).`;
      return responder(respuesta.status, { message: mensaje });
    }
    return responder(200, await respuesta.json());
  } catch {
    // No devolver errores internos que puedan contener información privada.
    return responder(502, { message: "No se pudo conectar con TMDB. Intentá de nuevo." });
  }
}
