// Level 1, part 1: autumn morning in Нарлаг — mum asks for help, wood-chopping timing game, then the alarm
function levelCard(scene, kicker, title, sub, done) {
  const c = scene.add.container(GW / 2, GH / 2 - 40).setScrollFactor(0).setDepth(9800);
  const g = scene.add.graphics(); const w = 980, h = 330;
  g.fillStyle(COL.ink, 1).fillRoundedRect(-w / 2, -h / 2 + 14, w, h, 40); g.fillStyle(COL.panel, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 40); g.lineStyle(8, COL.ink).strokeRoundedRect(-w / 2, -h / 2, w, h, 40);
  const tape1 = scene.add.rectangle(-w / 2 + 70, -h / 2 + 6, 150, 40, 0xff9fb0, 0.85).setAngle(-12), tape2 = scene.add.rectangle(w / 2 - 70, -h / 2 + 6, 150, 40, 0x9fe8c8, 0.85).setAngle(10);
  const k = txt(scene, 0, -100, kicker, 36, '#ff6b7a'), t = txt(scene, 0, -10, title, 84, COL.inkS), s = txt(scene, 0, 86, sub, 36, '#6b5fa8', { weight: '800' });
  c.add([g, tape1, tape2, k, t, s]); c.setScale(0.2).setAngle(-8).setAlpha(0);
  SND.sfx('whoosh', 0.6);
  scene.tweens.add({ targets: c, scale: 1, angle: -2, alpha: 1, duration: 560, ease: 'Back.Out' });
  scene.tweens.add({ targets: c, y: c.y - 30, alpha: 0, scale: 0.9, delay: 2300, duration: 450, ease: 'Cubic.In', onComplete: () => { c.destroy(); done && done(); } });
}
function leaves(scene, n = 26, depth = 3600) {
  if (!scene.textures.exists('leaf')) canvasTex(scene, 'leaf', 48, 32, (c) => { c.fillStyle = '#fff'; c.beginPath(); c.moveTo(2, 16); c.quadraticCurveTo(24, -6, 46, 16); c.quadraticCurveTo(24, 38, 2, 16); c.fill(); c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 2; c.beginPath(); c.moveTo(4, 16); c.lineTo(44, 16); c.stroke(); });
  const cols = [0xffa94d, 0xff7b54, 0xffd36a, 0xe8794a, 0xc9e265]; const arr = [];
  for (let i = 0; i < n; i++) { const l = scene.add.image(Math.random() * BGW, Math.random() * GH, 'leaf').setTint(cols[i % cols.length]).setDepth(depth).setScale(0.6 + Math.random() * 0.6);
    l.vx = 30 + Math.random() * 40; l.vy = 40 + Math.random() * 50; l.ph = Math.random() * 6; l.sp = 1 + Math.random() * 2; arr.push(l); }
  return (t, dt) => arr.forEach(l => { l.x += (l.vx + Math.sin(t * l.sp + l.ph) * 50) * dt; l.y += l.vy * dt; l.rotation = Math.sin(t * l.sp * 1.3 + l.ph) * 1.2; l.scaleY = Math.abs(Math.cos(t * l.sp + l.ph)) * 0.8 + 0.2;
    if (l.y > GH + 30) { l.y = -30; l.x = Math.random() * BGW; } if (l.x > BGW + 30) l.x = -30; });
}

class VillageScene extends Phaser.Scene {
  constructor() { super('Village'); }
  create() {
    SND.bind(this); fadeIn(this, 700); SND.play('m_village', 0.38);
    const w = this.w = new World25(this, 'village'); const cam = this.cameras.main; cam.scrollX = 400;
    this.dlg = new Dialog(this);
    this.mom = new Actor(w, 'mom', 7.3, 1.2, { dir: 7 });
    this.tumur = new Actor(w, 'tumur', -3.0, 2.7, { dir: 2 }); this.suvd = new Actor(w, 'suvd', -0.6, 1.4, { dir: 6 });
    this.ny = new Actor(w, 'nyagtaa', 10.5, 4.2, { dir: 6 });
    this.ball = this.add.image(0, 0, 'ball'); this.ballT = 0; this.shadowB = this.add.image(0, 0, 'shadow').setAlpha(0.4);
    this.leafFx = leaves(this);
    this.score = new ScoreChip(this);
    levelCard(this, '1-р түвшин', 'Баавгай ирж байна!', 'Нарлаг тосгон · Намрын өглөө', () => {
      this.ny.walkTo(3.0, 2.9, () => { this.ny.faceTo(this.mom.x, this.mom.z); this.mom.faceTo(this.ny.x, this.ny.z);
        this.dlg.say(['m1', 'm2', 'n1'], () => this.startChop()); });
    });
  }
  startChop() {
    const w = this.w; this.ny.walkTo(3.25, 2.05, () => this.ny.face(2));
    this.mom.walkTo(7.0, 0.9, () => this.mom.face(6));
    const bp = w.P(4.3, w.H(4.3, 1.4) + 0.53, 1.4), ppu = w.ppu(4.3, 1.4);
    this.blockP = bp; this.logSc = ppu / 230;
    this.log = this.add.image(bp.x, bp.y, 'log').setOrigin(0.5, 0.92).setScale(0).setDepth(bp.y + 2);
    this.axe = this.add.image(bp.x - 70 * this.logSc * 2, bp.y - 150 * this.logSc * 2, 'axe').setOrigin(0.5, 0.95).setScale(this.logSc * 1.6).setDepth(bp.y + 3).setAngle(-40).setAlpha(0);
    const pile = w.P(6.1, w.H(6.1, -0.6) + 0.9, -0.6); this.pileP = pile;
    // timing panel
    const ui = this.ui = this.add.container(0, 0).setScrollFactor(0).setDepth(8000);
    const px = GW / 2, py = GH - 150; this.barX = px - 520; this.barW = 1040;
    const pg = paper(this, px, py, 1240, 200, { r: 36 }); ui.add(pg);
    this.counter = txt(this, px - 520, py - 62, 'Түлээ 0 / 6', 36, COL.inkS, { ox: 0 }); ui.add(this.counter);
    this.hint = txt(this, px + 520, py - 62, 'Ногоон бүсэд дар!', 32, '#ff6b7a', { ox: 1, weight: '800' }); ui.add(this.hint);
    this.bar = this.add.graphics(); ui.add(this.bar);
    this.marker = this.add.container(0, py + 18); const mg = this.add.graphics(); mg.fillStyle(COL.ink, 1).fillTriangle(-22, -58, 22, -58, 0, -26).fillRoundedRect(-7, -30, 14, 92, 6); mg.fillStyle(0xfff8ee, 1).fillTriangle(-14, -54, 14, -54, 0, -32);
    this.marker.add(mg); ui.add(this.marker);
    ui.y = 260; this.tweens.add({ targets: ui, y: 0, duration: 500, ease: 'Back.Out' });
    this.round = 0; this.logs = 6; this.nextLog();
    this.input.on('pointerdown', this.chopTap, this);
    this.input.keyboard && this.input.keyboard.on('keydown-SPACE', this.chopTap, this);
    this.cameras.main.pan(this.cameras.main.scrollX + GW / 2 + 200, GH / 2, 900, 'Sine.easeInOut');
  }
  nextLog() {
    const k = this.round; this.zoneW = 210 - k * 18; this.zoneX = this.barX + 120 + Math.random() * (this.barW - 240 - this.zoneW); this.speed = 820 + k * 140; this.mx = this.barX; this.mdir = 1; this.ready = false;
    this.log.setScale(0).setAngle(0).setAlpha(1).setPosition(this.blockP.x, this.blockP.y);
    this.tweens.add({ targets: this.log, scale: this.logSc * 1.0, duration: 300, ease: 'Back.Out', onComplete: () => { this.ready = true; } });
    SND.sfx('pop', 0.4); this.drawBar();
  }
  drawBar() { const g = this.bar, y = GH - 150 + 20; g.clear();
    g.fillStyle(COL.ink, 1).fillRoundedRect(this.barX - 6, y - 26 + 6, this.barW + 12, 56, 26);
    g.fillStyle(0xffd9c2, 1).fillRoundedRect(this.barX, y - 26, this.barW, 50, 24);
    g.fillStyle(0x3fcf9a, 1).fillRoundedRect(this.zoneX, y - 26, this.zoneW, 50, 12);
    g.fillStyle(0x9ff5cf, 1).fillRoundedRect(this.zoneX + this.zoneW * 0.35, y - 26, this.zoneW * 0.3, 50, 8);
    g.lineStyle(6, COL.ink, 1).strokeRoundedRect(this.barX, y - 26, this.barW, 50, 24); }
  chopTap() {
    if (!this.ready || this.chopDone) return; this.ready = false;
    const m = this.mx, inZone = m >= this.zoneX && m <= this.zoneX + this.zoneW, perfect = Math.abs(m - (this.zoneX + this.zoneW / 2)) < this.zoneW * 0.15;
    const ny = this.ny; this.tweens.add({ targets: ny, extraY: 26, duration: 120, yoyo: true });
    this.axe.setAlpha(1).setAngle(-70); this.tweens.add({ targets: this.axe, angle: 18, duration: 140, ease: 'Cubic.In', onComplete: () => { this.tweens.add({ targets: this.axe, alpha: 0, delay: 250, duration: 200 });
      if (inZone) this.split(perfect); else this.miss(m < this.zoneX); } });
    SND.sfx('whoosh', 0.4, 1.3);
  }
  split(perfect) {
    const pts = perfect ? 15 : 10; G.light += pts; this.score.set(G.light); this.round++;
    SND.sfx('chop', 0.8); this.cameras.main.shake(140, 0.004);
    burst(this, this.blockP.x, this.blockP.y - 60, 16, [0xf1c98d, 0xffe27a, 0xffffff], 7000, { r: 120 });
    floatNum(this, this.blockP.x, this.blockP.y - 160, '+' + pts);
    toast(this, perfect ? 'Гайхалтай!' : 'Сайн!', { y: GH - 330, fill: perfect ? 0xffe27a : 0xfff8ee, hold: 500 });
    this.log.setScale(0);
    [-1, 1].forEach((s, i) => { const h = this.add.image(this.blockP.x + s * 30, this.blockP.y - 50, 'halflog').setScale(this.logSc * 0.9).setFlipX(s < 0).setDepth(this.blockP.y + 5);
      const tx = this.pileP.x + (Math.random() - 0.5) * 60, ty = this.pileP.y + (Math.random() - 0.5) * 40;
      this.tweens.add({ targets: h, x: tx, duration: 650, delay: i * 70, ease: 'Sine.InOut' });
      this.tweens.add({ targets: h, y: Math.min(this.blockP.y, ty) - 220, duration: 330, delay: i * 70, ease: 'Sine.Out', yoyo: false, onComplete: () => this.tweens.add({ targets: h, y: ty, duration: 320, ease: 'Sine.In', onComplete: () => { SND.sfx('stack', 0.5); burst(this, tx, ty, 8, 0xffe9c0, 7000, { r: 60, key: 'smoke', blend: Phaser.BlendModes.NORMAL }); h.destroy(); } }) });
      this.tweens.add({ targets: h, angle: s * 540, duration: 650, delay: i * 70 }); });
    G.chopped = this.round; this.counter.setText(`Түлээ ${this.round} / ${this.logs}`);
    if (this.round >= this.logs) { this.chopDone = true; this.time.delayedCall(900, () => this.endChop()); }
    else this.time.delayedCall(700, () => this.nextLog());
  }
  miss(early) {
    SND.sfx('miss', 0.6); this.hint.setText(early ? 'Арай эрт байлаа!' : 'Арай оройтлоо!');
    this.tweens.add({ targets: this.log, angle: 8, duration: 70, yoyo: true, repeat: 3 });
    this.time.delayedCall(650, () => { this.hint.setText('Ногоон бүсэд дар!'); this.ready = true; });
  }
  endChop() {
    this.tweens.add({ targets: this.ui, y: 300, duration: 400, ease: 'Back.In' });
    this.mom.walkTo(5.6, 1.9, () => { this.mom.faceTo(this.ny.x, this.ny.z); this.mom.bounce = 3.5;
      SND.sfx('fanfare', 0.5); burst(this, this.mom.sx, this.mom.top, 26, [0xffe27a, 0xff9fb0, 0x9fe8c8], 7000, { r: 220 });
      this.dlg.say(['m3'], () => { this.mom.bounce = 0; this.alarm(); }); });
  }
  alarm() {
    // something is coming down the forest path…
    SND.play(null); SND.sfx('rumble', 0.8); this.cameras.main.shake(900, 0.006);
    this.cameras.main.pan(BGW / 2 - 200, GH / 2, 900, 'Sine.easeInOut');
    [this.ny, this.mom, this.tumur, this.suvd].forEach(a => a.faceTo(0, -10));
    const ex = txt(this, 1150, 230, '!', 140, '#ff6b7a', { stroke: INK, st: 16 }).setScrollFactor(0).setDepth(9000).setScale(0);
    this.tweens.add({ targets: ex, scale: 1, duration: 300, ease: 'Back.Out' }); SND.sfx('alarm', 0.6);
    this.time.delayedCall(1700, () => { this.cameras.main.fadeOut(400, 0, 0, 0); this.cameras.main.once('camerafadeoutcomplete', () => VIDEO.play('assets/vid/alarm.mp4', () => this.scene.start('Investigate', { fresh: true }))); });
  }
  update(t, dt) {
    t /= 1000; dt /= 1000; this.w.update(t, dt); this.leafFx(t, dt);
    // kids' ball game
    const a = this.tumur, b = this.suvd; if (a.sx) { this.ballT += dt * 0.9; const k = this.ballT % 1, f = Math.abs(k * 2 - 1), x = a.x + (b.x - a.x) * f, z = a.z + (b.z - a.z) * f;
      const p = this.w.P(x, this.w.H(x, z), z), ppu = this.w.ppu(x, z); const hgt = Math.sin(Math.PI * f) * 1.6 * ppu + 0.5 * ppu;
      this.ball.setPosition(p.x, p.y - hgt).setScale(ppu / 260).setDepth(p.y + 1); this.ball.rotation += dt * 6; this.shadowB.setPosition(p.x, p.y).setDisplaySize(ppu * 0.4, ppu * 0.12).setDepth(p.y - 1);
      a.bounce = f < 0.12 ? 6 : 0; b.bounce = f > 0.88 ? 6 : 0; }
    if (this.marker && !this.chopDone) { if (this.ready) { this.mx += this.mdir * this.speed * dt; if (this.mx > this.barX + this.barW) { this.mx = this.barX + this.barW; this.mdir = -1; } if (this.mx < this.barX) { this.mx = this.barX; this.mdir = 1; } } this.marker.x = this.mx; }
  }
}

// light score chip, top-right corner
class ScoreChip {
  constructor(scene, x = GW - 200, y = 74) {
    this.s = scene; this.c = scene.add.container(x, y).setScrollFactor(0).setDepth(8500);
    const g = scene.add.graphics(); g.fillStyle(COL.ink, 1).fillRoundedRect(-150, -40 + 8, 300, 80, 40); g.fillStyle(0x3b2d7a, 1).fillRoundedRect(-150, -40, 300, 80, 40); g.lineStyle(6, COL.ink).strokeRoundedRect(-150, -40, 300, 80, 40);
    this.sun = scene.add.image(-110, 0, 'sun').setScale(0.82); this.t = txt(scene, 30, 2, String(G.light), 46, '#ffe27a');
    this.c.add([g, this.sun, this.t]); scene.tweens.add({ targets: this.sun, angle: 360, duration: 12000, repeat: -1 }); this.v = G.light;
  }
  set(v) { const from = this.v; this.v = v; this.s.tweens.addCounter({ from, to: v, duration: 600, onUpdate: tw => this.t.setText(String(Math.round(tw.getValue()))) });
    this.s.tweens.add({ targets: this.c, scale: 1.15, duration: 120, yoyo: true }); SND.sfx('coin', 0.45); }
}
