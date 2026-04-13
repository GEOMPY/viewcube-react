import { execSync } from "node:child_process";
import { mkdtemp, rm, writeFile, unlink, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

function run(command, cwd) {
  execSync(command, { cwd, stdio: "inherit" });
}

function runText(command, cwd) {
  return execSync(command, { cwd, encoding: "utf8" });
}

async function main() {
  const root = process.cwd();
  const pkgJson = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
  const packageName = pkgJson?.name;
  if (typeof packageName !== "string" || packageName.length === 0) {
    throw new Error("Unable to resolve package name from package.json.");
  }
  const packJson = JSON.parse(runText("npm pack --json", root));
  const filename = packJson[0]?.filename;
  if (!filename) throw new Error("npm pack did not produce a tarball filename.");
  const tarballPath = resolve(root, filename);

  const consumerDir = await mkdtemp(resolve(tmpdir(), "viewcube-react-consumer-"));
  try {
    await writeFile(
      resolve(consumerDir, "package.json"),
      JSON.stringify(
        {
          name: "viewcube-react-smoke-consumer",
          private: true,
          type: "module",
        },
        null,
        2
      ),
      "utf8"
    );

    run(
      `npm install "${tarballPath}" react react-dom three @react-three/fiber @react-three/drei typescript @types/react @types/react-dom --no-package-lock`,
      consumerDir
    );

    await writeFile(
      resolve(consumerDir, "tsconfig.json"),
      JSON.stringify(
        {
          compilerOptions: {
            strict: true,
            target: "ES2022",
            module: "ESNext",
            moduleResolution: "Bundler",
            jsx: "react-jsx",
            noEmit: true,
            skipLibCheck: true,
          },
          include: ["index.tsx"],
        },
        null,
        2
      ),
      "utf8"
    );

    await writeFile(
      resolve(consumerDir, "index.tsx"),
      [
        `import type { ViewCubeProps } from "${packageName}";`,
        `import { ViewCube } from "${packageName}";`,
        "",
        'const props: ViewCubeProps = { placement: "top-right", showZoom: true };',
        "void props;",
        "void ViewCube;",
        "",
      ].join("\n"),
      "utf8"
    );

    run("npx tsc --noEmit", consumerDir);
    run(`node -e "import('${packageName}').then(() => console.log('packed import ok'))"`, consumerDir);
    console.log("Packed consumer smoke check passed.");
  } finally {
    await rm(consumerDir, { recursive: true, force: true });
    await unlink(tarballPath).catch(() => {});
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
