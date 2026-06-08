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

// Slow cinematic orbit + distance breathing once we're sitting in detail
// mode. The breathing intentionally varies camera distance so the terrain
// LOD swaps as we drift closer and further.
const DETAIL_ORBIT_RATE = 0.08
const DETAIL_BREATH_RATE = 0.5
const DETAIL_BREATH_AMOUNT = 0.9

// The single shared camera rig. It SOLELY owns the camera: an idle cinematic
// drift (with hover parallax), a GSAP-driven flyTo for all navigation, and a
// gentle detail-mode orbit once a flight settles. flyTo is published to the
// store so every other part of the app routes its camera moves through this
// rig — nothing else should touch the camera.
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

  // Captured at the end of a flight that settles into 'detail' — defines the
  // orbit we then float around the focused subject.
  const detail = useRef({
    center: new Vector3(),
    radius: 0,
    height: 0,
    angle0: 0,
    t0: 0,
  })

  // Mutable proxy that GSAP tweens; onUpdate pushes it onto the camera.
  const proxy = useRef({ px: 0, py: 0, pz: 0, tx: 0, ty: 0, tz: 0, roll: 0 })

  useFrame((_, delta) => {
    const ease = 1 - Math.pow(0.001, delta)

    if (mode.current === 'idle') {
      const t = performance.now() * 0.0001
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
      return
    }

    if (mode.current === 'detail') {
      const d = detail.current
      const el = (performance.now() - d.t0) / 1000
      const angle = d.angle0 + el * DETAIL_ORBIT_RATE
      const radius = d.radius + Math.sin(el * DETAIL_BREATH_RATE) * DETAIL_BREATH_AMOUNT
      desired.current.set(
        d.center.x + Math.sin(angle) * radius,
        d.center.y + d.height,
        d.center.z + Math.cos(angle) * radius,
      )
      lookAt.current.copy(d.center)
      camera.position.lerp(desired.current, ease)
      camera.up.set(0, 1, 0)
      camera.lookAt(lookAt.current)
    }
    // 'flying': GSAP drives the camera via onUpdate; nothing here.
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
          if (settle === 'detail') {
            // Capture the orbit we'll then drift around for the detail scene.
            const d = detail.current
            d.center.fromArray(target.lookAt)
            const offX = target.position[0] - target.lookAt[0]
            const offY = target.position[1] - target.lookAt[1]
            const offZ = target.position[2] - target.lookAt[2]
            d.radius = Math.hypot(offX, offZ)
            d.height = offY
            d.angle0 = Math.atan2(offX, offZ)
            d.t0 = performance.now()
          }
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
