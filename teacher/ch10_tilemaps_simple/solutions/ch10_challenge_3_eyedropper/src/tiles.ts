// tiles.ts - the tileset picture, and what each of its tiles is
//
// simple_tiles.png is four 32 x 32 tiles in a row: 0 grass, 1 water, 2 wall, 3 sand.
// The same tiles, and the same numbers, as ch10_array_map - so a map painted here can be pasted
// into that project's level.ts.

export const TILES_KEY = "tiles";
export const TILES_FILE = "assets/tilesets/simple_tiles.png";

// the same file again, loaded as a sprite sheet, so the palette can show one tile as an Image
export const TILE_FRAMES_KEY = "tile-frames";

export const TILE_SIZE = 32;

export const GRASS = 0;
export const TILE_COUNT = 4;

// -1 is "no tile here" - an empty cell, which draws nothing
export const EMPTY = -1;

export const TILE_NAMES = ["grass", "water", "wall", "sand"];
