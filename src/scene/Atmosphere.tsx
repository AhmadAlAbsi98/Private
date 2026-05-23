import { useMemo } from 'react'
import { AdditiveBlending, BackSide, Color } from 'three'

const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uPower;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    // Fresnel: brightest at the silhouette, fading toward the centre.
    float fres = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), uPower);
    gl_FragColor = vec4(uColor * uIntensity * fres, fres);
  }
`

// A slightly larger back-facing shell that glows at the rim, giving the globe
// an atmospheric halo. Additive + above the bloom threshold so postprocessing
// lifts it into a soft cinematic haze.
export function Atmosphere({ radius }: { radius: number }) {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new Color('#5b8bd6') },
      uIntensity: { value: 1.6 },
      uPower: { value: 3.0 },
    }),
    [],
  )

  return (
    <mesh scale={radius * 1.18}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        side={BackSide}
        blending={AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}
