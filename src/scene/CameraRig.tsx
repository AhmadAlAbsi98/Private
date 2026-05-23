import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { Vector3 } from 'three'
import { useStore } from '../store/useStore'

// The single shared camera rig. Later build steps animate its position and
// target with GSAP timelines (fly-to, camp-to-camp). For now it performs a
// slow cinematic idle drift, eases toward the store's cameraTarget, and adds a
// small parallax nudge toward the hovered peak marker.
const BASE_RADIUS = 7
const BASE_HEIGHT = 1.8
const PARALLAX_SHIFT = 0.7 // how far the camera leans toward a hovered marker
const PARALLAX_LOOK = 0.22 // how much the framing biases toward it

export function CameraRig() {
  const camera = useThree((s) => s.camera)
  const target = useStore((s) => s.cameraTarget)

  const lookAt = useRef(new Vector3())
  const desired = useRef(new Vector3())
  const markerPos = useRef(new Vector3())
  const blend = useRef(0) // eased 0..1 hover amount

  useFrame((_, delta) => {
    const t = performance.now() * 0.0001
    const ease = 1 - Math.pow(0.001, delta)

    // Slow orbital drift with a gentle vertical bob — nothing snaps.
    desired.current.set(
      Math.sin(t) * BASE_RADIUS,
      BASE_HEIGHT + Math.sin(t * 0.6) * 0.6,
      Math.cos(t) * BASE_RADIUS,
    )

    lookAt.current.set(target[0], target[1], target[2])

    // Read hover non-reactively; the marker rotates with the globe, so grab
    // its live world position each frame.
    const hovered = useStore.getState().hoveredObject
    const want = hovered ? 1 : 0
    blend.current += (want - blend.current) * ease

    if (hovered && blend.current > 0.001) {
      hovered.getWorldPosition(markerPos.current)
      const amt = blend.current
      // Lean the camera slightly toward the marker.
      desired.current.lerp(markerPos.current, PARALLAX_SHIFT * amt * 0.15)
      // And bias the look target toward it for a gentle reframe.
      lookAt.current.lerp(markerPos.current, PARALLAX_LOOK * amt)
    }

    // Inertial easing toward the desired position (frame-rate independent).
    camera.position.lerp(desired.current, ease)
    camera.lookAt(lookAt.current)
  })

  return null
}
