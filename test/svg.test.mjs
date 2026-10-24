import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { badgeText, renderFeatured, renderHeader, renderStack, WIDTH } from '../scripts/svg.mjs';
import { THEMES } from '../scripts/theme.mjs';

const profile = JSON.parse(await readFile(new URL('../profile.json', import.meta.url), 'utf8'));
const repos = [
  { name: 'ProductPaymentOptions', description: 'Discounts & installments per payment method.', language: 'PHP', url: 'https://github.com/roneclay/ProductPaymentOptions' },
  { name: 'm2-estimate-shipping-brazil', description: 'Shipping estimate by CEP.', language: 'PHP', url: 'https://github.com/roneclay/m2-estimate-shipping-brazil' },
];

/** Minimal well-formedness check without dependencies: balanced tags and no stray `&` or `<` in text. */
function assertWellFormed(svg) {
  assert.ok(svg.startsWith('<svg '), 'starts with <svg');
  assert.ok(svg.trimEnd().endsWith('</svg>'), 'ends with </svg>');
  assert.doesNotMatch(svg, /&(?!(amp|lt|gt|quot|apos);)/, 'unescaped ampersand');
  const stack = [];
  for (const [, closing, name, , selfClosing] of svg.matchAll(/<(\/?)([a-zA-Z]+)((?:\s+[\w:-]+=(?:"[^"]*"|'[^']*'))*)\s*(\/?)>/g)) {
    if (selfClosing) continue;
    if (closing) assert.equal(stack.pop(), name, `unbalanced </${name}>`);
    else stack.push(name);
  }
  assert.deepEqual(stack, [], 'unclosed tags');
}

test('badgeText is the discreet certification line', () => {
  assert.equal(badgeText(profile.certification), 'Adobe Certified Expert · Commerce Front End Developer · since 2019');
});

for (const theme of Object.keys(THEMES)) {
  test(`header (${theme}) is well-formed and shows name, headline, since, location and the badge`, () => {
    const svg = renderHeader(profile, theme);

    assertWellFormed(svg);
    for (const text of [profile.name, profile.headline, profile.since, 'Florianópolis area, Brazil · Remote', badgeText(profile.certification)]) {
      assert.ok(svg.includes(text.replace('&', '&amp;')), `missing: ${text}`);
    }
    assert.ok(svg.includes(THEMES[theme].background));
  });

  test(`stack (${theme}) lists every column and every item`, () => {
    const svg = renderStack(profile, theme);

    assertWellFormed(svg);
    assert.ok(svg.includes('Backend &amp; Data'));
    assert.ok(svg.includes('Cloud &amp; Delivery'));
    for (const word of ['Knockout.js', 'RequireJS', 'GitHub Actions', 'CloudPages)', 'Nginx']) assert.ok(svg.includes(word), `missing: ${word}`);
  });

  test(`featured (${theme}) shows each repository with description and language`, () => {
    const svg = renderFeatured(repos, theme);

    assertWellFormed(svg);
    assert.ok(svg.includes('ProductPaymentOptions'));
    assert.ok(svg.includes('m2-estimate-shipping-brazil'));
    assert.ok(svg.includes('Discounts &amp; installments'));
    assert.equal(svg.match(/>PHP</g).length, 2);
  });
}

test('light and dark renderings differ only by palette', () => {
  const light = renderHeader(profile, 'light');
  const dark = renderHeader(profile, 'dark');

  assert.notEqual(light, dark);
  assert.ok(dark.includes(THEMES.dark.background) && !dark.includes(THEMES.light.background));
});

test('the featured card escapes markup coming from the GitHub API', () => {
  const hostile = [{ name: 'x', description: '<script>alert(1)</script> & "quotes"', language: '<b>PHP</b>', url: 'u' }];
  const svg = renderFeatured(hostile, 'light');

  assertWellFormed(svg);
  assert.doesNotMatch(svg, /<script|<b>/);
});

test('a repository without language renders no language dot', () => {
  const svg = renderFeatured([{ name: 'x', description: 'd', language: null, url: 'u' }], 'light');

  assertWellFormed(svg);
  assert.doesNotMatch(svg, />null</);
});

test('long descriptions are cut to three lines and stay inside the card', () => {
  const long = 'word '.repeat(200);
  const svg = renderFeatured([{ name: 'x', description: long, language: 'PHP', url: 'u' }], 'light');

  assert.ok(svg.includes('…'));
  assert.ok((svg.match(/font-size="13.5"/g) ?? []).length <= 3);
});

test('nothing in the images is a contribution counter or a streak', () => {
  for (const theme of Object.keys(THEMES)) {
    const all = [renderHeader(profile, theme), renderStack(profile, theme), renderFeatured(repos, theme)].join('\n');
    assert.doesNotMatch(all, /streak|contributions?\b|commits?\b/i);
  }
});

test('all images share the README column width', () => {
  for (const svg of [renderHeader(profile, 'light'), renderStack(profile, 'light'), renderFeatured(repos, 'light')]) {
    assert.ok(svg.includes(`width="${WIDTH}"`));
  }
});
