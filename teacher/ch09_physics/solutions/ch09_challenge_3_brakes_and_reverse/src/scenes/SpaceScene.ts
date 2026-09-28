import Phaser from "phaser";
import { Rock, ROCK_FILE, ROCK_KEY } from "../objects/Rock.ts";
import { Ship, SHIP_FILE, SHIP_KEY } from "../objects/Ship.ts";

// SpaceScene - an Asteroids-style game: fly, shoot the rocks, do not get hit
//
// All the movement is Arcade Physics: the ship accelerates and drifts, rocks drift and spin,
// bullets fly, and everything wraps round from one edge of the screen to the other.

const SPACE_KEY = "space";
const SPACE_FILE = "assets/images/space.png";
const BULLET_KEY = "bullet";
const BULLET_FILE = "assets/images/bullet.png";
const PARTICLE_KEY = "particle";
const PARTICLE_FILE = "assets/images/particle.png";
const EXPLOSION_KEY = "explosion";
const EXPLOSION_FILE = "assets/spritesheets/explosion.png";
const EXPLODE_ANIM = "explode";
const SHOOT_KEY = "shoot";
const SHOOT_FILE = "assets/audio/shoot.wav";
const BANG_KEY = "bang";
const BANG_FILE = "assets/audio/explosion.wav";
const HURT_KEY = "hurt";
const HURT_FILE = "assets/audio/hurt.wav";

const BULLET_SPEED = 600;    // pixels per second, on top of the ship's own speed
const BULLET_LIFE = 900;     // milliseconds before a bullet disappears
const FIRE_DELAY = 180;      // milliseconds between shots while SPACE is held
const FIRST_WAVE = 4;        // rocks in the first wave; one more every wave
const SAFE_DISTANCE = 200;   // new rocks never start this close to the ship
const START_LIVES = 3;
const RESPAWN_DELAY = 1500;  // milliseconds
const SAFE_TIME = 2000;      // milliseconds a new ship cannot be hit
const ROCK_SCORE = 10;
const REVERSE_POWER = 0.5;   // CHALLENGE 3: the retro-rockets have half the main engine's thrust

// how far off the screen something goes before it reappears on the other side - about half its
// size, so it slides smoothly off one edge and on at the other
const SHIP_WRAP = 32;
const ROCK_WRAP = 36;
const BULLET_WRAP = 10;

export class SpaceScene extends Phaser.Scene {
  // Fields set in create() are declared with `!`: "trust me, this will be set before it is
  // used". TypeScript cannot see that create() always runs first.
  private ship!: Ship;
  private rocks!: Phaser.Physics.Arcade.Group;
  private bullets!: Phaser.Physics.Arcade.Group;
  private exhaust!: Phaser.GameObjects.Particles.ParticleEmitter;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private brakeKey!: Phaser.Input.Keyboard.Key;   // CHALLENGE 3
  private hud!: Phaser.GameObjects.Text;
  private message!: Phaser.GameObjects.Text;

  // the round's state - reset in init(), because Phaser reuses the scene object on restart
  private score = 0;
  private lives = START_LIVES;
  private wave = 0;
  private nextShotTime = 0;
  private safeUntil = 0;
  private gameOver = false;

  constructor() {
    super("SpaceScene");
  }

  init(): void {
    this.score = 0;
    this.lives = START_LIVES;
    this.wave = 0;
    this.nextShotTime = 0;
    this.safeUntil = 0;
    this.gameOver = false;
  }

  preload(): void {
    this.load.image(SPACE_KEY, SPACE_FILE);
    this.load.image(SHIP_KEY, SHIP_FILE);
    this.load.image(ROCK_KEY, ROCK_FILE);
    this.load.image(BULLET_KEY, BULLET_FILE);
    this.load.image(PARTICLE_KEY, PARTICLE_FILE);
    this.load.spritesheet(EXPLOSION_KEY, EXPLOSION_FILE, { frameWidth: 64, frameHeight: 64 });
    this.load.audio(SHOOT_KEY, SHOOT_FILE);
    this.load.audio(BANG_KEY, BANG_FILE);
    this.load.audio(HURT_KEY, HURT_FILE);
  }

  create(): void {
    this.add.image(0, 0, SPACE_KEY).setOrigin(0);

    // animations belong to the game, not the scene - only make it the first time
    if (!this.anims.exists(EXPLODE_ANIM)) {
      this.anims.create({
        key: EXPLODE_ANIM,
        frames: this.anims.generateFrameNumbers(EXPLOSION_KEY, { start: 0, end: 7 }),
        frameRate: 20,
      });
    }

    // the exhaust: soft orange dots, let out one at a time while the ship thrusts
    this.exhaust = this.add.particles(0, 0, PARTICLE_KEY, {
      speed: 40,
      lifespan: 350,
      scale: { start: 0.7, end: 0 },
      alpha: { start: 0.8, end: 0 },
      tint: 0xf4a261,
      emitting: false,
    });

    this.ship = new Ship(this, 400, 300);
    this.rocks = this.physics.add.group();
    this.bullets = this.physics.add.group();

    // rocks bounce off rocks; bullets and the ship only need to know when they touch a rock
    this.physics.add.collider(this.rocks, this.rocks);
    this.physics.add.overlap(this.bullets, this.rocks, (bullet, rock) => {
      this.shootRock(bullet as Phaser.Physics.Arcade.Image, rock as Rock); // the groups only hold these
    });
    this.physics.add.overlap(
      this.ship,
      this.rocks,
      () => {
        this.hitShip();
      },
      // the process callback decides whether the overlap counts: not while the ship is safe
      () => this.time.now > this.safeUntil,
    );

    this.cursors = this.input.keyboard!.createCursorKeys();
    // CHALLENGE 3: SHIFT is not one of the cursor keys (the cursor keys object does have a
    // "shift", but a Key of our own says clearly what it is for)
    this.brakeKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.input.keyboard!.on("keydown-R", () => {
      this.scene.restart();
    });

    this.hud = this.add.text(12, 10, "", { fontFamily: "Arial", fontSize: "18px", color: "#ffffff" });
    this.message = this.add.text(400, 260, "", {
      fontFamily: "Arial",
      fontSize: "48px",
      color: "#ffd166",
      align: "center",
    }).setOrigin(0.5);

    this.nextWave();
  }

  override update(time: number): void {
    // steering: the ship is told what the keys say, and does the physics itself
    if (this.ship.active) {
      const left = this.cursors.left.isDown ? -1 : 0;
      const right = this.cursors.right.isDown ? 1 : 0;
      this.ship.turn(left + right);

      // CHALLENGE 3: forwards, backwards, or nothing - and no thrust at all while braking
      const braking = this.brakeKey.isDown;
      let power = 0;
      if (this.cursors.up.isDown) {
        power = 1;
      } else if (this.cursors.down.isDown) {
        power = -REVERSE_POWER;
      }
      this.ship.brake(braking);
      this.ship.thrust(braking ? 0 : power);

      if (this.cursors.up.isDown && !braking) {   // CHALLENGE 3: no flame while braking
        const point = this.ship.exhaustPoint;
        this.exhaust.emitParticleAt(point.x, point.y);
      }

      if (this.cursors.space.isDown && time > this.nextShotTime) {
        this.fire();
        this.nextShotTime = time + FIRE_DELAY;
      }

      // blink while the new ship is safe
      this.ship.setAlpha(time < this.safeUntil && Math.floor(time / 100) % 2 === 0 ? 0.3 : 1);
    }

    // off one edge, on at the other. wrap() works with game objects and whole groups
    this.physics.world.wrap(this.ship, SHIP_WRAP);
    this.physics.world.wrap(this.rocks, ROCK_WRAP);
    this.physics.world.wrap(this.bullets, BULLET_WRAP);

    this.hud.setText(
      `Score: ${this.score}    Lives: ${this.lives}    Wave: ${this.wave}` +
        `    Speed: ${Math.round(this.ship.speed)} px/s` +
        (this.brakeKey.isDown && this.ship.active ? "    BRAKES" : ""),   // CHALLENGE 3
    );
  }

  private fire(): void {
    const bullet = this.bullets.create(this.ship.x, this.ship.y, BULLET_KEY) as Phaser.Physics.Arcade.Image;
    // the bullet picture points up, like the ship, so it takes the ship's rotation as it is
    bullet.setRotation(this.ship.rotation);

    // velocity = the ship's own velocity + BULLET_SPEED in the direction the ship faces
    const body = bullet.body as Phaser.Physics.Arcade.Body; // a physics group makes dynamic bodies
    this.physics.velocityFromRotation(this.ship.rotation - Math.PI / 2, BULLET_SPEED, body.velocity);
    body.velocity.add((this.ship.body as Phaser.Physics.Arcade.Body).velocity);

    this.sound.play(SHOOT_KEY, { volume: 0.4 });

    this.time.delayedCall(BULLET_LIFE, () => {
      bullet.destroy();
    });
  }

  private shootRock(bullet: Phaser.Physics.Arcade.Image, rock: Rock): void {
    this.explode(rock.x, rock.y);
    bullet.destroy();
    rock.destroy();
    this.score = this.score + ROCK_SCORE;

    if (this.rocks.countActive() === 0) {
      this.nextWave();
    }
  }

  private hitShip(): void {
    this.explode(this.ship.x, this.ship.y);
    this.sound.play(HURT_KEY);
    // switch the body off and hide the ship: it cannot move, collide or be seen
    this.ship.disableBody(true, true);
    this.lives = this.lives - 1;

    if (this.lives === 0) {
      this.endGame();
      return;
    }

    this.time.delayedCall(RESPAWN_DELAY, () => {
      this.ship.respawn(400, 300);
      this.safeUntil = this.time.now + SAFE_TIME;
    });
  }

  private endGame(): void {
    this.gameOver = true;
    this.message.setText(`GAME OVER\nscore ${this.score}\n\npress R to play again`);
    // freeze the physics world: the rocks stop where they are, but the scene still runs
    this.physics.pause();
  }

  private nextWave(): void {
    this.wave = this.wave + 1;
    const count = FIRST_WAVE + this.wave - 1;

    for (let i = 0; i < count; i++) {
      // somewhere random - but not too near the ship
      let x = 0;
      let y = 0;
      do {
        x = Phaser.Math.Between(0, 800);
        y = Phaser.Math.Between(0, 600);
      } while (Phaser.Math.Distance.Between(x, y, this.ship.x, this.ship.y) < SAFE_DISTANCE);

      const rock = new Rock(this, x, y);
      this.rocks.add(rock);   // first: adding to a physics group resets the body...
      rock.launch();          // ...then set it moving
    }

    if (this.wave > 1) {
      this.message.setText(`Wave ${this.wave}`);
      this.time.delayedCall(1200, () => {
        if (!this.gameOver) {
          this.message.setText("");
        }
      });
    }
  }

  private explode(x: number, y: number): void {
    this.sound.play(BANG_KEY, { volume: 0.5 });
    const boom = this.add.sprite(x, y, EXPLOSION_KEY);
    boom.play(EXPLODE_ANIM);
    boom.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      boom.destroy();
    });
  }
}
