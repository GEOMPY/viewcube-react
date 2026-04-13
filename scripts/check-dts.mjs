import fs from "node:fs";
import path from "node:path";

const expected = [
  "dist/index.d.ts",
  "dist/lib/types.d.ts",
  "dist/lib/ViewCube.d.ts",
];

const missing = expected.filter((relativePath) => !fs.existsSync(path.resolve(process.cwd(), relativePath)));

if (missing.length > 0) {
  console.error("[phase1] Missing declaration files:");
  missing.forEach((file) => console.error(`- ${file}`));
  process.exit(1);
}

console.log("[phase1] declaration files check passed.");
