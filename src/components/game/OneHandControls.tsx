import { useEffect, useRef, useState } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useXR, XROrigin } from "@react-three/xr";
import * as THREE from "three";
import { actions, useGame } from "../../game/store";
import type { TileType } from "../../game/types";

/**
 * Single-controller VR rig:
 * - thumbstick: push forward/back to dolly, left/right to snap-turn 45°
 * - squeeze (grip): hold and move your hand to drag the world
 * - A/X button: toggle a floating control panel (move/attack/paint/height)
 * - trigger: the controller laser already clicks tiles and pieces
 */

const STICK_DEADZONE = 0.25;
const SNAP_DEG = 45;
const MOVE_SPEED = 2.2;

function usePrimaryInputSource(): XRInputSource | null {
  const session = useXR((s) => s.session);
  const [source, setSource] = useState<XRInputSource | null>(null);
  useEffect(() => {
    if (!session) {
      setSource(null);
      return;
    }
    const pick = () => {
      for (const src of session.inputSources) {
        if (src.gamepad) {
          setSource(src);
          return;
        }
      }
      setSource(null);
    };
    pick();
    session.addEventListener("inputsourceschange", pick);
    return () => session.removeEventListener("inputsourceschange", pick);
  }, [session]);
  return source;
}

function PanelButton({
  label,
  active,
  position,
  onClick,
  width = 0.16,
}: {
  label: string;
  active?: boolean;
  position: [number, number, number];
  onClick: () => void;
  width?: number;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <group position={position}>
      <mesh
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[width, 0.05, 0.012]} />
        <meshBasicMaterial
          color={active ? "#41d6ff" : hovered ? "#3a5563" : "#16242c"}
          transparent
          opacity={active ? 0.9 : 0.85}
        />
      </mesh>
      {/* cheap blocky label: tiny canvas texture */}
      <Label text={label} active={active} width={width} />
    </group>
  );
}

function Label({ text, active, width }: { text: string; active?: boolean | undefined; width: number }) {
  const texture = useRef<THREE.CanvasTexture | null>(null);
  if (!texture.current) {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 64;
    texture.current = new THREE.CanvasTexture(c);
    texture.current.magFilter = THREE.NearestFilter;
  }
  const tex = texture.current;
  const prevKey = useRef("");
  const key = text + (active ? "1" : "0");
  if (prevKey.current !== key) {
    prevKey.current = key;
    const ctx = tex.image as HTMLCanvasElement;
    const g = ctx.getContext("2d")!;
    g.clearRect(0, 0, ctx.width, ctx.height);
    g.font = "bold 34px monospace";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = active ? "#062a35" : "#41d6ff";
    g.fillText(text.toUpperCase(), ctx.width / 2, ctx.height / 2);
    tex.needsUpdate = true;
  }
  return (
    <mesh position={[0, 0, 0.007]}>
      <planeGeometry args={[width * 0.92, (width * 0.92) / 4]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} />
    </mesh>
  );
}

function ControlPanel({ origin }: { origin: React.RefObject<THREE.Group | null> }) {
  const s = useGame();
  const camera = useThree((st) => st.camera);
  const group = useRef<THREE.Group>(null);
  const hover = s.hoverTile;

  useFrame(() => {
    // keep the panel floating below and in front of the face
    if (!group.current || !origin.current) return;
    const cam = camera;
    const forward = new THREE.Vector3(0, -0.25, -0.5).applyQuaternion(cam.quaternion);
    group.current.position.copy(cam.position).add(forward);
    group.current.quaternion.copy(cam.quaternion);
    // panel lives in world space; undo origin transform so it follows the user
    origin.current.worldToLocal(group.current.position);
  });

  return (
    <group ref={group}>
      <mesh position={[0, 0, -0.008]}>
        <planeGeometry args={[0.56, 0.34]} />
        <meshBasicMaterial color="#080d11" transparent opacity={0.75} />
      </mesh>
      <PanelButton label="move" active={s.mode === "move"} position={[-0.19, 0.12, 0]} onClick={() => actions.setMode("move")} />
      <PanelButton label="attack" active={s.mode === "attack"} position={[0, 0.12, 0]} onClick={() => actions.setMode("attack")} />
      <PanelButton label="reset" position={[0.19, 0.12, 0]} onClick={() => actions.reset()} />
      <PanelButton label="desel" position={[-0.19, 0.04, 0]} onClick={() => actions.select(null)} />
      {(["land", "water", "void"] as TileType[]).map((t, i) => (
        <PanelButton
          key={t}
          label={t}
          active={s.paint === t}
          position={[(i - 1) * 0.19, -0.04, 0]}
          onClick={() => actions.setPaint(s.paint === t ? null : t)}
        />
      ))}
      <PanelButton
        label="h+"
        width={0.16}
        position={[-0.095, -0.12, 0]}
        onClick={() => hover && actions.raiseTile(hover.x, hover.y, 1)}
      />
      <PanelButton
        label="h-"
        width={0.16}
        position={[0.095, -0.12, 0]}
        onClick={() => hover && actions.raiseTile(hover.x, hover.y, -1)}
      />
    </group>
  );
}

export function OneHandControls() {
  const origin = useRef<THREE.Group>(null);
  const source = usePrimaryInputSource();
  const session = useXR((s) => s.session);
  const [panelOpen, setPanelOpen] = useState(true);
  const panelRef = useRef(panelOpen);
  panelRef.current = panelOpen;

  const snapReady = useRef(true);
  const btnPrev = useRef(false);
  const dragPrev = useRef<THREE.Vector3 | null>(null);

  // grip-drag: track squeezestart/end on the session's controller
  useEffect(() => {
    if (!session) return;
    const onStart = () => {
      dragPrev.current = new THREE.Vector3();
    };
    const onEnd = () => {
      dragPrev.current = null;
    };
    session.addEventListener("squeezestart", onStart);
    session.addEventListener("squeezeend", onEnd);
    return () => {
      session.removeEventListener("squeezestart", onStart);
      session.removeEventListener("squeezeend", onEnd);
    };
  }, [session]);

  useFrame((state, rawDelta) => {
    const o = origin.current;
    if (!o) return;
    const dt = Math.min(rawDelta, 0.05);
    const pad = source?.gamepad;

    if (pad) {
      const ax = pad.axes[2] ?? 0;
      const ay = pad.axes[3] ?? 0;

      // snap turn
      if (Math.abs(ax) > 0.7 && snapReady.current) {
        snapReady.current = false;
        o.rotateY((-Math.sign(ax) * SNAP_DEG * Math.PI) / 180);
      } else if (Math.abs(ax) < STICK_DEADZONE) {
        snapReady.current = true;
      }

      // dolly along the direction the controller points (projected on floor)
      if (Math.abs(ay) > STICK_DEADZONE) {
        const ctrl = state.gl.xr.getController(0);
        const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(ctrl.getWorldQuaternion(new THREE.Quaternion()));
        dir.y = 0;
        if (dir.lengthSq() > 0.001) {
          dir.normalize();
          o.position.addScaledVector(dir, -ay * MOVE_SPEED * dt);
        }
      }

      // A/X (button 4) toggles the control panel
      const pressed = !!pad.buttons[4]?.pressed;
      if (pressed && !btnPrev.current) setPanelOpen(!panelRef.current);
      btnPrev.current = pressed;
    }

    // grip-drag the world with one hand
    if (dragPrev.current) {
      const ctrl = state.gl.xr.getController(0);
      const pos = ctrl.getWorldPosition(new THREE.Vector3());
      if (dragPrev.current.lengthSq() > 0) {
        const delta = dragPrev.current.clone().sub(pos);
        delta.y = 0;
        o.position.add(delta);
      }
      dragPrev.current.copy(pos);
    }
  });

  return (
    <>
      <XROrigin ref={origin} position={[0, 0, 9]} />
      {session && panelOpen && <ControlPanel origin={origin} />}
    </>
  );
}
