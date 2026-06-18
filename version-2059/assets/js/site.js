(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var activeIndex = 0;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            activeIndex = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, index) {
                slide.classList.toggle('is-active', index === activeIndex);
            });

            dots.forEach(function (dot, index) {
                dot.classList.toggle('is-active', index === activeIndex);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5200);
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initCardFilters(scope) {
        var textInput = scope.querySelector('[data-filter-text]');
        var yearSelect = scope.querySelector('[data-filter-year]');
        var regionSelect = scope.querySelector('[data-filter-region]');
        var typeSelect = scope.querySelector('[data-filter-type]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));

        function applyFilter() {
            var text = normalize(textInput && textInput.value);
            var year = normalize(yearSelect && yearSelect.value);
            var region = normalize(regionSelect && regionSelect.value);
            var type = normalize(typeSelect && typeSelect.value);

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));

                var matched = true;

                if (text && haystack.indexOf(text) === -1) {
                    matched = false;
                }

                if (year && normalize(card.getAttribute('data-year')) !== year) {
                    matched = false;
                }

                if (region && normalize(card.getAttribute('data-region')) !== region) {
                    matched = false;
                }

                if (type && normalize(card.getAttribute('data-type')) !== type) {
                    matched = false;
                }

                card.classList.toggle('is-hidden-card', !matched);
            });
        }

        [textInput, yearSelect, regionSelect, typeSelect].forEach(function (field) {
            if (field) {
                field.addEventListener('input', applyFilter);
                field.addEventListener('change', applyFilter);
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(initCardFilters);

    var globalSearch = document.querySelector('[data-global-search]');
    var globalResults = document.querySelector('[data-global-results]');

    if (globalSearch && globalResults && window.SEARCH_MOVIES) {
        function renderSearch() {
            var query = normalize(globalSearch.value);
            globalResults.innerHTML = '';

            if (!query) {
                globalResults.classList.remove('is-open');
                return;
            }

            var results = window.SEARCH_MOVIES.filter(function (item) {
                return normalize(item.title + ' ' + item.region + ' ' + item.type + ' ' + item.year + ' ' + item.genre + ' ' + item.tags).indexOf(query) !== -1;
            }).slice(0, 12);

            results.forEach(function (item) {
                var link = document.createElement('a');
                link.className = 'search-item';
                link.href = item.url;
                link.innerHTML = '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '"><span><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.region + ' · ' + item.type + '</span></span>';
                globalResults.appendChild(link);
            });

            globalResults.classList.toggle('is-open', results.length > 0);
        }

        globalSearch.addEventListener('input', renderSearch);
    }
})();
