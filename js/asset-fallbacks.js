// Small runtime fallbacks for missing asset paths.
// If an <img> references assets/sprites/ships/*.png but that file doesn't exist,
// try assets/ships/*.png instead.

(function(){
  function tryReplaceImg(img) {
    try {
      const src = img.getAttribute('src') || img.src || '';
      if (!src) return;
      if (src.indexOf('/assets/sprites/ships/') === -1) return;

      const alt = src.replace('/assets/sprites/ships/', '/assets/ships/');

      // Quick HEAD check for the alternate path
      fetch(alt, { method: 'HEAD' }).then(resp => {
        if (resp.ok) {
          img.src = alt;
        }
      }).catch(() => {
        // ignore network errors
      });
    } catch (e) {
      // defensive
    }
  }

  function onDomReady() {
    // Replace existing images
    Array.from(document.images).forEach(img => tryReplaceImg(img));

    // Attach onerror handler for any future images that fail to load
    document.addEventListener('error', function(e){
      const target = e.target;
      if (target && target.tagName === 'IMG') {
        const src = target.getAttribute('src') || target.src || '';
        if (src.indexOf('/assets/sprites/ships/') !== -1 && !target._triedAlt) {
          target._triedAlt = true;
          const alt = src.replace('/assets/sprites/ships/', '/assets/ships/');
          target.src = alt;
        }
      }
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onDomReady);
  } else {
    onDomReady();
  }
})();
