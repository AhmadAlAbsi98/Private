// Tiny seedable 2D value-noise / fbm used to drive the procedural terrain
// heightmap. Deliberately lightweight — stylized, not photoreal.

function hash(x: number, y: number, seed: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7 + seed * 53.7) * 43758.5453
  return s - Math.floor(s)
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t)
}

export function valueNoise2D(x: number, y: number, seed = 0): number {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi

  const tl = hash(xi, yi, seed)
  const tr = hash(xi + 1, yi, seed)
  const bl = hash(xi, yi + 1, seed)
  const br = hash(xi + 1, yi + 1, seed)

  const u = smooth(xf)
  const v = smooth(yf)
  const top = tl + (tr - tl) * u
  const bot = bl + (br - bl) * u
  return top + (bot - top) * v
}

export function fbm2D(x: number, y: number, seed = 0, octaves = 5): number {
  let amp = 0.5
  let freq = 1
  let sum = 0
  let norm = 0
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise2D(x * freq, y * freq, seed + i * 17)
    norm += amp
    amp *= 0.5
    freq *= 2
  }
  return sum / norm
}
