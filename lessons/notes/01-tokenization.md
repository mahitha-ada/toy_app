# Module 1 · Tokenization

**Goal:** understand how raw text becomes the integers a model can process.
**Run:** `npm run lesson:1` · **App tab:** ② Tokenize · **Time:** ~20 min

---

## The big idea

A neural network only does math on numbers — it can't read letters. So the very
first step is **tokenization**: chop the text into small pieces ("tokens") and
map each piece to an integer **ID** from the model's fixed **vocabulary**.

MiniLM uses **WordPiece** tokenization (sub-word). Common words are one token;
rare or long words get split into pieces:

```
"tokenization"  →  ["token", "##ization"]
```

The `##` means "this piece attaches to the previous one" (no space before it).

## What happens under the hood

1. Lowercase / clean the text (this model is uncased).
2. Greedily match the longest pieces that exist in the vocabulary.
3. Wrap the sequence with **special tokens**: `[CLS]` at the start, `[SEP]` at
   the end. These are placeholders the model is trained to use.
4. Convert every token to its integer ID.

So `"hi"` becomes roughly `[CLS] hi [SEP]` → `[101, 7632, 102]`.

## Read the code

`lib/model.js` → `tokenizeText()`:

```js
const tokens  = tokenizer.tokenize(text);   // ["token","##ization", …]
const encoded = tokenizer(text);             // adds [CLS]/[SEP], returns IDs
const ids     = Array.from(encoded.input_ids.data, Number);
```

`tokenize()` gives you the human-readable pieces; calling the tokenizer as a
function gives you the full ID sequence (with special tokens) the model receives.

## What to observe when you run it

- Short common words = **one** token. Try the third sample,
  `"antidisestablishmentarianism"` — it shatters into many `##` pieces.
- The **id count is 2 more than the token count** — that's `[CLS]` and `[SEP]`.
- The same word can tokenize differently depending on surrounding characters.

## 🧪 Exercises

1. Edit the `samples` array in `lessons/01-tokenization.js`. Add:
   - an emoji 🐱, a URL, and a made-up word like `"flibbertijibbet"`.
   Predict the token count *before* running, then check.
2. In the app's Tokenize tab, type `"unbelievable"` vs `"un believable"`. Why do
   they differ?
3. Find one word that becomes a **single** token and one that becomes **four+**.

## Why it matters later

The model produces **one vector per token**. Module 2 shows how those per-token
vectors get pooled into a single sentence embedding. Tokenization also explains
why very long inputs get truncated — there's a max token limit (512 here).

## Key terms

**token**, **vocabulary**, **WordPiece / sub-word**, **token ID**, **special
tokens** (`[CLS]`, `[SEP]`), **uncased**.

## ✅ Self-check

<details><summary>Q: What does a leading "##" mean?</summary>
The token is a continuation of the previous token (no preceding space) — the two
pieces were split from one word.</details>

<details><summary>Q: Why are there 2 more IDs than tokens?</summary>
The tokenizer adds the special <code>[CLS]</code> and <code>[SEP]</code> tokens
around your sequence.</details>

<details><summary>Q: If two models give different IDs for the same word, who's wrong?</summary>
Neither — each model has its own vocabulary and tokenizer. IDs are only
meaningful relative to one model.</details>

**Next:** [Module 2 · Embeddings](./02-embeddings.md)
