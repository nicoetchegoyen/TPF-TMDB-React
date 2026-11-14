import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";
import { consultarDemo } from "../src/demo.js";
import { handler } from "../netlify/functions/tmdb.mjs";

test("Contrato de TMDB: URL codificada, paginación, autenticación, trailers y errores", async () => {
  process.env.VITE_DEMO_MODE = "false";
  const servidor = await createServer({
    configFile: false,
    server: { middlewareMode: true },
    logLevel: "silent",
  });
  const fetchOriginal = globalThis.fetch;
  try {
    const { consultar, obtenerTrailers } =
      await servidor.ssrLoadModule("/src/api.js");
    let solicitud;
    globalThis.fetch = async (url, opciones) => {
      solicitud = { url: new URL(url, "http://localhost"), opciones };
      return Response.json({ results: [] });
    };
    await consultar("/search/movie", { query: "Luz & día", page: 2 });
    assert.equal(solicitud.url.pathname, "/.netlify/functions/tmdb");
    assert.equal(solicitud.url.searchParams.get("ruta"), "/search/movie");
    assert.equal(solicitud.url.searchParams.get("query"), "Luz & día");
    assert.equal(solicitud.url.searchParams.get("page"), "2");
    assert.equal(solicitud.url.searchParams.get("language"), "es-AR");
    assert.equal(
      solicitud.opciones.headers.Authorization,
      undefined,
    );
    const controlador = new AbortController();
    await consultar(
      "/movie/12/videos",
      { language: "en-US" },
      controlador.signal,
    );
    assert.equal(solicitud.url.searchParams.get("ruta"), "/movie/12/videos");
    assert.equal(solicitud.url.searchParams.get("language"), "en-US");
    assert.equal(solicitud.opciones.signal, controlador.signal);
    const video = { site: "YouTube", type: "Trailer", key: "abcdefghijk" };
    assert.deepEqual(
      obtenerTrailers([
        video,
        { ...video, site: "Vimeo" },
        { ...video, type: "Clip" },
        { ...video, key: "mal/ID" },
      ]),
      [video],
    );
    globalThis.fetch = async () => Response.json({ message: "TMDB rechazó la credencial del servidor." }, { status: 401 });
    await assert.rejects(consultar("/movie/popular"), /rechazó la credencial/);
    globalThis.fetch = async () => Response.json({ message: "Película no encontrada." }, { status: 404 });
    await assert.rejects(consultar("/movie/999"), /no encontrada/);
    globalThis.fetch = async () => {
      throw new TypeError("sin red");
    };
    await assert.rejects(consultar("/movie/popular"), /No se pudo conectar/);
  } finally {
    globalThis.fetch = fetchOriginal;
    await servidor.close();
  }
});

test("Servidor: sólo rutas de lectura, parámetros válidos y token fuera de la respuesta", async () => {
  const originalFetch = globalThis.fetch;
  const originalToken = process.env.TMDB_TOKEN;
  process.env.TMDB_TOKEN = "credencial-simulada-privada";
  let solicitud;
  globalThis.fetch = async (url, opciones) => {
    solicitud = { url: new URL(url), opciones };
    return Response.json({ results: [{ id: 12, title: "Prueba" }] });
  };
  const evento = (ruta, extras = {}) => ({ httpMethod: "GET", queryStringParameters: { ruta, ...extras } });
  try {
    assert.equal((await handler({ ...evento("/movie/popular"), httpMethod: "POST" })).statusCode, 405);
    assert.equal((await handler(evento("https://otro-sitio.test"))).statusCode, 400);
    assert.equal((await handler(evento("/account"))).statusCode, 400);
    assert.equal((await handler(evento("/movie/popular", { page: "501" }))).statusCode, 400);
    assert.equal((await handler(evento("/search/movie", { query: "" }))).statusCode, 400);
    const respuesta = await handler(evento("/search/movie", { query: "Luz & día", page: "2", api_key: "no-reenviar" }));
    assert.equal(respuesta.statusCode, 200);
    assert.equal(solicitud.url.origin, "https://api.themoviedb.org");
    assert.equal(solicitud.url.pathname, "/3/search/movie");
    assert.equal(solicitud.url.searchParams.get("query"), "Luz & día");
    assert.equal(solicitud.url.searchParams.get("page"), "2");
    assert.equal(solicitud.url.searchParams.get("include_adult"), "false");
    assert.equal(solicitud.url.searchParams.has("api_key"), false);
    assert.equal(solicitud.opciones.headers.Authorization, "Bearer credencial-simulada-privada");
    assert.equal(JSON.stringify(respuesta).includes(process.env.TMDB_TOKEN), false);
    globalThis.fetch = async () => { throw new Error(process.env.TMDB_TOKEN); };
    const error = await handler(evento("/movie/12/videos"));
    assert.equal(error.statusCode, 502);
    assert.equal(error.body.includes(process.env.TMDB_TOKEN), false);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalToken === undefined) delete process.env.TMDB_TOKEN;
    else process.env.TMDB_TOKEN = originalToken;
  }
});

test("Práctica: búsqueda paginada sin duplicados y búsqueda vacía de resultados", async () => {
  const primera = await consultarDemo("/search/movie", {
    query: "la",
    page: 1,
  });
  const segunda = await consultarDemo("/search/movie", {
    query: "la",
    page: 2,
  });
  assert.equal(primera.total_pages, 2);
  assert.ok(segunda.results.length > 0);
  assert.ok(
    segunda.results.every(
      (item) => !primera.results.some((anterior) => anterior.id === item.id),
    ),
  );
  const vacia = await consultarDemo("/search/movie", {
    query: "zzzinexistente",
  });
  assert.equal(vacia.total_pages, 0);
  assert.equal(vacia.results.length, 0);
});
