import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { CanvasTexture, type Group, SRGBColorSpace } from 'three'
import { PEAKS } from '../data/peaks'
import { latLngToVector3 } from '../utils/coords'
import { Atmosphere } from './Atmosphere'
import { PeakMarker } from './PeakMarker'

const GLOBE_RADIUS = 2
const MARKER_OFFSET = 1.01 // sit beacons fractionally above the surface

// Stylized dark surface: soft mottling + pole darkening drawn to a canvas.
// Deliberately not photorealistic — just enough variation to read as a
// textured sphere under the cinematic lighting.
function makeGlobeTexture(): CanvasTexture {
  const w = 1024
  const h = 512
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#0b1320'
  ctx.fillRect(0, 0, w, h)

  for (let i = 0; i < 800; i++) {
    const x = Math.random() * w
    const y = Math.random() * h
    const r = 8 + Math.random() * 46
    const lighter = Math.random() > 0.5
    const rgb = lighter ? '26,40,64' : '5,9,16'
    const a = 0.03 + Math.random() * 0.06
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, `rgba(${rgb},${a})`)
    g.addColorStop(1, `rgba(${rgb},0)`)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  const poles = ctx.createLinearGradient(0, 0, 0, h)
  poles.addColorStop(0, 'rgba(0,0,0,0.4)')
  poles.addColorStop(0.5, 'rgba(0,0,0,0)')
  poles.addColorStop(1, 'rgba(0,0,0,0.4)')
  ctx.fillStyle = poles
  ctx.fillRect(0, 0, w, h)

  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

export function Globe() {
  const spin = useRef<Group>(null)
  const texture = useMemo(() => makeGlobeTexture(), [])

  // Stable phase offsets for the marker pulses.
  const markers = useMemo(
    () =>
      PEAKS.map((peak, i) => ({
        peak,
        position: latLngToVector3(
          peak.lat,
          peak.lng,
          GLOBE_RADIUS * MARKER_OFFSET,
        ).toArray() as [number, number, number],
        phase: (i / PEAKS.length) * Math.PI * 2,
      })),
    [],
  )

  // Slow idle auto-rotation — no interactions yet, so the globe always drifts.
  useFrame((_, delta) => {
    if (spin.current) spin.current.rotation.y += delta * 0.05
  })

  return (
    // Slight axial tilt for a more dynamic, cinematic composition.
    <group rotation={[0.2, 0, 0.08]}>
      <group ref={spin}>
        <mesh>
          <sphereGeometry args={[GLOBE_RADIUS, 96, 96]} />
          <meshStandardMaterial
            map={texture}
            color="#9fb2cc"
            metalness={0.15}
            roughness={0.82}
            envMapIntensity={0.5}
          />
        </mesh>

        {markers.map((m) => (
          <PeakMarker key={m.peak.id} position={m.position} phase={m.phase} />
        ))}
      </group>

      <Atmosphere radius={GLOBE_RADIUS} />
    </group>
  )
}
