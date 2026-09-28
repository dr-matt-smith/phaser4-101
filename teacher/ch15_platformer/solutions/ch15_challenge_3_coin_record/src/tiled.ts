import Phaser from "phaser";

// tiled.ts - reading a custom property from a Tiled object
//
// Tiled saves an object's custom properties as a list - [{ name, type, value }, ...] - and
// Phaser passes the list on as it is (its type is `any`). This looks one up by name, and gives
// back `fallback` if it is missing or is not a number, so a mistake in the map cannot crash
// the game.

interface TiledProperty {
  name: string;
  value: unknown;
}

export function getNumberProperty(object: Phaser.Types.Tilemaps.TiledObject, name: string, fallback: number): number {
  const properties: TiledProperty[] = object.properties ?? [];
  const found = properties.find((p) => p.name === name);
  return typeof found?.value === "number" ? found.value : fallback;
}
