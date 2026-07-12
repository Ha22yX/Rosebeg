const defaultFrameDuration = 1000 / 60;

export type MotionVector3 = readonly [number, number, number];

export function clampMotionValue(value: number, limit: number) {
  const safeLimit = Math.max(0, limit);
  return Math.max(-safeLimit, Math.min(safeLimit, value));
}

export function dampMotionValue(
  current: number,
  target: number,
  smoothing: number,
  deltaTime: number,
  frameDuration = defaultFrameDuration
) {
  if (!Number.isFinite(current) || !Number.isFinite(target)) {
    return Number.isFinite(target) ? target : 0;
  }

  const normalizedDelta = Math.max(0, deltaTime) / frameDuration;
  const clampedSmoothing = Math.max(0, Math.min(1, smoothing));
  const alpha = 1 - Math.pow(1 - clampedSmoothing, normalizedDelta);
  return current + (target - current) * alpha;
}

export function dampMotionVector3(
  current: MotionVector3,
  target: MotionVector3,
  smoothing: number,
  deltaTime: number,
  frameDuration = defaultFrameDuration
): [number, number, number] {
  return [
    dampMotionValue(current[0], target[0], smoothing, deltaTime, frameDuration),
    dampMotionValue(current[1], target[1], smoothing, deltaTime, frameDuration),
    dampMotionValue(current[2], target[2], smoothing, deltaTime, frameDuration),
  ];
}

export function motionVectorLength3(value: MotionVector3) {
  return Math.hypot(value[0], value[1], value[2]);
}

export function normalizeMotionVector3(value: MotionVector3, fallback: MotionVector3): [number, number, number] {
  const length = motionVectorLength3(value);

  if (length <= 0.000001 || !Number.isFinite(length)) {
    return [fallback[0], fallback[1], fallback[2]];
  }

  return [value[0] / length, value[1] / length, value[2] / length];
}

export function springMotionValue(
  value: number,
  velocity: number,
  target: number,
  options: {
    stiffness: number;
    damping: number;
    deltaTime: number;
  }
) {
  const deltaSeconds = Math.min(0.05, Math.max(0, options.deltaTime) / 1000);
  const stiffness = Math.max(0, options.stiffness);
  const damping = Math.max(0, options.damping);
  const displacement = target - value;
  const acceleration = displacement * stiffness - velocity * damping;
  const nextVelocity = velocity + acceleration * deltaSeconds;
  const nextValue = value + nextVelocity * deltaSeconds;

  if (Math.abs(target - nextValue) < 0.0001 && Math.abs(nextVelocity) < 0.0001) {
    return { value: target, velocity: 0 };
  }

  return { value: nextValue, velocity: nextVelocity };
}

export function dragStretchTarget(velocity: number, velocityLimit: number, maxStretch = 0.16) {
  const safeLimit = Math.max(0.0001, Math.abs(velocityLimit));
  const safeMaxStretch = Math.max(0, maxStretch);
  const normalizedVelocity = Math.min(1, Math.abs(velocity) / safeLimit);

  if (normalizedVelocity <= 0) {
    return 0;
  }

  return safeMaxStretch * Math.pow(normalizedVelocity, 0.55);
}
