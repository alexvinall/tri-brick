function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
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
    ball.velocity.x += clamp(hitOffset, -1, 1) * 120;
  }

  for (const brick of bricks) {
    if (brick.destroyed) continue;
    if (pointInTriangle(ball.position, brick.points)) {
      brick.damage(1);
      ball.velocity.y *= -1;
      hitBrick = brick;
      break;
    }
  }

  return { hitBat, hitBrick, lostBall };
}
