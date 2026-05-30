# Module 3 · Similarity

**Goal:** measure how close two meanings are, three different ways.
**Run:** `npm run lesson:3` · **App tab:** ④ Similarity · **Time:** ~25 min

---

## The big idea

Now that text is a vector, "do these two sentences mean the same thing?" becomes
a **geometry** question: how aligned are the two arrows?

## The three metrics

### Cosine similarity ⭐ (the one you'll use)
The cosine of the **angle** between two vectors.

```
cosine(a,b) = dot(a,b) / (len(a) · len(b))
```

- `+1` → same direction (same meaning)
- ` 0` → perpendicular (unrelated)
- `-1` → opposite

It ignores magnitude, so it compares *meaning*, not sentence length/emphasis.

### Dot product
Multiply matching components and sum. For **normalized** vectors,
`dot == cosine` (because the denominator is 1). That's why we normalized in
Module 2 — search becomes a single fast multiply-add loop.

### Euclidean distance
Straight-line distance between the arrow tips. Smaller = closer. For normalized
vectors it *ranks* neighbours the same way cosine does, just inverted.

## Read the code

`lib/vectors.js` — read these four, each is tiny:

```js
dot(a,b)                 // Σ aᵢ·bᵢ
magnitude(a)             // √Σ aᵢ²
cosineSimilarity(a,b)    // dot / (mag·mag)
euclideanDistance(a,b)   // √Σ (aᵢ-bᵢ)²
similarityMatrix(vectors)// every pair → an N×N grid
```

That's the entire "AI similarity engine." No hidden machinery.

## What to observe when you run it

- The two **cat** sentences and the two **market** sentences pair up strongly,
  **even though they share almost no words**. That's *semantic* similarity, not
  keyword overlap.
- `cosine` and `dot` print the **same number** (vectors are normalized).
- In the heatmap, bright/green cells = related meaning; the diagonal is always
  `1.0` (every sentence vs itself).

## 🧪 Exercises

1. In `lessons/03-similarity.js`, add a sentence that is a **paraphrase** of an
   existing one and a sentence that **shares words but not meaning** (e.g.
   "I deposited a cat at the bank" vs "river bank"). Inspect the matrix.
2. Add `"The cat is NOT sleeping."` next to `"The cat is sleeping."` — does the
   model capture negation well? (Spoiler: embeddings are famously weak at
   negation — a great limitation to discover yourself.)
3. Use the app's gauge to find two sentences scoring ~0.0 (truly unrelated) and
   two scoring ~0.9.

## Common pitfalls

- **Cosine can be negative**, but for these models real text pairs usually land
  in roughly `0.0–1.0`; very negative values are rare.
- **High similarity ≠ identical.** 0.85 means "very related," not "the same."
- Don't compare scores across **different models** — scales differ.

## Key terms

**cosine similarity**, **dot product**, **euclidean distance**, **similarity
matrix**, **semantic vs lexical (keyword) similarity**.

## ✅ Self-check

<details><summary>Q: Why do cosine and dot product print the same value here?</summary>
Because the vectors are normalized (length 1), so the denominator in the cosine
formula is 1 and cosine reduces to the dot product.</details>

<details><summary>Q: Two sentences share zero words but score 0.8. How?</summary>
The model encodes meaning, not words. Synonymous/related sentences point in
similar directions regardless of exact wording.</details>

<details><summary>Q: What's always on the diagonal of the similarity matrix?</summary>
1.0 — each sentence is perfectly similar to itself.</details>

**Next:** [Module 4 · Semantic search](./04-semantic-search.md)
