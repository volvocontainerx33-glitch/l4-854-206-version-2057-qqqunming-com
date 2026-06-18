(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        menu.classList.toggle('hidden');
      });
    }

    initHero();
    initSearch();
    initFilters();
  });

  function initHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function show(next) {
      index = next;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
        slide.classList.toggle('opacity-100', i === index);
        slide.classList.toggle('opacity-0', i !== index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
        dot.classList.toggle('bg-sky-400', i === index);
        dot.classList.toggle('bg-gray-500', i !== index);
        dot.classList.toggle('w-8', i === index);
        dot.classList.toggle('w-2', i !== index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        show((index + 1) % slides.length);
      }, 5000);
    }
  }

  function initSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));

    inputs.forEach(function (input) {
      var area = input.closest('section') || document;
      var items = Array.prototype.slice.call(area.querySelectorAll('.js-filter-item'));
      var empty = area.querySelector('[data-empty-state]');
      var clear = area.querySelector('[data-clear-search]');

      function apply() {
        var term = input.value.trim().toLowerCase();
        var visible = 0;
        items.forEach(function (item) {
          var text = (item.getAttribute('data-keywords') || '').toLowerCase();
          var match = !term || text.indexOf(term) !== -1;
          item.classList.toggle('hidden', !match);
          if (match) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('hidden', visible !== 0);
        }
      }

      input.addEventListener('input', apply);
      if (clear) {
        clear.addEventListener('click', function () {
          input.value = '';
          apply();
          input.focus();
        });
      }
    });
  }

  function initFilters() {
    var chips = document.querySelector('[data-filter-chips]');

    if (!chips) {
      return;
    }

    var buttons = Array.prototype.slice.call(chips.querySelectorAll('[data-filter-value]'));
    var section = chips.closest('section') || document;
    var items = Array.prototype.slice.call(section.querySelectorAll('.js-filter-item'));

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var value = button.getAttribute('data-filter-value');
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        items.forEach(function (item) {
          var match = value === 'all' || item.getAttribute('data-category') === value;
          item.classList.toggle('hidden', !match);
        });
      });
    });
  }
})();

function initMoviePlayer(sourceUrl) {
  var shell = document.querySelector('[data-player]');
  var video = document.getElementById('movie-player');
  var cover = document.querySelector('[data-player-cover]');
  var hlsInstance = null;
  var started = false;

  if (!shell || !video || !sourceUrl) {
    return;
  }

  function loadHlsLibrary() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve();
        return;
      }
      var existing = document.querySelector('script[data-hls-loader]');
      if (existing) {
        existing.addEventListener('load', resolve);
        existing.addEventListener('error', reject);
        return;
      }
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js';
      script.async = true;
      script.setAttribute('data-hls-loader', 'true');
      script.addEventListener('load', resolve);
      script.addEventListener('error', reject);
      document.head.appendChild(script);
    });
  }

  function playVideo() {
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  function attachAndPlay() {
    shell.classList.add('is-playing');
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.src) {
        video.src = sourceUrl;
        video.load();
      }
      playVideo();
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (!hlsInstance) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
            hlsInstance = null;
          }
        });
      } else {
        playVideo();
      }
      return;
    }
    video.src = sourceUrl;
    video.load();
    playVideo();
  }

  function start() {
    if (started) {
      playVideo();
      return;
    }
    started = true;
    if (video.canPlayType('application/vnd.apple.mpegurl') || window.Hls) {
      attachAndPlay();
      return;
    }
    loadHlsLibrary().then(attachAndPlay).catch(function () {
      attachAndPlay();
    });
  }

  if (cover) {
    cover.addEventListener('click', start);
  }
  shell.addEventListener('click', function (event) {
    if (event.target === video && video.paused) {
      start();
    }
  });
}
