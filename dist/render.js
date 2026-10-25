import { drawSprite } from './sprites.js';
import { terrain, foes } from './art.js';
import { TYPES, PATH, PADS } from './engine.js';

const WIDTH = 1320, HEIGHT = 620;
function camera(width, height) {
  // Wide displays crop only the decorative foreground, keeping every build pad visible.
  const viewHeight = Math.max(520, Math.min(HEIGHT, height / width * WIDTH));
  const scale = Math.min(width / WIDTH, height / viewHeight);
  return { scale, x: (width - WIDTH * scale) / 2, y: (height - viewHeight * scale) / 2, viewHeight };
}
export function worldPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect(), view = camera(rect.width, rect.height);
  return {
    x: (event.clientX - rect.left - view.x) / view.scale,
    y: (event.clientY - rect.top - view.y) / view.scale
  };
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d', { alpha: false });
  const background = document.createElement('canvas');
  background.width = WIDTH * 2; background.height = HEIGHT * 2;
  const scene = background.getContext('2d');
  let backgroundReady = false, previousTime = -1;
  const trails = new WeakMap(), births = new WeakMap();
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ellipse(x, y, rx, ry, fill, stroke, width = 1) {
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
  }
  function rounded(x, y, w, h, r, fill, stroke, width = 1) {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
  }
  function text(label, x, y, size, color = '#fff1c8') {
    ctx.font = `600 ${size}px Fredoka, sans-serif`; ctx.textAlign = 'center';
    ctx.fillStyle = color; ctx.fillText(label, x, y);
  }
  function glow(x, y, radius, color) {
    const light = ctx.createRadialGradient(x, y, 0, x, y, radius);
    light.addColorStop(0, color); light.addColorStop(1, 'transparent');
    ctx.fillStyle = light; ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  function star(x, y, radius, color, angle = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4, r = i % 2 ? radius * .24 : radius;
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath(); ctx.fillStyle = color; ctx.fill(); ctx.restore();
  }
  function floor() {
    if (terrain.ready && !backgroundReady) {
      scene.drawImage(terrain.image, 0, 0, background.width, background.height);
      backgroundReady = true;
    }
    if (backgroundReady) ctx.drawImage(background, 0, 0, WIDTH, HEIGHT);
    else {
      ctx.fillStyle = '#78905b'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.beginPath(); PATH.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
      ctx.lineWidth = 62; ctx.lineJoin = 'round'; ctx.strokeStyle = '#e8c481'; ctx.stroke();
    }
  }
  function pad(index, game, hover, selected, time) {
    const [x, y] = PADS[index], occupied = game.towers.some(t => t.pad === index);
    if (occupied) return;
    const active = selected >= 0, focus = index === hover && active;
    const pulse = reducedMotion ? 1 : .65 + Math.sin(time * 3 + index) * .2;
    ellipse(x + 5, y + 12, 46, 23, '#183e383b');
    const edge = ctx.createLinearGradient(x, y - 15, x, y + 15);
    edge.addColorStop(0, '#f8e2a0'); edge.addColorStop(.5, '#b0935d'); edge.addColorStop(1, '#746f4b');
    ellipse(x, y + 5, 43, 23, edge, '#6a7253', 1.5);
    const face = ctx.createLinearGradient(x, y - 24, x, y + 17);
    face.addColorStop(0, focus ? '#fff3bb' : '#e8d8a9'); face.addColorStop(1, focus ? '#d6b96e' : '#b8b083');
    ellipse(x, y - 1, 43, 22, face, '#ffedb7', 2);
    ellipse(x, y - 2, 36, 17, focus ? '#3c7c66' : '#647a5d', '#b2aa75', 1.5);
    ctx.save(); ctx.setLineDash([2, 4]); ellipse(x, y - 2, 32, 14, null, '#e5d9a1b0'); ctx.restore();
    ctx.globalAlpha = active ? 1 : .78;
    text('+', x, y + 6, 29, active ? '#fff2c7' : '#d9d7af'); ctx.globalAlpha = 1;
    if (active) {
      ctx.globalAlpha = pulse; ellipse(x, y, 48, 26, null, '#ffdc85', 2); ctx.globalAlpha = 1;
      if (focus) { rounded(x - 33, y + 26, 66, 23, 11, '#173e3aeb', '#d3ba75'); text(`✿ ${TYPES[selected].cost}`, x, y + 42, 13); }
    }
  }
  function range(x, y, radius, color) {
    const fill = ctx.createRadialGradient(x, y, radius * .3, x, y, radius);
    fill.addColorStop(0, 'transparent'); fill.addColorStop(1, color + '27');
    ellipse(x, y, radius, radius, fill, color + '8c', 1.5);
    ctx.save(); ctx.setLineDash([5, 9]); ellipse(x, y, radius - 5, radius - 5, null, color + '66', 1); ctx.restore();
  }
  function tower(t, game, { ghost = false, highlighted = false } = {}) {
    if (!births.has(t)) births.set(t, game.time);
    const age = game.time - births.get(t), pop = reducedMotion || ghost ? 1 : Math.min(1, age * 4 + .78);
    const breath = reducedMotion ? 0 : Math.sin(game.time * 2 + t.pad) * .7;
    const recoil = t.recoil || 0, radius = 34 + t.level * 3;
    ellipse(t.x + 9, t.y + 6, radius, 14, '#133b3455');
    ellipse(t.x, t.y + 5, 36, 14, '#142f2d35');
    if (t.level > 1 || highlighted) {
      ctx.globalAlpha = highlighted ? .85 : .45;
      ellipse(t.x, t.y + 4, 43, 20, null, highlighted ? '#fff1a3' : TYPES[t.type].color, 2.5);
      ctx.globalAlpha = 1;
    }
    let facing = 1;
    const target = game.enemies.filter(e => Math.hypot(e.x - t.x, e.y - t.y) < TYPES[t.type].range + 40).sort((a, b) => b.d - a.d)[0];
    if (target && target.x < t.x - 20) facing = -1;
    ctx.save(); ctx.translate(t.x, t.y + 9); ctx.scale(facing * pop, pop);
    const width = 112, height = 138;
    drawSprite(ctx, t.type, -width / 2 - recoil * 3, -height - breath + recoil * 2, width, height);
    ctx.restore();
    if (recoil > .65) {
      const x = t.x + facing * 38, y = t.y - 59;
      glow(x, y, t.type === 2 ? 32 : 23, TYPES[t.type].color + '85');
      star(x, y, t.type === 2 ? 10 : 15, '#fff6c3', game.time * 8);
    }
    rounded(t.x - 18, t.y + 20, 36, 13, 6, '#20463ce8', '#c9b775', .7);
    text('★'.repeat(t.level), t.x, t.y + 30, 10, '#f7d582');
  }
  function enemy(e, time) {
    const boss = e.kind === 'brute', size = boss ? 108 : e.kind === 'sock' ? 61 : 52;
    const step = reducedMotion ? 0 : Math.sin(time * (boss ? 5 : 10) + e.seed * 9);
    const hop = Math.abs(step) * (boss ? 2 : 4);
    ellipse(e.x + 7, e.y + 4, size * .34, size * .13, '#24403955');
    ellipse(e.x, e.y + 3, size * .24, size * .08, '#18382c55');
    if (e.slow > 0) {
      glow(e.x, e.y - 8, size * .7, '#77e9ff46');
      ellipse(e.x, e.y + 3, size * .46, size * .18, '#8edff744', '#baf6ffb0', 1.5);
      for (let i = 0; i < 4; i++) {
        const a = time * 1.7 + i * Math.PI / 2;
        star(e.x + Math.cos(a) * size * .35, e.y - 14 + Math.sin(a) * size * .2, 3, '#e3ffff', a);
      }
    }
    const asset = foes[e.kind];
    ctx.save(); ctx.translate(e.x, e.y - hop); ctx.rotate(step * (boss ? .015 : .035));
    const sx = 1 + step * .025, sy = 1 - step * .025;
    ctx.scale(sx, sy);
    if (asset?.ready) {
      const img = asset.image, height = size, width = height * img.width / img.height;
      ctx.drawImage(img, -width / 2, -height, width, height);
      if (e.flash > 0) {
        ctx.globalAlpha = .18;
        ctx.globalCompositeOperation = 'screen'; ctx.drawImage(img, -width / 2, -height, width, height);
      }
    } else {
      ellipse(0, -size * .45, size * .38, size * .42, '#a283bd', '#675480', 2);
      ellipse(-7, -size * .5, 4, 6, '#ffda69'); ellipse(7, -size * .5, 4, 6, '#ffda69');
    }
    ctx.restore();
    if (e.hp < e.max || boss) {
      const width = boss ? 64 : 32, y = e.y - size - 10 - hop;
      rounded(e.x - width / 2 - 1, y - 1, width + 2, 7, 3, '#153b36df', '#e5d6aa', .6);
      rounded(e.x - width / 2 + 1, y + 1, Math.max(0, (width - 2) * e.hp / e.max), 3, 1, e.slow > 0 ? '#9de9fb' : '#ee9776');
      if (boss) text('PATCHWORK BRUTE', e.x, y - 5, 9, '#fff0c7');
    }
  }
  function projectile(s, advanced) {
    let tail = trails.get(s);
    if (!tail) { tail = []; trails.set(s, tail); }
    if (advanced) { tail.push([s.x, s.y]); if (tail.length > 6) tail.shift(); }
    for (let i = 1; i < tail.length; i++) {
      ctx.beginPath(); ctx.moveTo(...tail[i - 1]); ctx.lineTo(...tail[i]);
      ctx.strokeStyle = s.color; ctx.globalAlpha = i / tail.length * .65;
      ctx.lineWidth = s.type === 3 ? 2 : 4; ctx.lineCap = 'round'; ctx.stroke();
    }
    ctx.globalAlpha = 1;
    if (s.type === 1) {
      const angle = Math.atan2(s.target.y - 10 - s.y, s.target.x - s.x);
      ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(angle);
      ctx.fillStyle = '#d2b67c'; ctx.fillRect(-15, -1, 20, 2);
      ctx.beginPath(); ctx.moveTo(9, 0); ctx.lineTo(0, -4); ctx.lineTo(0, 4); ctx.closePath(); ctx.fillStyle = '#eaf5c3'; ctx.fill();
      ctx.restore();
    } else if (s.type === 2) {
      glow(s.x, s.y, 17, '#83edff75'); star(s.x, s.y, 7, '#dcffff', s.x * .1);
    } else {
      glow(s.x, s.y, 15, '#ffc26370');
      ellipse(s.x, s.y, s.type === 0 ? 6 : 3.5, s.type === 0 ? 6 : 3.5, '#f9d77e', '#fff1bc');
      if (s.type === 0) { ellipse(s.x - 1.5, s.y, 1, 1, '#987044'); ellipse(s.x + 1.5, s.y, 1, 1, '#987044'); }
    }
  }
  function impact(e) {
    const progress = 1 - e.life / e.max, fade = 1 - progress;
    ctx.globalAlpha = fade;
    glow(e.x, e.y - 8, e.size * (progress + .35), e.color + '70');
    ellipse(e.x, e.y, e.size * progress + 5, (e.size * progress + 5) * .55, null, e.color, 3 * fade + .5);
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4 + e.x, r = e.size * progress;
      const x = e.x + Math.cos(a) * r, y = e.y + Math.sin(a) * r * .6 - Math.sin(progress * Math.PI) * 12;
      star(x, y, (1 - progress) * 5 + 1, i % 2 ? '#fff0be' : e.color, a + progress);
    }
    if (e.reward) { text(`+${e.reward} ✿`, e.x, e.y - 37 - progress * 35, 14, '#fff0b4'); }
    ctx.globalAlpha = 1;
  }
  function atmosphere(time) {
    const light = ctx.createRadialGradient(590, 235, 220, 660, 310, 790);
    light.addColorStop(0, 'transparent'); light.addColorStop(1, '#12342d6b');
    ctx.fillStyle = light; ctx.fillRect(0, 0, WIDTH, HEIGHT);
    if (!reducedMotion) {
      for (let i = 0; i < 16; i++) {
        const x = (i * 173.17 + time * (2 + i % 3)) % WIDTH;
        const y = 70 + (i * 73.41) % 490 + Math.sin(time * .7 + i) * 13;
        ctx.globalAlpha = (.25 + Math.sin(time + i) * .16);
        star(x, y, i % 3 ? 1.5 : 2.7, '#fff5c8', time * .2);
      }
      ctx.globalAlpha = 1;
    }
  }
  return function draw(game, { hover = -1, selected = -1, inspected = null, paused = false, started = false } = {}) {
    const dpr = Math.min(devicePixelRatio || 1, 2), rect = canvas.getBoundingClientRect();
    const width = Math.round(rect.width * dpr), height = Math.round(rect.height * dpr);
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#244c3e'; ctx.fillRect(0, 0, width, height);
    const view = camera(width, height), scale = view.scale, ox = view.x, oy = view.y;
    ctx.setTransform(scale, 0, 0, scale, ox, oy);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, WIDTH, HEIGHT); ctx.clip();
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    floor();
    const time = game.time, advanced = time !== previousTime;
    for (let i = 0; i < PADS.length; i++) pad(i, game, hover, selected, time);
    if (inspected) range(inspected.x, inspected.y, TYPES[inspected.type].range + (inspected.level - 1) * 18, TYPES[inspected.type].color);
    else if (selected >= 0 && hover >= 0 && !game.towers.some(t => t.pad === hover)) {
      const [x, y] = PADS[hover]; range(x, y, TYPES[selected].range, TYPES[selected].color);
      ctx.globalAlpha = .65; tower({ type: selected, x, y, pad: hover, level: 1, recoil: 0 }, game, { ghost: true }); ctx.globalAlpha = 1;
    }
    const actors = [...game.towers.map(t => ({ entity: t, y: t.y, tower: true })), ...game.enemies.map(e => ({ entity: e, y: e.y, tower: false }))];
    actors.sort((a, b) => a.y - b.y);
    for (const actor of actors) actor.tower ? tower(actor.entity, game, { highlighted: actor.entity === inspected }) : enemy(actor.entity, time);
    for (const shot of game.shots) projectile(shot, advanced);
    for (const effect of game.effects) impact(effect);
    atmosphere(time); previousTime = time;
    if (paused && started) {
      ctx.fillStyle = '#133a396b'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
      rounded(510, 257, 300, 103, 20, '#173d36ed', '#d2bb78', 2);
      text('TAKE A BREATHER', 660, 290, 11, '#c0cba4'); text('PAUSED', 660, 330, 36);
    }
    ctx.restore();
  };
}
