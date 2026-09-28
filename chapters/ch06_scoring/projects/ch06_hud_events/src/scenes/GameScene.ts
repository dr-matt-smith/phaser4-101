import Phaser from "phaser";
import { COIN_FILE, COIN_KEY, GEM_FILE, GEM_KEY, STAR_FILE, STAR_KEY } from "../assets.ts";
import { COINS_CHANGED, GEMS_CHANGED, STARS } from "../events.ts";
import { GAME_SCENE, HUD_SCENE } from "./keys.ts";

// GameScene - three things to collect, and three different ways of telling the HUD about them
//
//   coins - the scene sends an event on its OWN emitter:    this.events.emit(...)
//   gems  - the scene sends an event on the GAME's emitter: this.game.events.emit(...)
//   stars - the scene changes a value in the REGISTRY, and the registry sends the event
//
// This scene never touches the HUD. It says what happened; whoever is listening decides what to do.

const PICKUP_Y = 300;
const PICKUP_SCALE = 3;
const LABEL_STYLE = { fontFamily: "Arial", fontSize: "18px", color: "#ffffff", align: "center" };

export class GameScene extends Phaser.Scene {
  private coins = 0;
  private gems = 0;

  constructor() {
    super(GAME_SCENE);
  }

  preload(): void {
    this.load.image(COIN_KEY, COIN_FILE);
    this.load.image(GEM_KEY, GEM_FILE);
    this.load.image(STAR_KEY, STAR_FILE);
  }

  // runs every time the scene starts - R restarts it, so everything goes back to 0 here
  init(): void {
    this.coins = 0;
    this.gems = 0;
    // the stars count lives in the registry, not in a field; setting it tells anyone listening
    this.registry.set(STARS, 0);
  }

  create(): void {
    // launch the HUD to run at the same time as this scene - unless it is already running (after
    // R restarts this scene, the HUD is still there: launching it again would restart it)
    if (!this.scene.isActive(HUD_SCENE)) {
      this.scene.launch(HUD_SCENE);
    }

    this.add.text(400, 150, "Three ways to tell the HUD", {
      fontFamily: "Arial",
      fontSize: "36px",
      fontStyle: "bold",
      color: "#ffd166",
    }).setOrigin(0.5);

    this.makePickup(200, COIN_KEY, "1: scene events\nthis.events.emit(...)", () => this.addCoin());
    this.makePickup(400, GEM_KEY, "2: game events\nthis.game.events.emit(...)", () => this.addGem());
    this.makePickup(600, STAR_KEY, "3: the registry\nthis.registry.inc(...)", () => this.addStar());

    this.add.text(400, 500, "Click a pickup, or press 1, 2 or 3\nR restarts this scene    H restarts the HUD", {
      ...LABEL_STYLE,
      color: "#a8dadc",
    }).setOrigin(0.5);

    const keyboard = this.input.keyboard!;
    keyboard.on("keydown-ONE", () => this.addCoin());
    keyboard.on("keydown-TWO", () => this.addGem());
    keyboard.on("keydown-THREE", () => this.addStar());
    keyboard.once("keydown-R", () => this.scene.restart());
    keyboard.on("keydown-H", () => {
      this.scene.stop(HUD_SCENE);
      this.scene.launch(HUD_SCENE);
    });

    // Tell anyone listening what the counts are now. The FIRST time this scene starts, nobody hears
    // this: the HUD was only just launched, and a launched scene starts on the next frame. After R,
    // the HUD is already running and listening, so it hears the counts go back to 0.
    this.events.emit(COINS_CHANGED, this.coins);
    this.game.events.emit(GEMS_CHANGED, this.gems);
  }

  // the HUD may ask for the number of coins when it starts (it has a reference to this scene)
  public getCoins(): number {
    return this.coins;
  }

  // route 1: an event on this scene's own emitter - only code that can get hold of this scene hears it
  private addCoin(): void {
    this.coins = this.coins + 1;
    this.events.emit(COINS_CHANGED, this.coins);
  }

  // route 2: an event on the game's emitter - any scene can listen, with no reference to this one
  private addGem(): void {
    this.gems = this.gems + 1;
    this.game.events.emit(GEMS_CHANGED, this.gems);
  }

  // route 3: change the value in the registry; the registry sends "changedata-stars" by itself
  private addStar(): void {
    this.registry.inc(STARS, 1);
  }

  // a big clickable picture with a label under it
  private makePickup(x: number, key: string, label: string, onClick: () => void): void {
    const image = this.add.image(x, PICKUP_Y, key).setScale(PICKUP_SCALE);
    image.setInteractive({ useHandCursor: true });
    image.on("pointerdown", () => {
      onClick();
      // a quick "boing" so the click is felt; tweens are covered properly in Chapter 7
      this.tweens.add({ targets: image, scale: PICKUP_SCALE * 1.2, duration: 80, yoyo: true });
    });

    this.add.text(x, PICKUP_Y + 80, label, LABEL_STYLE).setOrigin(0.5);
  }
}
