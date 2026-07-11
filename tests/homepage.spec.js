import { expect, test } from "@playwright/test";

test("renders the Rosebeg identity and portfolio sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Rosebeg digital manifesto" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Who" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Works" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Social" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Contact" })).toBeVisible();
});

test("types the manifesto in the requested sequence with yellow roles", async ({ page }) => {
  await page.goto("/");
  const title = page.locator("[data-typewriter-title]");

  await expect(title).toContainText("This is Rosebeg", { timeout: 4000 });
  await expect(title).not.toContainText("This is Rosebeg.");
  await expect(title).toContainText("A personal portfolio", { timeout: 7000 });
  await expect(title).toContainText("A personal portfolio by HarryX", { timeout: 4000 });

  await expect(title).toContainText("I am a Developer", { timeout: 7000 });
  await expect(page.locator("[data-yellow-segment='developer']")).toHaveCSS("color", "rgb(255, 216, 102)");

  await expect(title).toContainText("I am a Researcher", { timeout: 5000 });
  await expect(page.locator("[data-yellow-segment='researcher']")).toHaveCSS("color", "rgb(255, 216, 102)");

  await expect(title).toContainText("I am a Photographer", { timeout: 5000 });
  await expect(page.locator("[data-yellow-segment='photographer']")).toHaveCSS("color", "rgb(255, 216, 102)");

  await expect(title).toContainText("Welcome to Rosebeg", { timeout: 8000 });
});

test("anchors the first sentence while typing spaces instead of re-centering every character", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-typewriter-title]")).toContainText("This is ", { timeout: 3000 });
  await expect(page.locator(".ascii-title-base [data-ascii-canvas]")).toHaveAttribute("data-align-mode", "anchored");
});

test("anchors the shared I am a prefix before the yellow role appears", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-typewriter-title]")).toContainText("I am a", { timeout: 13000 });
  await expect(page.locator(".ascii-title-base [data-ascii-canvas]")).toHaveAttribute("data-align-mode", "anchored");
});

test("briefly pauses on the shared I am a prefix before typing each role", async ({ page }) => {
  await page.goto("/");
  const title = page.locator("[data-typewriter-title]");
  await expect(title).toHaveText(/I am a_/, { timeout: 15000 });
  await page.waitForTimeout(160);
  await expect(title).toHaveText(/I am a_/);
});

test("uses the shader background and removes the old cable instrument", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-shader-background]")).toBeVisible();
  await expect(page.locator("[data-shader-background] canvas")).toBeVisible();
  await expect(page.locator(".shader-shade")).toHaveCount(0);
  await expect(page.locator("[data-cable-system]")).toHaveCount(0);
  await expect(page.getByText("0.78A")).toHaveCount(0);
});

test("opens a staggered right-side navigation panel", async ({ page }) => {
  await page.goto("/");
  const nav = page.locator("[data-signal-navigation]");
  const trigger = page.getByRole("button", { name: "Open navigation" });

  await expect(trigger).toBeVisible();
  await expect(nav).toBeVisible();

  await trigger.click();
  await expect(page.locator("[data-staggered-menu-panel]")).toBeVisible();
  await expect(page.getByText("Socials")).toBeVisible();
  await expect(page.getByRole("menuitem", { name: /projects/i })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: /contact/i })).toBeVisible();
  await expect(page.locator(".staggered-menu-number")).toHaveCount(5);

  await page.getByRole("menuitem", { name: /projects/i }).click();
  await expect(page).toHaveURL(/#works$/);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("pushes the page and oversized shared shader background when navigation opens", async ({ page }) => {
  await page.goto("/");
  const stage = page.locator("[data-page-stage]");
  const shader = page.locator("[data-shader-background]");
  const trigger = page.locator("[data-signal-navigation]");

  const stageBefore = await stage.boundingBox();
  const shaderBefore = await shader.boundingBox();

  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect.poll(async () => {
    return stage.evaluate((element) => {
      const matrix = new DOMMatrixReadOnly(window.getComputedStyle(element).transform);
      return matrix.m41;
    });
  }).toBeLessThan(-350);
  await expect.poll(async () => {
    return shader.evaluate((element) => {
      const matrix = new DOMMatrixReadOnly(window.getComputedStyle(element).transform);
      return matrix.m41;
    });
  }).toBeLessThan(-120);

  const stageAfter = await stage.boundingBox();
  const shaderAfter = await shader.boundingBox();

  expect(stageBefore).not.toBeNull();
  expect(stageAfter).not.toBeNull();
  expect(shaderBefore).not.toBeNull();
  expect(shaderAfter).not.toBeNull();
  expect(stageAfter.x).toBeLessThan(stageBefore.x - 350);
  expect(shaderAfter.x).toBeLessThan(shaderBefore.x - 120);
  expect(shaderAfter.x).toBeGreaterThan(stageAfter.x + 120);
  expect(shaderAfter.width).toBeGreaterThan(1440);
  expect(shaderAfter.height).toBe(shaderBefore.height);
  expect(shaderAfter.x + shaderAfter.width).toBeGreaterThanOrEqual(1440);

  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect.poll(async () => {
    return stage.evaluate((element) => {
      const matrix = new DOMMatrixReadOnly(window.getComputedStyle(element).transform);
      return matrix.m41;
    });
  }).toBeCloseTo(0, 0);
  await expect.poll(async () => {
    return shader.evaluate((element) => {
      const matrix = new DOMMatrixReadOnly(window.getComputedStyle(element).transform);
      return matrix.m41;
    });
  }).toBeCloseTo(0, 0);
});

test("keeps navigation, page, and background aligned during rapid toggles", async ({ page }) => {
  await page.goto("/");
  const stage = page.locator("[data-page-stage]");
  const shader = page.locator("[data-shader-background]");
  const panel = page.locator("[data-staggered-menu-panel]");
  const trigger = page.locator("[data-signal-navigation]");

  await trigger.click();
  await page.waitForTimeout(120);
  await trigger.click();
  await page.waitForTimeout(120);
  await trigger.click();
  await page.waitForTimeout(120);
  await trigger.click();

  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect.poll(async () => {
    return stage.evaluate((element) => {
      const matrix = new DOMMatrixReadOnly(window.getComputedStyle(element).transform);
      return matrix.m41;
    });
  }).toBeCloseTo(0, 0);
  await expect.poll(async () => {
    return shader.evaluate((element) => {
      const matrix = new DOMMatrixReadOnly(window.getComputedStyle(element).transform);
      return matrix.m41;
    });
  }).toBeCloseTo(0, 0);
  await expect.poll(async () => {
    return panel.evaluate((element) => {
      const matrix = new DOMMatrixReadOnly(window.getComputedStyle(element).transform);
      return matrix.m41;
    });
  }).toBeGreaterThan(400);
});

test("moves the shader background slowly upward while scrolling", async ({ page }) => {
  await page.goto("/");
  const canvas = page.locator("[data-shader-background] canvas");
  await expect(canvas).toHaveAttribute("data-parallax-offset", /[-0-9.]+/);
  const before = Number(await canvas.getAttribute("data-parallax-offset"));
  await page.evaluate(() => window.scrollTo({ top: 1400, behavior: "instant" }));
  await expect.poll(async () => Number(await canvas.getAttribute("data-parallax-offset"))).toBeGreaterThan(before + 0.05);
});

test("keeps the shader background continuously flowing while idle", async ({ page }) => {
  await page.goto("/");
  const canvas = page.locator("[data-shader-background] canvas");
  await expect(canvas).toHaveAttribute("data-shader-time", /[-0-9.]+/);
  const before = Number(await canvas.getAttribute("data-shader-time"));
  await expect.poll(async () => Number(await canvas.getAttribute("data-shader-time"))).toBeGreaterThan(before + 0.08);
});

test("layers scroll parallax on top of the continuous shader flow", async ({ page }) => {
  await page.goto("/");
  const canvas = page.locator("[data-shader-background] canvas");
  await expect(canvas).toHaveAttribute("data-flow-offset-y", /[-0-9.]+/);
  await expect(canvas).toHaveAttribute("data-parallax-offset", /[-0-9.]+/);

  const flowBefore = Number(await canvas.getAttribute("data-flow-offset-y"));
  const parallaxBefore = Number(await canvas.getAttribute("data-parallax-offset"));
  await page.waitForTimeout(600);
  const flowAfterIdle = Number(await canvas.getAttribute("data-flow-offset-y"));
  expect(flowAfterIdle).toBeLessThan(flowBefore - 0.005);

  await page.evaluate(() => window.scrollTo({ top: 1400, behavior: "instant" }));
  await expect.poll(async () => Number(await canvas.getAttribute("data-parallax-offset"))).toBeGreaterThan(
    parallaxBefore + 0.05
  );
  await expect.poll(async () => Number(await canvas.getAttribute("data-flow-offset-y"))).toBeLessThan(
    flowAfterIdle - 0.005
  );
});

test("keeps the hero as an unframed ASCII-only title stage", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".topbar")).toHaveCount(0);
  await expect(page.locator(".hero-frame")).toHaveCount(0);
  await expect(page.locator(".hero-stage")).toBeVisible();
  await expect(page.getByText("Personal website and digital portfolio of Ha22yX.")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "View Work" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Contact" })).toHaveCount(0);
});

test("layers an ASCII text renderer over the typewriter title", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-ascii-title]")).toBeVisible();
  await expect(page.locator(".ascii-title-base pre")).toBeVisible();
  await expect(page.locator(".ascii-title-accent pre")).toBeVisible();
  await expect(page.locator("[data-typewriter-title]")).toContainText("Welcome to Rosebeg", {
    timeout: 28000,
  });
});

test("exposes editable project and social placeholders", async ({ page }) => {
  await page.goto("/");
  for (const label of ["Project 01", "Project 02", "Project 03", "Archive", "GitHub", "X", "Instagram", "Email"]) {
    await expect(page.getByRole("link", { name: label })).toBeVisible();
  }
});
