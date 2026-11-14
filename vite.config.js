import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { handler } from "./netlify/functions/tmdb.mjs";

export default defineConfig(({ mode }) => {
  // La configuración corre en Node. Esta variable no se incorpora al cliente.
  const entorno = loadEnv(mode, process.cwd(), "");
  process.env.TMDB_TOKEN = entorno.TMDB_TOKEN || "";
  return {
    base: "./",
    plugins: [react(), {
      name: "funcion-tmdb-local",
      configureServer(servidor) {
        servidor.middlewares.use(async (req, res, next) => {
          const url = new URL(req.url, "http://localhost");
          if (url.pathname !== "/.netlify/functions/tmdb") return next();
          const resultado = await handler({
            httpMethod: req.method,
            queryStringParameters: Object.fromEntries(url.searchParams),
          });
          res.writeHead(resultado.statusCode, resultado.headers);
          res.end(resultado.body);
        });
      },
    }],
  };
});
