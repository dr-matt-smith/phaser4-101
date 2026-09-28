import Phaser from "phaser";
import { getTiledProperty } from "../tiled.ts";

// Door - an invisible rectangle that takes the player to another room
//
// It is made from a rectangle object called "door" in a Tiled map, and remembers two of the object's
// custom properties:
//   target   - the map the door leads to ("cellar" means assets/maps/cellar.tmj)
//   entrance - the name of the point object in THAT map where the player appears

export class Door extends Phaser.GameObjects.Zone {
  public readonly target: string;
  public readonly entrance: string;

  constructor(scene: Phaser.Scene, obj: Phaser.Types.Tilemaps.TiledObject) {
    const x = obj.x ?? 0;
    const y = obj.y ?? 0;
    const width = obj.width ?? 32;
    const height = obj.height ?? 32;

    // Tiled measures a rectangle from its top-left corner; a Zone is placed by its centre
    super(scene, x + width / 2, y + height / 2, width, height);

    this.target = getTiledProperty(obj.properties, "target", "");
    this.entrance = getTiledProperty(obj.properties, "entrance", "");

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // true = a static body: doors do not move
  }

  // a door with no target in Tiled goes nowhere (yet)
  public isOpen(): boolean {
    return this.target !== "";
  }
}
