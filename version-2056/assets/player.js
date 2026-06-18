(function () {
  const meta = document.getElementById("playerMeta");
  const video = document.getElementById("moviePlayer");
  const button = document.getElementById("playButton");
  const box = document.getElementById("playerBox");

  if (!meta || !video || !button || !box) {
    return;
  }

  let streamUrl = "";
  try {
    streamUrl = JSON.parse(meta.textContent).streamUrl || "";
  } catch (error) {
    streamUrl = "";
  }

  let prepared = false;
  let hls = null;

  function prepare() {
    if (prepared || !streamUrl) {
      return;
    }
    prepared = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  function play() {
    prepare();
    button.classList.add("is-hidden");
    const result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {
        button.classList.remove("is-hidden");
      });
    }
  }

  button.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    play();
  });

  box.addEventListener("click", function (event) {
    if (event.target === video) {
      return;
    }
    play();
  });

  box.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      play();
    }
  });

  video.addEventListener("playing", function () {
    button.classList.add("is-hidden");
  });

  video.addEventListener("ended", function () {
    button.classList.remove("is-hidden");
  });

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
