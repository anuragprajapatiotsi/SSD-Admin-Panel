import {
  cpSync,
  existsSync,
  mkdirSync,
  rmSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fortuneSheetPackages = resolve(frontendRoot, "../fortune-sheet/packages");
const vendorRoot = resolve(frontendRoot, "vendor/fortune-sheet");

for (const packageName of ["core", "react"]) {
  const sourceRoot = resolve(fortuneSheetPackages, packageName);
  const sourceDist = resolve(sourceRoot, "dist");
  const sourceManifest = resolve(sourceRoot, "package.json");
  const destinationRoot = resolve(vendorRoot, packageName);

  for (const requiredPath of [
    sourceManifest,
    resolve(sourceDist, "index.js"),
    resolve(sourceDist, "index.esm.js"),
    resolve(sourceDist, "index.d.ts"),
  ]) {
    if (!existsSync(requiredPath)) {
      throw new Error(
        `Missing ${requiredPath}. Build FortuneSheet before vendoring it.`
      );
    }
  }

  rmSync(destinationRoot, { recursive: true, force: true });
  mkdirSync(destinationRoot, { recursive: true });
  cpSync(sourceManifest, resolve(destinationRoot, "package.json"));
  cpSync(sourceDist, resolve(destinationRoot, "dist"), { recursive: true });

  console.log(`Vendored @fortune-sheet/${packageName}`);
}
