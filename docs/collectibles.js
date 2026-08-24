export class CollectibleField {
  constructor() {
    this.items = [];
    this.spawnTimer = 0;
  }

  // Scoring system: orbs spawn in lanes and award points when collected.
  update(dt, speed, difficulty, width, height) {
    const spawnInterval = Math.max(0.45, 1.15 - difficulty * 0.05);
    this.spawnTimer -= dt;

    while (this.spawnTimer <= 0) {
      this.spawnTimer += spawnInterval;
      this.spawn(width, height);
    }

    for (const orb of this.items) {
      orb.x -= speed * dt;
      orb.phase += dt * 6;
      orb.y += Math.sin(orb.phase) * 0.35;
    }

    this.items = this.items.filter((orb) => orb.x + orb.radius > -60);
  }

  spawn(width, height) {
    const radius = 8 + Math.random() * 6;
    this.items.push({
      x: width + radius + Math.random() * width * 0.4,
      y: radius + 24 + Math.random() * (height - (radius + 24) * 2),
      radius,
      phase: Math.random() * Math.PI * 2,
    });
  }

  collect(shipBounds) {
    let gained = 0;
    this.items = this.items.filter((orb) => {
      const dx = orb.x - shipBounds.x;
      const dy = orb.y - shipBounds.y;
      const sum = orb.radius + shipBounds.radius * 0.85;
      const hit = dx * dx + dy * dy <= sum * sum;
      if (hit) gained += 10;
      return !hit;
    });
    return gained;
  }

  draw(ctx) {
    for (const orb of this.items) {
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fef08a";
      ctx.beginPath();
      ctx.arc(orb.x - orb.radius * 0.25, orb.y - orb.radius * 0.3, orb.radius * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
