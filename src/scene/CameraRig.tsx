import { useCameraRig } from './useCameraRig'

// Mounts the shared camera rig inside the Canvas. All camera ownership and
// navigation lives in useCameraRig.
export function CameraRig() {
  useCameraRig()
  return null
}
