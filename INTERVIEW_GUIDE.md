# Interview Guide — Notebook (React Notes App)

This is a study document, not a repo README. It's meant to help you explain
this project confidently — what it does, why it's built the way it is, and
how to answer the kinds of questions an interviewer is likely to ask about it.

---

## 1. Thirty-second pitch

> "It's a local-first notes app built with React and Vite. You can create,
> edit, delete, tag, pin, and search notes, and everything persists to
> `localStorage`, so there's no backend. I focused on component structure,
> a custom design system with Tailwind, and a light/dark theme — and along
> the way I hit and fixed two real bugs worth talking about: a color-contrast
> bug in dark mode, and an asset-path bug from GitHub Pages deployment."

That last sentence is your hook — it invites the "tell me about a bug you
fixed" question, which you're now fully prepared for (Section 6).

---

## 2. Tech stack, and why each piece is there

| Layer | Choice | Why |
|---|---|---|
| UI library | React 18 (function components + hooks) | Industry standard; hooks avoid class-component boilerplate |
| Build tool | Vite | Fast dev server (native ES modules, no bundling in dev), fast production builds via Rollup |
| Styling | Tailwind CSS v4 | Utility-first — no context-switching between `.jsx` and a separate `.css` file for most styling; v4 uses a CSS-native `@theme` config instead of a JS config file |
| State | React `useState` / `useMemo`, no external library | The app's state is small and lives in one place (`App.jsx`); Redux/Zustand would be overkill |
| Persistence | `localStorage`, via a custom hook | No backend needed for the feature set; a custom hook keeps the persistence logic in one testable place instead of scattered `useEffect`s |
| Deployment | GitHub Pages via `gh-pages` npm package | Static site, no server-side code, free hosting |

**If asked "why not Redux/Context for state?"**
The state (notes array, search string, which note is being edited) all
lives in `App.jsx` and is passed down through 2–3 levels of props at most.
That's well within what prop drilling can handle cleanly — introducing
Context or Redux here would add indirection without solving a real problem.
I'd reach for Context if the same state needed to be read from many
unrelated branches of the tree, or Redux if there were complex, shared,
cross-cutting state with lots of derived data and middleware needs (e.g.
undo/redo, syncing with a server, optimistic updates across many features).

---

## 3. Architecture — how the code is organized

```
src/
  components/
    Navbar.jsx        # header: brand, search input, note count, theme toggle
    ThemeToggle.jsx    # small presentational button, controlled by App
    NoteForm.jsx        # controlled form, doubles as "add" and "edit" (see 3a)
    NoteCard.jsx          # one note, rendered as a pinned index card
    NotesGrid.jsx           # sorts (pinned first) + renders NoteCard list, or EmptyState
    EmptyState.jsx            # shown when there are no notes / no search matches
  hooks/
    useLocalStorage.js          # generic persisted-state hook
    useTheme.js                    # light/dark theme, synced to <html class="dark">
  constants.js                       # single source of truth for tag id/label/color
  App.jsx                              # owns all state, wires everything together
  index.css                              # Tailwind + design tokens + custom CSS
```

**Guiding principle:** `App.jsx` owns *state*; every child component is
either purely presentational (`NoteCard`, `EmptyState`, `ThemeToggle`) or
owns only *local, ephemeral* state that doesn't need to be shared
(`NoteForm`'s in-progress draft). This is a form of **lifting state up** —
a core React pattern.

### 3a. The "one form, two modes" decision

`NoteForm` is used for both creating and editing a note. Rather than
building a second `EditNoteForm` component, it accepts an `editingNote`
prop:

- `editingNote == null` → the form is empty, submitting calls `onSave` with
  a brand-new note.
- `editingNote != null` → a `useEffect` populates the form fields from that
  note when it changes, the submit button label changes to "Save changes",
  and a "Cancel" link appears.

**Why this way, and not two components?** The add/edit forms are
identical in every way except initial values and the submit label — so a
second component would just be duplicated JSX with a few props swapped. A
single form driven by whether `editingNote` is `null` keeps validation,
markup, and styling in one place. The trade-off: the component has to
reset itself (`setForm(EMPTY)`) after a successful submit, which is a
small bit of extra state management, but it's simpler than keeping two
components in sync.

### 3b. Data model

Each note looks like:

```js
{
  id: crypto.randomUUID(),   // stable unique key, used for React's `key` prop and lookups
  title: "...",
  details: "...",
  tag: "idea" | "work" | "personal" | "urgent",
  pinned: false,
  createdAt: "2026-07-11T10:00:00.000Z", // ISO string, so it round-trips through JSON/localStorage safely
}
```

`crypto.randomUUID()` (a native browser API) is used instead of `Date.now()`
or an incrementing counter because array index or timestamp-based IDs can
collide (two notes added in the same millisecond) or shift when items are
removed. A UUID is guaranteed unique and stable for the note's lifetime —
which matters because React uses `key` to decide whether to reuse or
recreate a DOM node between renders.

---

## 4. Custom hooks — the two most "interview-worthy" pieces

### `useLocalStorage(key, initialValue)`

```js
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = window.localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch (err) {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(...);
    }
  }, [key, value]);

  return [value, setValue];
}
```

Talking points:
- **Lazy initial state:** `useState(() => ...)` takes a *function*, not a
  value. React only calls that function on the very first render. If you
  wrote `useState(JSON.parse(localStorage.getItem(key)))` instead, that
  `localStorage` read and `JSON.parse` call would run on *every* render,
  even though the result is only used once — wasted work, and a real
  performance foot-gun if it were a bigger payload.
- **Same hook shape as `useState`:** it returns `[value, setValue]`, so it
  drops into existing code as a near-drop-in replacement for `useState`.
  That's a deliberate API design choice — mimicking a familiar hook's
  signature lowers the learning cost for anyone reading the code.
- **Why `useEffect` for the write, not writing inside `setValue` directly?**
  Because `setValue` is just React's state setter (or a functional updater
  like `current => ...`) — it doesn't know about `localStorage` at all. The
  `useEffect` is what reacts to the *result* of a state change and
  synchronizes it to an external system. This is exactly the kind of
  side effect `useEffect` exists for: syncing React state with something
  outside React (the DOM, a subscription, browser storage, etc.).
- **Error handling:** wrapped in `try/catch` because `localStorage` can
  throw — in Safari private browsing, when storage quota is exceeded, or
  when a stored value isn't valid JSON (e.g. a user manually edited
  devtools storage). Failing open to `initialValue` means a corrupted
  value degrades to "start fresh" instead of crashing the whole app.

### `useTheme()`

```js
export function useTheme() {
  const [theme, setTheme] = useLocalStorage("notebook-theme", getInitialTheme());

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => setTheme(current => current === "dark" ? "light" : "dark");

  return [theme, toggleTheme];
}
```

Talking points:
- **Composition over duplication:** it's built *on top of*
  `useLocalStorage` rather than reimplementing persistence — a good
  example of composing small hooks into bigger ones, the same way you'd
  compose small functions.
- **System preference as a sane default:** `getInitialTheme()` checks
  `window.matchMedia("(prefers-color-scheme: light)")` the first time a
  visitor arrives (no stored preference yet), so the app opens in the mode
  that matches their OS setting rather than defaulting to one fixed theme
  for everyone.
- **Why toggle a class on `<html>`, not just React state?** The theme
  needs to affect *CSS*, not just component output — colors, borders,
  backgrounds defined in `index.css`. Putting a `dark` class on the root
  element lets plain CSS (`.dark { --text: ... }`) respond to it, which is
  how Tailwind's class-based dark mode works under the hood. It also
  means the theme survives outside React's render tree — useful if you
  ever add non-React content (e.g. a loading screen shown before React
  hydrates).

---

## 5. Styling architecture — Tailwind v4 + a little custom CSS

### Design tokens via CSS variables, not two Tailwind configs

Instead of duplicating color utilities for light and dark (`dark:bg-...`
sprinkled everywhere), the light/dark values are defined once as CSS
custom properties, and Tailwind's `@theme` block just points at them:

```css
:root       { --bg: #f4efe1; --text: #23201d; ... }   /* light */
.dark       { --bg: #23201d; --text: #f3ede0; ... }   /* dark  */

@theme {
  --color-app-bg: var(--bg);
  --color-ink: var(--text);
  ...
}
```

Because `--color-ink` is defined as `var(--text)`, and CSS resolves
variable references at *paint time* (not build time), simply toggling the
`.dark` class on `<html>` changes what every `bg-app-bg` / `text-ink`
utility renders as — with zero `dark:` variants needed anywhere in the
component code. This is the single most "senior" detail in the project's
CSS, and worth explaining if asked about the theming approach.

### The bug this caused, and the fix (great "tell me about a bug" story)

Note cards are deliberately **paper-colored in both themes** — that's the
visual identity, an index card pinned to a corkboard. But the *text inside*
those cards was originally styled with `text-ink`, the same
theme-switching variable used everywhere else. In dark mode, `--text`
flips to a light cream color — so the text on the (always-light) paper
card became light text on a light background: unreadable.

**The fix:** a second, *fixed* color pair that does not switch with the
theme —

```css
--color-paper-ink: #23201d;
--color-paper-muted: #6f6656;
```

Anything rendered inside a paper card (`NoteForm`, `NoteCard`) uses
`paper-ink`; anything on the app's own background (`Navbar`, page
headings, empty state) uses the theme-switching `ink`. The lesson: a
"theme color" and "a color that happens to look right in the current
theme" are not the same thing — a token should be named for *what it's
guaranteed to contrast against*, not just "the text color."

### Why not 100% Tailwind?

A handful of things are in a small `@layer`/plain-CSS block in
`index.css` because they're either impossible or awkward as pure utility
classes:

- **Per-card random tilt** — each note card gets a slightly different
  rotation (`nth-child(odd)`, `nth-child(even)`, `nth-child(3n)` each set
  a different `--tilt` CSS variable) for a hand-pinned, corkboard feel.
  Tailwind has no utility for "the 2nd, 5th, 8th... child gets a
  different value."
- **The corkboard dot texture** — a `radial-gradient` background pattern,
  which is a raw CSS value, not a discrete utility.
- **Tag-chip selected state** — `.tag-chip:has(input:checked)` uses the
  relatively new `:has()` selector to style a label based on its child
  radio input's checked state, without JavaScript. Tailwind v4 does
  support arbitrary variants for this, but keeping it as plain CSS here
  was clearer to read.

If asked "why not just write 100% Tailwind or 100% CSS" — the honest
answer is: use utilities for the 95% of styling that's "spacing, color,
typography, layout," and drop to CSS for the small set of things that are
genuinely selector- or math-driven. Fighting the framework to force
everything into utility classes usually produces less readable code, not
more.

---

## 6. Two real bugs fixed on this project (use these for behavioral questions)

### Bug 1 — dark mode text contrast (see Section 5 above)

**STAR summary:**
- *Situation:* Added a light/dark theme toggle to a notes app whose note
  cards are always paper-colored.
- *Task:* Fix reports that in dark mode, form labels and note text were
  nearly invisible.
- *Action:* Traced it to a single shared color variable being reused for
  two different jobs — "text on the app background" and "text on a paper
  card" — that happened to need opposite values in dark mode. Split it
  into two tokens: one theme-aware, one fixed.
- *Result:* Full contrast restored in both themes, with a design rule
  ("cards always use fixed ink") that prevents the same bug reappearing
  as more components are added.

### Bug 2 — broken hero image after enabling GitHub Pages deployment

**Situation:** The Vite config sets `base: "/Your-Notes/"` so the built
app works when served from a GitHub Pages subpath rather than a domain
root. An `<img src="/note-logo.png" />` was written as a hardcoded
string pointing at the domain root.

**Why it broke:** Vite only rewrites asset URLs it can see and process at
build time — references inside `index.html`, or anything you `import`
in JS/CSS. A plain string like `"/note-logo.png"` inside JSX is invisible
to that process; it's just a string at runtime, so it always resolves to
the *domain* root (`/note-logo.png`), not the *app's* base path
(`/Your-Notes/note-logo.png`). Locally at the domain root the two happen
to be the same path, which is why it "worked" in early testing — the bug
only becomes visible once `base` is anything other than `/`.

**Fix:** moved the image into `src/assets` and used a real ES module
import — `import noteLogo from "./assets/note-logo.png"` — then
`<img src={noteLogo} />`. Now Vite treats it as a build-time dependency:
it fingerprints the file, emits it into `dist/assets/`, and rewrites the
import to the correct final URL automatically, base path and all.

**The general lesson (good for a "what did you learn" follow-up):**
static assets referenced by *string path* are invisible to a bundler;
assets referenced by *import* are part of the dependency graph and get
resolved, hashed, and rewritten correctly no matter where the app is
deployed. The `public/` folder is the escape hatch for the few things
that genuinely need a stable, unhashed, predictable URL (like a favicon
referenced from `index.html`) — everything else should be imported.

---

## 7. Feature-by-feature "why," for quick recall

- **Search** — a `useMemo` derives the filtered list from `notes` and
  `search` instead of storing a separate "filtered notes" state. This
  avoids two sources of truth going out of sync; the filtered list is
  always a pure function of the current notes + search term, recomputed
  only when either changes.
- **Pinning** — sorted with `[...notes].sort(...)` rather than
  `notes.sort(...)`, because `Array.prototype.sort` mutates in place;
  mutating state directly instead of replacing it is a classic React bug
  (React compares object/array *references* to decide whether to
  re-render, so a mutated-but-same-reference array can silently fail to
  trigger a re-render elsewhere).
- **Delete animation** — deletion doesn't remove the note immediately;
  it stores the note's id in `deletingId`, adds a CSS class that
  transitions opacity/scale to zero, and only removes the note from state
  after a `setTimeout` matching the CSS transition duration. This is a
  common pattern for animating something that's about to leave the DOM,
  since CSS can't animate an element that's already been removed by React.
- **Accessibility** — form inputs use `<label>` (not just placeholder
  text, which disappears once you start typing and isn't reliably read by
  screen readers), the tag picker is a real `<fieldset>`/`<legend>`/radio
  group (so it's keyboard-navigable and announced as a group), and
  `:focus-visible` gets a visible outline app-wide.

---

## 8. Questions to expect, and short answers

**"Why Vite over Create React App?"**
CRA is effectively unmaintained; Vite has a much faster dev server
because it serves source files over native ES modules instead of
bundling on every save, and it's now the more common recommendation in
the React ecosystem.

**"Why hooks instead of class components?"**
Hooks let you colocate related logic (e.g., "read from localStorage on
mount, write on every change") in one function instead of splitting it
across `componentDidMount`/`componentDidUpdate`, and they make logic like
`useLocalStorage` reusable across components without wrapper-component
patterns (HOCs, render props).

**"How would you add a backend to this?"**
Swap `useLocalStorage` for a hook with the same `[value, setValue]`
shape but backed by `fetch` calls to an API, keeping every component
that consumes it unchanged — this is the payoff of hiding persistence
behind a hook interface in the first place.

**"How would you test this?"**
Component tests with React Testing Library for user-facing behavior
(type into the form, click Add, assert the note appears); a unit test
for `useLocalStorage` mocking `window.localStorage` to check it reads,
writes, and fails gracefully on bad JSON.

**"What would you change with more time?"**
Move to a reducer (`useReducer`) once the number of state transitions in
`App.jsx` grows past a handful of `set...` calls — it's already at the
point where a reducer would make the add/edit/delete/pin transitions
more explicit and testable as pure functions.
