# TPF · Películas TMDB · Programación Avanzada 2024

SPA con React, JavaScript, React Router, `fetch` y CSS. La consigna de TMDB pide una SPA y no especifica un framework; se eligió React para reutilizar los conceptos de los TP previos. Vite sirve el proyecto y genera la versión de producción.

## Empezar a practicar

Con Node.js 22.12 o posterior, desde esta carpeta:

```powershell
npm install
npm run dev:demo
```

Abrir normalmente `http://127.0.0.1:5174/`. Se muestran películas inventadas y pósters SVG de práctica. El cartel identifica este modo. No se presentan datos ficticios como si fueran resultados de TMDB.

## Configurar TMDB real

1. Entrar a tu cuenta de [TMDB](https://www.themoviedb.org/) y abrir la sección API de la configuración, según la [guía oficial](https://developer.themoviedb.org/docs/getting-started). El registro y la aceptación de sus condiciones los realiza el titular.
2. Obtener **API Read Access Token**, no la clave API corta, ni la contraseña. Se envía como Bearer según [la documentación](https://developer.themoviedb.org/v4/docs/authentication-application).
3. Copiar `.env.example` como `.env`. Completar `TMDB_TOKEN` sin escribir `Bearer` y dejar `VITE_DEMO_MODE=false`. El token sólo lo lee Node en el servidor.
4. Ejecutar `npm run dev`; reiniciar después de modificar las variables.

`.env` está excluido de Git. El navegador consulta `/.netlify/functions/tmdb`; esa función agrega el encabezado `Authorization: Bearer ...` y consulta TMDB. El token no tiene prefijo `VITE_` y no se incorpora a los archivos de React. La función sólo admite GET de populares, búsqueda, ficha y videos; valida página, idioma y título. No modifica cuentas ni listas del usuario.

Para comprobar la API real sin imprimir el token: `npm run probar:api`. Verifica populares y búsqueda con dos páginas, búsqueda vacía, ficha y disponibilidad de trailers. La reproducción se comprueba por separado en el navegador.

## Requisitos, uno por uno

Fuente: `Trabajo Práctico SPA - TMDB.pdf`, dos páginas. Enumera cinco bloques y llama “Historia 6” al de trailers; no se inventó una historia faltante.

| Criterio de aceptación | Implementación | Verificación / pendiente |
| --- | --- | --- |
| Grilla de películas populares al inicio | `Inicio.jsx`, GET `/movie/popular` | API real: páginas 1 y 2, 20 resultados por página; interfaz real pendiente de comprobación |
| Tarjeta con póster y título | `Poster.jsx` y tarjetas con enlaces | Pósters reales presentes en la API; fallback si falta o falla la imagen |
| Grilla responsive | Grid CSS: 4, 3 o 2 columnas | Revisiones indicadas en `VERIFICACION.md` del directorio superior |
| Controles debajo de la grilla | `nav.pagination` | Probado |
| Anterior y Siguiente | Botones cambian `pagina` en URL | Probado |
| Página actual y total | Usa `page`/`total_pages` | Probado con populares, búsqueda y vacío |
| Deshabilitar límites | Anterior en 1, Siguiente en última, ambos sin resultados | Probado |
| Barra superior de búsqueda | Formulario arriba del catálogo | Probado |
| Buscar con Enter o botón | Ambos disparan `onSubmit` | Probado |
| Resultados reemplazan populares | GET `/search/movie?query=...` | API real: búsqueda Batman, páginas 1 y 2, HTTP 200 |
| Paginar búsqueda | Conserva `buscar` y cambia `pagina` | Probado; una búsqueda nueva reinicia a 1 |
| Clic abre detalle | Ruta `#/peliculas/:id` | Probado, incluida recarga directa |
| Título, póster, sinopsis, estreno y calificación | `Detalle.jsx`, GET `/movie/:id` | API real: Batman Begins incluye los cinco campos requeridos |
| Enlace para ver trailers | Ruta `#/peliculas/:id/trailers` | Probado |
| Página separada de trailers | `Detalle` con `mostrarTrailers` | Probado el estado sin videos; hay alternativa de inglés si no hay español |
| Reproducción por iframe YouTube | GET `/movie/:id/videos`, filtro YouTube/Trailer e iframe por video | API real: tres trailers de YouTube en inglés para Batman Begins; reproducción pendiente de navegador |

TMDB limita las consultas a la página 500 aunque informe más páginas. Se muestra el total que devuelve la API, se explica ese límite y no se permite consultar la 501. Una búsqueda sin resultados muestra “Página 0 de 0”.

La práctica no asocia un trailer real a una película inventada: muestra el estado vacío. No acredita la reproducción de trailers. Las pruebas del servicio simulan respuestas HTTP y no sustituyen comprobar la API real.

## Publicar en Netlify

Repositorio previsto: https://github.com/nicoetchegoyen/TPF-TMDB-React. La URL final se registra en `DESPLIEGUE.md` después de comprobar el sitio.

1. Importar el repositorio desde GitHub.
2. `netlify.toml` fija build `npm run build`, directorio `dist`, Node 24 y funciones en `netlify/functions`.
3. Agregar **TMDB_TOKEN** como variable secreta en Netlify, disponible para las funciones. No llamarla VITE_TMDB_TOKEN y no subir `.env`.
4. Publicar y comprobar populares, búsqueda, páginas, detalle, recarga directa y reproducción de un trailer.

Las rutas con `#` permiten recargar cualquier vista sin reglas de reescritura. El PDF no impone un servicio de despliegue; Nicolás eligió Netlify. El Classroom está archivado: publicar no equivale a entregar.

`npm run dev` sirve React y adapta la misma función de Netlify a Vite para practicar localmente. `npm run preview` sólo sirve los archivos estáticos: no ejecuta funciones. Para usar la API local, elegir `npm run dev`.

Verificaciones: `npm test`, `npm run build` y `npm run probar:api`. No subir `.env`, `node_modules` ni `dist`; incluir el lockfile.

## Archivos

- `main.jsx`: entrada, render de React y HashRouter.
- `App.jsx`: estructura, rutas, configuración inicial y créditos.
- `Inicio.jsx`: formulario, catálogo y paginación.
- `Detalle.jsx`: ficha de película y página de trailers.
- `Poster.jsx`: imagen con alternativa ante fallos.
- `api.js`: consulta a nuestra función y filtro de trailers.
- `netlify/functions/tmdb.mjs`: conexión con TMDB y token privado.
- `vite.config.js`: ejecuta la misma función durante el desarrollo local.
- `demo.js`: datos ficticios independientes de la API real.
- `styles.css`: presentación responsive.

El logo de TMDB se descargó de [su página oficial de atribución](https://www.themoviedb.org/about/logos-attribution), sin modificar su dibujo; el crédito requerido está incluido en el pie.
