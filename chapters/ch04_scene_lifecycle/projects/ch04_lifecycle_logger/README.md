# Lifecycle Logger

Two scenes side by side. On the left, `DemoScene` - a spinning coin and a few numbers - writes
every method Phaser calls on it, and every scene event it hears, to the log on the right. The
bottom of the screen is `LogScene`: it shows what state `DemoScene` is in, and its number keys
pause, resume, sleep, wake, restart, stop, launch and remove `DemoScene`, so you can watch exactly
what each one does. It goes with **Chapter 4 - The life of a scene**.

## Controls

| Control | Does |
|---|---|
| 1 | `this.scene.pause(DEMO_SCENE)` - not updated, still drawn |
| 2 | `this.scene.resume(DEMO_SCENE)` |
| 3 | `this.scene.sleep(DEMO_SCENE)` - not updated, not drawn |
| 4 | `this.scene.wake(DEMO_SCENE)` |
| 5 | restart `DemoScene` |
| 6 | `this.scene.stop(DEMO_SCENE)` - shut it down |
| 7 | `this.scene.launch(DEMO_SCENE)` - start it (again); makes a new one if it was removed |
| 8 | `this.scene.remove(DEMO_SCENE)` - destroy it for good |
| L | leak mode on/off: `DemoScene` "forgets" to remove its listeners when it shuts down |
| S | leave `super.preUpdate()` out of the coin's `preUpdate()` (the coin stops spinning) |
| C | clear the log |

Each log line starts with the frame number (`game.loop.frame`) it happened in. Lines starting
`>>` are the commands `LogScene` gave.

## What to look at

- `src/scenes/DemoScene.ts` - `constructor`, `init`, `preload`, `create` and `update`, each writing
  to the log; `listen()` signs up for the scene events; `onShutdown()` takes the listeners off again
- `src/objects/Spinner.ts` - a `Sprite` with `protected override preUpdate(...)`, and what
  `super.preUpdate(time, delta)` is for
- `src/scenes/LogScene.ts` - the scene manager's methods (`pause`, `sleep`, `launch`, `remove`, ...)
  and questions (`isActive`, `isPaused`, `isSleeping`, `isVisible`, `getStatus`, `get`)
- `src/EventLog.ts` - a plain class that every scene can write to
- `src/main.ts` - the `fps` setting

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
