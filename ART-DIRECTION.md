# Real-time 3D art direction

The deployed game uses actual mesh geometry. The former painted battlefield and character sprite sheets have been removed from `dist`; earlier prototypes remain in Git history.

## Character modeling

Defenders and enemies are assembled as volumetric, outlined mesh parts. Teddy ears, rabbit ears, muzzles, eyes, button holes, seams, scarves, paws, bows, cannon bores, rotating barrels, goggles, tails, and the penguin globe all have geometry. Walking uses separate leg and arm joints. Towers have a separate rotating upper assembly and recoiling weapon group.

`dist/characters.js` is the editable model source. `dist/town.js` models the quilt board, stitched road, toybox, clock hall, cottages, fences, trees, and flowers. `dist/geometry.js` supplies shared construction helpers and batches immutable parts by material.

## Rendering

- Four-step nearest-filtered toon light ramp; the ramp is a generated one-dimensional shader lookup, not character artwork.
- Smooth mesh normals with discrete light bands and inverted-hull ink outlines.
- Warm directional key light, cool rim light, hemisphere fill, and real shadow maps.
- Orthographic 3D camera with orbit, zoom, ground-plane raycasting, and actual mesh picking.
- Mesh projectiles, snow crystals, impact rings, and volumetric particles.
- Live WebGL model previews for tower cards and the welcome scene.

Palette: coral teddy, mint bunny, blue penguin, orange fox, violet plush enemies, cream and gold fittings, sage terrain, teal roofs. Shapes are rounded and toy-like; seams and button details reinforce the plush theme.

This is an original procedural 3D model set. It is not imported production-studio character art. Further model sculpting, authored animation, and material refinement can build on these editable mesh sources.
