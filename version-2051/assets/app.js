(function () {
    var mobileButton = document.querySelector(".mobile-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
        });
    }

    var slider = document.querySelector(".hero-slider");

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        var prev = slider.querySelector(".hero-prev");
        var next = slider.querySelector(".hero-next");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-go-slide")) || 0);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    var filterInput = document.querySelector(".filter-input");
    var filterSelects = Array.prototype.slice.call(document.querySelectorAll(".filter-select"));
    var filterCards = Array.prototype.slice.call(document.querySelectorAll(".filter-card"));
    var emptyState = document.querySelector(".empty-state");

    function applyFilters() {
        if (!filterCards.length) {
            return;
        }

        var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
        var values = {};

        filterSelects.forEach(function (select) {
            values[select.getAttribute("data-filter")] = select.value;
        });

        var visible = 0;

        filterCards.forEach(function (card) {
            var textMatch = !keyword || (card.getAttribute("data-search") || "").indexOf(keyword) !== -1;
            var categoryMatch = !values.category || card.getAttribute("data-category") === values.category;
            var regionMatch = !values.region || card.getAttribute("data-region") === values.region;
            var yearMatch = !values.year || card.getAttribute("data-year") === values.year;
            var show = textMatch && categoryMatch && regionMatch && yearMatch;

            card.hidden = !show;

            if (show) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.hidden = visible !== 0;
        }
    }

    if (filterInput) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");

        if (query) {
            filterInput.value = query;
        }

        filterInput.addEventListener("input", applyFilters);
    }

    filterSelects.forEach(function (select) {
        select.addEventListener("change", applyFilters);
    });

    applyFilters();

    function showPlayerError(player, text) {
        var box = player.querySelector(".player-error");

        if (box) {
            box.textContent = text;
            box.hidden = false;
        }
    }

    function attachVideo(player) {
        var video = player.querySelector("video");
        var url = player.getAttribute("data-video");

        if (!video || !url || video.getAttribute("data-ready") === "1") {
            return video;
        }

        video.setAttribute("data-ready", "1");

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });

            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }

                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                    showPlayerError(player, "网络异常，正在重新加载");
                    return;
                }

                if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                    showPlayerError(player, "媒体加载异常，正在恢复");
                    return;
                }

                showPlayerError(player, "播放加载失败，请稍后重试");
                hls.destroy();
            });
            video.hlsInstance = hls;
        } else {
            video.src = url;
        }

        return video;
    }

    Array.prototype.slice.call(document.querySelectorAll(".js-player")).forEach(function (player) {
        var overlay = player.querySelector(".play-overlay");
        var video = player.querySelector("video");

        function play() {
            var media = attachVideo(player);

            if (overlay) {
                overlay.classList.add("hidden");
            }

            if (media && media.play) {
                var promise = media.play();

                if (promise && promise.catch) {
                    promise.catch(function () {
                        if (overlay) {
                            overlay.classList.remove("hidden");
                        }
                    });
                }
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (video.getAttribute("data-ready") !== "1") {
                    play();
                }
            });
        }
    });
})();
