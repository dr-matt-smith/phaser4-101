# Teacher materials

Everything a teacher needs to run each chapter as a class - and nothing a student should see before
attempting the challenges. The chapter folders in `chapters/` contain no answers, so they can be
handed out on their own; keep this folder back.

Each chapter has a folder here, named like the chapter:

| File | What it is |
|---|---|
| `teacher_notes.md` | overview, prerequisites, learning outcomes, a timed session plan, key points, common errors (with the messages students will actually see), discussion questions, extension and assessment ideas |
| `solutions.md` | a worked solution to each of the chapter's six challenges: the approach, the key code, and what to look for when marking |
| `slides.md` | slides for the chapter, in MARP format |
| `solutions/` | one complete, runnable Celbridge project per challenge. Every change from the chapter project is marked with a `// CHALLENGE n` comment - search for `CHALLENGE` to find them |

## Using the slides

The slides are Markdown written for [MARP](https://marp.app/). Three ways to show them:

- **VS Code** - install the "Marp for VS Code" extension, open `slides.md`, and use the preview; the
  extension can also export to PDF, HTML or PowerPoint
- **the command line** - `npx @marp-team/marp-cli slides.md --pdf` (needs Node), or the MARP CLI's
  standalone download
- **as plain Markdown** - every slide is readable as it is; `---` separates slides

Images in the slides point into the chapter folders (`../../chapters/...`), so keep the folder
structure as it is when presenting.

## Chapters

| Chapter | Notes | Solutions | Slides |
|---|---|---|---|
| 1 - Introduction | [notes](ch01_introduction/teacher_notes.md) | [solutions](ch01_introduction/solutions.md) | [slides](ch01_introduction/slides.md) |
| 2 - A three-scene game | [notes](ch02_three_scene_game/teacher_notes.md) | [solutions](ch02_three_scene_game/solutions.md) | [slides](ch02_three_scene_game/slides.md) |
| 3 - Preloading | [notes](ch03_preloading/teacher_notes.md) | [solutions](ch03_preloading/solutions.md) | [slides](ch03_preloading/slides.md) |
| 4 - The life of a scene | [notes](ch04_scene_lifecycle/teacher_notes.md) | [solutions](ch04_scene_lifecycle/solutions.md) | [slides](ch04_scene_lifecycle/slides.md) |
| 5 - Audio | [notes](ch05_audio/teacher_notes.md) | [solutions](ch05_audio/solutions.md) | [slides](ch05_audio/slides.md) |
| 6 - Scoring | [notes](ch06_scoring/teacher_notes.md) | [solutions](ch06_scoring/solutions.md) | [slides](ch06_scoring/slides.md) |
| 7 - Animations | [notes](ch07_animations/teacher_notes.md) | [solutions](ch07_animations/solutions.md) | [slides](ch07_animations/slides.md) |
| 8 - Collisions | [notes](ch08_collisions/teacher_notes.md) | [solutions](ch08_collisions/solutions.md) | [slides](ch08_collisions/slides.md) |
| 9 - 2D physics | [notes](ch09_physics/teacher_notes.md) | [solutions](ch09_physics/solutions.md) | [slides](ch09_physics/slides.md) |
| 10 - Tilemaps | [notes](ch10_tilemaps_simple/teacher_notes.md) | [solutions](ch10_tilemaps_simple/solutions.md) | [slides](ch10_tilemaps_simple/slides.md) |
| 11 - Tilemaps with Tiled | [notes](ch11_tilemaps_tiled/teacher_notes.md) | [solutions](ch11_tilemaps_tiled/solutions.md) | [slides](ch11_tilemaps_tiled/slides.md) |
| 12 - Higher or lower | [notes](ch12_higher_or_lower/teacher_notes.md) | [solutions](ch12_higher_or_lower/solutions.md) | [slides](ch12_higher_or_lower/slides.md) |
| 13 - Memory match | [notes](ch13_memory_match/teacher_notes.md) | [solutions](ch13_memory_match/solutions.md) | [slides](ch13_memory_match/slides.md) |
| 14 - Catch, avoid and shoot | [notes](ch14_catch_avoid_shoot/teacher_notes.md) | [solutions](ch14_catch_avoid_shoot/solutions.md) | [slides](ch14_catch_avoid_shoot/slides.md) |
| 15 - Platformer | [notes](ch15_platformer/teacher_notes.md) | [solutions](ch15_platformer/solutions.md) | [slides](ch15_platformer/slides.md) |
