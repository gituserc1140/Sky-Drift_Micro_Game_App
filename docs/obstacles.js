const OBSTACLE_TYPES = ["cloud", "rock", "bird"];

function randomType() {
  return OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
}

export class ObstacleField {
  constructor() {
    this.items = [];
    this.spawnTimer = 0;
  }

  // Spawning and movement: denser/faster obstacle flow as difficulty rises.
  update(dt, speed, difficulty, width, height) {
    const spawnInterval = Math.max(0.35, 1.35 - difficulty * 0.08);
    this.spawnTimer -= dt;

    while (this.spawnTimer <= 0) {
      this.spawnTimer += spawnInterval;
      this.spawn(width, height, difficulty);
    }

    for (const obstacle of this.items) {
      obstacle.x -= (speed + obstacle.extraSpeed) * dt;
      obstacle.y += Math.sin(obstacle.wobble) * obstacle.wobbleStrength * dt;
      obstacle.wobble += dt * 4;
    }

    this.items = this.items.filter((obstacle) => obstacle.x + obstacle.radius > -80);
  }

  spawn(width, height, difficulty) {
    const type = randomType();
    const radius = 16 + Math.random() * 22 + difficulty * 0.3;
    const margin = radius + 12;
    this.items.push({
      type,
      x: width + radius + Math.random() * width * 0.5,
      y: margin + Math.random() * (height - margin * 2),
      radius,
      extraSpeed: Math.random() * (50 + difficulty * 2),
      wobble: Math.random() * Math.PI * 2,
      wobbleStrength: type === "bird" ? 20 : 8,
    });
  }

  collides(shipBounds) {
    for (const obstacle of this.items) {
      const dx = obstacle.x - shipBounds.x;
      const dy = obstacle.y - shipBounds.y;
      const sum = obstacle.radius + shipBounds.radius * 0.9;
      if (dx * dx + dy * dy <= sum * sum) {
        return true;
      }
    }
    return false;
  }

  draw(ctx) {
    for (const obstacle of this.items) {
      if (obstacle.type === "cloud") {
        ctx.fillStyle = "#cbd5e1";
        ctx.beginPath();
        ctx.arc(obstacle.x, obstacle.y, obstacle.radius, 0, Math.PI * 2);
        ctx.arc(obstacle.x + obstacle.radius * 0.7, obstacle.y + 4, obstacle.radius * 0.7, 0, Math.PI * 2);
        ctx.arc(obstacle.x - obstacle.radius * 0.7, obstacle.y + 3, obstacle.radius * 0.65, 0, Math.PI * 2);
        ctx.fill();
      } else if (obstacle.type === "rock") {
        ctx.fillStyle = "#64748b";
        ctx.beginPath();
        ctx.moveTo(obstacle.x - obstacle.radius, obstacle.y + obstacle.radius * 0.7);
        ctx.lineTo(obstacle.x - obstacle.radius * 0.2, obstacle.y - obstacle.radius);
        ctx.lineTo(obstacle.x + obstacle.radius, obstacle.y - obstacle.radius * 0.3);
        ctx.lineTo(obstacle.x + obstacle.radius * 0.4, obstacle.y + obstacle.radius);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = "#f97316";
        ctx.beginPath();
        ctx.ellipse(obstacle.x, obstacle.y, obstacle.radius, obstacle.radius * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#334155";
        ctx.fillRect(obstacle.x - obstacle.radius * 0.15, obstacle.y - obstacle.radius * 0.12, obstacle.radius * 0.3, obstacle.radius * 0.24);
      }
    }
  }
}
