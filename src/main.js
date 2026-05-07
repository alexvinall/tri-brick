import { GameState } from './game-state.js';

const WIDTH = 800;
const HEIGHT = 600;

const canvas = document.getElementById('game');
const statusEl = document.getElementById('status');

if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Missing #game canvas element');
}

canvas.width = WIDTH;
canvas.height = HEIGHT;
const ctx = canvas.getContext('2d');

if (!ctx) {
  throw new Error('Could not get 2D canvas context');
}

const game = new GameState({ width: WIDTH, height: HEIGHT, inputTarget: window });
game.start();

function drawTriangle(points, style = {}) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  ctx.lineTo(points[1].x, points[1].y);
  ctx.lineTo(points[2].x, points[2].y);
  ctx.closePath();
  ctx.fillStyle = style.fill ?? '#f59e0b';
  ctx.strokeStyle = style.stroke ?? '#0f172a';
  ctx.lineWidth = style.strokeWidth ?? 1;
  ctx.fill();
  ctx.stroke();
}

function render(state) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(state.bat.x, HEIGHT - 20, state.bat.width, 12);

  ctx.beginPath();
  ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#f8fafc';
  ctx.fill();

  for (const brick of state.bricks) {
    if (!brick.destroyed) drawTriangle(brick.points, brick.style);
  }

  statusEl.textContent = `Score: ${state.progression.score} | Lives: ${state.progression.lives} | Mode: ${state.mode}`;
}

function loop(now) {
  const state = game.step(now / 1000);
  render(state);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
