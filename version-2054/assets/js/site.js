(function () {
    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    const navToggle = document.querySelector("[data-nav-toggle]");
    const navMenu = document.querySelector("[data-nav-menu]");

    if (navToggle && navMenu) {
        navToggle.addEventListener("click", function () {
            navMenu.classList.toggle("is-open");
            document.body.classList.toggle("nav-open", navMenu.classList.contains("is-open"));
        });
    }

    const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
    const thumbs = Array.from(document.querySelectorAll("[data-hero-thumb]"));
    const prev = document.querySelector("[data-hero-prev]");
    const next = document.querySelector("[data-hero-next]");
    let activeSlide = 0;
    let slideTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, current) {
            slide.classList.toggle("is-active", current === activeSlide);
        });
        thumbs.forEach(function (thumb, current) {
            thumb.classList.toggle("is-active", current === activeSlide);
        });
    }

    function startSlides() {
        if (slides.length < 2) {
            return;
        }
        clearInterval(slideTimer);
        slideTimer = setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5600);
    }

    thumbs.forEach(function (thumb, index) {
        thumb.addEventListener("click", function () {
            showSlide(index);
            startSlides();
        });
    });

    if (prev) {
        prev.addEventListener("click", function () {
            showSlide(activeSlide - 1);
            startSlides();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            showSlide(activeSlide + 1);
            startSlides();
        });
    }

    showSlide(0);
    startSlides();

    const filterInput = document.querySelector("[data-card-filter]");
    const filterCards = Array.from(document.querySelectorAll("[data-card]"));

    if (filterInput && filterCards.length) {
        filterInput.addEventListener("input", function () {
            const keyword = filterInput.value.trim().toLowerCase();
            filterCards.forEach(function (card) {
                const content = (card.getAttribute("data-search") || "").toLowerCase();
                card.hidden = keyword.length > 0 && !content.includes(keyword);
            });
        });
    }

    function renderSearchResults(input, panel) {
        const keyword = input.value.trim().toLowerCase();
        const index = Array.isArray(window.movieIndex) ? window.movieIndex : [];

        if (!keyword || !index.length) {
            panel.classList.remove("is-open");
            panel.innerHTML = "";
            return;
        }

        const results = index.filter(function (item) {
            const text = [item.title, item.region, item.year, item.genre, item.tags, item.category].join(" ").toLowerCase();
            return text.includes(keyword);
        }).slice(0, 10);

        if (!results.length) {
            panel.innerHTML = "<div class=\"search-result\"><span><strong>暂无匹配影片</strong><small>换个关键词试试</small></span></div>";
            panel.classList.add("is-open");
            return;
        }

        panel.innerHTML = results.map(function (item) {
            return "<a class=\"search-result\" href=\"" + escapeHtml(item.href) + "\">" +
                "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
                "<span><strong>" + escapeHtml(item.title) + "</strong><small>" + escapeHtml(item.year) + " · " + escapeHtml(item.region) + " · " + escapeHtml(item.category) + "</small></span>" +
                "</a>";
        }).join("");
        panel.classList.add("is-open");
    }

    document.querySelectorAll("[data-site-search]").forEach(function (input) {
        const form = input.closest("form");
        const panel = form ? form.querySelector("[data-search-results]") : null;

        if (!panel) {
            return;
        }

        input.addEventListener("input", function () {
            renderSearchResults(input, panel);
        });

        input.addEventListener("focus", function () {
            renderSearchResults(input, panel);
        });

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const first = panel.querySelector("a");
            if (first) {
                window.location.href = first.href;
            }
        });

        document.addEventListener("click", function (event) {
            if (!form.contains(event.target)) {
                panel.classList.remove("is-open");
            }
        });
    });
})();
