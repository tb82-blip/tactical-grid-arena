import { Grid, Sparkles } from "@react-three/drei";
import { Board } from "./Board";
import { UnitPiece } from "./UnitPiece";
import { useGame } from "../../game/store";
import { TABLETOP_COLORS, TEAM_GLOW } from "../../game/palette";

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
        sectionColor={TABLETOP_COLORS.teal}
        fadeDistance={45}
        infiniteGrid
        position={[0, -0.01, 0]}
      />

      {/* ambient drifting dust/motes over the arena, tinted per-team at the edges */}
      <Sparkles
        count={90}
        scale={[s.width + 6, 3.2, s.height + 6]}
        size={2.2}
        speed={0.25}
        opacity={0.55}
        color={TABLETOP_COLORS.teal}
        position={[0, 1.4, 0]}
      />
      <Sparkles
        count={26}
        scale={[3, 2.2, s.height + 4]}
        size={3}
        speed={0.4}
        opacity={0.5}
        color={TEAM_GLOW.blue}
        position={[ox - 2, 1.2, 0]}
      />
      <Sparkles
        count={26}
        scale={[3, 2.2, s.height + 4]}
        size={3}
        speed={0.4}
        opacity={0.5}
        color={TEAM_GLOW.red}
        position={[-ox + 2, 1.2, 0]}
      />

      <Board />
      {s.units.map((u) => (
        <UnitPiece key={u.id} unit={u} ox={ox} oz={oz} />
      ))}

      <ambientLight intensity={0.55} color={TABLETOP_COLORS.sage} />
      <pointLight position={[ox - 1, 5, oz - 1]} intensity={14} color={TEAM_GLOW.blue} distance={22} decay={2} />
      <pointLight position={[-ox + 1, 5, -oz + 1]} intensity={14} color={TEAM_GLOW.red} distance={22} decay={2} />
      <pointLight position={[0, 6, 0]} intensity={6} color={TABLETOP_COLORS.lavender} distance={30} decay={2} />
    </group>
  );
}
