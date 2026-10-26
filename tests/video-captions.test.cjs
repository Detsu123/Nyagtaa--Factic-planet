const { test } = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');

class Element extends EventEmitter {
  constructor() {
    super(); this.style = {}; this.dataset = {}; this.children = []; this.textContent = ''; this.hidden = false;
    this.classes = new Set(); this.classList = { add: x => this.classes.add(x), remove: x => this.classes.delete(x) };
  }
  addEventListener(type, fn) { this.on(type, fn); }
  removeEventListener(type, fn) { this.off(type, fn); }
  setAttribute(key, value) { this[key] = value; }
  removeAttribute(key) { delete this[key]; }
  querySelector() { return this.children[0]; }
  querySelectorAll() { return this.children; }
  appendChild(child) { child.parent = this; this.children.push(child); }
  remove() { this.parent.children = this.parent.children.filter(x => x !== this); }
  get clientWidth() { return parseFloat(this.style.width) || 1280; }
}

function setup({ lang = 'en', frameAPI = true } = {}) {
  const frames = new Map(), timers = new Map(), observers = [];
  let nextID = 0;
  const schedule = fn => { frames.set(++nextID, fn); return nextID; };
  const video = new Element();
  Object.assign(video, { clientHeight: 720, videoWidth: 1280, videoHeight: 720, currentTime: 0, playCalls: 0,
    play() { this.playCalls++; return Promise.resolve(); }, pause() {}, load() {},
  });
  if (frameAPI) {
    video.requestVideoFrameCallback = schedule;
    video.cancelVideoFrameCallback = id => frames.delete(id);
  }
  const label = new Element(); label.scrollHeight = 0; label.scrollWidth = 0;
  const panel = new Element(); panel.hidden = true; panel.appendChild(label);
  const wrap = new Element(), skip = new Element(), controls = new Element();
  controls.appendChild(Object.assign(new Element(), { dataset: { language: 'mn' } }));
  controls.appendChild(Object.assign(new Element(), { dataset: { language: 'en' } }));
  const nodes = { vid: wrap, vv: video, skip, 'video-caption': panel, 'language-controls': controls };
  const window = new Element();
  class ResizeObserver {
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe() { this.active = true; }
    disconnect() { this.active = false; }
  }
  class Container { addHandler() {} setScrollFactor() {} }
  const ctx = vm.createContext({ console: { warn() {} }, window, ResizeObserver, location: { search: '' },
    document: { documentElement: {}, getElementById: id => nodes[id], querySelectorAll: () => [], createElement: () => new Element() },
    localStorage: { getItem: key => key === 'nyagtaa_language' ? lang : null, setItem() {} },
    Phaser: { GameObjects: { Container } },
    requestAnimationFrame: schedule, cancelAnimationFrame: id => frames.delete(id),
    setTimeout: fn => { timers.set(++nextID, fn); return nextID; }, clearTimeout: id => timers.delete(id),
  });
  for (const file of ['data.js', 'i18n.js', 'video-captions.js', 'core.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, 'js', file), 'utf8'), ctx, { filename: file });
  }
  const run = source => vm.runInContext(source, ctx);
  return { run, video, panel, label, wrap, skip, window, frames, timers, observers,
    captions: run('VideoCaptions'), player: run('VIDEO'), i18n: run('I18N'),
    frame(time) {
      video.currentTime = time;
      const pending = [...frames]; frames.clear();
      pending.forEach(([, callback]) => callback(0, frameAPI ? { mediaTime: time } : undefined));
    },
  };
}

test('every film used by the game has ordered English cues within its duration', () => {
  const { captions, run } = setup();
  const durations = { 'intro.mp4': 64.017, 'alarm.mp4': 29.001, 'dad.mp4': 40.008, 'dark.mp4': 30.511 };
  const used = new Set();
  for (const file of ['scenes_menu.js', 'scenes_village.js', 'scenes_end.js']) {
    const source = fs.readFileSync(path.join(root, 'js', file), 'utf8');
    for (const match of source.matchAll(/VIDEO\.play\('assets\/vid\/([^']+)'/g)) used.add(match[1]);
  }
  assert.deepEqual([...used].sort(), Object.keys(durations).sort());
  assert.equal(Object.values(run('VIDEO_CAPTIONS')).flat().length, 25);
  for (const name of used) {
    let previousEnd = 0;
    for (const [start, end, lines, text] of captions.track(`assets/vid/${name}?v=2#test`)) {
      assert.ok(start >= previousEnd && end > start && end <= durations[name], `${name} at ${start}`);
      assert.ok(lines >= 1 && lines <= 3);
      assert.doesNotMatch(text, /[А-Яа-яЁёӨөҮү]/);
      assert.ok(text.length > 10);
      previousEnd = end;
    }
  }
  assert.equal(captions.track('missing.mp4').length, 0);
});

test('the reported bear warning translates immediately without restarting the film or changing game state', () => {
  const s = setup({ lang: 'mn' });
  s.player.play('assets/vid/alarm.mp4'); s.frame(4);
  assert.equal(s.panel.hidden, true);
  const before = s.run('JSON.stringify(G)');
  s.i18n.set('en');
  assert.equal(s.panel.hidden, false);
  assert.match(s.label.textContent, /A giant bear is coming from the forest/);
  assert.equal(s.video.currentTime, 4);
  assert.equal(s.video.playCalls, 1);
  assert.equal(s.run('JSON.stringify(G)'), before);
  s.i18n.set('mn'); assert.equal(s.panel.hidden, true); assert.equal(s.label.textContent, '');
  s.i18n.set('en'); s.frame(18); assert.equal(s.panel.hidden, true);
  s.frame(20); assert.match(s.label.textContent, /Check seven times, share once/);
  s.player.stop();
});

test('captions follow seeks, frame timestamps and fallback animation frames, including empty gaps', () => {
  for (const frameAPI of [true, false]) {
    const s = setup({ frameAPI }); s.player.play('assets/vid/dad.mp4');
    s.frame(4); assert.match(s.label.textContent, /Light of truth/);
    s.frame(8); assert.equal(s.panel.hidden, true);
    s.video.currentTime = 24; s.video.emit('seeked'); assert.match(s.label.textContent, /what happened/);
    s.video.currentTime = 4; s.video.emit('seeking'); assert.match(s.label.textContent, /Light of truth/);
    s.frame(39); assert.equal(s.panel.hidden, true);
    s.player.stop(); assert.equal(s.frames.size, 0);
  }
});

test('mask stays on the letterboxed film across wide, tall and mobile viewports', () => {
  const s = setup(); s.player.play('assets/vid/alarm.mp4'); s.frame(20);
  const nativeMask = { left: 1280 * 0.07, top: 720 - 152, width: 1280 * 0.86, height: 142 };
  for (const [width, height] of [[1280,720], [1920,1080], [1920,800], [1000,1000], [640,312]]) {
    s.video.style.width = `${width}px`; s.video.clientHeight = height;
    s.window.emit('resize');
    const scale = Math.min(width / 1280, height / 720);
    const left = (width - 1280 * scale) / 2, top = (height - 720 * scale) / 2;
    for (const property of ['left', 'top', 'width', 'height']) {
      const offset = property === 'left' ? left : property === 'top' ? top : 0;
      assert.ok(Math.abs(parseFloat(s.panel.style[property]) - (nativeMask[property] * scale + offset)) < 0.001);
    }
    // The longest original caption text occupies x=140..1140, y=580..685 in the source.
    assert.ok(parseFloat(s.panel.style.left) <= left + 140 * scale);
    assert.ok(parseFloat(s.panel.style.top) <= top + 580 * scale);
    assert.ok(parseFloat(s.panel.style.top) + parseFloat(s.panel.style.height) >= top + 685 * scale);
  }
  s.player.stop();
});

test('end, skip, error and replacement release captions, timers and language/resize listeners', () => {
  for (const action of ['end', 'skip', 'error', 'replace']) {
    const s = setup(); let finished = 0;
    s.player.play('assets/vid/alarm.mp4', () => finished++); s.frame(4);
    const oldEnd = s.video.onended;
    assert.equal(s.i18n.listeners.size, 1); assert.equal(s.timers.size, 1);
    if (action === 'end') oldEnd();
    if (action === 'skip') s.skip.onclick({ stopPropagation() {} });
    if (action === 'error') s.video.onerror();
    if (action === 'replace') { s.player.play('assets/vid/dad.mp4'); s.player.stop(); }
    oldEnd(); // A late event must not advance twice.
    assert.equal(finished, action === 'replace' ? 0 : 1);
    assert.equal(s.panel.hidden, true); assert.equal(s.label.textContent, '');
    assert.equal(s.i18n.listeners.size, 0); assert.equal(s.frames.size, 0); assert.equal(s.timers.size, 0);
    assert.equal(s.video.eventNames().length, 0); assert.equal(s.window.eventNames().length, 0);
    assert.ok(s.observers.every(observer => !observer.active));
    assert.equal(s.wrap.hidden, true); assert.equal(s.skip.disabled, true);
  }
});

test('late autoplay rejection cannot put a tap overlay on a finished or subsequent film', async () => {
  const s = setup(); let reject;
  s.video.play = () => new Promise((resolve, fail) => { reject = fail; });
  s.player.play('assets/vid/alarm.mp4');
  const rejectFirst = reject;
  s.player.play('assets/vid/dad.mp4');
  rejectFirst(Error('autoplay blocked'));
  await Promise.resolve();
  assert.equal(s.wrap.children.length, 0);
  reject(Error('autoplay blocked'));
  await Promise.resolve();
  assert.equal(s.wrap.children.length, 1);
  assert.equal(s.wrap.children[0].textContent, '▶  Play video');
  s.player.stop(); assert.equal(s.wrap.children.length, 0);
});

test('page loads captions before the player and the mask background is opaque', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.ok(html.indexOf('src="js/video-captions.js"') < html.indexOf('src="js/core.js"'));
  assert.match(html, /id="video-caption" lang="en" hidden><span><\/span>/);
  assert.match(html, /#video-caption\s*\{[^}]*background:\s*#161127;/);
});
