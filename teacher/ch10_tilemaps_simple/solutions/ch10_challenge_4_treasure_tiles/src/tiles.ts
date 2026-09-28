// tiles.ts - the tileset picture, and the tiles this project uses from it
//
// dungeon_tiles.png is 8 x 2 tiles of 32 x 32. Indexes count left to right along the top row
// (0-7), then along the bottom row (8-15). See assets/README.md for all sixteen.

export const TILES_KEY = "dungeon";
export const TILES_FILE = "assets/tilesets/dungeon_tiles.png";

export const TILE_SIZE = 32;

export const FLOOR = 0;
export const FLOOR_CRACKED = 1;
export const FLOOR_MOSSY = 2;
export const WALL = 3;              // a brick wall
export const WALL_TORCH = 13;       // a brick wall with a torch on it
export const VOID = 15;             // solid black - deep inside the rock

// CHALLENGE 4: a treasure chest - a tile in the wall layer that the player collects by walking into
export const CHEST = 8;

// -1 is "no tile here" - an empty cell, which draws nothing
export const EMPTY = -1;
