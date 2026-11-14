# Prueba con TMDB real · 14/11/2026

La cuenta del titular se activó con Google. El titular completó sus datos y la suscripción **Free Developer** en el sitio oficial. Se obtuvo el **API Read Access Token**, guardado en `.env` privado como `TMDB_TOKEN`. No se publica su valor.

## Consultas verificadas

`npm run probar:api` utiliza la misma función que se despliega en Netlify. Todas estas consultas devolvieron HTTP 200:

| Consulta | Resultado observado |
| --- | --- |
| `/movie/popular`, páginas 1 y 2 | 20 películas por página, primeras películas distintas |
| `/search/movie`, Batman, páginas 1 y 2 | 183 resultados informados por TMDB en esta comprobación |
| Búsqueda inexistente | Lista vacía |
| `/movie/272` | Batman Begins, título, póster, sinopsis, estreno y calificación presentes |
| `/movie/272/videos`, inglés | Tres trailers válidos de YouTube |

Los títulos, popularidad, puntuaciones y cantidades pueden cambiar en TMDB.

## Interfaz local

Se abrió la aplicación sin modo de práctica: populares con imágenes reales, búsqueda por Enter de Batman Begins, detalle completo y página separada con tres reproductores. Se inició el primer trailer dentro del iframe y se observó el tiempo transcurrido avanzar hasta 11 segundos.

## Código y credencial

Tres pruebas automáticas y compilación aprobadas. La revisión de los archivos preparados para Git y de `dist` no encontró el token real. La función sólo permite consultas de películas, valida parámetros y no devuelve detalles internos de errores. `.env` está ignorado por Git.

Repositorio: https://github.com/nicoetchegoyen/TPF-TMDB-React

El resultado del despliegue y la comprobación de producción se registrarán en `DESPLIEGUE.md`.
