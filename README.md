# Stuffy Town Defense

A playable browser tower defense game set in a quilted village, with four plush defenders, fifteen waves, bosses, tower upgrades, selling, sound effects, pause, and speed controls.

Play: https://stuffy-town-defense-cory.zippyreed4.chatgpt.site (private; sign in with ChatGPT).

## Run locally

Requires Node.js 18 or newer. No dependency installation or build step is needed.

```sh
npm run dev
```

Open http://127.0.0.1:8026.

## Play

Choose a defender, click an empty + pad, and start a wave. Click a built tower to upgrade or sell it. Keep at least one town heart through wave 15 to win. Every fifth wave includes a boss.

- Button Blaster: splash damage.
- Bunny Ranger: long range.
- Frost Flipper: slows nearby enemies.
- Stitch Engineer: rapid fire.

Keys: 1–4 select defenders, Space pauses, Escape cancels selection, N starts the next wave. On narrow screens, swipe the meadow to explore the battlefield.

## Verify

```sh
npm test
```

Seven simulation tests cover tower economy, path completion, defeat, victory, slowing, upgrade limits, road clearance, and a full campaign funded entirely by earned buttons. The same command also checks browser module syntax.

## Project layout

- `dist/`: directly deployable static game, including generated artwork.
- `dist/engine.js`: combat, economy, and wave simulation.
- `dist/render.js`: canvas battlefield, enemies, and effects.
- `dist/sprites.js`: tower sprite rendering.
- `dist/game.js`: controls, UI, audio, and game loop.
- `server.mjs`: dependency-free local HTTP server.
- `tests.mjs`: Node.js simulation tests.
- `.openai/hosting.json`: existing private Sites deployment identity and static root.

The welcome screen uses the generated gameplay concept. Towers use independent transparent sprites; the quilted battlefield and enemies render dynamically on canvas. Optional Google Fonts have system fallbacks. This is the initial playable 2D version of the game.

## Graphics upgrade

The playable battlefield now uses a detailed painted 3D-style quilted village with warm sunlight, soft ambient shadows, crafted cottages, felt woodland, and a clock town hall. Three transparent enemy assets replace the original simple shapes. Runtime animation adds walking bounce, tower recoil and facing, contact shadows, projectile trails, button explosions, frost sparkles, floating button rewards, and ambient motes. A dark teal and gold HUD frames the brighter battlefield.

The camera maintains proportions across screen sizes; wide displays crop only decorative foreground. Pointer hit testing uses the same camera transform. Build pads and the enemy route align with the painted road. Enemy textures are trimmed and pre-sized once, and the background is cached at high resolution. Reduced-motion preferences suppress ambient and walking animation.

Asset briefs and file names: [ART-DIRECTION.md](ART-DIRECTION.md). Original artwork remains available alongside the v2 assets.
