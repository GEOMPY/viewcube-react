import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

function assertIncludes(content, needle, message) {
  if (!content.includes(needle)) {
    throw new Error(message);
  }
}

async function main() {
  const appPath = resolve(process.cwd(), "src/App.tsx");
  const app = await readFile(appPath, "utf8");

  assertIncludes(app, 'from "@react-three/fiber"', "Smoke check failed: sample app must import Canvas.");
  assertIncludes(app, 'from "@react-three/drei"', "Smoke check failed: sample app must import OrbitControls.");
  assertIncludes(app, 'from "./lib/ViewCube"', "Smoke check failed: sample app must import ViewCube.");
  assertIncludes(app, "<Canvas", "Smoke check failed: sample app must render Canvas.");
  assertIncludes(app, "<OrbitControls", "Smoke check failed: sample app must render OrbitControls.");
  assertIncludes(app, "<ViewCube", "Smoke check failed: sample app must render ViewCube.");

  console.log("Smoke sample check passed: App.tsx wires Canvas + OrbitControls + ViewCube.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
