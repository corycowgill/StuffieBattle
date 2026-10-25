import * as THREE from './vendor/three.module.js';
import { mergeGeometries } from './vendor/BufferGeometryUtils.js';
export { THREE };
export const COLORS = {
  ink: '#293c40', cream: '#fff0cf', gold: '#efbc59', brass: '#bc813b',
  coral: '#e98b79', rose: '#b95d66', mint: '#a8ca9e', teal: '#367d78',
  blue: '#438bb2', navy: '#355a81', purple: '#9980bc', violet: '#64517e',
  leaf: '#649c70', darkLeaf: '#3b735c', wood: '#a67e50', darkWood: '#735640'
};
const ramp = new THREE.DataTexture(new Uint8Array([42, 102, 180, 255]), 4, 1, THREE.RedFormat);
ramp.minFilter = ramp.magFilter = THREE.NearestFilter; ramp.generateMipmaps = false; ramp.needsUpdate = true;
const materials = new Map(), geometries = new Map();
export const ink = new THREE.MeshBasicMaterial({ color: COLORS.ink, side: THREE.BackSide });
export function toon(color, options = {}) {
  const key = color + JSON.stringify(options);
  if (!materials.has(key)) materials.set(key, new THREE.MeshToonMaterial({ color, gradientMap: ramp, ...options }));
  return materials.get(key);
}
export function geometry(key, create) { if (!geometries.has(key)) geometries.set(key, create()); return geometries.get(key); }
export function group(parent, x = 0, y = 0, z = 0) { const g = new THREE.Group(); g.position.set(x, y, z); if (parent) parent.add(g); return g; }
export function part(parent, shape, color, position = [0, 0, 0], scale = [1, 1, 1], outline = true) {
  const mesh = new THREE.Mesh(shape, typeof color === 'string' ? toon(color) : color);
  mesh.position.set(...position); mesh.scale.set(...scale); mesh.castShadow = true; mesh.receiveShadow = true;
  if (outline) {
    const shell = new THREE.Mesh(shape, ink); shell.scale.setScalar(1.025);
    shell.castShadow = false; shell.receiveShadow = false; shell.userData.outline = true; mesh.add(shell);
  }
  parent.add(mesh); return mesh;
}
export function ball(parent, color, x, y, z, sx, sy = sx, sz = sx, outline = true) {
  return part(parent, geometry('sphere', () => new THREE.SphereGeometry(1, 16, 12)), color, [x, y, z], [sx, sy, sz], outline);
}
export function box(parent, color, x, y, z, w, h, d, outline = true) {
  return part(parent, geometry('box', () => new THREE.BoxGeometry(1, 1, 1)), color, [x, y, z], [w, h, d], outline);
}
export function cylinder(parent, color, x, y, z, top, bottom, height, sides = 20, outline = true) {
  return part(parent, geometry(`cyl:${top}:${bottom}:${height}:${sides}`, () => new THREE.CylinderGeometry(top, bottom, height, sides)), color, [x, y, z], [1, 1, 1], outline);
}
export function torus(parent, color, x, y, z, radius, tube = .04, outline = false) {
  return part(parent, geometry(`torus:${radius}:${tube}`, () => new THREE.TorusGeometry(radius, tube, 6, 24)), color, [x, y, z], [1, 1, 1], outline);
}
export function cone(parent, color, x, y, z, radius, height, sides = 12) {
  return part(parent, geometry(`cone:${radius}:${height}:${sides}`, () => new THREE.ConeGeometry(radius, height, sides)), color, [x, y, z]);
}
export function stroke(parent, color, points, radius = .02, segments = 12) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  return part(parent, new THREE.TubeGeometry(curve, segments, radius, 5, false), color, [0, 0, 0], [1, 1, 1], false);
}
export function rod(parent, color, a, b, radius = .025, sides = 6) {
  const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b), delta = end.clone().sub(start);
  const mesh = cylinder(parent, color, ...(start.clone().add(end).multiplyScalar(.5).toArray()), radius, radius, delta.length(), sides, false);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize()); return mesh;
}
export function button(parent, color, x, y, z, radius = .13) {
  const root = group(parent, x, y, z);
  const disk = cylinder(root, color, 0, 0, 0, radius, radius, .055, 16); disk.rotation.x = Math.PI / 2;
  torus(root, color, 0, 0, .035, radius * .78, radius * .12);
  for (const dx of [-1, 1]) for (const dy of [-1, 1]) ball(root, COLORS.darkWood, dx * radius * .27, dy * radius * .27, .036, radius * .12, radius * .12, .012, false);
  rod(root, COLORS.cream, [-radius * .28, -radius * .28, .05], [radius * .28, radius * .28, .05], .012);
  return root;
}
export function seam(parent, points, color = '#f5d8a0', step = 3) {
  for (let i = 0; i < points.length - 1; i += step) rod(parent, color, points[i], points[Math.min(i + 1, points.length - 1)], .012, 4);
}
export function roundedGeometry(w, h, d, radius = .12) {
  return geometry(`rounded:${w}:${h}:${d}:${radius}`, () => {
    const x = -w / 2 + radius, y = -d / 2 + radius, rw = w - 2 * radius, rd = d - 2 * radius;
    const shape = new THREE.Shape(); shape.moveTo(x, y); shape.lineTo(x + rw, y); shape.lineTo(x + rw, y + rd); shape.lineTo(x, y + rd); shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: Math.max(.02, h - 2 * radius), bevelEnabled: true, bevelThickness: radius, bevelSize: radius, bevelSegments: 3, steps: 1 });
    geo.rotateX(-Math.PI / 2); geo.translate(0, -h / 2 + radius, 0); geo.computeVertexNormals(); return geo;
  });
}
export function cushion(parent, color, x, y, z, w, h, d, radius = .1, outline = true) {
  return part(parent, roundedGeometry(w, h, d, radius), color, [x, y, z], [1, 1, 1], outline);
}
// Batch immutable mesh parts by material. Moving joints remain separate groups.
export function batch(root) {
  root.updateWorldMatrix(true, true);
  const inverse = root.matrixWorld.clone().invert(), buckets = new Map();
  root.traverse(mesh => {
    if (!mesh.isMesh) return;
    const key = `${mesh.material.uuid}:${mesh.castShadow}:${mesh.receiveShadow}`;
    if (!buckets.has(key)) buckets.set(key, { material: mesh.material, cast: mesh.castShadow, receive: mesh.receiveShadow, parts: [] });
    let geo = mesh.geometry.clone(); if (geo.index) geo = geo.toNonIndexed();
    geo.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse, mesh.matrixWorld));
    if (!geo.attributes.uv) geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count * 2), 2));
    for (const name of Object.keys(geo.attributes)) if (!['position', 'normal', 'uv'].includes(name)) geo.deleteAttribute(name);
    buckets.get(key).parts.push(geo);
  });
  root.clear();
  for (const bucket of buckets.values()) {
    const geo = mergeGeometries(bucket.parts, false);
    if (!geo) throw new Error('Unable to batch modeled geometry');
    geo.userData.owned = true; const mesh = new THREE.Mesh(geo, bucket.material); mesh.castShadow = bucket.cast; mesh.receiveShadow = bucket.receive; root.add(mesh);
    bucket.parts.forEach(part => part.dispose());
  }
  return root;
}
export function worldPosition(x, y, height = 0) { return new THREE.Vector3((x - 660) / 40, height, (y - 310) / 40); }
