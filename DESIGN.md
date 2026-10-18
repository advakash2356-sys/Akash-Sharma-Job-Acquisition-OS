# Design: Momentum (Oct 2026)

## Concept (3 lines)
- **Subject:** a private job-search workspace: score, tailor, apply, interview, offer.
- **Emotion:** ambition and forward momentum. The calm confidence of climbing toward a bright horizon.
- **Signature visual:** a winding path up a ridge to a glowing summit/city at dawn, plus a dark walnut desk with a letterpress offer letter. Never space, never shop.

## Tokens
- Palette: cream `#f3eee4` / ink `#0d0b0a`, warm text, **one hot accent**: ember orange (`#c23a06` light, `#ff6a2b` dark). Brass-gold only for scores and key numbers.
- Type: Instrument Serif display (huge, 8-11vw on hero) against tiny tracked uppercase labels (11px, 0.16em); Geist body 15px; Geist Mono numbers.
- Texture: film grain overlay, frosted glass (`blur(18px)`) on nav, rail, cards; faint ridge image behind the app.
- Shape: pill buttons (one solid + one hairline), 20-28px cards.
- Motion: GSAP ScrollTrigger pinned "path" scene, hero parallax, Lenis smooth scroll, marquee. All disabled under `prefers-reduced-motion` (static poster image, no pin, no marquee).
- Assets in `public/`: `hero-loop.mp4` + `hero-poster.jpg` (generated), `ridges-path.jpg`, `desk-offer.jpg`.

## Structure
Landing (`#/`) is the immersive story. The app (`#/app`) is the dense, calm shell: floating glass rail (drawer on mobile), light + dark theme.
