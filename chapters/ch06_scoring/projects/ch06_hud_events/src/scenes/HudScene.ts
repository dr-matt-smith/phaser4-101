import Phaser from "phaser";
import { COIN_KEY, GEM_KEY, STAR_KEY } from "../assets.ts";
import { COINS_CHANGED, GEMS_CHANGED, STARS } from "../events.ts";
import type { GameScene } from "./GameScene.ts";
import { GAME_SCENE, HUD_SCENE } from "./keys.ts";

// HudScene - the heads-up display: a bar across the top showing three counts
//
// It runs AT THE SAME TIME as the game scene, drawn on top of it. It never asks the game scene for
// its numbers every frame; it LISTENS for events, and changes its text only when told something
// changed. Each count arrives by a different route - see GameScene.
//
// Under each count it shows how many listeners that event has, so you can see that restarting the
// HUD (H) cleans up after itself: the number stays at 1.

const BAR_HEIGHT = 90;
const COUNT_STYLE = { fontFamily: "Arial", fontSize: "26px", color: "#ffffff" };
const SMALL_STYLE = { fontFamily: "Arial", fontSize: "15px", color: "#9aa4bd" };

export class HudScene extends Phaser.Scene {
  // "!" - these are set in create(), not in the constructor; the "!" tells TypeScript that is fine
  private coinsText!: Phaser.GameObjects.Text;
  private gemsText!: Phaser.GameObjects.Text;
  private starsText!: Phaser.GameObjects.Text;
  private coinListenersText!: Phaser.GameObjects.Text;
  private gemListenersText!: Phaser.GameObjects.Text;
  private starListenersText!: Phaser.GameObjects.Text;
  private gameScene!: GameScene;

  constructor() {
    super(HUD_SCENE);
  }

  create(): void {
    this.add.rectangle(0, 0, this.scale.width, BAR_HEIGHT, 0x000000, 0.5).setOrigin(0);

    this.add.image(90, 30, COIN_KEY);
    this.coinsText = this.add.text(115, 30, "", COUNT_STYLE).setOrigin(0, 0.5);
    this.add.image(340, 30, GEM_KEY);
    this.gemsText = this.add.text(365, 30, "", COUNT_STYLE).setOrigin(0, 0.5);
    this.add.image(590, 30, STAR_KEY);
    this.starsText = this.add.text(615, 30, "", COUNT_STYLE).setOrigin(0, 0.5);
    this.coinListenersText = this.add.text(75, 62, "", SMALL_STYLE);
    this.gemListenersText = this.add.text(325, 62, "", SMALL_STYLE);
    this.starListenersText = this.add.text(575, 62, "", SMALL_STYLE);

    // ROUTE 1 - the game scene's own emitter. To listen, the HUD needs the game scene itself.
    // get<GameScene> says which class of scene comes back (Phaser only knows it is "a Scene").
    this.gameScene = this.scene.get<GameScene>(GAME_SCENE);
    this.gameScene.events.on(COINS_CHANGED, this.showCoins, this);

    // ROUTE 2 - the game's emitter, shared by every scene. No reference to the game scene needed.
    this.game.events.on(GEMS_CHANGED, this.showGems, this);

    // ROUTE 3 - the registry sends "changedata-<key>" whenever a key it already has changes
    this.registry.events.on(`changedata-${STARS}`, this.onStarsChanged, this);

    // Events are NEWS: they say something changed, but only to whoever was listening at the time.
    // So a HUD that starts late has to find out the current values some other way:
    this.showCoins(this.gameScene.getCoins());   // route 1: ask the game scene
    this.gemsText.setText("Gems: ?");            // route 2: no way to ask - wait for the next event
    this.showStars(this.registry.get(STARS));    // route 3: the registry holds the value itself

    // These three emitters all outlive this scene. Stopping or restarting the HUD does NOT remove
    // listeners it added to them - so it must remove them itself, when it shuts down. (Chapter 4)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.gameScene.events.off(COINS_CHANGED, this.showCoins, this);
      this.game.events.off(GEMS_CHANGED, this.showGems, this);
      this.registry.events.off(`changedata-${STARS}`, this.onStarsChanged, this);
    });
  }

  override update(): void {
    // listenerCount(event) - how many functions are listening for that event on that emitter
    this.coinListenersText.setText(`listeners: ${this.gameScene.events.listenerCount(COINS_CHANGED)}`);
    this.gemListenersText.setText(`listeners: ${this.game.events.listenerCount(GEMS_CHANGED)}`);
    this.starListenersText.setText(`listeners: ${this.registry.events.listenerCount(`changedata-${STARS}`)}`);
  }

  private showCoins(coins: number): void {
    this.coinsText.setText(`Coins: ${coins}`);
  }

  private showGems(gems: number): void {
    this.gemsText.setText(`Gems: ${gems}`);
  }

  private showStars(stars: number): void {
    this.starsText.setText(`Stars: ${stars}`);
  }

  // the registry passes (the game, the new value, the old value) with every changedata event
  private onStarsChanged(_game: Phaser.Game, stars: number, _previous: number): void {
    this.showStars(stars);
  }
}
