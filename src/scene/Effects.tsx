import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'

// Subtle HDR-style bloom + a soft vignette for the cinematic, premium feel.
// Bloom threshold is kept high so only genuine highlights glow — no washed-out
// haze across the whole frame.
export function Effects() {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.65}
        luminanceThreshold={0.85}
        luminanceSmoothing={0.25}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.25} darkness={0.85} />
    </EffectComposer>
  )
}
