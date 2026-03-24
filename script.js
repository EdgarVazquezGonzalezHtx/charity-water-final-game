const startBtn = document.getElementById("start-btn");
const difficultyButton = document.getElementById("difficulty-btn");
const gameContainer = document.getElementById("game-container");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("high-score");
const timeDisplay = document.getElementById("time");
const feedbackDisplay = document.getElementById("feedback");
const bonusStatusDisplay = document.getElementById("bonus-status");
const currentDifficultyDisplay = document.getElementById("current-difficulty");

let gameDifficulty = 0; // 0 = normal, 1 = medium, 2 = hard
let gameRunning = false;
let score = 0;
let highScore = 0;
let timeLeft = 30;

let dropMaker = null;
let timerInterval = null;

let multiplierValue = 1;
let multiplierTimeout = null;

let guaranteedCanTimeout = null;
let secondCanTimeout = null;

let confettiTriggered = false;

startBtn.addEventListener("click", startGame);
difficultyButton.addEventListener("click", () => {
  gameDifficulty = (gameDifficulty + 1) % 3;

  const difficultyText =
    gameDifficulty === 0 ? "Normal" :
    gameDifficulty === 1 ? "Medium" : "Hard";

  alert(`Difficulty set to: ${difficultyText}`);
  showCurrentDifficulty("Difficulty: " + difficultyText);

  if (!gameRunning) return;

  // Update speeds while game is running
  if (gameDifficulty === 1) {
    clearInterval(dropMaker);
    dropMaker = setInterval(createDrop, 375);

    clearTimeout(guaranteedCanTimeout);
    clearTimeout(secondCanTimeout);

    guaranteedCanTimeout = setTimeout(() => {
      if (gameRunning) createJerryCan();
    }, 2000);

    secondCanTimeout = setTimeout(() => {
      if (gameRunning) createJerryCan();
    }, 8000);
  } else if (gameDifficulty === 2) {
    clearInterval(dropMaker);
    dropMaker = setInterval(createDrop, 300);

    clearTimeout(guaranteedCanTimeout);
    clearTimeout(secondCanTimeout);

    guaranteedCanTimeout = setTimeout(() => {
      if (gameRunning) createJerryCan();
    }, 1600);

    secondCanTimeout = setTimeout(() => {
      if (gameRunning) createJerryCan();
    }, 6400);
  } else {
    clearInterval(dropMaker);
    dropMaker = setInterval(createDrop, 750);

    clearTimeout(guaranteedCanTimeout);
    clearTimeout(secondCanTimeout);

    guaranteedCanTimeout = setTimeout(() => {
      if (gameRunning) createJerryCan();
    }, 4000);

    secondCanTimeout = setTimeout(() => {
      if (gameRunning) createJerryCan();
    }, 16000);
  }
});

function showCurrentDifficulty(message) {
  currentDifficultyDisplay.textContent = message;
}

function startGame() {
  if (gameRunning) return;

  confettiTriggered = false;
  gameRunning = true;
  score = 0;
  timeLeft = 30;
  multiplierValue = 1;

  clearInterval(dropMaker);
  clearInterval(timerInterval);
  clearTimeout(multiplierTimeout);
  clearTimeout(guaranteedCanTimeout);
  clearTimeout(secondCanTimeout);

  scoreDisplay.textContent = score;
  highScoreDisplay.textContent = highScore;
  timeDisplay.textContent = timeLeft;
  bonusStatusDisplay.textContent = "x1";

  gameContainer.innerHTML = "";
  showFeedback("Collect clean water!", "neutral");

  startBtn.disabled = true;
  startBtn.textContent = "Game Running...";

  let dropSpeed = 750;
  let canSpeed = 4000;
  let secondCanSpeed = 16000;

  if (gameDifficulty === 1) {
    dropSpeed = 375;
    canSpeed = 2000;
    secondCanSpeed = 8000;
  } else if (gameDifficulty === 2) {
    dropSpeed = 300;
    canSpeed = 1600;
    secondCanSpeed = 6400;
  }

  dropMaker = setInterval(createDrop, dropSpeed);

  guaranteedCanTimeout = setTimeout(() => {
    if (gameRunning) {
      createJerryCan();
    }
  }, canSpeed);

  secondCanTimeout = setTimeout(() => {
    if (gameRunning) {
      createJerryCan();
    }
  }, secondCanSpeed);

  timerInterval = setInterval(() => {
    timeLeft--;
    timeDisplay.textContent = timeLeft;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  gameRunning = false;

  clearInterval(dropMaker);
  clearInterval(timerInterval);
  clearTimeout(multiplierTimeout);
  clearTimeout(guaranteedCanTimeout);
  clearTimeout(secondCanTimeout);

  multiplierValue = 1;
  bonusStatusDisplay.textContent = "x1";

  document
    .querySelectorAll(".water-drop, .bad-drop, .jerry-can, .multiplier-popup")
    .forEach(el => el.remove());

  if (score > highScore) {
    highScore = score;
    highScoreDisplay.textContent = highScore;
  }

  startBtn.disabled = false;
  startBtn.textContent = "Play Again";

  let endMessage = `Game over! Final score: ${score}. `;

  if (score >= 20 && !confettiTriggered) {
    endMessage +=
      "Amazing job — every drop matters and helps bring clean water to communities in need.";
    confettiTriggered = true;
    launchConfetti();
  } else if (score >= 10) {
    endMessage += "Nice work — clean water changes lives, one drop at a time.";
  } else {
    endMessage +=
      "Thanks for playing — charity: water helps bring clean water to people around the world.";
  }

  showFeedback(endMessage, "neutral");
}

function createDrop() {
  if (!gameRunning) return;

  const drop = document.createElement("div");
  const isBad = Math.random() < 0.25;
  drop.className = isBad ? "bad-drop" : "water-drop";

  const baseSize = 42;
  const size = baseSize + Math.random() * 28;
  drop.style.width = `${size}px`;
  drop.style.height = `${size * 1.15}px`;

  const gameWidth = gameContainer.offsetWidth;
  const xPosition = Math.random() * (gameWidth - size);
  drop.style.left = `${xPosition}px`;

  const duration = (Math.random() * 1.5 + 3.4).toFixed(2);
  drop.style.animationDuration = `${duration}s`;

  drop.addEventListener("click", () => {
    if (!gameRunning) return;

    if (isBad) {
      score = Math.max(0, score - 3);
      showFeedback("Dirty water! -3", "bad");
    } else {
      const pointsEarned = multiplierValue;
      score += pointsEarned;
      showFeedback(`Clean drop collected! +${pointsEarned}`, "good");
    }

    scoreDisplay.textContent = score;

    if (score > highScore) {
      highScore = score;
      highScoreDisplay.textContent = highScore;
    }

    popElement(drop);
  });

  drop.addEventListener("animationend", () => {
    if (!gameRunning) {
      drop.remove();
      return;
    }

    if (!isBad) {
      score = Math.max(0, score - 1);
      scoreDisplay.textContent = score;
      showFeedback("Missed a clean drop! -1", "bad");
    }

    drop.remove();
  });

  gameContainer.appendChild(drop);
}

function createJerryCan() {
  if (!gameRunning) return;
  if (document.querySelector(".jerry-can")) return;

  const can = document.createElement("img");
  can.className = "jerry-can";
  can.src = "img/water-can-transparent.png";

  can.onerror = function () {
    console.error("Could not load water-can-transparent.png");
    showPopup("Image not found: water-can-transparent.png");
  };

  const size = 90;
  can.style.width = `${size}px`;
  can.style.height = `${size}px`;

  const gameWidth = gameContainer.offsetWidth;
  const xPosition = Math.random() * (gameWidth - size);
  can.style.left = `${xPosition}px`;
  can.style.top = "-100px";
  can.style.animationDuration = "5.5s";

  can.addEventListener("click", () => {
    if (!gameRunning) return;
    activateMultiplier();
    popElement(can);
  });

  can.addEventListener("animationend", () => {
    can.remove();
  });

  gameContainer.appendChild(can);
}

function activateMultiplier() {
  multiplierValue = 3;
  bonusStatusDisplay.textContent = "x3";

  showPopup("Jerry can collected! x3 points for 15 seconds");
  showFeedback("Bonus active! Clean drops are worth x3.", "good");

  clearTimeout(multiplierTimeout);
  multiplierTimeout = setTimeout(() => {
    multiplierValue = 1;
    bonusStatusDisplay.textContent = "x1";
    showPopup("x3 bonus ended");
    showFeedback("Bonus ended.", "neutral");
  }, 15000);
}

function popElement(element) {
  element.style.pointerEvents = "none";
  element.style.opacity = "0";
  element.style.transform = "scale(1.2)";

  setTimeout(() => {
    element.remove();
  }, 150);
}

function showPopup(message) {
  document.querySelectorAll(".multiplier-popup").forEach(popup => popup.remove());

  const popup = document.createElement("div");
  popup.className = "multiplier-popup";
  popup.textContent = message;
  gameContainer.appendChild(popup);

  setTimeout(() => {
    popup.remove();
  }, 2200);
}

function showFeedback(message, type) {
  feedbackDisplay.textContent = message;
  feedbackDisplay.className = "feedback";

  if (type === "good") {
    feedbackDisplay.classList.add("feedback-good");
  } else if (type === "bad") {
    feedbackDisplay.classList.add("feedback-bad");
  } else {
    feedbackDisplay.classList.add("feedback-neutral");
  }
}

function initConfettiStyles() {
  if (document.getElementById("confetti-styles")) return;

  const style = document.createElement("style");
  style.id = "confetti-styles";
  style.textContent = `
    .confetti-piece {
      position: absolute;
      width: 8px;
      height: 8px;
      opacity: 0.9;
      will-change: transform, opacity;
      animation: confetti-fall 2000ms ease-out forwards;
      z-index: 1000;
      pointer-events: none;
    }

    @keyframes confetti-fall {
      0% {
        transform: translate3d(0, 0, 0) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translate3d(0, 420px, 0) rotate(720deg);
        opacity: 0;
      }
    }
  `;

  document.head.appendChild(style);
}

function launchConfetti() {
  initConfettiStyles();

  const colorPalette = [
    "#ff4d4d",
    "#ffd700",
    "#00bfff",
    "#32cd32",
    "#ff69b4",
    "#ffa500"
  ];

  const total = 80;

  for (let i = 0; i < total; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti-piece";
    confetti.style.backgroundColor =
      colorPalette[Math.floor(Math.random() * colorPalette.length)];
    confetti.style.left = `${Math.random() * gameContainer.offsetWidth}px`;
    confetti.style.top = `${-20 - Math.random() * 40}px`;
    confetti.style.width = `${4 + Math.random() * 8}px`;
    confetti.style.height = `${4 + Math.random() * 8}px`;
    confetti.style.animationDuration = `${1300 + Math.random() * 1200}ms`;
    confetti.style.opacity = `${0.7 + Math.random() * 0.3}`;

    gameContainer.appendChild(confetti);
    setTimeout(() => confetti.remove(), 2500);
  }
}
