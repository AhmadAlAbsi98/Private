import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Mesh } from 'three'

// Placeholder for the globe/peaks to come. A faceted metallic form reads the
// HDR environment so the lighting setup is visible. Slowly rotates so the
// reflections move — deliberately temporary.
export function PlaceholderObject() {
  const ref = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation.y += delta * 0.12
    ref.current.rotation.x += delta * 0.04
  })

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <icosahedronGeometry args={[1.4, 0]} />
      <meshStandardMaterial
        color="#3a4150"
        metalness={0.9}
        roughness={0.25}
        envMapIntensity={1.2}
      />
    </mesh>
  )
}
