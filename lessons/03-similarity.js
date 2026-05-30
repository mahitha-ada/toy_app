// ============================================================================
// LESSON 3 — Similarity: how close are two meanings?
// ============================================================================
// Run:  npm run lesson:3
//
// Once text is a vector, "do these mean the same thing?" becomes geometry.
// We compare every sentence with every other sentence and draw the resulting
// similarity matrix as a heatmap. Watch related sentences light up green.
// ============================================================================

import { embed } from "../lib/model.js";
import {
  cosineSimilarity,
  euclideanDistance,
  dot,
  similarityMatrix,
} from "../lib/vectors.js";
import { heading, c, colorScore, heatmap, pad } from "./_viz.js";

const sentences = [
  "A cat is sleeping on the sofa.",
  "A kitten naps on the couch.",
  "The stock market crashed today.",
  "Shares plunged on the exchange.",
  "I am learning about embeddings.",
];

console.log(heading("Lesson 3 · Similarity"));

const vectors = await embed(sentences);

// 1) A focused comparison: cosine vs dot vs euclidean for one pair.
console.log(c("bold", "\nThree ways to compare the SAME two vectors:\n"));
const a = vectors[0], b = vectors[1];
console.log(`  "${sentences[0]}"\n  "${sentences[1]}"\n`);
console.log(`  cosine similarity : ${colorScore(cosineSimilarity(a, b))}   ` + c("dim", "(angle — the one we use)"));
console.log(`  dot product       : ${colorScore(dot(a, b))}   ` + c("dim", "(== cosine, because vectors are normalized)"));
console.log(`  euclidean distance: ${c("yellow", euclideanDistance(a, b).toFixed(3))}   ` + c("dim", "(smaller = closer)"));

// 2) The full pairwise heatmap.
console.log(c("bold", "\n\nPairwise cosine-similarity heatmap:\n"));
const matrix = similarityMatrix(vectors);
const labels = sentences.map((s, i) => `[${i}] ${s}`);
console.log(heatmap(matrix, labels));
console.log(
  c("dim", "\n  legend: ") +
    c("green", "██ ▓▓") + c("dim", " high   ") +
    c("yellow", "▒▒ ░░") + c("dim", " medium   ") +
    c("gray", "··") + c("dim", " low   ") +
    c("red", "××") + c("dim", " negative")
);

// 3) Numeric table for the curious.
console.log(c("bold", "\n\nExact numbers:\n"));
console.log("      " + matrix.map((_, j) => pad(`[${j}]`, 7)).join(""));
matrix.forEach((row, i) => {
  console.log(pad(`[${i}]`, 6) + row.map((v) => pad(v.toFixed(2), 7)).join(""));
});

console.log(
  c("dim", "\nThe two cat sentences and the two market sentences pair up strongly,\n") +
    c("dim", "even though they share almost no words. That's semantic similarity.\n")
);
console.log(c("green", "Next → npm run lesson:4  (use similarity to build search)\n"));
