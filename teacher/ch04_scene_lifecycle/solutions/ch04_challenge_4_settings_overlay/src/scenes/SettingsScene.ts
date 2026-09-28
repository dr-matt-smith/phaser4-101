import Phaser from "phaser";
import { PANEL_KEY } from "../assets.ts";
import { HUD_SCENE, PAUSE_SCENE, SETTINGS_SCENE, SHOW_HUD } from "./keys.ts";

// CHALLENGE 4: SettingsScene - opened from the pause menu, which sleeps while this is showing
//
// Settings are kept in the registry, so they outlast this scene, the game scene and the HUD.

export class SettingsScene extends Phaser.Scene {
  private hudText!: Phaser.GameObjects.Text;

  constructor() {
    super(SETTINGS_SCENE);
  }

  create(): void {
    this.scene.bringToTop();

    const centreX = this.scale.width / 2;
    const centreY = this.scale.height / 2;
    const style = { fontFamily: "Arial", fontSize: "26px", color: "#ffffff", align: "center" };

    // the paused game still shows through - the pause menu, asleep, does not
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.5).setOrigin(0, 0);
    this.add.image(centreX, centreY, PANEL_KEY);
    this.add.text(centreX, centreY - 95, "Settings", { ...style, fontSize: "48px", fontStyle: "bold", color: "#ffd166" })
      .setOrigin(0.5);
    this.hudText = this.add.text(centreX, centreY - 10, "", style).setOrigin(0.5);
    this.add.text(centreX, centreY + 80, "S or ESC - back", { ...style, fontSize: "22px", color: "#a8dadc" })
      .setOrigin(0.5);
    this.showSettings();

    const keyboard = this.input.keyboard!;
    keyboard.on("keydown-H", () => {
      const show = this.registry.get(SHOW_HUD) === false;     // it was hidden: show it
      this.registry.set(SHOW_HUD, show);
      this.scene.setVisible(show, HUD_SCENE);                  // takes effect straight away
      this.showSettings();
    });
    keyboard.once("keydown-S", () => {
      this.back();
    });
    keyboard.once("keydown-ESC", () => {
      this.back();
    });
  }

  private showSettings(): void {
    const show = this.registry.get(SHOW_HUD) !== false;
    this.hudText.setText(`H - show the HUD: ${show ? "ON" : "OFF"}`);
  }

  // wake the pause menu, and take this scene away
  private back(): void {
    this.scene.wake(PAUSE_SCENE);
    this.scene.stop();
  }
}
