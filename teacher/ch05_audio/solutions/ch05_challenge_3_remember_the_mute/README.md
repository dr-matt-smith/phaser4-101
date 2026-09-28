# Chapter 5, challenge 3 - Remember the mute

**Teacher's solution to Chapter 5, challenge 3.** See `../../solutions.md` for the explanation. Every change from the chapter project is marked with a `// CHALLENGE 3` comment.

(Originally: Music Across Scenes)

A title screen, a menu, a credits screen and a tiny game (click the stars), sharing their music.
The menu and the credits share one track, which carries on as you move between them; the game
has its own, and the two cross-fade. A mute button in the corner of every scene works everywhere,
and remembers its setting - even after the page is refreshed. A line at the bottom shows what each music track is doing. It goes
with **Chapter 5 - Audio**.

## Controls

| Control | Does |
|---|---|
| click | starts the game from the title screen; presses the menu buttons; collects stars |
| M, or the speaker button | sound on / off, in every scene |
| ESC | back to the menu (from the credits or the game) |

## What to look at

- `src/Music.ts` - `Music.play(scene, key)`: checks `this.sound.get(key)` before making the music,
  and cross-fades with tweens
- `src/objects/MuteButton.ts` - `this.sound.mute`, and the setting kept in the registry
- `src/scenes/TitleScene.ts` - `this.sound.locked` and the `"unlocked"` event; why its listener is
  removed at `SHUTDOWN`
- `src/scenes/GameScene.ts` - `collect()` plays each coin sound with a random `detune`, and a `pan`
  from the star's position
- `src/objects/MenuButton.ts` - a click sound that keeps playing after the scene changes
- `src/objects/MusicMonitor.ts` - reads every track's state each frame, so you can watch the fades

## Running it

Open `terminal.console` (the terminal icon), then use its buttons:

1. **build** - `deno task build` - type checks `src/`, then builds it (and Phaser) into `dist/`
2. **serve** - `deno task serve` - serves `dist/` at http://127.0.0.1:8000/

Then open `game.webview` (the controller icon), or http://127.0.0.1:8000/ in a browser. After
changing code, build again and refresh the page. `deno task dev` rebuilds every time you save.

The first build downloads Phaser (the only package the project uses). Everything else - the type
checker, the bundler, the web server - is part of Deno.
