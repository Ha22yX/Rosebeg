import { expect, test } from "@playwright/test";

test("standalone card swap page renders an animated card stack", async ({ page }) => {
  await page.goto("/card-swap-effect.html");

  await expect(page.getByRole("heading", { name: "CardSwap GSAP Demo" })).toBeVisible();
  await expect(page.locator("[data-card-swap-stage]")).toHaveAttribute("data-card-swap-ready", "true");
  await expect(page.locator(".swap-card")).toHaveCount(4);
  await expect(page.locator("[data-card-swap-stage]")).toHaveAttribute("data-front-card", "0");

  await page.waitForFunction(() => window.cardSwapDemo?.swapCount >= 1, undefined, { timeout: 5000 });

  await expect(page.locator("[data-card-swap-stage]")).toHaveAttribute("data-front-card", "1");
});

test("keeps the outgoing card in front while it drops out", async ({ page }) => {
  await page.goto("/card-swap-effect.html");
  await expect(page.locator("[data-card-swap-stage]")).toHaveAttribute("data-card-swap-ready", "true");

  await page.evaluate(() => {
    window.cardSwapDemo.pause();
    window.cardSwapDemo.swap();
  });

  await page.waitForTimeout(550);

  const outgoingZIndex = await page.locator("[data-card-index='0']").evaluate((card) => {
    return Number.parseInt(window.getComputedStyle(card).zIndex, 10);
  });

  expect(outgoingZIndex).toBe(4);
});

test("does not snap the second card to the front layer during the drop", async ({ page }) => {
  await page.goto("/card-swap-effect.html");
  await expect(page.locator("[data-card-swap-stage]")).toHaveAttribute("data-card-swap-ready", "true");

  await page.evaluate(() => {
    window.cardSwapDemo.pause();
    window.cardSwapDemo.swap();
  });

  await page.waitForTimeout(550);

  const secondCardZIndex = await page.locator("[data-card-index='1']").evaluate((card) => {
    return Number.parseInt(window.getComputedStyle(card).zIndex, 10);
  });

  expect(secondCardZIndex).toBe(3);
});

test("moves the second card without a launch jump", async ({ page }) => {
  await page.goto("/card-swap-effect.html");
  await expect(page.locator("[data-card-swap-stage]")).toHaveAttribute("data-card-swap-ready", "true");

  await page.evaluate(() => {
    window.cardSwapDemo.pause();
    window.cardSwapDemo.swap();
  });

  const samples = [];
  for (const ms of [180, 240, 280, 320, 360]) {
    const previousMs = samples.at(-1)?.ms ?? 0;
    await page.waitForTimeout(ms - previousMs);
    const left = await page.locator("[data-card-index='1']").evaluate((card) => card.getBoundingClientRect().left);
    samples.push({ ms, left });
  }

  const largestStep = Math.max(
    ...samples.slice(1).map((sample, index) => Math.abs(sample.left - samples[index].left))
  );

  expect(largestStep).toBeLessThanOrEqual(14);
});

test("finishes the active swap before selecting the hovered front card", async ({ page }) => {
  await page.goto("/card-swap-effect.html");
  const stage = page.locator("[data-card-swap-stage]");
  await expect(stage).toHaveAttribute("data-card-swap-ready", "true");

  await page.evaluate(() => {
    window.cardSwapDemo.pause();
    window.cardSwapDemo.swap();
  });
  await page.waitForTimeout(320);
  await stage.hover();

  await page.waitForFunction(() => window.cardSwapDemo?.swapCount >= 1, undefined, { timeout: 4000 });

  await expect(stage).toHaveAttribute("data-hovering", "true");
  await expect(page.locator("[data-card-index='1']")).toHaveAttribute("data-selected", "true");
});

test("shows a pointer and selected highlight when hovering an idle card", async ({ page }) => {
  await page.goto("/card-swap-effect.html");
  const stage = page.locator("[data-card-swap-stage]");
  const frontCard = page.locator("[data-card-index='0']");
  await expect(stage).toHaveAttribute("data-card-swap-ready", "true");

  await page.evaluate(() => window.cardSwapDemo.pause());
  await frontCard.hover();

  await expect(frontCard).toHaveAttribute("data-selected", "true");
  await expect(frontCard).toHaveCSS("cursor", "pointer");
  await expect(frontCard).toHaveCSS("border-color", "rgb(216, 255, 95)");
});
