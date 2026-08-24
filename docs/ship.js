export class Ship {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.velocityX = 0;
    this.velocityY = 0;
    this.boostTimer = 0;
    this.boostCooldown = 0;
  }

  // Main movement system: steer from tilt/keyboard/touch and constrain inside the play field.
  update(dt, steer, steerY, width, height) {
    const acceleration = 900;
    const drag = 0.9;

    this.velocityX += steer * acceleration * dt;
    this.velocityX *= drag;
    this.x += this.velocityX * dt;

    this.velocityY += steerY * acceleration * dt;
    this.velocityY *= drag;
    this.y += this.velocityY * dt;

    const leftBound = this.size;
    const rightBound = width - this.size;
    this.x = Math.max(leftBound, Math.min(rightBound, this.x));

    const topBound = this.size;
    const bottomBound = height - this.size;
    this.y = Math.max(topBound, Math.min(bottomBound, this.y));

    if (this.boostTimer > 0) {
      this.boostTimer = Math.max(0, this.boostTimer - dt);
    }

    if (this.boostCooldown > 0) {
      this.boostCooldown = Math.max(0, this.boostCooldown - dt);
    }
  }

  triggerBoost() {
    if (this.boostCooldown > 0) return false;
    this.boostTimer = 0.22;
    this.boostCooldown = 0.28;
    return true;
  }

  boostMultiplier() {
    return this.boostTimer > 0 ? 1.8 : 1;
  }

  bounds() {
    return {
      x: this.x,
      y: this.y,
      radius: this.size * 0.55,
    };
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.boostTimer > 0) {
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(-this.size * 0.85, 0, this.size * 0.28, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#22d3ee";
    ctx.beginPath();
    ctx.moveTo(this.size, 0);
    ctx.lineTo(-this.size * 0.65, -this.size * 0.6);
    ctx.lineTo(-this.size * 0.65, this.size * 0.6);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#e2e8f0";
    ctx.beginPath();
    ctx.arc(this.size * 0.1, 0, this.size * 0.22, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
