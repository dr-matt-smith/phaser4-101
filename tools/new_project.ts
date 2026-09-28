// Makes a new game project from template/.
//
//   deno run -A tools/new_project.ts <folder> "<Title>" [asset asset ...]
//
//   <folder>   where to make it, e.g. chapters/ch02_three_scenes/projects/ch02_bouncing_ball
//   <Title>    the game's title (README heading, <title>, and config title)
//   asset      files from assets/ to copy into public/assets/, e.g. images/ball.png audio/pop.wav
//              (a folder name such as "cards" copies that whole folder)
//
// Paths are relative to the guide's root folder. The folder must not exist yet.

import { basename, dirname, fromFileUrl, join } from "jsr:@std/path@^1";
import { copy } from "jsr:@std/fs@^1/copy";

const ROOT = join(dirname(fromFileUrl(import.meta.url)), "..");
const [folderArg, title, ...assets] = Deno.args;
if (!folderArg || !title) {
  console.error('usage: deno run -A tools/new_project.ts <folder> "<Title>" [asset ...]');
  Deno.exit(1);
}
const folder = join(ROOT, folderArg);
const name = basename(folder);

try {
  await Deno.stat(folder);
  console.error(`${folderArg} already exists`);
  Deno.exit(1);
} catch { /* good - it does not exist */ }

await copy(join(ROOT, "template"), folder, {});
await Deno.remove(join(folder, "dist"), { recursive: true }).catch(() => {});
await Deno.rename(join(folder, "template.celbridge"), join(folder, `${name}.celbridge`));

async function replaceIn(file: string, from: string, to: string) {
  const text = await Deno.readTextFile(file);
  await Deno.writeTextFile(file, text.replaceAll(from, to));
}
await replaceIn(join(folder, "README.md"), "PROJECT_TITLE", title);
await replaceIn(join(folder, "public/index.html"), "<title>Phaser Game</title>", `<title>${title}</title>`);
await replaceIn(join(folder, "src/main.ts"), 'title: "Phaser Game"', `title: "${title}"`);

for (const asset of assets) {
  const from = join(ROOT, "assets", asset);
  const to = join(folder, "public/assets", asset);
  await Deno.mkdir(dirname(to), { recursive: true });
  await copy(from, to, { overwrite: true });
}
if (assets.length > 0) {
  await copy(join(ROOT, "assets/CREDITS.md"), join(folder, "public/assets/CREDITS.md"), { overwrite: true })
    .catch(() => {});
}
console.log(`Made ${folderArg}`);
