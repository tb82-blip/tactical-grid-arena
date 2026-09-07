import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { XR, createXRStore } from "@react-three/xr";
import * as THREE from "three";
import { Scene } from "./Scene";
import { HUD } from "./HUD";
import { OneHandControls } from "./OneHandControls";
import { TABLETOP_COLORS } from "../../game/palette";

const xrStore = createXRStore();

export function GameCanvas() {
  return (
    <div className="fixed inset-0 bg-background">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [10, 12, 14], fov: 50 }}
        gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}
      >
        <color attach="background" args={[TABLETOP_COLORS.black]} />
        <fog attach="fog" args={[TABLETOP_COLORS.black, 26, 62]} />
        <XR store={xrStore}>
          <OneHandControls />
          <Scene />
        </XR>
        <OrbitControls makeDefault target={[0, 0, 0]} maxPolarAngle={Math.PI / 2.1} />
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur intensity={1.4} luminanceThreshold={0.15} luminanceSmoothing={0.3} radius={0.85} />
          <Vignette eskil={false} offset={0.15} darkness={0.6} />
        </EffectComposer>
      </Canvas>
      <HUD onEnterVR={() => xrStore.enterVR()} />
    </div>
  );
}
