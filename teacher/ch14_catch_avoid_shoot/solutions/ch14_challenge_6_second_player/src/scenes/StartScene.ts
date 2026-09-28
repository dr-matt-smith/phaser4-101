import Phaser from "phaser";
import {
  BULLET_FILE, BULLET_KEY, ENEMY_FILE, ENEMY_KEY, EXPLODE_ANIM, EXPLOSION_FILE, EXPLOSION_FRAME_SIZE,
  EXPLOSION_KEY, EXPLOSION_SOUND, EXPLOSION_SOUND_FILE, HURT_SOUND, HURT_SOUND_FILE, LOSE_SOUND,
  LOSE_SOUND_FILE, PARTICLE_FILE, PARTICLE_KEY, SHIP_FILE, SHIP_KEY, SHOOT_SOUND, SHOOT_SOUND_FILE,
  SPACE_FILE, SPACE_KEY, STARS_FAR_KEY, STARS_NEAR_KEY,
} from "../assets.ts";
import { StarLayer } from "../objects/StarLayer.ts";
import { GAME_SCENE, START_SCENE } from "./keys.ts";

// StartScene - the title screen. It runs first, so it also loads everything, makes the explosion
// animation, and draws the two star textures - all of which then belong to the whole game.

export class StartScene extends Phaser.Scene {
  constructor() {
    super(START_SCENE);
  }

  preload(): void {
    this.load.image(SPACE_KEY, SPACE_FILE);
    this.load.image(SHIP_KEY, SHIP_FILE);
    this.load.image(ENEMY_KEY, ENEMY_FILE);
    this.load.image(BULLET_KEY, BULLET_FILE);
    this.load.image(PARTICLE_KEY, PARTICLE_FILE);
    this.load.spritesheet(EXPLOSION_KEY, EXPLOSION_FILE, {
      frameWidth: EXPLOSION_FRAME_SIZE,
      frameHeight: EXPLOSION_FRAME_SIZE,
    });
    this.load.audio(SHOOT_SOUND, SHOOT_SOUND_FILE);
    this.load.audio(EXPLOSION_SOUND, EXPLOSION_SOUND_FILE);
    this.load.audio(HURT_SOUND, HURT_SOUND_FILE);
    this.load.audio(LOSE_SOUND, LOSE_SOUND_FILE);
  }

  create(): void {
    // animations are global: made once, here, and played by any scene (Chapter 7)
    if (!this.anims.exists(EXPLODE_ANIM)) {
      this.anims.create({
        key: EXPLODE_ANIM,
        frames: this.anims.generateFrameNumbers(EXPLOSION_KEY, { start: 0, end: 7 }),
        frameRate: 20,
      });
    }

    // far stars: many, small and dim. Near stars: fewer, bigger and brighter
    StarLayer.makeTexture(this, STARS_FAR_KEY, 60, 1, 0.5);
    StarLayer.makeTexture(this, STARS_NEAR_KEY, 14, 2, 0.9);

    this.add.image(400, 300, SPACE_KEY);
    new StarLayer(this, STARS_FAR_KEY, 30);
    new StarLayer(this, STARS_NEAR_KEY, 90);

    const centreX = this.scale.width / 2;
    this.add.text(centreX, 150, "SPACE SHOOTER", {
      fontFamily: "Arial",
      fontSize: "64px",
      fontStyle: "bold",
      color: "#ffd166",
    }).setOrigin(0.5);
    this.add.text(centreX, 250, "Waves of enemy ships are coming.\nShoot them down - and don't let them hit you.", {
      fontFamily: "Arial",
      fontSize: "22px",
      color: "#ffffff",
      align: "center",
    }).setOrigin(0.5);
    // CHALLENGE 6: both players' keys
    this.add.text(centreX, 330, "Player 1: LEFT / RIGHT to move, hold SPACE to fire\nPlayer 2: A / D to move, hold W to fire", {
      fontFamily: "Arial",
      fontSize: "22px",
      color: "#a8dadc",
      align: "center",            // CHALLENGE 6
    }).setOrigin(0.5);
    this.add.image(centreX - 60, 420, SHIP_KEY);                     // CHALLENGE 6: two ships
    this.add.image(centreX + 60, 420, SHIP_KEY).setTint(0x80ff80);   // CHALLENGE 6
    this.add.text(centreX, 510, "Press SPACE to start", {
      fontFamily: "Arial",
      fontSize: "32px",
      color: "#ffd166",
    }).setOrigin(0.5);

    this.input.keyboard!.once("keydown-SPACE", () => {
      this.scene.start(GAME_SCENE);
    });
  }
}
