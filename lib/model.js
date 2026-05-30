// ----------------------------------------------------------------------------
// lib/model.js
//
// This is the ONLY file that touches transformers.js. It turns text into
// embeddings. Everything else in the project works on plain number arrays.
//
// HOW THE STACK FITS TOGETHER
//   transformers.js  — JS library: tokenizer + model + pre/post-processing.
//   ONNX Runtime     — the engine transformers.js uses to actually run the
//                      neural network. The model weights ship as a `.onnx` file
//                      (a portable, framework-agnostic format). On Node it runs
//                      on CPU via `onnxruntime-node`; no Python, no GPU needed.
//   all-MiniLM-L6-v2 — a small, fast "sentence-transformer". Input: text.
//                      Output: a 384-dimensional embedding vector.
//
// The first run downloads the model (~25 MB quantized) from the Hugging Face
// Hub and caches it under ./.cache/models. After that it works fully offline.
// ----------------------------------------------------------------------------

import { pipeline, AutoTokenizer, env } from "@huggingface/transformers";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Cache downloaded models inside the project so the second run is instant/offline.
env.cacheDir = join(__dirname, "..", ".cache", "models");
// We are not bundling local .onnx files, so let it fetch from the Hub once.
env.allowLocalModels = false;

export const MODEL_ID = process.env.MODEL_ID || "Xenova/all-MiniLM-L6-v2";
export const EMBEDDING_DIM = 384; // all-MiniLM-L6-v2 output size

let embedderPromise = null;
let tokenizerPromise = null;

/** Lazily load the feature-extraction (embedding) pipeline. Cached forever. */
export function getEmbedder(onProgress) {
  if (!embedderPromise) {
    embedderPromise = pipeline("feature-extraction", MODEL_ID, {
      progress_callback: onProgress,
    }).catch((err) => {
      embedderPromise = null; // allow retry on next call
      throw friendlyError(err);
    });
  }
  return embedderPromise;
}

/** Lazily load just the tokenizer (for the "what does the model see?" lesson). */
export function getTokenizer() {
  if (!tokenizerPromise) {
    tokenizerPromise = AutoTokenizer.from_pretrained(MODEL_ID).catch((err) => {
      tokenizerPromise = null;
      throw friendlyError(err);
    });
  }
  return tokenizerPromise;
}

/**
 * Embed one or many strings into normalized 384-D vectors.
 *
 * pooling: "mean"  -> average the per-token vectors into one sentence vector.
 * normalize: true  -> scale to unit length so cosine similarity == dot product.
 *
 * @param {string|string[]} texts
 * @returns {Promise<number[][]>} one vector per input string
 */
export async function embed(texts, onProgress) {
  const list = Array.isArray(texts) ? texts : [texts];
  const extractor = await getEmbedder(onProgress);
  const output = await extractor(list, { pooling: "mean", normalize: true });
  // `output` is a Tensor of shape [n, 384]; .tolist() -> number[][].
  return output.tolist();
}

/**
 * Show what the model actually "reads": sub-word tokens and their integer IDs.
 * Transformers don't see words — they see WordPiece/BPE tokens. Big or rare
 * words get split into pieces (note the "##" continuation markers).
 *
 * @returns {Promise<{tokens: string[], ids: number[]}>}
 */
export async function tokenizeText(text) {
  const tokenizer = await getTokenizer();
  const tokens = tokenizer.tokenize(text); // sub-word strings
  const encoded = tokenizer(text); // includes special [CLS]/[SEP] tokens
  const ids = Array.from(encoded.input_ids.data, Number);
  return { tokens, ids };
}

function friendlyError(err) {
  const msg = String(err && err.message ? err.message : err);
  const looksLikeNetwork =
    /fetch|network|ENOTFOUND|EAI_AGAIN|403|forbidden|access to file|Failed to|getaddrinfo|Unexpected token|Could not locate|ECONNREFUSED|ETIMEDOUT/i.test(
      msg
    );
  if (looksLikeNetwork) {
    return new Error(
      `Could not download the model "${MODEL_ID}".\n` +
        `The FIRST run needs internet access to huggingface.co (after that it is cached offline).\n` +
        `If you are behind a proxy/firewall, set HF_ENDPOINT to a reachable mirror.\n` +
        `Original error: ${msg}`
    );
  }
  return err;
}
