import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { UNIT_CLASSES } from "../../game/classes";
import { STEP, tileAt } from "../../game/logic";
import { actions, useGame } from "../../game/store";
import type { Unit } from "../../game/types";
import { TABLETOP_COLORS, TEAM_GLOW } from "../../game/palette";

function useObjModel(url?: string, textureUrl?: string) {
  const [obj, setObj] = useState<THREE.Group | null>(null);

  useEffect(() => {
    let alive = true;
    if (!url) {
      setObj(null);
      return;
    }
    new OBJLoader().load(url, (group) => {
      if (!alive) return;
      if (textureUrl) {
        const tex = new THREE.TextureLoader().load(textureUrl);
        tex.magFilter = THREE.NearestFilter;
        tex.minFilter = THREE.NearestFilter;
        tex.colorSpace = THREE.SRGBColorSpace;
        group.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshBasicMaterial({ map: tex });
          }
        });
      }
      // normalize to roughly one tile tall
      const box = new THREE.Box3().setFromObject(group);
      const size = new THREE.Vector3();
      box.getSize(size);
      const scale = 0.9 / Math.max(size.x, size.y, size.z || 1);
      group.scale.setScalar(scale);
      group.position.y = -box.min.y * scale;
      setObj(group);
    });
    return () => {
      alive = false;
    };
  }, [url, textureUrl]);

  return obj;
}

/** Pulsing selection ring — brighter/faster when actively selected. */
function SelectionRing({ color, selected }: { color: string; selected: boolean }) {
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (!mat.current) return;
    const t = clock.elapsedTime;
    mat.current.opacity = selected ? 0.75 + Math.sin(t * 6) * 0.25 : 0.4;
  });
  return (
    <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.34, 0.46, 4]} />
      <meshBasicMaterial ref={mat} color={color} transparent toneMapped={false} />
    </mesh>
  );
}

/** Brief particle burst that plays when a unit takes damage, then unmounts itself. */
function HitBurst({ color }: { color: string }) {
  const [alive, setAlive] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setAlive(false), 450);
    return () => clearTimeout(t);
  }, []);
  if (!alive) return null;
  return <Sparkles count={18} scale={0.9} size={5} speed={2.2} opacity={1} color={color} position={[0, 0.6, 0]} />;
}

export function UnitPiece({ unit, ox, oz }: { unit: Unit; ox: number; oz: number }) {
  const s = useGame();
  const cls = UNIT_CLASSES[unit.cls];
  const model = s.models.find((m) => m.id === unit.modelId);
  const obj = useObjModel(model?.url, model?.textureUrl);
  const cloned = useMemo(() => (obj ? obj.clone(true) : null), [obj]);

  const prevHp = useRef(unit.hp);
  const [hit, setHit] = useState(0);
  useEffect(() => {
    if (unit.hp < prevHp.current) setHit((n) => n + 1);
    prevHp.current = unit.hp;
  }, [unit.hp]);

  if (!cls) return null;

  const y = (tileAt(s, unit.x, unit.y)?.height ?? 0) * STEP;
  const selected = s.selectedUnitId === unit.id;
  const teamGlow = unit.team === "blue" ? TEAM_GLOW.blue : TEAM_GLOW.red;

  return (
    <group
      position={[ox + unit.x, y, oz + unit.y]}
      onClick={(e) => {
        e.stopPropagation();
        actions.tileClick(unit.x, unit.y);
      }}
    >
      {cloned ? (
        <primitive object={cloned} />
      ) : (
        <group position={[0, 0.45, 0]}>
          {/* glowing class-colored core */}
          <mesh scale={0.86}>
            <boxGeometry args={[0.62, 0.9, 0.62]} />
            <meshStandardMaterial
              color={cls.glowColor}
              emissive={cls.glowColor}
              emissiveIntensity={selected ? 2.6 : 1.4}
              toneMapped={false}
              transparent
              opacity={0.55}
            />
          </mesh>
          {/* team-colored wireframe shell */}
          <mesh>
            <boxGeometry args={[0.62, 0.9, 0.62]} />
            <meshBasicMaterial color={teamGlow} wireframe toneMapped={false} />
          </mesh>
        </group>
      )}

      {hit > 0 && <HitBurst key={hit} color={cls.glowColor} />}

      <SelectionRing color={teamGlow} selected={selected} />

      {/* hp bar */}
      <group position={[0, 1.15, 0]}>
        <mesh>
          <planeGeometry args={[0.6, 0.07]} />
          <meshBasicMaterial color={TABLETOP_COLORS.charcoal} />
        </mesh>
        <mesh position={[(-0.6 * (1 - unit.hp / cls.hp)) / 2, 0, 0.001]}>
          <planeGeometry args={[0.6 * (unit.hp / cls.hp), 0.07]} />
          <meshBasicMaterial color={cls.glowColor} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
