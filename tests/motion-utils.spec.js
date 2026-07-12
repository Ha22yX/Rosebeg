import { expect, test } from "@playwright/test";

import {
  clampMotionValue,
  dampMotionValue,
  dampMotionVector3,
  dragStretchTarget,
  motionVectorLength3,
  normalizeMotionVector3,
  springMotionValue,
} from "../components/ui/motion-utils";

test("damps motion values without jumping to the target", () => {
  const firstFrame = dampMotionValue(0, 1, 0.24, 16.6667);
  expect(firstFrame).toBeGreaterThan(0);
  expect(firstFrame).toBeLessThan(0.5);

  let value = firstFrame;
  for (let frame = 0; frame < 18; frame += 1) {
    const next = dampMotionValue(value, 1, 0.24, 16.6667);
    expect(next).toBeGreaterThanOrEqual(value);
    expect(next).toBeLessThan(1);
    value = next;
  }

  expect(value).toBeGreaterThan(0.95);
});

test("clamps drag velocity to a deliberate visual range", () => {
  expect(clampMotionValue(0.12, 0.24)).toBe(0.12);
  expect(clampMotionValue(1.4, 0.24)).toBe(0.24);
  expect(clampMotionValue(-1.4, 0.24)).toBe(-0.24);
});

test("damps reversed drag vectors through low energy instead of snapping direction", () => {
  const current = [0.2, 0, 0];
  const target = [-0.2, 0, 0];
  const next = dampMotionVector3(current, target, 0.2, 16.6667);

  expect(next[0]).toBeGreaterThan(0);
  expect(next[0]).toBeLessThan(current[0]);
  expect(motionVectorLength3(next)).toBeLessThan(motionVectorLength3(current));

  let value = next;
  for (let frame = 0; frame < 4; frame += 1) {
    value = dampMotionVector3(value, target, 0.2, 16.6667);
  }

  expect(value[0]).toBeLessThan(0);
  expect(motionVectorLength3(value)).toBeLessThan(0.2);
  expect(normalizeMotionVector3([0, 0, 0], [0, 1, 0])).toEqual([0, 1, 0]);
});

test("springs released stretch back without a sudden collapse", () => {
  let value = 0.14;
  let velocity = 0;
  let largestDrop = 0;

  for (let frame = 0; frame < 24; frame += 1) {
    const next = springMotionValue(value, velocity, 0, {
      stiffness: 92,
      damping: 15,
      deltaTime: 16.6667,
    });
    largestDrop = Math.max(largestDrop, Math.abs(next.value - value));
    value = next.value;
    velocity = next.velocity;
  }

  expect(largestDrop).toBeLessThan(0.026);
  expect(Math.abs(value)).toBeLessThan(0.015);
});

test("keeps moderate drag velocity visually expressive", () => {
  expect(dragStretchTarget(0, 0.2, 0.16)).toBe(0);
  expect(dragStretchTarget(0.035, 0.2, 0.16)).toBeGreaterThan(0.055);
  expect(dragStretchTarget(0.2, 0.2, 0.16)).toBeCloseTo(0.16, 5);
  expect(dragStretchTarget(0.8, 0.2, 0.16)).toBeCloseTo(0.16, 5);
});
