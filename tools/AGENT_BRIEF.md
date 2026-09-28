# Brief for writing one chapter

You are writing ONE chapter of "Phaser 4 - a guide for OO programmers", a book with Celbridge
projects, at `/Users/matt/Downloads/gamelib_progressive/guide_to_phaser_4` (call it GUIDE). Other
authors are writing the other chapters at the same time, so stay inside your own folders.

## Read first (in this order)

1. `GUIDE/tools/AUTHORING.md` - folder layout, project conventions, code style, chapter structure,
   teacher materials, tools. Follow it exactly.
2. `GUIDE/tools/CHAPTER_PLAN.md` - your chapter's section (and skim the others, so you know what
   comes before and after you)
3. `GUIDE/README.md` - the book's front page (your chapter's summary is there - deliver what it says)
4. The two finished chapters, which are the model for everything you write - match their voice,
   depth, formatting and thoroughness:
   - `GUIDE/chapters/ch01_introduction/` and `GUIDE/chapters/ch02_three_scene_game/` (README.md,
     images/, and every file in projects/)
   - `GUIDE/teacher/ch01_introduction/` and `GUIDE/teacher/ch02_three_scene_game/` (teacher_notes.md,
     solutions.md, slides.md, and the solutions/ projects)
5. `GUIDE/assets/README.md` - the asset library (every file, and every sprite sheet's frame layout)

Phaser 4 reference material, on this machine:
- `~/Library/Caches/deno/npm/registry.npmjs.org/phaser/4.2.1/skills/<topic>/SKILL.md` - concise,
  accurate guides to each Phaser 4 area (scenes, loading-assets, physics-arcade, tilemaps, animations,
  tweens, audio-and-sound, input-keyboard-mouse-touch, particles, time-and-timers, groups-and-containers,
  v3-to-v4-migration, ...). Use them - Phaser 4 differs from Phaser 3 in places
- `~/Library/Caches/deno/npm/registry.npmjs.org/phaser/4.2.1/types/phaser.d.ts` - the exact types
  (grep it to check a method exists and what it takes). The type checker is the final judge.

## What to deliver

In `GUIDE/chapters/<your folder>/`:
- `README.md` - the chapter (structure and length as in AUTHORING.md; exactly six challenges; links
  to the previous and next chapters at the bottom, as chapters 1 and 2 do)
- `images/` - a screenshot of every project (taken with the harness) and SVG diagrams where they help
- `projects/` - the projects listed for your chapter in CHAPTER_PLAN.md (you may add one if it really
  helps; do not drop any). Each made with `tools/new_project.ts`, each with a full README.md and the
  controls listed in `public/index.html`

In `GUIDE/teacher/<your folder>/`:
- `teacher_notes.md`, `solutions.md`, `slides.md` (MARP), as described in AUTHORING.md and modelled
  by chapters 1 and 2
- `solutions/` - six runnable projects, `chNN_challenge_K_short_name`, one per challenge, each made
  with `tools/copy_project.sh` from the chapter project the challenge starts from, every change marked
  `// CHALLENGE K`; then run `python3 tools/tag_solutions.py teacher/<your folder> "Chapter N"`

## Rules

- Do NOT edit anything outside `chapters/<your folder>/` and `teacher/<your folder>/` - in particular
  not `tools/`, `assets/`, `template/`, the top-level README or other chapters. If you need an image or
  sound that is not in the library, make it in the game with `Graphics` + `generateTexture`, or write
  a chapter-local generator under `chapters/<your folder>/tools/` (see AUTHORING.md)
- Do not download anything (no art, no packages). Phaser is the only npm dependency
- Do not run `deno task serve` (port 8000 is shared). A file server for the whole guide is already
  running at http://127.0.0.1:8123/ - use it with `tools/harness.ts`. If it is not running, start it
  in the background from GUIDE: `deno run --allow-net --allow-read --allow-sys jsr:@std/http@^1/file-server . --host 127.0.0.1 --port 8123`
- No git commits
- Every code excerpt in the README, slides and solutions.md must match the real code in the project
- Every project must build with no type errors (`deno run -A tools/check_all.ts chapters/<folder>` and
  `... teacher/<folder>`) and pass `deno lint src`
- **Test everything by playing it**: use `tools/harness.ts` (keys, clicks, and `eval` against `game`
  to read and set state) to check that each project and each solution really does what the text
  says - not just that it compiles. Fix what you find. Check your screenshots by looking at them
- Error messages quoted in teacher notes must be real: produce them (in a scratch copy) and copy them
- British spelling in prose (colour, behaviour, centre); code identifiers as Phaser spells them

## When you finish

Reply with a short report: the files and projects you made, what you tested and how, anything that
does not work or that you were unsure about, and the README's word count.
