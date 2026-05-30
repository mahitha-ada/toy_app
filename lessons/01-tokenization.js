// ============================================================================
// LESSON 1 — Tokenization: what the model actually reads
// ============================================================================
// Run:  npm run lesson:1
//
// A neural network can't read text. Before anything happens, your sentence is
// chopped into "tokens" (sub-word pieces) and each token is mapped to an integer
// ID from the model's fixed vocabulary. This lesson makes that visible.
// ============================================================================

import { tokenizeText, MODEL_ID } from "../lib/model.js";
import { heading, c, pad } from "./_viz.js";

const samples = [
  "I love embeddings!",
  "Tokenization splits unfamiliar words into subwords.",
  "antidisestablishmentarianism",
];

console.log(heading("Lesson 1 · Tokenization"));
console.log(c("dim", `Model: ${MODEL_ID}\n`));
console.log(
  "Transformers see TOKENS, not words. Rare/long words get split into pieces.\n" +
    c("dim", "Tokens starting with '##' are continuations of the previous token.\n")
);

for (const text of samples) {
  const { tokens, ids } = await tokenizeText(text);
  console.log(c("bold", `\n"${text}"`));
  console.log(c("dim", `→ ${tokens.length} tokens, ${ids.length} ids (incl. special [CLS]/[SEP])\n`));

  // Print tokens lined up with their integer IDs.
  console.log("  " + c("cyan", "token") + pad("", 14) + c("cyan", "id"));
  console.log("  " + "─".repeat(24));
  tokens.forEach((tok, i) => {
    const isCont = tok.startsWith("##");
    const shown = isCont ? c("yellow", tok) : tok;
    // ids[] includes [CLS] at the front, so token i aligns to id i+1.
    const id = ids[i + 1];
    console.log("  " + pad(shown + (isCont ? "" : ""), 18 + (isCont ? 9 : 0)) + c("dim", id ?? ""));
  });
}

console.log(
  c("dim", "\nTakeaway: every model has its own vocabulary. The same text becomes a\n") +
    c("dim", "different list of integers depending on the model's tokenizer.\n")
);
console.log(c("green", "Next → npm run lesson:2  (turn these tokens into an embedding vector)\n"));
