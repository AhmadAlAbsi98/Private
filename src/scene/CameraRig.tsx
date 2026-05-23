import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { Vector3 } from 'three'
import { useStore } from '../store/useStore'

// The single shared camera rig. Later build steps animate its position and
// target with GSAP timelines (fly-to, camp-to-camp). For step 1 it performs a
// slow cinematic idle drift and always eases toward the store's cameraTarget.
const BASE_RADIUS = 7
const BASE_HEIGHT = 1.8

export function CameraRig() {
  const camera = useThree((s) => s.camera)
  const target = useStore((s) => s.cameraTarget)

  const lookAt = useRef(new Vector3())
  const desired = useRef(new Vector3())

  useFrame((_, delta) => {
    const t = performance.now() * 0.0001

    // Slow orbital drift with a gentle vertical bob — nothing snaps.
    desired.current.set(
      Math.sin(t) * BASE_RADIUS,
      BASE_HEIGHT + Math.sin(t * 0.6) * 0.6,
      Math.cos(t) * BASE_RADIUS,
    )

    // Inertial easing toward the desired position (frame-rate independent).
    const ease = 1 - Math.pow(0.001, delta)
    camera.position.lerp(desired.current, ease)

    lookAt.current.set(target[0], target[1], target[2])
    camera.lookAt(lookAt.current)
  })

  return null
}
