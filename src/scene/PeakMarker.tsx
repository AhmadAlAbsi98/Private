import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { AdditiveBlending, type Mesh, type MeshStandardMaterial } from 'three'

const MARKER_COLOR = '#cfe6ff'

interface Props {
  position: [number, number, number]
  // Per-marker phase offset so the field of beacons pulses organically.
  phase: number
}

// A glowing beacon sitting just above the globe surface: a bright emissive
// core wrapped in an additive halo, both softly pulsing. Emissive is left
// untonemapped so it reliably crosses the bloom threshold.
export function PeakMarker({ position, phase }: Props) {
  const coreMat = useRef<MeshStandardMaterial>(null)
  const halo = useRef<Mesh>(null)
  const haloMat = useRef<MeshStandardMaterial>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const pulse = 0.5 + 0.5 * Math.sin(t * 1.5 + phase)

    if (coreMat.current) coreMat.current.emissiveIntensity = 2.0 + pulse * 2.5
    if (halo.current) halo.current.scale.setScalar(1 + pulse * 0.6)
    if (haloMat.current) haloMat.current.opacity = 0.15 + pulse * 0.3
  })

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.022, 16, 16]} />
        <meshStandardMaterial
          ref={coreMat}
          color={MARKER_COLOR}
          emissive={MARKER_COLOR}
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={halo}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial
          ref={haloMat}
          color={MARKER_COLOR}
          emissive={MARKER_COLOR}
          emissiveIntensity={2}
          transparent
          opacity={0.3}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
