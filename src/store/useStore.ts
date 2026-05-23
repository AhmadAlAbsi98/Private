import { create } from 'zustand'
import type { Object3D } from 'three'
import type { FlyTo } from '../scene/useCameraRig'

export type CameraMode = 'idle' | 'flying' | 'detail'

// Shared experience state. selectedPeak / selectedCamp are extended by later
// build steps; hover state drives the marker visuals and camera parallax;
// cameraMode + flyTo route all navigation through the shared camera rig.
export interface ExperienceState {
  selectedPeak: string | null
  selectedCamp: string | null

  hoveredPeak: string | null
  // The hovered marker's Object3D, used non-reactively by the camera rig to
  // read its live world position each frame (it rotates with the globe).
  hoveredObject: Object3D | null

  cameraMode: CameraMode
  // Published by the camera rig. Every camera move must go through this.
  flyTo: FlyTo | null

  setSelectedPeak: (id: string | null) => void
  setSelectedCamp: (id: string | null) => void
  setHovered: (id: string | null, object: Object3D | null) => void
  setCameraMode: (mode: CameraMode) => void
  setFlyTo: (flyTo: FlyTo | null) => void
}

export const useStore = create<ExperienceState>((set) => ({
  selectedPeak: null,
  selectedCamp: null,

  hoveredPeak: null,
  hoveredObject: null,

  cameraMode: 'idle',
  flyTo: null,

  setSelectedPeak: (selectedPeak) => set({ selectedPeak }),
  setSelectedCamp: (selectedCamp) => set({ selectedCamp }),
  setHovered: (hoveredPeak, hoveredObject) => set({ hoveredPeak, hoveredObject }),
  setCameraMode: (cameraMode) => set({ cameraMode }),
  setFlyTo: (flyTo) => set({ flyTo }),
}))
