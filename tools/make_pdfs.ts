// Makes PDFs of the book and its teacher materials, from the same pages as make_book_page.ts and
// make_teacher_page.ts, printed by a headless Chrome (or Edge, or Chromium).
//
//   deno run -A tools/make_pdfs.ts [options] [output folder]      (default folder: _PDFs)
//
//   (no options)          the whole book, and the whole teacher guide - two PDFs
//   --book                the whole book
//   --teacher             the whole teacher guide (notes, solutions and slides for every chapter)
//   --chapters            one PDF per chapter of the book            -> chapters/
//   --teacher-chapters    one teacher PDF per chapter                -> teacher_chapters/
//   --slides              one slide deck per chapter, a 16:9 slide per page  -> slides/
//   --all                 all of the above
//
// The book and teacher guide have a cover, a contents page with links, and every chapter starting
// on a new page. Every page is printed in the light theme, on A4.

import { dirname, fromFileUrl, join, toFileUrl } from "jsr:@std/path@^1";

const ROOT = join(dirname(fromFileUrl(import.meta.url)), "..");
const flags = new Set(Deno.args.filter((a) => a.startsWith("--")));
const known = ["--book", "--teacher", "--chapters", "--teacher-chapters", "--slides", "--all"];
for (const f of flags) {
  if (!known.includes(f)) {
    console.error(`Unknown option ${f}. Options: ${known.join(" ")}`);
    Deno.exit(1);
  }
}
const all = flags.has("--all");
const none = flags.size === 0;
const want = {
  book: all || none || flags.has("--book"),
  teacher: all || none || flags.has("--teacher"),
  chapters: all || flags.has("--chapters"),
  teacherChapters: all || flags.has("--teacher-chapters"),
  slides: all || flags.has("--slides"),
};
const OUT = Deno.args.find((a) => !a.startsWith("--")) ?? join(ROOT, "_PDFs");
await Deno.mkdir(OUT, { recursive: true });
const work = await Deno.makeTempDir();

// the chapters, in order, from the front page
const front = await Deno.readTextFile(join(ROOT, "README.md"));
const CHAPTER_IDS = [...front.matchAll(/\(chapters\/(ch\d\d_[a-z_]+)\/README\.md\)/g)].map((m) => m[1]);

async function run(args: string[]) {
  const r = await new Deno.Command(Deno.execPath(), { args, cwd: ROOT }).output();
  if (!r.success) throw new Error(new TextDecoder().decode(r.stderr));
}
await run(["run", "-A", "tools/make_book_page.ts", join(work, "book_body.html")]);
await run(["run", "-A", "tools/make_teacher_page.ts", join(work, "teacher_body.html")]);

// the published pages are bodies only; give them a document around them
for (const name of ["book", "teacher"]) {
  const body = await Deno.readTextFile(join(work, `${name}_body.html`));
  await Deno.writeTextFile(
    join(work, `${name}.html`),
    `<!doctype html><html data-theme="light"><head><meta charset="utf-8"></head><body>${body}</body></html>`,
  );
}

// ---------------------------------------------------------------------------------------------
// Print styles, and the script that lays every chapter out one after another
// ---------------------------------------------------------------------------------------------
const PRINT_CSS = `
  @page { size: A4; margin: 18mm 16mm 20mm; }
  html, body { background: #fff !important; }
  .rail, .topbar, .pager, .note, .tabs, .tab-note, .menu-btn { display: none !important; }
  .shell { display: block !important; }
  main { padding: 0 !important; }
  article { max-width: none !important; }
  body { font-size: 11pt; }
  article pre { font-size: 8.6pt; white-space: pre-wrap; word-break: break-word; overflow: visible; }
  article pre, article img, article blockquote, .table-wrap, table, tr { break-inside: avoid; }
  article h2, article h3 { break-after: avoid; }
  article h2 { border-top: 0; padding-top: 0; margin-top: 28px; }
  article img { max-height: 190mm; box-shadow: none !important; border: 1px solid #dde1ea; }
  .local { border-bottom: 0; }
  .print-chapter { break-before: page; }
  .print-part { break-before: page; display: grid; place-content: center; min-height: 240mm; text-align: center; }
  .print-part h1 { font: 800 34pt/1.1 var(--display); margin: 0; }
  .print-part p { color: var(--ink-soft); font-size: 13pt; }
  .print-sub { break-before: page; }
  .print-sub > h2.sub { border: 0; margin-top: 0; font-size: 20pt; }
  .cover { display: grid; align-content: center; min-height: 250mm; gap: 14px; }
  .cover .t { font: 800 44pt/1.02 var(--display); letter-spacing: -0.01em; }
  .cover .s { font: 500 17pt/1.3 var(--body); color: var(--ink-soft); }
  .cover .tiles { display: grid; grid-template-columns: repeat(8, 16mm); gap: 0; margin-bottom: 10mm; }
  .cover .tiles i { height: 16mm; background: var(--tile-a); }
  .cover .tiles i:nth-child(odd) { background: var(--tile-b); }
  .contents { break-before: page; }
  .contents h1 { font: 800 26pt/1.1 var(--display); margin: 0 0 16px; }
  .contents ol { list-style: none; padding: 0; margin: 0; }
  .contents li { display: grid; grid-template-columns: 12mm 1fr; padding: 4px 0; border-bottom: 1px solid #e6e9f0; max-width: none; }
  .contents li b { font: 600 11pt var(--mono); color: var(--accent); }
  .contents a { color: var(--ink); text-decoration: none; }
  .contents .grp { font: 600 9pt var(--body); text-transform: uppercase; letter-spacing: 0.1em; color: var(--ink-soft); margin: 18px 0 6px; }
  .deck { gap: 10mm; }
  .slide { break-inside: avoid; box-shadow: none !important; }
`;

const LAYOUT_BOOK = `(() => {
  const ids = BOOK.chapters.filter((c) => c.id !== "home").map((c) => c.id);
  const parts = [];
  parts.push('<section class="cover"><div class="tiles">' + '<i></i>'.repeat(16) + '</div>' +
    '<div class="t">Phaser 4</div><div class="s">a guide for OO programmers</div>' +
    '<div class="s" style="font-size:13pt">2D games in TypeScript, with Phaser 4 and Deno</div></section>');
  let toc = '<section class="contents"><h1>Contents</h1>';
  let group = "";
  for (const id of ids) {
    const { n, name } = splitTitle(titleOf(byId.get(id).md));
    const g = n <= 11 ? "Part 1 - The ideas" : "Part 2 - Games";
    if (g !== group) { toc += (group ? "</ol>" : "") + '<div class="grp">' + g + '</div><ol>'; group = g; }
    toc += '<li><b>' + n + '</b><a href="#' + id + '">' + escapeHtml(name) + '</a></li>';
  }
  toc += '</ol></section>';
  parts.push(toc);
  render("home");
  parts.push('<section class="print-chapter" id="home">' + document.getElementById("page").innerHTML + '</section>');
  for (const id of ids) {
    render(id);
    parts.push('<section class="print-chapter" id="' + id + '">' + document.getElementById("page").innerHTML + '</section>');
  }
  document.getElementById("page").innerHTML = parts.join("");
  for (const img of document.querySelectorAll("img")) img.removeAttribute("loading");
  return ids.length;
})()`;

const LAYOUT_TEACHER = `(() => {
  const parts = [];
  parts.push('<section class="cover"><div class="tiles">' + '<i></i>'.repeat(16) + '</div>' +
    '<div class="t">Teacher guide</div><div class="s">Phaser 4 - a guide for OO programmers</div>' +
    '<div class="s" style="font-size:13pt">Teacher notes, worked solutions and slides for every chapter</div></section>');
  let toc = '<section class="contents"><h1>Contents</h1><ol>';
  for (const c of KIT.chapters) {
    const { n, name } = splitTitle(c.title);
    toc += '<li><b>' + n + '</b><a href="#' + c.id + '">' + escapeHtml(name) + '</a></li>';
  }
  toc += '</ol></section>';
  parts.push(toc);
  render("home");
  parts.push('<section class="print-chapter" id="home">' + document.getElementById("page").innerHTML + '</section>');
  const labels = { notes: "Teacher notes", solutions: "Solutions", slides: "Slides" };
  for (const c of KIT.chapters) {
    for (const tab of ["notes", "solutions", "slides"]) {
      render(c.id + "." + tab);
      const html = document.getElementById("page").innerHTML;
      if (tab === "notes") {
        parts.push('<section class="print-chapter" id="' + c.id + '">' + html + '</section>');
      } else {
        // later sections: drop the repeated chapter heading, keep a sub-heading
        const div = document.createElement("div");
        div.innerHTML = html;
        div.querySelector(".chapter-head")?.remove();
        parts.push('<section class="print-sub"><h2 class="sub">' + escapeHtml(c.title.replace(/^Chapter\\s+/, "Chapter ")) + ' - ' + labels[tab] + '</h2>' + div.innerHTML + '</section>');
      }
    }
  }
  document.getElementById("page").innerHTML = parts.join("");
  for (const img of document.querySelectorAll("img")) img.removeAttribute("loading");
  return KIT.chapters.length;
})()`;

// one chapter on its own: no cover, no contents
function layoutOneChapter(id: string): string {
  return `(() => {
    render(${JSON.stringify(id)});
    const page = document.getElementById("page");
    page.innerHTML = '<section id="' + ${JSON.stringify(id)} + '">' + page.innerHTML + '</section>';
    for (const img of document.querySelectorAll("img")) img.removeAttribute("loading");
    return 1;
  })()`;
}

// one chapter's teacher materials: notes, then solutions, then slides
function layoutTeacherChapter(id: string): string {
  return `(() => {
    const labels = { notes: "Teacher notes", solutions: "Solutions", slides: "Slides" };
    const parts = [];
    for (const tab of ["notes", "solutions", "slides"]) {
      render(${JSON.stringify(id)} + "." + tab);
      const div = document.createElement("div");
      div.innerHTML = document.getElementById("page").innerHTML;
      if (tab === "notes") {
        parts.push('<section>' + div.innerHTML + '</section>');
      } else {
        div.querySelector(".chapter-head")?.remove();
        parts.push('<section class="print-sub"><h2 class="sub">' + labels[tab] + '</h2>' + div.innerHTML + '</section>');
      }
    }
    document.getElementById("page").innerHTML = parts.join("");
    for (const img of document.querySelectorAll("img")) img.removeAttribute("loading");
    return 1;
  })()`;
}

// one chapter's slides, one 16:9 slide per page
function layoutSlides(id: string): string {
  return `(() => {
    render(${JSON.stringify(id)} + ".slides");
    const deck = document.querySelector(".deck");
    document.getElementById("page").innerHTML = deck.outerHTML;
    for (const img of document.querySelectorAll("img")) img.removeAttribute("loading");
    return document.querySelectorAll(".slide").length;
  })()`;
}

const SLIDE_CSS = `
  @page { size: 297mm 167mm; margin: 0; }
  html, body { background: #fff !important; margin: 0 !important; padding: 0 !important; }
  .rail, .topbar, .pager, .note, .tabs, .tab-note, .chapter-head, .menu-btn { display: none !important; }
  .shell { display: block !important; }
  main { padding: 0 !important; }
  article { max-width: none !important; margin: 0 !important; }
  .deck { display: block !important; margin: 0 !important; }
  .slide { width: 297mm !important; height: 167mm !important; max-width: none !important; aspect-ratio: auto !important;
           border: 0 !important; border-radius: 0 !important; box-shadow: none !important; margin: 0 !important;
           break-after: page; break-inside: avoid; }
  .slide:last-child { break-after: auto; }
  .slide-body { overflow: hidden !important; }
  article img { border: 0; }
`;

// ---------------------------------------------------------------------------------------------
// Chromium over the DevTools protocol
// ---------------------------------------------------------------------------------------------
// The browser that prints the PDFs: the CHROME environment variable if set, otherwise the first of
// these that exists - Google Chrome, Microsoft Edge or Chromium (run headless, nothing appears on
// screen), or Playwright's headless Chromium.
function findChrome(): string {
  const home = Deno.env.get("HOME") ?? "";
  const candidates = [
    Deno.env.get("CHROME") ?? "",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    `${home}/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`,
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    `${home}/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell`,
  ];
  for (const path of candidates) {
    if (!path) continue;
    try {
      Deno.statSync(path);
      return path;
    } catch { /* not here */ }
  }
  console.error("Could not find Chrome, Edge or Chromium. Install Google Chrome, or set CHROME to a browser's path.");
  Deno.exit(1);
}
const CHROME = findChrome();
console.log(`Printing with ${CHROME}`);
const port = 9700 + Math.floor(Math.random() * 200);
const profile = await Deno.makeTempDir();
const proc = new Deno.Command(CHROME, {
  args: [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "--allow-file-access-from-files",
    "--no-first-run",
    "--no-default-browser-check",
    "about:blank",
  ],
  stdout: "null",
  stderr: "null",
}).spawn();
let wsUrl = "";
for (let i = 0; i < 80 && !wsUrl; i++) {
  await new Promise((r) => setTimeout(r, 100));
  try {
    const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
    wsUrl = list.find((t: { type: string }) => t.type === "page")?.webSocketDebuggerUrl ?? "";
  } catch { /* not up yet */ }
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.onopen = r);
let id = 0;
// deno-lint-ignore no-explicit-any
const pending = new Map<number, (v: any) => void>();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)!(m);
    pending.delete(m.id);
  } else if (m.method === "Runtime.exceptionThrown") {
    console.log("[page error]", m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text);
  }
};
// deno-lint-ignore no-explicit-any
function send(method: string, params: Record<string, unknown> = {}): Promise<any> {
  const i = ++id;
  ws.send(JSON.stringify({ id: i, method, params }));
  return new Promise((r) => pending.set(i, r));
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function evaluate(expression: string) {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails));
  return r.result?.result?.value;
}

await send("Runtime.enable");
await send("Page.enable");

const FOOTER = `<div style="width:100%;font:8pt Helvetica,Arial,sans-serif;color:#8a93a6;padding:0 16mm;display:flex;justify-content:space-between">
  <span>TITLE</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`;

async function makePdf(
  page: string,
  layout: string,
  file: string,
  title: string,
  options: { css?: string; footer?: boolean; unit?: string } = {},
) {
  const css = options.css ?? PRINT_CSS;
  const footer = options.footer ?? true;
  await send("Page.navigate", { url: toFileUrl(join(work, page)).href });
  for (let i = 0; i < 100; i++) {
    await sleep(200);
    if (await evaluate("typeof marked !== 'undefined' && !!document.getElementById('page')?.innerHTML")) break;
  }
  const count = await evaluate(layout);
  await evaluate(`(() => { const s = document.createElement("style"); s.textContent = ${JSON.stringify(css)}; document.head.appendChild(s); return 1; })()`);
  await evaluate("document.fonts.ready.then(() => 1)");
  await sleep(1000);
  const r = await send("Page.printToPDF", {
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: footer,
    headerTemplate: "<div></div>",
    footerTemplate: footer ? FOOTER.replace("TITLE", title) : "<div></div>",
    generateDocumentOutline: true,
    generateTaggedPDF: true,
  });
  if (!r.result?.data) throw new Error(JSON.stringify(r.error ?? r));
  const path = join(OUT, file);
  await Deno.mkdir(dirname(path), { recursive: true });
  await Deno.writeFile(path, Uint8Array.from(atob(r.result.data), (c) => c.charCodeAt(0)));
  const mb = ((await Deno.stat(path)).size / 1e6).toFixed(1);
  console.log(`Wrote ${path} (${count} ${options.unit ?? "chapters"}, ${mb} MB)`);
}

if (want.book) {
  await makePdf("book.html", LAYOUT_BOOK, "Phaser4_Guide_for_OO_Programmers.pdf", "Phaser 4 - a guide for OO programmers");
}
if (want.teacher) {
  await makePdf("teacher.html", LAYOUT_TEACHER, "Phaser4_Guide_Teacher_Guide.pdf", "Phaser 4 guide - Teacher guide");
}
for (const [i, id] of CHAPTER_IDS.entries()) {
  const label = `Phaser 4 guide - Chapter ${i + 1}`;
  if (want.chapters) {
    await makePdf("book.html", layoutOneChapter(id), `chapters/${id}.pdf`, label, { unit: "chapter" });
  }
  if (want.teacherChapters) {
    await makePdf("teacher.html", layoutTeacherChapter(id), `teacher_chapters/${id}_teacher.pdf`, `${label} - Teacher materials`, {
      unit: "chapter",
    });
  }
  if (want.slides) {
    await makePdf("teacher.html", layoutSlides(id), `slides/${id}_slides.pdf`, label, {
      css: SLIDE_CSS,
      footer: false,
      unit: "slides",
    });
  }
}

ws.close();
proc.kill();
await Deno.remove(profile, { recursive: true }).catch(() => {});
await Deno.remove(work, { recursive: true }).catch(() => {});
Deno.exit(0);
