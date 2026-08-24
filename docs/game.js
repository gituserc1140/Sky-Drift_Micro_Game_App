const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function renderPlaceholder() {
  ctx.fillStyle = "#111827";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#22d3ee";
  ctx.font = "bold 42px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Your Game Starts Here", canvas.width / 2, canvas.height / 2 - 10);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "24px Inter, Arial, sans-serif";
  ctx.fillText("Edit docs/game.js to begin", canvas.width / 2, canvas.height / 2 + 36);
}

function start() {
  renderPlaceholder();
}

start();
