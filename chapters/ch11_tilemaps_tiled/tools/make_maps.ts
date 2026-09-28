// Writes the Tiled maps used by Chapter 11's projects.
//
//   deno run -A chapters/ch11_tilemaps_tiled/tools/make_maps.ts      (from the guide's root folder)
//
// Tiled is the right tool for making maps - but the maps in a book have to be exactly what the text
// describes, and exactly the same every time, so these were written by this script instead. Every
// map is written twice, just as it would be if you made it in Tiled yourself:
//
//   <project>/tiled/<name>.tmx                    the map's SOURCE, in Tiled's own XML format - open
//                                                 this in Tiled to change the map
//   <project>/public/assets/maps/<name>.tmj       the map EXPORTED as JSON (File > Export As) - the
//                                                 file the game loads
//
// Both open in Tiled (1.10 or later). The tileset is embedded in the map, and its image path is
// relative to the map file, as Tiled writes it. Tile layers are drawn below as rows of characters;
// each layer's legend says which tile each character is.
//
// The functions are exported, so the teacher's solutions can build changed copies of these maps.

import { dirname, fromFileUrl, join, relative } from "jsr:@std/path@^1";

// ---------------------------------------------------------------------------------------------
// What a map is made of
// ---------------------------------------------------------------------------------------------

export interface Property {
  name: string;
  type: "bool" | "int" | "float" | "string";
  value: boolean | number | string;
}

export interface AnimationFrame {
  tileid: number;
  duration: number;
}

export interface TileSpec {
  id: number; // the tile's index in its tileset, from 0
  properties?: Property[];
  animation?: AnimationFrame[];
}

export interface TilesetSpec {
  name: string; // the name Tiled shows - and the first argument to addTilesetImage in Phaser
  image: string; // path inside the project's public/assets/, e.g. "tilesets/platform_tiles.png"
  imageWidth: number;
  imageHeight: number;
  columns: number;
  tileCount: number;
  firstgid: number;
  tiles: TileSpec[];
}

export interface TileLayerSpec {
  kind: "tiles";
  name: string;
  rows: string[]; // one string per row of tiles, one character per tile
  legend: Record<string, number>; // character -> GID (0 = no tile)
}

export interface ObjectSpec {
  name: string;
  x: number;
  y: number;
  width?: number; // rectangles only
  height?: number;
  point?: boolean;
  polyline?: { x: number; y: number }[]; // points relative to (x, y)
  properties?: Property[];
}

export interface ObjectLayerSpec {
  kind: "objects";
  name: string;
  objects: ObjectSpec[];
}

export interface MapSpec {
  file: string; // "level1" -> tiled/level1.tmx and public/assets/maps/level1.tmj
  width: number; // in tiles
  height: number;
  tileSize: number;
  tilesets: TilesetSpec[];
  layers: (TileLayerSpec | ObjectLayerSpec)[];
  properties?: Property[];
}

const TILED_VERSION = "1.10.2";
const FORMAT_VERSION = "1.10";

// ---------------------------------------------------------------------------------------------
// Small helpers for writing maps
// ---------------------------------------------------------------------------------------------

export const bool = (name: string, value: boolean): Property => ({ name, type: "bool", value });
export const int = (name: string, value: number): Property => ({ name, type: "int", value });
export const float = (name: string, value: number): Property => ({ name, type: "float", value });
export const str = (name: string, value: string): Property => ({ name, type: "string", value });

// the centre of a tile, in pixels - handy for placing point objects
export const centre = (column: number, row: number, size = 32): { x: number; y: number } => ({
  x: column * size + size / 2,
  y: row * size + size / 2,
});

export function point(name: string, column: number, row: number, properties?: Property[]): ObjectSpec {
  return { name, ...centre(column, row), point: true, properties };
}

export function rect(
  name: string,
  column: number,
  row: number,
  columns: number,
  rows: number,
  properties?: Property[],
): ObjectSpec {
  return { name, x: column * 32, y: row * 32, width: columns * 32, height: rows * 32, properties };
}

// ---------------------------------------------------------------------------------------------
// The tilesets
// ---------------------------------------------------------------------------------------------

// platform_tiles.png: 8 x 2 tiles of 32 x 32
//   0 grass top  1 dirt  2 grass left  3 grass right  4 brick  5 stone  6 spikes  7 ladder
//   8 water      9 lava 10 crate      11 door top    12 door  13 flag  14 bush   15 sign
export function platformTileset(): TilesetSpec {
  const solid = [0, 1, 2, 3, 4, 5, 10];
  const hazard = [6, 8, 9];
  const tiles: TileSpec[] = [];
  for (let id = 0; id < 16; id++) {
    if (solid.includes(id)) tiles.push({ id, properties: [bool("collides", true)] });
    if (hazard.includes(id)) tiles.push({ id, properties: [bool("hazard", true)] });
  }
  return {
    name: "platform_tiles",
    image: "tilesets/platform_tiles.png",
    imageWidth: 256,
    imageHeight: 64,
    columns: 8,
    tileCount: 16,
    firstgid: 1,
    tiles,
  };
}

// dungeon_tiles.png: 8 x 2 tiles of 32 x 32
//   0 floor  1 floor, cracked  2 floor, mossy  3 wall  4 wall top  5 door closed  6 door open  7 stairs
//   8 chest  9 spikes         10 water        11 pillar 12 rubble  13 torch wall  14 carpet    15 void
export function dungeonTileset(): TilesetSpec {
  const solid = [3, 4, 5, 8, 10, 11, 13, 15];
  return {
    name: "dungeon_tiles",
    image: "tilesets/dungeon_tiles.png",
    imageWidth: 256,
    imageHeight: 64,
    columns: 8,
    tileCount: 16,
    firstgid: 1,
    tiles: solid.map((id) => ({ id, properties: [bool("collides", true)] })),
  };
}

// ---------------------------------------------------------------------------------------------
// ch11_tiled_level: level1 - a side-on platform level, 64 x 20 tiles
// ---------------------------------------------------------------------------------------------

// GID = tile index + firstgid (1). 0 means "no tile here".
export const PLATFORM_LEGEND: Record<string, number> = {
  ".": 0,
  "=": 1, // grass top
  "#": 2, // dirt
  "<": 3, // grass, left edge
  ">": 4, // grass, right edge
  "B": 5, // brick
  "S": 6, // stone
  "^": 7, // spikes
  "H": 8, // ladder
  "~": 9, // water
  "L": 10, // lava
  "C": 11, // crate
  "d": 12, // door top
  "D": 13, // door
  "f": 14, // flag
  "b": 15, // bush
  "s": 16, // sign
};

export function level1(): MapSpec {
  //            0         1         2         3         4         5         6
  //            0123456789012345678901234567890123456789012345678901234567890123
  const background = [
    "................................................................", // 0
    "................................................................", // 1
    "................................................................", // 2
    "................................................................", // 3
    "................................................................", // 4
    "................................................................", // 5
    "................................................................", // 6
    "................................................................", // 7
    "................................................................", // 8
    "................................................................", // 9
    "................................................................", // 10
    "................................................................", // 11
    "................................................................", // 12
    "................................................................", // 13
    "................................................................", // 14
    "................................................................", // 15
    "..b.s....b.......b............b.......b.......b......b......f...", // 16
    "................................................................", // 17
    "................................................................", // 18
    "................................................................", // 19
  ];
  //            0         1         2         3         4         5         6
  //            0123456789012345678901234567890123456789012345678901234567890123
  const ground = [
    "................................................................", // 0
    "................................................................", // 1
    "................................................................", // 2
    "................................................................", // 3
    "................................................................", // 4
    "................................................................", // 5
    "................................................................", // 6
    "................................................................", // 7
    "................................................................", // 8
    "......................................................BBBBB.....", // 9
    "................................................................", // 10
    ".........<==>...................................................", // 11
    "..............................SSS..............<==>.............", // 12
    "................................................................", // 13
    ".....<==>.........<==>....................<=>...................", // 14
    "..................................BB.............C..............", // 15
    "....................^^............BB.............CC.............", // 16
    "===========>...<========>...<===========>.....<=================", // 17
    "############~~~##########LLL#############~~~~~##################", // 18
    "############~~~##########LLL#############~~~~~##################", // 19
  ];

  const coins: [number, number][] = [
    [6, 13], [7, 13], [10, 10], [11, 10], [13, 15], [19, 13], [20, 13], [26, 15],
    [31, 11], [43, 13], [48, 11], [49, 11], [55, 8], [56, 8], [57, 8], [58, 8],
  ];

  return {
    file: "level1",
    width: 64,
    height: 20,
    tileSize: 32,
    tilesets: [platformTileset()],
    properties: [str("name", "Green Hills")],
    layers: [
      { kind: "tiles", name: "Background", rows: background, legend: PLATFORM_LEGEND },
      { kind: "tiles", name: "Ground", rows: ground, legend: PLATFORM_LEGEND },
      {
        kind: "objects",
        name: "Objects",
        objects: [
          { name: "player", x: 64, y: 520, point: true },
          ...coins.map(([column, row]) => point("coin", column, row)),
          point("enemy", 38, 16, [float("speed", 60)]),
          point("enemy", 56, 16, [float("speed", 100)]),
          rect("goal", 61, 15, 1, 2),
        ],
      },
    ],
  };
}

// ---------------------------------------------------------------------------------------------
// ch11_tiled_doors: two top-down rooms joined by doors
// ---------------------------------------------------------------------------------------------

export const DUNGEON_LEGEND: Record<string, number> = {
  ".": 0,
  ",": 1, // floor
  ";": 2, // floor, cracked
  ":": 3, // floor, mossy
  "W": 4, // wall
  "T": 5, // wall top
  "D": 6, // door, closed
  "O": 7, // door, open
  "S": 8, // stairs down
  "C": 9, // chest
  "^": 10, // spikes
  "~": 11, // water
  "P": 12, // pillar
  "r": 13, // rubble
  "F": 14, // wall with a torch
  "=": 15, // carpet
  "V": 16, // void
};

export function hall(): MapSpec {
  //       0         1         2
  //       0123456789012345678901234
  const floor = [
    ",,,,,,,,,,,,,,,,,,,,,,,,,", // 0
    ",,,,,,,,,,,,,,,,,,,,,,,,,", // 1
    ",,,,,,,,,,,,=,,,,,,,,,,,,", // 2
    ",,,;,,,,,,,,=,,,,,,,,:,,,", // 3
    ",,,,,,,,,,,,=,,,,,,,,,,,,", // 4
    ",,,,,,,,,,,,=,,,,,;,,,,,,", // 5
    ",,,,,,,,:,,,=,,,,,,,,,,,,", // 6
    ",,,,,,,,,,,,=,,,,,,,,,,,,", // 7
    ",,,,,,,,,,,,=,,,,,,,,,,,,", // 8
    ",,,,,,,,,,,,=,,,,,,,,,,,,", // 9
    ",,,,,,,,,,,,=,,,,,,,,,;,,", // 10
    ",,,,,,,,,,,,=,,,,,,,,,,,,", // 11
    ",,,,;,,,,,,,=,,,,,,,,,,,,", // 12
    ",,,,S,,,,,,,=,,,,,,,,,,,,", // 13
    ",,,,,,,,,,,,=,,,,:,,,,,,,", // 14
    ",,,,,,,,,,,,,,,,,,,,,,,,,", // 15
    ",,,,,,,,,,,,,,,,,,,,,,,,,", // 16
  ];
  //       0         1         2
  //       0123456789012345678901234
  const walls = [
    "TTTTTTTTTTTTTTTTTTTTTTTTT", // 0
    "TWWFWWWWWWWWDWWWWWWWFWWWT", // 1
    "TC......................T", // 2
    "T.......................T", // 3
    "T.......................T", // 4
    "T....P.............P....T", // 5
    "T.......................T", // 6
    "T.......................T", // 7
    "T.......................T", // 8
    "T.......................T", // 9
    "T.......................T", // 10
    "T....P.............P....T", // 11
    "T.......................T", // 12
    "T...................~~~.T", // 13
    "T...................~~~CT", // 14
    "T.......................T", // 15
    "TTTTTTTTTTTTTTTTTTTTTTTTT", // 16
  ];
  return {
    file: "hall",
    width: 25,
    height: 17,
    tileSize: 32,
    tilesets: [dungeonTileset()],
    properties: [str("name", "The Great Hall")],
    layers: [
      { kind: "tiles", name: "Floor", rows: floor, legend: DUNGEON_LEGEND },
      { kind: "tiles", name: "Walls", rows: walls, legend: DUNGEON_LEGEND },
      {
        kind: "objects",
        name: "Objects",
        objects: [
          point("start", 12, 10),
          point("from_cellar", 6, 13),
          rect("door", 4, 13, 1, 1, [str("target", "cellar"), str("entrance", "from_hall")]),
        ],
      },
    ],
  };
}

export function cellar(): MapSpec {
  //       0         1
  //       012345678901234
  const floor = [
    ":::::::::::::::", // 0
    ":::::::::::::::", // 1
    ",,:,,,,,,,,;,,,", // 2
    ",,,,,,,,,,,,,,,", // 3
    ",r,,,;,,,,:,,,,", // 4
    ",,,,,,,,,,,,,r,", // 5
    ",,:,,,,,,,,,,,,", // 6
    ",,,,,,,r,,,,;,,", // 7
    ",,,;,,,,,,,,,,,", // 8
    ",,,,,,,,,,:,,,,", // 9
    ":::::::::::::::", // 10
  ];
  //       0         1
  //       012345678901234
  const walls = [
    "TTTTTTTTTTTTTTT", // 0
    "TWWFWWWOWWWFWWT", // 1
    "T.............T", // 2
    "T.............T", // 3
    "T...P.....P...T", // 4
    "T.............T", // 5
    "T.............T", // 6
    "T...P.....P...T", // 7
    "T~~..........CT", // 8
    "T~~~........CCT", // 9
    "TTTTTTTTTTTTTTT", // 10
  ];
  return {
    file: "cellar",
    width: 15,
    height: 11,
    tileSize: 32,
    tilesets: [dungeonTileset()],
    properties: [str("name", "The Cellar")],
    layers: [
      { kind: "tiles", name: "Floor", rows: floor, legend: DUNGEON_LEGEND },
      { kind: "tiles", name: "Walls", rows: walls, legend: DUNGEON_LEGEND },
      {
        kind: "objects",
        name: "Objects",
        objects: [
          point("from_hall", 7, 3),
          rect("door", 7, 1, 1, 1, [str("target", "hall"), str("entrance", "from_cellar")]),
        ],
      },
    ],
  };
}

// ---------------------------------------------------------------------------------------------
// Turning a MapSpec into Tiled's two formats
// ---------------------------------------------------------------------------------------------

// the layer's GIDs, row by row, checked against the map's size and the legend
function layerData(map: MapSpec, layer: TileLayerSpec): number[][] {
  if (layer.rows.length !== map.height) {
    throw new Error(`${map.file}/${layer.name}: ${layer.rows.length} rows, expected ${map.height}`);
  }
  return layer.rows.map((row, r) => {
    if (row.length !== map.width) {
      throw new Error(`${map.file}/${layer.name} row ${r}: ${row.length} columns, expected ${map.width}`);
    }
    return [...row].map((ch) => {
      const gid = layer.legend[ch];
      if (gid === undefined) throw new Error(`${map.file}/${layer.name} row ${r}: unknown tile '${ch}'`);
      return gid;
    });
  });
}

// every object gets a unique id, counting up through the object layers - as Tiled does
function numberObjects(map: MapSpec): Map<ObjectSpec, number> {
  const ids = new Map<ObjectSpec, number>();
  let next = 1;
  for (const layer of map.layers) {
    if (layer.kind === "objects") for (const obj of layer.objects) ids.set(obj, next++);
  }
  return ids;
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value).sort()) out[key] = sortKeys((value as Record<string, unknown>)[key]);
    return out;
  }
  return value;
}

export function toTmj(map: MapSpec, imagePrefix: string): string {
  const ids = numberObjects(map);
  const rowsByMarker = new Map<string, number[][]>();

  const layers = map.layers.map((layer, i) => {
    const common = { id: i + 1, name: layer.name, opacity: 1, visible: true, x: 0, y: 0 };
    if (layer.kind === "tiles") {
      const marker = `@@DATA_${i}@@`;
      rowsByMarker.set(marker, layerData(map, layer));
      return { ...common, type: "tilelayer", width: map.width, height: map.height, data: marker };
    }
    return {
      ...common,
      type: "objectgroup",
      draworder: "topdown",
      objects: layer.objects.map((obj) => {
        const o: Record<string, unknown> = {
          id: ids.get(obj),
          name: obj.name,
          type: "",
          rotation: 0,
          visible: true,
          x: obj.x,
          y: obj.y,
          width: obj.width ?? 0,
          height: obj.height ?? 0,
        };
        if (obj.point) o.point = true;
        if (obj.polyline) o.polyline = obj.polyline;
        if (obj.properties && obj.properties.length > 0) o.properties = obj.properties;
        return o;
      }),
    };
  });

  const json: Record<string, unknown> = {
    compressionlevel: -1,
    width: map.width,
    height: map.height,
    infinite: false,
    layers,
    nextlayerid: map.layers.length + 1,
    nextobjectid: ids.size + 1,
    orientation: "orthogonal",
    renderorder: "right-down",
    tiledversion: TILED_VERSION,
    tilewidth: map.tileSize,
    tileheight: map.tileSize,
    tilesets: map.tilesets.map((ts) => {
      const t: Record<string, unknown> = {
        columns: ts.columns,
        firstgid: ts.firstgid,
        image: imagePrefix + ts.image,
        imagewidth: ts.imageWidth,
        imageheight: ts.imageHeight,
        margin: 0,
        name: ts.name,
        spacing: 0,
        tilecount: ts.tileCount,
        tilewidth: map.tileSize,
        tileheight: map.tileSize,
      };
      if (ts.tiles.length > 0) t.tiles = ts.tiles;
      return t;
    }),
    type: "map",
    version: FORMAT_VERSION,
  };
  if (map.properties && map.properties.length > 0) json.properties = map.properties;

  // Tiled writes keys in alphabetical order, with a one-space indent. The tile data is written one
  // row of the map per line, so the map can be read in the file.
  let text = JSON.stringify(sortKeys(json), null, 1);
  for (const [marker, rows] of rowsByMarker) {
    const indent = text.slice(text.lastIndexOf("\n", text.indexOf(`"${marker}"`)) + 1).match(/^ */)![0];
    const body = rows.map((row) => indent + " " + row.join(", ")).join(",\n");
    text = text.replace(`"${marker}"`, `[\n${body}\n${indent}]`);
  }
  return text + "\n";
}

const xml = (s: string | number | boolean): string =>
  String(s).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

function xmlProperties(properties: Property[] | undefined, indent: string): string[] {
  if (!properties || properties.length === 0) return [];
  const lines = [`${indent}<properties>`];
  for (const p of properties) {
    const type = p.type === "string" ? "" : ` type="${p.type}"`;
    if (typeof p.value === "string" && p.value.includes("\n")) {
      // Tiled writes a value with line breaks as the element's text, not as an attribute
      lines.push(`${indent} <property name="${xml(p.name)}"${type}>${xml(p.value)}</property>`);
    } else {
      lines.push(`${indent} <property name="${xml(p.name)}"${type} value="${xml(p.value)}"/>`);
    }
  }
  lines.push(`${indent}</properties>`);
  return lines;
}

export function toTmx(map: MapSpec, imagePrefix: string, exportTarget: string): string {
  const ids = numberObjects(map);
  const out: string[] = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<map version="${FORMAT_VERSION}" tiledversion="${TILED_VERSION}" orientation="orthogonal" renderorder="right-down" ` +
    `width="${map.width}" height="${map.height}" tilewidth="${map.tileSize}" tileheight="${map.tileSize}" infinite="0" ` +
    `nextlayerid="${map.layers.length + 1}" nextobjectid="${ids.size + 1}">`,
    // remembers where File > Export As last wrote this map, so File > Export (Ctrl+E) writes there again
    ` <editorsettings>`,
    `  <export target="${xml(exportTarget)}" format="json"/>`,
    ` </editorsettings>`,
    ...xmlProperties(map.properties, " "),
  ];
  for (const ts of map.tilesets) {
    out.push(
      ` <tileset firstgid="${ts.firstgid}" name="${xml(ts.name)}" tilewidth="${map.tileSize}" tileheight="${map.tileSize}" ` +
        `tilecount="${ts.tileCount}" columns="${ts.columns}">`,
      `  <image source="${xml(imagePrefix + ts.image)}" width="${ts.imageWidth}" height="${ts.imageHeight}"/>`,
    );
    for (const tile of ts.tiles) {
      out.push(`  <tile id="${tile.id}">`, ...xmlProperties(tile.properties, "   "));
      if (tile.animation) {
        out.push(`   <animation>`);
        for (const f of tile.animation) out.push(`    <frame tileid="${f.tileid}" duration="${f.duration}"/>`);
        out.push(`   </animation>`);
      }
      out.push(`  </tile>`);
    }
    out.push(` </tileset>`);
  }
  map.layers.forEach((layer, i) => {
    if (layer.kind === "tiles") {
      const rows = layerData(map, layer);
      out.push(
        ` <layer id="${i + 1}" name="${xml(layer.name)}" width="${map.width}" height="${map.height}">`,
        `  <data encoding="csv">`,
        rows.map((row) => row.join(",")).join(",\n"),
        `</data>`,
        ` </layer>`,
      );
    } else {
      out.push(` <objectgroup id="${i + 1}" name="${xml(layer.name)}">`);
      for (const obj of layer.objects) {
        let attrs = `id="${ids.get(obj)}" name="${xml(obj.name)}" x="${obj.x}" y="${obj.y}"`;
        if (obj.width) attrs += ` width="${obj.width}" height="${obj.height}"`;
        const inner = xmlProperties(obj.properties, "   ");
        if (obj.point) inner.push(`   <point/>`);
        if (obj.polyline) inner.push(`   <polyline points="${obj.polyline.map((p) => `${p.x},${p.y}`).join(" ")}"/>`);
        if (inner.length === 0) {
          out.push(`  <object ${attrs}/>`);
        } else {
          out.push(`  <object ${attrs}>`, ...inner, `  </object>`);
        }
      }
      out.push(` </objectgroup>`);
    }
  });
  out.push(`</map>`);
  return out.join("\n") + "\n";
}

// writes <project>/tiled/<file>.tmx and <project>/public/assets/maps/<file>.tmj
export async function writeMap(projectDir: string, map: MapSpec): Promise<void> {
  const tmxFile = join(projectDir, "tiled", `${map.file}.tmx`);
  const tmjFile = join(projectDir, "public", "assets", "maps", `${map.file}.tmj`);
  await Deno.mkdir(dirname(tmxFile), { recursive: true });
  await Deno.mkdir(dirname(tmjFile), { recursive: true });

  // paths inside a Tiled map are relative to the map file itself
  const fromTmx = relative(dirname(tmxFile), join(projectDir, "public", "assets")) + "/";
  const fromTmj = relative(dirname(tmjFile), join(projectDir, "public", "assets")) + "/";
  const exportTarget = relative(dirname(tmxFile), tmjFile);

  await Deno.writeTextFile(tmxFile, toTmx(map, fromTmx, exportTarget));
  await Deno.writeTextFile(tmjFile, toTmj(map, fromTmj));
  console.log(`wrote ${relative(Deno.cwd(), tmxFile)} and ${relative(Deno.cwd(), tmjFile)}`);
}

export const CHAPTER = join(dirname(fromFileUrl(import.meta.url)), "..");

if (import.meta.main) {
  const level = join(CHAPTER, "projects", "ch11_tiled_level");
  const doors = join(CHAPTER, "projects", "ch11_tiled_doors");
  await writeMap(level, level1());
  await writeMap(doors, hall());
  await writeMap(doors, cellar());
}
