// Builds a single, self-contained HTML page of the whole book (front page + 15 chapters), with every
// chapter image embedded, for reading in a browser or publishing as one file.
//
//   deno run -A tools/make_book_page.ts <output.html>
//
// The chapters' Markdown is embedded as data and rendered in the page (with marked, from cdnjs).
// The teacher materials are deliberately left out - they hold the challenge answers.

import { dirname, extname, fromFileUrl, join } from "jsr:@std/path@^1";
import { encodeBase64 } from "jsr:@std/encoding@^1/base64";

const ROOT = join(dirname(fromFileUrl(import.meta.url)), "..");
const out = Deno.args[0] ?? join(ROOT, "book.html");

const front = await Deno.readTextFile(join(ROOT, "README.md"));
const ids = [...front.matchAll(/\(chapters\/(ch\d\d_[a-z_]+)\/README\.md\)/g)].map((m) => m[1]);

const chapters: { id: string; md: string }[] = [{ id: "home", md: front }];
const images: Record<string, string> = {};
const types: Record<string, string> = { ".png": "image/png", ".svg": "image/svg+xml" };

for (const id of ids) {
  const dir = join(ROOT, "chapters", id);
  chapters.push({ id, md: await Deno.readTextFile(join(dir, "README.md")) });
  for await (const e of Deno.readDir(join(dir, "images"))) {
    const type = types[extname(e.name)];
    if (!type) continue;
    const bytes = await Deno.readFile(join(dir, "images", e.name));
    images[`${id}/images/${e.name}`] = `data:${type};base64,${encodeBase64(bytes)}`;
  }
}

const template = await Deno.readTextFile(join(ROOT, "tools/book_page_template.html"));
const data = JSON.stringify({ chapters, images }).replaceAll("</", "<\\/");
await Deno.writeTextFile(out, template.replace("/*__BOOK_DATA__*/null", () => data));
console.log(`Wrote ${out}: ${chapters.length} pages, ${Object.keys(images).length} images, ${
  ((await Deno.stat(out)).size / 1e6).toFixed(1)
} MB`);
