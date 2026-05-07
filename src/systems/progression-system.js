export function createProgressionSystem({ lives = 3 } = {}) {
  return {
    lives,
    score: 0,
    status: 'menu',
    onBrickHit(brick) {
      if (brick.destroyed) {
        this.score += brick.scoreValue ?? 100;
      } else {
        this.score += 25;
      }
    },
    onBallLost() {
      this.lives -= 1;
      if (this.lives <= 0) {
        this.status = 'gameover';
      }
    },
    evaluateLevel(bricks) {
      if (bricks.every((brick) => brick.destroyed)) {
        this.status = 'levelclear';
      }
    },
    setStatus(nextStatus) {
      this.status = nextStatus;
    },
  };
}
