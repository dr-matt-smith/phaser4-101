// make_levels.ts - writes this chapter's Tiled maps from the ASCII pictures below
//
//   deno run -A chapters/ch15_platformer/tools/make_levels.ts        (from the guide's root folder)
//
// Each level is drawn as text, one character per 32 x 32 tile, and turned into a Tiled map
// (.tmj - Tiled's JSON format) with the platform_tiles tileset EMBEDDED in it. Every map is
// written twice:
//
//   <project>/public/assets/maps/<name>.tmj   the map the game loads
//   <project>/tiled/<name>.tmj                the same map, to open and edit in Tiled
//
// The two differ only in the path to the tileset picture, which Tiled wants relative to the map.
// If you edit a map in Tiled, save it and copy it over the one in public/assets/maps/ (or run this
// script again, after changing the pictures below, to start afresh).
//
// The key to the pictures:
//
//   .  nothing                       tile layers
//   #  grass and dirt (Ground)       - the top of a run of # becomes grass, with edges; the rest dirt
//   B  brick (Ground)                S  stone (Ground)          X  crate (Ground)
//   ^  spikes (Hazards)              ~  lava (Hazards)          w  water (Hazards)
//   H  ladder (Ladders)
//   *  bush (Background)             i  sign (Background)
//
//                                    objects (the Objects layer), placed at the bottom centre of
//                                    their square - where the feet go
//   P  player start    c  coin    s  slime    v  bat    k  checkpoint    F  flag
//   =  a platform: a run of = is one rectangle object, a one-way platform. Give its first square
//      an entry in `movers` to make it move (moveX / moveY pixels, there and back, in duration ms)

import { dirname, fromFileUrl, join } from "jsr:@std/path@^1";

const CHAPTER = join(dirname(fromFileUrl(import.meta.url)), "..");
const TILE = 32;

// tile numbers in platform_tiles.png (see assets/README.md). Tiled numbers tiles from the
// tileset's firstgid (1), so a tile's number in the map data is its index + 1, and 0 is empty
const GRASS = 0, DIRT = 1, GRASS_LEFT = 2, GRASS_RIGHT = 3, BRICK = 4, STONE = 5, SPIKES = 6;
const LADDER = 7, WATER = 8, LAVA = 9, CRATE = 10, BUSH = 14, SIGN = 15;

const GROUND_CHARS = "#BSX";
const TILE_CHARS: Record<string, { layer: string; tile: number }> = {
  "B": { layer: "Ground", tile: BRICK },
  "S": { layer: "Ground", tile: STONE },
  "X": { layer: "Ground", tile: CRATE },
  "^": { layer: "Hazards", tile: SPIKES },
  "~": { layer: "Hazards", tile: LAVA },
  "w": { layer: "Hazards", tile: WATER },
  "H": { layer: "Ladders", tile: LADDER },
  "*": { layer: "Background", tile: BUSH },
  "i": { layer: "Background", tile: SIGN },
};
const OBJECT_CHARS: Record<string, string> = {
  "P": "player",
  "c": "coin",
  "s": "slime",
  "v": "bat",
  "k": "checkpoint",
  "F": "flag",
};

// the custom properties on the tileset's tiles - the game asks for tiles by property, not number
const TILE_PROPERTIES: [number[], string][] = [
  [[GRASS, DIRT, GRASS_LEFT, GRASS_RIGHT, BRICK, STONE, CRATE], "collides"],
  [[SPIKES, LAVA, WATER], "hazard"],
  [[LADDER], "ladder"],
];

interface Mover {
  moveX: number;
  moveY: number;
  duration: number;
}

interface Level {
  project: string;
  name: string;
  layers: string[]; // the tile layers to write, bottom to top
  rows: string[];
  movers: Record<string, Mover>; // "column,row" of a platform's first square
}

// ---------------------------------------------------------------------------------------------
// The levels
// ---------------------------------------------------------------------------------------------

const INTERMEDIATE = "projects/ch15_platformer_intermediate";
const ADVANCED = "projects/ch15_platformer_advanced";
const WITH_LADDERS = ["Background", "Ground", "Hazards", "Ladders"];

const LEVELS: Level[] = [
  {
    project: INTERMEDIATE,
    name: "level",
    layers: ["Background", "Ground", "Hazards"],
    movers: {},
    rows: [
      "................................................................................",
      "................................................................................",
      "................................................................................",
      "................................................................................",
      "................................................................................",
      "................................................................................",
      "................................................................................",
      "................................................................................",
      "................................................................................",
      ".......................................cccc.....................................",
      ".......................................####.....................................",
      "...................................................................cc...........",
      "...........cccc.....cc...........*.s..........cc.s...........cc.................",
      "...........####................########.......######...............SSS..........",
      "...............................########...........................SSSS..........",
      "..P...*..i..........^^..X..scc.########.....*.....cc.s.......^^..SSSSS...s..F.*.",
      "################..#####################....#############..######################",
      "################..#####################~~~~#############..######################",
      "################..#####################~~~~#############..######################",
      "################..######################################..######################",
    ],
  },
  {
    project: ADVANCED,
    name: "level1",
    layers: WITH_LADDERS,
    movers: {
      "15,13": { moveX: 128, moveY: 0, duration: 2400 },
      "58,14": { moveX: 0, moveY: -128, duration: 2000 },
    },
    rows: [
      "....................................................................................................",
      "....................................................................................................",
      "....................................................................................................",
      "....................................................................................................",
      "....................................................................................................",
      "....................................................................................................",
      "....................................................................................................",
      "............................v.......................................................................",
      "................................cc...cc.......................................v.....................",
      "................................BBBHBBB...................ccc.......................................",
      ".................cccc..............H................................................................",
      "...................................H...........cccc.................................................",
      "...................................H..........======......................cccc......................",
      "...............===.................H......................................####......................",
      "...................................H......................===...................XX..................",
      "..P..*...cc...............*..s.....H.......k....^^...s................s.........XX....s...*....F....",
      "###############........#################################........####################################",
      "###############........#################################........####################################",
      "###############........#################################........####################################",
      "###############wwwwwwww#################################wwwwwwww####################################",
    ],
  },
  {
    project: ADVANCED,
    name: "level2",
    layers: WITH_LADDERS,
    movers: {
      "33,10": { moveX: 0, moveY: -128, duration: 2200 },
    },
    rows: [
      "S................................................S",
      "S................................................S",
      "S...................................v............S",
      "S................................................S",
      "S.......................................ccc...F..S",
      "S....................................BBBBBBBBBBBBS",
      "S................................................S",
      "S................................................S",
      "S...................k...cccs.....................S",
      "S.......BBBBBHBBBBBBBBBBBBBBBBB..................S",
      "S............H...................===.............S",
      "S............H...................................S",
      "S...v........H...................................S",
      "S............H...................................S",
      "S............H...................................S",
      "S............H...................................S",
      "S.cc..s...^^.H...................................S",
      "SBBBBBBBBBBBBBB..................................S",
      "S................................................S",
      "S................cc..............................S",
      "S...............====.............................S",
      "S.......................................v........S",
      "S................................................S",
      "S.......................====.....................S",
      "S................................................S",
      "S.....................................ccc...s....S",
      "S.............................BBHBBBBBBBBBBBBBBBBS",
      "S...............................H................S",
      "S...............................H................S",
      "S...............................H................S",
      "S...............................H................S",
      "S..P....ccc...^^....s.....k.....H................S",
      "SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS",
      "SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS",
    ],
  },
  {
    project: ADVANCED,
    name: "level3",
    layers: WITH_LADDERS,
    movers: {
      "13,13": { moveX: 128, moveY: 0, duration: 2400 },
      "37,14": { moveX: 0, moveY: -128, duration: 2000 },
      "60,13": { moveX: 96, moveY: 0, duration: 2000 },
    },
    rows: [
      "..............................................................................................................",
      "..............................................................................................................",
      "..............................................................................................................",
      "..............................................................................................................",
      "..............................................................................................................",
      "..............................................................................................................",
      "................................................................v.............................................",
      "...............................................................................................v..............",
      "........................v.........................ccc...........cc............................................",
      ".....................................cc..........HSSS.........................................................",
      "...............ccc...............................HSSS.....................................ccc.................",
      "...........................ccc...................HSSS.............===.....................###.................",
      "...........................===...................HSSS.........................................................",
      ".............===.................................HSSS.......===.......................###.....................",
      ".....................................==..........HSSS.........................................................",
      "..P....cc.................s....^^..........k.....HSSS...s...............k....^^^....s..............s.X....F...",
      "BBBBBBBBBBBB........BBBBBBBBBBBBBBB......BBBBBBBBBBBBBBBBBB..........BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
      "BBBBBBBBBBBB~~~~~~~~BBBBBBBBBBBBBBB~~~~~~BBBBBBBBBBBBBBBBBB~~~~~~~~~~BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
      "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
      "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
    ],
  },
];

// ---------------------------------------------------------------------------------------------
// ASCII -> Tiled JSON
// ---------------------------------------------------------------------------------------------

function isGround(rows: string[], col: number, row: number): boolean {
  return row >= 0 && row < rows.length && GROUND_CHARS.includes(rows[row][col] ?? ".");
}

// which tile a # becomes: grass on top (with a left or right edge at the ends of a run), dirt below
function grassOrDirt(rows: string[], col: number, row: number): number {
  // under more ground, or under lava or water, it is dirt
  if (isGround(rows, col, row - 1) || "~w".includes(rows[row - 1]?.[col] ?? ".")) {
    return DIRT;
  }
  const left = isGround(rows, col - 1, row) || col === 0;
  const right = isGround(rows, col + 1, row) || col === rows[row].length - 1;
  if (!left && right) {
    return GRASS_LEFT;
  }
  if (left && !right) {
    return GRASS_RIGHT;
  }
  return GRASS;
}

function makeMap(level: Level, tilesetImage: string): Record<string, unknown> {
  const height = level.rows.length;
  const width = level.rows[0].length;
  level.rows.forEach((r, i) => {
    if (r.length !== width) throw new Error(`${level.name}: row ${i} is ${r.length} long, not ${width}`);
  });

  const data: Record<string, number[]> = {};
  for (const name of level.layers) {
    data[name] = new Array(width * height).fill(0);
  }
  const objects: Record<string, unknown>[] = [];
  let nextId = 1;

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const ch = level.rows[row][col];
      const at = row * width + col;
      if (ch === "#") {
        data["Ground"][at] = grassOrDirt(level.rows, col, row) + 1;
      } else if (TILE_CHARS[ch]) {
        const { layer, tile } = TILE_CHARS[ch];
        if (!data[layer]) throw new Error(`${level.name}: "${ch}" needs a ${layer} layer`);
        data[layer][at] = tile + 1;
      } else if (OBJECT_CHARS[ch]) {
        const type = OBJECT_CHARS[ch];
        objects.push({
          id: nextId++,
          name: type,
          type: type,
          x: col * TILE + TILE / 2,
          y: (row + 1) * TILE,
          width: 0,
          height: 0,
          rotation: 0,
          visible: true,
          point: true,
        });
      } else if (ch === "=" && level.rows[row][col - 1] !== "=") {
        // the start of a run of = : one rectangle, as wide as the run
        let length = 1;
        while (level.rows[row][col + length] === "=") length++;
        const mover = level.movers[`${col},${row}`] ?? { moveX: 0, moveY: 0, duration: 0 };
        objects.push({
          id: nextId++,
          name: "platform",
          type: "platform",
          x: col * TILE,
          y: row * TILE,
          width: length * TILE,
          height: TILE,
          rotation: 0,
          visible: true,
          properties: [
            { name: "duration", type: "int", value: mover.duration },
            { name: "moveX", type: "int", value: mover.moveX },
            { name: "moveY", type: "int", value: mover.moveY },
          ],
        });
      } else if (ch !== "." && ch !== "=") {
        throw new Error(`${level.name}: unknown character "${ch}" at column ${col}, row ${row}`);
      }
    }
  }

  const layers: Record<string, unknown>[] = level.layers.map((name, i) => ({
    id: i + 1,
    name,
    type: "tilelayer",
    x: 0,
    y: 0,
    width,
    height,
    opacity: 1,
    visible: true,
    data: data[name],
  }));
  layers.push({
    id: level.layers.length + 1,
    name: "Objects",
    type: "objectgroup",
    x: 0,
    y: 0,
    opacity: 1,
    visible: true,
    draworder: "topdown",
    objects,
  });

  const tiles = [];
  for (const [indexes, property] of TILE_PROPERTIES) {
    for (const id of indexes) {
      tiles.push({ id, properties: [{ name: property, type: "bool", value: true }] });
    }
  }
  tiles.sort((a, b) => a.id - b.id);

  return {
    compressionlevel: -1,
    type: "map",
    version: "1.10",
    tiledversion: "1.10.2",
    orientation: "orthogonal",
    renderorder: "right-down",
    infinite: false,
    width,
    height,
    tilewidth: TILE,
    tileheight: TILE,
    nextlayerid: layers.length + 1,
    nextobjectid: nextId,
    layers,
    tilesets: [{
      firstgid: 1,
      name: "platform_tiles",
      image: tilesetImage,
      imagewidth: 256,
      imageheight: 64,
      tilewidth: TILE,
      tileheight: TILE,
      tilecount: 16,
      columns: 8,
      margin: 0,
      spacing: 0,
      tiles,
    }],
  };
}

// JSON with each layer's data written one map row per line, so the file is readable
function toJson(map: Record<string, unknown>, width: number): string {
  const text = JSON.stringify(map, null, 1);
  return text.replace(/"data": \[([\d,\s]+)\]/g, (_all, numbers: string) => {
    const values = numbers.split(",").map((n) => n.trim());
    const lines = [];
    for (let i = 0; i < values.length; i += width) {
      lines.push("    " + values.slice(i, i + width).join(","));
    }
    return `"data": [\n${lines.join(",\n")}\n   ]`;
  }) + "\n";
}

for (const level of LEVELS) {
  const targets: [string, string][] = [
    [join(CHAPTER, level.project, "public/assets/maps"), "../tilesets/platform_tiles.png"],
    [join(CHAPTER, level.project, "tiled"), "../public/assets/tilesets/platform_tiles.png"],
  ];
  for (const [folder, image] of targets) {
    await Deno.mkdir(folder, { recursive: true });
    const file = join(folder, `${level.name}.tmj`);
    await Deno.writeTextFile(file, toJson(makeMap(level, image), level.rows[0].length));
    console.log("wrote", file.slice(CHAPTER.length + 1));
  }
}
