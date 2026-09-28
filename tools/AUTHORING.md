# Authoring guide - how this book is put together

For anyone adding to, or changing, the guide. Chapters 1 and 2 are the worked examples of
everything below - when in doubt, do what they do.

## Folder layout

```
guide_to_phaser_4/
  README.md                         the book's front page: links + a summary of every chapter
  assets/                           the shared asset library (see assets/README.md)
  template/                         the starting point for every project
  tools/                            authoring tools (this file, generators, harness, checker)
  chapters/
    chNN_short_name/
      README.md                     the chapter itself
      images/                       screenshots (.png) and diagrams (.svg) used by README.md
      projects/
        chNN_project_name/          Celbridge projects that go with the chapter
  teacher/
    README.md                       how to use the teacher materials
    chNN_short_name/
      teacher_notes.md              timings, outcomes, misconceptions, activities
      solutions.md                  a worked solution to each of the six challenges
      slides.md                     MARP slides for the chapter
      solutions/
        chNN_challenge_K_short/     one runnable project per challenge (K = 1..6)
```

Chapter folders are safe to give to students. **Nothing in `chapters/` may give away a challenge
answer.** Everything that does lives in `teacher/`.

## Making a project

```bash
deno run -A tools/new_project.ts chapters/ch05_audio/projects/ch05_sound_board "Sound Board" audio/click.wav images/button.png
```

This copies `template/`, names the `.celbridge` file after the folder, sets the title, and copies the
listed assets (paths inside `assets/`, or a whole sub-folder) into `public/assets/`, plus
`CREDITS.md`. Then write `src/`, fill in `README.md`, and list the controls in `public/index.html`.

A challenge solution project normally starts as a **copy of the chapter project it extends**:

```bash
tools/copy_project.sh chapters/ch05_audio/projects/ch05_sound_board teacher/ch05_audio/solutions/ch05_challenge_1_more_sounds
```

Mark every change with a `// CHALLENGE n` comment (and `<!-- CHALLENGE n -->` in HTML). When all six
are done, give their READMEs a title and a "teacher's solution" note:

```bash
python3 tools/tag_solutions.py teacher/ch05_audio "Chapter 5"
```

Solution folders are named `chNN_challenge_K_short_name`, K = 1..6.

Every project:
- runs with `deno task build` then `deno task serve`, at http://127.0.0.1:8000/
- has only one npm dependency, Phaser (`deno.json` imports `npm:phaser@^4.2.1`)
- is 800 x 600, `Phaser.Scale.FIT`, `parent: "game"` (as in the template)
- has a `README.md`: one-paragraph summary, controls, "Running it" (from the template), and a short
  "What to look at" list pointing at the files and methods that matter for the chapter
- lists its controls in `public/index.html`
- must pass `deno run -A tools/check_all.ts <its folder>` with no errors, and `deno lint src`

## Code style

The readers know OO from Java, and some JavaScript. They are learning TypeScript as they go.

- one class per file; file named after the class (`GameScene.ts`, `Player.ts`); scenes in
  `src/scenes/`, game objects in `src/objects/`, plain data/config in `src/` or `src/config/`
- relative imports end in `.ts`; `import Phaser from "phaser";` at the top of each file that needs it
- scene keys as constants, e.g. `export const GAME_SCENE = "GameScene";` in `src/scenes/keys.ts`
  once there is more than one scene
- asset keys as constants next to what uses them, or in `src/assets.ts`
- `private` / `public` / `protected` written out; `override` on every overridden method (the
  compiler insists - `noImplicitOverride` is on); explicit return types on methods
- no `any`; use `as` only where Phaser's types cannot know (and say why in a comment)
- fields set in `create()` are declared with `!` (`private player!: Player;`), and a comment the
  first time the book does it in a chapter
- magic numbers become named `const`s at the top of the file
- speeds in pixels per second; times in milliseconds (Phaser's unit) unless stated
- comments explain **why** and **what Phaser is doing**, in plain English, for a student reading
  the code on its own. A comment at the top of each file says what the class is for
- prefer Phaser's way of doing things (scenes, loader, Arcade Physics, groups, tweens, timers,
  events, animations) over hand-written equivalents, except where the chapter is teaching the idea
  underneath

## Writing the chapter README.md

Voice: direct, friendly, second person ("you"), short paragraphs, British spelling (colour,
behaviour, centre). Explain *why* before *how*. Assume Java; point out where TypeScript or
JavaScript differs ("in Java you would write ...").

Structure (headings can be adapted):

1. `# Chapter N - Title`, then a two or three sentence introduction and a screenshot
2. **What you will learn** - 4 to 7 bullets
3. **The projects** - a table: project folder (linked), what it shows
4. The teaching sections, built around code excerpts from the projects (`ts` fenced blocks, with a
   file name above each: `` `src/scenes/GameScene.ts` ``). Excerpts must match the real code.
   Use diagrams (SVG in `images/`) where a picture explains better than words
5. **Java and TypeScript** or **Common mistakes** boxes where useful (use `> **Note**` quotes)
6. **Summary** - bullets
7. **Challenges** - exactly six, numbered, from simple (1) to advanced (6). Each has a title, a
   paragraph saying what to do, and (for 4-6) a hint. Say which project each one starts from.
   Never include the answer
8. Link to the next chapter

Length: concept chapters roughly 2,500-4,500 words; genre chapters roughly 3,000-5,000 words.

Images: a screenshot of every project, taken with the harness (below), saved as PNG in
`images/`, and referenced as `![alt text](images/file.png)`. Diagrams are hand-written SVG
(800 wide or less, white background, dark text, Arial, colours from the palette below), referenced
the same way.

Palette for diagrams: navy `#1d3557`, blue `#457b9d`, light blue `#a8dadc`, cream `#f1faee`,
red `#e63946`, orange `#f4a261`, green `#2a9d8f`, dark text `#1b1f2a`.

## Teacher materials

`teacher_notes.md`:
- overview, prerequisites, learning outcomes
- a suggested session plan (e.g. 2 x 1 hour lab, or 1 hour lecture + 2 hour lab) with timings
- key concepts to stress, and common misconceptions and errors (with the error message students
  will actually see where there is one)
- suggested demos / live-coding moments, discussion questions, extension ideas, assessment ideas

`solutions.md`: for each challenge - the goal, the approach, the key code (excerpts), what to look
for when marking, and a link to the solution project (`solutions/chNN_challenge_K_short/`).

`slides.md`: MARP. Start with

```markdown
---
marp: true
theme: default
paginate: true
title: "Chapter N - Title"
---
```

then 12-20 slides separated by `---`: title, outcomes, one idea per slide with a short code
excerpt or image (image paths relative to the slides file, e.g.
`../../chapters/chNN_x/images/foo.png`), a "try it" slide per project, summary, and the challenge
list. Keep code on slides to 15 lines or fewer.

## Screenshots and testing

Serve the whole guide once (from the guide's root folder) - if something is already listening on
port 8123, it is this server; leave it running:

```bash
deno run --allow-net --allow-read --allow-sys jsr:@std/http@^1/file-server . --host 127.0.0.1 --port 8123 --header "Cache-Control: no-cache"
```

Build a project, then drive it with the harness:

```bash
deno run -A tools/harness.ts http://127.0.0.1:8123/chapters/ch02_three_scene_game/projects/ch02_bouncing_ball/dist/ \
  '[{"press":"Space"},{"wait":500},{"click":[400,300]},{"eval":"game.scene.getScenes(true).map(s => s.sys.settings.key)"},{"shot":"chapters/ch02_three_scene_game/images/playing.png"}]'
```

`game` is the running `Phaser.Game` (the harness exposes it without changing the project), so
`eval` can inspect any scene, e.g. `game.scene.getScene("GameScene").score`. Use it to check that
a project really does what the chapter says. `--scale 1` gives a full-size screenshot (default 0.6,
which is what the chapters use).

Before finishing a chapter:

```bash
deno run -A tools/check_all.ts chapters/chNN_x
deno run -A tools/check_all.ts teacher/chNN_x
```

## Assets

Use the shared library (`assets/README.md` lists every file and every sprite sheet's frames).
If a chapter needs something that is not there, either:

- draw it **in the game** with Phaser's `Graphics` and `generateTexture(...)` (a good thing to teach
  anyway), or
- write a **chapter-local generator** in `chapters/chNN_x/tools/` (copy the approach of
  `tools/make_images.ts` / `tools/make_audio.ts`) that writes straight into the chapter's projects'
  `public/assets/` folders, and mention it in the chapter's README.

`tools/`, `assets/`, `template/` and the top-level READMEs are shared by every chapter: only change
them when working on the guide as a whole. Never download art.

Tiled maps (`.tmj`, Tiled's JSON format) are written by hand or by a small script, and must open in
Tiled: include the tileset image path relative to the map, and embed the tileset.
