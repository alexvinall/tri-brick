function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function length(x, y) {
  return Math.hypot(x, y);
}

function pointInTriangle(p, [a, b, c]) {
  const area = (x1, y1, x2, y2, x3, y3) =>
    (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2;

  const full = Math.abs(area(a.x, a.y, b.x, b.y, c.x, c.y));
  const a1 = Math.abs(area(p.x, p.y, b.x, b.y, c.x, c.y));
  const a2 = Math.abs(area(a.x, a.y, p.x, p.y, c.x, c.y));
  const a3 = Math.abs(area(a.x, a.y, b.x, b.y, p.x, p.y));

  return Math.abs(full - (a1 + a2 + a3)) < 0.01;
}

export function resolveCollisions({ ball, bat, bricks, bounds }) {
  if (!ball.active) return { hitBat: false, hitBrick: null, lostBall: false };

  let hitBat = false;
  let hitBrick = null;
  let lostBall = false;

  if (ball.position.x - ball.radius <= bounds.left) {
    ball.position.x = bounds.left + ball.radius;
    ball.velocity.x *= -1;
  } else if (ball.position.x + ball.radius >= bounds.right) {
    ball.position.x = bounds.right - ball.radius;
    ball.velocity.x *= -1;
  }

  if (ball.position.y - ball.radius <= bounds.top) {
    ball.position.y = bounds.top + ball.radius;
    ball.velocity.y *= -1;
  } else if (ball.position.y - ball.radius > bounds.bottom) {
    ball.active = false;
    lostBall = true;
  }

  const batTop = bounds.bottom - 20;
  const batLeft = bat.x;
  const batRight = bat.x + bat.width;

  if (
    ball.position.y + ball.radius >= batTop &&
    ball.position.y - ball.radius <= batTop + 12 &&
    ball.position.x >= batLeft &&
    ball.position.x <= batRight &&
    ball.velocity.y > 0
  ) {
    hitBat = true;
    ball.position.y = batTop - ball.radius;
    ball.velocity.y = -Math.abs(ball.velocity.y);
    const hitOffset = (ball.position.x - (batLeft + bat.width / 2)) / (bat.width / 2);
    ball.velocity.x += clamp(hitOffset, -1, 1) * 180;
    const speed = length(ball.velocity.x, ball.velocity.y);
    const targetSpeed = clamp(speed * 1.03, 260, 620);
    const scale = targetSpeed / Math.max(0.001, speed);
    ball.velocity.x *= scale;
    ball.velocity.y *= scale;
  }

  for (const brick of bricks) {
    if (brick.destroyed) continue;
    if (pointInTriangle(ball.position, brick.points)) {
      brick.damage(1);
      const center = {
        x: (brick.points[0].x + brick.points[1].x + brick.points[2].x) / 3,
        y: (brick.points[0].y + brick.points[1].y + brick.points[2].y) / 3,
      };
      const normalX = ball.position.x - center.x;
      const normalY = ball.position.y - center.y;
      const normalLength = length(normalX, normalY) || 1;
      const nx = normalX / normalLength;
      const ny = normalY / normalLength;
      const dot = ball.velocity.x * nx + ball.velocity.y * ny;
      ball.velocity.x -= 2 * dot * nx;
      ball.velocity.y -= 2 * dot * ny;
      const speed = length(ball.velocity.x, ball.velocity.y);
      const targetSpeed = clamp(speed * 1.015, 240, 680);
      const scale = targetSpeed / Math.max(0.001, speed);
      ball.velocity.x *= scale;
      ball.velocity.y *= scale;
      ball.position.x += nx * (ball.radius * 0.6);
      ball.position.y += ny * (ball.radius * 0.6);
      hitBrick = brick;
      break;
    }
  }

  return { hitBat, hitBrick, lostBall };
}
