// Writes the changed Tiled maps used by the teacher's solutions to Chapter 11's challenges.
//
//   deno run -A teacher/ch11_tilemaps_tiled/tools/make_solution_maps.ts      (from the guide's root folder)
//
// Each solution starts from a copy of a chapter project (maps included). This script builds the
// chapter's maps with chapters/ch11_tilemaps_tiled/tools/make_maps.ts, changes them as a student
// would in Tiled, and writes them into the solution projects - both the Tiled source
// (tiled/<name>.tmx) and the JSON export the game loads (public/assets/maps/<name>.tmj).
//
// Every change is marked "CHALLENGE n".

import { dirname, fromFileUrl, join } from "jsr:@std/path@^1";
import {
  cellar,
  DUNGEON_LEGEND,
  dungeonTileset,
  hall,
  level1,
  type MapSpec,
  type ObjectLayerSpec,
  point,
  rect,
  str,
  type TileLayerSpec,
  type TilesetSpec,
  writeMap,
} from "../../../chapters/ch11_tilemaps_tiled/tools/make_maps.ts";

const SOLUTIONS = join(dirname(fromFileUrl(import.meta.url)), "..", "solutions");

function tileLayer(map: MapSpec, name: string): TileLayerSpec {
  const layer = map.layers.find((l) => l.name === name);
  if (!layer || layer.kind !== "tiles") throw new Error(`${map.file} has no tile layer ${name}`);
  return layer;
}

function objectLayer(map: MapSpec): ObjectLayerSpec {
  const layer = map.layers.find((l) => l.kind === "objects");
  if (!layer || layer.kind !== "objects") throw new Error(`${map.file} has no object layer`);
  return layer;
}

// put one character into a row of an ASCII tile layer
function setTile(layer: TileLayerSpec, column: number, row: number, ch: string): void {
  const r = layer.rows[row];
  layer.rows[row] = r.slice(0, column) + ch + r.slice(column + 1);
}

function emptyRows(map: MapSpec): string[] {
  return Array.from({ length: map.height }, () => ".".repeat(map.width));
}

// ---- CHALLENGE 1: a layer drawn above the player (hall) ------------------------------------------

async function challenge1(): Promise<void> {
  const map = hall();
  // CHALLENGE 1 - a new tile layer, "Above": a stone beam across the hall between the pillars, and
  // the tops of the four pillars. It is not in the Walls layer, so it does not collide - the player
  // walks underneath it.
  const above: TileLayerSpec = { kind: "tiles", name: "Above", rows: emptyRows(map), legend: DUNGEON_LEGEND };
  for (let c = 5; c <= 19; c++) setTile(above, c, 8, "T");
  for (const [c, r] of [[5, 4], [19, 4], [5, 10], [19, 10]]) setTile(above, c, r, "T");
  // Tiled keeps layers in drawing order: Floor, Walls, Above, then the object layer
  map.layers.splice(2, 0, above);
  await writeMap(join(SOLUTIONS, "ch11_challenge_1_above_the_player"), map);
}

// ---- CHALLENGE 2: gems - coins with a "value" property (level1) ------------------------------------

async function challenge2(): Promise<void> {
  const map = level1();
  // CHALLENGE 2 - the four coins above the brick wall (row 8) are worth 5: an int property "value"
  for (const obj of objectLayer(map).objects) {
    if (obj.name === "coin" && obj.y === 8 * 32 + 16) {
      obj.properties = [{ name: "value", type: "int", value: 5 }];
    }
  }
  await writeMap(join(SOLUTIONS, "ch11_challenge_2_gems"), map);
}

// ---- CHALLENGE 3: a third room behind the hall's closed door ---------------------------------------

function treasureRoom(): MapSpec {
  //       0         1
  //       01234567890123456
  const floor = [
    ",,,,,,,,,,,,,,,,,", // 0
    ",,,,,,,,,,,,,,,,,", // 1
    ",,,,,,,,=,,,,,,,,", // 2
    ",,,:,,,,=,,,,;,,,", // 3
    ",,,,,,,,=,,,,,,,,", // 4
    ",,;,,,,,=,,,,,,:,", // 5
    ",,,,,,,,=,,,,,,,,", // 6
    ",,,,,,,,=,,,,,,,,", // 7
    ",,,,,,,,,,,,,,,,,", // 8
  ];
  //       0         1
  //       01234567890123456
  const walls = [
    "TTTTTTTTTTTTTTTTT", // 0
    "TWFWWWWWWWWWWWFWT", // 1
    "TCC...........CCT", // 2
    "TC.............CT", // 3
    "T...P.......P...T", // 4
    "TC.............CT", // 5
    "TCC...........CCT", // 6
    "T...............T", // 7
    "TTTTTTTTOTTTTTTTT", // 8
  ];
  return {
    file: "treasure",
    width: 17,
    height: 9,
    tileSize: 32,
    tilesets: [dungeonTileset()],
    properties: [str("name", "The Treasure Room")],
    layers: [
      { kind: "tiles", name: "Floor", rows: floor, legend: DUNGEON_LEGEND },
      { kind: "tiles", name: "Walls", rows: walls, legend: DUNGEON_LEGEND },
      {
        kind: "objects",
        name: "Objects",
        objects: [
          point("from_hall", 8, 6),
          rect("door", 8, 8, 1, 1, [str("target", "hall"), str("entrance", "from_treasure")]),
        ],
      },
    ],
  };
}

async function challenge3(): Promise<void> {
  const project = join(SOLUTIONS, "ch11_challenge_3_a_third_room");
  const map = hall();
  // CHALLENGE 3 - the closed door (D) at the end of the carpet becomes an open door (O), with a door
  // object that leads to the new map, and an entrance point for coming back
  setTile(tileLayer(map, "Walls"), 12, 1, "O");
  objectLayer(map).objects.push(
    rect("door", 12, 1, 1, 1, [str("target", "treasure"), str("entrance", "from_hall")]),
    point("from_treasure", 12, 3),
  );
  await writeMap(project, map);
  await writeMap(project, cellar()); // unchanged, written again only so the folder is complete
  await writeMap(project, treasureRoom()); // CHALLENGE 3 - the new room
}

// ---- CHALLENGE 4: signposts - rectangles with a "message" property ----------------------------------

async function challenge4(): Promise<void> {
  const map = level1();
  // CHALLENGE 4 - two more sign tiles in the Background layer, and a "sign" rectangle with a
  // "message" by each of the three signs
  const background = tileLayer(map, "Background");
  setTile(background, 23, 16, "s");
  setTile(background, 59, 16, "s");
  objectLayer(map).objects.push(
    rect("sign", 1, 15, 5, 2, [str("message", "LEFT and RIGHT to run, UP or SPACE to jump.\nCollect the coins, and reach the flag!")]),
    rect("sign", 22, 15, 3, 2, [str("message", "Lava ahead - jump it!")]),
    rect("sign", 58, 15, 3, 2, [str("message", "Nearly there: touch the flag to finish.")]),
  );
  await writeMap(join(SOLUTIONS, "ch11_challenge_4_signposts"), map);
}

// ---- CHALLENGE 5: a moving platform along a polyline ------------------------------------------------

async function challenge5(): Promise<void> {
  const map = level1();
  // CHALLENGE 5 - the floating platform over the wide pool (columns 41-45) is erased, and replaced
  // by a polyline called "platform": across the pool at ground level, then up, so that the player
  // can ride it to the higher platform on the right. The moving platform's centre follows the line.
  for (let c = 42; c <= 44; c++) setTile(tileLayer(map, "Ground"), c, 14, ".");
  objectLayer(map).objects.push({
    name: "platform",
    x: 41 * 32 + 50,
    y: 17 * 32 + 8,
    polyline: [{ x: 0, y: 0 }, { x: 60, y: 0 }, { x: 60, y: -96 }],
  });
  await writeMap(join(SOLUTIONS, "ch11_challenge_5_moving_platforms"), map);
}

// ---- CHALLENGE 6: animated coin tiles from a second tileset --------------------------------------------

async function challenge6(): Promise<void> {
  const map = level1();
  // CHALLENGE 6 - coin_spin.png as a second tileset, "coins". Its first GID is 17, because
  // platform_tiles uses 1-16. Tile 0 is animated through all six frames, 100 ms each.
  const coins: TilesetSpec = {
    name: "coins",
    image: "spritesheets/coin_spin.png",
    imageWidth: 192,
    imageHeight: 32,
    columns: 6,
    tileCount: 6,
    firstgid: 17,
    tiles: [{ id: 0, animation: [0, 1, 2, 3, 4, 5].map((tileid) => ({ tileid, duration: 100 })) }],
  };
  map.tilesets.push(coins);

  // CHALLENGE 6 - a new tile layer, "Pickups", above Ground, painted with the animated coin tile
  const pickups: TileLayerSpec = { kind: "tiles", name: "Pickups", rows: emptyRows(map), legend: { ".": 0, "o": 17 } };
  for (let c = 6; c <= 9; c++) setTile(pickups, c, 16, "o");
  for (let c = 52; c <= 57; c++) setTile(pickups, c, 16, "o");
  map.layers.splice(2, 0, pickups);
  await writeMap(join(SOLUTIONS, "ch11_challenge_6_spinning_coins_as_tiles"), map);
}

await challenge1();
await challenge2();
await challenge3();
await challenge4();
await challenge5();
await challenge6();
