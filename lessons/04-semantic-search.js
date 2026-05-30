// ============================================================================
// LESSON 4 — Semantic search: a vector database in 10 lines
// ============================================================================
// Run:  npm run lesson:4
//
// "Vector search" sounds fancy but it's just: embed your documents once, embed
// the query, then sort documents by cosine similarity to the query. No keyword
// matching — results come back by MEANING. This is the heart of RAG, minus any
// LLM. Pinecone / pgvector / Chroma are optimised versions of this idea.
// ============================================================================

import { embed } from "../lib/model.js";
import { rankBySimilarity } from "../lib/vectors.js";
import { texts, topics } from "../data/corpus.js";
import { heading, c, bar, colorScore, pad } from "./_viz.js";

const queries = [
  "How do I cook something tasty?",
  "Tell me about planets and the universe.",
  "money and the economy",
  "a small furry animal",
];

console.log(heading("Lesson 4 · Semantic Search"));
console.log(c("dim", `Indexing ${texts.length} documents into vectors...\n`));

// Embed the whole corpus ONCE (this is your "index").
const corpusVecs = await embed(texts);

for (const query of queries) {
  // Embed the query with the same model, then rank.
  const [queryVec] = await embed(query);
  const ranked = rankBySimilarity(queryVec, corpusVecs).slice(0, 4);

  console.log(c("bold", `\n🔎  "${query}"`));
  console.log(c("dim", "   top matches by cosine similarity:\n"));
  ranked.forEach(({ index, score }, rank) => {
    console.log(
      "   " + c("dim", `${rank + 1}.`) + " " +
        bar(score, { max: 1, width: 20 }) + " " +
        colorScore(score) + " " +
        c("dim", `[${pad(topics[index], 11)}] `) +
        texts[index]
    );
  });
}

console.log(
  c("dim", "\nKeyword search for 'cook' would miss 'whisk the eggs' or 'add a pinch\n") +
    c("dim", "of salt'. Semantic search finds them because it matches meaning.\n")
);
console.log(c("green", "Next → npm run lesson:5  (visualize the whole vector space)\n"));
