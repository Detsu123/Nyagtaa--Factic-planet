const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const flush = () => new Promise(resolve => setImmediate(resolve));

function setup({ saved = null, blockedStorage = false, fonts = true } = {}) {
  const stored = new Map([['nyagtaa_language', saved]]), timers = [], games = [];
  const document = { documentElement: {}, activeElement: null };
  const node = (dataset = {}) => ({
    dataset, events: {}, attributes: {}, hidden: true, disabled: false,
    setAttribute(key, value) { this.attributes[key] = value; },
    addEventListener(type, callback) { this.events[type] = callback; },
    focus() { document.activeElement = this; },
  });
  const buttons = ['mn', 'en'].map(startLanguage => node({ startLanguage }));
  const toolbarButtons = ['mn', 'en'].map(language => node({ language }));
  const chooser = node(); chooser.hidden = false; chooser.querySelectorAll = () => buttons;
  const toolbar = node(); toolbar.querySelectorAll = () => toolbarButtons;
  toolbar.querySelector = selector => toolbarButtons.find(button => selector.includes(`"${button.dataset.language}"`));
  const boot = node({ i18n: 'Ачаалж байна…' }), rotate = node();
  const nodes = { 'language-start': chooser, 'language-controls': toolbar, boot, rotate };
  document.getElementById = id => nodes[id]; document.querySelectorAll = () => [boot];
  let resolveFonts, rejectFonts;
  const fontPromise = new Promise((resolve, reject) => { resolveFonts = resolve; rejectFonts = reject; });
  if (fonts) document.fonts = { load: () => fontPromise };
  const context = {
    document, window: {}, Promise, L: {}, GW: 1920, GH: 1080, TEST: false,
    setTimeout(callback) { timers.push(callback); },
    localStorage: {
      getItem(key) { if (blockedStorage) throw Error('blocked'); return stored.get(key); },
      setItem(key, value) { if (blockedStorage) throw Error('blocked'); stored.set(key, value); },
    },
    Phaser: { Scale: {}, Game: function (config) { games.push({ config, language: vm.runInContext('I18N.lang', ctx) }); } },
  };
  for (const name of ['Boot', 'Preload', 'Title', 'Tutorial', 'Village', 'Investigate', 'Notebook', 'Decision', 'Result', 'Quiz', 'Ending']) context[`${name}Scene`] = class {};
  const ctx = vm.createContext(context);
  for (const file of ['i18n.js', 'main.js']) vm.runInContext(fs.readFileSync(path.join(root, 'js', file), 'utf8'), ctx, { filename: file });
  return { document, chooser, toolbar, boot, rotate, buttons, toolbarButtons, games, timers, stored,
    resolveFonts, rejectFonts, i18n: vm.runInContext('I18N', ctx),
    choose(lang) { buttons.find(button => button.dataset.startLanguage === lang).events.click({ stopPropagation() {} }); },
  };
}

test('every visit waits for a language choice, including when a preference is saved', async () => {
  for (const saved of [null, 'mn', 'en', 'invalid']) {
    const s = setup({ saved }); s.resolveFonts(); await flush();
    assert.equal(s.games.length, 0);
    assert.equal(s.chooser.hidden, false); assert.equal(s.toolbar.hidden, true);
    assert.equal(s.boot.hidden, true); assert.equal(s.rotate.hidden, true);
    assert.equal(s.document.activeElement.dataset.startLanguage, saved === 'en' ? 'en' : 'mn');
  }
});

test('each language choice boots once in that language, then allows the toolbar to change it', async () => {
  for (const lang of ['mn', 'en']) {
    const s = setup({ saved: lang === 'mn' ? 'en' : 'mn' });
    s.resolveFonts(); await flush();
    s.choose(lang); s.choose(lang === 'mn' ? 'en' : 'mn'); await flush();
    assert.equal(s.games.length, 1); assert.equal(s.games[0].language, lang);
    assert.equal(s.stored.get('nyagtaa_language'), lang);
    assert.equal(s.document.documentElement.lang, lang);
    assert.equal(s.boot.textContent, lang === 'mn' ? 'Ачаалж байна…' : 'Loading…');
    assert.equal(s.chooser.hidden, true); assert.equal(s.toolbar.hidden, false);
    assert.equal(s.boot.hidden, false); assert.equal(s.rotate.hidden, false);
    assert.ok(s.buttons.every(button => button.disabled));
    assert.equal(s.document.activeElement.dataset.language, lang);
    const other = s.toolbarButtons.find(button => button.dataset.language !== lang);
    other.events.click({ stopPropagation() {} });
    assert.equal(s.i18n.lang, other.dataset.language); assert.equal(s.games.length, 1);
  }
});

test('a choice made before fonts load waits, and font failure or timeout still starts the game', async () => {
  for (const settle of ['resolve', 'reject', 'timeout']) {
    const s = setup(); s.choose('en'); await flush();
    assert.equal(s.games.length, 0); assert.equal(s.boot.hidden, false);
    if (settle === 'resolve') s.resolveFonts();
    if (settle === 'reject') s.rejectFonts(Error('font failed'));
    if (settle === 'timeout') s.timers[0]();
    await flush(); assert.equal(s.games.length, 1); assert.equal(s.games[0].language, 'en');
    s.resolveFonts(); await flush(); assert.equal(s.games.length, 1);
  }
});

test('disabled local storage and a missing font API do not bypass or block the choice', async () => {
  const s = setup({ saved: 'en', blockedStorage: true, fonts: false });
  await flush(); assert.equal(s.games.length, 0);
  s.choose('en'); await flush();
  assert.equal(s.games.length, 1); assert.equal(s.games[0].language, 'en');
});
