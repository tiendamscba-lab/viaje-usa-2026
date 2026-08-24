
/* ===== PWA: registro del service worker, estado de conexión e instalación ===== */
(function(){
  var bar = document.getElementById('pwaBar');
  var msg = document.getElementById('pwaMsg');
  var act = document.getElementById('pwaAct');
  var chip = document.getElementById('netChip');
  var onAct = null;

  function showBar(text, label, fn){
    msg.textContent = text; act.textContent = label; onAct = fn; bar.classList.add('show');
  }
  function hideBar(){ bar.classList.remove('show'); onAct = null; }
  act.addEventListener('click', function(){ var f = onAct; hideBar(); if(f) f(); });
  document.getElementById('pwaDismiss').addEventListener('click', hideBar);

  // Instalada en la pantalla de inicio, la app corre en su propia ventana sin
  // barra del navegador. Ahi los <a target="_blank"> no tienen donde abrirse y
  // en iPhone directamente no hacen nada: es por eso que las rutas de Google
  // Maps y los links de entradas no respondian. Los abrimos a mano.
  var STANDALONE = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
                   window.navigator.standalone === true;
  if(STANDALONE){
    document.addEventListener('click', function(ev){
      var a = ev.target.closest('a[href]');
      if(!a) return;
      var href = a.getAttribute('href') || '';
      if(!/^https?:/i.test(href)) return;
      var externo = true;
      try{ externo = new URL(a.href).origin !== location.origin; }catch(err){}
      if(!externo) return;
      ev.preventDefault();
      var w = null;
      try{ w = window.open(a.href, '_blank'); }catch(err){}
      if(!w) window.location.href = a.href;   // iPhone: window.open devuelve null
    });
  }

  function paintNet(){ chip.classList.toggle('show', !navigator.onLine); }
  window.addEventListener('online', paintNet);
  window.addEventListener('offline', paintNet);
  paintNet();

  /* Instalar en la pantalla de inicio (Android/Chrome; en iPhone es Compartir → Agregar a inicio) */
  window.addEventListener('beforeinstallprompt', function(e){
    e.preventDefault();
    var dismissed = false;
    try{ dismissed = localStorage.getItem('viajeUsa2026.installDismissed') === '1'; }catch(err){}
    if(dismissed) return;
    showBar('Instalala en el celular para usarla sin datos.', 'Instalar', function(){
      e.prompt();
      try{ localStorage.setItem('viajeUsa2026.installDismissed','1'); }catch(err){}
    });
  });
  document.getElementById('pwaDismiss').addEventListener('click', function(){
    try{ localStorage.setItem('viajeUsa2026.installDismissed','1'); }catch(err){}
  });

  if(!('serviceWorker' in navigator)) return;
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('sw.js').then(function(reg){
      function watch(sw){
        if(!sw) return;
        sw.addEventListener('statechange', function(){
          if(sw.state === 'installed' && navigator.serviceWorker.controller){
            showBar('Hay una versión nueva del itinerario.', 'Actualizar', function(){
              sw.postMessage({type:'SKIP_WAITING'});
            });
          }
        });
      }
      if(reg.waiting && navigator.serviceWorker.controller){
        showBar('Hay una versión nueva del itinerario.', 'Actualizar', function(){
          reg.waiting.postMessage({type:'SKIP_WAITING'});
        });
      }
      reg.addEventListener('updatefound', function(){ watch(reg.installing); });
      document.addEventListener('visibilitychange', function(){
        // navigator.onLine miente con el wifi de hoteles y aeropuertos (portal
        // cautivo: hay red pero no internet), asi que la promesa puede fallar.
        if(!document.hidden && navigator.onLine){
          try{ var u = reg.update(); if(u && u.catch) u.catch(function(){}); }catch(err){}
        }
      });
    }).catch(function(){});

    var reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', function(){
      if(reloading) return; reloading = true; location.reload();
    });
  });
})();
