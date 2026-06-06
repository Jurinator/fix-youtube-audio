console.log("YouTube Logarithmic Volume Extension Loaded");

let settings = { floor: 0.008, scaleFactor: 2.5 };

// settings
browser.storage.local.get(["floor", "scaleFactor"]).then((result) => {
  if (result.floor !== undefined) settings.floor = result.floor;
  if (result.scaleFactor !== undefined) settings.scaleFactor = result.scaleFactor;
});

// live changes
browser.storage.onChanged.addListener((changes) => {
  if (changes.floor) settings.floor = changes.floor.newValue;
  if (changes.scaleFactor) settings.scaleFactor = changes.scaleFactor.newValue;
});

function logVolume(input, muted = false) {
  if (muted || input === 0) return 0;
  return settings.floor + (1 - settings.floor) * Math.pow(input, settings.scaleFactor);
}

let isAdjusting = false;
let lastVideoElement = null;

function applyLogarithmicVolume(video) {
  if (!video) return;

  // backup
  const storedLinear = parseFloat(sessionStorage.getItem("fyv_linear_vol")) || video.volume;
  video.volume = logVolume(storedLinear, video.muted);

  function adjustVolume() {
    if (isAdjusting) return;
    isAdjusting = true;

    if (video.muted) {
      sessionStorage.setItem("fyv_linear_vol", 0);
      video.volume = 0;
    } else {
      let linearInput = parseFloat(sessionStorage.getItem("fyv_linear_vol")) || video.volume;

      // listener
      const currentLog = logVolume(linearInput, false);
      if (Math.abs(video.volume - currentLog) > 0.001) {
        linearInput = video.volume;
        sessionStorage.setItem("fyv_linear_vol", linearInput);
      }

      video.volume = logVolume(linearInput, false);
    }

    isAdjusting = false;
  }

  // attach
  video.removeEventListener("volumechange", adjustVolume);
  video.addEventListener("volumechange", adjustVolume);

  // on reload
  video.removeEventListener("loadeddata", onNewVideo);
  video.addEventListener("loadeddata", onNewVideo);
}

function onNewVideo(event) {
  const video = event.target;
  console.log("[FYV] New video loaded, applying log volume...");
  applyLogarithmicVolume(video);
}

function init() {
  const video = document.querySelector("video");
  if (video) {
    if (video !== lastVideoElement) {
      lastVideoElement = video;
      applyLogarithmicVolume(video);
    }
  } else {
    setTimeout(init, 500);
  }
}
init();

window.addEventListener("yt-navigate-finish", () => {
  setTimeout(init, 500);
});
