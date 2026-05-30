# 📚 Embeddings & transformers.js — a study curriculum

A self-paced course for doing NLP in pure Node.js (no LLM, no Python). Each
module pairs a **runnable script** (`lessons/NN-*.js`) with **study notes**
(`lessons/notes/NN-*.md`). Read the notes, run the script, do the exercises.

> New here? Read the top of the main [`README.md`](./README.md) first for the
> 30-second mental model, then come back.

---

## How to use this

For each module, in order:

1. **Read** the study note (`lessons/notes/NN-*.md`) — the *why*.
2. **Read the code** it points you to (usually a few commented lines in `lib/`).
3. **Run** the lesson (`npm run lesson:N`) and watch the visualization.
4. **Do the exercises** — edit the code/text and predict what changes.
5. **Self-check** — answer the questions at the bottom of the note.
6. **Play** in the web app (`npm start`) tab for that concept.

Don't rush. The whole foundation is ~2–3 focused hours.

---

## Prerequisites

- Node 18+ installed (`node --version`).
- `npm install` run once (downloads deps; first lesson run downloads the model).
- Comfort reading basic JavaScript. **No math background needed** — every
  formula is re-derived in plain English.

---

## The map

### Part A — Foundations (do these in order)

| # | Module | Runnable | Study notes | You'll be able to… |
|---|--------|----------|-------------|--------------------|
| 0 | **Orientation** | — | [00-orientation.md](./lessons/notes/00-orientation.md) | explain the whole text→vector→search pipeline |
| 1 | **Tokenization** | `npm run lesson:1` | [01-tokenization.md](./lessons/notes/01-tokenization.md) | explain how text becomes integer tokens |
| 2 | **Embeddings** | `npm run lesson:2` | [02-embeddings.md](./lessons/notes/02-embeddings.md) | explain what a 384-D vector *is* and normalization |
| 3 | **Similarity** | `npm run lesson:3` | [03-similarity.md](./lessons/notes/03-similarity.md) | measure meaning with cosine / dot / euclidean |
| 4 | **Semantic search** | `npm run lesson:4` | [04-semantic-search.md](./lessons/notes/04-semantic-search.md) | build a tiny vector database from scratch |
| 5 | **Clustering & PCA** | `npm run lesson:5` | [05-clustering.md](./lessons/notes/05-clustering.md) | visualize and cluster a high-D space |

Run all at once: `npm run lessons`.

### Part B — Where to go next (not yet built — ask and I'll add them)

| # | Module | Idea |
|---|--------|------|
| 6 | Chunking | split long documents into overlapping passages before embedding |
| 7 | A real vector store | persist embeddings to disk/SQLite, reload, search |
| 8 | k-means clustering | auto-discover groups with no labels |
| 9 | Zero-shot classification | label text by comparing to label embeddings |
| 10 | Reranking | two-stage retrieval with a cross-encoder |
| 11 | In-browser WebGPU | run the model client-side, no Node server |

---

## The code you'll keep coming back to

| File | What's in it |
|------|--------------|
| `lib/vectors.js` | **The math.** Cosine, dot, euclidean, ranking — all ~5 lines each. |
| `lib/pca.js` | From-scratch PCA (dimensionality reduction) for the plots. |
| `lib/model.js` | The *only* file that touches transformers.js / ONNX. |
| `data/corpus.js` | The sample sentences used by lessons 4 & 5. |

---

## A suggested schedule

- **Session 1 (~45 min):** Modules 0–2. Goal: "text is now a vector."
- **Session 2 (~45 min):** Modules 3–4. Goal: "I built semantic search."
- **Session 3 (~45 min):** Module 5 + the web app. Goal: "I can see the space."
- **Session 4:** Pick a Part B module and extend the project.

---

## Glossary (one-liners)

- **Token** — a sub-word piece of text mapped to an integer ID.
- **Embedding** — a fixed-length vector representing meaning (here, 384 numbers).
- **Normalize** — scale a vector to length 1 so only its *direction* matters.
- **Cosine similarity** — the angle between two vectors; +1 same, 0 unrelated.
- **Semantic search** — ranking documents by embedding similarity to a query.
- **PCA** — squashing high-D vectors to 2-D/3-D so you can plot them.
- **ONNX** — a portable neural-network file format; runs on ONNX Runtime (CPU).
- **transformers.js** — the JS library that ties tokenizer + model + ONNX together.
