import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { renderImages } from '../scripts/build.mjs';

const profile = JSON.parse(await readFile(new URL('../profile.json', import.meta.url), 'utf8'));

test('renderImages produces every image in both themes and is deterministic', () => {
  const repos = [
    { name: 'ProductPaymentOptions', description: 'd', language: 'PHP', url: 'u', release: 'v2.0.0', highlights: [] },
    { name: 'm2-estimate-shipping-brazil', description: 'd', language: 'PHP', url: 'u', release: null, highlights: [] },
  ];
  const first = renderImages(profile, repos);

  assert.deepEqual(Object.keys(first).sort(), [
    'assets/featured-m2-estimate-shipping-brazil.dark.svg',
    'assets/featured-m2-estimate-shipping-brazil.light.svg',
    'assets/featured-productpaymentoptions.dark.svg',
    'assets/featured-productpaymentoptions.light.svg',
    'assets/header.dark.svg',
    'assets/header.light.svg',
    'assets/practices.dark.svg',
    'assets/practices.light.svg',
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
