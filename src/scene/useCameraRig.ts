import { useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { Vector3 } from 'three'
import { useStore } from '../store/useStore'

export interface CameraTarget {
  position: [number, number, number]
  lookAt: [number, number, number]
  // Where the rig settles once the flight finishes. 'detail' triggers the
  // detail-scene fade; 'idle' hands control back to the cinematic drift.
  settle?: 'idle' | 'detail'
}

export type FlyTo = (target: CameraTarget) => gsap.core.Timeline

const BASE_RADIUS = 7
const BASE_HEIGHT = 1.8
const PARALLAX_SHIFT = 0.7
const PARALLAX_LOOK = 0.22
const FLIGHT_DURATION = 2.4
const BANK_ANGLE = 0.2

// The single shared camera rig. It SOLELY owns the camera: an idle cinematic
// drift (with hover parallax) plus a GSAP-driven flyTo for all navigation.
// flyTo is published to the store so every other part of the app routes its
// camera moves through this rig — nothing else should touch the camera.
export function useCameraRig() {
  const camera = useThree((s) => s.camera)
  const setFlyTo = useStore((s) => s.setFlyTo)
  const setCameraMode = useStore((s) => s.setCameraMode)

  const mode = useRef<'idle' | 'flying' | 'detail'>('idle')
  const lookAt = useRef(new Vector3(0, 0, 0))
  const desired = useRef(new Vector3())
  const markerPos = useRef(new Vector3())
  const blend = useRef(0)
  const timeline = useRef<gsap.core.Timeline | null>(null)

  // Mutable proxy that GSAP tweens; onUpdate pushes it onto the camera.
  const proxy = useRef({ px: 0, py: 0, pz: 0, tx: 0, ty: 0, tz: 0, roll: 0 })

  useFrame((_, delta) => {
    if (mode.current !== 'idle') return

    const t = performance.now() * 0.0001
    const ease = 1 - Math.pow(0.001, delta)

    desired.current.set(
      Math.sin(t) * BASE_RADIUS,
      BASE_HEIGHT + Math.sin(t * 0.6) * 0.6,
      Math.cos(t) * BASE_RADIUS,
    )
    lookAt.current.set(0, 0, 0)

    // Subtle parallax lean toward a hovered marker (tracks the rotating globe).
    const hovered = useStore.getState().hoveredObject
    const want = hovered ? 1 : 0
    blend.current += (want - blend.current) * ease
    if (hovered && blend.current > 0.001) {
      hovered.getWorldPosition(markerPos.current)
      desired.current.lerp(markerPos.current, PARALLAX_SHIFT * blend.current * 0.15)
      lookAt.current.lerp(markerPos.current, PARALLAX_LOOK * blend.current)
    }

    camera.position.lerp(desired.current, ease)
    camera.up.set(0, 1, 0)
    camera.lookAt(lookAt.current)
  })

  useEffect(() => {
    const flyTo: FlyTo = (target) => {
      timeline.current?.kill()
      mode.current = 'flying'
      setCameraMode('flying')

      const p = proxy.current
      p.px = camera.position.x
      p.py = camera.position.y
      p.pz = camera.position.z
      p.tx = lookAt.current.x
      p.ty = lookAt.current.y
      p.tz = lookAt.current.z
      p.roll = 0

      // Bank into the turn: sign from the horizontal change of view direction.
      const startDir = new Vector3().subVectors(lookAt.current, camera.position)
      const endDir = new Vector3()
        .fromArray(target.lookAt)
        .sub(new Vector3().fromArray(target.position))
      const turn = new Vector3().crossVectors(startDir, endDir).y
      const bank = BANK_ANGLE * (Math.sign(turn) || 1)

      const settle = target.settle ?? 'detail'
      const tl = gsap.timeline({
        onUpdate: () => {
          camera.position.set(p.px, p.py, p.pz)
          lookAt.current.set(p.tx, p.ty, p.tz)
          camera.up.set(0, 1, 0)
          camera.lookAt(lookAt.current)
          if (p.roll) camera.rotateZ(p.roll)
        },
        onComplete: () => {
          mode.current = settle
          setCameraMode(settle)
        },
      })

      // Ease-in-out with a slight overshoot for that inertial drone feel.
      tl.to(
        p,
        {
          px: target.position[0],
          py: target.position[1],
          pz: target.position[2],
          tx: target.lookAt[0],
          ty: target.lookAt[1],
          tz: target.lookAt[2],
          duration: FLIGHT_DURATION,
          ease: 'back.inOut(0.7)',
        },
        0,
      )
      // Roll builds through the first half of the turn and unwinds in the second.
      tl.to(p, { roll: bank, duration: FLIGHT_DURATION * 0.5, ease: 'sine.inOut' }, 0)
      tl.to(
        p,
        { roll: 0, duration: FLIGHT_DURATION * 0.5, ease: 'sine.inOut' },
        FLIGHT_DURATION * 0.5,
      )

      timeline.current = tl
      return tl
    }

    setFlyTo(flyTo)
    return () => {
      timeline.current?.kill()
      setFlyTo(null)
    }
  }, [camera, setCameraMode, setFlyTo])
}
