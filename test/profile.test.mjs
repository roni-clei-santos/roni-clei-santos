import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const profile = JSON.parse(await readFile(new URL('../profile.json', import.meta.url), 'utf8'));

test('profile.json carries the identity fields', () => {
  assert.equal(profile.name, 'Roni Clei Santos');
  assert.equal(profile.headline, 'Senior Adobe Commerce / Magento Developer');
  assert.equal(profile.since, 'Building on Magento since 2013 (Magento 1 and 2)');
  assert.equal(profile.location, 'Florianópolis area, Brazil · Remote');
});

test('the certification has a name, a start year and a verification URL, and nothing else', () => {
  assert.deepEqual(Object.keys(profile.certification).sort(), ['name', 'since', 'url']);
  assert.equal(profile.certification.since, '2019');
  assert.match(profile.certification.url, /^https:\/\/certification\.adobe\.com\/credential\/verify\/[0-9a-f-]{36}$/);
});

test('the certification exposes no exam code and no expiry date', () => {
  const serialized = JSON.stringify(profile.certification).toLowerCase();
  assert.doesNotMatch(serialized, /expir|valid until|exam|\bad0-|\bAD0\b/i);
});

test('the stack has the four expected columns, none of them empty', () => {
  assert.deepEqual(
    profile.columns.map((column) => column.title),
    ['Adobe Commerce', 'Frontend', 'Backend & Data', 'Cloud & Delivery'],
  );
  for (const column of profile.columns) assert.ok(column.items.length > 0, `${column.title} is empty`);
});

test('the featured modules are repositories of the profile owner', () => {
  assert.equal(profile.featured.length, 2);
  for (const { repo } of profile.featured) assert.match(repo, new RegExp(`^${profile.github}/[\\w.-]+$`));
});

test('the stack only lists what is used in real work: no AWS', () => {
  const items = profile.columns.flatMap((column) => column.items);
  assert.ok(items.includes('Docker'));
  assert.ok(!items.includes('AWS'));
});

test('the practices list is present and every featured module has highlights', () => {
  assert.ok(profile.practices.length >= 6);
  for (const featured of profile.featured) assert.ok(featured.highlights.length > 0, `${featured.repo} has no highlights`);
});
