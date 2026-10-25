import assert from 'node:assert/strict';
import { test } from 'node:test';

import { fetchFeatured, fetchLatestRelease, fetchRepo } from '../scripts/github.mjs';

const answer = (status, body) => async () => ({ ok: status >= 200 && status < 300, status, json: async () => body });

test('fetchRepo maps the API answer and sends the token only when there is one', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, headers: init.headers });
    return { ok: true, status: 200, json: async () => ({ name: 'R', description: '  A module  ', language: 'PHP', html_url: 'https://github.com/o/R' }) };
  };

  assert.deepEqual(await fetchRepo('o/R', { fetchImpl, token: 't0ken' }), { name: 'R', description: 'A module', language: 'PHP', url: 'https://github.com/o/R' });
  await fetchRepo('o/R', { fetchImpl });

  assert.equal(calls[0].url, 'https://api.github.com/repos/o/R');
  assert.equal(calls[0].headers.Authorization, 'Bearer t0ken');
  assert.equal(calls[1].headers.Authorization, undefined);
});

test('fetchRepo turns a null description into an empty string', async () => {
  const fetchImpl = answer(200, { name: 'R', description: null, language: null, html_url: 'u' });

  assert.deepEqual(await fetchRepo('o/R', { fetchImpl }), { name: 'R', description: '', language: null, url: 'u' });
});

test('fetchRepo fails loudly on an API error so no broken image is committed', async () => {
  await assert.rejects(fetchRepo('o/missing', { fetchImpl: answer(404, {}) }), /404 for o\/missing/);
});

test('fetchFeatured falls back to profile.json only when GitHub has no description', async () => {
  const bodies = {
    'o/with': { name: 'with', description: 'From GitHub', language: 'PHP', html_url: 'u1' },
    'o/with/releases/latest': { tag_name: 'v2.0.0' },
    'o/without': { name: 'without', description: '', language: 'PHP', html_url: 'u2' },
  };
  const fetchImpl = async (url) => {
    const body = bodies[url.replace('https://api.github.com/repos/', '')];
    return body ? { ok: true, status: 200, json: async () => body } : { ok: false, status: 404, json: async () => ({}) };
  };

  const repos = await fetchFeatured(
    [
      { repo: 'o/with', fallbackDescription: 'Fallback', highlights: ['100% coverage'] },
      { repo: 'o/without', fallbackDescription: 'Fallback' },
    ],
    { fetchImpl },
  );

  assert.deepEqual(repos.map((repo) => repo.description), ['From GitHub', 'Fallback']);
  assert.deepEqual(repos.map((repo) => repo.release), ['v2.0.0', null]);
  assert.deepEqual(repos.map((repo) => repo.highlights), [['100% coverage'], []]);
});

test('fetchLatestRelease returns the tag, null without releases and fails on other errors', async () => {
  assert.equal(await fetchLatestRelease('o/R', { fetchImpl: answer(200, { tag_name: 'v2.0.0' }) }), 'v2.0.0');
  assert.equal(await fetchLatestRelease('o/R', { fetchImpl: answer(404, {}) }), null);
  assert.equal(await fetchLatestRelease('o/R', { fetchImpl: answer(200, { tag_name: '' }) }), null);
  await assert.rejects(fetchLatestRelease('o/R', { fetchImpl: answer(500, {}) }), /500 for the latest release of o\/R/);
});
