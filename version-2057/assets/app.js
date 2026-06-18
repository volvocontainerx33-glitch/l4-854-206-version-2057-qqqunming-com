(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function initFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));
    forms.forEach(function (form) {
      var selector = form.getAttribute('data-filter-target');
      var target = selector ? document.querySelector(selector) : null;
      if (!target) {
        return;
      }
      var input = form.querySelector('[data-search-input]');
      var chips = Array.prototype.slice.call(form.querySelectorAll('[data-filter-chip]'));
      var cards = Array.prototype.slice.call(target.querySelectorAll('[data-card]'));
      var activeChip = 'all';

      function normalize(text) {
        return (text || '').toString().trim().toLowerCase();
      }

      function apply() {
        var query = normalize(input ? input.value : '');
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute('data-text') || card.textContent);
          var year = normalize(card.getAttribute('data-year'));
          var type = normalize(card.getAttribute('data-type'));
          var chipMatch = activeChip === 'all' || year.indexOf(activeChip) > -1 || type.indexOf(activeChip) > -1 || haystack.indexOf(activeChip) > -1;
          var queryMatch = !query || haystack.indexOf(query) > -1;
          card.classList.toggle('is-hidden', !(chipMatch && queryMatch));
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }

      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          activeChip = normalize(chip.getAttribute('data-filter-chip') || 'all');
          chips.forEach(function (item) {
            item.classList.toggle('active', item === chip);
          });
          apply();
        });
      });
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (frame) {
      var video = frame.querySelector('video');
      var button = frame.querySelector('[data-player-start]');
      var src = frame.getAttribute('data-hls');
      var prepared = false;
      var hlsInstance = null;

      if (!video || !button || !src) {
        return;
      }

      function prepare() {
        if (prepared) {
          return;
        }
        prepared = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
          return;
        }
        video.src = src;
      }

      function startPlayback() {
        prepare();
        button.classList.add('is-hidden');
        video.setAttribute('controls', 'controls');
        var playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch(function () {
            button.classList.remove('is-hidden');
          });
        }
      }

      button.addEventListener('click', startPlayback);
      frame.addEventListener('click', function (event) {
        if (event.target === video && video.paused) {
          startPlayback();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  }
})();
