export function createProgressionSystem({ lives = 3 } = {}) {
  return {
    lives,
    score: 0,
    status: 'menu',
    onBrickHit(brick) {
      this.score += brick.destroyed ? 100 : 25;
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
