import assert from 'node:assert/strict';
import { test } from 'node:test';

import { escapeXml, textWidth, truncate, wrapText } from '../scripts/text.mjs';

test('escapeXml escapes every XML special character', () => {
  assert.equal(escapeXml(`<a href="x">Tom & 'Jerry'</a>`), '&lt;a href=&quot;x&quot;&gt;Tom &amp; &apos;Jerry&apos;&lt;/a&gt;');
});

test('escapeXml leaves plain text alone and accepts non-strings', () => {
  assert.equal(escapeXml('Florianópolis · Remote'), 'Florianópolis · Remote');
  assert.equal(escapeXml(2019), '2019');
});

test('textWidth grows with the text and with the font size', () => {
  assert.ok(textWidth('Adobe Commerce', 14) > textWidth('Adobe', 14));
  assert.ok(textWidth('Adobe', 20) > textWidth('Adobe', 10));
  assert.ok(textWidth('WWW', 14) > textWidth('iii', 14));
});

test('wrapText keeps every word and respects the maximum width', () => {
  const text = 'Salesforce Marketing Cloud (SSJS, CloudPages)';
  const lines = wrapText(text, 150, 13.5);

  assert.ok(lines.length > 1);
  assert.equal(lines.join(' '), text);
  for (const line of lines) assert.ok(textWidth(line, 13.5) <= 150, `"${line}" is too wide`);
});

test('wrapText keeps a word longer than the line on its own line instead of dropping it', () => {
  assert.deepEqual(wrapText('supercalifragilisticexpialidocious ok', 40, 13), ['supercalifragilisticexpialidocious', 'ok']);
});

test('wrapText of empty text has no lines', () => {
  assert.deepEqual(wrapText('   ', 100, 13), []);
});

test('truncate shortens with an ellipsis only when needed', () => {
  assert.equal(truncate('short', 200, 13), 'short');
  const result = truncate('A very long description that cannot possibly fit in a tiny box', 120, 13);
  assert.ok(result.endsWith('…'));
  assert.ok(textWidth(result, 13) <= 120);
});
