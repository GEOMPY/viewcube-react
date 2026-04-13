import fs from "node:fs";
import path from "node:path";

const pkgPath = path.resolve(process.cwd(), "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

const exportMap = pkg.exports?.["."];
const importEntry = exportMap?.import;
const typesEntry = exportMap?.types;

const missingConfig = [];
if (!importEntry) missingConfig.push("exports['.'].import");
if (!typesEntry) missingConfig.push("exports['.'].types");

if (missingConfig.length > 0) {
  console.error("[phase1] Missing export map fields:");
  missingConfig.forEach((field) => console.error(`- ${field}`));
  process.exit(1);
}

const missingFiles = [];
if (!fs.existsSync(path.resolve(process.cwd(), importEntry))) missingFiles.push(importEntry);
if (!fs.existsSync(path.resolve(process.cwd(), typesEntry))) missingFiles.push(typesEntry);

if (missingFiles.length > 0) {
  console.error("[phase1] Export entries do not resolve to files:");
  missingFiles.forEach((file) => console.error(`- ${file}`));
  process.exit(1);
}

console.log("[phase1] export map check passed.");
