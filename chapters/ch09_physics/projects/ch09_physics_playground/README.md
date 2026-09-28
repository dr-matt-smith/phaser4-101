# Physics Playground

A box of balls and crates in an Arcade Physics world, with keys that change the laws of physics
while it runs: gravity, bounce, drag (linear or damping), the friction of a moving platform, slow
motion and pause. Click to drop more balls; V shows the bodies Arcade is really using, and their
velocities. It goes with **Chapter 9 - 2D physics**.

## Controls

| Control | Does |
|---|---|
| mouse | click to drop a ball |
| C | drop a crate at the pointer |
| G | world gravity: earth, jupiter, off, moon |
| B | ball bounce: a little, super, perfect, dead |
| D | drag: none, linear, damping |
| F | the moving platform's friction: 1 (carries crates) or 0 (slides out from under them) |
| T | slow motion on and off (the physics world's `timeScale`) |
| P | pause and resume the physics |
| V | show the bodies and their velocities (debug drawing) |
| R | start again |

## What to look at

- `src/main.ts` - the `physics` section of the config: Arcade, gravity, `fps`, `debug`
- `src/scenes/PlaygroundScene.ts` - `setUpKeys()` changes the world (`gravity.y`, `timeScale`,
  `pause()`) and every body (`applySettings()`); `update()` counts `body.blocked` and
  `body.touching`; the `"worldbounds"` listener counts wall hits; `addBall()` adds to the group
  *before* setting anything up
- `src/objects/Ball.ts` - a circle body, and `preUpdate()` making the picture roll
- `src/objects/Crate.ts` - a heavier body (`setMass` is called in the scene)
- `src/objects/MovingPlatform.ts` - `setImmovable`, no gravity, bouncing off the world's edges

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
