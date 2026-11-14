import { useEffect, useState } from "react";

export default function Poster({ pelicula, grande = false }) {
  const [fallo, setFallo] = useState(false);
  const imagen =
    pelicula.posterDemo ||
    (pelicula.poster_path
      ? `https://image.tmdb.org/t/p/${grande ? "w500" : "w342"}${pelicula.poster_path}`
      : null);
  useEffect(() => setFallo(false), [imagen]);
  if (!imagen || fallo)
    return (
      <div
        className="poster no-poster"
        role="img"
        aria-label={`Sin póster disponible para ${pelicula.title}`}
      >
        <span>PLANO</span>
        <p>Sin póster disponible</p>
      </div>
    );
  return (
    <img
      className="poster"
      src={imagen}
      alt={`Póster de ${pelicula.title}`}
      width="342"
      height="513"
      loading={grande ? "eager" : "lazy"}
      onError={() => setFallo(true)}
    />
  );
}
