// ============================================================================
// LESSON 5 — Seeing the space: PCA projection + clustering
// ============================================================================
// Run:  npm run lesson:5
//
// Embeddings live in 384 dimensions. To see them we use PCA to squash them down
// to 2-D and plot them as ASCII. Sentences about the same topic should land in
// the same region — proof that the model groups meaning, with no labels given.
// ============================================================================

import { embed } from "../lib/model.js";
import { pca } from "../lib/pca.js";
import { centroid, cosineSimilarity } from "../lib/vectors.js";
import { texts, topics, corpus } from "../data/corpus.js";
import { heading, c, pad } from "./_viz.js";

console.log(heading("Lesson 5 · PCA Projection & Clustering"));
console.log(c("dim", `Embedding ${texts.length} sentences, then projecting 384-D → 2-D...\n`));

const vectors = await embed(texts);
const { points, explained } = pca(vectors, 2);

console.log(
  c("dim", `PC1 explains ${(explained[0] * 100).toFixed(1)}% of variance, `) +
    c("dim", `PC2 explains ${(explained[1] * 100).toFixed(1)}%.\n`)
);

// ---- Draw an ASCII scatter plot ----------------------------------------------
const W = 64, H = 24;
const xs = points.map((p) => p[0]);
const ys = points.map((p) => p[1]);
const minX = Math.min(...xs), maxX = Math.max(...xs);
const minY = Math.min(...ys), maxY = Math.max(...ys);
const sx = (x) => Math.round(((x - minX) / (maxX - minX || 1)) * (W - 1));
const sy = (y) => Math.round((1 - (y - minY) / (maxY - minY || 1)) * (H - 1));

// One distinct letter+colour per topic.
const topicList = [...new Set(topics)];
const topicGlyph = {};
const palette = ["red", "green", "blue", "magenta", "cyan", "yellow"];
topicList.forEach((t, i) => (topicGlyph[t] = { ch: t[0].toUpperCase(), color: palette[i % palette.length] }));

const grid = Array.from({ length: H }, () => new Array(W).fill(" "));
points.forEach((p, i) => {
  const gx = sx(p[0]), gy = sy(p[1]);
  const g = topicGlyph[topics[i]];
  grid[gy][gx] = c(g.color, g.ch);
});

console.log(c("bold", "2-D map of the embedding space (each letter = one sentence):\n"));
console.log(c("gray", "┌" + "─".repeat(W) + "┐"));
for (const row of grid) console.log(c("gray", "│") + row.join("") + c("gray", "│"));
console.log(c("gray", "└" + "─".repeat(W) + "┘"));
console.log(
  "  legend:  " +
    topicList.map((t) => c(topicGlyph[t].color, `${topicGlyph[t].ch}=${t}`)).join("   ")
);

// ---- Quantify the clustering --------------------------------------------------
console.log(c("bold", "\n\nHow tight is each topic cluster? (avg cosine sim to its own centre)\n"));
for (const t of topicList) {
  const idxs = corpus.map((c2, i) => (c2.topic === t ? i : -1)).filter((i) => i >= 0);
  const groupVecs = idxs.map((i) => vectors[i]);
  const center = centroid(groupVecs);
  const avg = groupVecs.reduce((s, v) => s + cosineSimilarity(v, center), 0) / groupVecs.length;
  const g = topicGlyph[t];
  console.log(
    "  " + c(g.color, pad(t, 13)) +
      c("dim", `cohesion ${avg.toFixed(3)}  `) +
      c(g.color, "█".repeat(Math.round(avg * 30)))
  );
}

console.log(
  c("dim", "\nNo topic labels were ever given to the model. It clustered these\n") +
    c("dim", "sentences purely from the meaning encoded in their embeddings.\n\n") +
    c("dim", "Want the interactive, zoomable 2-D & 3-D version? Run:  ") +
    c("green", "npm start\n")
);
