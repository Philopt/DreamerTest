const introVideo = document.getElementById("introVideo");
const loopStage = document.getElementById("loopStage");
const loopVideo = document.getElementById("loopVideo");
const dreamField = document.getElementById("dreamField");

let dreamInterval = null;

const spawnDreamWord = () => {
  if (!dreamField) return;
  const word = document.createElement("span");
  word.className = "dream-word";
  word.textContent = "dream";

  const startX = Math.random() * 100;
  const drift = (Math.random() - 0.5) * 40;
  const duration = 6 + Math.random() * 5;
  const delay = Math.random() * 1.5;

  word.style.setProperty("--start-x", `${startX}vw`);
  word.style.setProperty("--drift-x", `${drift}vw`);
  word.style.setProperty("--float-duration", `${duration}s`);
  word.style.setProperty("--float-delay", `${delay}s`);

  dreamField.appendChild(word);

  word.addEventListener("animationend", () => {
    word.remove();
  });
};

const revealLoop = () => {
  loopStage.classList.add("is-active");
  introVideo.classList.add("is-hidden");
  introVideo.style.display = "none";
  startDreamField();
  loopVideo.load();
  loopVideo.play().catch(() => {
    // Autoplay might be blocked; user interaction will start playback.
  });
};

const startDreamField = () => {
  if (dreamInterval) return;
  spawnDreamWord();
  dreamInterval = window.setInterval(spawnDreamWord, 450);
};

introVideo.addEventListener("ended", revealLoop);

if (introVideo.readyState >= 2 && introVideo.duration === 0) {
  revealLoop();
}
