document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".carousel-track .card");
  const nextBtn = document.querySelector(".carousel-arrow.right");
  const prevBtn = document.querySelector(".carousel-arrow.left");
  const carousel = document.querySelector(".lux-carousel");

  let current = 0;
  let interval;

  function updateCarousel() {
    cards.forEach((card, i) => {
      card.classList.remove("active");

      const offset = i - current;

      if (offset === 0) {
        card.classList.add("active");
        card.style.transform = "translateX(0) scale(1)";
        card.style.opacity = "1";
        card.style.zIndex = "5";
      } else if (offset === -1) {
        card.style.transform = "translateX(-80px) scale(0.9)";
        card.style.opacity = "0.6";
        card.style.zIndex = "4";
      } else if (offset === 1) {
        card.style.transform = "translateX(80px) scale(0.9)";
        card.style.opacity = "0.6";
        card.style.zIndex = "4";
      } else if (offset === -2) {
        card.style.transform = "translateX(-140px) scale(0.85)";
        card.style.opacity = "0.35";
        card.style.zIndex = "3";
      } else if (offset === 2) {
        card.style.transform = "translateX(140px) scale(0.85)";
        card.style.opacity = "0.35";
        card.style.zIndex = "3";
      } else {
        card.style.opacity = "0";
        card.style.zIndex = "1";
      }
    });
  }

  function next() {
    current = (current + 1) % cards.length;
    updateCarousel();
  }

  function prev() {
    current = (current - 1 + cards.length) % cards.length;
    updateCarousel();
  }

  function startAutoPlay() {
    interval = setInterval(next, 3500); // luxury timing
  }

  function stopAutoPlay() {
    clearInterval(interval);
  }

  nextBtn.addEventListener("click", () => {
    stopAutoPlay();
    next();
    startAutoPlay();
  });

  prevBtn.addEventListener("click", () => {
    stopAutoPlay();
    prev();
    startAutoPlay();
  });

  carousel.addEventListener("mouseenter", stopAutoPlay);
  carousel.addEventListener("mouseleave", startAutoPlay);

  updateCarousel();
  startAutoPlay();
});

const container = document.querySelector(".tryon-camera");
const video = document.getElementById("tryonVideo");
const btn = document.querySelector(".tryon-toggle-btn");
const placeholder = document.querySelector(".tryon-placeholder");

let stream = null;
let isRunning = false;

async function startCamera() {
  console.log("Starting camera...");

  stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user" },
    audio: false,
  });

  video.srcObject = stream;
  container.classList.add("active");
  btn.textContent = "Stop Try On";
  isRunning = true;
}

function stopCamera() {
  if (!stream) return;

  stream.getTracks().forEach((track) => track.stop());
  stream = null;

  video.srcObject = null;
  container.classList.remove("active");
  btn.textContent = "Start Try On";
  isRunning = false;
}

btn.addEventListener("click", async () => {
  try {
    if (!isRunning) {
      await startCamera();
    } else {
      stopCamera();
    }
  } catch (err) {
    console.error("Camera error:", err);
    alert("Camera permission denied or unavailable");
  }
});

let isTryOnActive = false;

function toggleTryOn() {
  const frame = document.getElementById("tryonFrame");
  const btn = event.target;

  if (!isTryOnActive) {
    frame.src = "earrings-tryon/index.html";
    btn.textContent = "Stop Try On";
    isTryOnActive = true;
  } else {
    frame.src = "";
    btn.textContent = "Start Try On";
    isTryOnActive = false;
  }
}

/* 
  Adorne Feature & Signature Collection
  Interaction handled via CSS hover for luxury feel.
  JS intentionally minimal.
*/
