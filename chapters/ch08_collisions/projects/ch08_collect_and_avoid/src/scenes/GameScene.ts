import Phaser from "phaser";
import {
  COIN_SOUND, COIN_SOUND_FILE, CRATE_FILE, CRATE_KEY, ENEMY_FILE, ENEMY_KEY, HURT_SOUND, HURT_SOUND_FILE,
  LOSE_SOUND, LOSE_SOUND_FILE, PLAYER_FILE, PLAYER_KEY, STAR_FILE, STAR_KEY,
} from "../assets.ts";
import { Player } from "../objects/Player.ts";

// GameScene - collect the stars, keep away from the red triangles
//
// Every collision in the game is set up ONCE, in create(), with this.physics.add.collider (things
// that must not pass through each other) or this.physics.add.overlap (things that only need to
// know they touched). After that the physics engine checks them every frame by itself.

const START_LIVES = 3;
const STAR_COUNT = 3;
const STAR_RESPAWN_TIME = 1000;     // ms before a collected star comes back
const START_ENEMIES = 2;
const STARS_PER_ENEMY = 5;          // another enemy joins every 5 stars
const ENEMY_SPEED = 150;
const INVULNERABLE_TIME = 1500;     // ms of safety after being hit
const SAFE_DISTANCE = 150;          // nothing new appears closer than this to the player
const CRATE_SCALE = 1.5;
const CRATE_PLACES = [[200, 180], [600, 180], [200, 420], [600, 420], [400, 300]];

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private crates!: Phaser.Physics.Arcade.StaticGroup;
  private stars!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;

  // the overlap between the player and the enemies - kept, so it can be switched off for a while
  private enemyOverlap!: Phaser.Physics.Arcade.Collider;

  private hud!: Phaser.GameObjects.Text;
  private score = 0;
  private lives = START_LIVES;

  constructor() {
    super("GameScene");
  }

  // the scene object is reused when it restarts (Chapter 2): put the numbers back
  init(): void {
    this.score = 0;
    this.lives = START_LIVES;
  }

  preload(): void {
    this.load.image(PLAYER_KEY, PLAYER_FILE);
    this.load.image(STAR_KEY, STAR_FILE);
    this.load.image(ENEMY_KEY, ENEMY_FILE);
    this.load.image(CRATE_KEY, CRATE_FILE);
    this.load.audio(COIN_SOUND, COIN_SOUND_FILE);
    this.load.audio(HURT_SOUND, HURT_SOUND_FILE);
    this.load.audio(LOSE_SOUND, LOSE_SOUND_FILE);
  }

  create(): void {
    // crates: a STATIC group. Static bodies never move, and cost almost nothing to check
    this.crates = this.physics.add.staticGroup();
    for (const [x, y] of CRATE_PLACES) {
      // create() makes a member of the group. It is typed `any`, so say what it is: a physics
      // group makes Arcade Sprites unless told otherwise
      const crate = this.crates.create(x, y, CRATE_KEY) as Phaser.Physics.Arcade.Sprite;
      crate.setScale(CRATE_SCALE);
      // a static body does not follow its game object: after scaling, make the body match again
      crate.refreshBody();
    }

    this.player = new Player(this, 400, 520);

    // stars: a dynamic group, though stars never move. A dynamic body can be switched off and on
    this.stars = this.physics.add.group();
    for (let i = 0; i < STAR_COUNT; i++) {
      const spot = this.freeSpot();
      const star = this.stars.create(spot.x, spot.y, STAR_KEY) as Phaser.Physics.Arcade.Sprite;
      // a round body, smaller than the picture: radius 12, its top-left 4 across and 5 down
      star.setCircle(12, 4, 5);
    }

    // enemies: every enemy made by this group gets these settings - bounce off everything, with
    // no speed lost (1 = all of it kept), and stay inside the game
    this.enemies = this.physics.add.group({
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true,
    });
    for (let i = 0; i < START_ENEMIES; i++) {
      this.addEnemy();
    }

    // COLLIDERS: these must not pass through each other. Phaser pushes them apart
    this.physics.add.collider(this.player, this.crates);
    this.physics.add.collider(this.enemies, this.crates);
    this.physics.add.collider(this.enemies, this.enemies);   // a group against itself

    // OVERLAPS: only tell us that they touched - nothing is pushed
    this.physics.add.overlap(this.player, this.stars, (_player, star) => {
      // Phaser's types allow for a body or a tile here too; we know it is a star, because the
      // second thing we passed was the stars group
      this.collectStar(star as Phaser.Physics.Arcade.Sprite);
    });
    this.enemyOverlap = this.physics.add.overlap(this.player, this.enemies, () => {
      this.hurtPlayer();
    });

    this.cursors = this.input.keyboard!.createCursorKeys();

    this.hud = this.add.text(10, 10, "", {
      fontFamily: "Arial",
      fontSize: "22px",
      color: "#ffffff",
    });
    this.hud.setDepth(1);
    this.showHud();
  }

  override update(): void {
    if (this.lives > 0) {
      this.player.move(this.cursors);
    }
  }

  private collectStar(star: Phaser.Physics.Arcade.Sprite): void {
    this.sound.play(COIN_SOUND);
    this.score++;
    this.showHud();

    // switch the star's body off and hide it: it can no longer be touched or seen
    star.disableBody(true, true);

    // ...and bring it back somewhere else a moment later
    this.time.delayedCall(STAR_RESPAWN_TIME, () => {
      const spot = this.freeSpot();
      star.enableBody(true, spot.x, spot.y, true, true);
    });

    if (this.score % STARS_PER_ENEMY === 0) {
      this.addEnemy();
    }
  }

  private hurtPlayer(): void {
    // two enemies can touch the player in the same frame - only the first one counts
    if (!this.enemyOverlap.active) {
      return;
    }
    this.lives--;
    this.showHud();

    if (this.lives <= 0) {
      this.gameOver();
      return;
    }
    this.sound.play(HURT_SOUND);

    // a short time of safety: switch the overlap off, flash the player, and switch it on again.
    // Without this, touching an enemy would cost a life EVERY FRAME it touched
    this.enemyOverlap.active = false;
    this.tweens.add({
      targets: this.player,
      alpha: 0.2,
      duration: 100,
      yoyo: true,
      repeat: 6,
    });
    this.time.delayedCall(INVULNERABLE_TIME, () => {
      this.player.setAlpha(1);
      this.enemyOverlap.active = true;
    });
  }

  private addEnemy(): void {
    const spot = this.freeSpot();
    const enemy = this.enemies.create(spot.x, spot.y, ENEMY_KEY) as Phaser.Physics.Arcade.Sprite;

    // enemy.png is a triangle in a 48 x 48 picture. A body the size of the picture would hurt
    // the player when they touched an empty corner, so use a smaller box in the middle
    enemy.setSize(24, 24);
    enemy.setOffset(12, 18);

    // off in a random direction
    const angle = Phaser.Math.Angle.Random();
    enemy.setVelocity(Math.cos(angle) * ENEMY_SPEED, Math.sin(angle) * ENEMY_SPEED);
  }

  // A random place that is not on a crate, and not too near the player - checked by hand with
  // Phaser.Geom, just like the shapes project
  private freeSpot(): Phaser.Math.Vector2 {
    const spot = new Phaser.Math.Vector2();
    let clear = false;
    while (!clear) {
      spot.set(Phaser.Math.Between(40, 760), Phaser.Math.Between(60, 560));
      const area = new Phaser.Geom.Rectangle(spot.x - 30, spot.y - 30, 60, 60);

      clear = Phaser.Math.Distance.BetweenPoints(spot, this.player) > SAFE_DISTANCE;
      for (const child of this.crates.getChildren()) {
        const crate = child as Phaser.Physics.Arcade.Sprite;
        if (Phaser.Geom.Intersects.RectangleToRectangle(area, crate.getBounds())) {
          clear = false;
        }
      }
    }
    return spot;
  }

  private gameOver(): void {
    this.sound.play(LOSE_SOUND);

    // the player's body is switched off, so nothing can touch it any more; the enemies carry on
    this.player.disableBody(true, true);

    this.add.text(400, 300, `Game over - ${this.score} stars\nPress SPACE to play again`, {
      fontFamily: "Arial",
      fontSize: "36px",
      color: "#ffd166",
      align: "center",
      backgroundColor: "#1d2433",
      padding: { x: 16, y: 10 },
    }).setOrigin(0.5).setDepth(1);

    this.input.keyboard!.once("keydown-SPACE", () => {
      this.scene.restart();
    });
  }

  private showHud(): void {
    this.hud.setText(`Stars: ${this.score}    Lives: ${Math.max(this.lives, 0)}`);
  }
}
