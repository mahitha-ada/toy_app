// Runs all five lessons back-to-back.  Usage:  npm run lessons
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const lessons = [
  "01-tokenization.js",
  "02-embeddings.js",
  "03-similarity.js",
  "04-semantic-search.js",
  "05-clustering.js",
];

for (const file of lessons) {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [join(__dirname, file)], { stdio: "inherit" });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${file} exited ${code}`))));
  });
}
