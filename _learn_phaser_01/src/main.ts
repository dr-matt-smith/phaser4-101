import Phaser from 'phaser';

const SPEED = 300; // pixels per second

class MainScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;

  constructor() {
    super('MainScene');
  }

  create() {
    const { width, height } = this.scale;

    // Small yellow rectangle near the bottom centre: x, y, width, height, colour
    this.player = this.add.rectangle(width / 2, height - 40, 60, 16, 0xffff00);

    // Arrow keys + A/D
    const keyboard = this.input.keyboard!;
    this.cursors = keyboard.createCursorKeys();
    this.keyA = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  }

  update(_time: number, delta: number) {
    let direction = 0;
    if (this.cursors.left.isDown || this.keyA.isDown) direction -= 1;
    if (this.cursors.right.isDown || this.keyD.isDown) direction += 1;

    // delta is in milliseconds, so movement speed is frame-rate independent
    const halfWidth = this.player.width / 2;
    this.player.x = Phaser.Math.Clamp(
      this.player.x + direction * SPEED * (delta / 1000),
      halfWidth,
      this.scale.width - halfWidth
    );
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  parent: 'game-container',
  scene: [MainScene],
});