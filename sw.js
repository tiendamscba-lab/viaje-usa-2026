/* Service worker del viaje BUE → NYC → MIA.
   Objetivo: que la app abra completa sin datos ni wifi.
   Subí VERSION cada vez que cambie index.html o los íconos. */
var VERSION   = 'v1';
var APP_CACHE = 'viaje2026-app-' + VERSION;
var FONT_CACHE= 'viaje2026-fonts-v1';

/* Todo lo propio: sin esto la app no abre offline. */
var PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(APP_CACHE).then(function(c){
      /* cache: 'reload' evita guardar una versión vieja del HTTP cache del navegador */
      return Promise.all(PRECACHE.map(function(u){
        return c.add(new Request(u, {cache:'reload'})).catch(function(){});
      }));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        if(k !== APP_CACHE && k !== FONT_CACHE) return caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('message', function(e){
  if(e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

function isFont(url){
  return url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
}

self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET') return;
  var url = new URL(req.url);

  /* Google Fonts: se guardan la primera vez que abrís la app con internet
     y de ahí en adelante salen del cache. Si nunca hubo conexión, caen a la
     tipografía del sistema y la app se ve igual de bien. */
  if(isFont(url)){
    e.respondWith(
      caches.open(FONT_CACHE).then(function(c){
        return c.match(req).then(function(hit){
          var net = fetch(req).then(function(res){
            if(res && (res.ok || res.type === 'opaque')) c.put(req, res.clone());
            return res;
          }).catch(function(){ return hit; });
          return hit || net;
        });
      })
    );
    return;
  }

  /* Cualquier otro dominio (Google Maps, links de tickets): directo a la red. */
  if(url.origin !== self.location.origin) return;

  /* Navegación: red primero para tomar cambios al vuelo, cache si no hay señal. */
  if(req.mode === 'navigate'){
    e.respondWith(
      fetch(req).then(function(res){
        var copy = res.clone();
        caches.open(APP_CACHE).then(function(c){ c.put('./index.html', copy); });
        return res;
      }).catch(function(){
        return caches.match('./index.html', {ignoreSearch:true}).then(function(hit){
          return hit || caches.match('./');
        });
      })
    );
    return;
  }

  /* Assets propios: cache primero, y se refresca en segundo plano. */
  e.respondWith(
    caches.match(req, {ignoreSearch:false}).then(function(hit){
      var net = fetch(req).then(function(res){
        if(res && res.ok){
          var copy = res.clone();
          caches.open(APP_CACHE).then(function(c){ c.put(req, copy); });
        }
        return res;
      }).catch(function(){ return hit; });
      return hit || net;
    })
  );
});
