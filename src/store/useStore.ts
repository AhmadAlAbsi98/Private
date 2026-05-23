import { create } from 'zustand'
import type { Object3D } from 'three'

// Shared experience state. selectedPeak / selectedCamp are extended by later
// build steps; hover state drives the marker visuals and the camera parallax.
export interface ExperienceState {
  selectedPeak: string | null
  selectedCamp: string | null

  hoveredPeak: string | null
  // The hovered marker's Object3D, used non-reactively by the camera rig to
  // read its live world position each frame (it rotates with the globe).
  hoveredObject: Object3D | null

  // Where the shared camera rig should look. Future fly-to transitions
  // animate toward this target via GSAP.
  cameraTarget: [number, number, number]

  setSelectedPeak: (id: string | null) => void
  setSelectedCamp: (id: string | null) => void
  setHovered: (id: string | null, object: Object3D | null) => void
  setCameraTarget: (target: [number, number, number]) => void
}

export const useStore = create<ExperienceState>((set) => ({
  selectedPeak: null,
  selectedCamp: null,

  hoveredPeak: null,
  hoveredObject: null,

  cameraTarget: [0, 0, 0],

  setSelectedPeak: (selectedPeak) => set({ selectedPeak }),
  setSelectedCamp: (selectedCamp) => set({ selectedCamp }),
  setHovered: (hoveredPeak, hoveredObject) => set({ hoveredPeak, hoveredObject }),
  setCameraTarget: (cameraTarget) => set({ cameraTarget }),
}))
