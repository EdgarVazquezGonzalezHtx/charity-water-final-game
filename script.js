const startBtn = document.getElementById("start-btn");
const gameContainer = document.getElementById("game-container");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("high-score");
const timeDisplay = document.getElementById("time");
const feedbackDisplay = document.getElementById("feedback");
const bonusStatusDisplay = document.getElementById("bonus-status");

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

startBtn.addEventListener("click", startGame);

function startGame() {
  if (gameRunning) return;

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

  dropMaker = setInterval(createDrop, 750);

  // Guaranteed jerry can
  guaranteedCanTimeout = setTimeout(() => {
    if (gameRunning) {
      createJerryCan();
    }
  }, 4000);

  // Optional second one
  secondCanTimeout = setTimeout(() => {
    if (gameRunning) {
      createJerryCan();
    }
  }, 16000);

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

  document.querySelectorAll(".water-drop, .bad-drop, .jerry-can, .multiplier-popup").forEach(el => el.remove());

  if (score > highScore) {
    highScore = score;
    highScoreDisplay.textContent = highScore;
  }

  startBtn.disabled = false;
  startBtn.textContent = "Play Again";

  let endMessage = `Game over! Final score: ${score}. `;
  if (score >= 20) {
    endMessage += "Amazing job — every drop matters and helps bring clean water to communities in need.";
  } else if (score >= 10) {
    endMessage += "Nice work — clean water changes lives, one drop at a time.";
  } else {
    endMessage += "Thanks for playing — charity: water helps bring clean water to people around the world.";
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

  // Only one can at a time
  if (document.querySelector(".jerry-can")) return;

  const can = document.createElement("img");
  can.className = "jerry-can";
  can.src = "img/water-can-transparent.png";
  // can.alt = "Jerry can bonus";

  // Debug helper: if image path is broken, you'll know
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