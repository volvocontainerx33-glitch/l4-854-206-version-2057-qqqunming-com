(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (slides.length === 0) {
            return;
        }
        var activeIndex = 0;
        var timer = null;

        function activate(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === activeIndex);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                activate(activeIndex + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var index = Number(dot.getAttribute("data-hero-dot"));
                activate(index);
                start();
            });
        });

        activate(0);
        start();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
        panels.forEach(function (panel) {
            var container = panel.parentElement;
            if (!container) {
                return;
            }
            var cards = Array.prototype.slice.call(container.querySelectorAll("[data-filter-card]"));
            var input = panel.querySelector("[data-filter-input]");
            var count = panel.querySelector("[data-filter-count]");
            var categoryButtons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-category]"));
            var yearButtons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-year]"));
            var activeCategory = "all";
            var activeYear = "all";

            function normalize(value) {
                return String(value || "").trim().toLowerCase();
            }

            function markActive(buttons, activeValue, attribute) {
                buttons.forEach(function (button) {
                    button.classList.toggle("active", button.getAttribute(attribute) === activeValue);
                });
            }

            function apply() {
                var keyword = normalize(input ? input.value : "");
                var visibleCount = 0;
                cards.forEach(function (card) {
                    var searchText = normalize(card.getAttribute("data-search"));
                    var cardCategory = card.getAttribute("data-category") || "";
                    var cardYear = card.getAttribute("data-year") || "";
                    var matchesKeyword = !keyword || searchText.indexOf(keyword) !== -1;
                    var matchesCategory = activeCategory === "all" || cardCategory === activeCategory;
                    var matchesYear = activeYear === "all" || cardYear === activeYear;
                    var isVisible = matchesKeyword && matchesCategory && matchesYear;
                    card.hidden = !isVisible;
                    if (isVisible) {
                        visibleCount += 1;
                    }
                });
                if (count) {
                    count.textContent = String(visibleCount);
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }

            categoryButtons.forEach(function (button) {
                button.addEventListener("click", function () {
                    activeCategory = button.getAttribute("data-filter-category") || "all";
                    markActive(categoryButtons, activeCategory, "data-filter-category");
                    apply();
                });
            });

            yearButtons.forEach(function (button) {
                button.addEventListener("click", function () {
                    activeYear = button.getAttribute("data-filter-year") || "all";
                    markActive(yearButtons, activeYear, "data-filter-year");
                    apply();
                });
            });

            apply();
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-play-button]");
            var message = player.querySelector("[data-player-message]");
            var source = player.getAttribute("data-src");
            var hlsInstance = null;

            if (!video || !button || !source) {
                return;
            }

            function setMessage(text) {
                if (message) {
                    message.textContent = text;
                }
            }

            function playVideo() {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        setMessage("浏览器阻止了自动播放，请再次点击播放器开始播放。");
                    });
                }
            }

            function startPlayback() {
                button.classList.add("is-hidden");
                video.setAttribute("controls", "controls");
                setMessage("正在加载播放源，请稍候。");

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    video.addEventListener("loadedmetadata", playVideo, { once: true });
                    setMessage("播放源已加载，正在准备播放。");
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setMessage("播放初始化完成，正在播放。");
                        playVideo();
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setMessage("播放源加载失败，请刷新页面或更换浏览器重试。");
                            if (hlsInstance) {
                                hlsInstance.destroy();
                                hlsInstance = null;
                            }
                        }
                    });
                    return;
                }

                video.src = source;
                setMessage("当前浏览器兼容性有限，已尝试直接加载播放源。");
                playVideo();
            }

            button.addEventListener("click", startPlayback, { once: true });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
}());
