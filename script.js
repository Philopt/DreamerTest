const introVideo = document.getElementById("introVideo");
const loopStage = document.getElementById("loopStage");
const dreamField = document.getElementById("dreamField");
const loopVideoLayer = document.getElementById("loopVideoLayer");
const loopVideoAlert = document.getElementById("loopVideoAlert");

let dreamInterval = null;
let loopRevealed = false;
let dreamStarted = false;
let dreamStartTimeout = null;

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

const randomPosition = () => Math.floor(10 + Math.random() * 80);

const createLoopInstance = ({ entering = false } = {}) => {
  if (!loopVideoLayer) return;
  const wrapper = document.createElement("div");
  wrapper.className = "loop-video-wrapper";
  if (!entering) {
    wrapper.style.animation = "none";
    wrapper.style.opacity = "1";
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

  const x1 = `${randomPosition()}vw`;
  const y1 = `${randomPosition()}vh`;
  const x2 = `${randomPosition()}vw`;
  const y2 = `${randomPosition()}vh`;
  const x3 = `${randomPosition()}vw`;
  const y3 = `${randomPosition()}vh`;
  const driftDuration = 12 + Math.random() * 10;
  const spinDuration = 4 + Math.random() * 6;
  const startRotation = Math.floor(Math.random() * 360);

  drifter.style.setProperty("--x1", x1);
  drifter.style.setProperty("--y1", y1);
  drifter.style.setProperty("--x2", x2);
  drifter.style.setProperty("--y2", y2);
  drifter.style.setProperty("--x3", x3);
  drifter.style.setProperty("--y3", y3);
  drifter.style.setProperty("--drift-duration", `${driftDuration}s`);
  video.style.setProperty("--spin-duration", `${spinDuration}s`);
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
    createLoopInstance();
  });

  drifter.appendChild(video);
  wrapper.appendChild(drifter);
  loopVideoLayer.appendChild(wrapper);

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
  createLoopInstance({ entering: true });
};

const startDreamField = () => {
  if (dreamInterval) return;
  dreamField.classList.add("is-active");
  spawnDreamWord();
  dreamInterval = window.setInterval(spawnDreamWord, 250);
};

introVideo.addEventListener("ended", revealLoop);

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

loopStage.addEventListener("click", () => {
  createLoopInstance();
});
