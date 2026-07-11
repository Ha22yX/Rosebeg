import { expect, test } from "@playwright/test";

test("renders the Rosebeg identity and portfolio sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Rosebeg digital manifesto" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Who" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Works" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Social" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Contact" })).toBeVisible();
});

test("types the manifesto in the requested sequence with yellow action words", async ({ page }) => {
  await page.goto("/");
  const title = page.locator("[data-typewriter-title]");

  await expect(title).toContainText("This is Rosebeg", { timeout: 4000 });
  await expect(title).not.toContainText("This is Rosebeg.");
  await expect(title).toContainText("Where I create", { timeout: 7000 });
  await expect(page.locator("[data-yellow-segment='create']")).toHaveCSS("color", "rgb(255, 216, 102)");

  await expect(title).toContainText("Where I explore", { timeout: 5000 });
  await expect(page.locator("[data-yellow-segment='explore']")).toHaveCSS("color", "rgb(255, 216, 102)");

  await expect(title).toContainText("Where I redefine", { timeout: 5000 });
  await expect(page.locator("[data-yellow-segment='redefine']")).toHaveCSS("color", "rgb(255, 216, 102)");

  await expect(title).toContainText("I am Ha22yX", { timeout: 7000 });
  await expect(title).not.toContainText("I am Ha22yX.");
});

test("anchors the first sentence while typing spaces instead of re-centering every character", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-typewriter-title]")).toContainText("This is ", { timeout: 2000 });
  await expect(page.locator(".ascii-title-base [data-ascii-canvas]")).toHaveAttribute("data-align-mode", "anchored");
});

test("anchors the shared Where I prefix before the yellow action word appears", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-typewriter-title]")).toContainText("Where I", { timeout: 8000 });
  await expect(page.locator(".ascii-title-base [data-ascii-canvas]")).toHaveAttribute("data-align-mode", "anchored");
});

test("uses the shader background and removes the old cable instrument", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-shader-background]")).toBeVisible();
  await expect(page.locator("[data-cable-system]")).toHaveCount(0);
  await expect(page.getByText("0.78A")).toHaveCount(0);
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
  await expect(page.locator("[data-typewriter-title]")).toContainText("I am Ha22yX", {
    timeout: 18000,
  });
});

test("exposes editable project and social placeholders", async ({ page }) => {
  await page.goto("/");
  for (const label of ["Project 01", "Project 02", "Project 03", "Archive", "GitHub", "X", "Instagram", "Email"]) {
    await expect(page.getByRole("link", { name: label })).toBeVisible();
  }
});
