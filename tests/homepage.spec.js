import { expect, test } from "@playwright/test";

test("renders the Rosebeg identity and portfolio sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Rosebeg digital manifesto" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Who" })).toBeVisible();
  await expect(page.locator("#works")).toBeAttached();
  await expect(page.locator("#photos")).toBeAttached();
  await expect(page.getByRole("heading", { name: "Social" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Contact" })).toBeVisible();
});

test("defers heavy offscreen renderers and preloads them near their sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("iframe[title='Selected Code Works']")).toHaveCount(0);
  await expect(page.locator("[data-infinite-menu]")).toHaveCount(0);
  await expect(page.locator("[data-performance-placeholder='works']")).toBeAttached();
  await expect(page.locator("[data-performance-placeholder='photos']")).toBeAttached();

  await page.locator("#works").scrollIntoViewIfNeeded();
  await expect(page.locator("iframe[title='Selected Code Works']")).toBeVisible();

  await page.locator("#photos").scrollIntoViewIfNeeded();
  await expect(page.locator("[data-infinite-menu]")).toBeVisible();
});

test("pauses hero ASCII rendering after the hero leaves the viewport", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".ascii-title-base [data-ascii-canvas]")).toHaveAttribute("data-render-active", "true");

  await page.locator("#works").scrollIntoViewIfNeeded();
  await expect(page.locator(".ascii-title-base [data-ascii-canvas]")).toHaveAttribute("data-render-active", "false");
});

test("uses a lightweight photography gallery on mobile instead of WebGL", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator("#photos").scrollIntoViewIfNeeded();

  await expect(page.locator("[data-mobile-photo-gallery]")).toBeVisible();
  await expect(page.locator("[data-infinite-menu]")).toHaveCount(0);
  await expect(page.locator("#infinite-grid-menu-canvas")).toHaveCount(0);
});

test("embeds the selected code works card swap section without its standalone background", async ({ page }) => {
  await page.goto("/");
  await page.locator("#works").scrollIntoViewIfNeeded();

  const frame = page.frameLocator("iframe[title='Selected Code Works']");
  await expect(frame.locator("[data-project-card-swap-section]")).toBeVisible();
  await expect(frame.getByRole("heading", { name: "Selected Code Works" })).toBeVisible();
  await expect(frame.locator("[data-card-swap]")).toHaveAttribute("data-card-swap-ready", "true");
  await expect(frame.locator(".card")).toHaveCount(7);
  await expect(frame.locator(".project-card-swap-section")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(frame.locator(".source-button").first()).toBeVisible();
});

test("gives the selected code works stack enough vertical room to avoid a hard bottom crop", async ({ page }) => {
  await page.goto("/");
  await page.locator("#works").scrollIntoViewIfNeeded();

  const frame = page.frameLocator("iframe[title='Selected Code Works']");
  await expect(frame.locator("[data-card-swap]")).toHaveAttribute("data-card-swap-ready", "true");

  const bottomReserve = await frame.locator("[data-project-card-swap-section]").evaluate(() => {
    const section = document.querySelector("[data-project-card-swap-section]");
    const cards = [...document.querySelectorAll(".card-frame")];
    const sectionRect = section.getBoundingClientRect();
    const lowestCardBottom = Math.max(...cards.map((card) => card.getBoundingClientRect().bottom));
    return sectionRect.bottom - lowestCardBottom;
  });

  expect(bottomReserve).toBeGreaterThan(90);
});

test("maximizes a selected code works card from the same window node", async ({ page }) => {
  await page.goto("/");
  await page.locator("#works").scrollIntoViewIfNeeded();

  const frame = page.frameLocator("iframe[title='Selected Code Works']");
  const stack = frame.locator("[data-card-swap]");
  await expect(stack).toHaveAttribute("data-card-swap-ready", "true");
  await frame.locator("[data-card-swap]").evaluate(() => {
    window.rosebegExplorerCards?.cardSwap?.pause();
  });

  const frontCard = frame.locator(".card.is-front").first();
  await expect(frontCard).toBeVisible();
  const toggle = frame.locator(".card.is-front").first().getByRole("button", { name: /maximize project window/i });
  await expect(toggle).toBeVisible();
  const compactFrameBox = await frontCard.locator(".card-frame").evaluate((frameEl) =>
    frameEl.getBoundingClientRect().toJSON()
  );
  await toggle.dispatchEvent("pointerover", { bubbles: true, pointerType: "mouse" });
  await expect(toggle).toHaveAttribute("data-hover-ready", "true");
  const compactBox = await toggle.evaluate((button) => {
    const card = button.closest(".card");
    card?.setAttribute("data-test-expanded-origin", "true");
    return card?.getBoundingClientRect().toJSON();
  });
  expect(compactBox).toBeTruthy();

  await toggle.click({ force: true });
  const expandedCard = frame.locator(".card.is-expanded[data-test-expanded-origin='true']");
  await expect(expandedCard).toBeVisible();
  await expect(stack).toHaveAttribute("data-expanded", "true");
  await expect(expandedCard.locator(".project-expanded-details")).toBeVisible();
  await expect(expandedCard.getByRole("button", { name: /restore project window/i })).toBeVisible();

  const expandedBox = await expandedCard.boundingBox();
  expect(expandedBox).not.toBeNull();
  expect(expandedBox.height).toBeGreaterThan(compactBox.height * 1.08);
  expect(expandedBox.width * expandedBox.height).toBeGreaterThan(compactBox.width * compactBox.height * 1.08);
  await expect(expandedCard).toHaveCSS("position", "fixed");
  await expect(expandedCard).toHaveCSS("transform", "none");

  await frame.locator("[data-project-card-swap-section]").click({ position: { x: 12, y: 12 } });
  await expect(frame.locator(".card.is-expanded")).toHaveCount(0);
  await expect(stack).toHaveAttribute("data-expanded", "false");
  const restoredCard = frame.locator(".card[data-test-expanded-origin='true']");
  await expect(restoredCard).toBeVisible();
  const restoredFrameBox = await restoredCard.locator(".card-frame").evaluate((frameEl) =>
    frameEl.getBoundingClientRect().toJSON()
  );
  expect(Math.abs(restoredFrameBox.left - compactFrameBox.left)).toBeLessThan(2);
  expect(Math.abs(restoredFrameBox.top - compactFrameBox.top)).toBeLessThan(2);
  expect(Math.abs(restoredFrameBox.width - compactFrameBox.width)).toBeLessThan(2);
  expect(Math.abs(restoredFrameBox.height - compactFrameBox.height)).toBeLessThan(2);
});

test("keeps the works card tilted at the start of the maximize animation", async ({ page }) => {
  await page.goto("/");
  await page.locator("#works").scrollIntoViewIfNeeded();

  const frame = page.frameLocator("iframe[title='Selected Code Works']");
  await expect(frame.locator("[data-card-swap]")).toHaveAttribute("data-card-swap-ready", "true");
  await frame.locator("[data-card-swap]").evaluate(() => {
    window.rosebegExplorerCards?.cardSwap?.pause();
  });
  await expect(frame.locator(".card.is-front [data-project-window-toggle]").first()).toBeVisible();

  const initialState = await frame.locator(".card.is-front").first().evaluate((card) => {
    const frameEl = card.querySelector(".card-frame");
    const content = card.querySelector(".content");
    const before = frameEl?.getBoundingClientRect();
    const beforeFrameStyle = frameEl ? getComputedStyle(frameEl) : null;
    const beforeContentStyle = content ? getComputedStyle(content) : null;
    const button = card.querySelector("[data-project-window-toggle]");
    button?.click();
    const after = frameEl?.getBoundingClientRect();
    const afterFrameStyle = frameEl ? getComputedStyle(frameEl) : null;
    const afterContentStyle = content ? getComputedStyle(content) : null;
    return {
      transform: getComputedStyle(card).transform,
      tilt: card.getAttribute("data-expansion-tilt"),
      before: before?.toJSON(),
      after: after?.toJSON(),
      beforeRadius: beforeFrameStyle?.borderRadius,
      afterRadius: afterFrameStyle?.borderRadius,
      beforeGrid: beforeContentStyle?.gridTemplateColumns,
      afterGrid: afterContentStyle?.gridTemplateColumns
    };
  });

  expect(initialState.transform).not.toBe("none");
  expect(initialState.tilt).toBe("active");
  expect(Math.abs(initialState.after.left - initialState.before.left)).toBeLessThan(2);
  expect(Math.abs(initialState.after.top - initialState.before.top)).toBeLessThan(2);
  expect(Math.abs(initialState.after.width - initialState.before.width)).toBeLessThan(2);
  expect(Math.abs(initialState.after.height - initialState.before.height)).toBeLessThan(2);
  expect(initialState.afterRadius).toBe(initialState.beforeRadius);
  expect(initialState.afterGrid).toBe(initialState.beforeGrid);
  await expect(frame.locator(".card.is-expanded-settled")).toHaveCSS("transform", "none", { timeout: 3000 });
});

test("types the manifesto in the requested sequence with yellow roles", async ({ page }) => {
  await page.goto("/");
  const title = page.locator("[data-typewriter-title]");

  await expect(title).toContainText("This is Rosebeg", { timeout: 4000 });
  await expect(title).not.toContainText("This is Rosebeg.");
  await expect(title).toContainText("A personal portfolio", { timeout: 5000 });
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

test("does not overhold the opening Rosebeg sentence", async ({ page }) => {
  await page.goto("/");

  await expect
    .poll(
      async () =>
        page.evaluate(() => {
          const title = document.querySelector("[data-typewriter-title]");
          return title?.textContent?.startsWith("This is Rosebeg") ?? false;
        }),
      { timeout: 4000, intervals: [50] }
    )
    .toBe(true);

  const openedAt = await page.evaluate(() => performance.now());

  await expect
    .poll(
      async () =>
        page.evaluate((startTime) => {
          const title = document.querySelector("[data-typewriter-title]");
          const text = title?.textContent ?? "";
          return text.startsWith("This is Rosebeg") ? Number.POSITIVE_INFINITY : performance.now() - startTime;
        }, openedAt),
      { timeout: 3200, intervals: [50] }
    )
    .toBeLessThan(1600);
});

test("anchors the shared I am a prefix before the yellow role appears", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-typewriter-title]")).toContainText("I am a", { timeout: 13000 });
  await expect(page.locator(".ascii-title-base [data-ascii-canvas]")).toHaveAttribute("data-align-mode", "anchored");
});

test("centers each role ASCII anchor across role changes", async ({ page }) => {
  await page.goto("/");
  const baseAscii = page.locator(".ascii-title-base [data-ascii-canvas]");

  await expect(page.locator("[data-typewriter-title]")).toContainText("I am a Developer", {
    timeout: 16000,
  });
  await expect(baseAscii).toHaveAttribute("data-anchor-text", "I am a Developer");
  await expect(baseAscii).toHaveAttribute("data-ascii-font-size", "4");
  await expect(baseAscii).toHaveAttribute("data-resize-mode", "debounced");

  await expect(page.locator("[data-typewriter-title]")).toContainText("I am a Researcher", {
    timeout: 6000,
  });
  await expect(baseAscii).toHaveAttribute("data-anchor-text", "I am a Researcher");

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
  await expect.poll(async () => title.textContent(), { timeout: 15000, intervals: [50] }).toBe("I am a_");
  await expect.poll(async () => title.textContent(), { timeout: 850, intervals: [50] }).toMatch(/I am a [A-Z]/);
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
  await expect(page.getByRole("menuitem", { name: /works/i })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: /photos/i })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: /contact/i })).toBeVisible();
  await expect(page.locator(".staggered-menu-number")).toHaveCount(6);
  await expect(page.locator("[data-shuffle-text='WORKS'] [data-shuffle-char-wrapper]")).toHaveCount(5);
  await expect(page.locator("[data-shuffle-text='WORKS'] [data-shuffle-char]")).toHaveCount(15);
  await expect(page.locator("[data-shuffle-text='PHOTOS'] [data-shuffle-char-wrapper]")).toHaveCount(6);
  await expect(page.locator("[data-shuffle-text='PHOTOS'] [data-shuffle-char]")).toHaveCount(18);
  await expect(page.locator("[data-shuffle-text='HOME']")).toHaveAttribute("data-shuffle-delay", "0");
  await expect(page.locator("[data-shuffle-text='ABOUT']")).toHaveAttribute("data-shuffle-delay", "0.25");
  await expect(page.locator("[data-shuffle-text='WORKS']")).toHaveAttribute("data-shuffle-delay", "0.5");
  await expect(page.locator("[data-shuffle-text='PHOTOS']")).toHaveAttribute("data-shuffle-delay", "0.75");
  await expect(page.locator("[data-shuffle-text='SOCIAL']")).toHaveAttribute("data-shuffle-delay", "1");
  await expect(page.locator("[data-shuffle-text='CONTACT']")).toHaveAttribute("data-shuffle-delay", "1.25");
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
  await expect(page).toHaveURL(/#photos$/);
  await expect.poll(async () => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await expect
    .poll(async () => page.evaluate(() => document.documentElement.dataset.smoothScrollState ?? "native"))
    .toBe("native");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("[data-shuffle-text='HOME']")).toHaveAttribute("data-shuffle-enabled", "false");
});

test("smoothly scrolls to navigation targets instead of jumping instantly", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));

  const targetTop = await page.locator("#photos").evaluate((element) => element.offsetTop);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("menuitem", { name: "Photos" }).click();

  await page.waitForFunction(() => window.scrollY > 0, { timeout: 800 });
  const duringScroll = await page.evaluate(() => window.scrollY);
  expect(duringScroll).toBeLessThan(targetTop - 180);

  await expect
    .poll(async () => page.evaluate((expectedTop) => Math.abs(window.scrollY - expectedTop), targetTop), { timeout: 1800 })
    .toBeLessThan(8);
  await expect(page).toHaveURL(/#photos$/);
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
  await expect(page.locator("[data-shuffle-text='CONTACT']")).toHaveAttribute("data-shuffle-delay", "1.25");
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

test("uses native wheel scrolling without the smooth chase controller", async ({ page }) => {
  await page.goto("/");
  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 1400);

  await expect.poll(async () => page.evaluate(() => window.scrollY)).toBeGreaterThan(before + 500);
  await expect(page.locator(".site-shell")).toHaveCSS("transform", "none");
  await expect
    .poll(async () =>
      page.evaluate(() => ({
        remainder: document.documentElement.style.getPropertyValue("--smooth-scroll-remainder"),
        state: document.documentElement.dataset.smoothScrollState ?? "native",
        target: document.documentElement.dataset.smoothScrollTarget ?? "",
      }))
    )
    .toEqual({ remainder: "", state: "native", target: "" });
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
  await page.locator("#photos").scrollIntoViewIfNeeded();
  const menu = page.locator("[data-infinite-menu]");
  const actionButton = page.locator(".action-button.active");
  const actionIcon = actionButton.locator(".action-button-icon");
  await expect(menu).toBeVisible();
  await expect(page.locator("#infinite-grid-menu-canvas")).toBeVisible();
  await expect(actionButton).toBeVisible();
  await expect(actionButton).toHaveAttribute("data-glass-surface", "true");
  await expect(actionButton.locator(".action-button-glass")).toHaveClass(/glass-surface--svg/);
  await expect(actionButton.locator(".action-button-glass")).toHaveAttribute("data-distortion-scale", "-300");
  await expect(actionButton.locator(".action-button-glass")).toHaveCSS("background-color", "rgba(255, 255, 255, 0.08)");
  await expect(actionButton).toHaveCSS("border-top-width", "0px");
  await expect(menu).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(menu).toHaveCSS("border-top-width", "0px");

  const buttonBox = await actionButton.boundingBox();
  const iconBox = await actionIcon.boundingBox();
  if (!buttonBox || !iconBox) {
    throw new Error("Action button geometry was not measurable.");
  }

  const buttonCenterX = buttonBox.x + buttonBox.width / 2;
  const buttonCenterY = buttonBox.y + buttonBox.height / 2;
  const iconCenterX = iconBox.x + iconBox.width / 2;
  const iconCenterY = iconBox.y + iconBox.height / 2;
  expect(Math.abs(buttonCenterX - iconCenterX)).toBeLessThanOrEqual(1.5);
  expect(Math.abs(buttonCenterY - iconCenterY)).toBeLessThanOrEqual(1.5);

  await actionButton.hover();
  await expect(actionButton.locator(".action-button-glass")).toHaveAttribute("data-distortion-scale", "300", {
    timeout: 2000,
  });

  for (const label of ["GitHub", "X", "Instagram", "Email"]) {
    await expect(page.getByRole("link", { name: label })).toBeVisible();
  }
});

test("widens the photography stage without scaling the focused content", async ({ page }) => {
  await page.setViewportSize({ width: 2048, height: 1080 });
  await page.goto("/");
  await page.locator("#photos").scrollIntoViewIfNeeded();
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

test("starts the photography menu from a randomized image", async ({ page }) => {
  await page.addInitScript(() => {
    Math.random = () => 0.99;
  });

  await page.goto("/");
  await page.locator("#photos").scrollIntoViewIfNeeded();
  const menu = page.locator("[data-infinite-menu]");
  const title = page.locator(".face-title.active");

  await expect(menu).toHaveAttribute("data-initial-index", "5");
  await expect(title).toHaveText("Window Afterimage");
});

test("turns the photography menu as a sphere while dragging and restores on release", async ({ page }) => {
  await page.goto("/");
  await page.locator("#photos").scrollIntoViewIfNeeded();
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
  await page.locator("#photos").scrollIntoViewIfNeeded();
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
  await page.locator("#photos").scrollIntoViewIfNeeded();
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

  await expect
    .poll(
      async () => {
        const visualBox = await page.locator(".photo-lightbox-visual").boundingBox();
        const mediaBox = await page.locator("[data-photo-lightbox-media]").boundingBox();
        if (!visualBox || !mediaBox) {
          return Number.POSITIVE_INFINITY;
        }

        return Math.max(
          Math.abs(visualBox.x - mediaBox.x),
          Math.abs(visualBox.y - mediaBox.y),
          Math.abs(visualBox.width - mediaBox.width),
          Math.abs(visualBox.height - mediaBox.height)
        );
      },
      { timeout: 5000 }
    )
    .toBeLessThan(1);

  await page.mouse.click(10, 10);
  await page.waitForFunction(() => {
    const lightbox = document.querySelector("[data-photo-lightbox]");
    const canvas = document.querySelector("[data-infinite-menu] canvas");
    const menu = document.querySelector("[data-infinite-menu]");

    return Boolean(
      lightbox?.classList.contains("is-closing") &&
        window.getComputedStyle(lightbox).pointerEvents === "auto" &&
        canvas?.hasAttribute("data-hidden-instance-index") &&
        canvas instanceof Element &&
        window.getComputedStyle(canvas).pointerEvents === "none" &&
        menu?.getAttribute("data-viewer-lock") === "true" &&
        document.querySelector(".action-button.active") &&
        document.querySelector(".face-title.active")
    );
  });

  await expect(page.locator("[data-photo-lightbox]")).toHaveCount(0);
  await expect(page.locator("[data-infinite-menu] canvas")).not.toHaveAttribute("data-hidden-instance-index", /\d+/);
  await expect(page.locator("[data-infinite-menu]")).toHaveAttribute("data-viewer-lock", "false");
  await expect(page.locator(".action-button.active")).toBeVisible();
});

test("keeps the closing photo circle attached to the scrolled menu position", async ({ page }) => {
  await page.goto("/");
  await page.locator("#photos").scrollIntoViewIfNeeded();
  const canvas = page.locator("#infinite-grid-menu-canvas");
  await canvas.scrollIntoViewIfNeeded();
  await expect(page.locator(".action-button.active")).toBeVisible();

  await page.locator(".action-button.active").click();
  await expect(page.locator("[data-photo-lightbox]")).toHaveClass(/is-expanded/);

  await page.mouse.click(10, 10);
  await page.waitForFunction(() =>
    document.querySelector("[data-photo-lightbox]")?.classList.contains("is-closing")
  );

  const visual = page.locator(".photo-lightbox-visual");
  const originTopBeforeScroll = await visual.evaluate((element) =>
    Number.parseFloat(element.style.getPropertyValue("--origin-top"))
  );

  await page.evaluate(() => window.scrollBy({ top: 420, behavior: "instant" }));

  await expect
    .poll(
      async () => {
        const count = await visual.count();
        if (count === 0) {
          return "closed";
        }

        const originTop = await visual.evaluate((element) =>
          Number.parseFloat(element.style.getPropertyValue("--origin-top"))
        );
        return originTop < originTopBeforeScroll - 80 ? "attached" : "waiting";
      },
      { timeout: 10000 }
    )
    .not.toBe("waiting");
});
