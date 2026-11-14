// Prueba real de sólo lectura. No imprime ni cambia la credencial.
import assert from "node:assert/strict";
import { handler } from "../netlify/functions/tmdb.mjs";

const sitio = process.env.TMDB_SITE;
async function consultar(ruta, parametros = {}) {
  let estado, datos;
  if (sitio) {
    const url = new URL("/.netlify/functions/tmdb", sitio);
    url.search = new URLSearchParams({ ruta, ...parametros });
    const respuesta = await fetch(url);
    estado = respuesta.status;
    datos = await respuesta.json();
  } else {
    const respuesta = await handler({ httpMethod: "GET", queryStringParameters: { ruta, ...parametros } });
    estado = respuesta.statusCode;
    datos = JSON.parse(respuesta.body);
  }
  assert.equal(estado, 200, `${ruta}: HTTP ${estado} - ${datos.message || ""}`);
  return datos;
}

const primera = await consultar("/movie/popular", { page: "1" });
const segunda = await consultar("/movie/popular", { page: "2" });
assert.equal(primera.page, 1);
assert.equal(segunda.page, 2);
assert.ok(primera.results.length > 0);
assert.notEqual(primera.results[0].id, segunda.results[0].id);
console.log(`Populares: HTTP 200, ${primera.results.length} resultados por página; páginas 1 y 2 verificadas.`);
const busqueda = await consultar("/search/movie", { query: "Batman", page: "1" });
const busqueda2 = await consultar("/search/movie", { query: "Batman", page: "2" });
assert.ok(busqueda.results.length && busqueda2.results.length);
assert.equal(busqueda2.page, 2);
console.log(`Búsqueda Batman: HTTP 200, ${busqueda.total_results} resultados; páginas 1 y 2 verificadas.`);
const vacia = await consultar("/search/movie", { query: "zzzxqvpeliculainexistentetp2024" });
assert.equal(vacia.results.length, 0);
console.log("Búsqueda inexistente: HTTP 200, sin resultados.");
const pelicula = await consultar("/movie/272");
assert.ok(pelicula.title && pelicula.overview && pelicula.release_date && pelicula.poster_path);
assert.equal(typeof pelicula.vote_average, "number");
console.log(`Detalle: HTTP 200, ${pelicula.title}; póster, sinopsis, estreno y calificación presentes.`);
const videos = await consultar("/movie/272/videos", { language: "en-US" });
const trailers = videos.results.filter(v => v.site === "YouTube" && v.type === "Trailer" && /^[\w-]{11}$/.test(v.key));
assert.ok(trailers.length > 0);
console.log(`Videos: HTTP 200, ${trailers.length} trailers de YouTube disponibles. La reproducción se comprueba en el navegador.`);
