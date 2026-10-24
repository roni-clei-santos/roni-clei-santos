// Generates assets/*.svg (light and dark) and README.md from profile.json. No dependencies, Node 24+.
//
//   GITHUB_TOKEN=... node scripts/build.mjs
//
// The README image URLs carry ?v=<date> to bypass GitHub's image proxy (camo) cache. The date only moves when an
// image actually changed, so a scheduled run on unchanged data leaves the working tree clean.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { fetchFeatured } from './github.mjs';
import { decideVersion, renderReadme } from './readme.mjs';
import { renderFeatured, renderHeader, renderStack } from './svg.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

async function readIfExists(path) {
  try {
    return await readFile(path, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

/** Render every image for both themes. Pure: no I/O. */
export function renderImages(profile, repos) {
  const files = {};
  for (const theme of ['light', 'dark']) {
    files[`assets/header.${theme}.svg`] = renderHeader(profile, theme);
    files[`assets/stack.${theme}.svg`] = renderStack(profile, theme);
    files[`assets/featured.${theme}.svg`] = renderFeatured(repos, theme);
  }
  return files;
}

export async function build({ today = new Date().toISOString().slice(0, 10), token = process.env.GITHUB_TOKEN } = {}) {
  const profile = JSON.parse(await readFile(join(root, 'profile.json'), 'utf8'));
  const repos = await fetchFeatured(profile.featured, { token });
  const images = renderImages(profile, repos);

  let imagesChanged = false;
  for (const [path, content] of Object.entries(images)) {
    const absolute = join(root, path);
    if ((await readIfExists(absolute)) !== content) imagesChanged = true;
    await mkdir(dirname(absolute), { recursive: true });
    await writeFile(absolute, content);
  }

  const readmePath = join(root, 'README.md');
  const version = decideVersion({ imagesChanged, readme: await readIfExists(readmePath), today });
  await writeFile(readmePath, renderReadme(profile, version, repos));

  return { imagesChanged, version };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { imagesChanged, version } = await build();
  console.log(imagesChanged ? `Images updated (v=${version})` : `Images unchanged (v=${version})`);
}
