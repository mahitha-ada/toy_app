# 🧭 Embeddings Playground — learn transformers.js, ONNX, embeddings & vectors

A hands-on tutorial for doing real NLP **entirely in the Node.js ecosystem** —
no Python, no LLM, no Ollama, no paid API. Just a small neural network running
locally on your CPU, turning text into vectors you can search and visualize.

It comes in two halves:

1. **Five runnable CLI lessons** (`/lessons`) that teach one concept at a time,
   with visual output right in your terminal.
2. **An interactive web app** (`npm start`) with charts, heatmaps, gauges and
   rotatable 2-D/3-D maps of the "meaning space".

---

## The mental model (read this first)

```
   "a fluffy cat"
        │
        ▼   tokenizer            → splits text into sub-word tokens + integer IDs
   [101, 1037, 13030, 4937, 102]
        │
        ▼   MiniLM model         → a transformer neural network…
        │   (runs on ONNX Runtime, on your CPU, via transformers.js)
        ▼
   384 numbers per token
        │
        ▼   mean-pool + normalize → squash to ONE vector for the whole sentence
        ▼
   [0.021, -0.067, 0.044, … ]   ← a 384-dimensional EMBEDDING
```

Once text is a **vector**, "meaning" becomes **geometry**:

- **Similar meanings → vectors point the same way** (small angle between them).
- We measure that angle with **cosine similarity** (`+1` same, `0` unrelated, `-1` opposite).
- **Semantic search** = embed your documents, embed the query, sort by cosine similarity.
- To *see* the space, we use **PCA** to squash 384-D down to 2-D/3-D and plot it.

### The four words in the title

| Term | What it actually is |
| --- | --- |
| **transformers.js** | A JavaScript library (`@huggingface/transformers`) that runs Hugging Face models in Node and the browser. Handles tokenizing, running the model, and post-processing. |
| **ONNX** | *Open Neural Network Exchange* — a portable file format for neural networks. The model ships as a `.onnx` file and runs on **ONNX Runtime** (CPU here, no GPU/Python needed). transformers.js uses it under the hood. |
| **embedding** | A fixed-length list of numbers (a vector) representing the meaning of some text. Here: **384 numbers**, regardless of input length. |
| **vector** | The embedding itself. All the "AI" search magic is just dot products and cosine angles between these vectors — plain math you can read in `lib/vectors.js`. |

---

## Setup

Requires **Node 18+** (tested on Node 22).

```bash
npm install        # installs deps + copies Plotly into public/vendor (no CDN)
```

> **First run needs internet.** The embedding model (~25 MB, quantized) is
> downloaded once from huggingface.co and cached in `./.cache/models`. After
> that everything runs **fully offline**. Behind a firewall? Point
> `HF_ENDPOINT` at a reachable mirror.

---

## Part 1 — The CLI lessons

Run them in order. Each prints an explanation plus a visualization.

```bash
npm run lesson:1     # Tokenization — what the model actually reads
npm run lesson:2     # Embeddings — one sentence → 384 numbers
npm run lesson:3     # Similarity — cosine/dot/euclidean + a heatmap
npm run lesson:4     # Semantic search — a vector DB in 10 lines
npm run lesson:5     # PCA projection — SEE the clusters (ASCII scatter)

npm run lessons      # run all five back-to-back
```

What each one teaches:

| Lesson | Concept | You'll see |
| --- | --- | --- |
| **1 · Tokenization** | Text → sub-word tokens → integer IDs | tokens lined up with their vocab IDs; `##` continuation pieces |
| **2 · Embeddings** | A sentence becomes a fixed 384-D vector | the vector as a unicode "sparkline"; why its length ≈ 1.0 |
| **3 · Similarity** | Comparing meaning is comparing vectors | cosine vs dot vs euclidean; a colored N×N heatmap |
| **4 · Semantic search** | Ranking documents by meaning, not keywords | bar-chart relevance scores for several queries |
| **5 · Clustering** | High-D space projected to 2-D | an ASCII scatter plot where topics visibly separate |

---

## Part 2 — The interactive web app

```bash
npm start            # → http://localhost:3000
```

Six tabs, each maximally visual:

1. **Overview** — embed the whole sample corpus, then view it as a **rotatable
   3-D PCA map** *and* a **pairwise similarity heatmap** side by side.
2. **Tokenize** — type anything, see the sub-word **token chips** + IDs.
3. **Embedding** — see one sentence's 384 components as a **bar chart** and a
   **heat strip**; watch the fingerprint change as you edit the text.
4. **Similarity** — a **gauge** for two sentences, and a **labelled heatmap**
   matrix for a list.
5. **Search** — semantic search over the corpus with **animated score bars**.
6. **Map (2D/3D)** — project the corpus *or your own pasted sentences* into a
   **2-D or 3-D scatter** and watch related sentences cluster.

---

## Project layout

```
.
├── lib/
│   ├── model.js       # the ONLY file that touches transformers.js / ONNX
│   ├── vectors.js     # cosine, dot, euclidean, ranking, similarity matrix
│   └── pca.js         # from-scratch PCA (power iteration) for 2-D/3-D plots
├── lessons/           # the five CLI lessons (+ _viz.js terminal helpers)
├── data/corpus.js     # ~20 labelled sentences across 5 topics
├── public/            # the web app (index.html, app.js, styles.css)
├── scripts/           # postinstall: copy Plotly from node_modules → public/vendor
└── server.js          # tiny Express API exposing the model to the browser
```

**Where to actually learn the magic:** open `lib/vectors.js`. Cosine
similarity and "vector search" are about 5 lines of arithmetic each — there is
no hidden machinery.

---

## FAQ / notes

- **No LLM is used anywhere.** This is an *embedding* model (encoder only). It
  doesn't generate text — it measures meaning. That's exactly what you want for
  search, clustering, classification, dedup, and recommendations.
- **Swap the model:** set `MODEL_ID`, e.g.
  `MODEL_ID=Xenova/bge-small-en-v1.5 npm start`. Any Hugging Face
  feature-extraction model with ONNX weights works (output dimension may differ).
- **This is the seed of a real vector database.** Production systems (pgvector,
  Pinecone, Chroma, FAISS) add an *approximate nearest-neighbour index* so search
  stays fast over millions of vectors — but the core idea is exactly Lesson 4.
- **Add a generation step later** and you have **RAG** (retrieval-augmented
  generation) — but everything here, the retrieval half, needs no LLM at all.
```
