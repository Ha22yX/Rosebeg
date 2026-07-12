import { expect, test } from "@playwright/test";

test("renders the Rosebeg identity and portfolio sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Rosebeg digital manifesto" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Who" })).toBeVisible();
  await expect(page.locator("[data-infinite-menu]")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Photography" })).toHaveCount(0);
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

test("keeps the shared role ASCII anchor stable across role changes", async ({ page }) => {
  await page.goto("/");
  const baseAscii = page.locator(".ascii-title-base [data-ascii-canvas]");

  await expect(page.locator("[data-typewriter-title]")).toContainText("I am a Developer", {
    timeout: 16000,
  });
  await expect(baseAscii).toHaveAttribute("data-anchor-text", "I am a Photographer");
  await expect(baseAscii).toHaveAttribute("data-ascii-font-size", "4");
  await expect(baseAscii).toHaveAttribute("data-resize-mode", "debounced");

  await expect(page.locator("[data-typewriter-title]")).toContainText("I am a Researcher", {
    timeout: 6000,
  });
  await expect(baseAscii).toHaveAttribute("data-anchor-text", "I am a Photographer");

  await expect(page.locator("[data-typewriter-title]")).toContainText("I am a Photographer", {
    timeout: 6000,
  });
  await expect(baseAscii).toHaveAttribute("data-anchor-text", "I am a Photographer");
});

test("recovers the ASCII title after narrowing and restoring the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const baseAscii = page.locator(".ascii-title-base [data-ascii-canvas]");
  const title = page.locator("[data-typewriter-title]");

  await expect(title).toContainText("This is Rosebeg", { timeout: 4000 });
  await expect(baseAscii).toHaveAttribute("data-resize-mode", "debounced");
  await expect(baseAscii).toHaveAttribute("data-ascii-font-size", "4");

  await page.setViewportSize({ width: 900, height: 900 });
  await expect.poll(async () => baseAscii.getAttribute("data-anchor-text")).toContain("\n");
  await expect(baseAscii).toHaveAttribute("data-ascii-font-size", "3");

  await page.setViewportSize({ width: 1440, height: 900 });
  await expect.poll(async () => baseAscii.getAttribute("data-anchor-text")).not.toContain("\n");
  await expect(baseAscii).toHaveAttribute("data-ascii-font-size", "4");
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
  await page.waitForTimeout(50);
  const initiallyUnpreparedShuffleWrappers = await page
    .locator("[data-shuffle-enabled='true'] [data-shuffle-char-wrapper]")
    .evaluateAll((wrappers) => wrappers.filter((wrapper) => !wrapper.style.width).length);
  expect(initiallyUnpreparedShuffleWrappers).toBe(0);

  await expect(page.getByText("Socials")).toBeVisible();
  await expect(page.getByRole("menuitem", { name: /photos/i })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: /contact/i })).toBeVisible();
  await expect(page.locator(".staggered-menu-number")).toHaveCount(5);
  await expect(page.locator("[data-shuffle-text='PHOTOS'] [data-shuffle-char-wrapper]")).toHaveCount(6);
  await expect(page.locator("[data-shuffle-text='PHOTOS'] [data-shuffle-char]")).toHaveCount(18);
  await expect(page.locator("[data-shuffle-text='HOME']")).toHaveAttribute("data-shuffle-delay", "0");
  await expect(page.locator("[data-shuffle-text='ABOUT']")).toHaveAttribute("data-shuffle-delay", "0.25");
  await expect(page.locator("[data-shuffle-text='PHOTOS']")).toHaveAttribute("data-shuffle-delay", "0.5");
  await expect(page.locator("[data-shuffle-text='SOCIAL']")).toHaveAttribute("data-shuffle-delay", "0.75");
  await expect(page.locator("[data-shuffle-text='CONTACT']")).toHaveAttribute("data-shuffle-delay", "1");
  await expect(page.locator("[data-shuffle-text='HOME']")).toHaveAttribute("data-shuffle-enabled", "true");
  await expect(page.locator("[data-shuffle-text='PHOTOS']")).toHaveAttribute("data-shuffle-hover", "false");
  await expect(page.locator("[data-shuffle-text='CONTACT']")).toHaveClass(/is-ready/);

  const settledUnpreparedShuffleWrappers = await page
    .locator("[data-shuffle-enabled='true'] [data-shuffle-char-wrapper]")
    .evaluateAll((wrappers) => wrappers.filter((wrapper) => !wrapper.style.width).length);
  expect(settledUnpreparedShuffleWrappers).toBe(0);

  const photosLink = page.getByRole("menuitem", { name: /photos/i });
  const photosText = page.locator(".staggered-menu-link:has([data-shuffle-text='PHOTOS']) .staggered-menu-link-text");
  await photosLink.hover();
  await expect.poll(async () => photosText.evaluate((element) => getComputedStyle(element).transform)).toContain("matrix3d");

  await photosLink.click();
  await expect(page).toHaveURL(/#works$/);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("[data-shuffle-text='HOME']")).toHaveAttribute("data-shuffle-enabled", "false");
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
  await expect(page.locator("[data-shuffle-text='CONTACT']")).toHaveAttribute("data-shuffle-enabled", "false");

  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("[data-shuffle-text='CONTACT']")).toHaveAttribute("data-shuffle-delay", "1");
  await expect(page.locator("[data-shuffle-text='CONTACT']")).toHaveAttribute("data-shuffle-enabled", "true");
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
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

test("exposes photography menu items and social placeholders", async ({ page }) => {
  await page.goto("/");
  const menu = page.locator("[data-infinite-menu]");
  await expect(menu).toBeVisible();
  await expect(page.locator("#infinite-grid-menu-canvas")).toBeVisible();
  await expect(page.locator(".action-button.active")).toBeVisible();
  await expect(menu).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(menu).toHaveCSS("border-top-width", "0px");

  for (const label of ["GitHub", "X", "Instagram", "Email"]) {
    await expect(page.getByRole("link", { name: label })).toBeVisible();
  }
});

test("widens the photography stage without scaling the focused content", async ({ page }) => {
  await page.setViewportSize({ width: 2048, height: 1080 });
  await page.goto("/");
  const canvas = page.locator("#infinite-grid-menu-canvas");
  const title = page.locator(".face-title.active");
  const description = page.locator(".face-description.active");
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  const titleBox = await title.boundingBox();
  const descriptionBox = await description.boundingBox();
  expect(box).not.toBeNull();
  expect(titleBox).not.toBeNull();
  expect(descriptionBox).not.toBeNull();

  expect(box.width).toBeGreaterThan(2000);
  expect(box.height).toBeLessThanOrEqual(920);
  expect(titleBox.x).toBeGreaterThan(300);
  expect(titleBox.x + titleBox.width).toBeLessThan(box.width / 2 - 330);
  expect(descriptionBox.x).toBeGreaterThan(box.width / 2 + 260);
  expect(descriptionBox.x).toBeLessThan(box.width - 420);
});

test("turns the photography menu as a sphere while dragging and restores on release", async ({ page }) => {
  await page.goto("/");
  const menu = page.locator("[data-infinite-menu]");
  const canvas = page.locator("#infinite-grid-menu-canvas");
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 180, box.y + box.height / 2 + 70, { steps: 8 });
  await expect(menu).toHaveAttribute("data-moving", "true");
  await page.mouse.up();
  await expect(menu).toHaveAttribute("data-moving", "false", { timeout: 5000 });
  await expect(page.locator(".action-button.active")).toBeVisible();
});

test("keeps the photography sphere stable when the pointer crosses the canvas boundary", async ({ page }) => {
  await page.goto("/");
  const menu = page.locator("[data-infinite-menu]");
  const canvas = page.locator("#infinite-grid-menu-canvas");
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();

  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;

  await canvas.dispatchEvent("pointerdown", {
    pointerId: 7,
    pointerType: "mouse",
    clientX: startX,
    clientY: startY,
    buttons: 1,
    bubbles: true,
  });
  await canvas.dispatchEvent("pointermove", {
    pointerId: 7,
    pointerType: "mouse",
    clientX: startX + 180,
    clientY: startY + 50,
    buttons: 1,
    bubbles: true,
  });
  await expect(menu).toHaveAttribute("data-moving", "true");

  await canvas.dispatchEvent("pointerleave", {
    pointerId: 7,
    pointerType: "mouse",
    clientX: box.x + box.width + 80,
    clientY: startY + 40,
    buttons: 1,
    bubbles: true,
  });
  await canvas.dispatchEvent("pointermove", {
    pointerId: 7,
    pointerType: "mouse",
    clientX: startX - 160,
    clientY: startY - 40,
    buttons: 1,
    bubbles: true,
  });
  await expect(menu).toHaveAttribute("data-moving", "true");

  await canvas.dispatchEvent("pointerup", {
    pointerId: 7,
    pointerType: "mouse",
    clientX: startX - 160,
    clientY: startY - 40,
    buttons: 0,
    bubbles: true,
  });
});

test("expands the active photography circle into an in-page full image", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".action-button.active")).toBeVisible();

  await page.locator(".action-button.active").click();
  await expect(page.locator("[data-photo-lightbox]")).toBeVisible();
  await expect(page.locator("[data-infinite-menu] canvas")).toHaveAttribute("data-hidden-instance-index", /\d+/);
  await expect(page.locator(".photo-lightbox-visual")).toHaveAttribute("data-origin-source", "webgl-active-disc");
  await expect(page.locator("[data-photo-lightbox-cover]")).toHaveCount(0);
  await expect(page.locator("[data-photo-lightbox-media]")).toHaveAttribute(
    "src",
    /\/assets\/photography\/.*-large\.jpg$/
  );
  await expect(page.locator("[data-photo-lightbox-media]")).toHaveJSProperty("complete", true);
  await expect(page.locator("[data-photo-lightbox-media]")).toHaveCSS("object-fit", "cover");
  await expect(page.locator(".photo-lightbox-visual")).toHaveCSS("border-top-width", "0px");
  await expect(page.locator("[data-photo-lightbox]")).toHaveClass(/is-expanded/);

  const visualBox = await page.locator(".photo-lightbox-visual").boundingBox();
  const mediaBox = await page.locator("[data-photo-lightbox-media]").boundingBox();
  if (!visualBox || !mediaBox) {
    throw new Error("Lightbox geometry was not measurable.");
  }
  expect(Math.abs(visualBox.x - mediaBox.x)).toBeLessThan(1);
  expect(Math.abs(visualBox.y - mediaBox.y)).toBeLessThan(1);
  expect(Math.abs(visualBox.width - mediaBox.width)).toBeLessThan(1);
  expect(Math.abs(visualBox.height - mediaBox.height)).toBeLessThan(1);

  await page.locator("[data-photo-lightbox]").click({ position: { x: 10, y: 10 } });
  await page.waitForFunction(() => {
    const lightbox = document.querySelector("[data-photo-lightbox]");
    const canvas = document.querySelector("[data-infinite-menu] canvas");

    return Boolean(
      lightbox?.classList.contains("is-closing") &&
        window.getComputedStyle(lightbox).pointerEvents === "auto" &&
        canvas?.hasAttribute("data-hidden-instance-index") &&
        document.querySelectorAll(".action-button.active").length === 0
    );
  });

  const menuBox = await page.locator("[data-infinite-menu]").boundingBox();
  if (!menuBox) {
    throw new Error("Photography menu was not measurable during lightbox close.");
  }

  await page.mouse.move(menuBox.x + menuBox.width / 2, menuBox.y + menuBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(menuBox.x + menuBox.width / 2 - 120, menuBox.y + menuBox.height / 2 - 30, { steps: 4 });
  await expect(page.locator("[data-infinite-menu]")).toHaveAttribute("data-moving", "false");
  await page.mouse.up();

  await expect(page.locator("[data-photo-lightbox]")).toHaveCount(0);
  await expect(page.locator("[data-infinite-menu] canvas")).not.toHaveAttribute("data-hidden-instance-index", /\d+/);
  await expect(page.locator(".action-button.active")).toBeVisible();
});
