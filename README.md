# Rosebeg

Rosebeg is my self-designed personal brand and introduction website.

Live case: [harry.rosebeg.com](https://harry.rosebeg.com/)

It introduces who I am, what I build, and how my work connects across software,
robotics research, photography, and interface design. The site is built as a
single-page visual portfolio with React, TypeScript, Tailwind CSS, Framer
Motion, Three.js ASCII text, and a shader-based background system.

## Preview

<table>
  <tr>
    <td colspan="2">
      <img src="docs/readme/rosebeg-hero.png" alt="Rosebeg opening screen with the Welcome to Rosebeg title" />
    </td>
  </tr>
  <tr>
    <td colspan="2"><strong>Opening screen.</strong> The site starts with the Rosebeg identity and ASCII-style title sequence.</td>
  </tr>
</table>

<table>
  <tr>
    <td width="50%">
      <img src="docs/readme/rosebeg-identity.png" alt="Rosebeg identity section showing Developer, Researcher, Photographer, and Designer cards" />
    </td>
    <td width="50%">
      <img src="docs/readme/rosebeg-code-works.png" alt="Rosebeg selected code works section with stacked project windows" />
    </td>
  </tr>
  <tr>
    <td><strong>Identity section.</strong> Four parts of my work are shown as one personal system: developer, researcher, photographer, and designer.</td>
    <td><strong>Selected code works.</strong> Projects are presented as an interactive archive rather than a plain link list.</td>
  </tr>
</table>

<table>
  <tr>
    <td>
      <img src="docs/readme/rosebeg-signal-ports.png" alt="Rosebeg signal ports contact section with GitHub, WeChat, Instagram, and Email links" />
    </td>
  </tr>
  <tr>
    <td><strong>Signal ports.</strong> Public contact channels are designed as part of the Rosebeg interface language.</td>
  </tr>
</table>

## What the Site Presents

- A personal introduction for Zhiyuan Xing / HarryX.
- Selected software, research, and creative projects.
- A visual identity for Rosebeg as a personal brand.
- Photography and field-image work.
- Public contact channels and project links.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Framer Motion
- Three.js / React Three Fiber
- GSAP
- Playwright

## Local Development

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Verification

```bash
npm run build
npm test
```

## Repository Guide

- `src/App.tsx` - homepage content, links, and section structure.
- `src/styles.css` - visual system, layout, and responsive behavior.
- `src/components/ShaderBackground.tsx` - global shader background.
- `components/ui/manifesto-typewriter.tsx` - Rosebeg title sequence.
- `components/ui/ascii-text.tsx` - ASCII text renderer.
- `components/ui/signal-navigation.tsx` - navigation menu.
- `public/project-card-swap/` - embedded selected works interface.
- `docs/readme/` - README screenshots.
