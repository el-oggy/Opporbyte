import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const frontend = path.resolve(root, "../../frontend");
await mkdir(path.join(root, "assets"), { recursive: true });
await mkdir(path.join(root, "vendor"), { recursive: true });
for (const file of ["three.module.js", "three.core.js"]) {
  await copyFile(path.join(frontend, "node_modules/three/build", file), path.join(root, "vendor", file));
}
await copyFile(path.join(frontend, "node_modules/three/LICENSE"), path.join(root, "vendor/THREE-LICENSE.txt"));
for (const [source, target] of [
  ["@fontsource/space-grotesk/files/space-grotesk-latin-500-normal.woff2", "space-grotesk.woff2"],
  ["@fontsource/inter/files/inter-latin-400-normal.woff2", "inter.woff2"],
]) await copyFile(path.join(frontend, "node_modules", source), path.join(root, "assets", target));
for (const font of ["inter", "space-grotesk"]) {
  await copyFile(path.join(frontend, "node_modules/@fontsource", font, "LICENSE"), path.join(root, "assets", font + "-LICENSE.txt"));
}
const textures = await readFile(path.join(frontend, "components/scene/card-textures.ts"), "utf8");
await writeFile(path.join(root, "assets/card-textures.mjs"), stripTypeScriptTypes(textures).replace('"three"', '"../vendor/three.module.js"'));
console.log("Prepared local Three.js, fonts and existing product textures.");
