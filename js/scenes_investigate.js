// Level 1, part 2: 90-second investigation across the village plaza and the forest edge
class Hud {
  constructor(scene, o = {}) {
    const s = this.s = scene; const D = 8500; this.root = s.add.container(0, 0).setScrollFactor(0).setDepth(D);
    // clock
    this.timer = s.add.container(150, 92); const tg = s.add.graphics(); tg.fillStyle(COL.ink, 1).fillRoundedRect(-110, -52 + 8, 250, 104, 40); tg.fillStyle(COL.panel, 1).fillRoundedRect(-110, -52, 250, 104, 40); tg.lineStyle(6, COL.ink).strokeRoundedRect(-110, -52, 250, 104, 40);
    this.glass = s.add.image(-62, 0, 'glass').setScale(0.56); this.sand = s.add.graphics(); this.tt = txt(s, 50, 2, '1:30', 54, COL.inkS);
    this.x2 = txt(s, 118, -50, '×2', 34, '#ffffff', { stroke: '#ff4d6d', st: 10 }).setVisible(false);
    this.timer.add([tg, this.sand, this.glass, this.tt, this.x2]);
    // darkness meter (a jar-shaped capsule that fills with violet smoke)
    this.jar = s.add.container(560, 92); const jg = s.add.graphics(); jg.fillStyle(COL.ink, 1).fillRoundedRect(-200, -38 + 8, 400, 76, 38); jg.fillStyle(0x241848, 1).fillRoundedRect(-200, -38, 400, 76, 38);
    this.jfill = s.add.graphics(); const jo = s.add.graphics(); jo.lineStyle(6, COL.ink).strokeRoundedRect(-200, -38, 400, 76, 38); jo.fillStyle(0xffffff, 0.18).fillRoundedRect(-184, -30, 368, 16, 8);
    this.kh = s.add.image(-200, 0, 'pt_khuurmag_main').setScale(0.2); this.jl = txt(s, 0, 62, 'Харанхуй', 26, '#ffffff', { stroke: INK, st: 8 });
    this.jar.add([jg, this.jfill, jo, this.kh, this.jl]);
    // light
    this.score = new ScoreChip(s); this.root.add(this.score.c);
    // badges: seven checking methods
    this.badges = s.add.container(GW / 2 + 260, 92); this.slots = [];
    const bgG = s.add.graphics(); bgG.fillStyle(COL.ink, 1).fillRoundedRect(-270, -44 + 8, 540, 88, 44); bgG.fillStyle(COL.panel, 1).fillRoundedRect(-270, -44, 540, 88, 44); bgG.lineStyle(6, COL.ink).strokeRoundedRect(-270, -44, 540, 88, 44); this.badges.add(bgG);
    for (let i = 0; i < 7; i++) { const x = -225 + i * 64; const c = s.add.circle(x, 0, 26, 0xe9e2ff).setStrokeStyle(4, 0xb9a4ff); const n = txt(s, x, 2, String(i + 1), 26, '#b9a4ff'); const ic = s.add.image(x, 0, 'lens_ic').setScale(0.42).setVisible(false); this.slots.push({ c, n, ic }); this.badges.add([c, n, ic]); }
    this.bl = txt(s, 0, 64, 'Долоо нягтал', 26, '#ffffff', { stroke: INK, st: 8 }); this.badges.add(this.bl);
    // bow tie
    this.bow = s.add.container(GW - 120, 210); const bwG = s.add.graphics(); bwG.fillStyle(COL.ink, 1).fillCircle(0, 8, 64); bwG.fillStyle(0xfff8ee, 1).fillCircle(0, 0, 64); bwG.lineStyle(6, COL.ink).strokeCircle(0, 0, 64);
    this.bowRing = s.add.circle(0, 0, 76).setStrokeStyle(10, 0xff4d6d).setVisible(false); this.bowImg = s.add.image(0, 0, 'bow').setScale(0.72);
    this.bowT = txt(s, 0, 86, 'Зангиа', 24, '#ffffff', { stroke: INK, st: 7 });
    this.bow.add([bwG, this.bowRing, this.bowImg, this.bowT]); this.bow.setSize(140, 140).setInteractive({ useHandCursor: true });
    this.bow.on('pointerdown', (p, a, b, ev) => { ev.stopPropagation(); o.onBow && o.onBow(); });
    this.root.add([this.timer, this.jar, this.badges, this.bow]);
    this.dark = 0; this.setDark(G.dark); this.setTime(G.time ?? 90);
  }
  setTime(v) { v = Math.max(0, v); const m = Math.floor(Math.ceil(v) / 60), sec = Math.ceil(v) % 60; this.tt.setText(`${m}:${String(sec).padStart(2, '0')}`); this.tt.setColor(v <= 15 ? '#ff4d6d' : COL.inkS);
    const k = v / 90, g = this.sand; g.clear(); g.fillStyle(0xffc94a, 1);
    g.fillTriangle(-62 - 18 * k, -34 + (1 - k) * 22, -62 + 18 * k, -34 + (1 - k) * 22, -62, -4); g.fillRect(-64, -4, 4, 16 * (k > 0.02 ? 1 : 0)); g.fillTriangle(-62 - 22 * (1 - k), 38, -62 + 22 * (1 - k), 38, -62, 38 - 26 * (1 - k)); }
  setDark(v) { this.dark = Phaser.Math.Clamp(v, 0, 1); const g = this.jfill; g.clear(); const w = 392 * this.dark; if (w > 2) { g.fillStyle(0x7a3fd0, 1).fillRoundedRect(-196, -34, Math.max(30, w), 68, 34); g.fillStyle(0xb47cff, 0.6).fillRoundedRect(-190, -30, Math.max(20, w - 12), 22, 11); }
    this.kh.x = -200 + w; this.kh.setScale(0.17 + this.dark * 0.1); }
  setLight(v) { this.score.set(v); }
  setBadges(n7) { this.slots.forEach((sl, i) => { const on = n7.includes(i + 1); if (on && !sl.ic.visible) { sl.ic.setVisible(true).setScale(0); this.s.tweens.add({ targets: sl.ic, scale: 0.42, duration: 360, ease: 'Back.Out' }); sl.c.setFillStyle(0xffe27a).setStrokeStyle(4, COL.ink); sl.n.setVisible(false); } }); }
  setSpeed(fast) { this.x2.setVisible(fast); }
  bowAlarm(on) { this.bowRing.setVisible(on); this.s.tweens.killTweensOf(this.bowImg); this.bowImg.setAngle(0);
    if (on) { this.s.tweens.add({ targets: this.bowImg, angle: 25, duration: 90, yoyo: true, repeat: -1 }); this.s.tweens.add({ targets: this.bowRing, scale: 1.15, duration: 300, yoyo: true, repeat: -1 }); this.bowT.setText('Зас!'); }
    else { this.s.tweens.killTweensOf(this.bowRing); this.bowRing.setScale(1); this.bowT.setText('Зангиа'); } }
}

// walkable areas (world x/z) for both locations
const AREA = {
  village: { x0: -8.4, x1: 9.0, z0: -2.0, z1: 4.6, holes: [[-6.6, -1.2, 1.3], [6.1, -0.6, 1.5], [4.3, 1.4, 0.75], [-4.0, 4.5, 0.6], [5.0, 4.6, 0.6], [-6.2, -3.6, 1]] },
  forest: { x0: -1.6, x1: 9.4, z0: -24.6, z1: -17.0, holes: [[-3.5, -21, 3.2], [5.6, -21.4, 0.7], [8.9, -22.6, 0.65], [2.2, -24.8, 0.65], [7.6, -24.6, 1.5]] },
};
function clampArea(loc, x, z) { const A = AREA[loc]; x = Phaser.Math.Clamp(x, A.x0, A.x1); z = Phaser.Math.Clamp(z, A.z0, A.z1);
  for (const [hx, hz, r] of A.holes) { const d = Math.hypot(x - hx, z - hz); if (d < r) { const k = r / Math.max(d, 0.01); x = hx + (x - hx) * k; z = hz + (z - hz) * k; } }
  return { x: Phaser.Math.Clamp(x, A.x0, A.x1), z: Phaser.Math.Clamp(z, A.z0, A.z1) }; }

class InvestigateScene extends Phaser.Scene {
  constructor() { super('Investigate'); }
  init(d) { if (!d || d.fresh !== false) G.newInvestigation(); }
  create() {
    SND.bind(this); fadeIn(this, 600); SND.play('m_invest', 0.34);
    this.paused = true; this.yaarAt = 14; this.yaar = false; this.clock = 0; this.locObjs = [];
    this.hud = new Hud(this, { onBow: () => this.fixBow() });
    this.dlg = new Dialog(this);
    this.vign = this.add.image(GW / 2, GH / 2, 'vign').setDisplaySize(GW, GH).setScrollFactor(0).setDepth(7000).setAlpha(0);
    this.shadowKh = this.add.image(GW - 360, 420, 'pt_khuurmag_sneaky').setScrollFactor(0).setDepth(6990).setAlpha(0).setScale(0.9).setTint(0x3a2070);
    this.murk = this.add.rectangle(GW / 2, GH / 2, GW, GH, 0x7a6a9e, 1).setScrollFactor(0).setDepth(6980).setBlendMode(Phaser.BlendModes.MULTIPLY).setAlpha(0);
    // bag + decide
    this.bag = this.add.container(120, GH - 110).setScrollFactor(0).setDepth(8500); const bimg = this.add.image(0, 0, 'bag').setScale(0.95); this.bagN = txt(this, 52, -44, '0', 34, '#ffffff', { stroke: INK, st: 9 });
    this.bag.add([bimg, this.bagN]); this.bag.setSize(150, 130).setInteractive({ useHandCursor: true }); this.bag.on('pointerdown', (p, a, b, ev) => { ev.stopPropagation(); this.showBag(); });
    this.decide = button(this, GW - 230, GH - 100, 'Шийдэх', () => this.askDecide(), { w: 340, h: 100, size: 46, fill: 0x3fcf9a, locked: true, icon: 'check_ic',
      onLocked: () => toast(this, 'Дор хаяж 3 нягтлах хэрэгтэй!', { y: GH - 220 }) }).setScrollFactor(0).setDepth(8500);
    this.input.on('pointerdown', (p) => this.groundTap(p));
    this.buildLoc('village', true);
    this.hud.setTime(G.time); this.hud.setBadges(this.slotsFound()); this.bagN.setText(String(Object.keys(G.found).length));
    this.time.delayedCall(700, () => this.dlg.say(['s1'], () => { this.paused = false; toast(this, 'Цаг эхэллээ!', { y: 240, fill: 0xffe27a }); SND.sfx('tick', 0.6); }));
  }
  // ---------- locations
  clearLoc() { this.locObjs.forEach(o => o.destroy()); this.locObjs = []; if (this.w) { this.w.actors.slice().forEach(a => a.destroy()); this.w.sky.destroy(); this.w.far.destroy(); this.w.near.destroy(); } }
  buildLoc(loc, first) {
    this.clearLoc(); this.loc = loc; const w = this.w = new World25(this, loc); const add = o => (this.locObjs.push(o), o);
    if (loc === 'village') {
      this.dad = new Actor(w, 'dad', -4.3, 0.7, { dir: 0 }); this.dad.wobble = 3;
      this.mom = new Actor(w, 'mom', 5.8, 2.1, { dir: 7 }); this.kids = [new Actor(w, 'tumur', -1.3, 3.8, { dir: 0 }), new Actor(w, 'suvd', -2.4, 3.4, { dir: 1 })]; this.kids.forEach(k => k.wobble = 2);
      this.ny = new Actor(w, 'nyagtaa', first ? 1.4 : -0.5, first ? 3.6 : -1.6, { dir: 0 });
      add(new Hotspot(w, -4.3, 2.75, 0.7, { ids: ['c1', 'c6'], icon: 'talk_ic', label: 'Аав Батаа', onTap: () => this.offer(['c1', 'c6'], 'Аав Батаагаас асуух', -3.2, 1.6, () => this.dad) }));
      add(new Hotspot(w, -6.6, 1.5, -1.0, { ids: ['c3', 'c2'], label: 'Цуурай самбар', onTap: () => this.offer(['c3', 'c2'], 'Самбар дээрх цаас', -5.4, 0.3, null) }));
      add(new Hotspot(w, 0.3, 0.9, -2.6, { icon: 'arrow_ic', label: 'Ойн зах руу', ring: 0.8, onTap: () => this.travel('forest', -0.2, -2.0) }));
      this.kids.forEach(k => k.spr.setInteractive().on('pointerdown', (p, a, b, ev) => { ev.stopPropagation(); toast(this, 'Бид айж байна... Баавгай ирэх үү?', { y: 260 }); }));
      this.mom.spr.setInteractive().on('pointerdown', (p, a, b, ev) => { ev.stopPropagation(); toast(this, 'Ээж: Түлээгээ орхиод хашаа барих уу?..', { y: 260 }); });
    } else {
      this.hunter = new Actor(w, 'hunter', 1.0, -21.9, { dir: 1 });
      this.w1 = new Actor(w, 'wood1', 5.9, -22.5, { dir: 7 }); this.w2 = new Actor(w, 'wood2', 7.9, -21.6, { dir: 6 }); this.w2.bounce = 2.5;
      this.ny = new Actor(w, 'nyagtaa', -0.8, -17.3, { dir: 4 });
      const bp = w.P(3.4, w.H(3.4, -18.9), -18.9), ppu = w.ppu(3.4, -18.9); add(this.add.image(bp.x, bp.y, 'branch').setOrigin(0.5, 0.8).setScale(ppu / 330).setDepth(bp.y));
      add(new Hotspot(w, 1.0, 2.65, -21.9, { ids: ['c4'], icon: 'talk_ic', label: 'Анчин Мөнх', onTap: () => this.offer(['c4'], 'Анчин Мөнх', 1.9, -20.6, () => this.hunter) }));
      add(new Hotspot(w, 6.9, 2.6, -22.0, { ids: ['c5'], icon: 'talk_ic', label: 'Модчид', onTap: () => this.offer(['c5'], 'Модчид', 6.4, -20.5, () => this.w1) }));
      add(new Hotspot(w, -1.85, 0.35, -20.6, { ids: ['c7'], label: 'Газрын мөр', onTap: () => this.offer(['c7'], 'Газар дээрх мөр', -1.1, -19.6, null) }));
      add(new Hotspot(w, 4.4, 1.9, -26.7, { ids: ['c8'], label: 'Хуучин мод', onTap: () => this.offer(['c8'], 'Модны холтос', 4.4, -24.2, null) }));
      add(new Hotspot(w, 3.4, 0.7, -18.9, { ids: ['c9'], label: 'Мөчир', ring: 0.75, onTap: () => this.offer(['c9'], 'Мөчир дээрх хар үс', 2.6, -18.2, null) }));
      add(new Hotspot(w, -1.6, 0.9, -17.2, { icon: 'arrow_ic', label: 'Тосгон руу', ring: 0.8, onTap: () => this.travel('village', -0.9, -17.4) }));
    }
    this.markDone();
    this.cameras.main.scrollX = Phaser.Math.Clamp(this.ny.sx || 0, 0, 480);
    this.leafFx = leaves(this, 18);
  }
  markDone() { // tick off hotspots whose clues are all checked
    this.locObjs.filter(o => o instanceof Hotspot && o.ids).forEach(h => { if (h.ids.every(id => G.found[id])) h.setDone(); }); }
  travel(to, x, z) {
    if (this.busy) return; this.busy = true;
    this.ny.walkTo(x, z, () => { SND.sfx('whoosh', 0.5); this.cameras.main.fadeOut(350, 20, 12, 46); this.cameras.main.once('camerafadeoutcomplete', () => { this.buildLoc(to); this.cameras.main.fadeIn(350, 20, 12, 46); this.busy = false;
      const p = to === 'forest' ? [0.4, -18.4] : [0.2, 0.2]; this.ny.walkTo(p[0], p[1]); }); });
  }
  groundTap(p) {
    if (this.paused || this.busy || this.dlg.busy || this.modal) return;
    const g = this.w.ground(p.worldX, p.worldY); if (!g) return;
    const c = clampArea(this.loc, g.x, g.z); this.ny.walkTo(c.x, c.z); SND.sfx('step', 0.25);
    const q = this.w.P(c.x, this.w.H(c.x, c.z), c.z); const r = this.add.image(q.x, q.y, 'ring').setScale(0.2, 0.08).setDepth(q.y - 2).setAlpha(0.9); this.tweens.add({ targets: r, scaleX: 0.7, scaleY: 0.28, alpha: 0, duration: 450, onComplete: () => r.destroy() });
  }
  // ---------- offering a check: card with costs
  offer(ids, title, ax, az, who) {
    if (this.paused || this.busy || this.modal) return;
    const m = this.modal = this.add.container(0, 0).setScrollFactor(0).setDepth(9500);
    const dim = this.add.rectangle(GW / 2, GH / 2, GW, GH, COL.shade, 0.45).setInteractive(); m.add(dim);
    const h = 230 + ids.length * 150; const pg = paper(this, GW / 2, GH / 2, 980, h, { lines: 56, tape: 0xff9fb0 }); m.add(pg);
    m.add(txt(this, GW / 2, GH / 2 - h / 2 + 70, title, 52, COL.inkS));
    ids.forEach((id, i) => { const c = CLUES[id], y = GH / 2 - h / 2 + 180 + i * 150, done = !!G.found[id];
      const b = button(this, GW / 2 - 120, y, done ? '✓  ' + c.ask : c.ask, () => { this.closeModal(); if (!done) this.check(id, ax, az, who); }, { w: 640, h: 104, size: 34, fill: done ? 0xd8f5e8 : 0xfff8ee, locked: done });
      const cost = txt(this, GW / 2 + 330, y + 2, done ? 'Шалгасан' : `−${c.cost} сек`, 40, done ? '#3fcf9a' : '#ff4d6d'); m.add([b, cost]); });
    const close = button(this, GW / 2, GH / 2 + h / 2 - 10, 'Буцах', () => this.closeModal(), { w: 240, h: 76, size: 32, fill: 0xe9e2ff }); m.add(close);
    dim.on('pointerdown', () => this.closeModal());
    m.setScale(0.85).setAlpha(0); this.tweens.add({ targets: m, scale: 1, alpha: 1, duration: 220, ease: 'Back.Out' }); SND.sfx('page', 0.5);
  }
  closeModal() { if (!this.modal) return; const m = this.modal; this.modal = null; this.tweens.add({ targets: m, alpha: 0, duration: 150, onComplete: () => m.destroy() }); }
  // ---------- performing a check
  check(id, ax, az, who) {
    const c = CLUES[id]; this.busy = true;
    const t = clampArea(this.loc, ax, az);
    this.ny.walkTo(t.x, t.z, () => {
      const a = who && who(); if (a) { this.ny.faceTo(a.x, a.z); a.faceTo(this.ny.x, this.ny.z); }
      this.spend(c.cost, () => {
        this.paused = true;
        const after = () => { this.collect(id); this.paused = false; this.busy = false; if (G.time <= 0) this.timeUp(); };
        if (id === 'c1') this.dlg.say(['c1q', 'c1a', 'c1i'], after);
        else if (id === 'c6') this.dlg.say(['c6q', 'c6a', 'c6i'], after);
        else if (id === 'c4') this.dlg.say(['c4q', 'c4a', 'c4i'], after);
        else if (id === 'c5') this.dlg.say(['c5q', 'c5a', 'c5i'], after);
        else new ZoomView(this, id, () => this.dlg.say([{ c2: 'c2i', c3: 'c3i', c7: 'c7i', c8: 'c8i', c9: 'c9i' }[id]].map(k => Object.assign({ id: k }, L[k])), after));
      });
    });
  }
  spend(sec, done) { // drain the clock visibly
    this.paused = true; const from = G.time, to = Math.max(0, G.time - sec); SND.sfx('tick', 0.6);
    const fl = txt(this, this.hud.timer.x + 40, this.hud.timer.y + 80, `−${sec}с`, 46, '#ff4d6d', { stroke: INK, st: 9 }).setScrollFactor(0).setDepth(9000);
    this.tweens.add({ targets: fl, y: fl.y + 50, alpha: 0, duration: 900, delay: 300, onComplete: () => fl.destroy() });
    this.tweens.add({ targets: this.hud.glass, angle: 180, duration: 500, ease: 'Back.InOut', onComplete: () => this.hud.glass.setAngle(0) });
    this.tweens.addCounter({ from, to, duration: 650, onUpdate: tw => { G.time = tw.getValue(); this.hud.setTime(G.time); }, onComplete: () => { G.time = to; done(); } });
  }
  collect(id) {
    const c = CLUES[id]; G.found[id] = true; if (c.trap) { G.dark = Math.min(1, G.dark + 0.08); SND.sfx('rumble', 0.4); toast(this, 'Хууртагдлаа: −15 сек дэмий', { y: 260, fill: 0xe9e2ff }); }
    // the clue card flies into the bag
    const card = this.add.container(GW / 2, GH / 2).setScrollFactor(0).setDepth(9600); const pg = paper(this, 0, 0, 520, 300, { r: 22, lines: 48 }); card.add(pg);
    card.add(txt(this, 0, -100, c.title, 40, '#ff6b7a')); card.add(txt(this, 0, 20, c.card, 30, COL.inkS, { wrap: 440, weight: '800' }));
    card.setScale(0.3).setAngle(-6); SND.sfx('pick', 0.6); this.flying = true;
    this.tweens.add({ targets: card, scale: 1, angle: 3, duration: 340, ease: 'Back.Out' });
    this.tweens.add({ targets: card, x: this.bag.x, y: this.bag.y, scale: 0.08, angle: -20, delay: 1300, duration: 520, ease: 'Cubic.In', onComplete: () => { card.destroy(); this.flying = false; SND.sfx('badge', 0.6);
      this.tweens.add({ targets: this.bag, scale: 1.25, duration: 120, yoyo: true }); this.bagN.setText(String(Object.keys(G.found).length));
      this.hud.setBadges(this.slotsFound()); burst(this, this.bag.x, this.bag.y, 14, 0xffe27a, 9000, { sf: 0, r: 100 });
      if (this.slotsFound().length >= 3 && this.decide.locked) { this.decide.setLocked(false); toast(this, 'Одоо шийдэж болно!', { y: GH - 230, fill: 0x9ff5cf }); this.tweens.add({ targets: this.decide, scale: 1.1, duration: 300, yoyo: true, repeat: 2 }); }
      this.markDone(); } });
  }
  slotsFound() { const s = new Set(); Object.keys(G.found).forEach(id => { const n = CLUES[id].n; if (n) s.add(n); }); return [...s]; }
  showBag() {
    if (this.modal || this.dlg.busy) return; const ids = Object.keys(G.found);
    const m = this.modal = this.add.container(0, 0).setScrollFactor(0).setDepth(9500); const dim = this.add.rectangle(GW / 2, GH / 2, GW, GH, COL.shade, 0.5).setInteractive(); m.add(dim);
    m.add(paper(this, GW / 2, GH / 2, 1500, 820, { lines: 60, tape: 0x9fe8c8 })); m.add(txt(this, GW / 2, GH / 2 - 340, 'Цүнхэнд байгаа сэжүүрүүд', 50, COL.inkS));
    if (!ids.length) m.add(txt(this, GW / 2, GH / 2, 'Одоохондоо хоосон. Томруулдаг шилтэй гэрэлтэх цэгүүд дээр дарж сэжүүр цуглуул!', 36, '#6b5fa8', { wrap: 1100, weight: '800' }));
    ids.forEach((id, i) => { const c = CLUES[id], x = GW / 2 - 470 + (i % 3) * 470, y = GH / 2 - 190 + Math.floor(i / 3) * 190;
      m.add(paper(this, x, y, 430, 160, { r: 18, fill: 0xfffdf6 })); m.add(txt(this, x, y - 50, c.title, 30, '#ff6b7a')); m.add(txt(this, x, y + 16, c.card, 24, COL.inkS, { wrap: 380, weight: '800' })); });
    m.add(button(this, GW / 2, GH / 2 + 350, 'Хаах', () => this.closeModal(), { w: 240, h: 76, size: 32, fill: 0xe9e2ff })); dim.on('pointerdown', () => this.closeModal());
    m.setAlpha(0); this.tweens.add({ targets: m, alpha: 1, duration: 200 });
  }
  askDecide() {
    if (this.modal || this.dlg.busy || this.busy) return;
    const m = this.modal = this.add.container(0, 0).setScrollFactor(0).setDepth(9500); const dim = this.add.rectangle(GW / 2, GH / 2, GW, GH, COL.shade, 0.5).setInteractive(); m.add(dim);
    m.add(paper(this, GW / 2, GH / 2, 900, 420, { tape: 0xffd36a })); m.add(txt(this, GW / 2, GH / 2 - 110, 'Шинжилгээ рүү шилжих үү?', 48, COL.inkS));
    m.add(txt(this, GW / 2, GH / 2 - 30, `Үлдсэн цаг: ${Math.ceil(G.time)} сек. Үлдсэн секунд бүр +2 гэрэл.`, 30, '#6b5fa8', { weight: '800' }));
    m.add(button(this, GW / 2 - 190, GH / 2 + 100, 'Тийм', () => { this.closeModal(); this.toNotebook(); }, { w: 300, h: 96, fill: 0x3fcf9a }));
    m.add(button(this, GW / 2 + 190, GH / 2 + 100, 'Үргэлжлүүлэх', () => this.closeModal(), { w: 330, h: 96, size: 34, fill: 0xfff8ee }));
  }
  timeUp() { if (this.ending) return; this.paused = true; this.closeModal(); SND.sfx('alarm', 0.5); this.dlg.say(['timeup'], () => this.toNotebook()); }
  toNotebook() { if (this.ending) return; this.ending = true; this.paused = true; SND.stopVoice(); fadeTo(this, 'Notebook'); }
  // ---------- "Hurry!" pressure and the bow tie
  shout() {
    this.yaar = true; this.hud.bowAlarm(true); this.hud.setSpeed(true); SND.sfx('alarm', 0.35);
    const l = L[Math.random() < 0.5 ? 'yaar1' : 'yaar2']; SND.voice(l === L.yaar1 ? 'yaar1' : 'yaar2');
    const c = this.add.container(GW / 2, 250).setScrollFactor(0).setDepth(9000); const pt = this.add.image(-330, 30, 'pt_dad_angry').setScale(0.38);
    const t = txt(this, 60, 0, l.mn, 42, '#c0262d', { wrap: 640 }); const bw = t.width + 80, bh = t.height + 50; const g = this.add.graphics();
    g.fillStyle(COL.ink, 1).fillRoundedRect(60 - bw / 2, -bh / 2 + 8, bw, bh, 30); g.fillStyle(0xffffff, 1).fillRoundedRect(60 - bw / 2, -bh / 2, bw, bh, 30); g.lineStyle(6, COL.ink).strokeRoundedRect(60 - bw / 2, -bh / 2, bw, bh, 30);
    c.add([g, t, pt]); c.setScale(0.3); this.tweens.add({ targets: c, scale: 1, duration: 260, ease: 'Back.Out' }); this.tweens.add({ targets: c, angle: 2, duration: 70, yoyo: true, repeat: 8 });
    this.tweens.add({ targets: c, alpha: 0, y: 200, delay: 2400, duration: 400, onComplete: () => c.destroy() });
    toast(this, 'Цаг 2 дахин хурдан! Зангиагаа зас!', { y: 470, fill: 0xffd0d6, hold: 2200 });
    this.cameras.main.shake(300, 0.004);
  }
  fixBow() {
    if (!this.yaar) { this.tweens.add({ targets: this.hud.bowImg, angle: 360, duration: 400, onComplete: () => this.hud.bowImg.setAngle(0) }); return; }
    this.yaar = false; this.hud.bowAlarm(false); this.hud.setSpeed(false); G.light += 5; this.hud.setLight(G.light); G.bowFix++; this.calm = 5;
    SND.sfx('calm', 0.7); burst(this, this.hud.bow.x, this.hud.bow.y, 22, [0x9ff5cf, 0xffffff, 0xb9a4ff], 9000, { sf: 0, r: 160 });
    toast(this, 'Амьсгаа аваад... тайван!', { y: 400, fill: 0x9ff5cf });
    this.yaarAt = this.clock + 15 + Math.random() * 5;
  }
  update(t, dt) {
    t /= 1000; dt = Math.min(DT_MAX, dt / 1000);
    if (this.w) this.w.update(t, dt); if (this.leafFx) this.leafFx(t, dt);
    // camera follows Nyagtaa
    if (this.ny && this.ny.sx) { const cam = this.cameras.main, want = Phaser.Math.Clamp(this.ny.sx - GW / 2, 0, BGW - GW); cam.scrollX += (want - cam.scrollX) * Math.min(1, dt * 4); }
    if (!this.paused && !this.dlg.busy && !this.modal) {
      this.clock += dt; const rate = (this.yaar ? 2 : 1) * 0.7;
      G.time = Math.max(0, G.time - dt * rate); this.hud.setTime(G.time);
      G.dark = Math.min(1, G.dark + dt * (this.yaar ? 0.012 : 0.0028)); if (this.calm) this.calm = Math.max(0, this.calm - dt);
      if (!this.yaar && !this.calm && !this.flying && this.clock > this.yaarAt) this.shout();
      if (G.time <= 0 && !this.busy) this.timeUp();
    }
    this.hud.setDark(G.dark); this.vign.setAlpha(G.dark * 0.85); this.shadowKh.setAlpha(Math.max(0, G.dark - 0.25) * 0.55).setScale(0.8 + G.dark * 0.5);
    this.murk.setAlpha(G.dark * 0.6);
    if (this.dad && this.dad.spr.active && this.loc === 'village') this.dad.wobble = this.yaar ? 6 : 2;
  }
}

// close-up inspection with a draggable magnifier: the lens shows the sharp detail layer
class ZoomView {
  constructor(scene, id, done) {
    const s = this.s = scene; this.id = id; this.done = done; this.found = false;
    const D = 9400; let root = this.root0 = s.add.container(0, 0).setScrollFactor(0).setDepth(D);
    root.add(s.add.rectangle(GW / 2, GH / 2, GW, GH, 0x140c2e, 0.82).setInteractive());
    const k = 'zv_' + id; drawZoom(s, id); const cx = GW / 2, cy = GH / 2 + 10;
    // masked images can't live inside a container, so these are loose objects above the backdrop
    const base = s.add.image(cx, cy, k + '_b').setDisplaySize(1200, 840).setScrollFactor(0).setDepth(D + 1); const det = s.add.image(cx, cy, k + '_d').setDisplaySize(1200, 840).setScrollFactor(0).setDepth(D + 2);
    const top = this.top = s.add.container(0, 0).setScrollFactor(0).setDepth(D + 3);
    const frame = s.add.graphics(); frame.lineStyle(10, COL.ink).strokeRoundedRect(cx - 600, cy - 420, 1200, 840, 30); top.add(frame);
    const mg = s.make.graphics({ add: false }); mg.setScrollFactor(0); det.setMask(mg.createGeometryMask()); this.mg = mg; this.loose = [base, det];
    if (!s.textures.exists('lens_big')) this.lensTex();
    this.lens = s.add.image(cx - 300, cy + 200, 'lens_big'); top.add(this.lens); root = this.root = top; this.back = this.root0;
    const T = ZOOM_TARGET[id]; this.tx = cx - 600 + T[0] * 1200; this.ty = cy - 420 + T[1] * 840; this.tr = T[2] * 1200;
    this.prompt = txt(s, GW / 2, 70, T[3], 40, '#fff8ee', { stroke: INK, st: 10 }); root.add(this.prompt);
    this.arrow = txt(s, this.tx, this.ty - this.tr - 60, '▼', 56, '#ffe27a', { stroke: INK, st: 10 }).setAlpha(0); root.add(this.arrow);
    s.tweens.add({ targets: this.arrow, y: this.arrow.y + 16, duration: 450, yoyo: true, repeat: -1 }); s.time.delayedCall(4000, () => this.arrow && this.arrow.active && s.tweens.add({ targets: this.arrow, alpha: 1, duration: 300 }));
    this.lx = this.lens.x; this.ly = this.lens.y; this.hover = 0; this.drawMask();
    this.mv = (p) => { if (this.found) return; this.lx = Phaser.Math.Clamp(p.x, cx - 600, cx + 600); this.ly = Phaser.Math.Clamp(p.y - 40, cy - 420, cy + 420); };
    s.input.on('pointermove', this.mv); s.input.on('pointerdown', this.mv);
    this.ev = s.time.addEvent({ delay: 16, loop: true, callback: () => this.tick() });
    [this.root0, this.top, ...this.loose].forEach(o => { o.setAlpha(0); s.tweens.add({ targets: o, alpha: 1, duration: 250 }); }); SND.sfx('whoosh', 0.4);
  }
  lensTex() { canvasTex(this.s, 'lens_big', 340, 340, (c) => { c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = 46; c.beginPath(); c.moveTo(230, 230); c.lineTo(320, 320); c.stroke(); c.strokeStyle = '#a8673d'; c.lineWidth = 28; c.beginPath(); c.moveTo(232, 232); c.lineTo(316, 316); c.stroke();
    c.strokeStyle = INK; c.lineWidth = 30; c.beginPath(); c.arc(150, 150, 118, 0, 6.28); c.stroke(); c.strokeStyle = '#ffc94a'; c.lineWidth = 18; c.beginPath(); c.arc(150, 150, 118, 0, 6.28); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 9; c.beginPath(); c.arc(150, 150, 92, 3.5, 4.5); c.stroke(); }); }
  drawMask() { const r = 104; this.mg.clear(); this.mg.fillStyle(0xffffff).fillCircle(this.lx, this.ly, r); this.lens.setPosition(this.lx + 0, this.ly + 0).setOrigin(150 / 340, 150 / 340); }
  tick() {
    if (this.found) return; this.drawMask();
    const d = Math.hypot(this.lx - this.tx, this.ly - this.ty);
    if (d < this.tr) { this.hover += 16; if (this.hover % 160 < 16) SND.sfx('blip', 0.3, 1 + this.hover / 900); } else this.hover = Math.max(0, this.hover - 32);
    this.lens.setScale(1 + Math.min(1, this.hover / 700) * 0.08);
    if (this.hover > 700) this.reveal();
  }
  reveal() {
    const s = this.s; this.found = true; this.ev.remove(); SND.sfx('sparkle', 0.8); this.arrow.destroy();
    this.lx = this.tx; this.ly = this.ty; this.drawMask();
    const ring = s.add.circle(this.tx, this.ty, this.tr + 20).setStrokeStyle(12, 0xff4d6d); ring.setScale(1.6).setAlpha(0); this.root.add(ring);
    s.tweens.add({ targets: ring, scale: 1, alpha: 1, duration: 300, ease: 'Back.Out' });
    burst(s, this.tx, this.ty, 26, [0xffe27a, 0xffffff], 9500, { sf: 0, r: 180 });
    this.prompt.setText('Олдлоо!');
    s.time.delayedCall(1100, () => { s.input.off('pointermove', this.mv); s.input.off('pointerdown', this.mv);
      s.tweens.add({ targets: [this.root0, this.top, ...this.loose], alpha: 0, duration: 300, onComplete: () => { if (this.closed) return; this.closed = true; this.loose.forEach(o => o.destroy()); this.root0.destroy(); this.top.destroy(); this.mg.destroy(); this.done(); } }); });
  }
}
// target: [u, v, radius(u), prompt]
const ZOOM_TARGET = {
  c2: [0.72, 0.8, 0.07, 'Томруулдаг шилээ тамга дээр аваач'],
  c3: [0.5, 0.16, 0.1, 'Гарчгийг томруулж хар'],
  c7: [0.42, 0.55, 0.08, 'Мөрийг томруулж хар'],
  c8: [0.52, 0.42, 0.09, 'Сарвууны оромыг хар'],
  c9: [0.55, 0.5, 0.08, 'Хар үсийг томруулж хар'],
};
function drawZoom(s, id) {
  const k = 'zv_' + id; if (s.textures.exists(k + '_b')) return; const W = 1200, H = 840;
  const paint = (c, sharp) => {
    if (id === 'c2' || id === 'c3') {
      c.fillStyle = '#5a3a22'; c.fillRect(0, 0, W, H); for (let i = 0; i < 14; i++) { c.fillStyle = i % 2 ? '#7a5234' : '#6b4629'; c.fillRect(0, i * 60, W, 60); }
      c.save(); c.translate(W / 2, H / 2); c.rotate(-0.02); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(-370, -390, 760, 800); c.fillStyle = '#fff6df'; c.fillRect(-380, -400, 760, 800);
      c.fillStyle = '#e04a5a'; c.beginPath(); c.arc(0, -385, 16, 0, 6.28); c.fill();
      c.textAlign = 'center'; c.fillStyle = '#c0262d'; c.font = `900 ${sharp ? 92 : 86}px Nunito`; c.fillText('АЙМШИГ!!!', 0, -290);
      c.fillStyle = '#3a2a1a'; c.font = '900 50px Nunito'; c.fillText('АВАРГА БААВГАЙ', 0, -210); c.fillText('БҮГДИЙГ ИДНЭ!!! ЗУГТ!', 0, -150);
      if (sharp) { c.strokeStyle = '#ff4d6d'; c.lineWidth = 6; c.setLineDash([12, 8]); c.strokeRect(-330, -380, 660, 250); c.setLineDash([]); }
      c.fillStyle = '#9a8a76'; for (let i = 0; i < 7; i++) c.fillRect(-300, -80 + i * 42, 600 - (i % 3) * 90, 16);
      // the stamp
      c.save(); c.translate(250, 270); c.rotate(-0.18); c.strokeStyle = '#d23a3a'; c.lineWidth = 9; c.beginPath(); c.arc(0, 0, 92, 0, 6.28); c.stroke(); c.lineWidth = 3; c.beginPath(); c.arc(0, 0, 74, 0, 6.28); c.stroke();
      c.fillStyle = '#d23a3a'; c.font = `900 ${sharp ? 34 : 30}px Nunito`; c.fillText('НАРЛААГ', 0, -2); c.font = '800 22px Nunito'; c.fillText('ХАРУУЛ', 0, 34);
      if (sharp) { c.fillStyle = '#d23a3a'; c.font = '900 24px Nunito'; c.fillText('★', 0, -44); }
      c.restore(); c.restore();
      if (sharp && id === 'c2') { // official stamp for comparison
        c.save(); c.translate(150, 680); c.fillStyle = '#fffdf6'; c.fillRect(-120, -110, 240, 220); c.strokeStyle = '#2a1f5e'; c.lineWidth = 5; c.strokeRect(-120, -110, 240, 220);
        c.strokeStyle = '#2f6fd6'; c.lineWidth = 8; c.beginPath(); c.arc(0, -10, 66, 0, 6.28); c.stroke(); c.fillStyle = '#2f6fd6'; c.textAlign = 'center'; c.font = '900 26px Nunito'; c.fillText('НАРЛАГ', 0, -6); c.font = '800 18px Nunito'; c.fillText('ХАРУУЛ', 0, 22);
        c.fillStyle = '#2a1f5e'; c.font = '900 22px Nunito'; c.fillText('Жинхэнэ тамга', 0, 92); c.restore(); }
    } else if (id === 'c7') {
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#c9a77a'); g.addColorStop(1, '#a8845a'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 400; i++) { c.fillStyle = `rgba(${90 + Math.random() * 60},${60 + Math.random() * 40},30,${0.15 + Math.random() * 0.2})`; c.beginPath(); c.arc(Math.random() * W, Math.random() * H, 2 + Math.random() * 6, 0, 6.28); c.fill(); }
      [[300, 300, 0.2], [504, 462, -0.1], [720, 300, 0.15], [920, 470, -0.05]].forEach(([x, y, a]) => { c.save(); c.translate(x, y); c.rotate(a); c.strokeStyle = 'rgba(70,42,22,0.85)'; c.lineWidth = sharp ? 26 : 30; c.lineCap = 'round'; c.beginPath(); c.arc(0, 10, 54, Math.PI * 1.05, Math.PI * 1.95, true); c.stroke();
        if (sharp) { c.strokeStyle = 'rgba(255,240,200,0.6)'; c.lineWidth = 4; c.beginPath(); c.arc(0, 10, 40, Math.PI * 1.1, Math.PI * 1.9, true); c.stroke(); } c.restore(); });
      if (sharp) { c.save(); c.translate(1010, 120); c.fillStyle = '#fffdf6'; c.fillRect(-150, -90, 300, 200); c.strokeStyle = INK; c.lineWidth = 5; c.strokeRect(-150, -90, 300, 200);
        c.fillStyle = '#5a3a22'; c.beginPath(); c.ellipse(-60, 20, 34, 40, 0, 0, 6.28); c.fill(); [[-92, -34], [-72, -50], [-48, -52], [-26, -40]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 12, 0, 6.28); c.fill(); });
        c.strokeStyle = '#5a3a22'; c.lineWidth = 14; c.lineCap = 'round'; c.beginPath(); c.arc(70, 34, 34, Math.PI * 1.05, Math.PI * 1.95, true); c.stroke();
        c.fillStyle = INK; c.font = '900 20px Nunito'; c.textAlign = 'center'; c.fillText('Баавгай', -60, 92); c.fillText('Морь', 70, 92); c.restore(); }
    } else if (id === 'c8') {
      c.fillStyle = '#8a5a3a'; c.fillRect(0, 0, W, H); for (let i = 0; i < 40; i++) { c.strokeStyle = `rgba(60,36,20,${0.3 + Math.random() * 0.3})`; c.lineWidth = 4 + Math.random() * 8; c.beginPath(); const x = Math.random() * W; c.moveTo(x, 0); c.bezierCurveTo(x + 30, H / 3, x - 30, H * 2 / 3, x + 10, H); c.stroke(); }
      for (let k = 0; k < 4; k++) { c.save(); c.translate(500 + k * 56, 260); c.rotate(0.35); c.fillStyle = 'rgba(40,24,12,0.9)'; c.fillRect(-12, 0, 24, 300);
        if (sharp) { c.fillStyle = '#6cbf4a'; for (let m = 0; m < 26; m++) { c.beginPath(); c.arc((Math.random() - 0.5) * 22, Math.random() * 300, 5 + Math.random() * 7, 0, 6.28); c.fill(); } c.fillStyle = '#9be36a'; for (let m = 0; m < 10; m++) { c.beginPath(); c.arc((Math.random() - 0.5) * 18, Math.random() * 300, 3 + Math.random() * 4, 0, 6.28); c.fill(); } }
        else { c.fillStyle = 'rgba(100,150,70,0.5)'; c.fillRect(-12, 0, 24, 300); } c.restore(); }
    } else if (id === 'c9') {
      c.fillStyle = '#a9d98a'; c.fillRect(0, 0, W, H); for (let i = 0; i < 300; i++) { c.strokeStyle = `rgba(60,140,60,${0.3 + Math.random() * 0.3})`; c.lineWidth = 4; c.beginPath(); const x = Math.random() * W, y = Math.random() * H; c.moveTo(x, y); c.lineTo(x + (Math.random() - 0.5) * 20, y - 30 - Math.random() * 30); c.stroke(); }
      c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = 70; c.beginPath(); c.moveTo(0, 520); c.quadraticCurveTo(600, 380, 1200, 460); c.stroke(); c.strokeStyle = '#8a5a3a'; c.lineWidth = 50; c.beginPath(); c.moveTo(0, 520); c.quadraticCurveTo(600, 380, 1200, 460); c.stroke();
      c.strokeStyle = '#1c1426'; for (let i = 0; i < 120; i++) { const x = 600 + (Math.random() - 0.5) * 170, y = 400 + Math.random() * 60; c.lineWidth = sharp ? 5 : 7; c.beginPath(); c.moveTo(x, y);
        if (sharp) { for (let j = 0; j < 6; j++) c.arc(x + (j % 2 ? 6 : -6), y + 10 + j * 12, 7, 0, Math.PI, j % 2 === 0); } else c.lineTo(x + 6, y + 70); c.stroke(); }
      if (sharp) { c.save(); c.translate(1000, 150); c.fillStyle = '#fffdf6'; c.fillRect(-140, -90, 280, 180); c.strokeStyle = INK; c.lineWidth = 5; c.strokeRect(-140, -90, 280, 180); c.fillStyle = INK; c.textAlign = 'center'; c.font = '900 30px Nunito'; c.fillText('Буржгар', 0, -10); c.fillText('ямааны ноос', 0, 34); c.restore(); }
    }
  };
  canvasTex(s, k + '_d', W, H, (c) => paint(c, true));
  canvasTex(s, k + '_b', W / 6, H / 6, (c) => { c.scale(1 / 6, 1 / 6); paint(c, false); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = 'rgba(30,18,60,0.42)'; c.fillRect(0, 0, W, H); });
}
