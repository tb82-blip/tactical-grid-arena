import { useMemo } from "react";
import { Edges } from "@react-three/drei";
import { actions, useGame } from "../../game/store";
import { attackRange, movementRange, STEP } from "../../game/logic";

const COLORS: Record<string, string> = {
  land: "#1d2a33",
  water: "#0d2733",
  void: "#101010",
};

const WIRE: Record<string, string> = {
  land: "#4f7f8f",
  water: "#2f8fb5",
  void: "#333333",
};

export function Board() {
  const s = useGame();
  const selected = s.units.find((u) => u.id === s.selectedUnitId);

  const moveSet = useMemo(
    () => (selected && s.mode === "move" ? movementRange(s, selected) : new Set<string>()),
    [s, selected],
  );
  const attackSet = useMemo(
    () => (selected && s.mode === "attack" ? attackRange(s, selected) : new Set<string>()),
    [s, selected],
  );

  const ox = -s.width / 2 + 0.5;
  const oz = -s.height / 2 + 0.5;

  return (
    <group>
      {s.tiles.map((t, i) => {
        const x = i % s.width;
        const y = Math.floor(i / s.width);
        const key = `${x},${y}`;
        if (t.type === "void") return null;
        const h = Math.max(t.height, 1) * STEP;
        const top = t.height * STEP;
        const inMove = moveSet.has(key);
        const inAttack = attackSet.has(key);
        const hovered = s.hoverTile?.x === x && s.hoverTile?.y === y;

        return (
          <group key={key} position={[ox + x, 0, oz + y]}>
            <mesh
              position={[0, top - h / 2, 0]}
              onPointerOver={(e) => {
                e.stopPropagation();
                actions.hover(x, y);
              }}
              onPointerOut={() => actions.hover(null)}
              onClick={(e) => {
                e.stopPropagation();
                actions.tileClick(x, y);
              }}
            >
              <boxGeometry args={[0.98, h, 0.98]} />
              <meshBasicMaterial
                color={COLORS[t.type] ?? "#1d2a33"}
                transparent
                opacity={t.type === "water" ? 0.35 : 0.75}
              />
              <Edges threshold={15} color={WIRE[t.type] ?? "#4f7f8f"} />
            </mesh>

            {(inMove || inAttack || hovered) && (
              <mesh position={[0, top + 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.94, 0.94]} />
                <meshBasicMaterial
                  color={inAttack ? "#ff4d5e" : inMove ? "#41d6ff" : "#f5e663"}
                  transparent
                  opacity={hovered ? 0.5 : 0.28}
                  depthWrite={false}
                />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}
