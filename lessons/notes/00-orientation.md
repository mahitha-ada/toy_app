# Module 0 · Orientation

**Goal:** hold the whole pipeline in your head before touching any code.
**Time:** ~10 min reading. **Runnable:** none.

---

## The one diagram to remember

```
  text  ──►  tokenizer  ──►  model (MiniLM on ONNX)  ──►  pool + normalize  ──►  vector
 "a cat"      [101,4937,102]        per-token numbers          one 384-D arrow      [0.02,-0.07,…]
```

Everything in this course is one of these stages, or something you do *with*
the final vector (compare it, search it, plot it).

## The four words in the project title

- **transformers.js** — the JavaScript library (`@huggingface/transformers`)
  that runs the whole pipeline above in Node or the browser.
- **ONNX** — the *file format* the model ships in, run by **ONNX Runtime** on
  your CPU. No GPU, no Python. transformers.js calls it for you.
- **embedding** — the output vector: a fixed list of numbers (384 here) that
  encodes the *meaning* of the input text.
- **vector** — that list of numbers. All the "AI search" is plain arithmetic on
  these (see `lib/vectors.js`).

## The single most important idea

> Once text is a vector, **meaning becomes geometry**.
> Similar meanings → arrows pointing the same direction → high cosine similarity.

If you internalize only that sentence, the rest of the course is detail.

## What this is NOT

- **Not an LLM.** This model doesn't *generate* text. It *measures* meaning.
  That's exactly what you want for search, clustering, dedup, classification,
  recommendations.
- **Not magic.** No hidden services. The model runs locally; the comparisons are
  five-line functions you can read.

## Setup check

```bash
node --version     # expect v18+ (v22 ideal)
npm install        # once
```

The first time you run any lesson it downloads the model (~25 MB) and caches it
in `.cache/`. After that it's fully offline.

## ✅ Self-check

<details><summary>Q: Why don't we need a GPU or Python?</summary>
The model is a small encoder stored in ONNX format and executed by ONNX Runtime
on the CPU, all driven from Node by transformers.js.</details>

<details><summary>Q: What does "meaning becomes geometry" mean in practice?</summary>
Two sentences that mean similar things produce vectors pointing in nearly the
same direction, so the angle between them (cosine similarity) is close to 1.</details>

**Next:** [Module 1 · Tokenization](./01-tokenization.md)
