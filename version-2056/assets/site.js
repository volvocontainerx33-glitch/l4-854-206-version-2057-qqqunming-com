(function () {
  const toggle = document.querySelector("[data-nav-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
    const slides = Array.from(slider.querySelectorAll(".hero-slide"));
    const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
    let index = 0;
    let timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("active", position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("active", position === index);
      });
    }

    function start() {
      if (timer || slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        const next = Number(dot.getAttribute("data-hero-dot"));
        show(next);
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
        start();
      });
    });

    show(0);
    start();
  });

  const panel = document.querySelector("[data-filter-panel]");
  if (!panel) {
    return;
  }

  const input = panel.querySelector("[data-search-input]");
  const selects = Array.from(panel.querySelectorAll("[data-filter-select]"));
  const cards = Array.from(document.querySelectorAll("[data-search-card]"));
  const empty = panel.querySelector("[data-empty-state]");
  const params = new URLSearchParams(window.location.search);

  if (input && params.get("q")) {
    input.value = params.get("q");
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function matchesSelect(card, select) {
    const value = normalize(select.value);
    if (!value) {
      return true;
    }
    const name = select.getAttribute("data-filter-name");
    return normalize(card.getAttribute("data-" + name)) === value;
  }

  function applyFilters() {
    const q = normalize(input ? input.value : "");
    let visible = 0;

    cards.forEach(function (card) {
      const text = normalize(card.getAttribute("data-keywords"));
      const title = normalize(card.getAttribute("data-title"));
      const textMatch = !q || text.indexOf(q) !== -1 || title.indexOf(q) !== -1;
      const selectMatch = selects.every(function (select) {
        return matchesSelect(card, select);
      });
      const show = textMatch && selectMatch;
      card.hidden = !show;
      if (show) {
        visible += 1;
      }
    });

    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  if (input) {
    input.addEventListener("input", applyFilters);
  }
  selects.forEach(function (select) {
    select.addEventListener("change", applyFilters);
  });
  applyFilters();
})();
