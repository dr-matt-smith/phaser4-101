# Hand-made Collisions

Three rectangles and three circles to drag around with the mouse. A shape turns red while it
touches another one. There is no physics engine here: every frame, the scene tests every pair of
shapes with `Phaser.Geom.Intersects`, and SPACE switches between testing the real shapes and testing
only their bounding rectangles - which shows why rectangles are unfair to round things. It goes with
**Chapter 8 - Collisions**.

## Controls

| Control | Does |
|---|---|
| mouse | drag a shape |
| SPACE | switch between testing the real shapes and only their bounding boxes |

## What to look at

- `src/geometry.ts` - `touching()`: which `Phaser.Geom.Intersects` test to use for each pair of
  shapes, chosen with `instanceof`; `getBounds()`
- `src/scenes/ShapesScene.ts` - `update()` tests every pair once and colours the shapes;
  `addCircle()` gives each circle a circular hit area, so only a click inside the circle picks it up

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
