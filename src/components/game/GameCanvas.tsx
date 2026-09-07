import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { XR, createXRStore } from "@react-three/xr";
import { Scene } from "./Scene";
import { HUD } from "./HUD";
import { OneHandControls } from "./OneHandControls";
import { TABLETOP_COLORS } from "../../game/palette";

const xrStore = createXRStore();

export function GameCanvas() {
  return (
    <div className="fixed inset-0 bg-background">
      <Canvas flat dpr={[1, 1.5]} camera={{ position: [10, 12, 14], fov: 50 }}>
        <color attach="background" args={[TABLETOP_COLORS.black]} />
        <fog attach="fog" args={[TABLETOP_COLORS.black, 30, 70]} />
        <XR store={xrStore}>
          <OneHandControls />
          <Scene />
        </XR>
        <OrbitControls makeDefault target={[0, 0, 0]} maxPolarAngle={Math.PI / 2.1} />
      </Canvas>
      <HUD onEnterVR={() => xrStore.enterVR()} />
    </div>
  );
}

