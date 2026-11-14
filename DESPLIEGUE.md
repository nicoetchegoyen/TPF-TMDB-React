# Despliegue en Netlify

Código: https://github.com/nicoetchegoyen/TPF-TMDB-React

Configuración versionada en `netlify.toml`:

- Rama: `main`.
- Build: `npm run build`.
- Publicación: `dist`.
- Funciones: `netlify/functions`.
- Node: 24.
- Modo de práctica: desactivado.
- `VITE_REPO_URL`: vínculo público a este repositorio.

La única credencial es **TMDB_TOKEN**. Se guarda como secreto en Netlify y sólo la lee la función `tmdb.mjs`. No usar un nombre que comience con `VITE_`: esas variables se incorporan al navegador. No subir el archivo `.env`.

## Cómo funciona

1. El usuario navega en React.
2. `api.js` consulta `/.netlify/functions/tmdb` con ruta y parámetros.
3. La función valida que sea una consulta GET permitida.
4. Agrega el token en `Authorization: Bearer ...` y consulta TMDB.
5. Devuelve JSON de películas, sin el token.

Los datos públicos pueden consultarse sin clave de canjes ni inicio de sesión del visitante: esta aplicación sólo lee películas y no modifica cuentas.

## Comprobar después de publicar

Abrir populares, pasar de página, buscar con Enter y botón, paginar búsqueda, abrir detalle, recargar su URL y reproducir un trailer. Verificar una búsqueda vacía y el enlace de GitHub en créditos.

Para repetir las consultas reales a la web publicada en PowerShell:

```powershell
$env:TMDB_SITE = 'https://tpf-tmdb-nicoetchegoyen.netlify.app/'
npm run probar:api
Remove-Item Env:TMDB_SITE
```

Para practicar con la API real en tu computadora: `npm run dev`. El comando `preview` sólo sirve archivos estáticos y no ejecuta la función.


## Publicado el 14/11/2026

URL: https://tpf-tmdb-nicoetchegoyen.netlify.app/

Netlify publicó el commit a59a06a con una función de servidor. TMDB_TOKEN se guardó como secreto con autorización del titular. Las consultas de producción devolvieron HTTP 200: populares y búsqueda en dos páginas, búsqueda vacía, ficha de Batman Begins y tres trailers. Se comprobaron navegación a página 2, búsqueda por Enter, detalle, recarga directa y página de trailers. Los archivos JS/CSS públicos no contienen el token real; las rutas ajenas devuelven 400 y POST devuelve 405.
