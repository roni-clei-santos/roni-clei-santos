import { escapeXml, textWidth, truncate, wrapText } from './text.mjs';
import { FONT, LANGUAGE_COLORS, MONO, THEMES } from './theme.mjs';

export const WIDTH = 880;
const PADDING = 32;

function open(width, height, title) {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(title)}">`,
    `<title>${escapeXml(title)}</title>`,
  ];
}

function frame(width, height, theme) {
  return `<rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="12" fill="${theme.background}" stroke="${theme.border}"/>`;
}

function text(x, y, content, { size, weight = 400, fill, family = FONT, spacing } = {}) {
  const letterSpacing = spacing ? ` letter-spacing="${spacing}"` : '';
  return `<text x="${x}" y="${y}" font-family='${family}' font-size="${size}" font-weight="${weight}" fill="${fill}"${letterSpacing}>${escapeXml(content)}</text>`;
}

/** "Adobe Certified Expert · Commerce Front End Developer · since 2019" */
export function badgeText(certification) {
  const [title, role] = certification.name.split(' — ');
  return `${title} · ${role.replace(/^Adobe /, '')} · since ${certification.since}`;
}

export function renderHeader(profile, themeName) {
  const theme = THEMES[themeName];
  const badge = badgeText(profile.certification);
  const badgeSize = 12.5;
  const badgeWidth = Math.ceil(textWidth(badge, badgeSize)) + 40;
  const height = 214;
  const svg = open(WIDTH, height, `${profile.name} — ${profile.headline}`);

  svg.push(frame(WIDTH, height, theme));
  svg.push(`<rect x="${PADDING}" y="34" width="36" height="4" rx="2" fill="${theme.accent}"/>`);
  svg.push(text(PADDING, 80, profile.name, { size: 36, weight: 700, fill: theme.text }));
  svg.push(text(PADDING, 112, profile.headline, { size: 20, weight: 600, fill: theme.accentText }));
  svg.push(text(PADDING, 140, profile.since, { size: 15, fill: theme.muted }));
  svg.push(text(PADDING, 162, profile.location, { size: 15, fill: theme.muted }));
  svg.push(
    `<rect x="${PADDING}" y="172" width="${badgeWidth}" height="26" rx="13" fill="${theme.pillBackground}" stroke="${theme.pillBorder}"/>`,
  );
  svg.push(`<circle cx="${PADDING + 15}" cy="185" r="3.5" fill="${theme.accent}"/>`);
  svg.push(text(PADDING + 26, 189.5, badge, { size: badgeSize, weight: 500, fill: theme.text }));
  svg.push('</svg>');
  return svg.join('\n');
}

export function renderStack(profile, themeName) {
  const theme = THEMES[themeName];
  const columns = profile.columns;
  const gap = 20;
  const columnWidth = (WIDTH - PADDING * 2 - gap * (columns.length - 1)) / columns.length;
  const itemSize = 13.5;
  const lineHeight = 19;
  const itemGap = 7;

  const laidOut = columns.map((column) =>
    column.items.map((item) => wrapText(item, columnWidth - 14, itemSize)),
  );
  const tallest = Math.max(
    ...laidOut.map((items) => items.reduce((sum, lines) => sum + lines.length * lineHeight + itemGap, 0)),
  );
  const top = 86;
  const height = top + tallest + 14;
  const svg = open(WIDTH, height, 'Stack');

  svg.push(frame(WIDTH, height, theme));
  svg.push(text(PADDING, 44, 'STACK', { size: 12, weight: 700, fill: theme.muted, spacing: 1.5 }));

  columns.forEach((column, index) => {
    const x = PADDING + index * (columnWidth + gap);
    if (index > 0) {
      const dividerX = x - gap / 2;
      svg.push(`<line x1="${dividerX}" y1="64" x2="${dividerX}" y2="${height - 24}" stroke="${theme.divider}"/>`);
    }
    svg.push(text(x, top - 4, column.title, { size: 15, weight: 700, fill: theme.accentText }));

    let y = top + 22;
    laidOut[index].forEach((lines) => {
      svg.push(`<circle cx="${x + 3}" cy="${y - 4.5}" r="2" fill="${theme.accent}"/>`);
      lines.forEach((line, lineIndex) => {
        svg.push(text(x + 14, y + lineIndex * lineHeight, line, { size: itemSize, fill: theme.text }));
      });
      y += lines.length * lineHeight + itemGap;
    });
  });

  svg.push('</svg>');
  return svg.join('\n');
}

/** Two-column checklist of the engineering practices behind every delivery. */
export function renderPractices(profile, themeName) {
  const theme = THEMES[themeName];
  const items = profile.practices;
  const perColumn = Math.ceil(items.length / 2);
  const gap = 28;
  const columnWidth = (WIDTH - PADDING * 2 - gap) / 2;
  const itemSize = 13.5;
  const lineHeight = 19;
  const itemGap = 9;
  const top = 80;

  const columns = [items.slice(0, perColumn), items.slice(perColumn)].map((column) =>
    column.map((item) => wrapText(item, columnWidth - 26, itemSize)),
  );
  const tallest = Math.max(
    ...columns.map((column) => column.reduce((sum, lines) => sum + lines.length * lineHeight + itemGap, 0)),
  );
  const height = top + tallest + 14;
  const svg = open(WIDTH, height, 'How I ship');

  svg.push(frame(WIDTH, height, theme));
  svg.push(text(PADDING, 44, 'HOW I SHIP', { size: 12, weight: 700, fill: theme.muted, spacing: 1.5 }));

  columns.forEach((column, index) => {
    const x = PADDING + index * (columnWidth + gap);
    let y = top;
    column.forEach((lines) => {
      // check mark
      svg.push(`<circle cx="${x + 8}" cy="${y - 4.5}" r="8" fill="${theme.pillBackground}" stroke="${theme.pillBorder}"/>`);
      svg.push(
        `<path d="M${x + 4.2} ${y - 4.6} l2.6 2.6 l5-5" fill="none" stroke="${theme.accent}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
      );
      lines.forEach((line, lineIndex) => {
        svg.push(text(x + 26, y + lineIndex * lineHeight, line, { size: itemSize, fill: theme.text }));
      });
      y += lines.length * lineHeight + itemGap;
    });
  });

  svg.push('</svg>');
  return svg.join('\n');
}

export const CARD_WIDTH = (WIDTH - 16) / 2;

function chip(x, y, label, { fill, stroke, color, size = 12 }) {
  const width = Math.ceil(textWidth(label, size)) + 22;
  return {
    width,
    markup: [
      `<rect x="${x}" y="${y}" width="${width}" height="24" rx="12" fill="${fill}" stroke="${stroke}"/>`,
      text(x + 11, y + 16.5, label, { size, weight: 600, fill: color }),
    ].join('\n'),
  };
}

/**
 * One featured repository as its own card, so the README can link each card to its repository.
 *
 * @param {{name: string, description: string, language: string | null, release?: string | null, highlights?: string[]}} repo
 */
export function renderFeaturedCard(repo, themeName) {
  const theme = THEMES[themeName];
  const width = CARD_WIDTH;
  const inner = width - 48;
  const descriptionSize = 13.5;
  const lineHeight = 19;
  const maxLines = 3;

  const lines = wrapText(repo.description, inner, descriptionSize);
  const shown = lines.slice(0, maxLines);
  if (lines.length > maxLines) shown[maxLines - 1] = truncate(`${shown[maxLines - 1]} ${lines[maxLines]}`, inner, descriptionSize);

  const chipsY = 70 + maxLines * lineHeight;
  const height = chipsY + 24 + 52;
  const svg = open(width, height, `${repo.name}: ${repo.description}`);

  svg.push(frame(width, height, theme));
  // repository icon
  svg.push(
    `<path transform="translate(24 26)" fill="${theme.muted}" d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"/>`,
  );
  svg.push(text(48, 39, truncate(repo.name, width - 72, 15), { size: 15, weight: 700, fill: theme.accentText, family: MONO }));
  shown.forEach((line, lineIndex) => {
    svg.push(text(24, 68 + lineIndex * lineHeight, line, { size: descriptionSize, fill: theme.text }));
  });

  let x = 24;
  const chips = [];
  if (repo.release) chips.push(chip(x, chipsY, repo.release, { fill: theme.pillBackground, stroke: theme.pillBorder, color: theme.accentText }));
  for (const highlight of repo.highlights ?? []) {
    x = chips.length ? x + chips[chips.length - 1].width + 8 : x;
    const next = chip(x, chipsY, highlight, { fill: 'none', stroke: theme.border, color: theme.muted });
    if (x + next.width > width - 24) break;
    chips.push(next);
  }
  chips.forEach((item) => svg.push(item.markup));

  if (repo.language) {
    const languageY = height - 22;
    svg.push(`<circle cx="29" cy="${languageY - 4.5}" r="5" fill="${LANGUAGE_COLORS[repo.language] ?? theme.muted}"/>`);
    svg.push(text(40, languageY, repo.language, { size: 13, fill: theme.muted }));
  }

  svg.push('</svg>');
  return svg.join('\n');
}
