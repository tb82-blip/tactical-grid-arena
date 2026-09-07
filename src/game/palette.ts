export const TABLETOP_COLORS = {
  black: "#050208",
  charcoal: "#120a1c",
  lavender: "#c9b6ff",
  navy: "#4b2f9e",
  teal: "#2bf5d8",
  sage: "#8fe3c0",
  coral: "#ff4d8d",
} as const;

/** Per-team neon glow, used for selection rings, hp bars, and trim lighting. */
export const TEAM_GLOW = {
  blue: "#00e5ff",
  red: "#ff2f6e",
} as const;

/** Fallback accent pool for classes that don't specify their own glowColor. */
export const NEON_ACCENTS = [
  "#39ff14", // acid green
  "#ff2fd4", // hot magenta
  "#00e5ff", // electric cyan
  "#ffd400", // signal yellow
  "#ff6a00", // blaze orange
  "#a742ff", // ultraviolet
] as const;

export const TABLETOP_SCALE = {
  tileMeters: 1,
  elevationStepMeters: 0.25,
} as const;
