import { expect, test } from "@playwright/test";

import { lazySmoothScrollConfig, lazySmoothScrollWheelMultiplier, stepScrollMotion } from "../components/ui/scroll-motion";

test("scroll motion accelerates toward a capped chase speed", () => {
  const config = {
    maxSpeed: 1800,
    acceleration: 7200,
    settleDistance: 0.5,
  };
  let state = { position: 0, velocity: 0 };
  let previousSpeed = 0;
  let reachedCruise = false;

  for (let frame = 0; frame < 40; frame += 1) {
    state = stepScrollMotion(state, 1800, 1000 / 60, config);
    const speed = Math.abs(state.velocity);

    expect(state.position).toBeGreaterThanOrEqual(0);
    expect(speed).toBeLessThanOrEqual(config.maxSpeed + 1);

    if (frame < 8) {
      expect(speed).toBeGreaterThanOrEqual(previousSpeed);
    }

    if (speed > config.maxSpeed * 0.94) {
      reachedCruise = true;
    }

    previousSpeed = speed;
  }

  expect(reachedCruise).toBe(true);
  expect(state.position).toBeLessThan(1800);
});

test("default smooth scroll tuning feels lazy rather than snappy", () => {
  expect(lazySmoothScrollConfig.maxSpeed).toBeLessThanOrEqual(1500);
  expect(lazySmoothScrollConfig.acceleration).toBeLessThanOrEqual(3800);
  expect(lazySmoothScrollWheelMultiplier).toBeLessThan(1);

  let state = { position: 0, velocity: 0 };
  const target = 1400 * lazySmoothScrollWheelMultiplier;

  for (let frame = 0; frame < 24; frame += 1) {
    state = stepScrollMotion(state, target, 1000 / 60, lazySmoothScrollConfig);
  }

  expect(state.position).toBeGreaterThan(220);
  expect(state.position).toBeLessThan(520);

  for (let frame = 0; frame < 120; frame += 1) {
    state = stepScrollMotion(state, target, 1000 / 60, lazySmoothScrollConfig);
  }

  expect(state.position).toBeCloseTo(target, 0);
  expect(state.velocity).toBe(0);
});

test("scroll motion eases out near the target instead of snapping", () => {
  const config = {
    maxSpeed: 1800,
    acceleration: 7200,
    settleDistance: 0.5,
  };
  let state = { position: 1720, velocity: 900 };
  const speeds = [];

  for (let frame = 0; frame < 24; frame += 1) {
    state = stepScrollMotion(state, 1800, 1000 / 60, config);
    speeds.push(Math.abs(state.velocity));
  }

  expect(Math.max(...speeds)).toBeLessThanOrEqual(config.maxSpeed);
  expect(speeds.at(-1)).toBeLessThan(speeds[0]);
  expect(Math.abs(state.position - 1800)).toBeLessThan(4);
});

test("scroll motion eases into the target without overshooting", () => {
  const config = {
    maxSpeed: 1800,
    acceleration: 7200,
    settleDistance: 0.5,
  };
  let state = { position: 1490, velocity: 1500 };

  for (let frame = 0; frame < 12; frame += 1) {
    state = stepScrollMotion(state, 1512, 50, config);
    expect(state.position).toBeLessThanOrEqual(1512);
  }

  expect(state.position).toBe(1512);
  expect(state.velocity).toBe(0);
});

test("scroll motion follows reverse targets without overshooting wildly", () => {
  const config = {
    maxSpeed: 1600,
    acceleration: 6800,
    settleDistance: 0.5,
  };
  let state = { position: 900, velocity: 1200 };

  for (let frame = 0; frame < 45; frame += 1) {
    state = stepScrollMotion(state, 100, 1000 / 60, config);
    expect(Math.abs(state.velocity)).toBeLessThanOrEqual(config.maxSpeed + 1);
  }

  expect(state.position).toBeGreaterThanOrEqual(100);
  expect(state.position).toBeLessThan(900);
});
