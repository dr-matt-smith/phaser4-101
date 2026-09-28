# Platformer (simple)

One screen of floating platforms: run, jump, and collect all ten spinning coins as fast as you can.
The hero is an Arcade Physics sprite pulled down by gravity, standing on a static group of
platforms, with a small animation state machine choosing idle, run, jump or fall. It goes with
**Chapter 15 - Platformer**, and is the first of three versions of the game.

## Controls

| Control | Does |
|---|---|
| LEFT / RIGHT arrows | run |
| UP arrow or SPACE | jump (only when standing on something) |
| R | start again |

## What to look at

- `src/main.ts` - `physics: { default: "arcade", arcade: { gravity } }` switches physics on for
  the whole game
- `src/objects/Hero.ts` - a `Phaser.Physics.Arcade.Sprite` that reads its own keys in
  `preUpdate()`; `body.blocked.down` for "standing on something"; `animate()`, the state machine
- `src/scenes/GameScene.ts` - `this.physics.add.staticGroup()` for the platforms and the coins;
  `collider` (the hero stands on platforms) versus `overlap` (the hero collects coins)

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
