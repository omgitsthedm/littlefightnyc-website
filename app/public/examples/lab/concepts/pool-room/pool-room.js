(function () {
  'use strict';

  var canonical = document.querySelector('link[rel="canonical"]');
  var shareButton = document.querySelector('[data-share-pool-room]');
  var shareStatus = document.querySelector('[data-share-status]');
  var film = document.querySelector('[data-pool-room-film]');

  function setStatus(message) {
    if (shareStatus) shareStatus.textContent = message;
  }

  async function copyLink(url) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url);
      return;
    }

    var fallback = document.createElement('textarea');
    fallback.value = url;
    fallback.setAttribute('readonly', '');
    fallback.style.position = 'fixed';
    fallback.style.opacity = '0';
    document.body.appendChild(fallback);
    fallback.select();
    var copied = document.execCommand('copy');
    fallback.remove();
    if (!copied) throw new Error('Copy command was unavailable');
  }

  if (shareButton && canonical) {
    shareButton.hidden = false;
    shareButton.addEventListener('click', async function () {
      var shareData = {
        title: 'The Pool Room | Little Fight NYC',
        text: 'A New York dive bar built in Blender, then broken with real physics.',
        url: canonical.href
      };

      try {
        if (typeof navigator.share === 'function') {
          await navigator.share(shareData);
          setStatus('Share options opened.');
          return;
        }
        await copyLink(shareData.url);
        setStatus('Link copied.');
      } catch (error) {
        if (error && error.name === 'AbortError') return;
        try {
          await copyLink(shareData.url);
          setStatus('Link copied.');
        } catch (_copyError) {
          setStatus('Copy the page address from your browser.');
        }
      }
    });
  }

  document.addEventListener('lab:replay', function (event) {
    if (!film) return;
    event.preventDefault();
    film.currentTime = 0;
    var playback = film.play();
    if (playback && typeof playback.catch === 'function') {
      playback.catch(function () {
        film.focus();
      });
    }
  });
})();
