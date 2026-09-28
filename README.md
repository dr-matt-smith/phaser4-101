# Phaser 4 - a guide for OO programmers

**2D games in TypeScript, with Phaser 4 and Deno**

A practical guide to making 2D browser games with [Phaser 4](https://phaser.io/), written for
programmers who know object-oriented programming from Java (and perhaps a little JavaScript), and who
are learning TypeScript as they go. Every chapter comes with Celbridge projects to build, run and
change, and ends with six challenges, from simple to advanced.

The first eleven chapters introduce the ideas every Phaser game is made of. The last four each
build a complete game in a classic genre, in simple, intermediate and advanced versions.

## Getting started

You need [Deno](https://deno.com/) 2.4 or later, and (optionally) Celbridge. Each project builds and
runs the same way - open its `terminal.console`, press **build**, then **serve**, then open
`game.webview` (or http://127.0.0.1:8000/). Chapter 1 explains it all. Phaser is the only package a
project downloads; the first build needs an internet connection, after that everything works offline.

## Chapters

### Part 1 - The ideas

1. **[Introduction: your first Phaser 4 game](chapters/ch01_introduction/README.md)**
   What Phaser is, how a project is built and run with Deno and Celbridge, and the TypeScript you need
   as a Java programmer. Meets the three parts of every game - a config, scenes and game objects - the
   coordinate system, and the game loop, with a ball that moves itself at a speed in pixels per second.

2. **[A three-scene game](chapters/ch02_three_scene_game/README.md)**
   A complete little game: press SPACE to start, click the bouncing ball to win, see your time. Covers
   starting one scene from another, passing data between scenes with `init(data)` and interfaces,
   clicking on game objects, and the registry - plus the trap that catches everyone: scenes are reused.

3. **[Preloading](chapters/ch03_preloading/README.md)**
   How Phaser's loader works: the boot-and-preload scene pattern, a progress bar driven by loader
   events, and loading every kind of asset - images, sprite sheets, audio, JSON data and asset packs.
   Also loading more assets in the middle of a game, and what to do when a file fails to load.

4. **[The life of a scene](chapters/ch04_scene_lifecycle/README.md)**
   Exactly what Phaser calls, and when: `init`, `preload`, `create`, `update`, and `preUpdate` on game
   objects, with `time` and `delta`. Scene events, and the scene manager's other powers - running
   scenes side by side, pausing, sleeping and waking - used for a pause menu and a HUD.

5. **[Audio](chapters/ch05_audio/README.md)**
   Sound effects and music: loading and playing sounds, volume, looping, rate and detune, music that
   carries on across scenes, a mute button, fading with tweens, and the browser's rule that no sound
   plays until the player has interacted with the page.

6. **[Scoring](chapters/ch06_scoring/README.md)**
   Keeping score properly: a HUD in its own scene, running on top of the game; events and the
   registry's change events so the HUD updates itself; and a high-score table that survives closing
   the browser, using local storage.

7. **[Animations](chapters/ch07_animations/README.md)**
   Making things move: sprite sheets and frame animations (`this.anims.create`, `play`, animation
   events), flipping a character to face its way, a small animation state machine, and tweens for
   smooth movement, scaling, fading and chains of effects - plus particle bursts.

8. **[Collisions](chapters/ch08_collisions/README.md)**
   Knowing when things touch: geometric tests by hand with `Phaser.Geom`, then Arcade Physics bodies -
   `overlap` versus `collider`, groups against groups, callbacks, and body sizes and shapes - building up
   to a breakout game.

9. **[2D physics](chapters/ch09_physics/README.md)**
   Arcade Physics in depth: velocity, acceleration, gravity, drag, bounce, maximum speed, angular
   movement, static and immovable bodies, and wrapping round the world - with an Asteroids-style ship.
   Ends with a first look at Matter.js, Phaser's other physics engine, for stacking and tumbling shapes.

10. **[Tilemaps](chapters/ch10_tilemaps_simple/README.md)**
    Building worlds from tiles: a tilemap from a 2D array, a tileset image, layers, collision by tile
    index, changing tiles while the game runs, and a camera that follows the player round a map bigger
    than the screen - with a little tile painter.

11. **[Tilemaps with Tiled](chapters/ch11_tilemaps_tiled/README.md)**
    Designing levels in [Tiled](https://www.mapeditor.org/), the free map editor: tilesets, tile layers,
    object layers and custom properties, exporting to JSON, and loading the result into Phaser - with
    collision by property, spawn points and pickups placed in the editor, and doors between maps.

### Part 2 - Games

12. **[Higher or lower](chapters/ch12_higher_or_lower/README.md)**
    A card game: guess whether the next card is higher or lower, and get five right to win. A `Card` and
    a `Deck` class, a proper shuffle, a flip animation, buttons, and game state - in simple, intermediate
    and advanced versions.

13. **[Memory match](chapters/ch13_memory_match/README.md)**
    Turn over two tiles; keep them if they match. A grid laid out in code, flip tweens, a small state
    machine that stops the player clicking while tiles are showing, moves and time, levels and star
    ratings.

14. **[Catch, avoid and shoot](chapters/ch14_catch_avoid_shoot/README.md)**
    The left-right game: a player at the bottom of the screen who catches good things, dodges bad ones,
    and fires at enemies. Spawning with timers, object pools, waves, power-ups, lives, and particle
    explosions.

15. **[Platformer](chapters/ch15_platformer/README.md)**
    Run and jump: gravity and ground checks, a responsive jump, an animated hero, a tilemap level,
    collectables, patrolling enemies you can stomp, hazards, and - in the advanced version - moving
    platforms, checkpoints and several levels.

## Also in this guide

- **[assets/](assets/README.md)** - every picture, sprite sheet, tileset and sound the projects use,
  all generated by code, and free to use
- **[teacher/](teacher/README.md)** - for teachers: notes, worked solutions (with a runnable project
  for every challenge) and MARP slides for each chapter. Kept separate so the chapters can be given
  to students on their own
- **[README_build_pdfs.md](README_build_pdfs.md)** - how to make PDFs of the book, the teacher guide,
  single chapters and slide decks (they are in `_PDFs/`)
- **[template/](template/)** - the starting point for a new project
- **[tools/](tools/AUTHORING.md)** - how the guide is put together, and the tools used to make it
