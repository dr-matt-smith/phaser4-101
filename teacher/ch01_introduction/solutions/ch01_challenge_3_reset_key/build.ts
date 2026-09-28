// Builds src/ (TypeScript) and public/ (static assets) -> dist/
//   - src/main.ts + everything it imports, Phaser included -> dist/game.js   (ONE plain script)
//   - public/**/*                                          -> dist/**/*      (HTML, CSS, images, copied as-is)
//
// Everything here is built into Deno - the only package the project downloads is Phaser itself.
//
// Run once:                deno task build
// Watch & rebuild on save: deno task dev
//
// You never need to edit this file.

const ROOT_DIR = new URL("./", import.meta.url);
const PUBLIC_DIR = new URL("./public/", ROOT_DIR);
const DIST_DIR = new URL("./dist/", ROOT_DIR);

// dist/ is updated in place (not deleted and recreated), so a page that has dist/index.html open
// keeps working across rebuilds. Old files are cleaned up at the end instead (step 4).
await Deno.mkdir(DIST_DIR, { recursive: true });

// Runs "deno <args>" in the project folder, and waits for it to finish.
// When `quiet` is true the output is only shown if the command fails.
async function deno(args: string[], quiet = false) {
  const result = await new Deno.Command(Deno.execPath(), {
    args,
    cwd: ROOT_DIR,
    stdout: quiet ? "piped" : "inherit",
    stderr: quiet ? "piped" : "inherit",
  }).output();

  if (quiet && !result.success) {
    await Deno.stdout.write(result.stdout);
    await Deno.stderr.write(result.stderr);
  }
  return result.success;
}

// 1. Type check the TypeScript (bundling only strips the types, it doesn't check them).
//    Errors are reported, but the game is still built so you can keep experimenting.
if (!await deno(["check", "src/main.ts"])) {
  console.log("TypeScript found errors (see above) - the game was still built, but may not work");
}

// 2. Bundle src/main.ts, every file it imports, and Phaser, into dist/game.js.
//    (quiet, because Phaser's own code makes the bundler print warnings that are not ours to fix)
const bundled = await deno(
  ["bundle", "--quiet", "--platform=browser", "--format=iife", "--output=dist/game.js", "src/main.ts"],
  true,
);
if (!bundled) {
  console.log("The game could not be built (see above)");
  Deno.exit(1);
}
console.log("Built dist/game.js from src/main.ts (and the files it imports)");

// 3. Copy every file under public/ (HTML, CSS, images, ...) as-is.
async function copyFolder(from: URL, to: URL, prefix = "") {
  await Deno.mkdir(to, { recursive: true });
  for await (const entry of Deno.readDir(from)) {
    if (entry.isDirectory) {
      await copyFolder(new URL(entry.name + "/", from), new URL(entry.name + "/", to), prefix + entry.name + "/");
    } else if (entry.name !== ".DS_Store" && !entry.name.endsWith(".cel")) {
      await Deno.copyFile(new URL(entry.name, from), new URL(entry.name, to));
      console.log(`Copied dist/${prefix}${entry.name} from public/${prefix}${entry.name}`);
    }
  }
}
await copyFolder(PUBLIC_DIR, DIST_DIR);

// 4. Remove anything in dist/ that no longer comes from public/ (e.g. a deleted image),
//    so no old files are left behind.
async function removeOldFiles(dist: URL, from: URL, prefix = "") {
  for await (const entry of Deno.readDir(dist)) {
    if (prefix + entry.name === "game.js" || entry.name === ".DS_Store" || entry.name.endsWith(".cel")) continue;
    const name = entry.name + (entry.isDirectory ? "/" : "");
    const inPublic = await Deno.stat(new URL(name, from)).then(() => true, () => false);
    if (!inPublic) {
      await Deno.remove(new URL(name, dist), { recursive: true });
      console.log(`Removed dist/${prefix}${name} (no longer in public/)`);
    } else if (entry.isDirectory) {
      await removeOldFiles(new URL(name, dist), new URL(name, from), prefix + name);
    }
  }
}
await removeOldFiles(DIST_DIR, PUBLIC_DIR);
