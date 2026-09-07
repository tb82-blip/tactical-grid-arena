import { Grid } from "@react-three/drei";
import { Board } from "./Board";
import { UnitPiece } from "./UnitPiece";
import { useGame } from "../../game/store";
import { TABLETOP_COLORS } from "../../game/palette";

export function Scene() {
  const s = useGame();
  const ox = -s.width / 2 + 0.5;
  const oz = -s.height / 2 + 0.5;

  return (
    <group>
      <Grid
        args={[40, 40]}
        cellSize={1}
        cellColor={TABLETOP_COLORS.navy}
        sectionSize={5}
        sectionColor={TABLETOP_COLORS.lavender}
        fadeDistance={45}
        infiniteGrid
        position={[0, -0.01, 0]}
      />
      <Board />
      {s.units.map((u) => (
        <UnitPiece key={u.id} unit={u} ox={ox} oz={oz} />
      ))}
      <ambientLight intensity={0.8} color={TABLETOP_COLORS.sage} />
    </group>
  );
}
