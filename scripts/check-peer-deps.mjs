import fs from "node:fs";
import path from "node:path";

const pkgPath = path.resolve(process.cwd(), "package.json");
const pkgRaw = fs.readFileSync(pkgPath, "utf-8");
const pkg = JSON.parse(pkgRaw);

const requiredPeers = [
  "react",
  "react-dom",
  "three",
  "@react-three/fiber",
  "@react-three/drei",
];

const peerDependencies = pkg.peerDependencies ?? {};
const missing = requiredPeers.filter((dep) => !peerDependencies[dep]);

if (missing.length > 0) {
  console.error("[phase0] Missing required peerDependencies:");
  for (const dep of missing) {
    console.error(`- ${dep}`);
  }
  process.exit(1);
}

console.log("[phase0] peerDependencies check passed.");
