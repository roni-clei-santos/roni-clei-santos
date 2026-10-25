import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { decideVersion, featuredImage, IMAGES, renderReadme } from '../scripts/readme.mjs';

const profile = JSON.parse(await readFile(new URL('../profile.json', import.meta.url), 'utf8'));
const repos = [
  { name: 'ProductPaymentOptions', description: 'Payment options', url: 'https://github.com/roni-clei-santos/ProductPaymentOptions' },
  { name: 'm2-estimate-shipping-brazil', description: 'Shipping by CEP', url: 'https://github.com/roni-clei-santos/m2-estimate-shipping-brazil' },
];
const pictures = IMAGES.length + repos.length;
const readme = renderReadme(profile, '2026-10-23', repos);

test('the header image links to the certification verification page', () => {
  const header = readme.slice(0, readme.indexOf('</a>'));

  assert.ok(header.startsWith(`<a href="${profile.certification.url}">`));
  assert.ok(header.includes('assets/header.light.svg'));
  assert.ok(header.includes('assets/header.dark.svg'));
});

test('every image is a <picture> that switches on prefers-color-scheme', () => {
  assert.equal(readme.match(/<picture>/g).length, pictures);
  assert.equal(readme.match(/media="\(prefers-color-scheme: dark\)"/g).length, pictures);
  for (const name of [...IMAGES, ...repos.map(featuredImage)]) {
    assert.ok(readme.includes(`srcset="assets/${name}.dark.svg?v=2026-10-23"`));
    assert.ok(readme.includes(`src="assets/${name}.light.svg?v=2026-10-23"`));
  }
});

test('every image URL carries the cache-busting version', () => {
  const urls = [...readme.matchAll(/assets\/[\w.-]+\.svg[^"]*/g)].map((match) => match[0]);

  assert.equal(urls.length, pictures * 2);
  for (const url of urls) assert.match(url, /\?v=2026-10-23$/);
});

test('the README has a short Currently section, links and no contribution widgets', () => {
  assert.match(readme, /## Currently\n\n- /);
  assert.ok(readme.includes('[LinkedIn](https://www.linkedin.com/in/roni-clei-santos)'));
  assert.doesNotMatch(readme, /streak|contribution|github-readme-stats|shields\.io|badge/i);
});

test('decideVersion keeps the published version while nothing changed', () => {
  assert.equal(decideVersion({ imagesChanged: false, readme, today: '2026-11-30' }), '2026-10-23');
});

test('decideVersion moves to today when an image changed or there is no README yet', () => {
  assert.equal(decideVersion({ imagesChanged: true, readme, today: '2026-11-30' }), '2026-11-30');
  assert.equal(decideVersion({ imagesChanged: false, readme: null, today: '2026-11-30' }), '2026-11-30');
  assert.equal(decideVersion({ imagesChanged: false, readme: '# no version', today: '2026-11-30' }), '2026-11-30');
});

test('each featured card links to its repository and the separate text links are gone', () => {
  for (const repo of repos) {
    const link = `<a href="${repo.url}">`;
    const start = readme.indexOf(link);
    assert.ok(start >= 0, `no link to ${repo.url}`);
    assert.ok(readme.slice(start, readme.indexOf('</a>', start)).includes(`assets/${featuredImage(repo)}.light.svg`));
  }
  assert.doesNotMatch(readme, /\[ProductPaymentOptions\]\(/);
});

test('the How I ship section comes right after the stack', () => {
  assert.ok(readme.indexOf('assets/stack.light.svg') < readme.indexOf('assets/practices.light.svg'));
  assert.ok(readme.indexOf('assets/practices.light.svg') < readme.indexOf('assets/featured-'));
});
