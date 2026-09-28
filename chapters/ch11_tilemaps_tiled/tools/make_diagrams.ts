// Writes the SVG diagrams in Chapter 11's images/ folder.
//
//   deno run -A chapters/ch11_tilemaps_tiled/tools/make_diagrams.ts      (from the guide's root folder)
//
// Tiled cannot be screenshotted for this book, so its windows are drawn here instead. The diagrams
// that show tiles use the real tileset pictures (embedded in the SVG), and the real maps from
// make_maps.ts, so they always match the projects.

import { encodeBase64 } from "jsr:@std/encoding@^1/base64";
import { join } from "jsr:@std/path@^1";
import { CHAPTER, cellar, hall, level1, type MapSpec, type TileLayerSpec } from "./make_maps.ts";

const GUIDE = join(CHAPTER, "..", "..");
const IMAGES = join(CHAPTER, "images");

const NAVY = "#1d3557";
const BLUE = "#457b9d";
const LIGHT = "#a8dadc";
const CREAM = "#f1faee";
const RED = "#e63946";
const ORANGE = "#f4a261";
const GREEN = "#2a9d8f";
const TEXT = "#1b1f2a";
const GREY = "#d9dee8";
const PANEL = "#f7f9fc";

async function dataUri(file: string): Promise<string> {
  return "data:image/png;base64," + encodeBase64(await Deno.readFile(join(GUIDE, "assets", "tilesets", file)));
}
const PLATFORM = await dataUri("platform_tiles.png");
const DUNGEON = await dataUri("dungeon_tiles.png");

// ---- tiny SVG helpers ------------------------------------------------------------------------

const esc = (s: string): string => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

function svg(width: number, height: number, body: string[], defs = ""): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="Arial, Helvetica, sans-serif">`,
    `<defs>`,
    `<marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${NAVY}"/></marker>`,
    `<marker id="arrowRed" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${RED}"/></marker>`,
    defs,
    `</defs>`,
    `<rect width="${width}" height="${height}" fill="#ffffff"/>`,
    ...body,
    `</svg>`,
    "",
  ].join("\n");
}

function text(x: number, y: number, s: string, opts: { size?: number; fill?: string; weight?: string; anchor?: string; mono?: boolean } = {}): string {
  const family = opts.mono ? ` font-family="Menlo, Consolas, monospace" xml:space="preserve"` : "";
  return `<text x="${x}" y="${y}" font-size="${opts.size ?? 13}" fill="${opts.fill ?? TEXT}"${opts.weight ? ` font-weight="${opts.weight}"` : ""}${opts.anchor ? ` text-anchor="${opts.anchor}"` : ""}${family}>${esc(s)}</text>`;
}

function box(x: number, y: number, w: number, h: number, opts: { fill?: string; stroke?: string; r?: number; width?: number; dash?: boolean } = {}): string {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${opts.r ?? 4}" fill="${opts.fill ?? "none"}" stroke="${opts.stroke ?? NAVY}" stroke-width="${opts.width ?? 1.5}"${opts.dash ? ` stroke-dasharray="5 4"` : ""}/>`;
}

function line(x1: number, y1: number, x2: number, y2: number, opts: { stroke?: string; width?: number; arrow?: boolean; red?: boolean; dash?: boolean } = {}): string {
  const marker = opts.arrow ? ` marker-end="url(#${opts.red ? "arrowRed" : "arrow"})"` : "";
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${opts.stroke ?? (opts.red ? RED : NAVY)}" stroke-width="${opts.width ?? 1.5}"${opts.dash ? ` stroke-dasharray="5 4"` : ""}${marker}/>`;
}

function badge(x: number, y: number, n: number): string {
  return `<circle cx="${x}" cy="${y}" r="10" fill="${RED}"/>` + text(x, y + 4.5, String(n), { size: 12, fill: "#ffffff", weight: "bold", anchor: "middle" });
}

// one tile from a tileset picture (id "platform" or "dungeon"), drawn at (x, y), `size` pixels square
function tile(set: string, index: number, x: number, y: number, size: number): string {
  const tx = (index % 8) * 32;
  const ty = Math.floor(index / 8) * 32;
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="${tx} ${ty} 32 32"><use xlink:href="#${set}"/></svg>`;
}

const tilesetDefs = (sets: string[]): string =>
  sets.map((s) => `<image id="${s}" width="256" height="64" xlink:href="${s === "platform" ? PLATFORM : DUNGEON}"/>`).join("\n");

// draw part of a map's tile layers: columns c0.., rows r0.., each tile `size` pixels
function drawMap(map: MapSpec, set: string, x: number, y: number, size: number, c0 = 0, r0 = 0, cols = map.width, rows = map.height): string[] {
  const out: string[] = [];
  for (const layer of map.layers) {
    if (layer.kind !== "tiles") continue;
    const tl = layer as TileLayerSpec;
    for (let r = r0; r < r0 + rows; r++) {
      for (let c = c0; c < c0 + cols; c++) {
        const gid = tl.legend[tl.rows[r][c]];
        if (gid > 0) out.push(tile(set, gid - 1, x + (c - c0) * size, y + (r - r0) * size, size));
      }
    }
  }
  return out;
}

async function write(name: string, content: string): Promise<void> {
  await Deno.writeTextFile(join(IMAGES, name), content);
  console.log(`wrote images/${name}`);
}

// ---- 1. Tiled's main window ---------------------------------------------------------------------

async function tiledWindow(): Promise<void> {
  const W = 800, H = 606;
  const b: string[] = [];
  // window
  b.push(box(10, 10, 780, 500, { fill: "#ffffff", stroke: NAVY, r: 8, width: 2 }));
  b.push(`<path d="M10,38 V18 a8,8 0 0 1 8,-8 H782 a8,8 0 0 1 8,8 V38 z" fill="${NAVY}"/>`);
  b.push(text(400, 29, "level1.tmx - Tiled", { size: 13, fill: CREAM, anchor: "middle" }));
  // menu bar
  b.push(`<rect x="11" y="38" width="778" height="22" fill="${PANEL}"/>`);
  ["File", "Edit", "View", "World", "Map", "Layer", "Help"].forEach((m, i) => b.push(text(22 + i * 52, 54, m, { size: 12 })));
  // tool bar
  b.push(`<rect x="11" y="60" width="778" height="30" fill="#eef2f7"/>`);
  const tools = ["Stamp Brush (B)", "Bucket Fill (F)", "Eraser (E)", "Select Objects (S)", "Insert Rectangle (R)", "Insert Point (I)", "Insert Polygon (P)"];
  let tx = 20;
  for (const t of tools) {
    const w = t.length * 5.6 + 10;
    b.push(box(tx, 65, w, 20, { fill: "#ffffff", stroke: BLUE, r: 3, width: 1 }));
    b.push(text(tx + w / 2, 79, t, { size: 10.5, anchor: "middle" }));
    tx += w + 6;
  }
  // Properties panel (left)
  b.push(box(18, 98, 170, 404, { fill: PANEL, stroke: GREY, r: 3, width: 1 }));
  b.push(`<rect x="18" y="98" width="170" height="20" fill="${LIGHT}"/>`);
  b.push(text(26, 112, "Properties", { size: 12, weight: "bold" }));
  const props: [string, string][] = [["Map", ""], ["Orientation", "Orthogonal"], ["Width", "64"], ["Height", "20"], ["Tile Width", "32"], ["Tile Height", "32"], ["Custom Properties", ""], ["name", "Green Hills"]];
  props.forEach(([k, v], i) => {
    const y = 136 + i * 22;
    if (v === "") {
      b.push(`<rect x="19" y="${y - 14}" width="168" height="19" fill="#e3e8f0"/>`);
      b.push(text(26, y, k, { size: 11.5, weight: "bold" }));
    } else {
      b.push(text(26, y, k, { size: 11.5 }));
      b.push(text(110, y, v, { size: 11.5, fill: BLUE }));
    }
  });
  b.push(box(26, 470, 22, 20, { fill: "#ffffff", stroke: BLUE, r: 3, width: 1 }));
  b.push(text(37, 485, "+", { size: 15, anchor: "middle", weight: "bold", fill: BLUE }));
  b.push(text(54, 484, "Add Property", { size: 11, fill: BLUE }));
  // map view (centre)
  b.push(box(196, 98, 382, 404, { fill: "#8ecae6", stroke: GREY, r: 3, width: 1 }));
  b.push(...drawMap(level1(), "platform", 204, 106, 24, 0, 4, 15, 16));
  // grid lines over the map view
  for (let c = 0; c <= 15; c++) b.push(line(204 + c * 24, 106, 204 + c * 24, 490, { stroke: "rgba(29,53,87,0.18)", width: 1 }));
  for (let r = 0; r <= 16; r++) b.push(line(204, 106 + r * 24, 564, 106 + r * 24, { stroke: "rgba(29,53,87,0.18)", width: 1 }));
  // objects drawn as Tiled draws them
  b.push(`<circle cx="${204 + 2 * 24}" cy="${106 + (16.25 - 4) * 24}" r="6" fill="${GREEN}" stroke="${NAVY}"/>`);
  b.push(text(204 + 2 * 24, 106 + (16.25 - 4) * 24 - 10, "player", { size: 11, anchor: "middle", weight: "bold", fill: NAVY }));
  for (const [c, r] of [[6.5, 13.5], [7.5, 13.5], [10.5, 10.5], [11.5, 10.5], [13.5, 15.5]]) {
    b.push(`<circle cx="${204 + c * 24}" cy="${106 + (r - 4) * 24}" r="5" fill="${ORANGE}" stroke="${NAVY}"/>`);
  }
  // Layers panel (right top)
  b.push(box(586, 98, 196, 170, { fill: PANEL, stroke: GREY, r: 3, width: 1 }));
  b.push(`<rect x="586" y="98" width="196" height="20" fill="${LIGHT}"/>`);
  b.push(text(594, 112, "Layers", { size: 12, weight: "bold" }));
  const layers: [string, string][] = [["Objects", "object layer"], ["Ground", "tile layer"], ["Background", "tile layer"]];
  layers.forEach(([name, kind], i) => {
    const y = 124 + i * 26;
    b.push(`<rect x="590" y="${y}" width="188" height="22" fill="${i === 1 ? "#cfe3ee" : "#ffffff"}" stroke="${GREY}"/>`);
    b.push(text(598, y + 15, "◉", { size: 11, fill: BLUE }));
    b.push(text(614, y + 15, name, { size: 12, weight: i === 1 ? "bold" : undefined }));
    b.push(text(772, y + 15, kind, { size: 10, fill: BLUE, anchor: "end" }));
  });
  b.push(text(594, 222, "top of the list = drawn on top", { size: 10.5, fill: BLUE }));
  b.push(text(594, 238, "Layer > New > Tile Layer / Object Layer", { size: 10.5, fill: BLUE }));
  // Tilesets panel (right bottom)
  b.push(box(586, 276, 196, 226, { fill: PANEL, stroke: GREY, r: 3, width: 1 }));
  b.push(`<rect x="586" y="276" width="196" height="20" fill="${LIGHT}"/>`);
  b.push(text(594, 290, "Tilesets", { size: 12, weight: "bold" }));
  b.push(box(592, 300, 92, 18, { fill: "#ffffff", stroke: BLUE, r: 3, width: 1 }));
  b.push(text(638, 313, "platform_tiles", { size: 10.5, anchor: "middle" }));
  for (let i = 0; i < 16; i++) b.push(tile("platform", i, 594 + (i % 8) * 23, 326 + Math.floor(i / 8) * 23, 22));
  b.push(box(594, 326, 22, 22, { stroke: RED, r: 1, width: 2.5 }));
  b.push(text(594, 390, "click a tile to paint with it;", { size: 10.5, fill: BLUE }));
  b.push(text(594, 404, "drag to pick a block of tiles", { size: 10.5, fill: BLUE }));
  b.push(box(594, 470, 22, 20, { fill: "#ffffff", stroke: BLUE, r: 3, width: 1 }));
  b.push(text(605, 484, "✎", { size: 12, anchor: "middle", fill: BLUE }));
  b.push(text(622, 484, "Edit Tileset", { size: 11, fill: BLUE }));

  // callouts
  b.push(badge(770, 75, 1), badge(176, 108, 2), badge(566, 110, 3), badge(770, 108, 4), badge(770, 286, 5));
  const notes = [
    "1  Tools: paint tiles (Stamp, Bucket, Eraser) or make objects (Rectangle, Point, Polygon)",
    "2  Properties: whatever is selected - the map, a layer, a tile or an object - and its custom properties",
    "3  The map itself: 32 x 32 tiles; the grid and the objects are only drawn in the editor",
    "4  Layers: tile layers and object layers, top of the list drawn on top",
    "5  Tilesets: the tiles you paint with",
  ];
  notes.forEach((n, i) => b.push(text(14, 530 + i * 16, n, { size: 12 })));
  await write("tiled_window.svg", svg(W, H, b, tilesetDefs(["platform"])));
}

// ---- 2. the New Map and New Tileset dialogs -----------------------------------------------------

function field(b: string[], x: number, y: number, label: string, value: string, w = 150): void {
  b.push(text(x, y + 14, label, { size: 12 }));
  b.push(box(x + 120, y, w, 20, { fill: "#ffffff", stroke: BLUE, r: 3, width: 1 }));
  b.push(text(x + 126, y + 14, value, { size: 12, fill: NAVY }));
}

function check(b: string[], x: number, y: number, label: string, on: boolean): void {
  b.push(box(x, y + 3, 14, 14, { fill: "#ffffff", stroke: BLUE, r: 2, width: 1 }));
  if (on) b.push(`<path d="M${x + 3},${y + 10} l3,4 l6,-9" fill="none" stroke="${NAVY}" stroke-width="2"/>`);
  b.push(text(x + 20, y + 14, label, { size: 12 }));
}

function dialog(b: string[], x: number, y: number, w: number, h: number, title: string): void {
  b.push(box(x, y, w, h, { fill: PANEL, stroke: NAVY, r: 6, width: 1.5 }));
  b.push(`<path d="M${x},${y + 24} V${y + 6} a6,6 0 0 1 6,-6 H${x + w - 6} a6,6 0 0 1 6,6 V${y + 24} z" fill="${NAVY}"/>`);
  b.push(text(x + w / 2, y + 17, title, { size: 12.5, fill: CREAM, anchor: "middle", weight: "bold" }));
}

function heading(b: string[], x: number, y: number, s: string): void {
  b.push(text(x, y, s, { size: 12, weight: "bold", fill: BLUE }));
}

function button(b: string[], x: number, y: number, label: string, main = false): void {
  const w = label.length * 7 + 20;
  b.push(box(x, y, w, 24, { fill: main ? LIGHT : "#ffffff", stroke: NAVY, r: 4, width: 1 }));
  b.push(text(x + w / 2, y + 16, label, { size: 12, anchor: "middle" }));
}

async function tiledDialogs(): Promise<void> {
  const b: string[] = [];
  // New Map
  dialog(b, 10, 10, 370, 340, "New Map   (File > New > New Map...)");
  heading(b, 26, 54, "Map");
  field(b, 26, 62, "Orientation", "Orthogonal");
  field(b, 26, 88, "Tile layer format", "CSV");
  field(b, 26, 114, "Tile render order", "Right Down");
  heading(b, 26, 160, "Map size");
  check(b, 26, 166, "Fixed", true);
  check(b, 100, 166, "Infinite", false);
  field(b, 26, 190, "Width", "64 tiles", 90);
  field(b, 26, 216, "Height", "20 tiles", 90);
  b.push(text(250, 230, "2048 x 640 pixels", { size: 11, fill: BLUE }));
  heading(b, 26, 262, "Tile size");
  field(b, 26, 270, "Width", "32 px", 90);
  field(b, 26, 296, "Height", "32 px", 90);
  button(b, 250, 318, "Cancel");
  button(b, 320, 318, "OK", true);
  // New Tileset
  dialog(b, 410, 10, 380, 340, "New Tileset   (File > New > New Tileset...)");
  heading(b, 426, 54, "Tileset");
  field(b, 426, 62, "Name", "platform_tiles", 180);
  field(b, 426, 88, "Type", "Based on Tileset Image", 180);
  check(b, 426, 112, "Embed in map", true);
  heading(b, 426, 160, "Image");
  field(b, 426, 168, "Source", "...tilesets/platform_tiles.png", 180);
  button(b, 668, 194, "Browse...");
  check(b, 426, 196, "Use transparent color", false);
  field(b, 426, 222, "Tile width", "32 px", 90);
  field(b, 426, 248, "Tile height", "32 px", 90);
  field(b, 426, 274, "Margin", "0 px", 90);
  field(b, 426, 300, "Spacing", "0 px", 90);
  button(b, 660, 318, "Cancel");
  button(b, 730, 318, "OK", true);
  // notes
  b.push(badge(355, 175, 1), badge(560, 122, 2), badge(770, 72, 3));
  b.push(text(10, 372, "1  a fixed size, in tiles - the map is 64 tiles across and 20 down", { size: 12 }));
  b.push(text(10, 390, "2  Embed in map: the tileset is saved INSIDE the map file. Phaser cannot read a separate (external) tileset", { size: 12 }));
  b.push(text(10, 408, "3  the name you will pass to addTilesetImage() in Phaser - Tiled suggests the picture's file name", { size: 12 }));
  await write("tiled_dialogs.svg", svg(800, 420, b));
}

// ---- 3. custom properties on tiles ----------------------------------------------------------------

async function tileProperties(): Promise<void> {
  const b: string[] = [];
  const names = ["grass top", "dirt", "grass left", "grass right", "brick", "stone", "spikes", "ladder", "water", "lava", "crate", "door top", "door", "flag", "bush", "sign"];
  const collides = [0, 1, 2, 3, 4, 5, 10];
  const hazard = [6, 8, 9];
  b.push(text(20, 26, "The tileset, with a custom property on some of its tiles", { size: 14, weight: "bold" }));
  const S = 40, X = 20, Y = 44, GAP = 50;
  for (let i = 0; i < 16; i++) {
    const x = X + (i % 8) * GAP, y = Y + Math.floor(i / 8) * 76;
    b.push(`<rect x="${x - 3}" y="${y - 3}" width="${S + 6}" height="${S + 6}" fill="#eef2f7"/>`);
    b.push(tile("platform", i, x, y, S));
    if (collides.includes(i)) b.push(box(x - 3, y - 3, S + 6, S + 6, { stroke: RED, r: 3, width: 3 }));
    if (hazard.includes(i)) b.push(box(x - 3, y - 3, S + 6, S + 6, { stroke: ORANGE, r: 3, width: 3 }));
    b.push(text(x + S / 2, y + S + 16, String(i), { size: 11, anchor: "middle", weight: "bold" }));
    b.push(text(x + S / 2, y + S + 28, names[i], { size: 9.5, anchor: "middle", fill: BLUE }));
  }
  b.push(box(20, 206, 14, 14, { stroke: RED, width: 3, r: 2 }));
  b.push(text(42, 218, "collides = true  (solid: the player stands on these)", { size: 12 }));
  b.push(box(20, 230, 14, 14, { stroke: ORANGE, width: 3, r: 2 }));
  b.push(text(42, 242, "hazard = true  (touch one and you start again)", { size: 12 }));
  b.push(text(20, 270, "Tiles with no box have no custom properties at all.", { size: 12, fill: BLUE }));
  b.push(text(20, 288, "The numbers are tile INDEXES within the tileset, from 0 (see the GIDs diagram).", { size: 12, fill: BLUE }));

  // Properties panel
  const px = 450;
  b.push(box(px, 44, 330, 250, { fill: PANEL, stroke: GREY, r: 3, width: 1 }));
  b.push(`<rect x="${px}" y="44" width="330" height="20" fill="${LIGHT}"/>`);
  b.push(text(px + 8, 58, "Properties  (7 tiles selected)", { size: 12, weight: "bold" }));
  const rows: [string, string][] = [["Tile", ""], ["ID", "0"], ["Class", ""], ["Probability", "1"], ["Custom Properties", ""]];
  rows.forEach(([k, v], i) => {
    const y = 82 + i * 22;
    if (i === 0 || i === 4) {
      b.push(`<rect x="${px + 1}" y="${y - 14}" width="328" height="19" fill="#e3e8f0"/>`);
      b.push(text(px + 8, y, k, { size: 11.5, weight: "bold" }));
    } else {
      b.push(text(px + 8, y, k, { size: 11.5 }));
      b.push(text(px + 130, y, v, { size: 11.5, fill: BLUE }));
    }
  });
  b.push(text(px + 8, 192, "collides", { size: 12, weight: "bold" }));
  check(b, px + 130, 178, "true", true);
  b.push(box(px + 8, 262, 22, 20, { fill: "#ffffff", stroke: BLUE, r: 3, width: 1 }));
  b.push(text(px + 19, 277, "+", { size: 15, anchor: "middle", weight: "bold", fill: BLUE }));
  b.push(text(px + 36, 276, "Add Property:  name collides, type bool", { size: 11, fill: BLUE }));
  b.push(badge(px + 318, 188, 1), badge(px + 318, 272, 2));
  b.push(text(px + 8, 222, "1  tick it - the value is true", { size: 11 }));
  b.push(text(px + 8, 240, "2  select several tiles first to add it to them all", { size: 11 }));
  await write("tile_properties.svg", svg(800, 310, b, tilesetDefs(["platform"])));
}

// ---- 4. inside a .tmj file ------------------------------------------------------------------------

async function tmjStructure(): Promise<void> {
  const b: string[] = [];
  const mono = { size: 10.5, mono: true } as const;
  const panel = (x: number, y: number, w: number, h: number, title: string, colour: string, lines: string[]) => {
    b.push(box(x, y, w, h, { fill: "#ffffff", stroke: colour, r: 6, width: 2 }));
    b.push(`<rect x="${x}" y="${y}" width="${w}" height="22" rx="6" fill="${colour}"/><rect x="${x}" y="${y + 12}" width="${w}" height="10" fill="${colour}"/>`);
    b.push(text(x + 8, y + 16, title, { size: 12, weight: "bold", fill: "#ffffff" }));
    lines.forEach((l, i) => b.push(text(x + 10, y + 40 + i * 16, l, mono)));
  };
  panel(20, 16, 250, 250, "level1.tmj - the map", NAVY, [
    `"type": "map",`,
    `"orientation": "orthogonal",`,
    `"width": 64,  "height": 20,`,
    `"tilewidth": 32,`,
    `"tileheight": 32,`,
    `"infinite": false,`,
    `"properties": [ ... ],`,
    `"tilesets": [ ... ],`,
    `"layers": [ ... ],`,
    `"nextlayerid": 4,`,
    `"nextobjectid": 21,`,
    `"version": "1.10"`,
  ]);
  panel(290, 16, 500, 146, "tilesets[0] - embedded in the map", GREEN, [
    `"name": "platform_tiles",       <- addTilesetImage("platform_tiles", ...)`,
    `"firstgid": 1,`,
    `"image": "../tilesets/platform_tiles.png",`,
    `"columns": 8,  "tilecount": 16,  "tilewidth": 32, ...`,
    `"tiles": [ { "id": 0, "properties": [`,
    `    { "name": "collides", "type": "bool", "value": true } ] }, ... ]`,
  ]);
  panel(290, 176, 500, 114, "layers[0] and [1] - tile layers", BLUE, [
    `"name": "Ground",  "type": "tilelayer",    <- createLayer("Ground", ...)`,
    `"width": 64,  "height": 20,`,
    `"data": [ 0, 0, 0, ...                   one GID per tile, row by row:`,
    `          1, 1, 1, 1, 4, 0, 0, 0, 3, ... ]  64 x 20 = 1280 numbers`,
  ]);
  panel(290, 304, 500, 194, "layers[2] - the object layer", RED, [
    `"name": "Objects",  "type": "objectgroup",  <- getObjectLayer("Objects")`,
    `"objects": [`,
    `  { "id": 1, "name": "player", "point": true, "x": 64, "y": 520, ... },`,
    `  { "id": 2, "name": "coin", "point": true, "x": 208, "y": 432, ... },`,
    `  { "id": 18, "name": "enemy", "point": true, "x": 1232, "y": 528,`,
    `    "properties": [ { "name": "speed", "type": "float", "value": 60 } ] },`,
    `  { "id": 20, "name": "goal", "x": 1952, "y": 480,`,
    `    "width": 32, "height": 64, ... }`,
    `]`,
  ]);
  b.push(line(270, 150, 288, 90, { arrow: true }));
  b.push(line(270, 166, 288, 232, { arrow: true }));
  b.push(line(270, 166, 288, 380, { arrow: true }));
  b.push(text(20, 292, "Keys are written in alphabetical order;", { size: 12, fill: BLUE }));
  b.push(text(20, 308, "\"...\" marks what has been left out here.", { size: 12, fill: BLUE }));
  b.push(text(20, 340, "Phaser reads all of it with", { size: 12 }));
  b.push(text(20, 358, "this.load.tilemapTiledJSON(key, file)", { size: 12, mono: true, fill: NAVY }));
  b.push(text(20, 376, "and builds the map with", { size: 12 }));
  b.push(text(20, 394, "this.make.tilemap({ key })", { size: 12, mono: true, fill: NAVY }));
  await write("tmj_structure.svg", svg(800, 510, b));
}

// ---- 5. tile indexes and GIDs ---------------------------------------------------------------------

async function gids(): Promise<void> {
  const b: string[] = [];
  b.push(text(20, 26, "Tile index (in the tileset) and GID (in the map)", { size: 14, weight: "bold" }));
  const S = 40, X = 110, Y = 46, GAP = 48;
  b.push(text(20, 72, "tileset", { size: 12, weight: "bold" }));
  b.push(text(20, 108, "index", { size: 12, fill: BLUE }));
  b.push(text(20, 128, "GID", { size: 12, fill: RED, weight: "bold" }));
  for (let i = 0; i < 12; i++) {
    const x = X + i * GAP;
    b.push(tile("platform", i, x, Y, S));
    b.push(box(x, Y, S, S, { stroke: GREY, r: 1, width: 1 }));
    b.push(text(x + S / 2, 108, String(i), { size: 12, anchor: "middle", fill: BLUE }));
    b.push(text(x + S / 2, 128, String(i + 1), { size: 12, anchor: "middle", fill: RED, weight: "bold" }));
  }
  b.push(text(X + 12 * GAP + 4, 118, "...", { size: 14 }));
  b.push(text(20, 160, "GID = firstgid + index. This tileset's firstgid is 1, so GID 0 is left free to mean \"no tile\".", { size: 12.5 }));
  b.push(text(20, 178, "A second tileset in the same map would start where this one ends - firstgid 17.", { size: 12.5 }));

  // a row of the Ground layer
  b.push(text(20, 214, "row 17 of the Ground layer, columns 7 to 16, as saved in the .tmj:", { size: 12, weight: "bold" }));
  const row = [1, 1, 1, 1, 4, 0, 0, 0, 3, 1];
  row.forEach((g, i) => {
    const x = X + i * GAP;
    b.push(box(x, 222, S, 24, { fill: g === 0 ? "#ffffff" : "#fff4e8", stroke: GREY, r: 2, width: 1 }));
    b.push(text(x + S / 2, 239, String(g), { size: 13, anchor: "middle", mono: true, fill: RED, weight: "bold" }));
    if (g > 0) b.push(tile("platform", g - 1, x + 4, 252, 32));
    b.push(text(x + S / 2, 300, g === 0 ? "-1" : String(g), { size: 12, anchor: "middle", mono: true, fill: NAVY }));
  });
  b.push(text(20, 272, "drawn", { size: 12 }));
  b.push(text(20, 300, "tile.index", { size: 12, fill: NAVY }));
  b.push(text(20, 332, "In Phaser a Tiled tile's index IS its GID - grass top is 1, not 0 - and an empty place is -1.", { size: 12.5 }));
  b.push(text(20, 350, "So setCollision([1, 2, 3]) means GIDs. Choosing tiles by property avoids counting at all.", { size: 12.5 }));
  await write("gids.svg", svg(800, 366, b, tilesetDefs(["platform"])));
}

// ---- 6. names that must match ---------------------------------------------------------------------

async function namesMatch(): Promise<void> {
  const b: string[] = [];
  b.push(text(160, 26, "In Tiled", { size: 15, weight: "bold", anchor: "middle" }));
  b.push(text(590, 26, "In the code", { size: 15, weight: "bold", anchor: "middle" }));
  const pairs: [string, string, string][] = [
    ["tileset name", "platform_tiles", `map.addTilesetImage("platform_tiles", TILES_KEY)`],
    ["tile layer", "Background", `map.createLayer("Background", tiles)`],
    ["tile layer", "Ground", `map.createLayer("Ground", tiles)`],
    ["tile property", "collides", `ground.setCollisionByProperty({ collides: true })`],
    ["object layer", "Objects", `map.getObjectLayer("Objects")`],
    ["object name", "player", `map.findObject("Objects", (obj) => obj.name === "player")`],
    ["object name", "coin", `map.createFromObjects("Objects", { name: "coin", ... })`],
    ["object property", "speed", `getTiledProperty(obj.properties, "speed", 60)`],
    ["map property", "name", `getTiledProperty(map.properties, "name", ...)`],
  ];
  pairs.forEach(([kind, name, code], i) => {
    const y = 44 + i * 38;
    b.push(box(20, y, 280, 28, { fill: "#ffffff", stroke: GREEN, r: 4, width: 1.5 }));
    b.push(text(30, y + 18, kind, { size: 11.5, fill: BLUE }));
    b.push(text(290, y + 18, `"${name}"`, { size: 13, weight: "bold", anchor: "end", mono: true, fill: NAVY }));
    b.push(line(302, y + 14, 342, y + 14, { arrow: true }));
    b.push(box(344, y, 440, 28, { fill: "#ffffff", stroke: NAVY, r: 4, width: 1.5 }));
    b.push(text(352, y + 18, code, { size: 11.5, mono: true }));
  });
  b.push(text(20, 400, "Every one is a string, and every one must be spelled exactly the same - capitals included. Get one wrong and", { size: 12.5 }));
  b.push(text(20, 418, "Phaser finds nothing: null, an empty list, or a layer that is not there. Keep them as constants in one file.", { size: 12.5 }));
  await write("names_match.svg", svg(800, 432, b));
}

// ---- 7. the kinds of object ----------------------------------------------------------------------

async function tiledObjects(): Promise<void> {
  const b: string[] = [];
  b.push(text(20, 26, "Where Tiled measures each kind of object from", { size: 14, weight: "bold" }));
  // grid background for each panel
  const grid = (x: number, y: number, cols: number, rows: number) => {
    b.push(`<rect x="${x}" y="${y}" width="${cols * 32}" height="${rows * 32}" fill="${CREAM}"/>`);
    for (let c = 0; c <= cols; c++) b.push(line(x + c * 32, y, x + c * 32, y + rows * 32, { stroke: "#cdd6e0", width: 1 }));
    for (let r = 0; r <= rows; r++) b.push(line(x, y + r * 32, x + cols * 32, y + r * 32, { stroke: "#cdd6e0", width: 1 }));
  };
  // point
  grid(20, 50, 6, 5);
  b.push(`<circle cx="116" cy="146" r="6" fill="${GREEN}" stroke="${NAVY}" stroke-width="1.5"/>`);
  b.push(text(126, 140, "(x, y)", { size: 12, weight: "bold", fill: NAVY }));
  b.push(text(20, 232, "Point: x and y are the point.", { size: 12.5, weight: "bold" }));
  b.push(text(20, 250, "A sprite placed there is centred on it.", { size: 12 }));
  // rectangle
  grid(270, 50, 7, 5);
  b.push(`<rect x="334" y="82" width="128" height="96" fill="rgba(230,57,70,0.15)" stroke="${RED}" stroke-width="2"/>`);
  b.push(`<circle cx="334" cy="82" r="5" fill="${RED}"/>`);
  b.push(text(340, 76, "(x, y)", { size: 12, weight: "bold", fill: RED }));
  b.push(`<circle cx="398" cy="130" r="4" fill="${NAVY}"/>`);
  b.push(text(398, 150, "centre", { size: 11, anchor: "middle", fill: NAVY }));
  b.push(line(334, 194, 462, 194, { stroke: RED }));
  b.push(text(398, 208, "width", { size: 11, anchor: "middle", fill: RED }));
  b.push(line(478, 82, 478, 178, { stroke: RED }));
  b.push(text(484, 134, "height", { size: 11, fill: RED }));
  b.push(text(270, 232, "Rectangle: x, y is the TOP-LEFT corner.", { size: 12.5, weight: "bold" }));
  b.push(text(270, 250, "A Zone is placed by its centre:", { size: 12 }));
  b.push(text(270, 266, "(x + width / 2, y + height / 2)", { size: 12, mono: true, fill: NAVY }));
  // polyline
  grid(540, 50, 7, 5);
  b.push(`<polyline points="572,146 668,146 700,82" fill="none" stroke="${BLUE}" stroke-width="3"/>`);
  for (const [px, py] of [[572, 146], [668, 146], [700, 82]]) b.push(`<circle cx="${px}" cy="${py}" r="4.5" fill="${BLUE}"/>`);
  b.push(text(566, 166, "(x, y) = point 0,0", { size: 11, fill: NAVY, weight: "bold" }));
  b.push(text(640, 138, "96,0", { size: 11, fill: BLUE }));
  b.push(text(708, 80, "128,-64", { size: 11, fill: BLUE }));
  b.push(text(540, 232, "Polyline: a list of points,", { size: 12.5, weight: "bold" }));
  b.push(text(540, 250, "each measured FROM (x, y).", { size: 12 }));
  await write("tiled_objects.svg", svg(800, 280, b));
}

// ---- 8. doors between rooms -------------------------------------------------------------------------

async function doors(): Promise<void> {
  const b: string[] = [];
  const S = 12;
  const hx = 20, hy = 40, cx = 520, cy = 80;
  b.push(text(hx, 28, "hall.tmj", { size: 14, weight: "bold" }));
  b.push(text(cx, cy + 11 * S + 20, "cellar.tmj", { size: 14, weight: "bold" }));
  b.push(...drawMap(hall(), "dungeon", hx, hy, S));
  b.push(...drawMap(cellar(), "dungeon", cx, cy, S));
  // hall objects: door on the stairs (4, 13), from_cellar point (6, 13), start (12, 10)
  b.push(`<rect x="${hx + 4 * S}" y="${hy + 13 * S}" width="${S}" height="${S}" fill="rgba(230,57,70,0.25)" stroke="${RED}" stroke-width="2"/>`);
  b.push(`<circle cx="${hx + 6.5 * S}" cy="${hy + 13.5 * S}" r="4" fill="${GREEN}" stroke="#ffffff"/>`);
  b.push(`<circle cx="${hx + 12.5 * S}" cy="${hy + 10.5 * S}" r="4" fill="${ORANGE}" stroke="#ffffff"/>`);
  b.push(text(hx + 12.5 * S + 7, hy + 10.5 * S + 4, "start", { size: 11, fill: "#ffffff", weight: "bold" }));
  // cellar objects: door (7, 1), from_hall point (7, 3)
  b.push(`<rect x="${cx + 7 * S}" y="${cy + 1 * S}" width="${S}" height="${S}" fill="rgba(230,57,70,0.25)" stroke="${RED}" stroke-width="2"/>`);
  b.push(`<circle cx="${cx + 7.5 * S}" cy="${cy + 3.5 * S}" r="4" fill="${GREEN}" stroke="#ffffff"/>`);

  // property cards
  const card = (x: number, y: number, lines: string[]) => {
    b.push(box(x, y, 200, 20 + lines.length * 16, { fill: "#ffffff", stroke: RED, r: 5, width: 1.5 }));
    lines.forEach((l, i) => b.push(text(x + 10, y + 18 + i * 16, l, { size: 11.5, mono: true, weight: i === 0 ? "bold" : undefined })));
  };
  card(20, 270, ['name: "door"', 'target: "cellar"', 'entrance: "from_hall"']);
  b.push(line(hx + 4.5 * S, hy + 14 * S, 70, 270, { stroke: RED }));
  card(560, 270, ['name: "door"', 'target: "hall"', 'entrance: "from_cellar"']);
  b.push(line(cx + 8 * S, cy + 1.5 * S, 740, 270, { stroke: RED, dash: true }));

  // arrows: hall door -> cellar entrance; cellar door -> hall entrance
  b.push(`<path d="M${hx + 5 * S},${hy + 13.5 * S} C 380,260 420,40 ${cx + 7.5 * S - 6},${cy + 3.5 * S}" fill="none" stroke="${NAVY}" stroke-width="2" marker-end="url(#arrow)"/>`);
  b.push(text(350, 190, "go through: load \"cellar\",", { size: 11.5, fill: NAVY }));
  b.push(text(350, 205, "appear at \"from_hall\"", { size: 11.5, fill: NAVY }));
  b.push(`<path d="M${cx + 7 * S},${cy + 1.5 * S} C 460,20 250,20 ${hx + 6.5 * S + 6},${hy + 13.5 * S - 5}" fill="none" stroke="${BLUE}" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#arrow)"/>`);
  b.push(text(330, 40, "and back: load \"hall\", appear at \"from_cellar\"", { size: 11.5, fill: BLUE }));

  b.push(`<rect x="20" y="346" width="12" height="12" fill="rgba(230,57,70,0.25)" stroke="${RED}" stroke-width="2"/>`);
  b.push(text(38, 357, "door: a rectangle object", { size: 12 }));
  b.push(`<circle cx="226" cy="352" r="5" fill="${GREEN}"/>`);
  b.push(text(236, 357, "entrance: a named point object", { size: 12 }));
  b.push(`<circle cx="446" cy="352" r="5" fill="${ORANGE}"/>`);
  b.push(text(456, 357, "where the game begins", { size: 12 }));
  await write("doors.svg", svg(800, 372, b, tilesetDefs(["dungeon"])));
}

await tiledWindow();
await tiledDialogs();
await tileProperties();
await tmjStructure();
await gids();
await namesMatch();
await tiledObjects();
await doors();
