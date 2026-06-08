import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { Suspense } from 'react'
import { ACESFilmicToneMapping } from 'three'
import { PEAKS } from '../data/peaks'
import { useStore } from '../store/useStore'
import { CameraRig } from './CameraRig'
import { Effects } from './Effects'
import { Globe } from './Globe'
import { PeakDetail } from './PeakDetail'

// Step 5: idle / flying renders the globe; detail mode renders the reusable
// peak detail scene (Everest is the only peak with camp data for now).
const DETAIL_PEAK = PEAKS.find((p) => p.id === 'everest')!

export function Experience() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{
        antialias: true,
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      camera={{ position: [0, 1.8, 7], fov: 45, near: 0.1, far: 100 }}
    >
      {/* Dark base colour and depth fog give every scene atmospheric haze. */}
      <color attach="background" args={['#05070b']} />
      <fog attach="fog" args={['#05070b', 6, 24]} />

      <Suspense fallback={null}>
        {/* Faint fill so silhouettes never read pure black. */}
        <ambientLight intensity={0.04} />

        {/* Key rim light — cold, low, cinematic. */}
        <directionalLight
          position={[5, 4, -6]}
          intensity={2.2}
          color="#9fc4ff"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />

        {/* Procedural HDR environment built from Lightformers — image-based
            lighting with no external asset download. */}
        <Environment resolution={256}>
          <color attach="background" args={['#05070b']} />
          <Lightformer
            form="rect"
            intensity={3}
            color="#bcd4ff"
            position={[0, 5, -9]}
            scale={[10, 6, 1]}
          />
          <Lightformer
            form="circle"
            intensity={1.2}
            color="#3a4a6b"
            position={[-8, 2, 4]}
            scale={[6, 6, 1]}
          />
          <Lightformer
            form="rect"
            intensity={0.6}
            color="#1a2030"
            position={[8, -2, 4]}
            scale={[8, 8, 1]}
          />
        </Environment>

        <SceneBody />
        <CameraRig />
        <Effects />
      </Suspense>
    </Canvas>
  )
}

function SceneBody() {
  const mode = useStore((s) => s.cameraMode)
  return mode === 'detail' ? <PeakDetail peak={DETAIL_PEAK} /> : <Globe />
}
