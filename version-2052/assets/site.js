(function () {
  var hlsScriptPromise = null;

  function getQuery(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var active = 0;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });
    window.setInterval(function () {
      show(active + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var search = panel.querySelector("[data-filter-search]");
      var category = panel.querySelector("[data-filter-category]");
      var type = panel.querySelector("[data-filter-type]");
      var list = panel.parentElement.querySelector("[data-card-list]");
      var empty = panel.querySelector("[data-empty-state]");
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
      if (search && getQuery("q")) {
        search.value = getQuery("q");
      }
      function apply() {
        var keyword = normalize(search ? search.value : "");
        var selectedCategory = normalize(category ? category.value : "");
        var selectedType = normalize(type ? type.value : "");
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var cardCategory = normalize(card.getAttribute("data-category"));
          var cardType = normalize(card.getAttribute("data-type"));
          var keywordOk = !keyword || text.indexOf(keyword) !== -1;
          var categoryOk = !selectedCategory || cardCategory === selectedCategory;
          var typeOk = !selectedType || cardType.indexOf(selectedType) !== -1;
          var isVisible = keywordOk && categoryOk && typeOk;
          card.classList.toggle("is-hidden-by-filter", !isVisible);
          if (isVisible) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }
      [search, category, type].forEach(function (field) {
        if (field) {
          field.addEventListener("input", apply);
          field.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function loadHlsScript() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsScriptPromise) {
      return hlsScriptPromise;
    }
    hlsScriptPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return hlsScriptPromise;
  }

  function setupPlayer() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var layer = player.querySelector(".player-layer");
      var source = player.getAttribute("data-source");
      var started = false;
      if (!video || !source) {
        return;
      }
      function hideLayer() {
        if (layer) {
          layer.classList.add("is-hidden");
        }
      }
      function nativePlay() {
        video.src = source;
        video.play().catch(function () {});
      }
      function start() {
        if (started) {
          video.play().catch(function () {});
          return;
        }
        started = true;
        hideLayer();
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          nativePlay();
          return;
        }
        loadHlsScript().then(function (Hls) {
          if (Hls && Hls.isSupported()) {
            var hls = new Hls({
              enableWorker: true,
              lowLatencyMode: false
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
          } else {
            nativePlay();
          }
        }).catch(function () {
          nativePlay();
        });
      }
      if (layer) {
        layer.addEventListener("click", start);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
