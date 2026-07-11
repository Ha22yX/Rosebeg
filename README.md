# Rosebeg

Rosebeg is the personal website and digital portfolio of Ha22yX.

This version is a single-page sci-fi electronic portfolio homepage built with React, TypeScript, Tailwind CSS, Framer Motion, Three.js ASCII text, and ShaderGradient. The hero is centered on an ASCII typewriter manifesto:

```text
This is Rosebeg

A personal portfolio by HarryX

I am a Developer
I am a Researcher
I am a Photographer

Welcome to Rosebeg
```

## Local Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm test
npm run build
```

## Edit Points

- `src/App.tsx` contains homepage content, links, and section structure.
- `components/ui/manifesto-typewriter.tsx` contains the custom Rosebeg title sequence.
- `components/ui/ascii-text.tsx` contains the ASCII text renderer.
- `components/ui/typewriter.tsx` contains the shadcn-style Typewriter component.
- `src/components/ShaderBackground.tsx` contains the global ShaderGradient background.
- `src/styles.css` contains the visual system and responsive layout.
