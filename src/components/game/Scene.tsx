import { Grid } from "@react-three/drei";
import { Board } from "./Board";
import { UnitPiece } from "./UnitPiece";
import { useGame } from "../../game/store";

export function Scene() {
  const s = useGame();
  const ox = -s.width / 2 + 0.5;
  const oz = -s.height / 2 + 0.5;

  return (
    <group>
      <Grid
        args={[40, 40]}
        cellSize={1}
        cellColor="#1f3b47"
        sectionSize={4}
        sectionColor="#2c6076"
        fadeDistance={45}
        infiniteGrid
        position={[0, -0.01, 0]}
      />
      <Board />
      {s.units.map((u) => (
        <UnitPiece key={u.id} unit={u} ox={ox} oz={oz} />
      ))}
      <ambientLight intensity={1} />
    </group>
  );
}
