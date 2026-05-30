// ============================================================================
// LESSON 2 — Embeddings: turning text into a vector
// ============================================================================
// Run:  npm run lesson:2
//
// An embedding is a fixed-length list of numbers that captures the *meaning* of
// a piece of text. all-MiniLM-L6-v2 produces 384 numbers per input, no matter
// how long the text is. This lesson generates a few and inspects their shape.
// ============================================================================

import { embed, EMBEDDING_DIM, MODEL_ID } from "../lib/model.js";
import { magnitude } from "../lib/vectors.js";
import { heading, c, sparkline, signedBar } from "./_viz.js";

const sentences = [
  "A fluffy cat naps in the sun.",
  "The kitten is sleeping in sunlight.",
  "Quarterly profits beat analyst expectations.",
];

console.log(heading("Lesson 2 · Embeddings"));
console.log(c("dim", `Model: ${MODEL_ID}  ·  dimensions: ${EMBEDDING_DIM}\n`));
console.log("First run downloads the model (~25 MB); later runs are instant & offline.\n");

const vectors = await embed(sentences);

sentences.forEach((s, i) => {
  const v = vectors[i];
  console.log(c("bold", `\n"${s}"`));
  console.log(
    c("dim", `  length (L2 norm): ${magnitude(v).toFixed(4)}  `) +
      c("dim", `(≈1.0 because we asked for normalized vectors)`)
  );
  console.log("  shape: " + c("cyan", sparkline(v)));
  console.log(c("dim", "  first 8 of 384 components:"));
  v.slice(0, 8).forEach((x, j) => {
    console.log(
      "    " + c("dim", `dim ${String(j).padStart(2)} `) +
        signedBar(x * 4) + // ×4 just to make small values visible
        c("dim", `  ${x.toFixed(4)}`)
    );
  });
});

console.log(
  c("dim", "\nNotice the first two sentences mean almost the same thing — their\n") +
    c("dim", "sparkline shapes look alike. The finance sentence looks different.\n") +
    c("dim", "Lesson 3 turns that intuition into an exact number.\n")
);
console.log(c("green", "Next → npm run lesson:3  (measure similarity between vectors)\n"));
