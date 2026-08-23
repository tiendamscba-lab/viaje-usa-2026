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

## Buscador

El ícono de lupa en el header abre un buscador sobre los 160 lugares. Cruza nombre, barrio,
categoría y el texto de la recomendación, ignorando tildes y mayúsculas ("cafe" = "CAFÉ").
Cada resultado muestra en qué días del viaje cae esa zona: tocando el día se abre el detalle,
y el botón Volver regresa a la búsqueda sin perder lo que escribiste. Escape la cierra.

## IDs estables

Cada lugar tiene un `id` escrito en el archivo (`{id:'katzs-delicatessen', n:'Katz’s Delicatessen', …}`)
y cada día se referencia por su fecha ISO. El estado guardado en el celular usa esas dos claves:

```json
{ "v": 3, "added": { "2026-09-28": ["katzs-delicatessen", "joes-shanghai"] } }
```

Consecuencia práctica: se pueden **corregir nombres, reescribir textos, agregar lugares o reordenar
días** sin que nadie pierda lo que ya había marcado. Lo único que no hay que tocar es el `id` y la
`date` de cada día.

La versión anterior guardaba `{posicionDelDia: [nombre]}`. La app migra sola ese formato la primera
vez que abre, descartando lo que ya no exista, y **deja intacta la clave vieja** (`viajeUsa2026.added.v2`)
como red de seguridad.

## Links externos con la app instalada

Instalada en la pantalla de inicio, la app corre en su propia ventana sin barra del navegador.
Ahí los `<a target="_blank">` no tienen dónde abrirse y en iPhone directamente no hacen nada: por eso
las rutas de Google Maps no respondían. La app detecta ese modo y abre los links externos a mano
(`window.open`, y si devuelve `null` navega la ventana). Cualquier link nuevo a un dominio externo
queda cubierto automáticamente.

## Rutas fijas

Una ruta puede llevar `fixed:true` (traslados al aeropuerto, ida a un horario fijo). Los lugares que
el usuario suma a ese día **no** se cuelgan de esas rutas, para no arruinar un recorrido que tiene
que ser directo.

## Al editar los datos

Subí `VERSION` en `sw.js` (`'v1'` → `'v2'`) y volvé a publicar. La próxima vez que alguien abra la app con internet le aparece "Hay una versión nueva" con un botón para actualizar.

## Qué necesita internet

Solo los links que salen de la app: rutas de Google Maps, compra de entradas. El itinerario, los 160 lugares, ratings, tips y todo lo que agregues a cada día viven en el celular.
