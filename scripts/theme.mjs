// Light and dark palettes. Each SVG is rendered once per theme and picked with <picture> + prefers-color-scheme.

export const THEMES = {
  light: {
    background: '#ffffff',
    border: '#d1d9e0',
    text: '#1f2328',
    muted: '#59636e',
    accent: '#f26322',
    accentText: '#bc4a14',
    pillBackground: '#fff4ed',
    pillBorder: '#f6c7ad',
    divider: '#e6ebf1',
  },
  dark: {
    background: '#0d1117',
    border: '#30363d',
    text: '#e6edf3',
    muted: '#9198a1',
    accent: '#f26322',
    accentText: '#ff9a62',
    pillBackground: '#221410',
    pillBorder: '#5b2a14',
    divider: '#21262d',
  },
};

export const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
export const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

// GitHub linguist colors for the languages likely to appear on the featured cards.
export const LANGUAGE_COLORS = {
  PHP: '#4F5D95',
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  HTML: '#e34c26',
  CSS: '#663399',
  Less: '#1d365d',
  Shell: '#89e051',
  Python: '#3572A5',
};
