import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Republic of Caelmar — Cliff-Lift Operator's Passport.
// Copies the illustrated passport spread (entry.png) to the output
// directory the grader reads. Node 22, ESM, stdlib only.

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "entry.png");
const outDir = (process.env.MAKEFUN_OUTPUT_DIR || "").trim() || "/output";
const target = join(outDir, "entry.png");

if (!existsSync(source)) {
  throw new Error(`entry.png not found next to main.ts: ${source}`);
}

// The entry must be a real PNG, exactly 1024x1024: check the signature
// and the IHDR width/height before copying anything out.
const header = readFileSync(source);
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (header.length < 24 || !header.subarray(0, 8).equals(pngSignature)) {
  throw new Error("entry.png is not a PNG file");
}
const width = header.readUInt32BE(16);
const height = header.readUInt32BE(20);
if (width !== 1024 || height !== 1024) {
  throw new Error(`entry.png is ${width}x${height}, expected 1024x1024`);
}

mkdirSync(outDir, { recursive: true });
copyFileSync(source, target);

const bytes = statSync(target).size;
if (bytes > 1048576) {
  throw new Error(`entry.png is ${bytes} bytes, over the 1 MiB cap`);
}

console.log(`wrote entry.png (${bytes} bytes)`);
