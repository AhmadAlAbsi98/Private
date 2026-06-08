import { Html } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useRef, useState } from 'react'
import {
  AdditiveBlending,
  type Group,
  type Mesh,
  type MeshStandardMaterial,
} from 'three'
import type { Peak } from '../data/peaks'
import { useStore } from '../store/useStore'

const MARKER_COLOR = '#cfe6ff'

interface Props {
  peak: Peak
  position: [number, number, number]
  // Per-marker phase offset so the field of beacons pulses organically.
  phase: number
}

// A glowing beacon sitting just above the globe surface: a bright emissive
// core wrapped in an additive halo, both softly pulsing. On hover it brightens
// and scales up and shows a floating label; clicking selects the peak.
export function PeakMarker({ peak, position, phase }: Props) {
  const group = useRef<Group>(null)
  const scaler = useRef<Group>(null)
  const coreMat = useRef<MeshStandardMaterial>(null)
  const halo = useRef<Mesh>(null)
  const haloMat = useRef<MeshStandardMaterial>(null)
  const scale = useRef(1)

  const [hovered, setHovered] = useState(false)

  const setHover = useStore((s) => s.setHovered)
  const setSelectedPeak = useStore((s) => s.setSelectedPeak)

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const pulse = 0.5 + 0.5 * Math.sin(t * 1.5 + phase)

    const boost = hovered ? 3.5 : 0
    if (coreMat.current) coreMat.current.emissiveIntensity = 2 + pulse * 2.5 + boost
    if (halo.current) halo.current.scale.setScalar(1 + pulse * 0.6)
    if (haloMat.current) haloMat.current.opacity = 0.15 + pulse * 0.3

    // Eased scale-up on hover — nothing snaps.
    const target = hovered ? 1.9 : 1
    scale.current += (target - scale.current) * (1 - Math.pow(0.001, delta))
    if (scaler.current) scaler.current.scale.setScalar(scale.current)
  })

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(true)
    setHover(peak.id, group.current)
    document.body.style.cursor = 'pointer'
  }

  const onOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(false)
    setHover(null, null)
    document.body.style.cursor = 'auto'
  }

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    setSelectedPeak(peak.id)
    console.log('[14 Peaks] selected peak:', peak.name, `${peak.height} m`)

    // Clear hover so the label/parallax don't fight the flight.
    setHovered(false)
    setHover(null, null)
    document.body.style.cursor = 'auto'

    // Dive toward the peak detail stage. The terrain is rendered at the origin
    // in detail mode, so we frame that massif from a fixed 3/4 angle and let
    // the rig's detail-mode orbit take over once we settle.
    useStore.getState().flyTo?.({
      position: [3.0, 1.9, 3.8],
      lookAt: [0, 0.95, 0],
      settle: 'detail',
    })
  }

  return (
    <group ref={group} position={position}>
      <group ref={scaler}>
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

      {/* Generous invisible hit area so the tiny beacon is easy to hover. */}
      <mesh onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {hovered && (
        <Html center distanceFactor={8} position={[0, 0.16, 0]} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              transform: 'translateY(-50%)',
              whiteSpace: 'nowrap',
              padding: '4px 9px',
              borderRadius: 6,
              fontSize: 13,
              letterSpacing: '0.02em',
              color: '#eaf2ff',
              background: 'rgba(10, 16, 28, 0.6)',
              border: '1px solid rgba(159, 196, 255, 0.25)',
              backdropFilter: 'blur(6px)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.45)',
            }}
          >
            <span style={{ fontWeight: 600 }}>{peak.name}</span>
            <span style={{ opacity: 0.7 }}>
              {'  '}
              {peak.height.toLocaleString()} m
            </span>
          </div>
        </Html>
      )}
    </group>
  )
}
