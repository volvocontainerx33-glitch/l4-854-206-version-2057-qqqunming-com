(function() {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function() {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function() {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function() {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        showSlide(current + 1);
        startTimer();
      });
    }

    showSlide(0);
    startTimer();
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
  var clearButtons = Array.prototype.slice.call(document.querySelectorAll('[data-clear-search]'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-type-filter]'));
  var activeType = '';

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function filterCards() {
    var query = normalize(searchInputs.map(function(input) {
      return input.value;
    }).join(' '));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var visible = 0;

    cards.forEach(function(card) {
      var text = normalize(card.getAttribute('data-search'));
      var type = card.getAttribute('data-type') || '';
      var matchesQuery = !query || text.indexOf(query) !== -1;
      var matchesType = !activeType || type === activeType;
      var show = matchesQuery && matchesType;
      card.style.display = show ? '' : 'none';
      if (show) {
        visible += 1;
      }
    });

    Array.prototype.slice.call(document.querySelectorAll('[data-empty-state]')).forEach(function(emptyState) {
      emptyState.classList.toggle('is-visible', cards.length > 0 && visible === 0);
    });
  }

  searchInputs.forEach(function(input) {
    input.addEventListener('input', filterCards);
  });

  clearButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      searchInputs.forEach(function(input) {
        input.value = '';
      });
      filterCards();
    });
  });

  filterButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      activeType = button.getAttribute('data-type-filter') || '';
      filterButtons.forEach(function(item) {
        item.classList.toggle('active', item === button);
      });
      filterCards();
    });
  });

  filterCards();

  var video = document.getElementById('moviePlayer');
  var overlay = document.querySelector('.video-overlay');
  var playUrl = window.__PLAY_URL__;
  var playerLoaded = false;
  var hlsInstance = null;

  function loadPlayer() {
    if (!video || !playUrl || playerLoaded) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = playUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(playUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = playUrl;
    }

    playerLoaded = true;
  }

  function playVideo() {
    if (!video) {
      return;
    }

    loadPlayer();

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function() {});
    }
  }

  if (overlay) {
    overlay.addEventListener('click', playVideo);
  }

  if (video) {
    video.addEventListener('click', function() {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener('play', function() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    video.addEventListener('ended', function() {
      if (overlay) {
        overlay.classList.remove('is-hidden');
      }
    });
  }

  window.addEventListener('beforeunload', function() {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
