// tiles.ts - the tileset picture, and what each of its tiles is
//
// simple_tiles.png is four 32 x 32 tiles in a row. A tile's INDEX is its place in the picture,
// counting from 0: the first tile is 0, the second is 1, and so on.

export const TILES_KEY = "tiles";
export const TILES_FILE = "assets/tilesets/simple_tiles.png";

export const TILE_SIZE = 32;

export const GRASS = 0;
export const WATER = 1;
export const WALL = 2;
export const SAND = 3;

// names for the tiles, so the scene can say what the player is standing on
export const TILE_NAMES = ["grass", "water", "wall", "sand"];
