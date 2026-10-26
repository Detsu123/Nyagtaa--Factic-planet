// 2.5D world: pre-rendered parallax layers + exact camera from the 3D bake, so 3D-rendered actors stand on the real ground
const BGW = 2400;
class World25 {
  constructor(scene, loc, o = {}) {
    this.s = scene; this.loc = loc; const W = scene.cache.json.get('world'); this.W = W;
    const c = W.locs[loc]; this.cam = c; this.pv = mul4(c.proj, c.view); this.inv = inv4(this.pv);
    this.camPos = c.pos;
    const hg = W.height; this.hg = hg;
    this.sky = scene.add.image(0, 0, `${loc}_sky`).setOrigin(0).setDisplaySize(BGW, GH).setScrollFactor(o.skyF ?? 0.55).setDepth(-30);
    this.far = scene.add.image(0, 0, `${loc}_far`).setOrigin(0).setScrollFactor(o.farF ?? 0.8).setDepth(-20);
    this.near = scene.add.image(0, 0, `${loc}_near`).setOrigin(0).setDepth(-10);
    scene.cameras.main.setBounds(0, 0, BGW, GH);
    if (o.blur) scene.add.rectangle(BGW / 2, GH / 2, BGW * 2, GH * 2, 0xc9cde6).setScrollFactor(0).setDepth(-40);
    if (o.blur && this.near.preFX) [this.sky, this.far, this.near].forEach(im => im.preFX.addBlur(1, 2, 2, o.blur));
    this.actors = [];
  }
  H(x, z) { const g = this.hg; const fx = (x - g.x0) / g.st, fz = (z - g.z0) / g.st; const i = Math.max(0, Math.min(g.nx - 2, Math.floor(fx))), j = Math.max(0, Math.min(g.nz - 2, Math.floor(fz)));
    const u = Math.min(1, Math.max(0, fx - i)), v = Math.min(1, Math.max(0, fz - j)); const h = g.h;
    return (h[j][i] * (1 - u) + h[j][i + 1] * u) * (1 - v) + (h[j + 1][i] * (1 - u) + h[j + 1][i + 1] * u) * v; }
  // world → layer pixel (near layer space, 2400×1080)
  P(x, y, z) { const m = this.pv; const cx = m[0] * x + m[4] * y + m[8] * z + m[12], cy = m[1] * x + m[5] * y + m[9] * z + m[13], cw = m[3] * x + m[7] * y + m[11] * z + m[15];
    return { x: (cx / cw * 0.5 + 0.5) * BGW, y: (0.5 - cy / cw * 0.5) * GH, w: cw }; }
  ppu(x, z) { const h = this.H(x, z); return this.P(x, h, z).y - this.P(x, h + 1, z).y; }
  // layer pixel → ground point
  ground(px, py) { const nx = px / BGW * 2 - 1, ny = 1 - py / GH * 2; const a = unproj(this.inv, nx, ny, -1), b = unproj(this.inv, nx, ny, 1);
    let y = 0, x = 0, z = 0; for (let k = 0; k < 4; k++) { const t = (y - a[1]) / (b[1] - a[1]); if (!(t > 0)) return null; x = a[0] + (b[0] - a[0]) * t; z = a[2] + (b[2] - a[2]) * t; y = this.H(x, z); } return { x, z }; }
  add(actor) { this.actors.push(actor); return actor; }
  update(t, dt) { this.actors.forEach(a => a.update(t, dt)); }
}
function mul4(a, b) { const o = new Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; } return o; }
function inv4(m) { const inv = new Array(16); const [a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15] = m;
  inv[0] = a5 * a10 * a15 - a5 * a11 * a14 - a9 * a6 * a15 + a9 * a7 * a14 + a13 * a6 * a11 - a13 * a7 * a10; inv[4] = -a4 * a10 * a15 + a4 * a11 * a14 + a8 * a6 * a15 - a8 * a7 * a14 - a12 * a6 * a11 + a12 * a7 * a10;
  inv[8] = a4 * a9 * a15 - a4 * a11 * a13 - a8 * a5 * a15 + a8 * a7 * a13 + a12 * a5 * a11 - a12 * a7 * a9; inv[12] = -a4 * a9 * a14 + a4 * a10 * a13 + a8 * a5 * a14 - a8 * a6 * a13 - a12 * a5 * a10 + a12 * a6 * a9;
  inv[1] = -a1 * a10 * a15 + a1 * a11 * a14 + a9 * a2 * a15 - a9 * a3 * a14 - a13 * a2 * a11 + a13 * a3 * a10; inv[5] = a0 * a10 * a15 - a0 * a11 * a14 - a8 * a2 * a15 + a8 * a3 * a14 + a12 * a2 * a11 - a12 * a3 * a10;
  inv[9] = -a0 * a9 * a15 + a0 * a11 * a13 + a8 * a1 * a15 - a8 * a3 * a13 - a12 * a1 * a11 + a12 * a3 * a9; inv[13] = a0 * a9 * a14 - a0 * a10 * a13 - a8 * a1 * a14 + a8 * a2 * a13 + a12 * a1 * a10 - a12 * a2 * a9;
  inv[2] = a1 * a6 * a15 - a1 * a7 * a14 - a5 * a2 * a15 + a5 * a3 * a14 + a13 * a2 * a7 - a13 * a3 * a6; inv[6] = -a0 * a6 * a15 + a0 * a7 * a14 + a4 * a2 * a15 - a4 * a3 * a14 - a12 * a2 * a7 + a12 * a3 * a6;
  inv[10] = a0 * a5 * a15 - a0 * a7 * a13 - a4 * a1 * a15 + a4 * a3 * a13 + a12 * a1 * a7 - a12 * a3 * a5; inv[14] = -a0 * a5 * a14 + a0 * a6 * a13 + a4 * a1 * a14 - a4 * a2 * a13 - a12 * a1 * a6 + a12 * a2 * a5;
  inv[3] = -a1 * a6 * a11 + a1 * a7 * a10 + a5 * a2 * a11 - a5 * a3 * a10 - a9 * a2 * a7 + a9 * a3 * a6; inv[7] = a0 * a6 * a11 - a0 * a7 * a10 - a4 * a2 * a11 + a4 * a3 * a10 + a8 * a2 * a7 - a8 * a3 * a6;
  inv[11] = -a0 * a5 * a11 + a0 * a7 * a9 + a4 * a1 * a11 - a4 * a3 * a9 - a8 * a1 * a7 + a8 * a3 * a5; inv[15] = a0 * a5 * a10 - a0 * a6 * a9 - a4 * a1 * a10 + a4 * a2 * a9 + a8 * a1 * a6 - a8 * a2 * a5;
  const det = a0 * inv[0] + a1 * inv[4] + a2 * inv[8] + a3 * inv[12]; return inv.map(v => v / det); }
function unproj(m, x, y, z) { const X = m[0] * x + m[4] * y + m[8] * z + m[12], Y = m[1] * x + m[5] * y + m[9] * z + m[13], Z = m[2] * x + m[6] * y + m[10] * z + m[14], Wv = m[3] * x + m[7] * y + m[11] * z + m[15]; return [X / Wv, Y / Wv, Z / Wv]; }

// a 3D-rendered character: 8 facing directions, hop-walk with squash & stretch, contact shadow
const HEIGHTS = { nyagtaa: 2.0, dad: 2.15, mom: 1.95, suvd: 1.5, tumur: 1.5, khuurmag: 2.2, hunter: 2.1, wood1: 2.05, wood2: 1.6 };
class Actor {
  constructor(world, ch, x, z, o = {}) {
    this.w = world; this.s = world.s; this.ch = ch; this.x = x; this.z = z; this.dir = o.dir ?? 0; this.hw = (HEIGHTS[ch] || 2) * (o.scale || 1);
    this.meta = world.W.chars[ch]; this.speed = o.speed || 4.2; this.path = null; this.hop = 0; this.ph = Math.random() * 6; this.bounce = o.bounce || 0; this.extraY = 0; this.mood = 0;
    this.shadow = this.s.add.image(0, 0, 'shadow').setAlpha(0.55);
    this.spr = this.s.add.image(0, 0, `${ch}_${this.dir}`).setOrigin(0.5, (this.meta.h - this.meta.footPx) / this.meta.h);
    this.tint = null; this.visible = true; this.walkT = 0;
    world.add(this);
  }
  face(d) { this.dir = ((d % 8) + 8) % 8; this.spr.setTexture(`${this.ch}_${this.dir}`); }
  faceTo(x, z) { const a = Math.atan2(x - this.x, z - this.z); this.face(Math.round(a / (Math.PI / 4))); }
  walkTo(x, z, done) { this.path = { x, z, done }; }
  stop() { this.path = null; }
  setVisible(v) { this.visible = v; this.spr.setVisible(v); this.shadow.setVisible(v); }
  update(t, dt) {
    if (!this.visible) return;
    let moving = false;
    if (this.path) { const dx = this.path.x - this.x, dz = this.path.z - this.z, d = Math.hypot(dx, dz);
      if (d < 0.06) { const cb = this.path.done; this.path = null; cb && cb(); }
      else { const st = Math.min(d, this.speed * dt); this.x += dx / d * st; this.z += dz / d * st; moving = true;
        const want = ((Math.round(Math.atan2(dx, dz) / (Math.PI / 4)) % 8) + 8) % 8;
        this.turnT = (this.turnT || 0) + dt; if (want !== this.dir && this.turnT > 0.07) { this.turnT = 0; let diff = want - this.dir; if (diff > 4) diff -= 8; if (diff < -4) diff += 8; this.face(this.dir + Math.sign(diff)); } } }
    const h = this.w.H(this.x, this.z), p = this.w.P(this.x, h, this.z), ppu = this.w.ppu(this.x, this.z);
    const sc = ppu * this.hw / this.meta.unitPx;
    this.walkT = moving ? this.walkT + dt * 9.5 : 0;
    const hop = moving ? Math.abs(Math.sin(this.walkT)) * 0.16 * ppu : (this.bounce ? Math.abs(Math.sin(t * this.bounce + this.ph)) * 0.12 * ppu : 0);
    const breathe = 1 + Math.sin(t * 2.4 + this.ph) * 0.012;
    const sq = moving ? 1 + Math.cos(this.walkT * 2) * 0.05 : (this.bounce ? 1 + Math.cos(2 * (t * this.bounce + this.ph)) * 0.04 : breathe);
    this.spr.setPosition(p.x, p.y - hop - this.extraY).setScale(sc / sq, sc * sq).setDepth(p.y);
    this.spr.angle = moving ? Math.sin(this.walkT) * 4 : (this.wobble ? Math.sin(t * 18) * this.wobble : 0);
    const sw = this.meta.w * sc * 0.75;
    this.shadow.setPosition(p.x, p.y).setDisplaySize(sw * (1 - hop / (ppu * 0.6) * 0.3), sw * 0.26).setDepth(p.y - 1);
    this.sx = p.x; this.sy = p.y; this.top = p.y - this.meta.h * sc * 0.92; this.ppu = ppu;
  }
  destroy() { this.spr.destroy(); this.shadow.destroy(); this.w.actors = this.w.actors.filter(a => a !== this); }
}

// a glowing "look here" marker anchored to a world point
class Hotspot {
  constructor(world, x, y, z, o = {}) {
    const s = world.s; this.w = world; this.s = s; this.x = x; this.y = y; this.z = z; this.o = o; this.done = false; this.ids = o.ids;
    const p = world.P(x, world.H(x, z) + y, z); this.c = s.add.container(p.x, p.y).setDepth(3000 + (o.depth || 0));
    this.ring = s.add.image(0, 0, 'ring').setScale(o.ring || 0.9).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.85);
    this.icon = s.add.image(0, 0, o.icon || 'lens_ic').setScale(o.iconS || 0.62);
    this.lab = o.label ? txt(s, 0, 74, o.label, 28, '#ffffff', { stroke: COL.inkS, st: 8 }) : null;
    this.c.add([this.ring, this.icon]); if (this.lab) this.c.add(this.lab);
    this.c.setSize(150, 150).setInteractive({ useHandCursor: true });
    this.c.on('pointerdown', (p2, lx, ly, ev) => { ev.stopPropagation(); SND.sfx('tap', 0.5); o.onTap && o.onTap(this); });
    s.tweens.add({ targets: this.ring, angle: 360, duration: 6000, repeat: -1 });
    s.tweens.add({ targets: this.icon, y: -10, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    s.tweens.add({ targets: this.ring, scale: (o.ring || 0.9) * 1.12, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  }
  pos() { return this.c; }
  setDone() { this.done = true; this.ring.setTint(0x7dffc4); this.icon.setTexture('check_ic'); this.s.tweens.killTweensOf(this.icon); this.icon.y = 0; this.c.setAlpha(0.75); }
  destroy() { this.c.destroy(); }
}
