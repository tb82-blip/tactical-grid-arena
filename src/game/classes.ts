import type { UnitClass } from "./types";

export const UNIT_CLASSES: Record<string, UnitClass> = {
  knight: {
    key: "knight",
    label: "Knight",
    move: 4,
    jump: 1,
    attackMin: 1,
    attackMax: 1,
    hp: 40,
    aquatic: false,
  },
  archer: {
    key: "archer",
    label: "Archer",
    move: 3,
    jump: 2,
    attackMin: 2,
    attackMax: 4,
    hp: 28,
    aquatic: false,
  },
  mage: {
    key: "mage",
    label: "Mage",
    move: 3,
    jump: 1,
    attackMin: 1,
    attackMax: 3,
    hp: 22,
    aquatic: false,
  },
  scout: {
    key: "scout",
    label: "Scout",
    move: 6,
    jump: 3,
    attackMin: 1,
    attackMax: 1,
    hp: 24,
    aquatic: true,
  },
};

export const CLASS_KEYS = Object.keys(UNIT_CLASSES);
