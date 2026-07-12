export type ScrollMotionState = {
  position: number;
  velocity: number;
};

export type ScrollMotionConfig = {
  maxSpeed: number;
  acceleration: number;
  settleDistance: number;
};

export const lazySmoothScrollConfig: ScrollMotionConfig = {
  maxSpeed: 1450,
  acceleration: 3600,
  settleDistance: 0.5,
};

export const lazySmoothScrollWheelMultiplier = 0.94;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function moveToward(current: number, target: number, maxDelta: number) {
  if (Math.abs(target - current) <= maxDelta) {
    return target;
  }

  return current + Math.sign(target - current) * maxDelta;
}

export function clampScrollTarget(value: number, maxScroll: number) {
  return clamp(value, 0, Math.max(0, maxScroll));
}

export function normalizeWheelDelta(event: WheelEvent) {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    return event.deltaY * 36;
  }

  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return event.deltaY * window.innerHeight;
  }

  return event.deltaY;
}

export function stepScrollMotion(
  state: ScrollMotionState,
  target: number,
  deltaTime: number,
  config: ScrollMotionConfig
): ScrollMotionState {
  const deltaSeconds = clamp(deltaTime / 1000, 0, 0.05);
  const maxSpeed = Math.max(1, config.maxSpeed);
  const acceleration = Math.max(1, config.acceleration);
  const settleDistance = Math.max(0, config.settleDistance);
  const distance = target - state.position;
  const absDistance = Math.abs(distance);

  if (absDistance <= settleDistance && Math.abs(state.velocity) < 8) {
    return { position: target, velocity: 0 };
  }

  const direction = Math.sign(distance || -state.velocity || 1);
  const stoppingSpeed = Math.sqrt(Math.max(0, 2 * acceleration * Math.max(0, absDistance - settleDistance)));
  const desiredSpeed = Math.min(maxSpeed, stoppingSpeed);
  const desiredVelocity = direction * desiredSpeed;
  const nextVelocity = moveToward(state.velocity, desiredVelocity, acceleration * deltaSeconds);
  let nextPosition = state.position + nextVelocity * deltaSeconds;

  if ((target - state.position) * (target - nextPosition) <= 0) {
    nextPosition = target;
    return { position: nextPosition, velocity: 0 };
  }

  return {
    position: nextPosition,
    velocity: clamp(nextVelocity, -maxSpeed, maxSpeed),
  };
}
