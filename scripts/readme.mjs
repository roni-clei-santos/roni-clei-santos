import { escapeXml } from './text.mjs';

export const IMAGES = ['header', 'stack', 'practices'];

/** Asset name of a featured repository card. */
export function featuredImage(repo) {
  return `featured-${repo.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

const VERSION_PATTERN = /\?v=(\d{4}-\d{2}-\d{2})/;

function picture(name, alt, version, width = '100%') {
  return [
    '<picture>',
    `  <source media="(prefers-color-scheme: dark)" srcset="assets/${name}.dark.svg?v=${version}">`,
    `  <img alt="${escapeXml(alt)}" src="assets/${name}.light.svg?v=${version}" width="${width}">`,
    '</picture>',
  ].join('\n');
}

/** Reuse the version already in the README unless an image changed: the URL only changes when its content does. */
export function decideVersion({ imagesChanged, readme, today }) {
  const existing = readme?.match(VERSION_PATTERN)?.[1];
  return imagesChanged || !existing ? today : existing;
}

/**
 * @param {object} profile
 * @param {string} version - cache-busting token appended to every image URL (?v=)
 * @param {Array<{ name: string, url: string }>} repos
 */
export function renderReadme(profile, version, repos) {
  const headerAlt = `${profile.name} — ${profile.headline}`;
  const cards = repos.map((repo) =>
    [`<a href="${escapeXml(repo.url)}">`, picture(featuredImage(repo), `${repo.name}: ${repo.description}`, version, '49%'), '</a>'].join('\n'),
  );

  return [
    `<a href="${profile.certification.url}">`,
    picture('header', headerAlt, version),
    '</a>',
    '',
    picture('stack', 'Stack: Adobe Commerce, Frontend, Backend & Data, Cloud & Delivery', version),
    '',
    picture('practices', 'How I ship: quality gates and engineering practices', version),
    '',
    '<p>',
    cards.join('\n'),
    '</p>',
    '',
    '## Currently',
    '',
    ...profile.currently.map((item) => `- ${item}`),
    '',
    '## Links',
    '',
    profile.links.map((link) => `[${link.label}](${link.url})`).join(' · '),
    '',
  ].join('\n');
}
