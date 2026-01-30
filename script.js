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

const startDreamField = () => {
  if (dreamInterval) return;
  spawnDreamWord();
  dreamInterval = window.setInterval(spawnDreamWord, 450);
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
