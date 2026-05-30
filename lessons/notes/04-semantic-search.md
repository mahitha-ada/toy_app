# Module 4 · Semantic search

**Goal:** build a tiny vector database and search by meaning, not keywords.
**Run:** `npm run lesson:4` · **App tab:** ⑤ Search · **Time:** ~25 min

---

## The big idea

"Vector search" sounds fancy but it's three steps:

1. **Index once:** embed every document → store the vectors.
2. **Embed the query** with the *same* model.
3. **Rank:** sort documents by cosine similarity to the query. Return the top-k.

That's it. This is the **retrieval** half of RAG — and it needs **no LLM**.

## Read the code

`lib/vectors.js` → `rankBySimilarity()` — the whole search engine:

```js
export function rankBySimilarity(queryVec, corpusVecs) {
  return corpusVecs
    .map((v, index) => ({ index, score: cosineSimilarity(queryVec, v) }))
    .sort((a, b) => b.score - a.score);
}
```

`lessons/04-semantic-search.js` wires it together: embed `data/corpus.js` once,
then for each query embed it and rank.

## Why it beats keyword search

Keyword search for `"cook"` would **miss** "whisk the eggs" and "add a pinch of
salt" — no shared words. Semantic search finds them because their embeddings
point the same direction as the query "how do I cook something tasty?".

| | Keyword (BM25 / LIKE) | Semantic (vectors) |
|---|---|---|
| Matches | exact words | meaning |
| "car" finds "automobile"? | ❌ | ✅ |
| Typos / paraphrase | weak | strong |
| Needs embeddings | no | yes |

(Real systems often combine both — "hybrid search.")

## What to observe when you run it

- Each query's **top results are on-topic** even when wording differs.
- Scores are sorted descending; the bar length = the score.
- Try the included query `"a small furry animal"` — it surfaces the cat/dog
  sentences without containing any of those words.

## 🧪 Exercises

1. Add your own query to the `queries` array in `lessons/04-semantic-search.js`.
2. Add 3–4 of **your own documents** to `data/corpus.js` (give them a `topic`),
   then search for them.
3. **Scaling thought experiment:** this does `N` cosine comparisons per query.
   At 10 million documents that's slow. Read about **ANN indexes** (HNSW) — what
   real vector DBs (FAISS, pgvector, Pinecone) add on top of exactly this.

## From toy to real

- **Persist the index.** Right now we re-embed every run. Saving vectors to disk
  (JSON/SQLite) is Module 7 (ask me to build it).
- **Add generation.** Feed the top results to an LLM as context → that's **RAG**.
  Everything *here* — the retrieval — stays LLM-free.

## Key terms

**index**, **query vector**, **top-k**, **ranking**, **retrieval**, **RAG**,
**ANN (approximate nearest neighbour)**, **hybrid search**.

## ✅ Self-check

<details><summary>Q: What are the 3 steps of semantic search?</summary>
Embed the documents (index), embed the query, sort documents by cosine
similarity to the query.</details>

<details><summary>Q: Why does it find docs with no shared keywords?</summary>
It matches embedding direction (meaning), not surface words.</details>

<details><summary>Q: What do FAISS/pgvector add that this lesson doesn't?</summary>
An approximate-nearest-neighbour index so search stays fast over millions of
vectors instead of comparing against every one.</details>

**Next:** [Module 5 · Clustering & PCA](./05-clustering.md)
