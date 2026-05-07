export function createInputSystem(target = window) {
  const state = {
    left: false,
    right: false,
    touchX: null,
  };

  const keyMap = {
    ArrowLeft: 'left',
    ArrowRight: 'right',
    a: 'left',
    d: 'right',
  };

  const setKey = (key, value) => {
    const mapped = keyMap[key];
    if (mapped) state[mapped] = value;
  };

  const onKeyDown = (event) => setKey(event.key, true);
  const onKeyUp = (event) => setKey(event.key, false);

  const onTouchStart = (event) => {
    state.touchX = event.touches[0]?.clientX ?? null;
  };

  const onTouchMove = (event) => {
    state.touchX = event.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = () => {
    state.touchX = null;
  };

  target.addEventListener('keydown', onKeyDown);
  target.addEventListener('keyup', onKeyUp);
  target.addEventListener('touchstart', onTouchStart, { passive: true });
  target.addEventListener('touchmove', onTouchMove, { passive: true });
  target.addEventListener('touchend', onTouchEnd, { passive: true });
  target.addEventListener('touchcancel', onTouchEnd, { passive: true });

  return {
    getState: () => ({ ...state }),
    applyToBat(bat, worldWidth) {
      bat.input.left = state.left;
      bat.input.right = state.right;
      bat.input.touchX = state.touchX;

      let direction = 0;
      if (state.left) direction -= 1;
      if (state.right) direction += 1;

      if (state.touchX != null && Number.isFinite(worldWidth)) {
        const center = bat.x + bat.width / 2;
        direction = Math.sign(state.touchX - center);
      }

      return direction;
    },
    destroy() {
      target.removeEventListener('keydown', onKeyDown);
      target.removeEventListener('keyup', onKeyUp);
      target.removeEventListener('touchstart', onTouchStart);
      target.removeEventListener('touchmove', onTouchMove);
      target.removeEventListener('touchend', onTouchEnd);
      target.removeEventListener('touchcancel', onTouchEnd);
    },
  };
}
