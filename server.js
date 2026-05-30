// ============================================================================
// server.js — the tutorial web app
// ============================================================================
// A tiny Express server that exposes the embedding model to the browser through
// a handful of JSON endpoints, and serves the interactive visualizations in
// /public. Run with:  npm start   then open http://localhost:3000
// ============================================================================

import express from "express";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { embed, tokenizeText, MODEL_ID, EMBEDDING_DIM } from "./lib/model.js";
import { similarityMatrix, rankBySimilarity, cosineSimilarity } from "./lib/vectors.js";
import { pca } from "./lib/pca.js";
import { corpus, texts as corpusTexts, topics, topicColors } from "./data/corpus.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.static(join(__dirname, "public")));

// Wrap async handlers so thrown errors become clean 500s with a message.
const wrap = (fn) => (req, res) =>
  fn(req, res).catch((err) => {
    console.error(err);
    res.status(500).json({ error: String(err.message || err) });
  });

// --- Metadata --------------------------------------------------------------
app.get("/api/info", (req, res) => {
  res.json({ model: MODEL_ID, dim: EMBEDDING_DIM });
});

app.get("/api/corpus", (req, res) => {
  res.json({ corpus, topicColors });
});

// --- Lesson 1: tokenization ------------------------------------------------
app.post(
  "/api/tokenize",
  wrap(async (req, res) => {
    const text = String(req.body?.text ?? "");
    res.json(await tokenizeText(text));
  })
);

// --- Lesson 2: raw embedding for one input ---------------------------------
app.post(
  "/api/embed",
  wrap(async (req, res) => {
    const input = req.body?.texts ?? req.body?.text ?? [];
    const list = Array.isArray(input) ? input : [input];
    const vectors = await embed(list);
    res.json({ vectors, dim: EMBEDDING_DIM });
  })
);

// --- Lesson 3: pairwise similarity matrix ----------------------------------
app.post(
  "/api/similarity",
  wrap(async (req, res) => {
    const list = (req.body?.texts ?? []).map(String).filter((s) => s.trim());
    if (list.length < 2) return res.status(400).json({ error: "Provide at least 2 sentences." });
    const vectors = await embed(list);
    res.json({ labels: list, matrix: similarityMatrix(vectors) });
  })
);

// --- Lesson 4: semantic search ---------------------------------------------
// Uses the built-in corpus unless the client supplies its own `docs`.
app.post(
  "/api/search",
  wrap(async (req, res) => {
    const query = String(req.body?.query ?? "").trim();
    if (!query) return res.status(400).json({ error: "Query is required." });
    const docs = Array.isArray(req.body?.docs) && req.body.docs.length
      ? req.body.docs.map(String)
      : corpusTexts;
    const docTopics = docs === corpusTexts ? topics : docs.map(() => "custom");

    const docVecs = await embed(docs);
    const [queryVec] = await embed(query);
    const ranked = rankBySimilarity(queryVec, docVecs).map((r) => ({
      ...r,
      text: docs[r.index],
      topic: docTopics[r.index],
    }));
    res.json({ query, results: ranked });
  })
);

// --- Lesson 5: PCA projection to 2-D / 3-D ---------------------------------
app.post(
  "/api/project",
  wrap(async (req, res) => {
    const components = req.body?.components === 3 ? 3 : 2;
    const useCorpus = req.body?.texts == null;
    const list = useCorpus ? corpusTexts : req.body.texts.map(String).filter(Boolean);
    const pointTopics = useCorpus ? topics : list.map(() => "custom");
    if (list.length < 2) return res.status(400).json({ error: "Provide at least 2 sentences." });

    const vectors = await embed(list);
    const { points, explained } = pca(vectors, components);
    res.json({
      points,
      explained,
      labels: list,
      topics: pointTopics,
      topicColors,
    });
  })
);

// --- Convenience: full pipeline for the corpus (used by the overview tab) ---
app.get(
  "/api/overview",
  wrap(async (req, res) => {
    const vectors = await embed(corpusTexts);
    const { points, explained } = pca(vectors, 3);
    res.json({
      corpus,
      points,
      explained,
      matrix: similarityMatrix(vectors),
      topicColors,
    });
  })
);

app.listen(PORT, () => {
  console.log(`\n  Embeddings tutorial running →  http://localhost:${PORT}`);
  console.log(`  Model: ${MODEL_ID} (${EMBEDDING_DIM}-D)`);
  console.log(`  First request downloads the model once (~25 MB), then it's cached.\n`);
});
