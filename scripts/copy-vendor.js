// Copies the Plotly distribution from node_modules into public/vendor so the
// browser can load it locally — no CDN, everything stays in the Node ecosystem.
import { mkdirSync, copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const src = join(root, "node_modules", "plotly.js-dist-min", "plotly.min.js");
const destDir = join(root, "public", "vendor");
const dest = join(destDir, "plotly.min.js");

if (!existsSync(src)) {
  console.warn(
    "[copy-vendor] plotly.js-dist-min not found in node_modules — run `npm install` first."
  );
  process.exit(0);
}

mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
console.log(`[copy-vendor] Plotly copied -> public/vendor/plotly.min.js`);
