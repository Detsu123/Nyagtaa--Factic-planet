// shared state, sound, UI kit (sticker buttons, notebook paper), dialogue, video player
const FONT = 'Nunito, "Trebuchet MS", sans-serif';

// Phaser hit-tests a container's children with their own scroll factor, so a screen-fixed panel
// would have buttons that drift when the camera pans; keep children in step with their container.
(function () {
  const C = Phaser.GameObjects.Container.prototype, add = C.addHandler, sf = C.setScrollFactor;
  const deep = (list, x, y) => list.forEach(o => { if (o.setScrollFactor) { o.scrollFactorX = x; o.scrollFactorY = y; } if (o.list) deep(o.list, x, y); });
  C.addHandler = function (go) { add.call(this, go); if (go.setScrollFactor && (this.scrollFactorX !== 1 || this.scrollFactorY !== 1)) { go.scrollFactorX = this.scrollFactorX; go.scrollFactorY = this.scrollFactorY; if (go.list) deep(go.list, this.scrollFactorX, this.scrollFactorY); } };
  C.setScrollFactor = function (x, y = x) { sf.call(this, x, y); deep(this.list, x, y); return this; };
})();

const G = {
  light: 0, dark: 0, chopped: 0, attempts: 0, quiz: 0, sound: true, found: {}, sorted: {}, time: 90,
  newRun() { Object.assign(this, { light: 0, dark: 0, chopped: 0, attempts: 0, quiz: 0 }); this.newInvestigation(); },
  newInvestigation() { this.found = {}; this.sorted = {}; this.time = 90; this.calmUntil = 0; this.bowFix = 0; this.lightAtStart = this.light; this.darkAtStart = this.dark; },
};
try { G.sound = localStorage.getItem('nyagtaa_sound') !== '0'; } catch (e) { }

// ---------- sound
const SND = {
  scene: null, music: null, musicKey: '', vo: null,
  bind(scene) { this.scene = scene; },
  sfx(key, vol = 0.7, rate = 1) { if (!G.sound || !this.scene || !this.scene.cache.audio.exists(key)) return; this.scene.sound.play(key, { volume: vol, rate }); },
  play(key, vol = 0.45) {
    const s = this.scene; if (!s) return;
    if (this.musicKey === key && this.music && this.music.isPlaying) return;
    const old = this.music; this.musicKey = key;
    if (old) s.tweens.add({ targets: old, volume: 0, duration: 900, onComplete: () => old.destroy() });
    if (!key || !s.cache.audio.exists(key)) { this.music = null; return; }
    this.music = s.sound.add(key, { loop: true, volume: 0 }); this.music.play(); this.music.setMute(!G.sound);
    this.music.baseVol = vol; s.tweens.add({ targets: this.music, volume: vol, duration: 1100 });
  },
  duck(on) { if (this.music && this.scene) this.scene.tweens.add({ targets: this.music, volume: (this.music.baseVol || 0.45) * (on ? 0.35 : 1), duration: 300 }); },
  voice(id) {
    this.stopVoice(); if (!G.sound || !this.scene || !this.scene.cache.audio.exists('vo_' + id)) return null;
    this.vo = this.scene.sound.add('vo_' + id, { volume: 1 }); this.vo.play(); this.duck(true);
    this.vo.once('complete', () => { this.duck(false); this.vo = null; }); return this.vo;
  },
  stopVoice() { if (this.vo) { this.vo.stop(); this.vo.destroy(); this.vo = null; this.duck(false); } },
  toggle() { G.sound = !G.sound; try { localStorage.setItem('nyagtaa_sound', G.sound ? '1' : '0'); } catch (e) { } if (this.music) this.music.setMute(!G.sound); if (!G.sound) this.stopVoice(); },
};

// ---------- text + UI kit
function txt(scene, x, y, s, size = 40, color = COL.inkS, o = {}) {
  const t = scene.add.text(x, y, s, Object.assign({ fontFamily: FONT, fontSize: size + 'px', fontStyle: o.weight || '900', color, align: o.align || 'center', lineSpacing: o.ls ?? 4 },
    o.wrap ? { wordWrap: { width: o.wrap, useAdvancedWrap: true } } : {}, o.stroke ? { stroke: o.stroke, strokeThickness: o.st || 8 } : {}));
  t.setOrigin(o.ox ?? 0.5, o.oy ?? 0.5); if (o.shadow) t.setShadow(0, o.shadow, 'rgba(20,10,50,0.45)', 0, true, true);
  if (o.translate !== false) I18N.bindText(t, s, { size, maxWidth: o.maxWidth, maxHeight: o.maxHeight });
  return t;
}
// paper panel: cream card with ink outline, offset shadow, optional ruled lines and washi tape
function paper(scene, x, y, w, h, o = {}) {
  const g = scene.add.graphics(); const r = o.r ?? 26, fill = o.fill ?? COL.panel, ink = o.ink ?? COL.ink;
  g.fillStyle(ink, o.shadowA ?? 0.9).fillRoundedRect(x - w / 2 + (o.sx ?? 0), y - h / 2 + (o.sy ?? 10), w, h, r);
  g.fillStyle(fill, 1).fillRoundedRect(x - w / 2, y - h / 2, w, h, r);
  if (o.lines) { g.lineStyle(2, 0x9fc3ff, 0.45); for (let ly = y - h / 2 + 70; ly < y + h / 2 - 20; ly += o.lines) g.lineBetween(x - w / 2 + 24, ly, x + w / 2 - 24, ly);
    g.lineStyle(2, 0xff9fb0, 0.6).lineBetween(x - w / 2 + 88, y - h / 2 + 10, x - w / 2 + 88, y + h / 2 - 10); }
  g.lineStyle(o.lw ?? 6, ink, 1).strokeRoundedRect(x - w / 2, y - h / 2, w, h, r);
  if (o.tape) { [[-1, o.tape], [1, o.tape2 ?? 0xffd36a]].forEach(([sd, c]) => { const cx = x + sd * (w / 2 - 60), cy = y - h / 2 + 4, a = (sd * 8 - 2) * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
    const pts = [[-60, -18], [60, -18], [60, 18], [-60, 18]].map(([px, py]) => ({ x: cx + px * ca - py * sa, y: cy + px * sa + py * ca })); g.fillStyle(c, 0.85).fillPoints(pts, true); }); }
  if (o.depth != null) g.setDepth(o.depth);
  return g;
}
// sticker button: chunky ink outline, press-down travel, wobble on hover
function button(scene, x, y, label, cb, o = {}) {
  const w = o.w || Math.max(260, Math.max(label.length, I18N.text(label, 'en').length) * (o.size || 40) * 0.62 + 90), h = o.h || 96, fill = o.fill ?? COL.gold, ink = COL.ink, travel = 9;
  const c = scene.add.container(x, y); const g = scene.add.graphics(); c.add(g);
  const draw = (down) => { g.clear(); g.fillStyle(ink, 1).fillRoundedRect(-w / 2, -h / 2 + travel, w, h, h * 0.36);
    g.fillStyle(fill, 1).fillRoundedRect(-w / 2, -h / 2 + (down ? travel - 2 : 0), w, h, h * 0.36);
    g.fillStyle(0xffffff, 0.35).fillRoundedRect(-w / 2 + 14, -h / 2 + (down ? travel - 2 : 0) + 9, w - 28, h * 0.28, h * 0.14);
    g.lineStyle(6, ink, 1).strokeRoundedRect(-w / 2, -h / 2 + (down ? travel - 2 : 0), w, h, h * 0.36); };
  draw(false);
  const t = txt(scene, 0, 0, label, o.size || 40, o.color || COL.inkS, { maxWidth: w - (o.icon ? 132 : 44), maxHeight: h - 24 }); c.add(t);
  if (o.icon) { const ic = scene.add.image(-w / 2 + 52, 0, o.icon).setDisplaySize(56, 56); c.add(ic); t.x += 22; c.icon = ic; }
  c.setSize(w, h + travel); c.setInteractive({ useHandCursor: true });
  let locked = !!o.locked; c.locked = locked;
  const setLocked = (v) => { locked = v; c.locked = v; c.setAlpha(v ? 0.5 : 1); }; setLocked(locked); c.setLocked = setLocked;
  c.on('pointerover', () => { if (!locked) scene.tweens.add({ targets: c, scale: 1.05, angle: o.tilt ?? -1.5, duration: 140 }); });
  c.on('pointerout', () => { scene.tweens.add({ targets: c, scale: 1, angle: 0, duration: 140 }); draw(false); t.y = 0; if (c.icon) c.icon.y = 0; });
  c.on('pointerdown', (p, lx, ly, ev) => { ev && ev.stopPropagation(); if (locked) { SND.sfx('nope', 0.5); scene.tweens.add({ targets: c, x: x + 10, duration: 50, yoyo: true, repeat: 3 }); if (o.onLocked) o.onLocked(); return; } draw(true); t.y = travel - 2; if (c.icon) c.icon.y = travel - 2; SND.sfx('tap', 0.6); });
  c.on('pointerup', (p, lx, ly, ev) => { ev && ev.stopPropagation(); if (locked) return; draw(false); t.y = 0; if (c.icon) c.icon.y = 0; scene.time.delayedCall(60, () => cb && cb()); });
  c.label = t; return c;
}
function toast(scene, s, o = {}) { // small sticker that pops and floats away
  const c = scene.add.container(o.x ?? GW / 2, o.y ?? 180).setDepth(5000).setScrollFactor(0);
  const t = txt(scene, 0, 0, s, o.size || 38, o.color || COL.inkS, { maxWidth: GW - 100 });
  const g = scene.add.graphics();
  const draw = () => { const w = t.width + 60, h = t.height + 30; g.clear(); g.fillStyle(COL.ink, 1).fillRoundedRect(-w / 2, -h / 2 + 7, w, h, 22); g.fillStyle(o.fill ?? COL.cream, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 22); g.lineStyle(5, COL.ink).strokeRoundedRect(-w / 2, -h / 2, w, h, 22); };
  draw(); t.on('localized', draw);
  c.add([g, t]); c.setScale(0.3).setAngle(o.angle ?? -3);
  scene.tweens.add({ targets: c, scale: 1, duration: 320, ease: 'Back.Out' });
  scene.tweens.add({ targets: c, y: c.y - 40, alpha: 0, delay: o.hold ?? 1300, duration: 500, onComplete: () => c.destroy() });
  return c;
}
function floatNum(scene, x, y, s, color = '#ffe27a') { // "+10" pops in world space
  const t = txt(scene, x, y, s, 52, color, { stroke: COL.inkS, st: 10 }).setDepth(4000);
  scene.tweens.add({ targets: t, y: y - 120, duration: 1100, ease: 'Cubic.Out' }); scene.tweens.add({ targets: t, alpha: 0, delay: 700, duration: 400, onComplete: () => t.destroy() });
  t.setScale(0.4); scene.tweens.add({ targets: t, scale: 1, duration: 260, ease: 'Back.Out' });
}
function burst(scene, x, y, n = 18, tint = 0xffe27a, depth = 4500, o = {}) {
  for (let i = 0; i < n; i++) {
    const s = scene.add.image(x, y, o.key || 'spark').setDepth(depth).setTint(Array.isArray(tint) ? tint[i % tint.length] : tint).setBlendMode(o.blend ?? Phaser.BlendModes.ADD).setScale(0.25 + Math.random() * 0.5);
    if (o.sf != null) s.setScrollFactor(o.sf);
    const a = Math.random() * Math.PI * 2, d = (o.r || 140) * (0.4 + Math.random() * 0.8);
    scene.tweens.add({ targets: s, x: x + Math.cos(a) * d, y: y + Math.sin(a) * d * 0.8 - (o.up || 30), angle: Math.random() * 360, alpha: 0, scale: 0.05, duration: 600 + Math.random() * 500, ease: 'Cubic.Out', onComplete: () => s.destroy() });
  }
}
function fadeTo(scene, key, data, ms = 450) {
  if (scene._leaving) return; scene._leaving = true;
  scene.cameras.main.fadeOut(ms, 20, 12, 46);
  scene.cameras.main.once('camerafadeoutcomplete', () => scene.scene.start(key, data));
}
function fadeIn(scene, ms = 500) { scene.cameras.main.fadeIn(ms, 20, 12, 46); }

// ---------- dialogue box with portrait, typewriter and voice
class Dialog {
  constructor(scene) {
    this.s = scene; this.q = []; this.busy = false;
    const d = 9000; this.depth = d;
    this.root = scene.add.container(0, 0).setDepth(d).setScrollFactor(0).setVisible(false);
    this.dim = scene.add.rectangle(GW / 2, GH / 2, GW, GH, COL.shade, 0.0).setInteractive(); this.root.add(this.dim);
    this.portrait = scene.add.image(300, GH - 250, 'pt_nyagtaa_happy').setOrigin(0.5, 1); this.root.add(this.portrait);
    this.box = scene.add.container(GW / 2 + 110, GH - 150); this.root.add(this.box);
    const g = scene.add.graphics(); const w = 1480, h = 236;
    g.fillStyle(COL.ink, 1).fillRoundedRect(-w / 2, -h / 2 + 12, w, h, 34); g.fillStyle(COL.panel, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 34);
    g.lineStyle(2, 0x9fc3ff, 0.35); for (let ly = -h / 2 + 64; ly < h / 2 - 16; ly += 52) g.lineBetween(-w / 2 + 30, ly, w / 2 - 30, ly);
    g.lineStyle(7, COL.ink, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, 34); this.box.add(g);
    this.tag = scene.add.container(-w / 2 + 170, -h / 2 - 6); this.tagG = scene.add.graphics(); this.tagT = txt(scene, 0, 0, '', 34, '#ffffff'); this.tag.add([this.tagG, this.tagT]); this.tag.setAngle(-3); this.box.add(this.tag);
    this.body = txt(scene, -w / 2 + 330, -h / 2 + 34, '', 40, COL.inkS, { ox: 0, oy: 0, align: 'left', wrap: w - 400, weight: '800', ls: 10, translate: false }); this.box.add(this.body);
    this.next = txt(scene, w / 2 - 50, h / 2 - 36, '▼', 34, '#ff6b7a'); this.box.add(this.next);
    scene.tweens.add({ targets: this.next, y: this.next.y + 8, duration: 420, yoyo: true, repeat: -1 });
    this.dim.on('pointerdown', () => this.tap());
    this.key = scene.input.keyboard && scene.input.keyboard.on('keydown', (e) => { if (this.root.visible && (e.code === 'Space' || e.code === 'Enter')) this.tap(); });
    const unsubscribe = I18N.onChange(() => {
      if (!this.busy || !this.cur) return;
      this.full = I18N.text(this.cur.mn);
      this.finishType(); // Show the same line in full; do not advance or restart the scene.
      this.drawTag(WHO[this.cur.who] || WHO.narrator);
    });
    scene.events.once('shutdown', unsubscribe);
  }
  // lines: array of ids from L, or {id} / {who, mn, face}
  say(lines, done) { this.q = lines.map(l => typeof l === 'string' ? Object.assign({ id: l }, L[l]) : l); this.done = done; this.root.setVisible(true); this.busy = true;
    this.s.tweens.add({ targets: this.dim, fillAlpha: 0.28, duration: 250 }); this.show(); }
  show() {
    const l = this.q.shift(); if (!l) return this.close(); this.cur = l;
    const who = WHO[l.who] || WHO.narrator; const s = this.s;
    let pk = l.who === 'mom' || l.who === 'hunter' ? `pt_${l.who}_p` : l.who === 'wood' ? 'pt_wood1_p' : l.who === 'dad' ? `pt_dad_${l.face || 'main'}` : l.who === 'tumur' ? 'pt_gamer_' + (l.face || 'main') : l.who === 'suvd' ? 'pt_girl_' + (l.face || 'main') : l.who === 'khuurmag' ? 'pt_khuurmag_' + (l.face || 'main') : `pt_nyagtaa_${l.face || 'happy'}`;
    if (!s.textures.exists(pk)) pk = l.who === 'nyagtaa' ? 'pt_nyagtaa_happy' : null;
    if (pk && l.who !== 'narrator') { const changed = this.portrait.texture.key !== pk || !this.portrait.visible; this.portrait.setTexture(pk).setVisible(true); const sc = 430 / this.portrait.height; this.portrait.setScale(sc);
      this.portrait.setFlipX(false);
      if (changed) { this.portrait.y = GH - 230 + 60; this.portrait.setAlpha(0); s.tweens.add({ targets: this.portrait, y: GH - 230, alpha: 1, duration: 260, ease: 'Back.Out' }); }
      else { s.tweens.add({ targets: this.portrait, scaleY: sc * 1.04, scaleX: sc * 0.97, duration: 110, yoyo: true }); } }
    else this.portrait.setVisible(false);
    this.drawTag(who);
    this.body.setFontStyle(l.who === 'narrator' ? 'italic 800' : '800');
    this.full = I18N.text(l.mn); this.n = 0; this.body.setText(''); this.next.setVisible(false); this.typing = true;
    const v = l.id ? SND.voice(l.id) : null;
    if (this.tm) this.tm.remove();
    this.tm = s.time.addEvent({ delay: 24, loop: true, callback: () => { this.n += 1; this.body.setText(this.full.slice(0, this.n)); if (!v && this.n % 3 === 0 && this.full[this.n] !== ' ') SND.sfx('blip', 0.25, 0.9 + Math.random() * 0.3); if (this.n >= this.full.length) this.finishType(); } });
  }
  drawTag(who) {
    this.tagG.clear(); if (!who.name) { this.tag.setVisible(false); return; }
    this.tagT.setText(who.name); const tw = this.tagT.width + 48;
    this.tagG.fillStyle(COL.ink, 1).fillRoundedRect(-tw / 2, -21, tw, 54, 18);
    this.tagG.fillStyle(Phaser.Display.Color.HexStringToColor(who.col).color, 1).fillRoundedRect(-tw / 2, -27, tw, 54, 18);
    this.tagG.lineStyle(5, COL.ink).strokeRoundedRect(-tw / 2, -27, tw, 54, 18); this.tag.setVisible(true);
  }
  finishType() { if (this.tm) this.tm.remove(); this.tm = null; this.typing = false; this.body.setText(this.full); this.next.setVisible(true); }
  tap() { if (!this.busy) return; if (this.typing) return this.finishType(); SND.sfx('page', 0.35); this.show(); }
  close() { SND.stopVoice(); this.busy = false; this.s.tweens.add({ targets: this.dim, fillAlpha: 0, duration: 200 }); this.root.setVisible(false); const d = this.done; this.done = null; if (d) d(); }
}

// ---------- full-screen video, with timed English captions over the original MN subtitles
const VIDEO = {
  stop: null,
  play(src, onEnd, o = {}) {
    if (this.stop) this.stop();
    const wrap = document.getElementById('vid'), v = document.getElementById('vv'), skip = document.getElementById('skip');
    let done = false, skipTimer, detachCaptions;
    const finish = (advance = true) => {
      if (done) return; done = true; clearTimeout(skipTimer);
      if (detachCaptions) detachCaptions();
      v.onended = null; v.onerror = null; skip.onclick = null; skip.disabled = true;
      v.pause(); v.removeAttribute('src'); v.load(); wrap.hidden = true;
      skip.classList.remove('on'); wrap.querySelectorAll('.tap').forEach(e => e.remove());
      this.stop = null;
      if (advance && onEnd) onEnd();
    };
    this.stop = () => finish(false);
    wrap.hidden = false; v.src = src; v.muted = !G.sound; v.currentTime = 0;
    detachCaptions = VideoCaptions.attach(v, document.getElementById('video-caption'), src);
    skip.disabled = true; skip.classList.remove('on');
    skip.onclick = (e) => { e.stopPropagation(); finish(); };
    skipTimer = setTimeout(() => { if (!done) { skip.disabled = false; skip.classList.add('on'); } }, o.skipDelay ?? 1200);
    v.onended = () => finish(); v.onerror = () => { console.warn('video failed', src); finish(); };
    const p = v.play(); if (p && p.catch) p.catch(() => { // autoplay with sound blocked: ask for a tap
      if (done) return;
      const t = document.createElement('div'); t.className = 'tap'; t.dataset.i18n = '▶  Үзэх'; t.textContent = I18N.text(t.dataset.i18n);
      t.onclick = () => {
        t.remove(); v.play().catch(() => { if (!done) { v.muted = true; v.play().catch(() => finish()); } });
      };
      wrap.appendChild(t);
    });
  },
};
