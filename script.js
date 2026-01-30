const introVideo = document.getElementById("introVideo");
const loopStage = document.getElementById("loopStage");
const loopVideo = document.getElementById("loopVideo");
const dreamField = document.getElementById("dreamField");
let dreamInterval = null;

const revealLoop = () => {
  loopStage.classList.add("is-active");
  introVideo.classList.add("is-hidden");
  introVideo.style.display = "none";
  if (!dreamInterval) {
    startDreamField();
  }
  loopVideo.load();
  loopVideo.play().catch(() => {
    // Autoplay might be blocked; user interaction will start playback.
  });
};

const startDreamField = () => {
  const spawnDreamText = () => {
    const dreamText = document.createElement("span");
    dreamText.className = "dream-text";
    dreamText.textContent = "dream";

    const left = Math.random() * 90 + 5;
    const drift = (Math.random() * 2 - 1) * 120;
    const duration = Math.random() * 6 + 6;
    const size = Math.random() * 12 + 14;

    dreamText.style.left = `${left}%`;
    dreamText.style.setProperty("--drift", `${drift}px`);
    dreamText.style.setProperty("--float-duration", `${duration}s`);
    dreamText.style.fontSize = `${size}px`;

    dreamText.addEventListener("animationend", () => {
      dreamText.remove();
    });

    dreamField.appendChild(dreamText);
  };

  spawnDreamText();
  dreamInterval = window.setInterval(spawnDreamText, 700);
};

introVideo.addEventListener("ended", revealLoop);

if (introVideo.readyState >= 2 && introVideo.duration === 0) {
  revealLoop();
}
