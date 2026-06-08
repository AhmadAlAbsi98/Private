import { BufferGeometry, PlaneGeometry } from 'three'
import { fbm2D } from './noise'

// World footprint of the detail-scene massif. Coordinates run from
// (-SIZE/2, -SIZE/2) to (+SIZE/2, +SIZE/2) in the XZ plane; the summit sits
// near the origin at y ≈ PEAK_HEIGHT.
export const SIZE = 6
export const PEAK_HEIGHT = 2.2

const PEAK_SIGMA = 1.45
const RIDGE_FREQ = 0.6
const BASE_FREQ = 0.25

// Stylized "Everest-like" elevation: a central gaussian peak plus ridged fbm
// detail that strengthens near the summit, with low-frequency foothills.
export function heightAt(x: number, z: number, seed = 0): number {
  const r2 = x * x + z * z
  const mountain = Math.exp(-r2 / (2 * PEAK_SIGMA * PEAK_SIGMA)) * PEAK_HEIGHT

  const n = fbm2D(x * RIDGE_FREQ + 10, z * RIDGE_FREQ + 10, seed, 5)
  const ridges = 1 - Math.abs(n * 2 - 1)
  const ridgeMix = Math.min(1, mountain / 0.4 + 0.15)
  const detail = ridges * 0.55 * ridgeMix

  const base = (fbm2D(x * BASE_FREQ, z * BASE_FREQ, seed + 99, 3) - 0.5) * 0.3

  return Math.max(0, mountain + detail + base - 0.18)
}

export function seedFromId(id: string): number {
  let s = 0
  for (let i = 0; i < id.length; i++) s = (s * 131 + id.charCodeAt(i)) >>> 0
  return s % 100000
}

// Build a terrain BufferGeometry by displacing a subdivided plane via heightAt
// and recomputing per-vertex normals so the shader can read true slope.
export function buildTerrainGeometry(segments: number, seed = 0): BufferGeometry {
  const geo = new PlaneGeometry(SIZE, SIZE, segments, segments)
  geo.rotateX(-Math.PI / 2)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    pos.setY(i, heightAt(pos.getX(i), pos.getZ(i), seed))
  }
  pos.needsUpdate = true
  geo.computeVertexNormals()
  return geo
}
