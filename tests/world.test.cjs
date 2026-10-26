const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const worldData = JSON.parse(fs.readFileSync(path.join(root, 'assets/world.json'), 'utf8'));

function worldAt(loc, width, height) {
  const ctx = vm.createContext({ location: { search: '' } });
  for (const file of ['data.js', 'world.js']) vm.runInContext(fs.readFileSync(path.join(root, 'js', file), 'utf8'), ctx, { filename: file });
  const scene = {
    cache: { json: { get: () => worldData } }, cameras: { main: { setBounds(x, y, w, h) { this.bounds = { x, y, width: w, height: h }; } } },
    add: { image(x, y, key) {
      return { x, y, key, displayWidth: key.endsWith('_sky') ? 1600 : width, displayHeight: key.endsWith('_sky') ? 720 : height, scrollFactor: 1,
        setOrigin(value) { this.origin = value; return this; },
        setDisplaySize(w, h) { this.displayWidth = w; this.displayHeight = h; return this; },
        setScrollFactor(value) { this.scrollFactor = value; return this; },
        setDepth(value) { this.depth = value; return this; },
      };
    } },
  };
  ctx.scene = scene; ctx.loc = loc;
  return { world: vm.runInContext('new World25(scene, loc)', ctx), camera: scene.cameras.main };
}

test('all background layers cover the viewport throughout the camera pan at either source resolution', () => {
  for (const loc of Object.keys(worldData.locs)) {
    for (const [width, height] of [[2048, 921], [2400, 1080]]) {
      const { world, camera } = worldAt(loc, width, height);
      for (const scrollX of [0, 240, camera.bounds.width - 1920]) {
        for (const layer of [world.sky, world.far, world.near]) {
          const left = layer.x - scrollX * layer.scrollFactor;
          assert.ok(left <= 0 && left + layer.displayWidth >= 1920, `${layer.key} leaves a horizontal gap at camera x=${scrollX}`);
          assert.ok(layer.y <= 0 && layer.y + layer.displayHeight >= 1080, `${layer.key} leaves a vertical gap`);
        }
      }
    }
  }
});

test('background resolution does not change character and clue projection or parallax ordering', () => {
  for (const loc of Object.keys(worldData.locs)) {
    const before = worldAt(loc, 2400, 1080).world, after = worldAt(loc, 2048, 921).world;
    for (const [x, z] of [[0, 0], [-4, 1], [3, -2]]) {
      assert.equal(JSON.stringify(after.P(x, after.H(x, z), z)), JSON.stringify(before.P(x, before.H(x, z), z)));
    }
    assert.ok(after.sky.scrollFactor < after.far.scrollFactor && after.far.scrollFactor < after.near.scrollFactor);
    assert.ok(after.sky.depth < after.far.depth && after.far.depth < after.near.depth);
  }
});
