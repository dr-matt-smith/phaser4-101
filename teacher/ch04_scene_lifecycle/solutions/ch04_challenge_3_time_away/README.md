# Chapter 4, challenge 3 - Time away

**Teacher's solution to Chapter 4, challenge 3.** See `../../solutions.md` for the explanation. Every change from the chapter project is marked with a `// CHALLENGE 3` comment.

(Originally: Pause and HUD)

Coin Rush: move the blue blob with the arrow keys, collect coins before they fade, and keep away
from the triangles for 45 seconds. The game itself is one scene; the score, lives and time are a
second scene - a HUD - launched to run on top of it; and P opens a pause menu, a third scene, while
the game scene is paused behind it. It goes with **Chapter 4 - The life of a scene**.

## Controls

| Control | Does |
|---|---|
| SPACE | starts the game from the menu |
| arrow keys | move |
| P or ESC | pause; in the pause menu, P or ESC carries on |
| R | (paused, or game over) restart the round |
| Q | (paused, or game over) quit to the menu |

## What to look at

- `src/scenes/GameScene.ts` - `this.scene.launch(HUD_SCENE, hudData)`; `pauseGame()`, which
  launches `PauseScene` and pauses itself; the events it emits for the HUD; why the "safe" time
  after a hit is a timer and not `this.time.now`
- `src/scenes/HudScene.ts` - listens to `GameScene`'s events, and removes its listeners when it
  shuts down
- `src/scenes/PauseScene.ts` - `bringToTop()`; carrying on (`resume` + `stop`), restarting and
  quitting
- `src/objects/Coin.ts` - a `Sprite` whose `preUpdate()` calls `super.preUpdate()` and ages the
  coin by `delta`
- `src/main.ts` - the order of the scene list is the order the scenes are drawn in

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
