# Module 2 · Embeddings

**Goal:** understand what the 384-number output *is*, and what "normalized" means.
**Run:** `npm run lesson:2` · **App tab:** ③ Embedding · **Time:** ~25 min

---

## The big idea

Feed the token IDs through the model and you get, for **each token**, a list of
384 numbers. We **pool** those into a single 384-number vector for the whole
input — the **embedding**. Same length (384) no matter if the input is one word
or one paragraph.

Think of it as a **fingerprint of meaning**: a point in a 384-dimensional space
where similar meanings land near each other.

## Two steps that turn tokens into one vector

### 1. Mean pooling
The model outputs one vector per token. **Average them** element-wise into a
single vector representing the whole sentence. (Averaging is the standard,
robust choice for sentence-transformers like MiniLM.)

### 2. Normalization
Scale that vector so its **length is exactly 1.0**, keeping its direction.

```
length = √(x₁² + x₂² + … + x₃₈₄²)
normalized[i] = x[i] / length
```

Why length 1? Because for comparing *meaning* we only care about **direction**,
not magnitude. After normalizing, every embedding sits on the surface of a unit
sphere — only direction distinguishes them. Bonus: it makes similarity math
faster (Module 3).

## Read the code

`lib/model.js` → `embed()`:

```js
const output = await extractor(list, { pooling: "mean", normalize: true });
return output.tolist();   // number[][], one 384-length array per input
```

`lib/vectors.js` → `magnitude()` and `normalize()` are the plain-JS versions of
the two formulas above. Read them — they're 3 lines each.

## What to observe when you run it

- Every printed vector reports `length (L2 norm): 1.0000` — proof of
  normalization.
- The first two sentences ("fluffy cat" / "kitten in sunlight") have visibly
  **similar sparkline shapes**; the finance sentence looks different. That visual
  similarity is what Module 3 turns into an exact number.
- Individual numbers are meaningless on their own — no single dimension is "the
  cat dimension." Meaning is spread across all 384.

## 🧪 Exercises

1. In `lessons/02-embeddings.js`, change `normalize: true`... wait — it's set in
   `lib/model.js`. Open that, flip it to `false`, re-run lesson 2. What happens to
   the printed length? (Set it back to `true` after.)
2. Add two paraphrases of the same idea and a totally unrelated sentence. Compare
   their sparklines by eye.
3. In the app's Embedding tab, type a 1-word input and a 30-word input. Confirm
   both produce exactly 384 components.

## Why "normalized" matters (the payoff, previewed)

Cosine similarity = `dot(a,b) / (len(a)·len(b))`. If both lengths are 1, the
denominator is 1, so **cosine = dot product** — a single fast loop. You'll use
this in Module 3.

## Key terms

**embedding**, **dimension (384-D)**, **mean pooling**, **L2 norm / magnitude**,
**normalize**, **unit vector**.

## ✅ Self-check

<details><summary>Q: Why is every embedding length ≈ 1.0?</summary>
Because we asked for <code>normalize: true</code> — each vector is scaled to unit
length so only its direction (meaning) matters.</details>

<details><summary>Q: Does dimension 7 of the vector mean something specific?</summary>
No. Meaning is distributed across all 384 dimensions; no single component is
individually interpretable.</details>

<details><summary>Q: A 2-word and a 200-word sentence — which has a longer vector?</summary>
Same length: 384 numbers, and after normalization both have magnitude 1. Input
length doesn't change the embedding size.</details>

**Next:** [Module 3 · Similarity](./03-similarity.md)
