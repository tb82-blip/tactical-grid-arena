export type TileType = "land" | "water" | "void";

export interface Tile {
  type: TileType;
  /** voxel steps of elevation */
  height: number;
}

export type Team = "blue" | "red";

export interface UnitClass {
  key: string;
  label: string;
  move: number;
  jump: number;
  attackMin: number;
  attackMax: number;
  hp: number;
  /** can traverse water tiles */
  aquatic: boolean;
}

export interface Unit {
  id: string;
  name: string;
  team: Team;
  cls: string;
  x: number;
  y: number;
  hp: number;
  /** id of an imported .obj model, if any */
  modelId?: string | undefined;
}

export interface ImportedModel {
  id: string;
  name: string;
  /** object URL of the .obj file */
  url: string;
  /** object URL of an optional pixel texture */
  textureUrl?: string | undefined;
}

export type Mode = "select" | "move" | "attack";

export interface GameState {
  width: number;
  height: number;
  tiles: Tile[];
  units: Unit[];
  selectedUnitId: string | null;
  hoverTile: { x: number; y: number } | null;
  mode: Mode;
  models: ImportedModel[];
  /** tile painting tool, null = not painting */
  paint: TileType | null;
  log: string[];
}
