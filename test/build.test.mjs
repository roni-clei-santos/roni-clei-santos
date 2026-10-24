import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { renderImages } from '../scripts/build.mjs';

const profile = JSON.parse(await readFile(new URL('../profile.json', import.meta.url), 'utf8'));

test('renderImages produces the three images in both themes and is deterministic', () => {
  const repos = [{ name: 'a', description: 'd', language: 'PHP', url: 'u' }];
  const first = renderImages(profile, repos);

  assert.deepEqual(Object.keys(first).sort(), [
    'assets/featured.dark.svg',
    'assets/featured.light.svg',
    'assets/header.dark.svg',
    'assets/header.light.svg',
    'assets/stack.dark.svg',
    'assets/stack.light.svg',
  ]);
  assert.deepEqual(renderImages(profile, repos), first);
});

test('the script has no dependencies', async () => {
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));

  assert.equal(pkg.dependencies, undefined);
  assert.equal(pkg.devDependencies, undefined);
});
