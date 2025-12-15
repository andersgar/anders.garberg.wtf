# Personal Website (garberg.wtf)

## Overview
A fast, single-page React/Vite site that blends my portfolio, small utilities, and a simple analytics dashboard. It is built to stay lightweight, use minimal dependencies, and adapt between English/Norwegian with a shared translation layer.

## Stack & Decisions
- **Frontend:** React 18 + Vite, custom CSS theme system with light/dark and color accents.
- **Auth & Data:** Supabase for authentication, profile storage, and basic visit/contact analytics.
- **Routing & UX:** React Router for gated dashboard vs. public sections, with language-aware redirects and smooth scrolling.
- **Performance:** Preload of critical assets, lazy loading of images, and pared-down dependencies to keep bundle size low.

## What I learned
- Balancing a personal brand site with “utility” features (QR generator, dashboard widgets) without bloating the UI.
- Managing translations and theme state globally while keeping components decoupled.
- Instrumenting lightweight analytics without harming load time or privacy goals.
