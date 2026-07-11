# Rosebeg Homepage Design

## Goal

Build a single-page personal website and digital portfolio for Ha22yX under the personal brand name Rosebeg. The first version must be visually strong enough to show design ability while staying easy for Ha22yX to edit later.

## Design Direction

Use the "Rosebeg Signal Field" concept: a dark experimental homepage where one continuous electric cable system begins beneath the main Rosebeg title and extends from top to bottom. The cable is the central visual object, not a background decoration.

The cable should change position and behavior across sections:

- Hero: the cable begins under the Rosebeg title as a precise signal trunk.
- Who: the cable shifts left and connects into an identity/profile field.
- Works: the cable bends through project links, visually powering each portfolio entry.
- Social: the cable branches into several platform ports.
- Contact: the cable resolves into one glowing terminal/interface.

## Content

- Brand title: `Rosebeg`
- Positioning: `Personal website and digital portfolio of Ha22yX.`
- Intro area explaining Ha22yX as a designer/builder with a personal digital identity.
- Portfolio links as editable placeholders: `Project 01`, `Project 02`, `Project 03`, `Archive`.
- Social links as editable placeholders: GitHub, X, Instagram, Email.
- Contact section with a mail link placeholder.

## Visual System

- Dark experimental base, near-black background.
- Electric cable: metallic edge, rose-red signal core, cyan highlight energy.
- Use SVG for the continuous cable path so it can be edited as a single visual system.
- Use CSS variables for the palette.
- Add subtle noise, scan lines, and glow without relying on generic purple gradients.
- Use asymmetric section layouts and restrained high-impact typography.
- Avoid nested cards and generic three-card marketing layout.

## Motion

- Cable should show subtle moving energy pulses.
- Sections should reveal softly on scroll.
- Respect `prefers-reduced-motion` by disabling animated pulse and reveal transitions.

## Technical Requirements

- Static Vite site using plain HTML, CSS, and JavaScript.
- Keep source files small and approachable.
- Provide automated Playwright checks for core page content and cable presence.
- Run a production build before completion.
- Initialize git version control and publish the project to GitHub using GitHub CLI.

## Out of Scope

- Multi-page routing.
- Real project URLs and real social URLs, unless added later by Ha22yX.
- Backend, CMS, analytics, newsletter, or form submission service.
