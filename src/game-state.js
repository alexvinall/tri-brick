import { Bat, Ball, Brick } from './entities.js';
import { createInputSystem } from './systems/input-system.js';
import { resolveCollisions } from './systems/collision-system.js';
import { createProgressionSystem } from './systems/progression-system.js';

const FIXED_DT = 1 / 120;
const MAX_FRAME = 0.25;
const TRIANGLE_TILE_W = 64;
const TRIANGLE_TILE_H = 56;

export class GameState {
  constructor({ width = 800, height = 600, inputTarget = window } = {}) {
    this.viewport = { width, height };
    this.mode = 'menu';
    this.bat = new Bat({ x: width / 2 - 60 });
    this.ball = new Ball({ x: width / 2, y: height - 48, active: false });
    this.bricks = this.createLevel();
    this.progression = createProgressionSystem({ lives: 3 });
    this.inputSystem = createInputSystem(inputTarget);

    this.accumulator = 0;
    this.lastTime = 0;
  }

  createLevel() {
    const tileW = TRIANGLE_TILE_W;
    const tileH = TRIANGLE_TILE_H;
    const rowCount = Math.max(4, Math.floor(this.viewport.width / (tileW * 1.6)));
    const colCount = Math.max(6, Math.floor(this.viewport.width / tileW));
    const gridTop = 64;
    const startX = Math.max(0, (this.viewport.width - colCount * tileW) / 2);

    const bricks = [];
    for (let r = 0; r < rowCount; r += 1) {
      for (let c = 0; c < colCount; c += 1) {
        const orientation = (r + c) % 2 === 0 ? 'up' : 'down';
        const x = startX + c * tileW;
        const y = gridTop + r * tileH;

        const points =
          orientation === 'up'
            ? [
                { x, y: y + tileH },
                { x: x + tileW, y: y + tileH },
                { x: x + tileW / 2, y },
              ]
            : [
                { x, y },
                { x: x + tileW, y },
                { x: x + tileW / 2, y: y + tileH },
              ];

        const hitpoints = r < 2 ? 2 : 1;
        bricks.push(
          new Brick({
            points,
            hitpoints,
            hp: hitpoints,
            scoreValue: hitpoints * 100,
            themeId: orientation === 'up' ? 'amber' : 'violet',
            powerupChance: 0.08,
            orientation,
            gridPosition: { row: r, column: c },
          }),
        );
      }
    }

    return bricks;
  }

  start() {
    this.mode = 'playing';
    this.progression.setStatus('playing');
    this.ball.active = true;
    this.lastTime = performance.now() / 1000;
  }

  pause() {
    this.mode = 'paused';
    this.progression.setStatus('paused');
  }

  resume() {
    this.mode = 'playing';
    this.progression.setStatus('playing');
  }

  step(nowSeconds) {
    const frame = Math.min(MAX_FRAME, nowSeconds - this.lastTime);
    this.lastTime = nowSeconds;

    if (this.mode !== 'playing') {
      return this.render(1);
    }

    this.accumulator += frame;
    while (this.accumulator >= FIXED_DT) {
      this.update(FIXED_DT);
      this.accumulator -= FIXED_DT;
    }

    const interp = this.accumulator / FIXED_DT;
    return this.render(interp);
  }

  update(dt) {
    const inputDirection = this.inputSystem.applyToBat(this.bat, this.viewport.width);
    this.bat.x += inputDirection * this.bat.speed * dt;
    this.bat.x = Math.max(0, Math.min(this.viewport.width - this.bat.width, this.bat.x));

    if (this.ball.active) {
      this.ball.position.x += this.ball.velocity.x * dt;
      this.ball.position.y += this.ball.velocity.y * dt;
    }

    const collisions = resolveCollisions({
      ball: this.ball,
      bat: this.bat,
      bricks: this.bricks,
      bounds: { left: 0, right: this.viewport.width, top: 0, bottom: this.viewport.height },
    });

    if (collisions.hitBrick) {
      this.progression.onBrickHit(collisions.hitBrick);
    }

    if (collisions.lostBall) {
      this.progression.onBallLost();
      if (this.progression.status === 'gameover') {
        this.mode = 'gameover';
      } else {
        this.ball.position.x = this.bat.x + this.bat.width / 2;
        this.ball.position.y = this.viewport.height - 48;
        this.ball.velocity.x = 200;
        this.ball.velocity.y = -240;
        this.ball.active = true;
      }
    }

    this.progression.evaluateLevel(this.bricks);
    if (this.progression.status === 'levelclear') {
      this.mode = 'levelclear';
    }
  }

  render(interp = 1) {
    return {
      mode: this.mode,
      interpolation: interp,
      bat: {
        x: this.bat.x,
        width: this.bat.width,
      },
      ball: {
        x: this.ball.position.x,
        y: this.ball.position.y,
        radius: this.ball.radius,
        active: this.ball.active,
      },
      bricks: this.bricks.map((brick) => ({
        points: brick.points,
        hitpoints: brick.hitpoints,
        hp: brick.hp,
        scoreValue: brick.scoreValue,
        themeId: brick.themeId,
        powerupChance: brick.powerupChance,
        orientation: brick.orientation,
        gridPosition: brick.gridPosition,
        style: {
          fill: brick.orientation === 'up' ? '#f59e0b' : '#8b5cf6',
          stroke: '#0f172a',
          strokeWidth: 1,
        },
        destroyed: brick.destroyed,
      })),
      progression: {
        lives: this.progression.lives,
        score: this.progression.score,
        status: this.progression.status,
      },
    };
  }
}
