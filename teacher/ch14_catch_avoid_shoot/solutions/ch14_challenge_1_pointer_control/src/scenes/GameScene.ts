import Phaser from "phaser";
import { Basket, BASKET_FILE, BASKET_KEY } from "../objects/Basket.ts";

// GameScene - the whole game: fruit and bombs fall from the sky; catch the fruit, dodge the bombs
//
// A timer drops something from the top of the screen every SPAWN_DELAY milliseconds. Catching a
// fruit scores points. Catching a bomb, or letting a fruit hit the ground, costs a life. With no
// lives left the game is over, and SPACE plays again.

const SKY_KEY = "sky";
const SKY_FILE = "assets/images/sky.png";
const FRUIT_KEY = "fruit";
const FRUIT_FILE = "assets/images/fruit.png";
const BOMB_KEY = "bomb";
const BOMB_FILE = "assets/images/bomb.png";
const CATCH_SOUND = "coin";
const CATCH_SOUND_FILE = "assets/audio/coin.wav";
const HURT_SOUND = "hurt";
const HURT_SOUND_FILE = "assets/audio/hurt.wav";
const LOSE_SOUND = "lose";
const LOSE_SOUND_FILE = "assets/audio/lose.wav";

const START_LIVES = 3;
const SPAWN_DELAY = 700;       // milliseconds between drops
const BOMB_CHANCE = 0.3;       // 30% of drops are bombs
const FALL_GRAVITY = 220;      // falling things speed up by this much, pixels per second, every second
const FRUIT_POINTS = 10;
const DROP_Y = -30;            // things start just above the top of the screen...
const GONE_Y = 640;            // ...and are thrown away once they are below the bottom
const EDGE = 40;               // keep drops this far from the sides
const BASKET_Y = 560;
const CLOSE_ENOUGH = 10;       // CHALLENGE 1: stop when the basket is this close to the pointer (pixels)

export class GameScene extends Phaser.Scene {
  // Fields with `!` are set in create(), not in the constructor. The `!` tells TypeScript "trust
  // me, this will have a value before it is used".
  private basket!: Basket;
  private fruit!: Phaser.Physics.Arcade.Group;
  private bombs!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spawnTimer!: Phaser.Time.TimerEvent;
  private hudText!: Phaser.GameObjects.Text;
  // CHALLENGE 1: where the pointer wants the basket to go - or null when the keys are in charge
  private pointerTargetX: number | null = null;

  private score = 0;
  private lives = START_LIVES;
  private gameOver = false;

  constructor() {
    super("GameScene");
  }

  // SPACE restarts this scene after a game over - and a restarted scene keeps its old field values
  // (Chapter 2), so put them back here
  init(): void {
    this.score = 0;
    this.lives = START_LIVES;
    this.gameOver = false;
    this.pointerTargetX = null;   // CHALLENGE 1
  }

  preload(): void {
    this.load.image(SKY_KEY, SKY_FILE);
    this.load.image(BASKET_KEY, BASKET_FILE);
    this.load.image(FRUIT_KEY, FRUIT_FILE);
    this.load.image(BOMB_KEY, BOMB_FILE);
    this.load.audio(CATCH_SOUND, CATCH_SOUND_FILE);
    this.load.audio(HURT_SOUND, HURT_SOUND_FILE);
    this.load.audio(LOSE_SOUND, LOSE_SOUND_FILE);
  }

  create(): void {
    this.add.image(400, 300, SKY_KEY);

    this.basket = new Basket(this, 400, BASKET_Y);

    // Two physics groups. Every member they make gets a body, and the settings here -
    // gravityY - are given to each new member as it is made.
    this.fruit = this.physics.add.group({ gravityY: FALL_GRAVITY });
    this.bombs = this.physics.add.group({ gravityY: FALL_GRAVITY });

    // The basket against a whole group: Phaser checks every member, every frame, and calls back
    // with the two objects that touch. It cannot know their exact classes, so we say (with `as`).
    this.physics.add.overlap(this.basket, this.fruit, (_basket, fruit) => {
      this.catchFruit(fruit as Phaser.Physics.Arcade.Sprite);
    });
    this.physics.add.overlap(this.basket, this.bombs, (_basket, bomb) => {
      this.catchBomb(bomb as Phaser.Physics.Arcade.Sprite);
    });

    // the spawner: call dropSomething() every SPAWN_DELAY milliseconds, for ever (loop)
    this.spawnTimer = this.time.addEvent({
      delay: SPAWN_DELAY,
      loop: true,
      callback: () => {
        this.dropSomething();
      },
    });

    this.cursors = this.input.keyboard!.createCursorKeys();

    // CHALLENGE 1: the mouse moving, or a finger touching or dragging, sets a target for the basket.
    // (A touch screen has no "move without pressing", so pointerdown matters there.)
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      this.pointerTargetX = pointer.x;
    });
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.pointerTargetX = pointer.x;
    });

    this.hudText = this.add.text(16, 12, "", {
      fontFamily: "Arial",
      fontSize: "26px",
      color: "#1d3557",
      fontStyle: "bold",
    });
    this.updateHud();
  }

  override update(): void {
    if (this.gameOver) {
      return;
    }

    // CHALLENGE 1: a key press takes over from the pointer, until the pointer moves again
    if (this.cursors.left.isDown) {
      this.pointerTargetX = null;
      this.basket.move(-1);
    } else if (this.cursors.right.isDown) {
      this.pointerTargetX = null;
      this.basket.move(1);
    } else if (this.pointerTargetX !== null) {
      this.moveTowardsPointer(this.pointerTargetX);
    } else {
      this.basket.move(0);
    }

    // Anything that has fallen off the bottom is finished with. getChildren() gives a copy of the
    // group's members, so it is safe to destroy them while going through it.
    for (const fruit of this.fruit.getChildren() as Phaser.Physics.Arcade.Sprite[]) {
      if (fruit.y > GONE_Y) {
        fruit.destroy();
        this.loseLife();       // a dropped fruit costs a life
      }
    }
    for (const bomb of this.bombs.getChildren() as Phaser.Physics.Arcade.Sprite[]) {
      if (bomb.y > GONE_Y) {
        bomb.destroy();        // a dodged bomb costs nothing
      }
    }
  }

  // CHALLENGE 1: slide towards the pointer at the basket's normal speed, and stop when close enough.
  // Without CLOSE_ENOUGH the basket would overshoot by a few pixels every frame and jitter.
  private moveTowardsPointer(targetX: number): void {
    const distance = targetX - this.basket.x;
    if (Math.abs(distance) < CLOSE_ENOUGH) {
      this.basket.move(0);
    } else {
      this.basket.move(Math.sign(distance));
    }
  }

  // called by the spawn timer: a new fruit or bomb, at a random place along the top
  private dropSomething(): void {
    const x = Phaser.Math.Between(EDGE, this.scale.width - EDGE);

    if (Math.random() < BOMB_CHANCE) {
      // group.create() makes a physics sprite, adds it to the scene AND to the group
      const bomb: Phaser.Physics.Arcade.Sprite = this.bombs.create(x, DROP_Y, BOMB_KEY);
      bomb.setAngularVelocity(Phaser.Math.Between(-180, 180));   // a slow tumble, in degrees per second
    } else {
      this.fruit.create(x, DROP_Y, FRUIT_KEY);
    }
  }

  private catchFruit(fruit: Phaser.Physics.Arcade.Sprite): void {
    fruit.destroy();
    this.sound.play(CATCH_SOUND);
    this.score = this.score + FRUIT_POINTS;
    this.updateHud();
  }

  private catchBomb(bomb: Phaser.Physics.Arcade.Sprite): void {
    bomb.destroy();
    this.cameras.main.shake(200, 0.01);
    this.loseLife();
  }

  private loseLife(): void {
    if (this.gameOver) {
      return;
    }
    this.sound.play(HURT_SOUND);
    this.lives = this.lives - 1;
    this.updateHud();

    if (this.lives <= 0) {
      this.endGame();
    }
  }

  private endGame(): void {
    this.gameOver = true;
    this.sound.play(LOSE_SOUND);

    // stop the world: no more drops, and everything freezes where it is
    this.spawnTimer.remove();
    this.physics.pause();
    this.basket.setTint(0x777777);

    const centreX = this.scale.width / 2;
    this.add.text(centreX, 250, "GAME OVER", {
      fontFamily: "Arial",
      fontSize: "72px",
      fontStyle: "bold",
      color: "#e63946",
      stroke: "#ffffff",
      strokeThickness: 6,
    }).setOrigin(0.5);
    this.add.text(centreX, 340, `You scored ${this.score}. Press SPACE to play again`, {
      fontFamily: "Arial",
      fontSize: "28px",
      color: "#1d3557",
    }).setOrigin(0.5);

    this.input.keyboard!.once("keydown-SPACE", () => {
      this.scene.restart();
    });
  }

  private updateHud(): void {
    this.hudText.setText(`Score: ${this.score}    Lives: ${this.lives}`);
  }
}
