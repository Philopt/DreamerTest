const introVideo = document.getElementById("introVideo");
const loopStage = document.getElementById("loopStage");
const dreamField = document.getElementById("dreamField");
const loopVideoLayer = document.getElementById("loopVideoLayer");
const loopVideoAlert = document.getElementById("loopVideoAlert");
const introVideoAlert = document.getElementById("introVideoAlert");

let dreamInterval = null;
let loopRevealed = false;
let dreamStarted = false;
let dreamStartTimeout = null;
const spinIntervals = new WeakMap();

const spawnDreamWord = () => {
  if (!dreamField) return;
  const word = document.createElement("span");
  word.className = "dream-word";
  word.textContent = "dream";

  const startX = Math.random() * 100;
  const drift = (Math.random() - 0.5) * 30;
  const duration = 2.4 + Math.random() * 1.8;
  const delay = Math.random() * 0.6;

  word.style.setProperty("--start-x", `${startX}vw`);
  word.style.setProperty("--drift-x", `${drift}vw`);
  word.style.setProperty("--float-duration", `${duration}s`);
  word.style.setProperty("--float-delay", `${delay}s`);

  dreamField.appendChild(word);

  word.addEventListener("animationend", () => {
    word.remove();
  });
};

const randomPosition = (min = 5, max = 95) =>
  Math.floor(min + Math.random() * (max - min));

const pxToVw = (value) => `${(value / window.innerWidth) * 100}vw`;
const pxToVh = (value) => `${(value / window.innerHeight) * 100}vh`;

const startRandomSpin = (video) => {
  if (!video) return;
  let currentRotation = Math.floor(Math.random() * 360);
  video.style.setProperty("--spin-angle", `${currentRotation}deg`);

  const updateSpin = () => {
    const direction = Math.random() > 0.5 ? 1 : -1;
    const magnitude = 120 + Math.random() * 240;
    currentRotation += direction * magnitude;
    video.style.setProperty("--spin-angle", `${currentRotation}deg`);
  };

  updateSpin();
  const interval = window.setInterval(updateSpin, 2200 + Math.random() * 2200);
  spinIntervals.set(video, interval);
};

const createLoopInstance = ({ entering = false, spawnX = null, spawnY = null } = {}) => {
  if (!loopVideoLayer) return;
  const wrapper = document.createElement("div");
  wrapper.className = "loop-video-wrapper";
  const hasSpawnPoint = Boolean(spawnX && spawnY);
  if (!entering && !hasSpawnPoint) {
    wrapper.style.animation = "none";
    wrapper.style.opacity = "1";
  }
  if (entering) {
    wrapper.classList.add("from-center");
  }
  if (hasSpawnPoint && !entering) {
    wrapper.classList.add("from-click");
  }

  const drifter = document.createElement("div");
  drifter.className = "loop-video-drifter";

  const video = document.createElement("video");
  video.className = "loop-video";
  video.autoplay = true;
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";

  const source = document.createElement("source");
  source.src = "DreamGameElanorFalling_alpha.webm";
  source.type = "video/webm";
  video.appendChild(source);

  const x1 = spawnX || `${randomPosition(15, 85)}vw`;
  const y1 = spawnY || `${randomPosition(20, 80)}vh`;
  const x2 = `${randomPosition()}vw`;
  const y2 = `${randomPosition()}vh`;
  const x3 = `${randomPosition()}vw`;
  const y3 = `${randomPosition()}vh`;
  const x4 = `${randomPosition()}vw`;
  const y4 = `${randomPosition()}vh`;
  const driftDuration = 8 + Math.random() * 8;
  const startRotation = Math.floor(Math.random() * 360);

  drifter.style.setProperty("--x1", x1);
  drifter.style.setProperty("--y1", y1);
  drifter.style.setProperty("--x2", x2);
  drifter.style.setProperty("--y2", y2);
  drifter.style.setProperty("--x3", x3);
  drifter.style.setProperty("--y3", y3);
  drifter.style.setProperty("--x4", x4);
  drifter.style.setProperty("--y4", y4);
  drifter.style.setProperty("--drift-duration", `${driftDuration}s`);
  video.style.setProperty("--start-rotation", `${startRotation}deg`);

  video.addEventListener("error", () => {
    if (loopVideoAlert) {
      loopVideoAlert.classList.add("is-visible");
    }
  });

  video.addEventListener("loadeddata", () => {
    if (loopVideoAlert) {
      loopVideoAlert.classList.remove("is-visible");
    }
  });

  video.addEventListener("click", (event) => {
    event.stopPropagation();
    const rect = video.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    createLoopInstance({
      spawnX: pxToVw(centerX),
      spawnY: pxToVh(centerY),
    });
  });

  drifter.appendChild(video);
  wrapper.appendChild(drifter);
  loopVideoLayer.appendChild(wrapper);
  startRandomSpin(video);

  video.play().catch(() => {
    // Autoplay might be blocked; user interaction will start playback.
  });
};

const revealLoop = () => {
  if (loopRevealed) return;
  loopRevealed = true;
  loopStage.classList.add("is-active");
  loopStage.setAttribute("aria-hidden", "false");
  introVideo.classList.add("is-hidden");
  introVideo.style.display = "none";
  introVideo.pause();
  startDreamField();
  createLoopInstance({ entering: true, spawnX: "50vw", spawnY: "50vh" });
};

const startDreamField = () => {
  if (dreamInterval) return;
  dreamField.classList.add("is-active");
  spawnDreamWord();
  dreamInterval = window.setInterval(spawnDreamWord, 250);
};

introVideo.addEventListener("ended", revealLoop);

introVideo.addEventListener("loadeddata", () => {
  if (introVideoAlert) {
    introVideoAlert.classList.remove("is-visible");
  }
});

introVideo.addEventListener("error", () => {
  if (introVideoAlert) {
    introVideoAlert.classList.add("is-visible");
  }
});

const scheduleDreamStart = () => {
  if (dreamStarted) return;
  const duration = introVideo.duration;
  if (!duration || !Number.isFinite(duration)) {
    startDreamField();
    dreamStarted = true;
    return;
  }
  const startIn = Math.max(duration - 2, 0);
  if (dreamStartTimeout) {
    window.clearTimeout(dreamStartTimeout);
  }
  dreamStartTimeout = window.setTimeout(() => {
    if (!dreamStarted) {
      startDreamField();
      dreamStarted = true;
    }
  }, startIn * 1000);
};

introVideo.addEventListener("loadedmetadata", scheduleDreamStart);

introVideo.addEventListener("timeupdate", () => {
  if (dreamStarted) return;
  const remaining = introVideo.duration - introVideo.currentTime;
  if (remaining <= 2) {
    startDreamField();
    dreamStarted = true;
  }
});

if (introVideo.readyState >= 1) {
  scheduleDreamStart();
}

introVideo.src = "DreamGameIntro.mp4";
introVideo.load();

loopStage.addEventListener("click", () => {
  createLoopInstance({
    spawnX: "50vw",
    spawnY: "50vh",
  });
});
