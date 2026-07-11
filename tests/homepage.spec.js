import { expect, test } from "@playwright/test";

test("renders the Rosebeg identity and portfolio sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Rosebeg" })).toBeVisible();
  await expect(page.getByText("Personal website and digital portfolio of Ha22yX.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Who" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Works" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Social" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Contact" })).toBeVisible();
});

test("draws one continuous electric cable system through the page", async ({ page }) => {
  await page.goto("/");
  const cable = page.locator("[data-cable-system]");
  await expect(cable).toBeVisible();
  await expect(page.locator("[data-cable-path='main']")).toHaveCount(1);
  await expect(page.locator("[data-cable-node]")).toHaveCount(5);
});

test("exposes editable project and social placeholders", async ({ page }) => {
  await page.goto("/");
  for (const label of ["Project 01", "Project 02", "Project 03", "Archive", "GitHub", "X", "Instagram", "Email"]) {
    await expect(page.getByRole("link", { name: label })).toBeVisible();
  }
});
