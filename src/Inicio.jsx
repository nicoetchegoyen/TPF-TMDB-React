import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { consultar } from "./api.js";
import Poster from "./Poster.jsx";

export default function Inicio() {
  const [parametros, setParametros] = useSearchParams();
  const busqueda = (parametros.get("buscar") || "").trim();
  const numero = Number(parametros.get("pagina") || 1);
  // TMDB sólo admite páginas entre 1 y 500. La URL también es una entrada del usuario.
  const pagina = Number.isInteger(numero)
    ? Math.max(1, Math.min(500, numero))
    : 1;
  const [texto, setTexto] = useState(busqueda);
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);
  useEffect(() => setTexto(busqueda), [busqueda]);
  useEffect(() => {
    const controlador = new AbortController();
    setDatos(null);
    setError("");
    const ruta = busqueda ? "/search/movie" : "/movie/popular";
    const consulta = {
      page: pagina,
      ...(busqueda ? { query: busqueda, include_adult: false } : {}),
    };
    consultar(ruta, consulta, controlador.signal)
      .then((resultado) => {
        if (controlador.signal.aborted) return;
        const limite = Math.min(500, resultado.total_pages);
        if (limite > 0 && pagina > limite) {
          setParametros(
            {
              ...(busqueda ? { buscar: busqueda } : {}),
              pagina: String(limite),
            },
            { replace: true },
          );
        } else setDatos(resultado);
      })
      .catch((error) => {
        if (!controlador.signal.aborted) setError(error.message);
      });
    // Cancela la solicitud anterior al cambiar de búsqueda, página o vista.
    return () => controlador.abort();
  }, [busqueda, pagina, intento, setParametros]);

  function buscar(evento) {
    evento.preventDefault();
    // Una búsqueda nueva siempre empieza en la página 1.
    setParametros(texto.trim() ? { buscar: texto.trim(), pagina: "1" } : {});
  }
  function cambiarPagina(nueva) {
    setParametros({
      ...(busqueda ? { buscar: busqueda } : {}),
      pagina: String(nueva),
    });
  }
  const paginasDisponibles = datos ? Math.min(500, datos.total_pages) : 0;
  return (
    <>
      <section className="intro">
        <p className="eyebrow">UN BUEN PLAN EMPIEZA CON UNA PELÍCULA</p>
        <h1>
          La próxima historia
          <br />
          <em>te espera acá.</em>
        </h1>
        <p>Explorá lo más popular o buscá esa película que tenés en mente.</p>
        <form className="search" role="search" onSubmit={buscar}>
          <label className="sr-only" htmlFor="buscar">
            Buscar películas por título
          </label>
          <input
            id="buscar"
            type="search"
            placeholder="Buscá una película por su título…"
            value={texto}
            onChange={(evento) => setTexto(evento.target.value)}
          />
          <button type="submit">
            Buscar <span aria-hidden="true">↗</span>
          </button>
        </form>
      </section>
      <section aria-labelledby="list-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">EXPLORÁ EL CATÁLOGO</p>
            <h2 id="list-title">
              {busqueda
                ? `Resultados para “${busqueda}”`
                : "Películas populares"}
            </h2>
          </div>
          {busqueda && (
            <Link className="text-link" to="/">
              Ver populares
            </Link>
          )}
        </div>
        {error ? (
          <div className="notice" role="alert">
            <h3>No pudimos cargar las películas</h3>
            <p>{error}</p>
            <button onClick={() => setIntento(intento + 1)}>Reintentar</button>
          </div>
        ) : !datos ? (
          <p className="notice" role="status">
            Cargando películas…
          </p>
        ) : (
          <>
            {datos.results.length ? (
              <div className="movie-grid">
                {datos.results.map((pelicula) => (
                  <article className="movie-card" key={pelicula.id}>
                    <Link
                      to={`/peliculas/${pelicula.id}`}
                      state={{ volver: `/?${parametros.toString()}` }}
                    >
                      <Poster pelicula={pelicula} />
                      <div className="movie-caption">
                        <h3>{pelicula.title}</h3>
                        <span aria-label="Año de estreno">
                          {pelicula.release_date?.slice(0, 4) || "Sin fecha"}
                        </span>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <div className="notice">
                <h3>No encontramos películas</h3>
                <p>Probá con otro título o volvé al listado de populares.</p>
              </div>
            )}
            <nav className="pagination" aria-label="Páginas de películas">
              <button
                className="secondary"
                disabled={pagina <= 1 || !datos.results.length}
                onClick={() => cambiarPagina(pagina - 1)}
              >
                Anterior
              </button>
              <span aria-live="polite">
                {/* TMDB puede informar una página aunque la búsqueda esté vacía. */}
                Página {datos.results.length ? pagina : 0} de {datos.results.length ? datos.total_pages : 0}
              </span>
              <button
                className="secondary"
                disabled={pagina >= paginasDisponibles || !datos.results.length}
                onClick={() => cambiarPagina(pagina + 1)}
              >
                Siguiente
              </button>
            </nav>
            {datos.total_pages > 500 && (
              <p className="muted pagination-note">
                TMDB informa {datos.total_pages} páginas, pero su API permite
                consultar hasta la 500.
              </p>
            )}
          </>
        )}
      </section>
    </>
  );
}
