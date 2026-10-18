# Design tokens: Job OS (Oct 2026)

Built per the shared `design-system` skill (shadcn/ui patterns, Tailwind 4, lucide icons, Geist + Fraunces).

- Surfaces: light `#fafaf9` / card `#fff`; dark `#080c14` / card `#0f172a`. Theme toggle in sidebar, follows system by default.
- Accent: teal `#0f766e` (light) / `#2dd4bf` (dark). Gold (`--gold`) is used only for fit scores.
- Type: Fraunces for page titles, Geist for UI (15px body), Geist Mono for numbers.
- Radius: cards 16px, controls 8px. Motion: 400ms fade-up, disabled under prefers-reduced-motion.
- Layout: grouped left sidebar (drawer on mobile), one primary action per page, honest empty states.
- Dialogs: `role="dialog"`, `aria-modal`, close on Escape and backdrop click, focus restored.
