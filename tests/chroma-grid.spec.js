import { expect, test } from "@playwright/test";

test.describe("Chroma Grid about section", () => {
  test("renders the interactive desktop Chroma Grid", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 920 });
    await page.goto("/");
    await page.locator("#who").scrollIntoViewIfNeeded();

    const grid = page.locator("#who [data-chroma-grid]");
    await expect(grid).toBeVisible();
    await expect(grid).toHaveAttribute("data-static-mode", "false");
    await expect(page.locator("#who .chroma-card")).toHaveCount(4);
    await expect(page.locator("#who .chroma-img-color")).toHaveCount(0);
    await expect(page.locator("#who .chroma-overlay")).toHaveCount(1);
    await expect(page.locator("#who .chroma-fade")).toHaveCount(1);
  });

  test("uses the mobile static Chroma Grid fallback", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.locator("#who").scrollIntoViewIfNeeded();

    const grid = page.locator("#who [data-chroma-grid]");
    await expect(grid).toBeVisible();
    await expect(grid).toHaveAttribute("data-static-mode", "true");
    await expect(page.locator("#who .chroma-card")).toHaveCount(4);
    await expect(page.locator("#who .chroma-img-color")).toHaveCount(0);
    await expect(page.locator("#who .chroma-overlay")).toHaveCount(0);
    await expect(page.locator("#who .chroma-fade")).toHaveCount(0);
  });
});
