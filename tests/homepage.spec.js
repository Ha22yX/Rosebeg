import { expect, test } from "@playwright/test";

test("renders the Rosebeg identity and portfolio sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Rosebeg digital manifesto" })).toBeVisible();
  await expect(page.getByText("This is Rosebeg.")).toBeVisible();
  await expect(page.getByText("I am here to create.")).toBeVisible();
  await expect(page.getByText("I am here to explore.")).toBeVisible();
  await expect(page.getByText("I am here to redefine.")).toBeVisible();
  await expect(page.getByText("I am Ha22yX.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Who" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Works" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Social" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Contact" })).toBeVisible();
});

test("uses the shader background and removes the old cable instrument", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-shader-background]")).toBeVisible();
  await expect(page.locator("[data-cable-system]")).toHaveCount(0);
  await expect(page.getByText("0.78A")).toHaveCount(0);
});

test("exposes editable project and social placeholders", async ({ page }) => {
  await page.goto("/");
  for (const label of ["Project 01", "Project 02", "Project 03", "Archive", "GitHub", "X", "Instagram", "Email"]) {
    await expect(page.getByRole("link", { name: label })).toBeVisible();
  }
});
