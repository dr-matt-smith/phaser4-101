# Platformer (intermediate)

A scrolling level made in Tiled: run to the flag, collecting coins, squashing slimes by jumping
on them, and avoiding spikes, lava and bottomless gaps. Being hurt starts the level again. The hero
now accelerates and slows down, and has a variable jump, coyote time and jump buffering - the
things that make a platformer feel good. It goes with **Chapter 15 - Platformer**.

## Controls

| Control | Does |
|---|---|
| SPACE | start; play again from the end screen |
| LEFT / RIGHT arrows | run |
| UP arrow or SPACE | jump - hold it for a higher jump, tap it for a hop |
| ESC | title screen (from the end screen) |

## What to look at

- `src/objects/Hero.ts` - acceleration and drag; `jump()` with coyote time, jump buffering and
  the jump cut; `hurt()`; the `HeroState` union type and `setHeroState()`
- `src/objects/Slime.ts` - patrolling: `blocked.left` / `blocked.right` for walls,
  `shouldTurn()` looks ahead in the tilemap for edges and hazards
- `src/scenes/GameScene.ts` - loading the Tiled map, `setCollisionByProperty`, reading the Objects
  layer, the camera following the hero, `heroMeetsSlime()` (stomp or be hurt), and the hazard
  overlap with its process callback
- `tiled/level.tmj` - the level, to open in [Tiled](https://www.mapeditor.org/). The game loads the
  copy in `public/assets/maps/`: after editing, save it there too

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
