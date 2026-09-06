import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { UNIT_CLASSES } from "../../game/classes";
import { STEP, tileAt } from "../../game/logic";
import { actions, useGame } from "../../game/store";
import type { Unit } from "../../game/types";

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

export function UnitPiece({ unit, ox, oz }: { unit: Unit; ox: number; oz: number }) {
  const s = useGame();
  const cls = UNIT_CLASSES[unit.cls]!;
  const model = s.models.find((m) => m.id === unit.modelId);
  const obj = useObjModel(model?.url, model?.textureUrl);
  const y = (tileAt(s, unit.x, unit.y)?.height ?? 0) * STEP;
  const selected = s.selectedUnitId === unit.id;
  const color = unit.team === "blue" ? "#41d6ff" : "#ff4d5e";

  const cloned = useMemo(() => (obj ? obj.clone(true) : null), [obj]);

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
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[0.5, 0.9, 0.5]} />
          <meshBasicMaterial color={color} wireframe />
        </mesh>
      )}

      {/* base ring */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.33, 0.44, 4]} />
        <meshBasicMaterial color={color} transparent opacity={selected ? 1 : 0.45} />
      </mesh>

      {/* hp bar */}
      <group position={[0, 1.15, 0]}>
        <mesh>
          <planeGeometry args={[0.6, 0.07]} />
          <meshBasicMaterial color="#101820" />
        </mesh>
        <mesh position={[(-0.6 * (1 - unit.hp / cls.hp)) / 2, 0, 0.001]}>
          <planeGeometry args={[0.6 * (unit.hp / cls.hp), 0.07]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </group>
    </group>
  );
}
