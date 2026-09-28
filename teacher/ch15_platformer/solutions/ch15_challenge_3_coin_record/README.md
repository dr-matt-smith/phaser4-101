# Chapter 15, challenge 3 - Coin record

**Teacher's solution to Chapter 15, challenge 3.** See `../../solutions.md` for the explanation. Every change from the chapter project is marked with a `// CHALLENGE 3` comment.

(Originally: Platformer (advanced))

Three levels - Green Hills, Deep Caves and Lava Castle - chosen from a level select that unlocks
each level when the one before is finished. New in this version: moving and one-way platforms,
ladders, checkpoints, bats that swoop down at the hero, three lives shown in a HUD scene, and music.
It goes with **Chapter 15 - Platformer**, and is the last of three versions of the game.

## Controls

| Control | Does |
|---|---|
| mouse, or 1 / 2 / 3 | choose a level on the level select |
| LEFT / RIGHT arrows | run; step off a ladder |
| UP arrow or SPACE | jump - hold it for a higher jump |
| UP / DOWN arrows | climb a ladder; DOWN on top of a ladder climbs down it |
| SPACE | jump off a ladder; carry on from the result screen |
| ESC | back to the level select |

## What to look at

- `src/config/levels.ts` - the list of levels: one scene plays them all
- `src/scenes/GameScene.ts` - building a level from its map; `makeLadderTopsSolid()` and
  `findLadder()`; `heroMeetsEnemy()`; lives, checkpoints and `respawn`
- `src/objects/Hero.ts` - the `"climb"` state, and the `LadderFinder` function it is given
- `src/objects/MovingPlatform.ts` - a one-way platform moved by velocity, which carries the hero
- `src/objects/Bat.ts` - a hover / swoop / return state machine
- `src/objects/Enemy.ts` - the interface that Slime and Bat both implement
- `src/scenes/HudScene.ts` - a scene drawn on top, updated by the registry's `changedata` event
- `src/Progress.ts` - unlocked levels, kept in localStorage
- `tiled/level1.tmj`, `level2.tmj`, `level3.tmj` - the levels, to open in
  [Tiled](https://www.mapeditor.org/). The game loads the copies in `public/assets/maps/`

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
