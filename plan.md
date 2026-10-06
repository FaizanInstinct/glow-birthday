# Hina Glow — implementation plan

## Product direction
A mobile-first birthday keepsake for Hina: five sequential gift moments that feel like a hand-crafted digital ritual rather than a generic landing page. The reference's calm “chapter” progression is retained, but the new experience is more tactile, cinematic, and game-like.

## Design
- **Design movement:** Neo-romantic editorial / celestial atelier.
- **Core principles:** intimate storytelling, tactile ritual, luminous contrast, playful precision.
- **Color philosophy:** a deep plum night canvas anchors the journey while orchid, peony, blush, and champagne accents create a warm pink-to-purple gradient with enough contrast for legibility.
- **Layout paradigm:** a stage-based vertical journey with an asymmetrical hero split, floating progress rail, and one dominant interaction at a time.
- **Signature elements:** a “glow thread” progress rail, glassy gift cards with halo shadows, and a constellation of tiny star/spark particles.
- **Interaction philosophy:** every action feels like opening, tuning, lighting, or placing something by hand; progress is earned, never rushed.
- **Animation:** use gentle spring easing, depth parallax, staggered reveals, confetti bursts, soft particle drift, and reduced-motion fallbacks. Interactions must stay responsive and not depend on animation completion.
- **Typography system:** `DM Sans` for controls and metadata; `Cormorant Garamond` for emotional display headlines; italic serif accents for handwritten warmth.
- **Brand essence:** a private little universe made for one person; luminous, tender, mischievous.
- **Brand voice:** specific and affectionate, never generic. Example lines: “A little orbit of good things, just for you.” / “The best gifts are the ones you can feel arriving.”
- **Wordmark & logo:** a small orbital spark mark beside “HINA GLOW”; the logotype uses a serif display lockup rather than a default wordmark.
- **Signature brand color:** Orchid flare `#D56CFF`.

## Experience architecture
1. **Welcome / Orbit 01:** intro, animated orbital emblem, “Begin the birthday orbit”.
2. **Level 02 / Memory constellation:** tap floating stars to reveal three personalized micro-notes.
3. **Level 03 / Wish ribbon:** drag a glowing ribbon across the stage to unwrap a hidden wish.
4. **Level 04 / Cake atelier:** interactive cake cutting with pointer/touch slice gesture, frosting split, crumb/confetti feedback, then a “make a wish” handoff.
5. **Level 05 / Candlelight + ring finale:** tap/hold or pointer-swipe to blow out candles with a graceful touch fallback; then reveal the diamond ring in a cinematic hand stage. Desktop click places it on the ring finger. Mobile attempts permission-aware device orientation/proximity support when available, with explicit guidance and a “place the ring” fallback gesture.

## Technical structure
- `index.html`: app shell and font imports.
- `src/main.ts`: app state, five-level journey, pointer/touch and sensor interactions, animation helpers.
- `src/styles.css`: responsive stage layout, palette, typography, keyframes, reduced-motion rules.
- `public/manus-routes.json`: route manifest for `/`.
- `app.config.ts`: project logo metadata.
- Static Vite build, no backend or database required.

## Sensor behavior
Use feature detection for `DeviceOrientationEvent` and `DeviceMotionEvent`, request permission only after a user gesture, and treat an intentional orientation change / proximity-like motion as a trigger. Because the web platform does not expose a universal proximity API, clearly label this as “motion mode” and always provide the touch fallback. Never block progression on sensor support.
