const { test } = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');

class Node {
  constructor(dataset = {}) { this.dataset = dataset; this.attributes = {}; this.events = {}; this.textContent = ''; }
  setAttribute(key, value) { this.attributes[key] = value; }
  addEventListener(key, fn) { this.events[key] = fn; }
}
class GameObject extends EventEmitter {
  constructor() { super(); this.list = []; this.visible = true; this.active = true; this.texture = { key: '' }; this.size = 40; }
  setText(value) { this.text = String(value); this.width = this.text.length * this.size * 0.6; this.height = this.size; return this; }
  setFontSize(value) { this.size = value; this.width = this.text.length * value * 0.6; this.height = value; return this; }
  setVisible(value) { this.visible = value; return this; }
  setTexture(key) { this.texture.key = key; return this; }
  add(objects) { this.list.push(...(Array.isArray(objects) ? objects : [objects])); return this; }
  addHandler() {}
  destroy() { this.emit('destroy'); this.active = false; this.list.forEach(o => o.destroy()); }
}
for (const method of ['setDepth', 'setScrollFactor', 'setOrigin', 'setInteractive', 'setAngle', 'setFontStyle',
  'setShadow', 'setScale', 'setAlpha', 'setFlipX', 'clear', 'fillStyle', 'fillRoundedRect', 'lineStyle',
  'strokeRoundedRect', 'lineBetween']) GameObject.prototype[method] = function () { return this; };

function setup(saved = 'mn', blocked = false) {
  const stored = new Map([['nyagtaa_language', saved]]);
  const buttons = ['mn', 'en'].map(language => new Node({ language }));
  const controls = new Node(); controls.querySelectorAll = () => buttons;
  const nodes = ['Хэл', 'Ачаалж байна…', 'Алгасах ▸▸', 'Утсаа хэвтээ болгоод тоглоорой'].map(i18n => new Node({ i18n }));
  const document = { documentElement: {}, title: '', getElementById: () => controls, querySelectorAll: () => nodes };
  const ctx = vm.createContext({ console, document, location: { search: '' },
    localStorage: {
      getItem(key) { if (blocked) throw Error('blocked'); return stored.get(key); },
      setItem(key, value) { if (blocked) throw Error('blocked'); stored.set(key, value); },
    },
    Phaser: { GameObjects: { Container: GameObject }, Scene: class {},
      Display: { Color: { HexStringToColor: () => ({ color: 0 }) } } },
  });
  const run = code => vm.runInContext(code, ctx);
  for (const file of ['data.js', 'i18n.js', 'core.js', 'scenes_menu.js', 'scenes_investigate.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, 'js', file), 'utf8'), ctx, { filename: file });
  }
  return { ctx, run, stored, buttons, controls, nodes, document, i18n: run('I18N') };
}

test('language buttons update DOM, persist the choice and isolate keyboard input', () => {
  const { i18n, buttons, controls, document, nodes, stored } = setup();
  let stopped = 0;
  buttons[1].events.click({ stopPropagation() { stopped++; } });
  controls.events.keydown({ stopPropagation() { stopped++; } });
  controls.events.keyup({ stopPropagation() { stopped++; } });
  assert.equal(stopped, 3);
  assert.equal(i18n.lang, 'en');
  assert.equal(document.documentElement.lang, 'en');
  assert.equal(document.title, 'Nyagtaa: Journey to Planet Fact');
  assert.equal(nodes[2].textContent, 'Skip ▸▸');
  assert.equal(buttons[1].attributes['aria-pressed'], 'true');
  assert.equal(buttons[0].attributes['aria-pressed'], 'false');
  assert.equal(stored.get('nyagtaa_language'), 'en');
  assert.equal(setup(stored.get('nyagtaa_language')).document.documentElement.lang, 'en');
  assert.equal(i18n.set('fr'), false);
  assert.equal(i18n.lang, 'en');
});

test('Mongolian is the fallback and disabled storage does not prevent switching', () => {
  assert.equal(setup('invalid').i18n.lang, 'mn');
  const { i18n, document } = setup('en', true);
  assert.equal(i18n.lang, 'mn');
  assert.equal(i18n.set('en'), true);
  assert.equal(document.documentElement.lang, 'en');
});

test('all dialogue, character names, clues, categories, methods and quiz data have English text', () => {
  const { i18n, run } = setup('en');
  const lines = run('Object.values(L)');
  assert.equal(lines.length, 42);
  for (const line of lines) assert.equal(i18n.text(line.mn), line.en);
  const sources = run(`[
    ...Object.values(WHO).map(x => x.name).filter(Boolean),
    ...Object.values(CLUES).flatMap(x => [x.title, x.ask, x.card, x.method]),
    ...BINS.flatMap(x => [x.label, x.sub]), ...SEVEN,
    ...QUIZ.flatMap(x => [x.q, ...x.a, x.why]),
    ...Object.values(ZOOM_TARGET).map(x => x[3])
  ]`);
  for (const source of sources) {
    assert.notEqual(i18n.text(source), source, source);
    assert.doesNotMatch(i18n.text(source), /[А-Яа-яЁёӨөҮү]/, source);
  }
});

test('dynamic labels preserve numbers, clue meanings and English quiz answer letters', () => {
  const { i18n, run } = setup('en');
  assert.equal(i18n.text('Түлээ 4 / 6'), 'Firewood 4 / 6');
  assert.equal(i18n.text('−15 сек'), '−15 sec');
  assert.equal(i18n.text('−20с'), '−20s');
  assert.equal(i18n.text('Үлдсэн 42 сек × 2'), '42 sec left × 2');
  assert.equal(i18n.text('Гэрлийн оноо: 185'), 'Light score: 185');
  assert.equal(i18n.text('Асуулт 2 / 3'), 'Question 2 / 3');
  assert.equal(i18n.text('Б)  Үзэл бодол'), 'B)  Opinion');
  assert.equal(i18n.text('✓  Модчдоос асуух'), '✓  Ask the woodcutters');
  assert.equal(i18n.text('Зөв хайрцаг нь: Сэжигтэй'), 'Correct box: Suspicious');
  assert.match(i18n.text('Үлдсэн цаг: 42 сек. Үлдсэн секунд бүр +2 гэрэл.'), /42 sec.*\+2 light/);
  const why = run('QUIZ[1].why');
  assert.equal(i18n.text('Зөв хариулт: Б. ' + why), 'Correct answer: B. ' + i18n.text(why));
  assert.equal(i18n.text('Зөв! ' + why), 'Correct! ' + i18n.text(why));
  assert.equal(i18n.text('1. ' + run('SEVEN[0]')), '1. Check the source: who, where, when?');
});

test('static UI strings throughout every scene have English translations', () => {
  const { i18n } = setup('en');
  const fragments = new Set(['Зөв! ', 'Зөв хариулт: ', 'Зөв хайрцаг нь: ', 'АБВ']);
  const tokens = /\/\/[^\n]*|\/\*[\s\S]*?\*\/|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`/g;
  for (const file of ['core.js', 'scenes_menu.js', 'scenes_village.js', 'scenes_investigate.js', 'scenes_end.js', 'world.js']) {
    const source = fs.readFileSync(path.join(root, 'js', file), 'utf8');
    for (const [token] of source.matchAll(tokens)) {
      if (token.startsWith('/') || token.includes('${')) continue;
      const value = vm.runInNewContext(token);
      if (!/[А-Яа-яЁёӨөҮү]/.test(value) || fragments.has(value)) continue;
      assert.doesNotMatch(i18n.text(value), /[А-Яа-яЁёӨөҮү]/, `${file}: ${value}`);
    }
  }
});

test('live text keeps its latest value and releases its language listener when destroyed', () => {
  const { i18n } = setup();
  const t = new GameObject().setText('Тоглох');
  i18n.bindText(t, 'Тоглох', { size: 40, maxWidth: 100 });
  i18n.set('en'); assert.equal(t.text, 'Play'); assert.ok(t.width <= 100);
  t.setText('Дахин тоглох'); assert.equal(t.text, 'Play again'); assert.ok(t.width <= 100);
  i18n.set('mn'); assert.equal(t.text, 'Дахин тоглох');
  t.destroy(); assert.equal(i18n.listeners.size, 0);
});

test('switching mid-dialogue keeps the current line, queue, callback and game state', () => {
  const { i18n, run, ctx } = setup();
  const scene = { add: {}, tweens: { add() {} }, textures: { exists: () => false },
    events: new EventEmitter(), input: { keyboard: null },
    time: { addEvent(config) { return { ...config, remove() { this.removed = true; } }; } },
  };
  for (const name of ['container','rectangle','image','graphics']) scene.add[name] = () => new GameObject();
  scene.add.text = (x, y, text) => new GameObject().setText(text);
  ctx.testScene = scene;
  const dialog = run('new Dialog(testScene)');
  run('G.found = { c4: true }; G.time = 43; G.light = 80; G.quiz = 1;');
  const before = run('JSON.stringify(G)');
  let finished = 0;
  dialog.say(['t1', 'c1a'], () => finished++);
  const timer = dialog.tm; timer.callback();
  assert.equal(dialog.body.text.length, 1);
  i18n.set('en');
  assert.equal(dialog.body.text, run('L.t1.en'));
  assert.equal(dialog.cur.id, 't1');
  assert.equal(dialog.q.length, 1);
  assert.equal(timer.removed, true);
  assert.equal(finished, 0);
  assert.equal(run('JSON.stringify(G)'), before);
  dialog.tap();
  assert.equal(dialog.cur.id, 'c1a');
  assert.equal(dialog.tagT.text, 'Dad Bataa');
  i18n.set('mn');
  assert.equal(dialog.body.text, run('L.c1a.mn'));
  assert.equal(dialog.tagT.text, 'Аав Батаа');
  dialog.tap(); assert.equal(finished, 1);
  scene.events.emit('shutdown'); dialog.root.destroy();
  assert.equal(i18n.listeners.size, 0);
});

test('Tumur uses the main portrait when an expression is unavailable and hides it if neither loads', () => {
  for (const mainAvailable of [true, false]) {
    const { ctx, run } = setup();
    const scene = { add: {}, tweens: { add() {} },
      textures: { exists: key => mainAvailable && key === 'pt_gamer_main' },
      events: new EventEmitter(), input: { keyboard: null },
      time: { addEvent(config) { return { ...config, remove() {} }; } },
    };
    for (const name of ['container', 'rectangle', 'image', 'graphics']) scene.add[name] = () => Object.assign(new GameObject(), { height: 430 });
    scene.add.text = (x, y, text) => new GameObject().setText(text);
    ctx.testScene = scene;
    const dialog = run('new Dialog(testScene)');
    dialog.say(['k1']);
    assert.equal(dialog.cur.who, 'tumur');
    assert.equal(dialog.portrait.visible, mainAvailable);
    if (mainAvailable) assert.equal(dialog.portrait.texture.key, 'pt_gamer_main');
    assert.equal(dialog.full, run('L.k1.mn'));
  }
});

test('cached magnifier artwork redraws its text in place after language changes', () => {
  const { run, ctx, i18n } = setup();
  const textures = new Map();
  const scene = { textures: {
    exists: key => textures.has(key), get: key => textures.get(key), remove: key => textures.delete(key),
    createCanvas(key) {
      const texts = [];
      const canvas = new Proxy({}, { get(target, name) {
        if (name === 'fillText') return text => texts.push(text);
        if (name === 'clearRect') return () => { texts.length = 0; };
        if (name === 'createLinearGradient') return () => ({ addColorStop() {} });
        return name in target ? target[name] : () => {};
      } });
      const texture = { texts, updates: 0, getContext: () => canvas, refresh() { this.updates++; } };
      textures.set(key, texture); return texture;
    },
  } };
  ctx.testScene = scene; run("drawZoom(testScene, 'c2')");
  const texture = textures.get('zv_c2_d');
  assert.ok(texture.texts.includes('НАРЛААГ'));
  i18n.set('en');
  assert.equal(textures.get('zv_c2_d'), texture);
  assert.ok(texture.texts.includes('NARLAAG'));
  assert.ok(texture.texts.includes('NARLAG'));
  assert.ok(texture.texts.includes('Official stamp'));
  i18n.set('mn'); assert.ok(texture.texts.includes('Жинхэнэ тамга'));
});
