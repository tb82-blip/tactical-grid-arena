import { useSyncExternalStore } from "react";
import { UNIT_CLASSES } from "./classes";
import { generateMap, idx, movementRange, attackRange, damage, tileAt, unitAt } from "./logic";
import type { GameState, ImportedModel, Mode, TileType, Unit } from "./types";

const W = 12;
const H = 12;

function makeUnit(id: string, name: string, team: Unit["team"], cls: string, x: number, y: number): Unit {
  return { id, name, team, cls, x, y, hp: UNIT_CLASSES[cls]!.hp };
}

function initial(): GameState {
  return {
    width: W,
    height: H,
    tiles: generateMap(W, H),
    units: [
      makeUnit("u1", "Ramza", "blue", "knight", 1, 2),
      makeUnit("u2", "Agrias", "blue", "archer", 2, 5),
      makeUnit("u3", "Mustadio", "blue", "scout", 1, 8),
      makeUnit("u4", "Gaffgarion", "red", "knight", 10, 9),
      makeUnit("u5", "Elmdore", "red", "mage", 9, 4),
    ],
    selectedUnitId: null,
    hoverTile: null,
    mode: "select",
    models: [],
    paint: null,
    log: ["Engine ready. Select a piece."],
  };
}

let state: GameState = initial();
const listeners = new Set<() => void>();

function set(patch: Partial<GameState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

const snapshot = () => state;

export function useGame(): GameState {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

export const getState = () => state;

function log(line: string) {
  set({ log: [line, ...state.log].slice(0, 8) });
}

export const actions = {
  reset() {
    state = initial();
    listeners.forEach((l) => l());
  },
  setMode(mode: Mode) {
    set({ mode });
  },
  setPaint(paint: TileType | null) {
    set({ paint, selectedUnitId: paint ? null : state.selectedUnitId });
  },
  hover(x: number | null, y?: number) {
    set({ hoverTile: x === null ? null : { x, y: y! } });
  },
  select(id: string | null) {
    set({ selectedUnitId: id, mode: id ? "move" : "select" });
  },
  assignModel(unitId: string, modelId: string | undefined) {
    set({
      units: state.units.map((u) => (u.id === unitId ? { ...u, modelId } : u)),
    });
  },
  addModel(model: ImportedModel) {
    set({ models: [...state.models, model] });
    log(`Imported model "${model.name}".`);
  },
  raiseTile(x: number, y: number, delta: number) {
    const tiles = state.tiles.slice();
    const t = tiles[idx(state.width, x, y)]!;
    tiles[idx(state.width, x, y)] = { ...t, height: Math.max(0, Math.min(8, t.height + delta)) };
    set({ tiles });
  },
  tileClick(x: number, y: number) {
    const s = state;

    if (s.paint) {
      const tiles = s.tiles.slice();
      const t = tiles[idx(s.width, x, y)]!;
      tiles[idx(s.width, x, y)] = { ...t, type: s.paint };
      set({ tiles });
      return;
    }

    const target = unitAt(s, x, y);
    const selected = s.units.find((u) => u.id === s.selectedUnitId);

    if (!selected) {
      if (target) actions.select(target.id);
      return;
    }

    if (s.mode === "attack") {
      if (attackRange(s, selected).has(`${x},${y}`) && target && target.id !== selected.id) {
        const dmg = damage(selected, target, s);
        const hp = Math.max(0, target.hp - dmg);
        set({
          units: s.units
            .map((u) => (u.id === target.id ? { ...u, hp } : u))
            .filter((u) => u.hp > 0),
        });
        log(`${selected.name} hits ${target.name} for ${dmg}${hp === 0 ? " — KO" : ""}.`);
        return;
      }
      if (target) actions.select(target.id);
      return;
    }

    // move mode
    if (target && target.id !== selected.id) {
      actions.select(target.id);
      return;
    }
    if (movementRange(s, selected).has(`${x},${y}`)) {
      set({
        units: s.units.map((u) => (u.id === selected.id ? { ...u, x, y } : u)),
        mode: "attack",
      });
      const t = tileAt(state, x, y);
      log(`${selected.name} moves to ${x},${y} (${t?.type}, h${t?.height}).`);
    }
  },
};
