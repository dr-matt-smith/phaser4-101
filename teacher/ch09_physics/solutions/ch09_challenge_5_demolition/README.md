# Chapter 9, challenge 5 - Demolition

**Teacher's solution to Chapter 9, challenge 5.** See `../../solutions.md` for the explanation. Every change from the chapter project is marked with a `// CHALLENGE 5` comment.

(Originally: Matter Stack)

A Matter.js world: a tower and a pyramid of crates, standing on the ground, for you to knock over.
Fire heavy cannonballs at the pointer, drop crates, balls, hexagons and triangles, and drag anything
with the mouse. Bodies here are real shapes that rotate, tumble and rest on each other. It goes with
**Chapter 9 - 2D physics**.

## Controls

| Control | Does |
|---|---|
| mouse | drag any body (hold the button down) |
| SPACE | fire a cannonball from the bottom left, at the pointer - five shots to knock down as many crates as you can (challenge 5) |
| 1 / 2 / 3 / 4 | drop a crate / ball / hexagon / triangle at the pointer |
| V | show the bodies (debug drawing) |
| R | build it all again |

## What to look at

- `src/main.ts` - `default: "matter"`, and Matter's gravity (`y: 1`, not pixels per second)
- `src/scenes/StackScene.ts` - a static ground, `this.matter.world.setBounds(...)` for walls,
  `buildTower()` and `buildPyramid()`, `this.matter.add.mouseSpring()`, and `fire()`: a velocity in
  pixels per *step*, and `setOnCollide`
- `src/objects/Crate.ts`, `Ball.ts` - extending `Phaser.Physics.Matter.Image`; body options
  `friction`, `restitution` and `shape`
- `src/objects/Cannonball.ts` - `density`, and a texture drawn with `Graphics.generateTexture`
- `src/objects/Polygon.ts` - `{ type: "polygon", sides, radius }`, and a picture drawn to match it

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
