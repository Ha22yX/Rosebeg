import { expect, test } from "@playwright/test";

test("wraps the homepage in a unified Signal Archive visual system", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("[data-archive-experience='signal-archive']")).toBeVisible();
  await expect(page.locator("[data-archive-field]")).toBeVisible();

  for (const section of ["hero", "who", "works", "photos", "social", "contact"]) {
    await expect(page.locator(`#${section}`)).toHaveAttribute("data-archive-section", section);
  }
});

test("exposes Signal Archive palette tokens and section surfaces", async ({ page }) => {
  await page.goto("/");

  const tokens = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return {
      cyan: style.getPropertyValue("--archive-cyan").trim(),
      lilac: style.getPropertyValue("--archive-lilac").trim(),
      surface: style.getPropertyValue("--archive-surface").trim(),
    };
  });

  expect(tokens).toEqual({
    cyan: "#93f3ff",
    lilac: "#dacbe1",
    surface: "rgb(7 8 14 / 0.44)",
  });

  await expect(page.locator("[data-archive-section='contact'] .contact-terminal")).toHaveCSS(
    "border-top-color",
    "rgba(147, 243, 255, 0.22)"
  );
});

test("defines shared Signal Archive material and motion tokens", async ({ page }) => {
  await page.goto("/");

  const tokens = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return {
      glassBorder: style.getPropertyValue("--archive-glass-border").trim(),
      glassHighlight: style.getPropertyValue("--archive-glass-highlight").trim(),
      radiusPanel: style.getPropertyValue("--archive-radius-panel").trim(),
      radiusInner: style.getPropertyValue("--archive-radius-inner").trim(),
      motionDuration: style.getPropertyValue("--archive-motion-duration").trim(),
      motionEase: style.getPropertyValue("--archive-motion-ease").trim(),
      enterY: style.getPropertyValue("--archive-enter-y").trim(),
    };
  });

  expect(tokens).toEqual({
    glassBorder: "rgb(147 243 255 / 0.2)",
    glassHighlight: "rgb(218 203 225 / 0.16)",
    radiusPanel: "14px",
    radiusInner: "8px",
    motionDuration: "720ms",
    motionEase: "cubic-bezier(0.16, 1, 0.3, 1)",
    enterY: "26px",
  });

  await expect(page.locator("[data-archive-section='who']")).toHaveCSS(
    "animation-name",
    "archive-section-enter"
  );
  await expect(page.locator("[data-archive-section='who']")).toHaveCSS("animation-duration", "0.72s");
});

test("uses one signal-glass material across identity cards and hardware ports", async ({ page }) => {
  await page.goto("/");
  await page.locator("#who").scrollIntoViewIfNeeded();

  const chromaCard = page.locator("#who .chroma-card").first();
  await expect(chromaCard).toHaveCSS("border-top-color", "rgba(147, 243, 255, 0.2)");
  await expect(chromaCard).toHaveCSS("border-top-left-radius", "14px");

  const chromaRhythm = await chromaCard.evaluate((card) => {
    const style = getComputedStyle(card);
    return {
      transitionDuration: style.transitionDuration,
      transitionTimingFunction: style.transitionTimingFunction,
      boxShadow: style.boxShadow,
    };
  });
  expect(chromaRhythm.transitionDuration).toContain("0.26s");
  expect(chromaRhythm.transitionTimingFunction).toContain("cubic-bezier(0.16, 1, 0.3, 1)");
  expect(chromaRhythm.boxShadow).toContain("rgba(2, 3, 18");

  await page.locator("#social").scrollIntoViewIfNeeded();
  const drive = page.locator("[data-hardware-drive]");
  await expect(drive).toHaveCSS("border-top-color", "rgba(147, 243, 255, 0.22)");
  await expect(drive).toHaveCSS("border-top-left-radius", "14px");
});

test("brings the embedded code works frame into the archive palette", async ({ page }) => {
  await page.goto("/");
  await page.locator("#works").scrollIntoViewIfNeeded();

  const frame = page.frameLocator("iframe[title='Selected Code Works']");
  await expect(frame.locator("[data-project-card-swap-section]")).toHaveAttribute(
    "data-archive-section",
    "works-archive"
  );

  const frameCyan = await frame.locator(":root").evaluate((root) =>
    getComputedStyle(root).getPropertyValue("--archive-cyan").trim()
  );
  expect(frameCyan).toBe("#93f3ff");

  const frameTokens = await frame.locator(":root").evaluate((root) => {
    const style = getComputedStyle(root);
    return {
      border: style.getPropertyValue("--border").trim(),
      folder: style.getPropertyValue("--folder").trim(),
    };
  });
  expect(frameTokens).toEqual({
    border: "rgba(147, 243, 255, 0.2)",
    folder: "#b88a2d",
  });

  const cardFrame = frame.locator(".card-frame").first();
  await expect(cardFrame).toHaveCSS("border-top-color", "rgba(147, 243, 255, 0.2)");
  await expect(cardFrame).toHaveCSS("border-top-left-radius", "14px");
});

test("keeps visible word gaps in the embedded code works title", async ({ page }) => {
  await page.goto("/");
  await page.locator("#works").scrollIntoViewIfNeeded();

  const frame = page.frameLocator("iframe[title='Selected Code Works']");
  const spaces = frame.locator("[data-text-pressure] .text-pressure-title span[data-title-space='true']");
  await expect(spaces).toHaveCount(2);

  const spaceWidths = await spaces.evaluateAll((nodes) =>
    nodes.map((node) => Number.parseFloat(getComputedStyle(node).width))
  );
  expect(spaceWidths.every((width) => width >= 8)).toBe(true);
});

test("wraps the full photography field with the archive lens frame", async ({ page }) => {
  await page.goto("/");
  await page.locator("#photos").scrollIntoViewIfNeeded();

  const lensFrame = page.locator("#photos [data-lens-frame]");
  const infiniteMenu = page.locator("#photos [data-infinite-menu]");
  await expect(lensFrame).toBeVisible();
  await expect(infiniteMenu).toBeVisible();
  await expect(lensFrame).toHaveCSS("border-top-width", "0px");
  await expect(lensFrame).toHaveCSS("border-bottom-width", "0px");
  await expect(lensFrame).toHaveCSS("border-left-width", "0px");
  await expect(lensFrame).toHaveCSS("border-right-width", "0px");
  await expect(lensFrame).toHaveCSS("opacity", "0.42");

  const beforeBackgroundSize = await lensFrame.evaluate((frame) =>
    getComputedStyle(frame, "::before").backgroundSize
  );
  expect(beforeBackgroundSize).not.toContain("100% 1px");
  const fieldMask = await lensFrame.evaluate((frame) => {
    const style = getComputedStyle(frame);
    return style.maskImage || style.webkitMaskImage;
  });
  expect(fieldMask).toContain("linear-gradient");

  const coverage = await lensFrame.evaluate((frame) => {
    const frameRect = frame.getBoundingClientRect();
    const menuRect = frame.closest("#photos")?.querySelector("[data-infinite-menu]")?.getBoundingClientRect();

    if (!menuRect) {
      return { leftDelta: Infinity, rightDelta: Infinity, topDelta: Infinity, bottomDelta: Infinity };
    }

    return {
      leftDelta: Math.abs(frameRect.left - menuRect.left),
      rightDelta: Math.abs(frameRect.right - menuRect.right),
      topDelta: Math.abs(frameRect.top - menuRect.top),
      bottomDelta: Math.abs(frameRect.bottom - menuRect.bottom),
    };
  });

  expect(coverage.leftDelta).toBeLessThan(4);
  expect(coverage.rightDelta).toBeLessThan(4);
  expect(coverage.topDelta).toBeLessThan(6);
  expect(coverage.bottomDelta).toBeLessThan(6);

  await expect(page.locator("#photos .face-title")).toHaveCSS("text-shadow", /rgba\(147, 243, 255/);
  await expect(page.locator("#photos .face-description")).toHaveCSS("text-shadow", /rgba\(2, 3, 18/);
});

test("presents the contact terminal as finished admissions-ready copy", async ({ page }) => {
  await page.goto("/");
  await page.locator("#contact").scrollIntoViewIfNeeded();

  const contact = page.locator("[data-archive-section='contact']");
  await expect(contact).not.toContainText(/replace/i);
  await expect(contact).toContainText("admissions conversations");
  await expect(contact.getByRole("link", { name: "hello@rosebeg.com" })).toHaveAttribute(
    "href",
    "mailto:hello@rosebeg.com"
  );
});
