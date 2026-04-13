import fs from "node:fs";
import path from "node:path";

const filesToValidate = [
  "vite.config.ts",
  "tsconfig.json",
  "tsconfig.build.json",
  "index.html",
  "src/main.tsx",
  "src/App.tsx",
  "src/index.ts",
  "src/lib/types.ts",
];

const missing = filesToValidate.filter(
  (relativePath) => !fs.existsSync(path.resolve(process.cwd(), relativePath))
);

if (missing.length > 0) {
  console.error("[phase0] Missing required scaffold/build entry files:");
  for (const file of missing) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

console.log("[phase0] build entry files check passed.");
