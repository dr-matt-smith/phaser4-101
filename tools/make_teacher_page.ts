// Builds a single, self-contained HTML page of the teacher materials: for every chapter its teacher
// notes, worked solutions and slides (shown as slide cards), with every image they use embedded.
//
//   deno run -A tools/make_teacher_page.ts <output.html> [book artifact url]
//
// Links into the chapters point at the book page (see make_book_page.ts) when its URL is given.
// The solution projects are code, so they are named (as folder paths), not included.

import { dirname, extname, fromFileUrl, join } from "jsr:@std/path@^1";
import { encodeBase64 } from "jsr:@std/encoding@^1/base64";

const ROOT = join(dirname(fromFileUrl(import.meta.url)), "..");
const out = Deno.args[0] ?? join(ROOT, "teacher.html");
const bookUrl = Deno.args[1] ?? "";

const front = await Deno.readTextFile(join(ROOT, "README.md"));
const ids = [...front.matchAll(/\(chapters\/(ch\d\d_[a-z_]+)\/README\.md\)/g)].map((m) => m[1]);

const home = await Deno.readTextFile(join(ROOT, "teacher/README.md"));
const chapters: { id: string; title: string; notes: string; solutions: string; slides: string }[] = [];
const images: Record<string, string> = {};
const types: Record<string, string> = { ".png": "image/png", ".svg": "image/svg+xml" };

for (const id of ids) {
  const t = join(ROOT, "teacher", id);
  const chapterMd = await Deno.readTextFile(join(ROOT, "chapters", id, "README.md"));
  const title = chapterMd.match(/^#\s+(.+)$/m)?.[1].trim() ?? id;
  chapters.push({
    id,
    title,
    notes: await Deno.readTextFile(join(t, "teacher_notes.md")),
    solutions: await Deno.readTextFile(join(t, "solutions.md")),
    slides: await Deno.readTextFile(join(t, "slides.md")),
  });
  for await (const e of Deno.readDir(join(ROOT, "chapters", id, "images"))) {
    const type = types[extname(e.name)];
    if (!type) continue;
    const bytes = await Deno.readFile(join(ROOT, "chapters", id, "images", e.name));
    images[`chapters/${id}/images/${e.name}`] = `data:${type};base64,${encodeBase64(bytes)}`;
  }
}

const template = await Deno.readTextFile(join(ROOT, "tools/teacher_page_template.html"));
const data = JSON.stringify({ home, chapters, images, bookUrl }).replaceAll("</", "<\\/");
await Deno.writeTextFile(out, template.replace("/*__TEACHER_DATA__*/null", () => data));
console.log(`Wrote ${out}: ${chapters.length} chapters, ${Object.keys(images).length} images, ${
  ((await Deno.stat(out)).size / 1e6).toFixed(1)
} MB`);
