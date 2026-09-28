# Building the PDFs

How to turn the guide into PDFs - the whole book, the whole teacher guide, single chapters, and slide
decks. One command, `tools/make_pdfs.ts`, makes all of them. Run it again whenever you change a
chapter, a teacher file or a slide deck.

## What you need

- **Deno** 2.4 or later - check with `deno --version`
- **Google Chrome** (or Microsoft Edge, or Chromium). It prints the pages to PDF in the background:
  no browser window opens. The script finds Chrome in the usual places by itself; if it cannot, set
  `CHROME` to the browser's path (see below)
- **An internet connection** - the pages use web fonts (from Google Fonts) and a Markdown renderer
  (from cdnjs), fetched while printing

Nothing else is installed: there are no npm packages involved.

## The commands

Open a terminal in this folder (`guide_to_phaser_4/`), then run the line for what you want. Every PDF
goes into `_PDFs/`, replacing any older copy.

**The whole book and the whole teacher guide** (the two main PDFs):

```bash
deno run -A tools/make_pdfs.ts
```

**Everything** - both main PDFs, plus a PDF of every chapter, every chapter's teacher materials, and
every chapter's slides (47 PDFs, about 75 MB, 1-2 minutes):

```bash
deno run -A tools/make_pdfs.ts --all
```

**Just one kind** - pick any of these options, and combine them if you like:

| Option | Makes | Goes into |
|---|---|---|
| `--book` | the whole book: cover, contents, all 15 chapters | `_PDFs/Phaser4_Guide_for_OO_Programmers.pdf` |
| `--teacher` | the whole teacher guide: every chapter's teacher notes, worked solutions and slides | `_PDFs/Phaser4_Guide_Teacher_Guide.pdf` |
| `--chapters` | one PDF per chapter of the book - handy for giving students one chapter at a time | `_PDFs/chapters/ch01_introduction.pdf` ... |
| `--teacher-chapters` | one PDF per chapter of teacher notes, worked solutions and slides | `_PDFs/teacher_chapters/ch01_introduction_teacher.pdf` ... |
| `--slides` | one slide deck per chapter, one 16:9 slide per page - ready to present full screen from any PDF viewer | `_PDFs/slides/ch01_introduction_slides.pdf` ... |
| `--all` | all of the above | |

For example, to rebuild only the slide decks and the per-chapter PDFs:

```bash
deno run -A tools/make_pdfs.ts --slides --chapters
```

**A different output folder** - add the folder's path at the end:

```bash
deno run -A tools/make_pdfs.ts --all ~/Desktop/phaser_pdfs
```

**A particular browser** - if the script says it cannot find Chrome, or you want to use another
Chromium-based browser, set `CHROME` for that one command:

```bash
CHROME="/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" deno run -A tools/make_pdfs.ts
```

(On Windows PowerShell: `$env:CHROME="C:\Program Files\Google\Chrome\Application\chrome.exe"; deno run -A tools/make_pdfs.ts`.)

## What is in each PDF

- **The book** and **the teacher guide** have a cover and a contents page; each contents entry is a
  link to its chapter, and the PDF's bookmarks follow the headings. Every chapter starts on a new A4
  page, and the footer shows the title and page number
- **Chapter PDFs** are the same pages as the book, one chapter each, with no cover
- **Teacher chapter PDFs** hold one chapter's teacher notes, then its worked solutions, then its
  slides (two slides to an A4 page)
- **Slide decks** are 16:9 pages, one slide each, the same as the slides in the teacher guide. For
  the original MARP slides (to edit, or to export to PowerPoint), use the `slides.md` files in
  `teacher/` with MARP - see [teacher/README.md](teacher/README.md)

Every PDF is printed in the light theme, whatever your computer's setting.

The teacher guide, the teacher chapter PDFs and the slide decks contain the **challenge answers**.
Give students the book or the chapter PDFs only.

## The web pages (optional)

The PDFs are printed from two single-file web pages, which can also be made on their own - for
reading in a browser, or publishing:

```bash
deno run -A tools/make_book_page.ts book.html
deno run -A tools/make_teacher_page.ts teacher.html
```

`make_teacher_page.ts` takes the address of the published book as a second argument, so its "in the
book" links point there; without it, those links are left out.

## If something goes wrong

| What you see | What to do |
|---|---|
| `Could not find Chrome, Edge or Chromium` | install Google Chrome, or set `CHROME` to a browser's path (above) |
| The PDFs are made, but the text is in a plain system font | the web fonts could not be fetched - check the internet connection and run it again |
| `[page error] marked is not defined`, or pages come out empty | the Markdown renderer could not be fetched from cdnjs - check the internet connection |
| `Unknown option --slide` | check the option's spelling against the table above |
| An old version of a chapter appears | the PDFs are made from the files as they are when you run the command - save your changes first, then run it again |

## How it works

`tools/make_pdfs.ts` builds the book page and the teacher page (with `make_book_page.ts` and
`make_teacher_page.ts`), opens each one in a headless browser, lays out the chapters for print,
and asks the browser to print to PDF. The page designs themselves are in
`tools/book_page_template.html` and `tools/teacher_page_template.html`; the print layout (page size,
margins, page breaks) is in `make_pdfs.ts`.
