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
const motionStates = new WeakMap();

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

const clampValue = (value, min, max) => Math.max(min, Math.min(max, value));

const parsePositionValue = (value, axis) => {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return 0;
  if (value.endsWith("vw")) {
    return (parseFloat(value) / 100) * window.innerWidth;
  }
  if (value.endsWith("vh")) {
    return (parseFloat(value) / 100) * window.innerHeight;
  }
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const startBouncingMotion = ({ wrapper, drifter, video, config }) => {
  const bounds = () => loopStage.getBoundingClientRect();
  const state = {
    x: config.x ?? 0,
    y: config.y ?? 0,
    vx: config.vx ?? 0,
    vy: config.vy ?? 0,
    scale: config.scale ?? 1,
    wavy: Boolean(config.wavy),
    wavyAfterCenter: Boolean(config.wavyAfterCenter),
    spin: Boolean(config.spin),
    spinAfterCenter: Boolean(config.spinAfterCenter),
    waveAmp: config.waveAmp ?? 28,
    waveSpeed: config.waveSpeed ?? 0.0012,
    rotation: Math.random() * 360,
    rotationSpeed: config.rotationSpeed ?? 0,
    nextRotationChange: performance.now() + 1200,
    hasPassedCenter: false,
    waveSeed: Math.random() * Math.PI * 2,
    lastTime: performance.now(),
  };

  video.style.setProperty("--scale", state.scale);
  motionStates.set(wrapper, state);

  const step = (time) => {
    const delta = Math.max((time - state.lastTime) / 16.67, 0.6);
    state.lastTime = time;

    const { width: boundsWidth, height: boundsHeight } = bounds();
    const videoRect = video.getBoundingClientRect();
    const videoWidth = videoRect.width || 1;
    const videoHeight = videoRect.height || 1;

    state.x += state.vx * delta;
    state.y += state.vy * delta;

    if (state.x <= 0 || state.x + videoWidth >= boundsWidth) {
      state.x = clampValue(state.x, 0, boundsWidth - videoWidth);
      state.vx *= -1;
    }
    if (state.y <= 0 || state.y + videoHeight >= boundsHeight) {
      state.y = clampValue(state.y, 0, boundsHeight - videoHeight);
      state.vy *= -1;
    }

    const centerX = state.x + videoWidth / 2;
    const centerY = state.y + videoHeight / 2;
    if (!state.hasPassedCenter && centerX >= boundsWidth / 2) {
      state.hasPassedCenter = true;
      if (state.wavyAfterCenter) {
        state.wavy = true;
      }
      if (state.spinAfterCenter) {
        state.spin = true;
      }
    }

    let offsetX = 0;
    let offsetY = 0;
    if (state.wavy) {
      offsetX = Math.sin(time * state.waveSpeed + state.waveSeed) * state.waveAmp;
      offsetY =
        Math.cos(time * state.waveSpeed * 0.8 + state.waveSeed) *
        (state.waveAmp * 0.6);
    }

    if (state.spin && time >= state.nextRotationChange) {
      const direction = Math.random() > 0.5 ? 1 : -1;
      const magnitude = 1 + Math.random() * 4.5;
      state.rotationSpeed = direction * magnitude;
      state.nextRotationChange = time + 900 + Math.random() * 1200;
    }

    if (state.spin) {
      state.rotation += state.rotationSpeed * delta * 6;
    }

    drifter.style.transform = `translate(${state.x + offsetX}px, ${state.y + offsetY}px)`;
    video.style.setProperty("--spin-angle", `${state.rotation}deg`);

    requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
};

const createLoopInstance = (
  { entering = false, spawnX = null, spawnY = null, behavior = "primary", direction = null } = {},
) => {
  if (!loopVideoLayer) return;
  const wrapper = document.createElement("div");
  wrapper.className = "loop-video-wrapper";
  const hasSpawnPoint = Boolean(spawnX !== null && spawnY !== null);
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

  const bounds = loopStage.getBoundingClientRect();
  const startX = spawnX ?? Math.random() * (bounds.width * 0.6) + bounds.width * 0.2;
  const startY = spawnY ?? Math.random() * (bounds.height * 0.6) + bounds.height * 0.2;

  wrapper.dataset.behavior = behavior;
  if (behavior === "spark") {
    wrapper.classList.add("is-mini");
  }

  const baseSpeed = Math.min(bounds.width, bounds.height) / 240;
  let motionConfig = {
    x: parsePositionValue(startX),
    y: parsePositionValue(startY),
    vx: (Math.random() > 0.5 ? 1 : -1) * baseSpeed,
    vy: (Math.random() > 0.5 ? 1 : -1) * baseSpeed,
    scale: 1,
    wavy: true,
    spin: true,
    waveAmp: 32,
    rotationSpeed: 1.2,
  };

  if (behavior === "wanderer") {
    motionConfig = {
      x: parsePositionValue(startX),
      y: parsePositionValue(startY),
      vx: baseSpeed * 0.9,
      vy: baseSpeed * 1.2,
      scale: 1,
      wavy: false,
      wavyAfterCenter: true,
      spin: false,
      spinAfterCenter: true,
      waveAmp: 38,
      rotationSpeed: 0,
    };
  }

  if (behavior === "spark") {
    const angle = direction ?? Math.random() * Math.PI * 2;
    motionConfig = {
      x: parsePositionValue(startX),
      y: parsePositionValue(startY),
      vx: Math.cos(angle) * baseSpeed * 2.2,
      vy: Math.sin(angle) * baseSpeed * 2.2,
      scale: 0.33,
      wavy: false,
      spin: false,
      waveAmp: 0,
      rotationSpeed: 0,
    };
  }

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
    if (wrapper.dataset.behavior === "spark") {
      const state = motionStates.get(wrapper);
      if (state) {
        wrapper.dataset.behavior = "primary";
        wrapper.classList.remove("is-mini");
        state.scale = 1;
        state.wavy = true;
        state.spin = true;
        state.wavyAfterCenter = false;
        state.spinAfterCenter = false;
        state.waveAmp = 34;
        state.rotationSpeed = 1.4;
        video.style.setProperty("--scale", state.scale);
      }
      return;
    }

    const baseAngle = Math.random() * Math.PI * 2;
    [0, 1, 2].forEach((index) => {
      const angle = baseAngle + index * (Math.PI * 2) / 3 + (Math.random() - 0.5) * 0.4;
      createLoopInstance({
        spawnX: centerX,
        spawnY: centerY,
        behavior: "spark",
        direction: angle,
      });
    });
  });

  drifter.appendChild(video);
  wrapper.appendChild(drifter);
  loopVideoLayer.appendChild(wrapper);
  startBouncingMotion({ wrapper, drifter, video, config: motionConfig });

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
  window.setTimeout(() => {
    const bounds = loopStage.getBoundingClientRect();
    createLoopInstance({
      spawnX: bounds.width * 0.33,
      spawnY: bounds.height * 0.2,
      behavior: "wanderer",
    });
  }, 600);
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
