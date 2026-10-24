// Text helpers for SVG: SVG has no automatic wrapping, so lines are broken using an estimate of glyph widths.

const XML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };

/** Escape a string for use in XML text and attribute values. */
export function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, (char) => XML_ESCAPES[char]);
}

const NARROW = new Set("iljtfI.,;:'|!() ");
const WIDE = new Set('mwMW@%');

/** Estimate the rendered width, in px, of a string in a proportional sans-serif font. */
export function textWidth(text, fontSize) {
  let em = 0;
  for (const char of String(text)) {
    if (NARROW.has(char)) em += 0.32;
    else if (WIDE.has(char)) em += 0.86;
    else if (char >= 'A' && char <= 'Z') em += 0.66;
    else em += 0.56;
  }
  return em * fontSize;
}

/** Break text into lines that fit `maxWidth` px; a single word longer than the line stays on its own line. */
export function wrapText(text, maxWidth, fontSize) {
  const lines = [];
  let line = '';
  for (const word of String(text).split(/\s+/).filter(Boolean)) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && textWidth(candidate, fontSize) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Truncate with an ellipsis when the text does not fit `maxWidth` px on one line. */
export function truncate(text, maxWidth, fontSize) {
  if (textWidth(text, fontSize) <= maxWidth) return String(text);
  let result = String(text);
  while (result.length > 1 && textWidth(`${result}…`, fontSize) > maxWidth) {
    result = result.slice(0, -1);
  }
  return `${result.trimEnd()}…`;
}
