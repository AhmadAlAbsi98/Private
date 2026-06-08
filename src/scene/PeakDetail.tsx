import { Html, Line } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import {
  Color,
  DoubleSide,
  type Mesh,
  type MeshStandardMaterial,
  ShaderMaterial,
  Vector3,
} from 'three'
import type { Camp, Peak } from '../data/peaks'
import {
  buildTerrainGeometry,
  heightAt,
  PEAK_HEIGHT,
  seedFromId,
} from '../utils/terrain'

// Snow/rock blend driven by elevation and slope, with linear depth fog
// matched to the scene fog. We don't include three's lighting chunks — a
// single hand-rolled lambert against the scene key light keeps the shader
// stylized rather than photoreal.
const vertexShader = /* glsl */ `
  varying float vElevation;
  varying vec3 vNormalW;
  varying float vFogDepth;
  void main() {
    vElevation = position.y;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vFogDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform vec3 uSnow;
  uniform vec3 uRock;
  uniform vec3 uRockLow;
  uniform float uSnowLow;
  uniform float uSnowHigh;
  uniform vec3 uLightDir;
  uniform vec3 uFogColor;
  uniform float uFogNear;
  uniform float uFogFar;
  varying float vElevation;
  varying vec3 vNormalW;
  varying float vFogDepth;
  void main() {
    vec3 N = normalize(vNormalW);
    float slope = clamp(N.y, 0.0, 1.0); // 1 = flat, 0 = vertical
    vec3 rock = mix(uRockLow, uRock, smoothstep(0.0, uSnowHigh, vElevation));
    float snowElev = smoothstep(uSnowLow, uSnowHigh, vElevation);
    float snowSlope = smoothstep(0.42, 0.78, slope);
    float snow = snowElev * snowSlope;
    vec3 albedo = mix(rock, uSnow, snow);
    float diff = clamp(dot(N, normalize(uLightDir)), 0.0, 1.0);
    vec3 color = albedo * (0.22 + 0.9 * diff);
    color += uSnow * snow * 0.08;
    float fog = smoothstep(uFogNear, uFogFar, vFogDepth);
    color = mix(color, uFogColor, fog);
    gl_FragColor = vec4(color, 1.0);
  }
`

// Three LOD levels of the same massif. The active mesh is picked each frame
// from the camera distance, so terrain detail rises as we approach.
const LOD_SEGMENTS = [56, 120, 220]
// Distance thresholds (mid > dist > high).
const LOD_FAR = 6.4
const LOD_NEAR = 5.0

const TERRAIN_CENTER = new Vector3(0, PEAK_HEIGHT * 0.45, 0)

function makeMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader,
    fragmentShader,
    side: DoubleSide,
    uniforms: {
      uSnow: { value: new Color('#eef4ff') },
      uRock: { value: new Color('#454d5e') },
      uRockLow: { value: new Color('#21262f') },
      uSnowLow: { value: 1.05 },
      uSnowHigh: { value: 1.85 },
      uLightDir: { value: new Vector3(5, 4, -6).normalize() },
      uFogColor: { value: new Color('#05070b') },
      uFogNear: { value: 6 },
      uFogFar: { value: 24 },
    },
  })
}

function CampNode({
  position,
  name,
  phase,
}: {
  position: [number, number, number]
  name: string
  phase: number
}) {
  const mat = useRef<MeshStandardMaterial>(null)
  useFrame((state) => {
    const p = 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 1.8 + phase)
    if (mat.current) mat.current.emissiveIntensity = 2.2 + p * 2.2
  })
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial
          ref={mat}
          color="#ffd9a0"
          emissive="#ffd9a0"
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>
      <Html
        center
        distanceFactor={9}
        position={[0, 0.18, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            whiteSpace: 'nowrap',
            padding: '3px 7px',
            borderRadius: 5,
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#f3e6c8',
            background: 'rgba(8, 12, 20, 0.55)',
            border: '1px solid rgba(255, 217, 160, 0.22)',
            backdropFilter: 'blur(4px)',
          }}
        >
          {name}
        </div>
      </Html>
    </group>
  )
}

// The reusable peak detail scene: stylized procedural terrain coloured by a
// custom snow/rock GLSL shader, with the standard route's camps as glowing
// nodes connected by a single route line. Detail meshes are swapped by
// camera distance.
export function PeakDetail({ peak }: { peak: Peak }) {
  const seed = useMemo(() => seedFromId(peak.id), [peak.id])
  const geometries = useMemo(
    () => LOD_SEGMENTS.map((s) => buildTerrainGeometry(s, seed)),
    [seed],
  )
  const material = useMemo(() => makeMaterial(), [])
  const meshes = useRef<(Mesh | null)[]>([])
  const camera = useThree((s) => s.camera)

  useEffect(() => {
    return () => {
      geometries.forEach((g) => g.dispose())
      material.dispose()
    }
  }, [geometries, material])

  useFrame(() => {
    const d = camera.position.distanceTo(TERRAIN_CENTER)
    const active = d > LOD_FAR ? 0 : d > LOD_NEAR ? 1 : 2
    for (let i = 0; i < meshes.current.length; i++) {
      const m = meshes.current[i]
      if (m) m.visible = i === active
    }
  })

  const camps = useMemo<(Camp & { world: [number, number, number]; phase: number })[]>(
    () =>
      (peak.camps ?? []).map((c, i) => {
        const [x, , z] = c.position
        // Snap onto the live heightmap so nodes sit exactly on the surface.
        const y = heightAt(x, z, seed) + 0.05
        return { ...c, world: [x, y, z], phase: i * 0.9 }
      }),
    [peak.camps, seed],
  )

  const routePoints = useMemo(
    () =>
      camps.map(
        (c) => new Vector3(c.world[0], c.world[1] + 0.04, c.world[2]),
      ),
    [camps],
  )

  return (
    <group>
      {geometries.map((g, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshes.current[i] = el
          }}
          geometry={g}
          material={material}
          visible={i === 1}
          receiveShadow
        />
      ))}

      {routePoints.length > 1 && (
        <Line
          points={routePoints}
          color="#ffcf9a"
          lineWidth={2}
          transparent
          opacity={0.85}
          toneMapped={false}
        />
      )}

      {camps.map((c) => (
        <CampNode
          key={c.id}
          position={c.world}
          name={c.name}
          phase={c.phase}
        />
      ))}
    </group>
  )
}
