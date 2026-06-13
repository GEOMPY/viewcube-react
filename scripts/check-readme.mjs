import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

function assertIncludes(content, needle, message) {
  if (!content.includes(needle)) {
    throw new Error(message);
  }
}

async function main() {
  const readmePath = resolve(process.cwd(), "README.md");
  const readme = await readFile(readmePath, "utf8");

  const requiredHeadings = [
    "## Install",
    "## Quick Start",
    "## Required Contract",
    "## API Reference",
    "## Recipes",
    "## Troubleshooting",
    "## Example Integration Snippet (Refs Explicit)",
  ];

  for (const heading of requiredHeadings) {
    assertIncludes(readme, heading, `README missing required section: ${heading}`);
  }

  const requiredSnippets = [
    "<ViewCube controlsRef={controlsRef} focusRef={modelRef} />",
    "<OrbitControls ref={controlsRef} makeDefault />",
    "### With `focusRef`",
    "### Without Controls",
  ];

  for (const snippet of requiredSnippets) {
    assertIncludes(readme, snippet, `README missing required snippet: ${snippet}`);
  }

  const requiredPropNames = [
    "`controlsRef?: RefObject<unknown>`",
    "`viewCubeRef?: RefObject<ViewCubeHandle | null>`",
    "`className?: string`",
    "`style?: React.CSSProperties`",
  ];

  for (const propLine of requiredPropNames) {
    assertIncludes(readme, propLine, `README API section missing prop line: ${propLine}`);
  }

  console.log("README check passed: required sections, snippets, and prop lines exist.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
