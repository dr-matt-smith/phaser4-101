# Chapter plan

What each chapter covers, which projects it has, and which ideas belong to it (so chapters build on
each other without repeating each other). The front page (`../README.md`) has the reader-facing
summaries; this is the authors' version. Chapter folder names are fixed - the front page and the
teacher index link to them.

Every chapter: README.md + images, the projects listed, and in `teacher/<folder>/`:
`teacher_notes.md`, `solutions.md`, `slides.md`, and six solution projects. See `AUTHORING.md`.

Concept chapters (3-11) have 2-3 projects. Genre chapters (12-15) have three versions of the game -
`_simple`, `_intermediate`, `_advanced` - each a complete, playable game, and the chapter walks
through how each version grows from the one before.

Earlier chapters' ideas can be used freely later on, with a pointer back ("see Chapter 4") rather
than a re-explanation. Later chapters' ideas should not be needed earlier; where a project has to
use one early, say so in one line and point forward.

---

## 1 - Introduction (`ch01_introduction`) - DONE
Tools, TypeScript primer, config/scene/game objects, coordinates and origins, the game loop,
`preUpdate` on an `Image`, `delta`. Keyboard events (`keyboard.on`). Projects: hello_phaser,
moving_ball.

## 2 - A three-scene game (`ch02_three_scene_game`) - DONE
Scene keys, `scene.start(key, data)`, `init(data)` + interface, scenes are reused (reset in `init`),
`setInteractive` + `pointerdown`, `this.input.on("pointerdown")` with the `over` list, `on`/`once`,
`this.time.now`, `this.registry`, `this.sound.play` (one line, pointing to Ch 5), object literals,
union types, spread. Projects: click_the_ball, click_the_ball_plus.

## 3 - Preloading (`ch03_preloading`)
- the loader in depth: queue, keys and the texture/audio/json caches, relative paths, `setPath` /
  `setBaseURL`, what happens when a file is missing (`loaderror`, the missing-texture box)
- **Boot -> Preload -> Menu** pattern: a tiny BootScene loads just what the loading screen needs;
  PreloadScene shows a progress bar (Graphics) and the current file name, using loader events
  (`progress`, `fileprogress`, `complete`) - then starts the menu
- every asset type: `image`, `spritesheet` (frameWidth/frameHeight), `audio`, `json` (level data -
  read with `this.cache.json.get`), `text`; and an **asset pack** JSON (`this.load.pack`) listing files
- loading later: queue more files in `create()` and call `this.load.start()`, listening for
  `complete`; checking `this.textures.exists(key)` first
- local files load too fast to see a bar: show how to use the browser's network throttling, and/or
  make the demo load a large number of files (the same small files many times under different keys)
- Projects: `ch03_loading_screen` (boot/preload/menu with a bar), `ch03_asset_types` (one of each
  kind, shown on screen, including a JSON file that describes positions and a sprite sheet shown frame
  by frame), `ch03_load_on_demand` (a menu of "rooms", each loading its assets when chosen)
- Challenge ideas: restyle the bar; show a percentage; add a spinner/tween; load a text file and show
  it; a failed-file screen; an asset pack for a whole game

## 4 - The life of a scene (`ch04_scene_lifecycle`)
- exact order: constructor (once) -> init -> preload -> create -> (update every frame); game objects'
  `preUpdate`; physics steps; render. Scene events: `Phaser.Scenes.Events.CREATE`, `UPDATE`,
  `PRE_UPDATE`, `POST_UPDATE`, `PAUSE`, `RESUME`, `SLEEP`, `WAKE`, `SHUTDOWN`, `DESTROY`
- `Sprite` has its own `preUpdate` - `protected override preUpdate(time, delta)` and why
  `super.preUpdate(time, delta)` matters (animations stop without it)
- the scene manager: `start`, `restart`, `launch` (run in parallel), `stop`, `pause`/`resume`
  (still drawn, not updated), `sleep`/`wake` (not drawn, not updated), `bringToTop`, `isActive`,
  `get`. Scenes running side by side: order of drawing = order in the list
- cleaning up in `SHUTDOWN`: timers and listeners on other emitters (e.g. `this.game.events`) that
  would otherwise leak
- `time` vs `this.time.now`, `delta`, `this.game.loop.actualFps`; `fps: { target, limit }` config
- Projects: `ch04_lifecycle_logger` (every lifecycle call and scene event written to an on-screen
  log; keys to pause/resume/sleep/wake/restart/stop), `ch04_pause_and_hud` (a game scene with a HUD
  scene launched on top, and a pause menu scene launched with P that pauses the game scene)
- Challenge ideas: count updates while paused vs asleep; add a "settings" overlay; a scene transition
  (fade with `this.cameras.main.fadeOut` + `camerafadeoutcomplete`); find and fix a listener leak

## 5 - Audio (`ch05_audio`)
- `this.load.audio(key, files)` (array of formats possible), `this.sound.play(key, config)`,
  `this.sound.add(key)` -> a `Sound` object: `play`, `stop`, `pause`, `resume`, `isPlaying`,
  `setVolume`, `setRate`, `setDetune`, `setLoop`, `setSeek`; config object `{ volume, loop, rate,
  detune, delay }`; `sound.once("complete")`
- the sound manager is **game-wide**: music keeps playing when scenes change - so check
  `this.sound.get(key)` before starting it again; `this.sound.mute`, `this.sound.volume`
- the browser's autoplay rule: `this.sound.locked` and the `unlocked` event; "click to start" screens
- fading music in/out with tweens (`this.tweens.add({ targets: music, volume: 0 })`), random pitch
  variation to stop repeated effects sounding mechanical, stereo pan by x position (`setPan`) where
  supported
- Projects: `ch05_sound_board` (buttons that play each sound; sliders or keys for volume, rate,
  detune), `ch05_music_across_scenes` (menu and game scenes sharing one music track; a mute button
  using `sound_on.png`/`sound_off.png` that works in every scene, remembered in the registry;
  cross-fade between `music_menu` and `music_game`)
- Challenge ideas: a volume key; mute remembered with localStorage; random pitch on a repeated
  effect; pan by position; a "rhythm" game that flashes on the beat; ducking music under effects

## 6 - Scoring (`ch06_scoring`)
- a HUD scene launched in parallel (recap Ch 4), fed by **events**: `this.events.emit(...)` on the
  game scene, or `this.game.events`, or the registry's `changedata-<key>` event
  (`this.registry.events.on("changedata-score", ...)`) - compare the three, and choose
- a `ScoreManager`-style plain class (not a scene) that owns score, lives, level, multiplier and
  combo, and emits events - OO design discussion
- floating "+10" text with a tween; score counting up smoothly
- high scores that last: `localStorage.getItem`/`setItem`, `JSON.stringify`/`JSON.parse`, a typed
  `HighScore` interface, validating what comes back; entering initials with the keyboard
  (`keydown` events, `event.key`)
- Projects: `ch06_coin_collector` (click coins that appear and vanish; HUD scene; combo multiplier),
  `ch06_high_score_table` (the same game with a persistent top-10 table and initials entry)
- Challenge ideas: lives in the HUD; a combo meter; a "new high score" celebration; reset scores key;
  score saved per difficulty; defend against a corrupted localStorage value

## 7 - Animations (`ch07_animations`)
- sprite sheets recap, `this.anims.create({ key, frames: this.anims.generateFrameNumbers(sheet,
  { start, end }), frameRate, repeat })`, `sprite.play(key)`, `play(key, true)` (ignore if playing),
  `anims.isPlaying`, `anims.currentAnim`, `playAfterRepeat`, `chain`, animation events
  (`Phaser.Animations.Events.ANIMATION_COMPLETE`), global vs sprite animations (created once, in the
  preload/boot scene)
- `setFlipX` to face left/right; a small animation **state machine** for the hero (idle / run /
  jump / fall / hurt) driven by input, using `hero.png`
- tweens: `this.tweens.add({ targets, x, y, scale, alpha, angle, duration, ease, yoyo, repeat,
  delay, onComplete })`, easing curves (show several side by side), `this.tweens.chain`, stagger with
  groups, tween counters (`this.tweens.addCounter`)
- particles: `this.add.particles(x, y, "particle", { speed, lifespan, scale, alpha, tint, quantity,
  emitting: false })` and `emitter.explode(n)`; the explosion sprite sheet
- Projects: `ch07_hero_animations` (the hero on a ground strip: arrow keys run left/right with flip,
  up jumps with a fake jump tween or simple velocity - no physics needed, state machine),
  `ch07_tweens_and_particles` (a playground: buttons that trigger different tweens and easings on
  objects, click to explode with particles + explosion animation)
- Challenge ideas: add the hurt animation on a key; different frame rates; a coin spin animation
  pickup; chain of tweens for a title screen; particle trail following the pointer; animation driven
  by speed (frame rate proportional to movement)

## 8 - Collisions (`ch08_collisions`)
- by hand: bounding rectangles and circles, `Phaser.Geom.Rectangle`, `Phaser.Geom.Circle`,
  `Phaser.Geom.Intersects.RectangleToRectangle`, `CircleToCircle`, `getBounds()`; point-in-shape for
  clicks; why rectangles are "unfair" for round things
- Arcade Physics bodies: config `physics: { default: "arcade", arcade: { debug } }`,
  `this.physics.add.existing`, `this.physics.add.sprite/image`, `body.setSize`, `setOffset`,
  `setCircle`; `this.physics.add.overlap(a, b, callback)` vs `collider` (separation, bounce);
  groups (`this.physics.add.group`, `staticGroup`), group vs group; callbacks receive the two objects
  (cast with `as`); `processCallback` to decide whether a collision counts; `collider.active`,
  `destroy`
- one-way thinking: collide only from above (process callback), and disabling a body
- Projects: `ch08_hand_made_collisions` (drag shapes with the mouse; they change colour when
  touching - rectangles and circles), `ch08_collect_and_avoid` (player collects stars, avoids enemies,
  overlap with groups), `ch08_breakout` (paddle, ball, static group of bricks, collider with bounce,
  angle by where the ball hits the paddle)
- Challenge ideas: debug toggle key; circle bodies for round sprites; bricks that take two hits;
  power-up bricks; a process callback so the ball passes through certain bricks; pixel-fair hit box
  tuning with debug draw

## 9 - 2D physics (`ch09_physics`)
- Arcade in depth: `setVelocity`, `setAcceleration`, `setDrag` (and `setDamping(true)` for
  multiplicative drag), `setMaxVelocity`, `setBounce`, `setGravityY` / world gravity, `setFriction`,
  `setImmovable`, `pushable`, `setMass`, `setAngularVelocity`, `setAngularAcceleration`,
  `this.physics.velocityFromRotation`, `this.physics.world.wrap(object, padding)`, world bounds and
  `onWorldBounds` + `worldbounds` event, `body.blocked`/`touching`, `physics.pause()`
- the fixed time step, and why physics does the delta maths for you
- Matter.js briefly: `physics: { default: "matter", matter: { gravity: { y: 1 }, debug } }`,
  `this.matter.add.image(x, y, key, frame, { shape, restitution, friction })`, rectangles, circles
  and polygons, `this.matter.add.mouseSpring()` / pointer constraint, stacking and toppling; when to
  choose Matter (realistic shapes, rotation, stacking) vs Arcade (fast, simple, most 2D games)
- Projects: `ch09_physics_playground` (keys to change gravity, bounce, drag on a set of balls and
  crates; press to spawn), `ch09_space_ship` (Asteroids-style: rotate, thrust with acceleration,
  drag, max speed, world wrap, rocks with angular velocity, shooting), `ch09_matter_stack` (a Matter
  world of crates and balls to knock over; drag with the mouse)
- Challenge ideas: a gravity switch; bouncy vs dead balls with mass; ship reverse thrust and brakes;
  asteroids that split; a Matter tower that must stay standing; a pinball flipper with Matter

## 10 - Tilemaps (`ch10_tilemaps_simple`)
- why tiles: memory, level design, collision. A tileset image (`simple_tiles.png`,
  `dungeon_tiles.png`, `platform_tiles.png`), tile indexes
- `this.make.tilemap({ data: number[][], tileWidth, tileHeight })`, `map.addTilesetImage(name, key)`,
  `map.createLayer(0, tileset, x, y)`, `layer.setCollision([indexes])`,
  `this.physics.add.collider(player, layer)`, `map.putTileAt`, `removeTileAt`, `getTileAtWorldXY`,
  `worldToTileXY`, `tileToWorldXY`; blank tiles as -1
- a map bigger than the screen: `this.cameras.main.setBounds(...)`, `startFollow(player, true)`,
  `this.physics.world.setBounds(...)`; grid-based movement (tween from tile to tile) vs free movement
- Projects: `ch10_array_map` (a top-down map from an array with simple_tiles; a player that cannot
  walk into walls or water), `ch10_tile_painter` (click to paint tiles; number keys choose the tile;
  save/load the map as JSON in localStorage; print it for pasting into code), `ch10_scrolling_world`
  (a 60x40 map made in code - e.g. with random noise or rooms - camera follows, minimap with a second
  camera)
- Challenge ideas: a tile that changes when stepped on; sand slows the player; collectibles as tiles;
  grid movement with tweens; a second camera minimap; a map generated from a string of characters

## 11 - Tilemaps with Tiled (`ch11_tilemaps_tiled`)
- what Tiled is (free, mapeditor.org), and a step-by-step: new map (orthogonal, 32x32 tiles),
  new tileset from `platform_tiles.png` (embedded in the map), tile layers ("Ground", "Background"),
  a custom `collides` boolean property on tiles, an object layer ("Objects") with points/rectangles
  named "player", "coin", "enemy", "door", custom object properties, exporting as JSON (`.tmj`)
- (Tiled cannot be screenshotted here: explain with diagrams of the panels, and show the JSON
  structure instead)
- `this.load.tilemapTiledJSON(key, file)`, `this.make.tilemap({ key })`, `addTilesetImage(nameInTiled,
  imageKey)` - the names must match, `createLayer("Ground", tileset)`,
  `setCollisionByProperty({ collides: true })`, `map.getObjectLayer("Objects").objects`,
  `map.findObject`, `map.createFromObjects(...)`, reading custom properties
- the maps are provided as `.tmj` files that open in Tiled (tileset embedded, image path relative to
  the map) - written by a chapter-local script so they are consistent; also include the maps'
  source in a `tiled/` folder in each project (the `.tmj` the game loads is in `public/assets/maps/`)
- Projects: `ch11_tiled_level` (a platform level from Tiled: ground layer with collides property,
  background layer, player spawn and coins from the object layer), `ch11_tiled_doors` (two or three
  small top-down rooms made in Tiled with `dungeon_tiles.png`; door objects with a `target` property
  that load the next map and place the player at the named entrance)
- Challenge ideas: add a layer drawn above the player; a new coin type via a property; moving
  platform from a polyline object; a trigger rectangle that shows a message; a third room; animated
  tiles via Tiled's tile animation data (reading it in Phaser by hand)

## 12 - Higher or lower (`ch12_higher_or_lower`)
- genre notes (what makes a guessing game fun: risk, streaks, reveal)
- `cards.png` (frame = suit * 13 + rank - 1; backs 52, 53); a `Card` data class (suit, rank, value)
  separate from a `CardSprite` game object (view) - model/view separation discussion; a `Deck` class
  with a Fisher-Yates shuffle (and why `sort(() => Math.random() - 0.5)` is wrong), `draw()`
- game state as an enum or union of string literals (`"waiting" | "revealing" | "won" | "lost"`),
  ignoring input while revealing
- a flip animation: tween `scaleX` to 0, swap frame, tween back; buttons (button.png images with
  text, hover states); ties rule
- Projects: `ch12_higher_or_lower_simple` (text and card images, H/L keys, 5 correct in a row wins,
  wrong = start again), `ch12_higher_or_lower_intermediate` (deck, flip tween, clickable buttons,
  streak display, sounds, win/lose scenes), `ch12_higher_or_lower_advanced` (lives, score multiplier
  for risky guesses, card history row, "cash out" choice, persistent best streak, polish)
- Challenge ideas: aces high option; show cards left in the deck; probability hint; jokers wild;
  double-or-nothing; a computer player that plays the odds

## 13 - Memory match (`ch13_memory_match`)
- `memory_tiles.png` (0 back, 1-12 faces); laying out a grid with loops (rows/cols, spacing,
  centring); shuffling pairs; a `Tile` class; flip tween; state machine (`"idle" | "oneUp" |
  "twoUp" | "checking"`) and locking input; matched tiles fade/scale; moves counter, timer, star
  rating
- Projects: `ch13_memory_simple` (4x3 grid, click to flip, match or flip back after a delay),
  `ch13_memory_intermediate` (flip tweens, moves and time HUD, sounds, win scene with stars),
  `ch13_memory_advanced` (levels with larger grids, a menu, playing-card mode matching by rank
  colour, a peek power-up, a "shuffle the unmatched" twist, best results saved)
- Challenge ideas: grid size from a setting; a time limit; triple match; a hint that flashes a pair;
  two-player turns; keyboard control with a cursor

## 14 - Catch, avoid and shoot (`ch14_catch_avoid_shoot`)
- player constrained to the bottom, moving left/right (keys and pointer); spawning with
  `this.time.addEvent({ delay, loop, callback })`; falling objects with physics; object pools with
  `group.get()` / `setActive(false).setVisible(false)` / `killAndHide` vs destroy; bullets with a
  fire rate; enemy waves with patterns (tweens/paths); lives and invulnerability flashing; particles
  on hits; difficulty ramp over time; parallax starfield (`tileSprite` or scrolling images)
- Projects: `ch14_catcher_simple` (catch fruit in a basket, avoid bombs, score and lives),
  `ch14_shooter_intermediate` (ship, pooled bullets, enemy ships in waves, explosions, score),
  `ch14_shooter_advanced` (power-ups, enemy bullets, a boss with health bar, levels, HUD scene,
  music, high scores)
- Challenge ideas: pointer control; a shield power-up; enemies that zig-zag; a bomb that clears the
  screen; combo scoring; a second player

## 15 - Platformer (`ch15_platformer`)
- Arcade gravity, `body.blocked.down`/`onFloor()`, jump velocity, variable jump height (cut velocity
  when the key is released), coyote time and jump buffering, acceleration/drag for feel, the hero
  animation state machine from Ch 7, one-way platforms (process callback or `checkCollision.down`),
  enemies patrolling platform edges, stomping (touching from above) vs getting hurt, hazards
  (spikes/lava tiles), collectables, a tilemap level (from Ch 10/11 - Tiled JSON), camera follow,
  checkpoints, moving platforms (immovable bodies moved by tweens, carrying the player)
- Projects: `ch15_platformer_simple` (platform.png static group, hero with animations, coins),
  `ch15_platformer_intermediate` (Tiled level with platform_tiles, slimes that patrol and can be
  stomped, spikes, a flag to finish, camera), `ch15_platformer_advanced` (three levels, moving
  platforms, ladders, checkpoints, bats that swoop, HUD, lives, level select)
- Challenge ideas: double jump; wall jump; a springboard; collectible counter per level; a timer
  with medal times; a new enemy type
