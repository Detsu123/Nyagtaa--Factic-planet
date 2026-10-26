// Notebook sorting · decision · consequence · quiz · "Аян үргэлжилнэ..." ending
function notebookBg(scene, title) {
  scene.add.rectangle(GW / 2, GH / 2, GW, GH, 0x3b2d7a);
  for (let i = 0; i < 70; i++) scene.add.image(Math.random() * GW, Math.random() * GH, 'dot').setAlpha(0.15 + Math.random() * 0.3).setScale(0.3 + Math.random() * 0.4);
  const g = scene.add.graphics(); const x = 70, y = 60, w = GW - 140, h = GH - 110;
  g.fillStyle(COL.ink, 1).fillRoundedRect(x, y + 16, w, h, 40); g.fillStyle(0xa8673d, 1).fillRoundedRect(x - 14, y - 10, w + 28, h + 24, 44); g.lineStyle(7, COL.ink).strokeRoundedRect(x - 14, y - 10, w + 28, h + 24, 44);
  g.fillStyle(0xfffaf0, 1).fillRoundedRect(x + 10, y + 6, w - 20, h - 18, 30);
  g.lineStyle(2, 0x9fc3ff, 0.4); for (let ly = y + 150; ly < y + h - 30; ly += 56) g.lineBetween(x + 40, ly, x + w - 40, ly);
  g.lineStyle(3, 0xff9fb0, 0.6).lineBetween(x + 130, y + 10, x + 130, y + h - 16);
  g.lineStyle(6, COL.ink).strokeRoundedRect(x + 10, y + 6, w - 20, h - 18, 30);
  for (let i = 0; i < 16; i++) { const cx = x + 120 + i * ((w - 240) / 15); g.fillStyle(COL.ink, 1).fillCircle(cx, y + 6, 13); g.fillStyle(0xd9d2f2, 1).fillCircle(cx, y + 2, 10); }
  txt(scene, GW / 2, y + 80, title, 56, COL.inkS);
  scene.add.image(x + 70, y + 80, 'lens_ic').setScale(0.7).setAngle(-15);
}

class NotebookScene extends Phaser.Scene {
  constructor() { super('Notebook'); }
  create() {
    SND.bind(this); fadeIn(this); SND.play('m_think', 0.36);
    notebookBg(this, 'Нягтаагийн тэмдэглэл');
    this.dlg = new Dialog(this); this.score = new ScoreChip(this, GW - 260, 140);
    const ids = Object.keys(G.found); this.left = ids.length; this.miss = {};
    // bins
    this.bins = BINS.map((b, i) => { const x = 420 + i * 540, y = 815, w = 500, h = 330;
      const c = this.add.container(x, y); const g = this.add.graphics(); g.fillStyle(COL.ink, 1).fillRoundedRect(-w / 2, -h / 2 + 10, w, h, 30); g.fillStyle(b.col, 0.22).fillRoundedRect(-w / 2, -h / 2, w, h, 30);
      g.fillStyle(0xffffff, 0.7).fillRoundedRect(-w / 2 + 10, -h / 2 + 76, w - 20, h - 86, 22); g.lineStyle(6, COL.ink).strokeRoundedRect(-w / 2, -h / 2, w, h, 30);
      const tab = this.add.graphics(); tab.fillStyle(b.col, 1).fillRoundedRect(-w / 2, -h / 2, w, 70, { tl: 30, tr: 30, bl: 0, br: 0 }); tab.lineStyle(6, COL.ink).strokeRoundedRect(-w / 2, -h / 2, w, 70, { tl: 30, tr: 30, bl: 0, br: 0 });
      c.add([g, tab, txt(this, 0, -h / 2 + 35, b.label, 40, '#ffffff', { stroke: INK, st: 8 }), txt(this, 0, -h / 2 + 100, b.sub, 24, '#6b5fa8', { weight: '800' })]);
      return { ...b, c, x, y, w, h, n: 0 }; });
    if (!ids.length) { txt(this, GW / 2, 330, 'Цүнх хоосон байна...', 46, '#6b5fa8'); this.time.delayedCall(800, () => this.finish()); return; }
    txt(this, GW / 2, 205, 'Сэжүүр бүрийг чирээд зөв хайрцагт хий', 36, '#ff6b7a', { weight: '800' });
    // cards
    const cw = 316, gap = 16; this.cards = [];
    ids.forEach((id, i) => { const row = Math.floor(i / 5), col = i % 5, n = Math.min(5, ids.length - row * 5);
      const x = GW / 2 - (n - 1) * (cw + gap) / 2 + col * (cw + gap), y = 312 + row * 170;
      const c = this.add.container(x, y).setDepth(10 + i); c.add(paper(this, 0, 0, cw, 160, { r: 18, fill: 0xfffdf6 }));
      c.add(txt(this, 0, -52, CLUES[id].title, 28, '#ff6b7a')); c.add(txt(this, 0, 14, CLUES[id].card, 21, COL.inkS, { wrap: 290, weight: '800', ls: 2 }));
      c.setSize(cw, 156).setInteractive({ draggable: true, useHandCursor: true }); c.home = { x, y }; c.id = id; this.cards.push(c); c.setScale(0); c.setAngle((Math.random() - 0.5) * 6);
      this.tweens.add({ targets: c, scale: 1, duration: 300, delay: 80 * i, ease: 'Back.Out' });
      c.on('dragstart', () => { c.setDepth(100); SND.sfx('pick', 0.5); this.tweens.add({ targets: c, scale: 1.08, angle: 0, duration: 120 }); });
      c.on('drag', (p, dx, dy) => { c.x = dx; c.y = dy; this.bins.forEach(b => b.c.setScale(Math.abs(c.x - b.x) < b.w / 2 && Math.abs(c.y - b.y) < b.h / 2 ? 1.04 : 1)); });
      c.on('dragend', () => { this.bins.forEach(b => b.c.setScale(1)); const b = this.bins.find(b => Math.abs(c.x - b.x) < b.w / 2 && Math.abs(c.y - b.y) < b.h / 2); if (b) this.drop(c, b); else this.back(c); }); });
  }
  back(c) { this.tweens.add({ targets: c, x: c.home.x, y: c.home.y, scale: 1, duration: 300, ease: 'Back.Out' }); c.setDepth(10); }
  drop(c, b) {
    const id = c.id, ok = CLUES[id].bin === b.id;
    if (ok || (this.miss[id] || 0) >= 1) { // second miss: Nyagtaa files it correctly and explains
      const tb = ok ? b : this.bins.find(x => x.id === CLUES[id].bin); if (!ok) toast(this, 'Зөв хайрцаг нь: ' + tb.label, { y: 560, fill: 0xffe27a });
      c.disableInteractive(); G.sorted[id] = ok; const slot = tb.n++;
      this.tweens.add({ targets: c, x: tb.x, y: tb.y - 60 + slot * 46, scale: 0.78, angle: (slot % 2 ? 2 : -2), duration: 260, ease: 'Back.Out' }); c.setDepth(20 + slot);
      if (ok) { G.light += 5; this.score.set(G.light); SND.sfx('good', 0.6); floatNum(this, tb.x, tb.y - 160, '+5'); burst(this, tb.x, tb.y - 100, 14, [tb.col, 0xffffff], 500, { r: 140 }); }
      else SND.sfx('drop', 0.5);
      if (--this.left === 0) this.time.delayedCall(800, () => this.finish());
    } else {
      this.miss[id] = 1; G.dark = Math.min(1, G.dark + 0.03); SND.sfx('bad', 0.5); this.tweens.add({ targets: b.c, x: b.x + 12, duration: 50, yoyo: true, repeat: 3 });
      toast(this, { trust: 'Энэ хүн газар дээр нь байсан шууд гэрч шүү.', sus: 'Энэ нь яаруулсан, тодорхойгүй эсвэл дуурайсан зүйл.', irr: 'Энэ нь баавгай байгааг нотлохгүй.' }[CLUES[id].bin], { y: 560, hold: 2200 });
      this.back(c);
    }
  }
  finish() { const f = G.found; const lines = (f.c1 || f.c4 || f.c2) ? ['a1', 'a2'] : ['a0']; this.dlg.say(lines, () => fadeTo(this, 'Decision')); }
}

class DecisionScene extends Phaser.Scene {
  constructor() { super('Decision'); }
  create() {
    SND.bind(this); fadeIn(this); SND.play('m_think', 0.28);
    const w = new World25(this, 'village'); this.cameras.main.scrollX = 120; new Actor(w, 'dad', -4.3, 0.7, { dir: 0 }).wobble = 2; new Actor(w, 'nyagtaa', 0.6, 2.6, { dir: 7 });
    this.add.rectangle(GW / 2, GH / 2, GW, GH, 0x140c2e, 0.55).setScrollFactor(0).setDepth(5000);
    const c = this.add.container(GW / 2, 340).setScrollFactor(0).setDepth(6000);
    c.add(paper(this, 0, 0, 1180, 300, { tape: 0xff9fb0, tape2: 0x9fe8c8 }));
    c.add(txt(this, 0, -60, 'Аав Батаагийн хэлсэн мэдээ...', 64, COL.inkS));
    c.add(txt(this, 0, 40, '"Ойгоос аварга баавгай тосгон руу ирж байна!"', 38, '#6b5fa8', { weight: '800' }));
    c.setScale(0.6).setAlpha(0); this.tweens.add({ targets: c, scale: 1, alpha: 1, duration: 500, ease: 'Back.Out' });
    // evidence chips
    const chips = Object.keys(G.found).filter(id => !CLUES[id].trap).slice(0, 6);
    chips.forEach((id, i) => { const x = GW / 2 - (chips.length - 1) * 150 + i * 300, y = 560; const t = txt(this, x, y, CLUES[id].title, 26, '#ffffff', { stroke: INK, st: 7 }).setScrollFactor(0).setDepth(6000);
      t.setAlpha(0); this.tweens.add({ targets: t, alpha: 1, y: y - 10, delay: 500 + i * 120, duration: 300 }); });
    const yes = button(this, GW / 2 - 300, 800, 'ҮНЭН', () => this.pick(false), { w: 460, h: 150, size: 80, fill: 0xff8a8a }).setScrollFactor(0).setDepth(6000);
    const no = button(this, GW / 2 + 300, 800, 'ХУДАЛ', () => this.pick(true), { w: 460, h: 150, size: 80, fill: 0x8fd3ff }).setScrollFactor(0).setDepth(6000);
    [yes, no].forEach((b, i) => { b.setScale(0); this.tweens.add({ targets: b, scale: 1, delay: 700 + i * 150, duration: 400, ease: 'Back.Out' }); });
    txt(this, GW / 2, 960, 'Бодоод сонго. Сэтгэл хөдлөл биш, нотолгоо шийднэ.', 32, '#fff8ee', { weight: '800' }).setScrollFactor(0).setDepth(6000);
  }
  pick(correct) {
    if (this.picked) return; this.picked = true; SND.play(null); SND.sfx('tick', 0.6);
    const flash = this.add.rectangle(GW / 2, GH / 2, GW, GH, correct ? 0xfff2c0 : 0x2a0f4a, 0).setScrollFactor(0).setDepth(9000);
    this.tweens.add({ targets: flash, fillAlpha: 1, duration: 700, delay: 300 });
    this.time.delayedCall(1100, () => {
      if (correct) { const bonus = 100 + 2 * Math.ceil(G.time); G.lastBonus = bonus; G.light += bonus;
        VIDEO.play('assets/vid/dad.mp4', () => this.scene.start('Result', { ok: true })); }
      else { G.attempts++; G.dark = 1; VIDEO.play('assets/vid/dark.mp4', () => this.scene.start('Result', { ok: false })); }
    });
  }
}

class ResultScene extends Phaser.Scene {
  constructor() { super('Result'); }
  init(d) { this.ok = d.ok; }
  create() {
    SND.bind(this); fadeIn(this); this.dlg = new Dialog(this);
    if (this.ok) {
      SND.play('m_end', 0.4); const w = new World25(this, 'village'); this.cameras.main.scrollX = 240;
      const dad = new Actor(w, 'dad', -1.9, 3.4, { dir: 1, bounce: 3 }), ny = new Actor(w, 'nyagtaa', 1.3, 3.8, { dir: 7, bounce: 3.4 }); this.w = w;
      this.add.rectangle(GW / 2, GH / 2, GW, GH, 0x140c2e, 0.35).setScrollFactor(0).setDepth(5000);
      const c = this.add.container(GW / 2, 330).setScrollFactor(0).setDepth(6000); c.add(paper(this, 0, 0, 900, 470, { tape: 0xffd36a, tape2: 0x9fe8c8 }));
      c.add(txt(this, 0, -170, 'Зөв! Мэдээ худал байлаа.', 56, '#2f9e6f'));
      const rows = [['Зөв шийдвэр', '+100'], [`Үлдсэн ${Math.ceil(G.time)} сек × 2`, '+' + (G.lastBonus - 100)], ['Нийт гэрэл', String(G.light)]];
      rows.forEach(([a, b], i) => { const y = -60 + i * 90; c.add(txt(this, -360, y, a, 40, COL.inkS, { ox: 0, weight: '800' })); c.add(txt(this, 360, y, b, 46, i === 2 ? '#ff9d2e' : '#2f9e6f', { ox: 1 })); });
      c.setScale(0.5).setAlpha(0); this.tweens.add({ targets: c, scale: 1, alpha: 1, duration: 500, ease: 'Back.Out' }); SND.sfx('fanfare', 0.7);
      this.time.addEvent({ delay: 280, repeat: 12, callback: () => burst(this, 300 + Math.random() * (GW - 600), 200 + Math.random() * 500, 20, [0xffe27a, 0xff9fb0, 0x9fe8c8, 0xb9a4ff], 7000, { sf: 0, r: 200, blend: Phaser.BlendModes.NORMAL }) });
      this.time.delayedCall(1200, () => this.dlg.say(['r1'], () => button(this, GW / 2, 900, 'Асуултууд руу', () => fadeTo(this, 'Quiz'), { w: 460, h: 110, size: 44, fill: 0xffc94a }).setScrollFactor(0).setDepth(6000)));
    } else {
      SND.play('m_dark', 0.4); notebookBg(this, 'Юу буруу байсан бэ?');
      const facts = [['ic', 'Аав баавгайг хаана харснаа хэлж чадаагүй.'], ['ic', 'Дурдсан анчин нь өөрөө үгүйсгэсэн.'], ['ic', 'Цаасны тамга НАРЛААГ гэж дуурайлал байсан.'], ['ic', 'Газрын мөр нь морины туурайных байсан.']];
      facts.forEach(([, s], i) => { const y = 300 + i * 130; const t = this.add.container(GW / 2, y); t.add(paper(this, 0, 0, 1200, 104, { r: 22, fill: 0xfffdf6 })); t.add(this.add.image(-540, 0, 'lens_ic').setScale(0.55)); t.add(txt(this, -480, 0, s, 38, COL.inkS, { ox: 0, weight: '800' }));
        t.setAlpha(0).setX(GW / 2 - 60); this.tweens.add({ targets: t, alpha: 1, x: GW / 2, delay: 300 + i * 350, duration: 400, ease: 'Back.Out', onStart: () => SND.sfx('page', 0.4) }); });
      txt(this, GW / 2, 840, 'Шийтгэл биш, сурах боломж!', 50, '#ff6b7a').setAlpha(0);
      this.tweens.add({ targets: this.children.list[this.children.list.length - 1], alpha: 1, delay: 1900, duration: 400 });
      this.time.delayedCall(2300, () => this.dlg.say(['w1'], () => button(this, GW / 2, 950, 'Дахин оролдох', () => { G.dark = 0.15; G.light = Math.max(G.lightAtStart, G.light); fadeTo(this, 'Investigate', { fresh: true }); }, { w: 480, h: 110, size: 44, fill: 0xffc94a })));
    }
  }
  update(t, dt) { if (this.w) this.w.update(t / 1000, dt / 1000); }
}

class QuizScene extends Phaser.Scene {
  constructor() { super('Quiz'); }
  create() { SND.bind(this); fadeIn(this); SND.play('m_quiz', 0.34); this.i = 0;
    const w = new World25(this, 'village', { blur: 1.2 }); this.cameras.main.scrollX = 240;
    this.add.rectangle(GW / 2, GH / 2, GW, GH, 0x140c2e, 0.45).setScrollFactor(0);
    this.score = new ScoreChip(this); this.ask(); }
  ask() {
    if (this.box) this.box.destroy(); const q = QUIZ[this.i]; const c = this.box = this.add.container(0, 0).setScrollFactor(0).setDepth(100);
    c.add(paper(this, GW / 2 + 120, GH / 2 + 10, 1380, 880, { lines: 56, tape: 0xff9fb0, tape2: 0x9fe8c8 }));
    const pt = this.add.image(270, GH - 40, 'pt_nyagtaa_curious').setOrigin(0.5, 1); pt.setScale(520 / pt.height); c.add(pt); this.pt = pt;
    c.add(txt(this, GW / 2 + 120, 150, `Асуулт ${this.i + 1} / ${QUIZ.length}`, 34, '#ff6b7a'));
    c.add(txt(this, GW / 2 + 120, 250, q.q, 44, COL.inkS, { wrap: 1160 }));
    this.btns = q.a.map((a, k) => { const b = button(this, GW / 2 + 120, 430 + k * 140, `${'АБВ'[k]})  ${a}`, () => this.answer(k), { w: 1160, h: 112, size: a.length > 50 ? 28 : 34, fill: 0xfff8ee }); c.add(b); return b; });
    c.setAlpha(0); this.tweens.add({ targets: c, alpha: 1, duration: 300 });
  }
  answer(k) {
    if (this.answered === this.i) return; this.answered = this.i; const q = QUIZ[this.i], ok = k === q.ok;
    this.btns.forEach((b, j) => { b.disableInteractive(); if (j === q.ok) { b.setScale(1.03); b.label.setColor('#1f7a54'); } else if (j === k) b.setAlpha(0.6); });
    const good = this.btns[q.ok]; const mark = this.add.image(good.x + 540, good.y, ok ? 'check_ic' : 'check_ic').setScale(0).setScrollFactor(0).setDepth(200); this.tweens.add({ targets: mark, scale: 0.8, duration: 300, ease: 'Back.Out' }); this.box.add(mark);
    if (ok) { G.quiz++; G.light += 20; this.score.set(G.light); SND.sfx('good', 0.7); burst(this, good.x, good.y, 20, [0xffe27a, 0x9ff5cf], 300, { sf: 0, r: 200 }); this.pt.setTexture('pt_nyagtaa_excited'); }
    else { SND.sfx('bad', 0.6); this.tweens.add({ targets: this.btns[k], x: this.btns[k].x + 14, duration: 50, yoyo: true, repeat: 3 }); this.pt.setTexture('pt_nyagtaa_thinking'); }
    this.pt.setScale(520 / this.pt.height);
    const y = 430 + q.a.length * 140 - 10; const ex = txt(this, GW / 2 + 120, y + 20, (ok ? 'Зөв! ' : 'Зөв хариулт: ' + 'АБВ'[q.ok] + '. ') + q.why, 30, ok ? '#1f7a54' : '#b8323f', { wrap: 1160, weight: '800' }); this.box.add(ex);
    const nb = button(this, GW / 2 + 120, 960, this.i < QUIZ.length - 1 ? 'Дараагийн асуулт' : 'Үргэлжлүүлэх', () => { this.i++; if (this.i < QUIZ.length) this.ask(); else fadeTo(this, 'Ending'); }, { w: 480, h: 96, size: 38, fill: 0xffc94a }); this.box.add(nb);
  }
}

class EndingScene extends Phaser.Scene {
  constructor() { super('Ending'); }
  create() {
    SND.bind(this); fadeIn(this, 1200); SND.play('m_end', 0.42); this.dlg = new Dialog(this);
    const w = this.w = new World25(this, 'village_sunset'); this.cameras.main.scrollX = 240;
    const cast = [['nyagtaa', 0.6, 2.4, 0], ['dad', -1.8, 1.4, 1], ['mom', 2.8, 1.2, 7], ['tumur', -3.6, 2.6, 1], ['suvd', 4.4, 2.8, 7], ['hunter', -4.6, 0.2, 1], ['wood1', 5.4, 0.0, 7], ['wood2', -0.6, -0.4, 0]];
    this.cast = cast.map(([c, x, z, d], i) => new Actor(w, c, x, z, { dir: d, bounce: 3 + (i % 3) * 0.6 }));
    this.leafFx = leaves(this, 22);
    this.time.addEvent({ delay: 700, repeat: 10, callback: () => burst(this, 300 + Math.random() * 1800, 150 + Math.random() * 300, 16, [0xffe27a, 0xff9fb0, 0xffb84a], 5000, { r: 200 }) });
    this.time.delayedCall(1500, () => this.dlg.say(['e1'], () => this.board()));
  }
  board() {
    // the echo board shows a new suspicious post… and a familiar shadow smiles
    this.cast.forEach(a => { a.bounce = 0; a.faceTo(-6.6, -1.2); });
    this.cameras.main.pan(GW / 2, GH / 2, 1200, 'Sine.easeInOut'); SND.play('m_dark', 0.3);
    this.time.delayedCall(1300, () => {
      const c = this.add.container(GW / 2, GH / 2).setScrollFactor(0).setDepth(8000); c.add(this.add.rectangle(0, 0, GW, GH, 0x140c2e, 0.6));
      const bg = this.add.graphics(); bg.fillStyle(COL.ink, 1).fillRoundedRect(-500, -320 + 14, 1000, 640, 30); bg.fillStyle(0xc8935f, 1).fillRoundedRect(-500, -320, 1000, 640, 30); bg.lineStyle(8, COL.ink).strokeRoundedRect(-500, -320, 1000, 640, 30); c.add(bg);
      c.add(txt(this, 0, -270, 'ЦУУРАЙ САМБАР', 40, '#5a3a22'));
      const post = this.add.container(40, 30).setAngle(-3); post.add(paper(this, 0, 0, 620, 420, { r: 10, fill: 0xfff6df, sy: 6 }));
      post.add(txt(this, 0, -120, 'ШУУРХАЙ!!!', 70, '#c0262d')); post.add(txt(this, 0, -10, 'Маргааш нар мөнхөд унтарна!!!', 40, '#3a2a1a', { wrap: 560 })); post.add(txt(this, 0, 90, 'Хүн бүрт яаралтай түгээ!!!', 34, '#c0262d'));
      post.add(this.add.circle(0, -200, 14, 0xe04a5a)); c.add(post);
      const kh = this.add.image(380, 220, 'pt_khuurmag_evillaugh').setScale(0.55).setTint(0x2a1a50).setAlpha(0); c.add(kh);
      c.setAlpha(0); this.tweens.add({ targets: c, alpha: 1, duration: 500 }); this.tweens.add({ targets: kh, alpha: 0.85, x: 330, duration: 1600, delay: 900, ease: 'Sine.Out' });
      this.time.delayedCall(1100, () => SND.sfx('rumble', 0.5));
      this.time.delayedCall(2600, () => this.dlg.say(['e2'], () => { this.tweens.add({ targets: c, alpha: 0, duration: 500, onComplete: () => c.destroy() }); this.final(); }));
    });
  }
  final() {
    SND.play('m_end', 0.42); SND.sfx('fanfare', 0.7);
    const c = this.add.container(0, 0).setScrollFactor(0).setDepth(8500); c.add(this.add.rectangle(GW / 2, GH / 2, GW, GH, 0x140c2e, 0.55));
    c.add(txt(this, GW / 2, 110, 'Аян үргэлжилнэ...', 90, '#fff8ee', { stroke: INK, st: 16, shadow: 10 }));
    // badge
    const b = this.add.container(470, 520); const g = this.add.graphics(); g.fillStyle(0xff6b7a, 1).fillTriangle(-80, 60, -20, 60, -70, 250).fillTriangle(80, 60, 20, 60, 70, 250); g.lineStyle(6, COL.ink).strokeTriangle(-80, 60, -20, 60, -70, 250).strokeTriangle(80, 60, 20, 60, 70, 250);
    g.fillStyle(COL.ink, 1).fillCircle(0, 12, 170); g.fillStyle(0xffc94a, 1).fillCircle(0, 0, 170); g.lineStyle(8, COL.ink).strokeCircle(0, 0, 170); g.fillStyle(0xffe27a, 1).fillCircle(0, 0, 130); g.lineStyle(4, 0xffb84a).strokeCircle(0, 0, 130);
    b.add([g, this.add.image(0, -20, 'pt_nyagtaa_wink').setScale(0.42), txt(this, 0, 110, 'Факт гаригийн', 26, COL.inkS), txt(this, 0, 140, 'НЯГТАА', 34, '#c0262d')]);
    b.setScale(0).setAngle(-20); c.add(b); this.tweens.add({ targets: b, scale: 1, angle: -4, duration: 700, ease: 'Back.Out', delay: 300 });
    c.add(txt(this, 470, 860, `Гэрлийн оноо: ${G.light}`, 50, '#ffe27a', { stroke: INK, st: 12 }));
    // seven methods
    c.add(paper(this, 1300, 560, 960, 700, { lines: 60, tape: 0x9fe8c8 })); c.add(txt(this, 1300, 270, 'Нягтлах 7 арга', 46, COL.inkS));
    const used = new Set(Object.keys(G.found).map(id => CLUES[id].n));
    SEVEN.forEach((s, i) => { const y = 350 + i * 66; c.add(this.add.image(880, y, used.has(i + 1) ? 'check_ic' : 'lens_ic').setScale(0.4)); c.add(txt(this, 925, y, `${i + 1}. ${s}`, 32, COL.inkS, { ox: 0, weight: '800' })); });
    c.add(txt(this, 1300, 840, '#7нягталж1түгээ', 40, '#ff6b7a'));
    c.add(button(this, 1060, 980, 'FactCheck.mn', () => openLink('https://factcheck.mn'), { w: 380, h: 96, size: 38, fill: 0x8fd3ff }));
    c.add(button(this, 1500, 980, 'Дахин тоглох', () => { SND.play(null); fadeTo(this, 'Title'); }, { w: 380, h: 96, size: 38, fill: 0xffc94a }));
    c.setAlpha(0); this.tweens.add({ targets: c, alpha: 1, duration: 600 });
    this.cast.forEach((a, i) => { a.bounce = 3 + (i % 3) * 0.7; a.face(0); });
  }
  update(t, dt) { t /= 1000; dt /= 1000; this.w.update(t, dt); this.leafFx(t, dt); }
}
function openLink(url) { const a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove(); }
