# Stuffy Town Defense

A real-time cel-shaded 3D tower defense game. Every defender, enemy, building, tree, road, projectile, and build pad is mesh geometry rendered with WebGL 2. Characters have articulated limbs, towers turn and recoil, and the scene uses four-band toon lighting, ink outlines, and cast shadows.

## Run

With Node.js installed:

```sh
npm run dev
```

Open http://127.0.0.1:8026. Three.js is vendored inside `dist/vendor`, so the game has no runtime CDN requirement or build step. The browser must support WebGL 2 and hardware acceleration.

## Play

Choose a defender, click an empty + pad, and start a wave. Click a built tower to upgrade or sell it. Keep at least one heart through all 15 waves. Every fifth wave includes a boss.

- Button Blaster: teddy with splash-damage cannon.
- Bunny Ranger: archer with long range.
- Frost Flipper: penguin in a glass globe, slows enemies.
- Stitch Engineer: fox with rapid-fire turret.

Keys 1–4 select defenders, Space pauses, Escape cancels, and N starts a wave. Right-drag the battlefield to orbit; use the wheel or on-screen buttons to zoom. The 3D button resets the view. On narrow screens, swipe horizontally to explore the board.

## Render deployment

Create a **Static Site** from `corycowgill/StuffieBattle`, branch `main`.

| Setting | Value |
|---|---|
| Root Directory | Leave blank |
| Build Command | `npm test` |
| Publish Directory | `dist` |
| Environment Variables | None |

All browser modules, including the Three.js runtime and MIT license, are committed under `dist`.

## Verification

```sh
npm test
```

Includes browser-module syntax checks, tower economy, complete campaign simulation, defeat and victory, slowing, upgrade limits, road clearance, and 3D model tests. The model tests verify volume, toon ramps, articulated walking joints, mesh scenery, and absence of runtime sprite/image dependencies.

## Source

- `dist/geometry.js`: shared mesh construction, toon materials, outlines, geometry batching.
- `dist/characters.js`: modeled defenders, enemies, weapons, and articulation.
- `dist/town.js`: modeled terrain, road, scenery, town hall, and build pads.
- `dist/render.js`: WebGL scene, shadows, animation, raycasting, camera, effects, and live 3D UI previews.
- `dist/engine.js`: combat, economy, and 15-wave campaign simulation.
- `dist/game.js`: UI, controls, and audio.
- `tests-3d.mjs`, `tests.mjs`: geometry and gameplay tests.

To update the rendering library intentionally, run `npm ci`, update the pinned Three.js version, then `npm run vendor`. The vendor helper copies the matching module/core pair, geometry utility, and license into the static deployment directory.

Art and material notes: [ART-DIRECTION.md](ART-DIRECTION.md).
