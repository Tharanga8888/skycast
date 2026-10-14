import fs from "node:fs";
import path from "node:path";

const SRC = "out";
const DEST = "extension";

fs.rmSync(DEST, { recursive: true, force: true });
fs.cpSync(SRC, DEST, { recursive: true });

// 1. Chrome reserves top-level names starting with "_"
for (const entry of fs.readdirSync(DEST)) {
  if (!entry.startsWith("_")) continue;
  const from = path.join(DEST, entry);
  if (entry === "_next") fs.renameSync(from, path.join(DEST, "next"));
  else fs.rmSync(from, { recursive: true, force: true });
}

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]
  );

// 2. Fix asset paths + move inline <script> blocks into files (MV3 CSP)
let inlineCount = 0;
for (const file of walk(DEST)) {
  if (!/\.(html|js|css|txt)$/.test(file)) continue;

  let content = fs.readFileSync(file, "utf8").replaceAll("/_next/", "/next/");

  if (file.endsWith(".html")) {
    content = content.replace(
      /<script(?![^>]*\ssrc=)([^>]*)>([\s\S]*?)<\/script>/g,
      (match, attrs, code) => {
        if (!code.trim()) return match;
        const name = `inline-${inlineCount++}.js`;
        fs.writeFileSync(path.join(DEST, name), code);
        return `<script src="/${name}"${attrs}></script>`;
      }
    );
  }
  fs.writeFileSync(file, content);
}

console.log(`Extension built in ./${DEST} (${inlineCount} inline scripts extracted)`);