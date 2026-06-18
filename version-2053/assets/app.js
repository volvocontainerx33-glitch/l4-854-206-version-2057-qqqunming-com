(function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var sliders = document.querySelectorAll('[data-hero-slider]');
  sliders.forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-slide-dot]'));
    if (!slides.length) return;
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    show(0);
    setInterval(function () {
      show(index + 1);
    }, 5200);
  });

  var searchRoot = document.querySelector('[data-search-root]');
  if (searchRoot) {
    var input = searchRoot.querySelector('[data-search-input]');
    var select = searchRoot.querySelector('[data-search-type]');
    var cards = Array.prototype.slice.call(searchRoot.querySelectorAll('[data-movie-card]'));
    var noResults = searchRoot.querySelector('[data-no-results]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input) input.value = initial;
    function filter() {
      var q = (input && input.value ? input.value : '').trim().toLowerCase();
      var type = select && select.value ? select.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-region')).toLowerCase();
        var cardType = card.getAttribute('data-type') || '';
        var ok = (!q || text.indexOf(q) !== -1) && (!type || cardType === type);
        card.style.display = ok ? '' : 'none';
        if (ok) visible += 1;
      });
      if (noResults) noResults.style.display = visible ? 'none' : 'block';
    }
    if (input) input.addEventListener('input', filter);
    if (select) select.addEventListener('change', filter);
    filter();
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
    script.onload = callback;
    document.head.appendChild(script);
  }

  var players = document.querySelectorAll('[data-player]');
  players.forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    if (!video) return;
    var stream = video.getAttribute('data-stream');
    var started = false;
    function start() {
      if (!stream) return;
      if (button) button.hidden = true;
      if (started) {
        video.play().catch(function () {});
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.play().catch(function () {});
      } else {
        loadHls(function () {
          if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true });
            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
          } else {
            video.src = stream;
            video.play().catch(function () {});
          }
        });
      }
    }
    if (button) button.addEventListener('click', start);
    player.addEventListener('click', function (event) {
      if (event.target.closest('[data-play-button]')) return;
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });
  });
})();
