import { Vector3 } from 'three'

const DEG2RAD = Math.PI / 180

// Map a geographic coordinate onto a sphere of the given radius.
// Standard equirectangular convention: +Y is the north pole, longitude 0
// faces +Z. Returns a fresh Vector3.
export function latLngToVector3(lat: number, lng: number, radius: number): Vector3 {
  const phi = (90 - lat) * DEG2RAD
  const theta = (lng + 180) * DEG2RAD
  return new Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}
