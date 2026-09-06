import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { XR, XROrigin, createXRStore } from "@react-three/xr";
import { Scene } from "./Scene";
import { HUD } from "./HUD";

const xrStore = createXRStore();

export function GameCanvas() {
  return (
    <div className="fixed inset-0 bg-background">
      <Canvas camera={{ position: [10, 12, 14], fov: 50 }}>
        <color attach="background" args={["#080d11"]} />
        <fog attach="fog" args={["#080d11", 30, 70]} />
        <XR store={xrStore}>
          <XROrigin position={[0, 0, 9]} />
          <Scene />
        </XR>
        <OrbitControls makeDefault target={[0, 0, 0]} maxPolarAngle={Math.PI / 2.1} />
      </Canvas>
      <HUD onEnterVR={() => xrStore.enterVR()} />
    </div>
  );
}
