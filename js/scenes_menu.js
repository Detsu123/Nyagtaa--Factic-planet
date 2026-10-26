// Boot (procedural textures) · Preload · Title · Tutorial
function canvasTex(scene, key, w, h, fn, localized = false) {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const t = scene.textures.createCanvas(key, w, h), c = t.getContext();
  const redraw = () => {
    if (!scene.textures.exists(key) || scene.textures.get(key) !== t) return;
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, w, h);
    fn(c, w, h); c.restore(); t.refresh();
  };
  redraw(); if (localized) I18N.canvases.set(key, redraw);
  return t;
}
const INK = '#2a1f5e';
function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() {
    const S = this;
    canvasTex(S, 'spark', 64, 64, (c) => { const g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.2, 'rgba(255,255,255,0.7)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64);
      c.fillStyle = '#fff'; c.beginPath(); c.moveTo(32, 2); c.quadraticCurveTo(35, 29, 62, 32); c.quadraticCurveTo(35, 35, 32, 62); c.quadraticCurveTo(29, 35, 2, 32); c.quadraticCurveTo(29, 29, 32, 2); c.fill(); });
    canvasTex(S, 'dot', 32, 32, (c) => { const g = c.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 32, 32); });
    canvasTex(S, 'ring', 160, 160, (c) => { c.strokeStyle = 'rgba(255,236,150,0.9)'; c.lineWidth = 7; c.setLineDash([22, 12]); c.beginPath(); c.arc(80, 80, 62, 0, 6.28); c.stroke();
      const g = c.createRadialGradient(80, 80, 30, 80, 80, 80); g.addColorStop(0, 'rgba(255,220,120,0.35)'); g.addColorStop(1, 'rgba(255,220,120,0)'); c.fillStyle = g; c.setLineDash([]); c.beginPath(); c.arc(80, 80, 80, 0, 6.28); c.fill(); });
    canvasTex(S, 'shadow', 128, 64, (c) => { const g = c.createRadialGradient(64, 32, 0, 64, 32, 64); g.addColorStop(0, 'rgba(30,20,60,0.7)'); g.addColorStop(0.6, 'rgba(30,20,60,0.3)'); g.addColorStop(1, 'rgba(30,20,60,0)'); c.save(); c.scale(1, 0.5); c.fillStyle = g; c.fillRect(0, 0, 128, 128); c.restore(); });
    canvasTex(S, 'lens_ic', 120, 120, (c) => { c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = 22; c.beginPath(); c.moveTo(74, 74); c.lineTo(106, 106); c.stroke(); c.strokeStyle = '#a8673d'; c.lineWidth = 12; c.beginPath(); c.moveTo(76, 76); c.lineTo(104, 104); c.stroke();
      c.fillStyle = INK; c.beginPath(); c.arc(50, 50, 40, 0, 6.28); c.fill(); c.fillStyle = '#ffc94a'; c.beginPath(); c.arc(50, 50, 35, 0, 6.28); c.fill(); const g = c.createRadialGradient(42, 40, 2, 50, 50, 27); g.addColorStop(0, '#ffffff'); g.addColorStop(0.4, '#c9f3ff'); g.addColorStop(1, '#6fc7ea'); c.fillStyle = g; c.beginPath(); c.arc(50, 50, 26, 0, 6.28); c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 5; c.beginPath(); c.arc(50, 50, 17, 3.6, 4.6); c.stroke(); });
    canvasTex(S, 'check_ic', 110, 110, (c) => { c.fillStyle = INK; c.beginPath(); c.arc(55, 58, 44, 0, 6.28); c.fill(); c.fillStyle = '#3fcf9a'; c.beginPath(); c.arc(55, 52, 44, 0, 6.28); c.fill(); c.strokeStyle = INK; c.lineWidth = 6; c.stroke();
      c.strokeStyle = '#fff'; c.lineWidth = 12; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(33, 53); c.lineTo(49, 69); c.lineTo(78, 37); c.stroke(); });
    canvasTex(S, 'talk_ic', 120, 110, (c) => { c.fillStyle = INK; rr(c, 6, 12, 108, 74, 30); c.fill(); c.beginPath(); c.moveTo(30, 80); c.lineTo(22, 106); c.lineTo(58, 82); c.fill(); c.fillStyle = '#ffffff'; rr(c, 10, 6, 100, 70, 26); c.fill(); c.beginPath(); c.moveTo(32, 70); c.lineTo(28, 96); c.lineTo(56, 74); c.fill();
      c.fillStyle = '#ff6b7a'; [36, 60, 84].forEach(x => { c.beginPath(); c.arc(x, 41, 8, 0, 6.28); c.fill(); }); });
    canvasTex(S, 'arrow_ic', 120, 120, (c) => { c.fillStyle = INK; c.beginPath(); c.arc(60, 64, 52, 0, 6.28); c.fill(); c.fillStyle = '#ffc94a'; c.beginPath(); c.arc(60, 58, 52, 0, 6.28); c.fill(); c.strokeStyle = INK; c.lineWidth = 6; c.stroke();
      c.fillStyle = INK; c.beginPath(); c.moveTo(60, 22); c.lineTo(90, 58); c.lineTo(72, 58); c.lineTo(72, 92); c.lineTo(48, 92); c.lineTo(48, 58); c.lineTo(30, 58); c.closePath(); c.fill(); });
    canvasTex(S, 'bow', 140, 90, (c) => { c.lineJoin = 'round'; const wing = (s) => { c.beginPath(); c.moveTo(70, 45); c.bezierCurveTo(70 + s * 20, 10, 70 + s * 64, -2, 70 + s * 64, 22); c.lineTo(70 + s * 64, 68); c.bezierCurveTo(70 + s * 64, 92, 70 + s * 20, 80, 70, 45); c.closePath(); };
      [-1, 1].forEach(s => { wing(s); c.fillStyle = '#8b5cf6'; c.fill(); c.strokeStyle = INK; c.lineWidth = 7; c.stroke(); });
      c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.ellipse(40, 28, 14, 6, -0.3, 0, 6.28); c.fill(); c.beginPath(); c.ellipse(100, 28, 14, 6, 0.3, 0, 6.28); c.fill();
      c.fillStyle = '#a78bfa'; rr(c, 55, 28, 30, 34, 10); c.fill(); c.strokeStyle = INK; c.lineWidth = 7; c.stroke(); });
    canvasTex(S, 'sun', 130, 130, (c) => { c.fillStyle = '#ffb84a'; for (let i = 0; i < 12; i++) { c.save(); c.translate(65, 65); c.rotate(i * Math.PI / 6); c.beginPath(); c.moveTo(-10, -40); c.lineTo(0, -62); c.lineTo(10, -40); c.fill(); c.restore(); }
      c.fillStyle = INK; c.beginPath(); c.arc(65, 68, 40, 0, 6.28); c.fill(); const g = c.createRadialGradient(56, 54, 4, 65, 65, 40); g.addColorStop(0, '#fff6c9'); g.addColorStop(0.5, '#ffe27a'); g.addColorStop(1, '#ffb84a'); c.fillStyle = g; c.beginPath(); c.arc(65, 64, 40, 0, 6.28); c.fill(); c.strokeStyle = INK; c.lineWidth = 6; c.stroke(); });
    canvasTex(S, 'glass', 140, 170, (c) => { // hourglass
      c.lineJoin = 'round'; c.fillStyle = '#a8673d'; c.strokeStyle = INK; c.lineWidth = 6; rr(c, 14, 6, 112, 22, 8); c.fill(); c.stroke(); rr(c, 14, 142, 112, 22, 8); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(28, 28); c.bezierCurveTo(28, 70, 66, 74, 66, 85); c.bezierCurveTo(66, 96, 28, 100, 28, 142); c.lineTo(112, 142); c.bezierCurveTo(112, 100, 74, 96, 74, 85); c.bezierCurveTo(74, 74, 112, 70, 112, 28); c.closePath(); c.fillStyle = 'rgba(220,245,255,0.85)'; c.fill(); c.stroke(); });
    canvasTex(S, 'bag', 150, 130, (c) => { c.lineJoin = 'round'; c.strokeStyle = INK; c.lineWidth = 7; c.beginPath(); c.moveTo(40, 40); c.bezierCurveTo(40, 0, 110, 0, 110, 40); c.stroke();
      c.fillStyle = '#9a5b34'; rr(c, 12, 36, 126, 86, 22); c.fill(); c.stroke(); c.fillStyle = '#b8743f'; c.beginPath(); c.moveTo(12, 60); c.bezierCurveTo(12, 30, 138, 30, 138, 60); c.lineTo(138, 80); c.bezierCurveTo(100, 96, 50, 96, 12, 80); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#ffc94a'; rr(c, 64, 70, 22, 22, 6); c.fill(); c.stroke(); });
    canvasTex(S, 'vign', 512, 288, (c, w, h) => { const g = c.createRadialGradient(w / 2, h / 2, h * 0.42, w / 2, h / 2, w * 0.6); g.addColorStop(0, 'rgba(40,10,70,0)'); g.addColorStop(0.55, 'rgba(50,14,90,0.4)'); g.addColorStop(1, 'rgba(18,4,40,0.92)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
    canvasTex(S, 'smoke', 128, 128, (c) => { for (let i = 0; i < 7; i++) { const x = 40 + Math.random() * 48, y = 40 + Math.random() * 48, r = 22 + Math.random() * 20; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(255,255,255,0.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 128, 128); } });
    canvasTex(S, 'log', 260, 150, (c) => { c.lineJoin = 'round'; c.fillStyle = '#9b6a45'; c.strokeStyle = INK; c.lineWidth = 7; rr(c, 40, 22, 190, 106, 40); c.fill(); c.stroke();
      c.strokeStyle = '#7d5133'; c.lineWidth = 4; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(80 + i * 30, 30); c.lineTo(76 + i * 30 + Math.sin(i) * 6, 120); c.stroke(); }
      c.fillStyle = '#f1c98d'; c.strokeStyle = INK; c.lineWidth = 7; c.beginPath(); c.ellipse(52, 75, 34, 53, 0, 0, 6.28); c.fill(); c.stroke();
      c.strokeStyle = '#c99a5f'; c.lineWidth = 3; [10, 22, 34, 44].forEach(r => { c.beginPath(); c.ellipse(52, 75, r * 0.64, r, 0, 0, 6.28); c.stroke(); }); });
    canvasTex(S, 'halflog', 150, 150, (c) => { c.lineJoin = 'round'; c.fillStyle = '#f1c98d'; c.strokeStyle = INK; c.lineWidth = 7; c.beginPath(); c.moveTo(20, 130); c.lineTo(20, 20); c.bezierCurveTo(90, 20, 130, 60, 130, 130); c.closePath(); c.fill(); c.stroke();
      c.strokeStyle = '#c99a5f'; c.lineWidth = 3; [30, 55, 80].forEach(r => { c.beginPath(); c.arc(20, 130, r, -Math.PI / 2, 0); c.stroke(); }); c.fillStyle = '#9b6a45'; c.beginPath(); c.moveTo(20, 20); c.bezierCurveTo(90, 20, 130, 60, 130, 130); c.lineTo(118, 130); c.bezierCurveTo(118, 66, 84, 32, 20, 32); c.closePath(); c.fill(); });
    canvasTex(S, 'axe', 200, 220, (c) => { c.lineJoin = 'round'; c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = 26; c.beginPath(); c.moveTo(100, 210); c.lineTo(100, 50); c.stroke(); c.strokeStyle = '#c98a55'; c.lineWidth = 14; c.beginPath(); c.moveTo(100, 206); c.lineTo(100, 52); c.stroke();
      c.fillStyle = '#d9e4f2'; c.strokeStyle = INK; c.lineWidth = 7; c.beginPath(); c.moveTo(92, 30); c.lineTo(160, 12); c.bezierCurveTo(186, 50, 186, 86, 160, 110); c.lineTo(92, 84); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(160, 22); c.bezierCurveTo(176, 50, 176, 80, 160, 100); c.lineTo(152, 96); c.bezierCurveTo(164, 76, 164, 50, 152, 28); c.fill(); });
    canvasTex(S, 'branch', 300, 140, (c) => { c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = 22; c.beginPath(); c.moveTo(10, 110); c.quadraticCurveTo(150, 80, 290, 96); c.moveTo(150, 92); c.lineTo(200, 40); c.stroke();
      c.strokeStyle = '#8a5a3a'; c.lineWidth = 12; c.beginPath(); c.moveTo(12, 110); c.quadraticCurveTo(150, 80, 288, 96); c.moveTo(150, 92); c.lineTo(198, 42); c.stroke();
      c.fillStyle = '#7fd36a'; [[205, 34], [270, 88], [60, 100]].forEach(([x, y]) => { c.beginPath(); c.ellipse(x, y, 20, 10, 0.6, 0, 6.28); c.fill(); c.strokeStyle = INK; c.lineWidth = 4; c.stroke(); });
      c.strokeStyle = '#1c1426'; c.lineWidth = 4; for (let i = 0; i < 26; i++) { const x = 150 + Math.random() * 46, y = 72 + Math.random() * 30; c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + 8, y + 10, x - 6, y + 18, x + 4, y + 28); c.stroke(); } });
    canvasTex(S, 'sign', 220, 210, (c) => { c.lineJoin = 'round'; c.fillStyle = '#a8744f'; c.strokeStyle = INK; c.lineWidth = 7; rr(c, 98, 70, 24, 136, 8); c.fill(); c.stroke();
      c.fillStyle = '#f2c48d'; c.beginPath(); c.moveTo(14, 26); c.lineTo(170, 26); c.lineTo(206, 62); c.lineTo(170, 98); c.lineTo(14, 98); c.closePath(); c.fill(); c.stroke(); c.fillStyle = INK; c.font = '900 34px Nunito'; c.textAlign = 'center'; c.fillText(I18N.text('ОЙ'), 96, 76, 142); }, true);
    canvasTex(S, 'sign2', 220, 210, (c) => { c.lineJoin = 'round'; c.fillStyle = '#a8744f'; c.strokeStyle = INK; c.lineWidth = 7; rr(c, 98, 70, 24, 136, 8); c.fill(); c.stroke();
      c.fillStyle = '#f2c48d'; c.beginPath(); c.moveTo(206, 26); c.lineTo(50, 26); c.lineTo(14, 62); c.lineTo(50, 98); c.lineTo(206, 98); c.closePath(); c.fill(); c.stroke(); c.fillStyle = INK; c.font = '900 30px Nunito'; c.textAlign = 'center'; c.fillText(I18N.text('ТОСГОН'), 124, 74, 142); }, true);
    canvasTex(S, 'ball', 80, 80, (c) => { const g = c.createRadialGradient(30, 28, 4, 40, 40, 36); g.addColorStop(0, '#fff'); g.addColorStop(0.3, '#ff8fa2'); g.addColorStop(1, '#e8466a'); c.fillStyle = INK; c.beginPath(); c.arc(40, 42, 36, 0, 6.28); c.fill(); c.fillStyle = g; c.beginPath(); c.arc(40, 40, 33, 0, 6.28); c.fill(); });
    this.scene.start('Preload');
  }
}

class PreloadScene extends Phaser.Scene {
  constructor() { super('Preload'); }
  preload() {
    document.getElementById('boot').style.display = 'none';
    const cx = GW / 2, cy = GH / 2;
    this.add.rectangle(cx, cy, GW, GH, 0x140c2e);
    for (let i = 0; i < 90; i++) { const s = this.add.image(Math.random() * GW, Math.random() * GH, 'dot').setScale(0.2 + Math.random() * 0.4).setAlpha(0.3 + Math.random() * 0.6); this.tweens.add({ targets: s, alpha: 0.1, duration: 800 + Math.random() * 1600, yoyo: true, repeat: -1 }); }
    txt(this, cx, cy - 170, 'НЯГТАА', 120, '#fff8ee', { stroke: INK, st: 16 });
    txt(this, cx, cy - 70, 'Факт гаригийн аян', 44, '#b9a4ff', { weight: '800' });
    const barW = 760; const g = this.add.graphics(); g.fillStyle(0x2a1f5e, 1).fillRoundedRect(cx - barW / 2, cy + 60, barW, 44, 22); g.lineStyle(6, 0xfff8ee, 0.9).strokeRoundedRect(cx - barW / 2, cy + 60, barW, 44, 22);
    const fill = this.add.graphics(); const lens = this.add.image(cx - barW / 2, cy + 82, 'lens_ic').setScale(0.9);
    const pct = txt(this, cx, cy + 160, '0%', 34, '#fff8ee', { weight: '800' });
    const tips = ['Долоо нягталж, нэг түгээ!', 'Гарчгаас цааш унш.', '"Яар!" гэвэл бүр ч тайван бай.', 'Баримт ба бодлыг ялга.'];
    const tip = txt(this, cx, GH - 120, tips[Math.floor(Math.random() * tips.length)], 34, '#ffe27a', { weight: '800' });
    this.load.on('progress', v => { fill.clear(); fill.fillStyle(0xffc94a, 1).fillRoundedRect(cx - barW / 2 + 6, cy + 66, Math.max(32, (barW - 12) * v), 32, 16); lens.x = cx - barW / 2 + (barW) * v; lens.angle = Math.sin(v * 30) * 12; pct.setText(Math.round(v * 100) + '%'); });
    this.load.on('loaderror', f => console.warn('load error', f.key));
    // assets
    this.load.json('world', 'assets/world.json');
    for (const loc of ['village', 'forest', 'village_sunset']) for (const k of ['sky', 'far', 'near']) this.load.image(`${loc}_${k}`, `assets/bg/${loc}_${k}.webp`);
    for (const ch of ['nyagtaa', 'dad', 'mom', 'suvd', 'tumur', 'khuurmag', 'hunter', 'wood1', 'wood2']) for (let i = 0; i < 8; i++) this.load.image(`${ch}_${i}`, `assets/ch/${ch}_${i}.webp`);
    PORTRAITS.forEach(p => this.load.image('pt_' + p, `assets/pt/${p}.webp`));
    for (const m of ['m_title', 'm_village', 'm_invest', 'm_think', 'm_quiz', 'm_end', 'm_dark']) this.load.audio(m, `assets/snd/${m}.mp3`);
    for (const s of SFX) this.load.audio(s, `assets/snd/${s}.mp3`);
    for (const id of Object.keys(L)) this.load.audio('vo_' + id, `assets/vo/${id}.mp3`);
  }
  create() { SND.bind(this); this.scene.start('Title'); }
}
const PORTRAITS = ['nyagtaa_happy', 'nyagtaa_thinking', 'nyagtaa_notes', 'nyagtaa_curious', 'nyagtaa_surprised', 'nyagtaa_excited', 'nyagtaa_wink', 'nyagtaa_confused', 'nyagtaa_reading', 'nyagtaa_laugh', 'nyagtaa_main',
  'dad_angry', 'dad_shocked', 'dad_main', 'dad_thankful', 'dad_embarrassed', 'gamer_main', 'girl_laughing', 'girl_main', 'girl_excited',
  'khuurmag_main', 'khuurmag_evillaugh', 'khuurmag_sneaky', 'khuurmag_scared', 'khuurmag_melting', 'khuurmag_whispering', 'mom_p', 'hunter_p', 'wood1_p', 'wood2_p'];
const SFX = ['tap', 'nope', 'blip', 'page', 'pop', 'whoosh', 'chop', 'miss', 'stack', 'sparkle', 'good', 'bad', 'tick', 'alarm', 'badge', 'rumble', 'coin', 'pick', 'drop', 'calm', 'fanfare', 'step'];

class TitleScene extends Phaser.Scene {
  constructor() { super('Title'); }
  create() {
    SND.bind(this); fadeIn(this, 700);
    const w = new World25(this, 'village'); this.w = w; this.cameras.main.scrollX = 240;
    this.ny = new Actor(w, 'nyagtaa', 1.2, 3.2, { dir: 0, bounce: 3.2 });
    this.kids = [new Actor(w, 'tumur', -3.4, 1.6, { dir: 1, bounce: 4 }), new Actor(w, 'suvd', -1.4, 0.4, { dir: 7, bounce: 4.4 }), new Actor(w, 'mom', 5.2, 1.0, { dir: 7 })];
    this.add.image(GW / 2, GH / 2, 'vign').setDisplaySize(GW, GH).setScrollFactor(0).setAlpha(0.35).setDepth(4000);
    // logo: big lettering sitting on a ribbon
    const lx = 560, ly = 300; const logo = this.add.container(lx, ly).setScrollFactor(0).setDepth(5000);
    const rib = this.add.graphics(); rib.fillStyle(COL.ink, 1).fillRoundedRect(-330, 92, 660, 84, 30); rib.fillStyle(0xff6b7a, 1).fillRoundedRect(-330, 84, 660, 84, 30); rib.lineStyle(6, COL.ink).strokeRoundedRect(-330, 84, 660, 84, 30);
    const t1 = txt(this, 0, 0, 'НЯГТАА', 170, '#fff8ee', { stroke: INK, st: 22 }); t1.setShadow(0, 14, '#2a1f5e', 0, true, true);
    const t2 = txt(this, 0, 126, 'Факт гаригийн аян', 50, '#fff8ee');
    const lens = this.add.image(250, -70, 'lens_ic').setScale(1.3).setAngle(18);
    logo.add([rib, t1, t2, lens]); logo.setScale(0.6).setAlpha(0);
    this.tweens.add({ targets: logo, scale: 1, alpha: 1, duration: 800, ease: 'Back.Out', delay: 300 });
    this.tweens.add({ targets: lens, angle: -6, y: -84, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    const b1 = button(this, lx, 600, 'Тоглох', () => this.start(), { w: 460, h: 118, size: 56 }).setScrollFactor(0).setDepth(5000);
    this.tweens.add({ targets: b1, scale: 1.04, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    const snd = button(this, lx - 120, 750, G.sound ? 'Дуу: Тийм' : 'Дуу: Үгүй', () => { SND.toggle(); snd.label.setText(G.sound ? 'Дуу: Тийм' : 'Дуу: Үгүй'); if (G.sound) SND.play('m_title', 0.4); }, { w: 300, h: 84, size: 32, fill: 0xfff8ee }).setScrollFactor(0).setDepth(5000);
    button(this, lx + 190, 750, 'Бүтэн дэлгэц', () => { if (this.scale.isFullscreen) this.scale.stopFullscreen(); else this.scale.startFullscreen(); }, { w: 300, h: 84, size: 32, fill: 0xb9f0ff }).setScrollFactor(0).setDepth(5000);
    txt(this, lx, 880, 'Долоо нягталж, нэг түгээ', 36, '#fff8ee', { weight: '800', stroke: INK, st: 8 }).setScrollFactor(0).setDepth(5000);
    txt(this, GW - 40, GH - 34, '#7нягталж1түгээ', 28, '#fff8ee', { ox: 1, weight: '800', stroke: INK, st: 6 }).setScrollFactor(0).setDepth(5000);
    this.input.once('pointerdown', () => SND.play('m_title', 0.4));
    if (!this.sound.locked) SND.play('m_title', 0.4);
    this.pollen = []; for (let i = 0; i < 40; i++) { const p = this.add.image(Math.random() * BGW, Math.random() * GH, 'dot').setTint(0xffe9a0).setBlendMode(Phaser.BlendModes.ADD).setScale(0.3 + Math.random() * 0.5).setDepth(3500); p.vx = (Math.random() - 0.5) * 20; p.vy = -10 - Math.random() * 20; p.ph = Math.random() * 6; this.pollen.push(p); }
  }
  start() {
    if (this.started) return; this.started = true;
    try { if (!this.scale.isFullscreen && this.sys.game.device.input.touch) this.scale.startFullscreen(); screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => { }); } catch (e) { }
    G.newRun(); SND.play(null);
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => VIDEO.play('assets/vid/intro.mp4', () => this.scene.start('Tutorial')));
  }
  update(t, dt) {
    t /= 1000; dt /= 1000; this.w.update(t, dt);
    this.cameras.main.scrollX = 240 + Math.sin(t * 0.12) * 200;
    this.pollen.forEach(p => { p.x += (p.vx + Math.sin(t + p.ph) * 12) * dt; p.y += p.vy * dt; p.alpha = 0.5 + 0.5 * Math.sin(t * 2 + p.ph); if (p.y < -20) { p.y = GH + 20; p.x = Math.random() * BGW; } });
  }
}

// ---------- tutorial: Nyagtaa explains the warning signs, the method and the HUD
class TutorialScene extends Phaser.Scene {
  constructor() { super('Tutorial'); }
  create() {
    SND.bind(this); fadeIn(this); SND.play('m_title', 0.32);
    const w = new World25(this, 'village', { blur: 1.3 }); this.cameras.main.scrollX = 0;
    this.add.rectangle(GW / 2, GH / 2, GW, GH, 0x140c2e, 0.45).setScrollFactor(0).setDepth(100);
    this.dlg = new Dialog(this);
    this.ui = this.add.container(0, 0).setScrollFactor(0).setDepth(500);
    button(this, GW - 170, 70, 'Алгасах ▸▸', () => this.finish(), { w: 270, h: 72, size: 30, fill: 0xfff8ee }).setScrollFactor(0).setDepth(9500);
    this.step1();
  }
  step1() { this.dlg.say(['t1'], () => this.step2()); }
  step2() {
    // three "warning sign" bubbles to inspect
    const B = [['ЯАРАЛТАЙ!!!\nБүгд одоо!', 'Яаруулж байна', 520, 300, -6], ['Шалгах цаг\nалга!', 'Шалгахыг хориглож байна', 980, 250, 4], ['Хэн ч чамд хэлэхгүй\nнууц...', 'Эх сурвалж алга', 1420, 320, -3]];
    let left = 3; this.bubbles = [];
    this.dlg.say(['t2'], () => {
      B.forEach(([s, label, x, y, a], i) => {
        const c = this.add.container(x, y).setDepth(600).setScale(0).setAngle(a); const t = txt(this, 0, -6, s, 44, '#c0262d');
        let bw, bh, stamp; const g = this.add.graphics();
        const drawBubble = () => {
          bw = t.width + 90; bh = t.height + 70; g.clear();
          g.fillStyle(COL.ink, 1).fillRoundedRect(-bw / 2, -bh / 2 + 10, bw, bh, 40); g.fillStyle(0xffffff, 1).fillRoundedRect(-bw / 2, -bh / 2, bw, bh, 40);
          g.fillTriangle(-30, bh / 2 - 4, 10, bh / 2 - 4, -46, bh / 2 + 46); g.lineStyle(7, COL.ink).strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, 40);
          g.lineBetween(-30, bh / 2, -46, bh / 2 + 46); g.lineBetween(10, bh / 2, -46, bh / 2 + 46);
          c.setSize(bw, bh); if (c.input) { c.input.hitArea.width = bw; c.input.hitArea.height = bh; }
          if (stamp) stamp.y = y + bh / 2 + 40;
        };
        drawBubble(); t.on('localized', drawBubble);
        c.add([g, t]); c.setSize(bw, bh).setInteractive({ useHandCursor: true });
        this.tweens.add({ targets: c, scale: 1, duration: 420, delay: i * 260, ease: 'Back.Out', onStart: () => SND.sfx('pop', 0.6) });
        this.tweens.add({ targets: c, angle: a + 3, duration: 160, yoyo: true, repeat: -1, delay: i * 90 });
        const lens = this.add.image(x + 120, y + 90, 'lens_ic').setDepth(610).setScale(0.8).setAlpha(0.95);
        this.tweens.add({ targets: lens, x: x + 90, y: y + 60, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
        c.on('pointerdown', () => { if (c.done) return; c.done = true; lens.destroy(); SND.sfx('sparkle', 0.7); this.tweens.killTweensOf(c); c.setAngle(a);
          burst(this, x, y, 20, [0xffe27a, 0xffffff], 700, { sf: 0 });
          const st = stamp = this.add.container(x, y + bh / 2 + 40).setDepth(620).setScale(2).setAlpha(0).setAngle(-8);
          const sg = this.add.graphics(); const lt = txt(this, 0, 0, label, 34, '#ffffff');
          const drawStamp = () => { const lw = lt.width + 50; sg.clear(); sg.fillStyle(0xff6b7a, 1).fillRoundedRect(-lw / 2, -30, lw, 60, 14); sg.lineStyle(6, COL.ink).strokeRoundedRect(-lw / 2, -30, lw, 60, 14); };
          drawStamp(); lt.on('localized', drawStamp);
          st.add([sg, lt]); this.tweens.add({ targets: st, scale: 1, alpha: 1, duration: 260, ease: 'Back.Out' }); SND.sfx('drop', 0.5);
          this.tweens.add({ targets: t, alpha: 0.55, duration: 200 }); this.bubbles.push(st);
          if (--left === 0) this.time.delayedCall(1100, () => { [...this.bubbles, ...this.children.list.filter(o => o.depth === 600)].forEach(o => this.tweens.add({ targets: o, alpha: 0, scale: 0.6, duration: 300, onComplete: () => o.destroy() })); this.step3(); }); });
        this.bubbles.push(c);
      });
      toast(this, 'Анхааруулах үг бүр дээр дар', { y: 120 });
    });
  }
  step3() {
    // the method strip: find → keep → analyse → decide
    const items = [['lens_ic', 'Сэжүүр ол'], ['bag', 'Цүнхэнд хадгал'], ['talk_ic', 'Дүгнэ'], ['check_ic', 'Шийд']]; const objs = [];
    items.forEach(([ic, s], i) => { const x = 420 + i * 360, y = 330; const c = this.add.container(x, y).setDepth(600).setScale(0);
      c.add(paper(this, 0, 0, 290, 250));
      c.add(this.add.image(0, -36, ic).setScale(1.05)); c.add(txt(this, 0, 80, s, 32, COL.inkS));
      if (i < 3) { const ar = txt(this, 180, 0, '➜', 60, '#ffc94a', { stroke: INK, st: 8 }); c.add(ar); }
      this.tweens.add({ targets: c, scale: 1, angle: (i % 2 ? 2 : -2), duration: 380, delay: 200 + i * 260, ease: 'Back.Out', onStart: () => SND.sfx('pop', 0.5) }); objs.push(c); });
    this.dlg.say(['t3'], () => { objs.forEach(o => this.tweens.add({ targets: o, alpha: 0, y: o.y - 40, duration: 300, onComplete: () => o.destroy() })); this.step4(); });
  }
  step4() {
    this.hud = new Hud(this, { demo: true }); this.hud.setTime(90); this.hud.setDark(0.25); this.hud.setLight(G.light); this.hud.root.setDepth(700);
    const focus = (obj, line, next) => { const ring = this.add.image(obj.x, obj.y, 'ring').setScrollFactor(0).setDepth(710).setScale(2.4).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: ring, scale: 2.8, duration: 500, yoyo: true, repeat: -1 }); this.tweens.add({ targets: obj, scale: 1.18, duration: 300, yoyo: true, repeat: 3 });
      this.dlg.say([line], () => { ring.destroy(); next(); }); };
    focus(this.hud.timer, 't4', () => { let k = 0; this.time.addEvent({ delay: 60, repeat: 15, callback: () => this.hud.setTime(90 - (++k)) });
      focus(this.hud.jar, 't5', () => { this.tweens.addCounter({ from: 0.25, to: 0.85, duration: 900, onUpdate: tw => this.hud.setDark(tw.getValue()) });
        this.time.delayedCall(1000, () => { this.hud.setDark(0.1); focus(this.hud.bow, 't6', () => { this.hud.bowAlarm(true); this.time.delayedCall(900, () => this.hud.bowAlarm(false));
          this.dlg.say(['t7'], () => this.finish()); }); }); }); });
  }
  finish() { if (this.done) return; this.done = true; SND.stopVoice(); fadeTo(this, 'Village'); }
}
