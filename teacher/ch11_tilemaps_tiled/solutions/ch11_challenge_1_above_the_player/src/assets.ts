// assets.ts - the key and file of everything the game loads
//
// There is no list of maps here. Each door in Tiled names the map it leads to (its "target"
// property), and RoomScene loads that map when it is needed, from assets/maps/<target>.tmj.

export const MAPS_FOLDER = "assets/maps/";
export const MAP_EXTENSION = ".tmj";

// the tileset's picture, and the tileset's name inside the maps (as shown in Tiled's Tilesets panel)
export const TILES_KEY = "dungeon_tiles";
export const TILES_FILE = "assets/tilesets/dungeon_tiles.png";
export const TILESET_NAME = "dungeon_tiles";

// the layer names every room's map uses, spelled exactly as in Tiled
export const FLOOR_LAYER = "Floor";
export const WALLS_LAYER = "Walls";
export const OBJECTS_LAYER = "Objects";
// CHALLENGE 1 - a layer drawn over the player. Only some rooms have one.
export const ABOVE_LAYER = "Above";

export const HERO_KEY = "topdown_hero";
export const HERO_FILE = "assets/spritesheets/topdown_hero.png";

export const DOOR_SOUND = "door_sound";
export const DOOR_SOUND_FILE = "assets/audio/door.wav";
