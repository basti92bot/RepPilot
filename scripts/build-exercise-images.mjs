import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

// Mechanical, lossless format conversion only. Source PNGs are never modified.
// Usage: node scripts/build-exercise-images.mjs SOURCE_PACKAGE KNEELING_PNG
// Prints provenance JSON to stdout for review before committing.
const exec = promisify(execFile);
const root = path.resolve(import.meta.dirname, "..");
const [pack, kneeling] = process.argv.slice(2);
if (!pack || !kneeling) throw new Error("Source package and confirmed kneeling PNG required");
const spec = JSON.parse(fs.readFileSync(path.join(root, "exercise-image-spec.json")));
const mapping = JSON.parse(fs.readFileSync(path.join(pack, "exercise-mapping.json")));
const sourceById = Object.fromEntries(mapping.mappings.map(row => [row.asset, {
  path: path.join(pack, row.file), origin: row.origin
}]));
sourceById["bodyweight-calf-raise"] = { path: path.join(pack, "generated/bodyweight-calf-raise.png"), origin: "generated" };
sourceById["kneeling-torso-rotation-machine"] = { path: kneeling, origin: "generated" };
const ids = [...new Set([...Object.values(spec.mappings), "bodyweight-calf-raise"])].sort();
const dir = path.join(root, "assets/exercises/v" + spec.version);
fs.mkdirSync(dir, {recursive:true});
const sha = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const rows = [];
let position = 0;
await Promise.all(Array.from({length:4}, async () => {
  while (position < ids.length) {
    const id = ids[position++];
    const source = sourceById[id];
    if (!source) throw new Error("Missing native source: " + id);
    const sourceDimensions = (await exec("identify", ["-format", "%wx%h", source.path])).stdout;
    if (sourceDimensions !== "1254x1254") throw new Error("Unexpected native dimensions: " + id + " " + sourceDimensions);
    const output = path.join(dir, id + ".webp");
    await exec("convert", [source.path, "-define", "webp:lossless=true", "-define", "webp:method=6", output]);
    // ImageMagick compare returns nonzero for even one differing pixel.
    const comparison = await exec("compare", ["-metric", "AE", source.path, output, "null:"]);
    if (comparison.stderr.trim() !== "0") throw new Error("Pixel mismatch: " + id);
    const row = { id, file: path.relative(root, output), origin: source.origin,
      width:1254, height:1254, cropBottom:spec.cropBottom[id] || 0,
      bytes:fs.statSync(output).size, sha256:sha(output), sourcePngSha256:sha(source.path),
      losslessPixelComparison:"0 differing pixels" };
    rows.push(row);
    console.error("VERIFIED", id, row.bytes);
  }
}));
rows.sort((a,b) => a.id.localeCompare(b.id, "en"));
console.log(JSON.stringify({version:spec.version, date:spec.date, assets:rows}, null, 2));
