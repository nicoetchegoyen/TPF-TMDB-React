# Cómo defender TMDB

## Explicación de un minuto

“Construí una SPA para descubrir películas. El inicio consulta populares a TMDB y muestra tarjetas con título y póster. El formulario busca por título al enviarlo con Enter o con el botón. La búsqueda y la página quedan en la URL, así puedo navegar y volver al mismo listado. Una tarjeta abre el detalle con los campos pedidos. Desde ahí hay una página de trailers que consulta videos y muestra sólo trailers de YouTube en iframes. También contemplé carga, error, resultados vacíos y películas sin imagen.”

## Flujo para seguir en el editor

1. `main.jsx` monta `App` y el router.
2. `App.jsx` define `/`, `/peliculas/:id` y `/peliculas/:id/trailers`.
3. `Inicio.jsx` lee búsqueda y página de `useSearchParams`.
4. Su `useEffect` decide entre `/movie/popular` y `/search/movie`. Los resultados se guardan en el estado con `setDatos`.
5. Un `map` genera una tarjeta por película. `Poster` muestra la imagen o una alternativa.
6. El formulario usa `preventDefault`: cambia los parámetros sin recargar el documento. Una búsqueda nueva vuelve a la página 1.
7. `Detalle` obtiene el ID con `useParams`, consulta la ficha y muestra título, póster, sinopsis, fecha y calificación.
8. La ruta de trailers usa el mismo componente con una prop. Consulta `/videos`, filtra y genera iframes.

## Preguntas esperables

**¿Por qué separar texto y búsqueda?** `texto` es lo que escribo. `busqueda` es lo ya enviado y está en la URL. Escribir no hace una solicitud por cada tecla: se busca al enviar el formulario, como pide la consigna.

**¿Por qué la página está en la URL?** Permite compartir o recargar una búsqueda y usar Atrás/Adelante del navegador. El enlace de regreso al listado conserva búsqueda y página.

**¿Qué es un input controlado?** Su `value` viene del estado y `onChange` lo actualiza. React conoce el texto del campo.

**¿Qué hace useEffect y su lista de dependencias?** Ejecuta la consulta cuando cambia búsqueda, página o intento de recarga. El cleanup cancela la anterior para evitar mostrar resultados viejos.

**¿Qué hace AbortController?** Su `signal` permite cancelar `fetch`. También se consulta `signal.aborted` antes de aplicar una respuesta. Una cancelación al abandonar la vista no se muestra como error al usuario.

**¿Cómo se pagina la API?** Se envía `page`. La respuesta informa resultados y total de páginas. No se descarga todo para cortarlo en el frontend. TMDB sólo acepta hasta 500 aunque informe más.

**¿Cómo se codifica un título con espacios o &?** `URLSearchParams` construye los parámetros escapados correctamente.

**¿Qué diferencia hay entre map y filter?** `map` transforma una colección; acá genera tarjetas. `filter` conserva elementos que cumplen una condición; acá selecciona trailers de YouTube.

**¿Por qué no usar cualquier video?** La API también puede traer clips y otros sitios. La consigna pide trailers de YouTube, por eso se comprueban `site`, `type` y el formato de `key` antes de armar el iframe.

**¿Qué es un iframe?** Un documento embebido dentro de la página. YouTube sirve el reproductor; la app sólo construye la URL con el ID recibido. `title` lo identifica y `allowFullScreen` habilita pantalla completa.

**¿Qué pasa si no hay trailer en español?** Se busca en inglés. Si tampoco existe, se informa. La práctica usa películas inventadas, así que no les atribuye trailers reales.

**¿Por qué revisar respuesta.ok?** Un error HTTP sigue siendo una respuesta de `fetch`. Se transforma en un error claro para la interfaz. `try/catch` también contempla fallos de conexión.

**¿Qué es una ruta dinámica?** `:id` es una parte variable de la URL. Un único componente muestra películas distintas según ese valor.

**¿Dónde están los datos y el token?** Los datos reales vienen de TMDB. React llama a nuestra función de Netlify; esa función lee `TMDB_TOKEN`, agrega el encabezado Bearer y consulta TMDB. En desarrollo la variable está en `.env`, ignorado por Git; en producción está en Netlify. El navegador nunca recibe ese token.

**¿Por qué hay una función de servidor si es una SPA?** La navegación y las pantallas siguen en React. La función es un intermediario pequeño para guardar la credencial fuera del navegador. Sólo admite consultas GET y las cuatro clases de rutas que usa este TP.

**¿Qué hace URLSearchParams?** Codifica los parámetros, por ejemplo un título con espacios o ampersand. En el servidor reconstruimos sólo parámetros conocidos: no aceptamos una URL externa que pudiera recibir nuestro token.

## Ensayo con datos reales

1. Mostrar populares: tarjetas con título y póster. Pasar a página 2 y volver.
2. Buscar “Batman” con Enter. La búsqueda nueva empieza en página 1.
3. Pasar a la página 2 de resultados: la URL conserva buscar=Batman.
4. Buscar “Batman Begins” con el botón y abrir la película de 2005.
5. Explicar título, póster, sinopsis, estreno y calificación. Los datos se consultan a TMDB, no están escritos en el componente.
6. Abrir “Ver trailers”. Reproducir un video: es un iframe de YouTube. Si no hay trailers en español, se consulta inglés.
7. Volver al detalle y al listado. Se conserva la búsqueda y la página desde la que se abrió.
8. Buscar “zzzxqvpeliculainexistentetp2024”: aparece el estado vacío y ambos botones deshabilitados.
9. Mostrar Créditos: logo de TMDB, atribución y enlace al repositorio.

## Qué estudiar primero

- `Inicio.jsx`: estado, formulario, useEffect, map y paginación.
- `api.js` y `netlify/functions/tmdb.mjs`: fetch, GET, JSON, errores y token privado.
- `App.jsx` y `Detalle.jsx`: rutas, useParams y trailer en iframe.

Recorrido de una solicitud: **clic o formulario → estado/URL → useEffect → api.js → función de Netlify → API TMDB → JSON → setEstado → pantalla**.

Las pruebas automáticas simulan HTTP; `npm run probar:api` consulta datos reales. Una respuesta de videos correcta no demuestra por sí sola que YouTube pueda reproducirse: hay que comprobarlo en la página publicada.
