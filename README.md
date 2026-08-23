# Viaje BUE → NYC → MIA · 25 sep – 11 oct 2026

App de una sola página, sin dependencias ni build. **PWA instalable que funciona sin conexión.**

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | La app entera: estilos, datos (`places`, `trip`, `ideas`, `activities`, `tips`) y lógica |
| `manifest.json` | Nombre, íconos, colores y accesos directos de la app instalada |
| `sw.js` | Service worker: cachea todo para que abra sin datos ni wifi |
| `icons/` | Íconos 192, 512, maskable y apple-touch |
| `.nojekyll` | Le dice a GitHub Pages que sirva los archivos tal cual |

## Probar en la compu

```bash
python -m http.server 4173
```

Y abrir http://localhost:4173. **Tiene que ser por HTTP**: abrir el archivo con doble clic (`file://`) no registra el service worker.

## Publicar en GitHub Pages

```bash
git init && git add -A && git commit -m "App del viaje + PWA offline"
gh repo create viaje-usa-2026 --public --source=. --push
gh api -X POST repos/:owner/viaje-usa-2026/pages -f "source[branch]=main" -f "source[path]=/"
```

Queda en `https://<usuario>.github.io/viaje-usa-2026/`. Todas las rutas son relativas, así que funciona igual en una subcarpeta.

## Instalar en el celular

- **Android / Chrome**: aparece solo un cartel "Instalar". Si no, menú ⋮ → *Instalar aplicación*.
- **iPhone / Safari**: Compartir → *Agregar a pantalla de inicio*. (iOS no muestra cartel automático.)

Abrila **una vez con internet** antes de viajar: ahí el service worker guarda la app y las tipografías. Después abre sin señal.

## Al editar los datos

Subí `VERSION` en `sw.js` (`'v1'` → `'v2'`) y volvé a publicar. La próxima vez que alguien abra la app con internet le aparece "Hay una versión nueva" con un botón para actualizar.

## Qué necesita internet

Solo los links que salen de la app: rutas de Google Maps, compra de entradas. El itinerario, los 160 lugares, ratings, tips y todo lo que agregues a cada día viven en el celular.
