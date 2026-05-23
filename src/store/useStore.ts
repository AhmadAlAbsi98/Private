import { create } from 'zustand'

// Shared experience state. Step 1 only needs camera state; selectedPeak /
// selectedCamp are stubbed here so later build steps can extend the store
// without restructuring the camera rig.
export interface ExperienceState {
  selectedPeak: string | null
  selectedCamp: string | null
  // Where the shared camera rig should look. Future fly-to transitions
  // animate toward this target via GSAP.
  cameraTarget: [number, number, number]

  setSelectedPeak: (id: string | null) => void
  setSelectedCamp: (id: string | null) => void
  setCameraTarget: (target: [number, number, number]) => void
}

export const useStore = create<ExperienceState>((set) => ({
  selectedPeak: null,
  selectedCamp: null,
  cameraTarget: [0, 0, 0],

  setSelectedPeak: (selectedPeak) => set({ selectedPeak }),
  setSelectedCamp: (selectedCamp) => set({ selectedCamp }),
  setCameraTarget: (cameraTarget) => set({ cameraTarget }),
}))
