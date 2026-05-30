// ----------------------------------------------------------------------------
// lib/vectors.js
//
// The math you actually need to understand embeddings. An "embedding" is just a
// list of numbers (a vector) that points somewhere in a high-dimensional space.
// Two pieces of text that *mean* similar things land close together; unrelated
// text lands far apart. Every function below is plain JavaScript on plain arrays
// — no magic, no dependencies. Read these first; they are the whole game.
// ----------------------------------------------------------------------------

/** Dot product: sum of element-wise products. The engine behind cosine sim. */
export function dot(a, b) {
  assertSameLength(a, b);
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

/** Euclidean length (L2 norm) of a vector: how long the arrow is. */
export function magnitude(a) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * a[i];
  return Math.sqrt(sum);
}

/**
 * Cosine similarity: the cosine of the angle between two vectors.
 *   +1  => identical direction (very similar meaning)
 *    0  => orthogonal / unrelated
 *   -1  => opposite direction
 * This is THE standard similarity metric for text embeddings, because it cares
 * about direction (meaning), not magnitude (sentence length / emphasis).
 */
export function cosineSimilarity(a, b) {
  const denom = magnitude(a) * magnitude(b);
  if (denom === 0) return 0;
  return dot(a, b) / denom;
}

/**
 * Euclidean distance: straight-line distance between the two arrow tips.
 * Smaller = closer. Note: for *normalized* vectors (length 1), euclidean
 * distance and cosine similarity rank neighbours identically.
 */
export function euclideanDistance(a, b) {
  assertSameLength(a, b);
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

/** Scale a vector to length 1 (unit vector). Keeps direction, drops magnitude. */
export function normalize(a) {
  const m = magnitude(a);
  if (m === 0) return a.slice();
  return a.map((v) => v / m);
}

/** Average of many vectors — used as a quick-and-dirty "centroid" of a cluster. */
export function centroid(vectors) {
  if (vectors.length === 0) return [];
  const dim = vectors[0].length;
  const out = new Array(dim).fill(0);
  for (const v of vectors) for (let i = 0; i < dim; i++) out[i] += v[i];
  for (let i = 0; i < dim; i++) out[i] /= vectors.length;
  return out;
}

/**
 * Rank a corpus of vectors against a query vector by cosine similarity.
 * This three-line function IS "semantic search" / a tiny vector database.
 *
 * @returns array of { index, score } sorted best-first.
 */
export function rankBySimilarity(queryVec, corpusVecs) {
  return corpusVecs
    .map((v, index) => ({ index, score: cosineSimilarity(queryVec, v) }))
    .sort((a, b) => b.score - a.score);
}

/** Full N×N pairwise cosine-similarity matrix (used for the heatmap demo). */
export function similarityMatrix(vectors) {
  const n = vectors.length;
  const m = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      const s = cosineSimilarity(vectors[i], vectors[j]);
      m[i][j] = s;
      m[j][i] = s;
    }
  }
  return m;
}

function assertSameLength(a, b) {
  if (a.length !== b.length) {
    throw new Error(`Vector length mismatch: ${a.length} vs ${b.length}`);
  }
}
