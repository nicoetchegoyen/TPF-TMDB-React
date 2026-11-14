import { useEffect } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { modoDemo } from "./api.js";
import Inicio from "./Inicio.jsx";
import Detalle from "./Detalle.jsx";

export default function App() {
  const ubicacion = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    if (ubicacion.pathname === "/") document.title = "Plano · Películas";
  }, [ubicacion.pathname, ubicacion.search]);
  return (
    <>
      <a
        className="skip"
        href="#contenido"
        onClick={(evento) => {
          evento.preventDefault();
          document.getElementById("contenido").focus();
        }}
      >
        Saltar al contenido
      </a>
      {modoDemo && (
        <div className="demo-banner">
          MODO PRÁCTICA · Películas ficticias para estudiar. Configurá TMDB para
          ver el catálogo y los trailers reales.
        </div>
      )}
      <header className="site-header">
        <Link className="brand" to="/">
          plano<span aria-hidden="true">.</span>
        </Link>
        <nav aria-label="Principal">
          <Link to="/">Explorar películas</Link>
          <a
            href="#creditos"
            onClick={(evento) => {
              evento.preventDefault();
              document.getElementById("creditos").scrollIntoView();
            }}
          >
            Créditos
          </a>
        </nav>
        <span className="header-note">CINE, SIN DAR VUELTAS.</span>
      </header>
      <main id="contenido" tabIndex="-1">
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/peliculas/:id" element={<Detalle />} />
            <Route
              path="/peliculas/:id/trailers"
              element={<Detalle mostrarTrailers />}
            />
            <Route
              path="*"
              element={
                <section className="notice">
                  <h1 className="page-title">Página no encontrada</h1>
                  <Link to="/">Volver a películas</Link>
                </section>
              }
            />
          </Routes>
      </main>
      <footer id="creditos">
        <div>
          <Link className="brand" to="/">
            plano<span>.</span>
          </Link>
          <p>Programación Avanzada · 2024</p>
        </div>
        <div className="credits">
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="./tmdb.svg"
              width="100"
              height="14"
              alt="The Movie Database"
            />
          </a>
          <p>
            This product uses the TMDB API but is not endorsed or certified by
            TMDB.
          </p>
          {import.meta.env.VITE_REPO_URL && (
            <a href={import.meta.env.VITE_REPO_URL}>Código en GitHub ↗</a>
          )}
        </div>
      </footer>
    </>
  );
}
