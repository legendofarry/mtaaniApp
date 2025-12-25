UI Guide — Warm / Energetic Theme

Palette

- Primary: #ff6b6b (warm coral)
- Secondary: #7c3aed (warm violet)
- Accent: #ffb020 (amber)
- Background: #fff7f6 (soft warm)
- Text dark: #0f172a

Design Tokens (CSS variables in `main.css`)

- --primary-color, --secondary-color, --accent-color
- --radius-sm / --radius-md / --radius-lg
- --shadow-sm / --shadow-md
- --ease-smooth (motion easing)

Key components & classes

- `.brand-mark` — use for logomark / brand circles
- `.avatar-mark` — user avatar gradient
- `.btn-primary` / `.btn-ghost` — primary and ghost button styles
- `.card` — elevated card with hover lift
- `.nav-container` / `.nav-item` / `.text-accent` — bottom navigation styling
- `.toast` + `.toast.show` — toast messages with smooth enter/exit
- `.modal-overlay` / `.modal-box` — modal overlay and box (animated)
- `.install-animate` — install CTA subtle motion

Accessibility / Motion

- Reduced-motion respected via `prefers-reduced-motion: reduce`.
- Color tokens are chosen for good contrast; verify on target screens and adjust `--text-dark` if needed.

Notes & Next Steps

- Replace remaining inline styles with utility classes where possible (continuing work in `src/`)
- Add Tailwind theme entries (colors & borderRadius) if we want to use Tailwind utilities consistently.
- Run a11y checks (contrast, keyboard focus) and manual QA across devices.

If you'd like, I can:

- Add Tailwind custom color tokens in `tailwind.config.js` and convert inline classes to Tailwind utilities.
- Create a `/settings/theme` small UI to allow switching between palettes (warm, bold, minimal).
