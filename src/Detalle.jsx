import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { consultar, obtenerTrailers } from "./api.js";
import Poster from "./Poster.jsx";

export default function Detalle({ mostrarTrailers = false }) {
  const { id } = useParams();
  const ubicacion = useLocation();
  const volver = ubicacion.state?.volver || "/";
  const [pelicula, setPelicula] = useState(null);
  const [trailers, setTrailers] = useState([]);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);
  useEffect(() => {
    const controlador = new AbortController();
    setPelicula(null);
    setError("");
    setTrailers([]);
    async function cargar() {
      try {
        if (!/^\d+$/.test(id)) throw new Error("Película no encontrada.");
        const ficha = await consultar(`/movie/${id}`, {}, controlador.signal);
        let videos = [];
        if (mostrarTrailers) {
          const respuesta = await consultar(
            `/movie/${id}/videos`,
            {},
            controlador.signal,
          );
          videos = obtenerTrailers(respuesta.results);
          // Si no hay trailers en español, consultamos también los de inglés.
          if (!videos.length) {
            const alternativos = await consultar(
              `/movie/${id}/videos`,
              { language: "en-US" },
              controlador.signal,
            );
            videos = obtenerTrailers(alternativos.results);
          }
        }
        if (!controlador.signal.aborted) {
          setPelicula(ficha);
          setTrailers(videos);
        }
      } catch (error) {
        if (!controlador.signal.aborted) setError(error.message);
      }
    }
    cargar();
    return () => controlador.abort();
  }, [id, mostrarTrailers, intento]);
  useEffect(() => {
    if (pelicula)
      document.title = `${mostrarTrailers ? "Trailers · " : ""}${pelicula.title} · Plano`;
  }, [pelicula, mostrarTrailers]);
  if (error)
    return (
      <section className="notice" role="alert">
        <h1>No pudimos cargar esta película</h1>
        <p>{error}</p>
        <button onClick={() => setIntento(intento + 1)}>Reintentar</button>{" "}
        <Link to={volver}>Volver al listado</Link>
      </section>
    );
  if (!pelicula)
    return (
      <p className="notice" role="status">
        Cargando {mostrarTrailers ? "trailers" : "película"}…
      </p>
    );
  const fecha = pelicula.release_date
    ? new Date(`${pelicula.release_date}T12:00:00`).toLocaleDateString("es-AR")
    : "No disponible";
  if (mostrarTrailers)
    return (
      <section>
        <Link className="back" to={`/peliculas/${id}`} state={{ volver }}>
          ← Volver al detalle
        </Link>
        <p className="eyebrow">UNA PRIMERA MIRADA</p>
        <h1 className="page-title">Trailers de {pelicula.title}</h1>
        {trailers.length ? (
          <div className="trailers">
            {trailers.map((video) => (
              <article key={video.id || video.key}>
                <h2>{video.name}</h2>
                <iframe
                  src={`https://www.youtube.com/embed/${video.key}`}
                  title={`Trailer: ${video.name}`}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
                <a
                  className="text-link"
                  href={`https://www.youtube.com/watch?v=${video.key}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir en YouTube ↗
                </a>
              </article>
            ))}
          </div>
        ) : (
          <p className="notice">
            No hay trailers de YouTube disponibles en español ni en inglés para
            esta película.
          </p>
        )}
      </section>
    );
  return (
    <section>
      <Link className="back" to={volver}>
        ← Volver al listado
      </Link>
      <div className="movie-detail">
        <Poster pelicula={pelicula} grande />
        <div>
          <p className="eyebrow">LA HISTORIA DETRÁS DE LA IMAGEN</p>
          <h1 className="page-title">{pelicula.title}</h1>
          <dl>
            <div>
              <dt>Estreno</dt>
              <dd>{fecha}</dd>
            </div>
            <div>
              <dt>Calificación</dt>
              <dd>
                {pelicula.vote_count > 0
                  ? `${pelicula.vote_average.toFixed(1)} / 10`
                  : "Sin calificaciones"}
              </dd>
            </div>
          </dl>
          <h2>Sinopsis</h2>
          <p className="synopsis">
            {pelicula.overview || "No hay sinopsis disponible en este idioma."}
          </p>
          <Link
            className="button"
            to={`/peliculas/${id}/trailers`}
            state={{ volver }}
          >
            Ver trailers <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
