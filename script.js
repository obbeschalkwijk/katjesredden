const playArea = document.getElementById("playArea");
const scoreEl = document.getElementById("score");
const savedEl = document.getElementById("saved");
const missedEl = document.getElementById("missed");
const maxMissesEl = document.getElementById("maxMisses");
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const kittenTemplate = document.getElementById("kittenTemplate");

const MAX_MISSES = 5;
const TICK_MS = 20;

let gameRunning = false;
let score = 0;
let saved = 0;
let missed = 0;
let speed = 1.8;
let spawnIntervalMs = 1250;
let spawnTimer;
let updateTimer;

const kittens = [];

function updateHUD() {
  scoreEl.textContent = String(score);
  savedEl.textContent = String(saved);
  missedEl.textContent = String(missed);
  maxMissesEl.textContent = String(MAX_MISSES);
}

function showMessage(text) {
  let message = playArea.querySelector(".message");
  if (!message) {
    message = document.createElement("p");
    message.className = "message";
    playArea.appendChild(message);
  }
  message.textContent = text;
  message.style.display = "block";
}

function hideMessage() {
  const message = playArea.querySelector(".message");
  if (message) {
    message.style.display = "none";
  }
}

function cleanKittens() {
  kittens.forEach((kitten) => kitten.element.remove());
  kittens.length = 0;
}

function spawnKitten() {
  const areaRect = playArea.getBoundingClientRect();
  const kittenEl = kittenTemplate.content.firstElementChild.cloneNode(true);
  const left = Math.random() * Math.max(areaRect.width - 64, 16);

  kittenEl.style.left = `${left}px`;
  kittenEl.style.top = "-60px";

  const kittenData = {
    element: kittenEl,
    y: -60,
    velocity: speed + Math.random() * 2,
  };

  kittenEl.addEventListener("click", () => rescueKitten(kittenData));
  kittenEl.addEventListener("touchstart", () => rescueKitten(kittenData), { passive: true });

  kittens.push(kittenData);
  playArea.appendChild(kittenEl);
}

function rescueKitten(kittenData) {
  if (!gameRunning) {
    return;
  }

  const index = kittens.indexOf(kittenData);
  if (index === -1) {
    return;
  }

  kittens.splice(index, 1);
  kittenData.element.remove();

  saved += 1;
  score += 10;

  if (saved % 8 === 0) {
    speed += 0.35;
    spawnIntervalMs = Math.max(420, spawnIntervalMs - 70);
    restartSpawnLoop();
  }

  updateHUD();
}

function updateKittens() {
  if (!gameRunning) {
    return;
  }

  const areaRect = playArea.getBoundingClientRect();

  for (let i = kittens.length - 1; i >= 0; i -= 1) {
    const kitten = kittens[i];
    kitten.y += kitten.velocity;
    kitten.element.style.top = `${kitten.y}px`;

    if (kitten.y > areaRect.height - 40) {
      kitten.element.remove();
      kittens.splice(i, 1);
      missed += 1;
      updateHUD();

      if (missed >= MAX_MISSES) {
        endGame();
        return;
      }
    }
  }
}

function restartSpawnLoop() {
  clearInterval(spawnTimer);
  spawnTimer = setInterval(spawnKitten, spawnIntervalMs);
}

function startGame() {
  gameRunning = true;
  score = 0;
  saved = 0;
  missed = 0;
  speed = 1.8;
  spawnIntervalMs = 1250;

  hideMessage();
  cleanKittens();
  updateHUD();

  startButton.disabled = true;
  restartButton.disabled = false;

  restartSpawnLoop();
  clearInterval(updateTimer);
  updateTimer = setInterval(updateKittens, TICK_MS);
}

function endGame() {
  gameRunning = false;
  clearInterval(spawnTimer);
  clearInterval(updateTimer);
  showMessage(`Spel klaar! Je redde ${saved} katjes. Tik op Opnieuw!`);
  startButton.disabled = true;
  restartButton.disabled = false;
}

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

updateHUD();
showMessage("Druk op Start spel en red alle katjes voor Eva!");
