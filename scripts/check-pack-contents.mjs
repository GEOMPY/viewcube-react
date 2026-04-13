import { execSync } from "node:child_process";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function getPackJsonDryRun() {
  const raw = execSync("npm pack --json --dry-run", { encoding: "utf8" }).trim();
  const parsed = JSON.parse(raw);
  assert(Array.isArray(parsed) && parsed.length > 0, "npm pack --json --dry-run returned no entries.");
  return parsed[0];
}

function main() {
  const pack = getPackJsonDryRun();
  const files = Array.isArray(pack.files) ? pack.files.map((f) => f.path) : [];
  assert(files.length > 0, "Dry-run pack file list is empty.");

  const required = ["dist/index.js", "dist/index.d.ts", "README.md", "package.json"];
  for (const path of required) {
    assert(files.includes(path), `Pack is missing required file: ${path}`);
  }

  const blockedPrefixes = ["src/", "tests/", "docs/", "scripts/", ".github/"];
  const leaked = files.filter((file) => blockedPrefixes.some((prefix) => file.startsWith(prefix)));
  assert(leaked.length === 0, `Pack includes non-runtime files: ${leaked.join(", ")}`);

  console.log("Pack content check passed: runtime and types included, sources excluded.");
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
