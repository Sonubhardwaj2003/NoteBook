# 📓 Notebook — React Notes App

A fast, local-first notes app for jotting things down and pinning what matters.
Built to demonstrate real CRUD state management, custom hooks, and a hand-crafted
UI — no component library, no boilerplate.

**[Live demo →](https://your-username.github.io/Your-Notes/)**

## Features

- **Create, edit, and delete notes** with inline validation
- **Tag notes** (Idea / Work / Personal / Urgent) with color-coded indicators
- **Pin notes** to keep important ones at the top of the board
- **Live search** across titles and details
- **Light/dark theme toggle**, remembered across visits and defaulting to the
  visitor's system preference on first load
- **Persists to `localStorage`** — notes and theme survive a page refresh, no backend needed
- Fully responsive two-part layout: note composer up top, board below
- Keyboard-accessible, respects `prefers-reduced-motion`

## Tech stack

- React 18 (function components + hooks)
- Vite for dev/build tooling
- Tailwind CSS v4, with a small set of custom CSS for things utilities can't
  express cleanly (corkboard texture, per-card tilt) — see `src/index.css`
- Deployed with `gh-pages`

## Project structure

```
src/
  components/
    Navbar.jsx        # header, search, theme toggle
    ThemeToggle.jsx     # light/dark switch
    NoteForm.jsx          # add/edit form with tag picker
    NoteCard.jsx            # single note ("index card") with pin/edit/delete
    NotesGrid.jsx             # lays out + sorts notes (pinned first)
    EmptyState.jsx             # shown when there are no notes / no search matches
  hooks/
    useLocalStorage.js           # generic persisted-state hook
    useTheme.js                    # light/dark theme, synced to <html class="dark">
  constants.js                       # tag definitions
  App.jsx                              # top-level state + composition
  index.css                              # Tailwind + design tokens + custom CSS
```

## Getting started

```bash
npm install
npm run dev
```

## Deploying to GitHub Pages

1. In `package.json`, set `"homepage"` to your GitHub Pages URL.
2. In `vite.config.js`, set `base` to `/<your-repo-name>/`.
3. Run:

```bash
npm run deploy
```

## What this project demonstrates

- Splitting a monolithic component into focused, reusable pieces
- A custom hook (`useLocalStorage`) instead of duplicating persistence logic
- Derived/computed state (search filtering, pinned sort) with `useMemo`
- Deliberate visual design — a "notebook & corkboard" identity rather than a
  default template look
