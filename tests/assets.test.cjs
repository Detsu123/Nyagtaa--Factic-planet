const { test } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');

function preloadRequests() {
  // Run the real preload method so additions to its loops are checked automatically.
  const requests = [];
  const ui = new Proxy({}, { get: () => () => ui });
  const ctx = vm.createContext({
    location: { search: '' }, Phaser: { Scene: class {} }, txt: () => ui,
    document: { getElementById: () => ({ style: {} }) },
  });
  for (const file of ['data.js', 'scenes_menu.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, 'js', file), 'utf8'), ctx, { filename: file });
  }
  const scene = vm.runInContext('new PreloadScene()', ctx);
  scene.add = { rectangle: () => ui, image: () => ui, graphics: () => ui };
  scene.tweens = { add() {} };
  scene.load = { on() {} };
  for (const type of ['json', 'image', 'audio']) {
    scene.load[type] = (key, file) => requests.push({ type, key, file });
  }
  scene.preload();
  return requests;
}

test('every preloaded asset and local page/video resource exists and is tracked by Git', t => {
  const required = new Set(preloadRequests().map(request => request.file));
  const sourceFiles = ['index.html', ...fs.readdirSync(path.join(root, 'js')).filter(file => file.endsWith('.js')).map(file => `js/${file}`)];
  for (const file of sourceFiles) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    // Covers HTML scripts/images, the CSS font URL and VIDEO.play's literal paths.
    for (const match of source.matchAll(/(['"])((?:assets|js)\/[^'"`$\\\n]+)\1/g)) required.add(match[2]);
  }
  // Checking the index catches files that happen to exist on one developer's machine.
  const tracked = new Set(execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0'));
  const errors = [];
  for (const file of [...required].sort()) {
    const absolute = path.join(root, file);
    if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile() || !fs.statSync(absolute).size) errors.push(`Missing or empty: ${file}`);
    if (!tracked.has(file)) errors.push(`Not tracked by Git: ${file}`);
  }
  assert.deepEqual(errors, [], errors.join('\n'));
  t.diagnostic(`Checked ${required.size} required resources, including dynamically preloaded assets.`);
});

test('the loader requests Tumur\'s available portrait without requesting the removed expression', () => {
  const portraits = preloadRequests().filter(request => request.key.startsWith('pt_gamer_'));
  assert.ok(portraits.some(request => request.key === 'pt_gamer_main'));
  assert.ok(portraits.every(request => request.file !== 'assets/pt/gamer_hyped.webp'));
});
