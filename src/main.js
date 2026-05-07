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
  const gradient = ctx.createLinearGradient(points[2].x, points[2].y, points[0].x, points[0].y);
  gradient.addColorStop(0, style.fill ?? '#f59e0b');
  gradient.addColorStop(1, style.fill2 ?? '#22d3ee');
  ctx.fillStyle = gradient;
  ctx.strokeStyle = style.stroke ?? '#0f172a';
  ctx.lineWidth = style.strokeWidth ?? 1;
  ctx.shadowColor = style.glow ?? 'rgba(255,255,255,0.2)';
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function render(state) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  const bg = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  bg.addColorStop(0, '#0b1026');
  bg.addColorStop(1, '#1e1b4b');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  for (let i = 0; i < 24; i += 1) {
    const x = (i * 127) % WIDTH;
    const y = (i * 83) % HEIGHT;
    ctx.fillStyle = `rgba(56, 189, 248, ${0.05 + (i % 5) * 0.01})`;
    ctx.beginPath();
    ctx.arc(x, y, 1 + (i % 3), 0, Math.PI * 2);
    ctx.fill();
  }

  const batGrad = ctx.createLinearGradient(state.bat.x, HEIGHT - 24, state.bat.x + state.bat.width, HEIGHT - 8);
  batGrad.addColorStop(0, '#22d3ee');
  batGrad.addColorStop(1, '#a78bfa');
  ctx.fillStyle = batGrad;
  ctx.shadowColor = 'rgba(34, 211, 238, 0.6)';
  ctx.shadowBlur = 14;
  ctx.fillRect(state.bat.x, HEIGHT - 20, state.bat.width, 12);
  ctx.shadowBlur = 0;

  ctx.beginPath();
  ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
  const ballGrad = ctx.createRadialGradient(
    state.ball.x - state.ball.radius * 0.35,
    state.ball.y - state.ball.radius * 0.35,
    2,
    state.ball.x,
    state.ball.y,
    state.ball.radius,
  );
  ballGrad.addColorStop(0, '#ffffff');
  ballGrad.addColorStop(1, '#38bdf8');
  ctx.fillStyle = ballGrad;
  ctx.shadowColor = 'rgba(56, 189, 248, 0.8)';
  ctx.shadowBlur = 16;
  ctx.fill();
  ctx.shadowBlur = 0;

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
