import { Ship } from "./ship.js";
import { ObstacleField } from "./obstacles.js";
import { CollectibleField } from "./collectibles.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreLabel = document.getElementById("scoreLabel");
const speedLabel = document.getElementById("speedLabel");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const tiltBtn = document.getElementById("tiltBtn");

let width = 960;
let height = 540;
let ship;
let obstacles;
let collectibles;

let score = 0;
const BASE_SPEED = 240;
let baseSpeed = BASE_SPEED;
let speed = baseSpeed;
let difficulty = 0;
let lastTime = 0;
let state = "title";
let finalScore = 0;
let touchedOnce = false;

const keys = { ArrowLeft: false, ArrowRight: false };
const input = {
  tiltSteer: 0,
  keyboardSteer: 0,
  hasTilt: false,
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function applyResize() {
  const playArea = canvas.parentElement;
  const maxWidth = Math.min(window.innerWidth - 16, 960);
  const canvasWidth = Math.max(300, maxWidth);
  const canvasHeight = Math.round(canvasWidth * 0.6);
  const maxHeight = Math.min(window.innerHeight - 220, 650);
  const ratio = Math.min(1, maxHeight / canvasHeight);
  const cssWidth = Math.round(canvasWidth * ratio);
  const cssHeight = Math.round(canvasHeight * ratio);

  const dpr = window.devicePixelRatio || 1;
  playArea.style.width = `${cssWidth}px`;
  playArea.style.height = `${cssHeight}px`;
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  width = cssWidth;
  height = cssHeight;

  if (ship) {
    ship.x = clamp(ship.x, ship.size, width - ship.size);
    ship.y = clamp(ship.y, ship.size, height - ship.size);
  }
}

function resetRound() {
  const size = Math.max(14, Math.round(width * 0.03));
  ship = new Ship(Math.round(width * 0.18), Math.round(height * 0.5), size);
  obstacles = new ObstacleField();
  collectibles = new CollectibleField();
  score = 0;
  baseSpeed = BASE_SPEED;
  speed = baseSpeed;
  difficulty = 0;
  finalScore = 0;
  updateHud();
}

function updateHud() {
  scoreLabel.textContent = `Score: ${Math.floor(score)}`;
  speedLabel.textContent = `Speed: ${(speed / BASE_SPEED).toFixed(1)}x`;
}

function startGame() {
  resetRound();
  state = "running";
  pauseBtn.textContent = "Pause";
}

function endGame() {
  finalScore = Math.floor(score);
  state = "gameover";
}

// Input system: tilt if available, fallback to keyboard arrows.
function currentSteer() {
  if (input.hasTilt) {
    return input.tiltSteer;
  }
  return input.keyboardSteer;
}

function updateKeyboardSteer() {
  if (keys.ArrowLeft && !keys.ArrowRight) {
    input.keyboardSteer = -1;
  } else if (keys.ArrowRight && !keys.ArrowLeft) {
    input.keyboardSteer = 1;
  } else {
    input.keyboardSteer = 0;
  }
}

function requestTiltPermissionIfNeeded() {
  const orientation = window.DeviceOrientationEvent;
  if (!orientation) return;

  if (typeof orientation.requestPermission === "function") {
    tiltBtn.hidden = false;
    tiltBtn.addEventListener("click", async () => {
      try {
        const result = await orientation.requestPermission();
        if (result === "granted") {
          input.hasTilt = true;
          tiltBtn.hidden = true;
        }
      } catch {
        // Permission denied or unsupported request behavior.
      }
    });
  }
}

window.addEventListener("deviceorientation", (event) => {
  if (typeof event.gamma !== "number") return;
  const raw = clamp(event.gamma / 28, -1, 1);
  input.tiltSteer = input.tiltSteer * 0.75 + raw * 0.25;
  input.hasTilt = true;
});

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    keys[event.key] = true;
    updateKeyboardSteer();
  }

  if (event.key.toLowerCase() === "p" && state !== "title") {
    if (state === "running") {
      state = "paused";
      pauseBtn.textContent = "Resume";
    } else if (state === "paused") {
      state = "running";
      pauseBtn.textContent = "Pause";
    }
  }
});

window.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    keys[event.key] = false;
    updateKeyboardSteer();
  }
});

function triggerBoostFromTap() {
  if (state === "title") {
    startGame();
    return;
  }
  if (state === "running") {
    ship.triggerBoost();
  }
}

canvas.addEventListener("pointerdown", () => {
  touchedOnce = true;
  triggerBoostFromTap();
});

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", () => {
  if (state === "running") {
    state = "paused";
    pauseBtn.textContent = "Resume";
  } else if (state === "paused") {
    state = "running";
    pauseBtn.textContent = "Pause";
  }
});

// Core gameplay update: movement, spawning, collisions, and score growth.
function tick(dt) {
  difficulty += dt * 3;
  baseSpeed += dt * 8;
  speed = baseSpeed * ship.boostMultiplier();

  ship.update(dt, currentSteer(), width, height);
  obstacles.update(dt, speed, difficulty, width, height);
  collectibles.update(dt, speed, difficulty, width, height);

  score += dt * 6;
  score += collectibles.collect(ship.bounds());

  if (obstacles.collides(ship.bounds())) {
    endGame();
  }

  updateHud();
}

function drawSky() {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#0f172a");
  gradient.addColorStop(1, "#1e3a8a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255,255,255,0.18)";
  for (let i = 0; i < 18; i += 1) {
    const x = ((i * 137 + performance.now() * (0.01 + i * 0.001)) % (width + 200)) - 100;
    const y = (i * 53) % height;
    ctx.fillRect(x, y, 42, 2);
  }
}

// Render pass: world, HUD text, and state overlays (title/pause/game over).
function draw() {
  drawSky();
  if (ship && obstacles && collectibles) {
    collectibles.draw(ctx);
    obstacles.draw(ctx);
    ship.draw(ctx);
  }

  if (state === "title") {
    drawOverlay("Sky Drift", "Tap the canvas or press Start to fly");
  } else if (state === "paused") {
    drawOverlay("Paused", "Tap Resume or press P");
  } else if (state === "gameover") {
    drawOverlay("Game Over", `Final Score: ${finalScore}`);
  }

  if (!touchedOnce && state !== "title") {
    ctx.fillStyle = "rgba(15,23,42,0.7)";
    ctx.fillRect(12, height - 54, 260, 38);
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "14px Arial, sans-serif";
    ctx.fillText("Tap anywhere on the play area to boost", 24, height - 30);
  }
}

function drawOverlay(title, subtitle) {
  ctx.fillStyle = "rgba(2, 6, 23, 0.62)";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#f8fafc";
  ctx.font = `bold ${Math.max(28, width * 0.06)}px Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(title, width / 2, height * 0.43);
  ctx.font = `${Math.max(14, width * 0.022)}px Arial, sans-serif`;
  ctx.fillText(subtitle, width / 2, height * 0.52);
  ctx.textAlign = "left";
}

function loop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const dt = Math.min(0.032, (timestamp - lastTime) / 1000);
  lastTime = timestamp;

  if (state === "running") {
    tick(dt);
  }

  draw();
  requestAnimationFrame(loop);
}

applyResize();
resetRound();
requestTiltPermissionIfNeeded();
window.addEventListener("resize", applyResize);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    lastTime = 0;
  }
});
requestAnimationFrame(loop);
