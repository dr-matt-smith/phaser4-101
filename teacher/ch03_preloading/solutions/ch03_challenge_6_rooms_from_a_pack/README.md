# Chapter 3, challenge 6 - Rooms from a pack

**Teacher's solution to Chapter 3, challenge 6.** See `../../solutions.md` for the explanation. Every change from the chapter project is marked with a `// CHALLENGE 6` comment.

(Originally: Load on Demand)

A menu of four rooms. Nothing belonging to a room is loaded at the start: the first time you choose
a room, the menu loads its pictures and sound (with a progress bar), then goes in. Come back and
choose it again, and it is instant - the files are still in the game's caches. U unloads every
room, so they have to be loaded again. It goes with **Chapter 3 - Preloading**.

## Controls

| Control | Does |
|---|---|
| mouse | (menu) click a room to load it, if needed, and go in |
| U | (menu) unload every room's files |
| ESC | (room) back to the menu |

To see the loading bar, slow the network down: in Chrome or Edge, open the developer tools (F12),
and on the **Network** tab tick **Disable cache** and choose **Slow 4G** or **3G**.

## What to look at

- `public/assets/rooms_pack.json` - (challenge 6) every room's files, as an asset pack with a
  section for each room
- `src/rooms.ts` - every room as plain data: its section of the pack, its keys, and where its
  pictures go
- `src/scenes/MenuScene.ts` - `chooseRoom()` checks `isLoaded()`, queues what is missing, and calls
  `this.load.start()`, waiting for `"complete"`; `unloadRooms()` removes files from the caches
- `src/scenes/RoomScene.ts` - one scene for every room, told which by the data it is started with

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
