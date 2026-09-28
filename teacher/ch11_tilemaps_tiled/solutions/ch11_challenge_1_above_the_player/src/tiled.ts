// tiled.ts - reading the custom properties Tiled saves with objects and maps
//
// Tiled saves custom properties as a LIST, one entry per property:
//
//   "properties": [ { "name": "speed", "type": "float", "value": 60 } ]
//
// Phaser turns the properties of TILES into a plain object for you (tile.properties.collides), but
// leaves the properties of OBJECTS and of the MAP just as Tiled wrote them. This function finds one
// by name.

export interface TiledProperty {
  name: string;
  type: string;
  value: unknown;
}

// Returns the value of the property called `name`, or `fallback` if there is no such property - or
// if it is the wrong kind of value (a string where a number was expected, say). The fallback says
// what kind of value is wanted, so `getTiledProperty(obj.properties, "speed", 60)` is a number.
export function getTiledProperty<T>(
  properties: unknown,
  name: string,
  fallback: T,
): T {
  if (!Array.isArray(properties)) {
    return fallback;
  }
  const found = (properties as TiledProperty[]).find((property) => property.name === name);
  if (found === undefined || typeof found.value !== typeof fallback) {
    return fallback;
  }
  // safe: the line above checked that the value is the same kind (string/number/boolean) as T
  return found.value as T;
}
