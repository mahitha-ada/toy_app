// Small helpers for drawing things in the terminal so each lesson is visual,
// not just a wall of numbers. Pure string functions — no dependencies.

const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  gray: "\x1b[90m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

export function c(color, s) {
  return `${ANSI[color] || ""}${s}${ANSI.reset}`;
}

export function heading(title) {
  const line = "─".repeat(Math.max(title.length + 2, 40));
  return `\n${c("cyan", line)}\n${c("bold", " " + title)}\n${c("cyan", line)}`;
}

/** Horizontal bar made of block characters, scaled to `width`. */
export function bar(value, { max = 1, width = 30 } = {}) {
  const frac = Math.max(0, Math.min(1, value / max));
  const filled = Math.round(frac * width);
  return "█".repeat(filled) + c("gray", "·".repeat(width - filled));
}

/**
 * A signed bar for values in [-1, 1] (e.g. cosine sim or embedding components).
 * Negative values grow left from a centre line, positive values grow right.
 */
export function signedBar(value, { width = 21 } = {}) {
  const half = Math.floor(width / 2);
  const frac = Math.max(-1, Math.min(1, value));
  const cells = Math.round(Math.abs(frac) * half);
  if (frac >= 0) {
    return c("gray", " ".repeat(half)) + "│" + c("green", "▓".repeat(cells)) +
      c("gray", "·".repeat(half - cells));
  }
  return c("gray", "·".repeat(half - cells)) + c("red", "▓".repeat(cells)) +
    "│" + c("gray", " ".repeat(half));
}

/** Map a similarity in [-1,1] to a coloured score label. */
export function colorScore(score) {
  const s = score.toFixed(3);
  if (score >= 0.6) return c("green", s);
  if (score >= 0.3) return c("yellow", s);
  if (score >= 0.0) return c("gray", s);
  return c("red", s);
}

/** A compact unicode "sparkline" of a vector so you can see its shape. */
export function sparkline(values) {
  const blocks = "▁▂▃▄▅▆▇█";
  let min = Infinity, max = -Infinity;
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const range = max - min || 1;
  return values
    .map((v) => blocks[Math.min(blocks.length - 1, Math.floor(((v - min) / range) * blocks.length))])
    .join("");
}

/** Render an N×N matrix as a coloured heatmap of similarity values. */
export function heatmap(matrix, labels) {
  const shade = (v) => {
    // v in [-1,1] -> background-ish glyph density
    if (v >= 0.8) return c("green", "██");
    if (v >= 0.6) return c("green", "▓▓");
    if (v >= 0.4) return c("yellow", "▒▒");
    if (v >= 0.2) return c("yellow", "░░");
    if (v >= 0.0) return c("gray", "··");
    return c("red", "××");
  };
  const lines = [];
  matrix.forEach((row, i) => {
    const cells = row.map(shade).join("");
    lines.push(`${cells}  ${c("dim", labels[i])}`);
  });
  return lines.join("\n");
}

export function pad(str, len) {
  str = String(str);
  return str.length >= len ? str.slice(0, len) : str + " ".repeat(len - str.length);
}
