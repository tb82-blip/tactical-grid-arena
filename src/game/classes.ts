import type { UnitClass } from "./types";
import { NEON_ACCENTS } from "./palette";

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
    glowColor: NEON_ACCENTS[4], // blaze orange
    blurb: "Balanced frontline brawler.",
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
    glowColor: NEON_ACCENTS[0], // acid green
    blurb: "Backline pressure, wide kill zone.",
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
    glowColor: NEON_ACCENTS[5], // ultraviolet
    blurb: "Fragile burst caster, arcs over obstacles.",
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
    glowColor: NEON_ACCENTS[2], // electric cyan
    blurb: "Fast amphibious skirmisher.",
  },
  guardian: {
    key: "guardian",
    label: "Guardian",
    move: 2,
    jump: 1,
    attackMin: 1,
    attackMax: 1,
    hp: 60,
    aquatic: false,
    glowColor: NEON_ACCENTS[3], // signal yellow
    blurb: "Slow-moving wall, absorbs hits.",
  },
  assassin: {
    key: "assassin",
    label: "Assassin",
    move: 7,
    jump: 2,
    attackMin: 1,
    attackMax: 1,
    hp: 16,
    aquatic: false,
    glowColor: NEON_ACCENTS[1], // hot magenta
    blurb: "Glass cannon, blistering mobility.",
  },
};

export const CLASS_KEYS = Object.keys(UNIT_CLASSES);
