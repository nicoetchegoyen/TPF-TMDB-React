// Películas inventadas para practicar: no son resultados reales de TMDB.
// Los pósters se dibujan con SVG local; no requieren descargar imágenes.
const titulos = [
  "La última función",
  "Un verano en órbita",
  "El mapa del silencio",
  "Después de la lluvia",
  "Un lugar para volver",
  "La ciudad de papel",
  "A través del tiempo",
  "Los días azules",
  "El viaje pendiente",
  "La luz del sur",
  "Memorias del mañana",
  "El otro lado",
];
const colores = ["#a85036", "#37696d", "#777443", "#66536f"];
export const peliculasDemo = titulos.map((title, indice) => {
  const color = colores[indice % colores.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"><rect width="400" height="600" fill="${color}"/><circle cx="285" cy="160" r="120" fill="#f0ddad" opacity=".5"/><path d="M0 470L160 250L400 550V600H0Z" fill="#18252d" opacity=".7"/><text x="30" y="70" font-family="sans-serif" font-size="18" letter-spacing="6" fill="white">PLANO / PRÁCTICA</text><text x="30" y="540" font-family="serif" font-size="100" fill="#f9f0dc">${String(indice + 1).padStart(2, "0")}</text></svg>`;
  return {
    id: indice + 1,
    title,
    poster_path: null,
    posterDemo: `data:image/svg+xml,${encodeURIComponent(svg)}`,
    overview:
      "Esta sinopsis es ficticia y se usa para estudiar cómo React muestra los datos de una película. Configurá un token para consultar el catálogo real de TMDB.",
    release_date: "2024-10-10",
    vote_average: 6 + indice / 10,
    vote_count: 120,
  };
});

export async function consultarDemo(ruta, parametros) {
  if (ruta === "/movie/popular" || ruta === "/search/movie") {
    const pagina = Number(parametros.page || 1);
    const busqueda = (parametros.query || "").toLocaleLowerCase("es");
    const resultados = peliculasDemo.filter(
      (item) =>
        ruta !== "/search/movie" ||
        item.title.toLocaleLowerCase("es").includes(busqueda),
    );
    return {
      page: pagina,
      results: resultados.slice((pagina - 1) * 4, pagina * 4),
      total_pages: Math.ceil(resultados.length / 4),
      total_results: resultados.length,
    };
  }
  const id = Number(ruta.split("/")[2]);
  const pelicula = peliculasDemo.find((item) => item.id === id);
  if (!pelicula) throw new Error("Película no encontrada.");
  // La demo no atribuye trailers ajenos a películas inventadas.
  if (ruta.endsWith("/videos")) return { results: [] };
  return pelicula;
}
