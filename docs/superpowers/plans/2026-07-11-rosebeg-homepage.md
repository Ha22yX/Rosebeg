# Rosebeg Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish a one-page Rosebeg personal website with a continuous electric cable visual system.

**Architecture:** Use a Vite static site with plain HTML, CSS, and JavaScript. The main page owns the content structure, the stylesheet owns the visual system and responsive behavior, and the script owns small progressive reveal behavior.

**Tech Stack:** Vite, vanilla JavaScript, CSS, inline SVG, Playwright, GitHub CLI.

## Global Constraints

- Brand title is `Rosebeg`.
- Positioning line is `Personal website and digital portfolio of Ha22yX.`
- The electric cable begins below the Rosebeg title and continues through Who, Works, Social, and Contact.
- The homepage is a single page only.
- Project links are editable placeholders: `Project 01`, `Project 02`, `Project 03`, `Archive`.
- Social links are editable placeholders: GitHub, X, Instagram, Email.
- Motion must respect `prefers-reduced-motion`.
- Publish with git and GitHub CLI.

---

### Task 1: Repository Baseline and Failing Acceptance Tests

**Files:**
- Create: `package.json`
- Create: `playwright.config.js`
- Create: `tests/homepage.spec.js`

**Interfaces:**
- Produces: `npm test` for Playwright checks.
- Produces: `npm run build` for Vite production build.

- [ ] **Step 1: Create package scripts and dev dependencies**

```json
{
  "name": "rosebeg",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "vite build",
    "preview": "vite preview --host 127.0.0.1",
    "test": "playwright test"
  },
  "devDependencies": {
    "@playwright/test": "^1.55.0",
    "vite": "^7.0.0"
  }
}
```

- [ ] **Step 2: Create Playwright config**

```js
export default {
  testDir: "./tests",
  webServer: {
    command: "npm run dev -- --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  },
  use: {
    baseURL: "http://127.0.0.1:4173",
    viewport: { width: 1440, height: 1100 }
  }
};
```

- [ ] **Step 3: Create failing homepage tests**

```js
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
```

- [ ] **Step 4: Run tests and verify failure**

Run: `npm install` then `npm test`

Expected: tests fail because `index.html` and the homepage do not exist yet.

- [ ] **Step 5: Commit baseline tests**

```bash
git add package.json playwright.config.js tests/homepage.spec.js docs/superpowers
git commit -m "test: define rosebeg homepage acceptance"
```

### Task 2: Static Homepage Structure

**Files:**
- Create: `index.html`
- Create: `src/main.js`
- Create: `src/styles.css`

**Interfaces:**
- Consumes: Playwright tests from Task 1.
- Produces: semantic headings and links required by the tests.

- [ ] **Step 1: Implement HTML sections**

Create semantic sections for hero, Who, Works, Social, and Contact. Include the required headings, positioning copy, project links, social links, and `data-cable-system`, `data-cable-path="main"`, and five `data-cable-node` markers.

- [ ] **Step 2: Add minimal JavaScript**

Use IntersectionObserver to add `is-visible` to `[data-reveal]` elements. If IntersectionObserver is unavailable, reveal all elements immediately.

- [ ] **Step 3: Add responsive CSS foundation**

Define CSS variables for near-black, rose-red, cyan, bone-white, and muted gray. Build the dark layout, hero typography, section spacing, and cable positioning.

- [ ] **Step 4: Run tests**

Run: `npm test`

Expected: all Playwright tests pass.

- [ ] **Step 5: Commit structure**

```bash
git add index.html src/main.js src/styles.css
git commit -m "feat: build rosebeg homepage structure"
```

### Task 3: Visual Polish, Motion, and Publishing

**Files:**
- Modify: `src/styles.css`
- Modify: `index.html`
- Create: `.gitignore`
- Create: `README.md`

**Interfaces:**
- Consumes: homepage structure from Task 2.
- Produces: production-ready visual design and GitHub repository.

- [ ] **Step 1: Polish cable SVG and visual effects**

Add cable glow layers, animated dash pulse, cable nodes, scan lines, noise overlays, and asymmetric section-specific cable branches. Use `prefers-reduced-motion` to disable pulse/reveal animation.

- [ ] **Step 2: Add project README and ignore generated files**

Create `.gitignore` for `node_modules`, `dist`, and Playwright output. Create `README.md` describing Rosebeg and local commands.

- [ ] **Step 3: Run verification**

Run: `npm test` and `npm run build`

Expected: tests pass and Vite production build exits with code 0.

- [ ] **Step 4: Commit final site**

```bash
git add .
git commit -m "feat: polish rosebeg signal field"
```

- [ ] **Step 5: Publish with GitHub CLI**

Run: `gh repo create Rosebeg --public --source=. --remote=origin --push`

Expected: GitHub repository is created under the active account and `main` is pushed.
