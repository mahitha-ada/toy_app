# Module 5 · Clustering & PCA

**Goal:** *see* a 384-D space by squashing it to 2-D/3-D, and measure clusters.
**Run:** `npm run lesson:5` · **App tab:** ⑥ Map (2D/3D) · **Time:** ~25 min

---

## The big idea

You can't picture 384 dimensions. **PCA** (Principal Component Analysis) finds
the few directions along which your data varies the most and projects everything
onto them — turning 384-D into 2-D or 3-D you can actually plot. If the model is
any good, sentences about the same topic land in the same region **with no labels
ever given to it**.

## How PCA works (intuition)

1. **Center** the points (subtract the mean) so the cloud sits on the origin.
2. Find the direction of **maximum spread** → that's **PC1** (principal
   component 1).
3. Find the next direction, perpendicular to PC1, with the most remaining
   spread → **PC2**. (And PC3, …)
4. **Project** every point onto PC1/PC2(/PC3) to get its 2-D/3-D coordinates.

"Explained variance" tells you how much of the original spread each PC captures.

## Read the code

`lib/pca.js`. It's a from-scratch implementation so nothing is hidden:

- `meanCenter()` — step 1.
- `covariance()` — how dimensions vary together.
- `topEigenvector()` — **power iteration** finds the max-spread direction.
- `deflate()` — remove a found component so the next iteration finds the next.
- `pca(rows, components)` — ties it together, returns `points` + `explained`.

You don't need to master eigenvectors to use it — but the code is there when
you're curious.

## Measuring a cluster (no PCA needed)

`lesson:5` also computes **cohesion**: the average cosine similarity of each
topic's sentences to that topic's **centroid** (mean vector). Tighter topic →
higher cohesion. See `centroid()` in `lib/vectors.js`.

## What to observe when you run it

- The ASCII scatter shows letters (A=animals, C=cooking, S=space…) and
  **same-topic letters cluster together**.
- Note the **explained variance** line — with only ~20 short sentences, 2–3 PCs
  capture a *modest* fraction (often 20–35%). That's expected: 384-D meaning
  doesn't fully fit in 2-D. The clustering is still visible.
- In the **web app** the same data is a rotatable 3-D scatter (or 2-D if your
  browser lacks WebGL).

## 🧪 Exercises

1. Add a brand-new topic (e.g. 4 sentences about **music**) to `data/corpus.js`
   and re-run. Does a new cluster appear?
2. Add a deliberately **ambiguous** sentence (e.g. "Python crushed the mouse" —
   snake? programming?) and see where it lands between clusters.
3. Compare the **2-D vs 3-D** map in the app. Does the 3rd component separate any
   topics that overlapped in 2-D?

## Caveats about these plots

- PCA is **linear**; it can flatten clusters that are actually well-separated in
  full-D. Tools like **t-SNE/UMAP** often look cleaner — but they distort
  distances and are easy to over-read. PCA is honest and dependency-free, which
  is why we use it here.
- Low explained variance does **not** mean the embeddings are bad — it means
  meaning genuinely needs many dimensions.

## Key terms

**PCA**, **principal component (PC1/PC2)**, **explained variance**, **centroid**,
**cohesion**, **dimensionality reduction**, (**t-SNE / UMAP** as alternatives).

## ✅ Self-check

<details><summary>Q: Why can't we just plot the raw 384-D vectors?</summary>
We can only see 2–3 dimensions; PCA reduces 384-D to 2-D/3-D while preserving as
much spread (variance) as possible.</details>

<details><summary>Q: The map shows topic clusters — who told the model the topics?</summary>
Nobody. Topics are only used to color the dots. The clustering emerges purely
from the meaning encoded in the embeddings.</details>

<details><summary>Q: PC1+PC2 explain only 30%. Is the model broken?</summary>
No — meaning is inherently high-dimensional. 2 components can't capture it all;
the visible clustering confirms the embeddings still work.</details>

---

## 🎓 You finished the foundations

You can now: tokenize → embed → normalize → compare → search → visualize, in pure
Node. See **Part B** in [`LESSONS.md`](../../LESSONS.md) for next modules
(chunking, persistent vector store, k-means, classification, reranking, WebGPU).
Ask and I'll build any of them into this repo.
