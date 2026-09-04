import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {spawnSync} from "node:child_process";
import assert from "node:assert/strict";

// Pass a JSON object mapping stable image IDs to native generated PNG paths.
// Only lossless format conversion is allowed. No resizing or cropping.
const sources=JSON.parse(process.argv[2]);
const directory="assets/exercises/v11.8.122";
const sha=bytes=>crypto.createHash("sha256").update(bytes).digest("hex");
fs.mkdirSync(directory,{recursive:true});
const assets=[];
for(const [id,source] of Object.entries(sources).sort(([a],[b])=>a.localeCompare(b))){
  assert.match(id,/^[a-z0-9-]+$/);
  const png=fs.readFileSync(source);
  assert.equal(png.readUInt32BE(16),1254);
  assert.equal(png.readUInt32BE(20),1254);
  const file=path.posix.join(directory,id+".webp");
  const convert=spawnSync("convert",[source,"-define","webp:lossless=true",file],{encoding:"utf8"});
  assert.equal(convert.status,0,convert.stderr);
  const comparison=spawnSync("compare",["-metric","AE",source,file,"null:"],{encoding:"utf8"});
  assert.equal(comparison.status,0,comparison.stderr);
  assert.equal(comparison.stderr.trim(),"0");
  const bytes=fs.readFileSync(file);
  assert.equal(bytes.toString("ascii",12,16),"VP8L");
  assets.push({id,file,origin:"generated",width:1254,height:1254,cropBottom:0,bytes:bytes.length,
    sha256:sha(bytes),sourcePngSha256:sha(png),losslessPixelComparison:"0 differing pixels"});
}
process.stdout.write(JSON.stringify({version:"11.8.122",date:"2026-09-04",assets},null,2)+"\n");
