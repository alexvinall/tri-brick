export class Bat {
  constructor({ x = 0, width = 120, speed = 460 } = {}) {
    this.x = x;
    this.width = width;
    this.speed = speed;
    this.input = {
      left: false,
      right: false,
      touchX: null,
    };
  }
}

export class Ball {
  constructor({ x = 0, y = 0, vx = 200, vy = -240, radius = 8, active = false } = {}) {
    this.position = { x, y };
    this.velocity = { x: vx, y: vy };
    this.radius = radius;
    this.active = active;
  }
}

export class Brick {
  constructor({
    points,
    hitpoints = 1,
    hp = hitpoints,
    scoreValue = 100,
    themeId = 'default',
    powerupChance = 0,
    orientation = 'up',
    gridPosition = { row: 0, column: 0 },
  } = {}) {
    if (!points || points.length !== 3) {
      throw new Error('Brick requires exactly 3 points for triangle geometry');
    }

    this.points = points.map((p) => ({ x: p.x, y: p.y }));
    this.hitpoints = hitpoints;
    this.hp = hp;
    this.scoreValue = scoreValue;
    this.themeId = themeId;
    this.powerupChance = powerupChance;
    this.orientation = orientation;
    this.gridPosition = { row: gridPosition.row, column: gridPosition.column };
    this.destroyed = false;
  }

  damage(amount = 1) {
    if (this.destroyed) return;
    this.hitpoints = Math.max(0, this.hitpoints - amount);
    this.hp = this.hitpoints;
    this.destroyed = this.hitpoints === 0;
  }
}
