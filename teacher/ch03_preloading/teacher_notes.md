# Chapter 3 - Preloading: teacher notes

## Overview

Students have called `this.load.image` since Chapter 1 without thinking about it. This chapter opens
the loader up: `load...` calls only **queue** files; the loader fetches them after `preload()`;
loaded files live in **game-wide caches** under **keys**. On that foundation students build the
standard **Boot -> Preload -> Menu** structure with a progress bar (their first use of `Graphics`),
load every common kind of file (including JSON described by an interface, and an asset pack), learn
what a missing file looks like, and load files in the middle of a game with `this.load.start()`.

The practical difficulty of teaching it: **local files load too fast to see**. The loading screen
project pads its queue with 150 copies of small pictures, but the honest demonstration is the
browser's network throttling - rehearse it before the session.

## Prerequisites

- Chapter 1: building and serving, config/scene/game object, `preload()`/`create()`
- Chapter 2: several scenes, `this.scene.start(key, data)`, `init(data)`, interfaces, `on`/`once`,
  spread
- JSON as a format (most students have met it; a two-minute reminder is enough)

## Learning outcomes

Students can:

1. explain what `this.load.image(key, file)` does and does not do, and when `create()` runs
2. say where loaded files are kept, and use keys to read them back from `this.textures` and
   `this.cache.*`
3. structure a game as Boot -> Preload -> Menu, and explain why the boot scene exists
4. draw a progress bar with `Graphics`, driven by the loader's `"progress"` event
5. load images, sprite sheets, audio, JSON (typed with an interface), text and asset packs
6. recognise and diagnose a missing file (the missing texture, `"loaderror"`, the console's 404)
7. load files after `preload()` with `this.load.start()` and `"complete"`, checking the caches first

## Suggested session plan (2 hours)

| Time | Activity |
|---|---|
| 0:00 - 0:10 | Ask: "what happens between pressing refresh and seeing the title screen?" Collect answers; then show the Network tab of the developer tools while `ch02_click_the_ball_plus` loads |
| 0:10 - 0:25 | Slides 3-6: the queue, keys and caches, paths, `setPath`. Draw the queue -> loader -> caches diagram |
| 0:25 - 0:45 | Slides 7-11: Boot -> Preload -> Menu, `Graphics`, loader events. Walk through `PreloadScene.ts`. **Live demo:** run it normally (a flash), then with throttling on "Fast 4G" |
| 0:45 - 1:00 | Challenges 1 and 2 |
| 1:00 - 1:20 | Slides 12-16: every kind of file, JSON and interfaces, asset packs, missing files. **Live demo:** rename a picture in `public/`, rebuild, find it with the console |
| 1:20 - 1:30 | Slides 17-18: loading later. Play `ch03_load_on_demand` throttled; press U and go back in |
| 1:30 - 2:00 | Challenges 3-6 |

For a 1 hour lecture + 2 hour lab: lecture slides 1-18 with the three demos; lab challenges 1-6.

## Key points to stress

- **`preload()` only makes a list.** Nothing is loaded until it returns. This one sentence explains
  most loading bugs students write
- **The caches are the game's, not the scene's.** A file loaded anywhere can be used everywhere,
  and a key that is already loaded is skipped. This is what makes both "load everything at the
  start" and "load on demand, but only once" work
- **Keys are names; files are addresses.** After `preload()` the file name should never appear
  again. Keep keys as constants, as scene keys were in Chapter 2
- **Paths are relative to the page** (`dist/index.html`), not to the `.ts` file - and everything in
  `public/` is copied to `dist/`, so "not in `public/`" means "not there"
- **The boot scene exists because a loading screen cannot show something it is still loading**
- **Outside `preload()`, you start the loader yourself.** No `this.load.start()`, no loading, no
  error
- `cache.json.get` returns `any`; the interface is a promise *about* the file, checked against the
  code, never against the file. Good discussion of what static typing can and cannot do

## Common problems and errors

| What students see | Cause | Fix |
|---|---|---|
| A black square with a green outline and a green diagonal | the missing texture: no picture with that key | check the console for a 404; check the file is in `public/`, and the name, folder and capitals; check the key matches |
| Works at home, missing pictures once uploaded (or on a lab machine) | capitals: `Sky.png` vs `sky.png` - macOS and Windows usually do not mind, web servers do | make the names match exactly; use lower case for every file |
| `Error: Audio key "shoot" not found in cache` in the console, and the scene stops | `this.sound.play(key)` for a sound that is not loaded (misspelt key, missing file, or loaded in a scene that has not run yet) | load it first; check the key |
| `Error: TextureManager.SpriteSheet: Invalid frameWidth given.` and an empty screen | `this.load.spritesheet(key, file)` with no `{ frameWidth, frameHeight }` | give the frame size (the asset library README lists them) |
| A sprite sheet's frames are cut in the wrong places, or show parts of two pictures | wrong `frameWidth`/`frameHeight` | check the frame size |
| `Parameter 'value' implicitly has an 'any' type.` on a loader listener | the listener's parameter has no type; `this.load.on` accepts any function, so TypeScript cannot work it out | write the type: `(value: number)`, `(file: Phaser.Loader.File)` |
| `Property 'gem' does not exist on type 'LevelData'. Did you mean 'gems'?` | a typo reading JSON data - the interface catching it | fix the name |
| `Property 'hearts' does not exist on type 'LevelData'.` | the JSON file gained a field; the interface did not | add it to the interface |
| `Cannot read properties of undefined (reading 'length')` in the browser | the interface has a field the JSON file does not (misspelt in the file, or a missing comma broke the file) | fix the file; check it is valid JSON |
| Loading in `create()` does nothing at all | forgot `this.load.start()` | call it after queueing |
| A new picture under an old key does not appear; the old one stays | the loader skips keys already in the cache | `this.textures.remove(key)` first, or use a new key |
| Loading screen shows the missing texture instead of the logo | the logo was loaded in `PreloadScene`, not `BootScene` | load what the loading screen shows in the boot scene |
| The bar never appears / the loading screen flashes past | local files are fast | throttle the network; that is the real test |
| A path starting with `/` works with `deno task serve`, then breaks elsewhere | `/` means the top of the web server, not the page | leave the leading `/` off |

A subtle one for the curious: in `preload()`, `this.time.now` can be out of date - the scene's clock
is only updated once the scene is running frames, and `preload()` comes before its first frame. The
first time a scene runs it holds the time the game started (close enough, for a scene that starts
straight away); when the scene is started again it holds the time the scene last stopped. That is why `PreloadScene` times the load with `performance.now()`. Chapter
4 explains the order in which Phaser does things.

## Suggested demos

- **The queue is not the load.** In `BootScene.preload()`, add `this.add.image(400, 300, LOGO_KEY)`
  straight after `this.load.image(LOGO_KEY, ...)`. The missing texture appears (briefly - the scene
  moves on). Ask why, before explaining
- **Throttling.** Run `ch03_loading_screen` normally, then with the Network tab's "Disable cache" and
  "Fast 4G". Show the waterfall of requests: several at once, big files taking longest. Then set
  `COPIES` to 0 and run it again throttled - the bar still moves, because the music is big
- **Loading again.** Press R in the menu: "Loaded 0 files". Ask what the loader did with 170 keys
  that were already loaded
- **A missing file.** Rename `sky.png` in `public/assets/images/`, rebuild, refresh. Find the 404
  in the console; notice the rest of the game still works. Then misspell a sound's key and watch
  the scene stop with an error instead
- **Unloading.** In `ch03_load_on_demand`, visit Space, press U, visit Space again with throttling
  on: it loads again. Discuss what a 40-level game would do

## Discussion questions

- A loading screen is a scene that shows pictures while loading pictures. How does the boot scene
  get round this? What else would you put in a boot scene?
- Why does the loader skip a key that is already loaded? When is that helpful, and when is it a
  trap?
- JSON level files, or levels written in TypeScript? What does each make easier? Who else might
  edit a JSON file?
- An asset pack moves the list of files out of the code. The code still needs the keys. What has
  been gained?
- Load everything up front, or on demand? Think of a game where each is clearly right. (A small
  arcade game; an open world, or a game with many levels.)
- `this.textures.remove(key)` while a game object is still showing that picture - what would you
  expect? Why is it safe in the rooms project?

## Extension ideas

- load a **bitmap font** or a **web font** (`this.load.font`) and use it on the menu
- a loading screen whose tips change: load `tips.txt` in the boot scene, split it into lines with
  `split("\n")`, and show a random one under the bar
- `filecomplete-json-level`: load a JSON file that *lists* other files, and queue those from inside
  that event while the loader is still running (the progress bar goes backwards - why?)
- preload the *next* room in the background while the player is in the current one
- count bytes rather than files: add up `file.bytesTotal` for a truer progress bar

## Assessment ideas

- Practical: "add a fifth room with its own background and three pictures; nothing should need to
  change except `rooms.ts` and `public/`"
- Code reading: show a `create()` that queues two files and adds images of them straight away, with
  no `start()` and no `"complete"`. What does the player see? Fix it
- Short answer: explain the difference between a key and a file name, and why the rest of the game
  should only use keys
- Short answer: what is the missing texture, and name three different causes of it

## Challenge solutions

See [solutions.md](solutions.md). Every challenge has a runnable solution in [solutions/](solutions/).
