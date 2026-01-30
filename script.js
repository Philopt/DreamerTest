const introVideo = document.getElementById("introVideo");
const loopStage = document.getElementById("loopStage");
const loopVideo = document.getElementById("loopVideo");

const revealLoop = () => {
  loopStage.classList.add("is-active");
  introVideo.classList.add("is-hidden");
  introVideo.style.display = "none";
  loopVideo.load();
  loopVideo.play().catch(() => {
    // Autoplay might be blocked; user interaction will start playback.
  });
};

introVideo.addEventListener("ended", revealLoop);

if (introVideo.readyState >= 2 && introVideo.duration === 0) {
  revealLoop();
}
