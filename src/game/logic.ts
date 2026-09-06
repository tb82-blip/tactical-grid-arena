import { UNIT_CLASSES } from "./classes";
import type { GameState, Tile, Unit } from "./types";

export const TILE_SIZE = 1;
export const STEP = 0.25; // world units per height step

export const idx = (w: number, x: number, y: number) => y * w + x;

export function tileAt(s: GameState, x: number, y: number): Tile | undefined {
  if (x < 0 || y < 0 || x >= s.width || y >= s.height) return undefined;
  return s.tiles[idx(s.width, x, y)];
}

export function unitAt(s: GameState, x: number, y: number): Unit | undefined {
  return s.units.find((u) => u.x === x && u.y === y);
}

export function surfaceY(t: Tile | undefined): number {
  if (!t) return 0;
  return t.height * STEP;
}

export function generateMap(width: number, height: number): Tile[] {
  const tiles: Tile[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const river = x >= 5 && x <= 6 && y > 1 && y < height - 1;
      const ridge = y >= 8 && x >= 9;
      tiles.push({
        type: river ? "water" : "land",
        height: river ? 0 : ridge ? 2 : x > 7 ? 1 : 0,
      });
    }
  }
  return tiles;
}

function passable(s: GameState, u: Unit, from: Tile, x: number, y: number): boolean {
  const t = tileAt(s, x, y);
  if (!t || t.type === "void") return false;
  const cls = UNIT_CLASSES[u.cls]!;
  if (t.type === "water" && !cls.aquatic) return false;
  if (Math.abs(t.height - from.height) > cls.jump) return false;
  const occupant = unitAt(s, x, y);
  if (occupant && occupant.id !== u.id && occupant.team !== u.team) return false;
  return true;
}

/** FFT-style breadth-first movement range, respecting jump height and terrain. */
export function movementRange(s: GameState, u: Unit): Set<string> {
  const start = tileAt(s, u.x, u.y);
  if (!start) return new Set();
  const cls = UNIT_CLASSES[u.cls]!;
  const seen = new Map<string, number>([[`${u.x},${u.y}`, 0]]);
  const queue: Array<{ x: number; y: number; cost: number }> = [{ x: u.x, y: u.y, cost: 0 }];
  while (queue.length) {
    const cur = queue.shift()!;
    if (cur.cost >= cls.move) continue;
    const from = tileAt(s, cur.x, cur.y)!;
    const dirs: Array<[number, number]> = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    for (const [dx, dy] of dirs) {
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      const key = `${nx},${ny}`;
      const next = cur.cost + 1;
      if (seen.has(key) && seen.get(key)! <= next) continue;
      if (!passable(s, u, from, nx, ny)) continue;
      seen.set(key, next);
      queue.push({ x: nx, y: ny, cost: next });
    }
  }
  const out = new Set<string>();
  for (const [key] of seen) {
    const [x, y] = key.split(",").map(Number) as [number, number];
    const occupant = unitAt(s, x, y);
    if (occupant && occupant.id !== u.id) continue;
    out.add(key);
  }
  return out;
}

/** Diamond attack range (min..max Manhattan distance). */
export function attackRange(s: GameState, u: Unit): Set<string> {
  const cls = UNIT_CLASSES[u.cls]!;
  const out = new Set<string>();
  for (let dy = -cls.attackMax; dy <= cls.attackMax; dy++) {
    for (let dx = -cls.attackMax; dx <= cls.attackMax; dx++) {
      const d = Math.abs(dx) + Math.abs(dy);
      if (d < cls.attackMin || d > cls.attackMax) continue;
      const x = u.x + dx;
      const y = u.y + dy;
      const t = tileAt(s, x, y);
      if (!t || t.type === "void") continue;
      out.add(`${x},${y}`);
    }
  }
  return out;
}

export function damage(attacker: Unit, target: Unit, s: GameState): number {
  const a = tileAt(s, attacker.x, attacker.y);
  const t = tileAt(s, target.x, target.y);
  const highGround = (a?.height ?? 0) > (t?.height ?? 0) ? 3 : 0;
  const base = UNIT_CLASSES[attacker.cls]!.attackMax > 1 ? 7 : 10;
  return base + highGround;
}
