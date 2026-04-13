import { readdir } from "node:fs/promises";
import { resolve } from "node:path";

async function listFilesRecursive(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const abs = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFilesRecursive(abs)));
    } else {
      files.push(abs);
    }
  }
  return files;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const distDir = resolve(process.cwd(), "dist");
  const files = await listFilesRecursive(distDir);
  const relative = files.map((f) => f.replace(`${distDir}/`, ""));
  assert(relative.includes("index.js"), "Missing dist/index.js");
  assert(relative.some((f) => f.endsWith(".d.ts")), "Missing declaration outputs in dist/");

  const disallowed = relative.filter(
    (f) =>
      f.includes("umd") ||
      f.endsWith(".umd.js") ||
      f.endsWith(".cjs") ||
      f.endsWith(".cjs.js")
  );
  assert(disallowed.length === 0, `Non-ESM outputs found: ${disallowed.join(", ")}`);

  console.log("ESM-only check passed: no UMD/CJS artifacts found.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
