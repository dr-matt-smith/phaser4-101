# HUD Events

A game scene with three things to click - a coin, a gem and a star - and a HUD scene running on top
of it that shows how many of each you have. Each count reaches the HUD by a different route: an
event on the game scene's own emitter, an event on the game's emitter, and a value in the registry.
Restart either scene and watch what each route does. It goes with **Chapter 6 - Scoring**.

## Controls

| Control | Does |
|---|---|
| mouse | click the coin, gem or star to add one |
| 1, 2, 3 | add a coin, a gem, a star |
| R | restart the game scene (the HUD keeps running) |
| H | restart the HUD (the game scene keeps running) |

## What to look at

- `src/scenes/GameScene.ts` - `addCoin()`, `addGem()` and `addStar()`: the three ways of
  announcing a change; `create()` launches the HUD only if it is not already running
- `src/scenes/HudScene.ts` - `create()` listens on three different emitters, reads the current
  values it may have missed, and removes its listeners on `SHUTDOWN`; `update()` shows each
  event's listener count
- `src/events.ts` - event names and the registry key, as constants

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
