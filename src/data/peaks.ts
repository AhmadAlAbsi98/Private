export interface Camp {
  id: string
  name: string
  /**
   * Position relative to the peak detail scene's local frame: x/z lie in the
   * terrain plane (units roughly equal to one tile of the massif, ±3), y is a
   * nominal elevation hint. The detail scene snaps each camp onto the live
   * heightmap so the node sits exactly on the surface.
   */
  position: [number, number, number]
}

export interface Peak {
  id: string
  name: string
  /** Summit elevation in metres. */
  height: number
  range: string
  lat: number
  lng: number
  /** One-line documentary blurb shown in later detail views. */
  summary: string
  /** Camp placements along the standard route, if illustrated for this peak. */
  camps?: Camp[]
}

// The 14 eight-thousanders, sourced from PROJECT.md. Coordinates are summit
// positions in decimal degrees.
export const PEAKS: Peak[] = [
  {
    id: 'everest',
    name: 'Everest',
    height: 8849,
    range: 'Mahalangur Himalaya',
    lat: 27.9881,
    lng: 86.925,
    summary: 'The highest point on Earth, first summited in 1953 by Hillary and Tenzing.',
    // Standard South Col route, sketched in scene-local units along the
    // approach ridge. The detail scene snaps y onto the live heightmap so
    // these only need to feel right in plan view.
    camps: [
      // ILLUSTRATIVE — scene-relative placements, not real-world coordinates.
      { id: 'everest-bc', name: 'Base Camp', position: [-2.1, 0.05, 1.9] },
      // ILLUSTRATIVE
      { id: 'everest-c1', name: 'Camp 1', position: [-1.25, 0.4, 1.15] },
      // ILLUSTRATIVE
      { id: 'everest-c2', name: 'Camp 2', position: [-0.55, 0.8, 0.55] },
      // ILLUSTRATIVE
      { id: 'everest-c3', name: 'Camp 3', position: [0.0, 1.25, 0.2] },
      // ILLUSTRATIVE
      { id: 'everest-c4', name: 'Camp 4', position: [0.25, 1.7, -0.1] },
      // ILLUSTRATIVE
      { id: 'everest-summit', name: 'Summit', position: [0.0, 2.2, 0.0] },
    ],
  },
  {
    id: 'k2',
    name: 'K2',
    height: 8611,
    range: 'Karakoram',
    lat: 35.8825,
    lng: 76.5133,
    summary: 'The "Savage Mountain" — steeper, colder and far deadlier than Everest.',
  },
  {
    id: 'kangchenjunga',
    name: 'Kangchenjunga',
    height: 8586,
    range: 'Kangchenjunga Himalaya',
    lat: 27.7025,
    lng: 88.1475,
    summary: 'Third-highest peak on Earth and sacred to the people of Sikkim.',
  },
  {
    id: 'lhotse',
    name: 'Lhotse',
    height: 8516,
    range: 'Mahalangur Himalaya',
    lat: 27.9617,
    lng: 86.9333,
    summary: 'Joined to Everest by the South Col, fronted by the sheer Lhotse Face.',
  },
  {
    id: 'makalu',
    name: 'Makalu',
    height: 8485,
    range: 'Mahalangur Himalaya',
    lat: 27.8897,
    lng: 87.0883,
    summary: 'A striking four-sided pyramid standing isolated east of Everest.',
  },
  {
    id: 'cho-oyu',
    name: 'Cho Oyu',
    height: 8188,
    range: 'Mahalangur Himalaya',
    lat: 28.0942,
    lng: 86.6608,
    summary: 'Widely regarded as the most accessible of the 8,000m peaks.',
  },
  {
    id: 'dhaulagiri-i',
    name: 'Dhaulagiri I',
    height: 8167,
    range: 'Dhaulagiri Himalaya',
    lat: 28.6983,
    lng: 83.4875,
    summary: '"White Mountain" — it rises in a vast wall above the Kali Gandaki gorge.',
  },
  {
    id: 'manaslu',
    name: 'Manaslu',
    height: 8163,
    range: 'Mansiri Himal',
    lat: 28.5497,
    lng: 84.5597,
    summary: '"Mountain of the Spirit," the high point of the Nepalese Mansiri Himal.',
  },
  {
    id: 'nanga-parbat',
    name: 'Nanga Parbat',
    height: 8126,
    range: 'Western Himalaya',
    lat: 35.2375,
    lng: 74.5892,
    summary: 'The "Killer Mountain," westernmost anchor of the Himalaya.',
  },
  {
    id: 'annapurna-i',
    name: 'Annapurna I',
    height: 8091,
    range: 'Annapurna Himalaya',
    lat: 28.5961,
    lng: 83.8203,
    summary: 'The first 8,000m peak ever climbed, and among the most lethal.',
  },
  {
    id: 'gasherbrum-i',
    name: 'Gasherbrum I',
    height: 8080,
    range: 'Karakoram',
    lat: 35.7242,
    lng: 76.6964,
    summary: 'Also called Hidden Peak, buried deep within the Karakoram.',
  },
  {
    id: 'broad-peak',
    name: 'Broad Peak',
    height: 8051,
    range: 'Karakoram',
    lat: 35.8108,
    lng: 76.5658,
    summary: 'Named for its wide, multi-summited crest near K2.',
  },
  {
    id: 'gasherbrum-ii',
    name: 'Gasherbrum II',
    height: 8035,
    range: 'Karakoram',
    lat: 35.7581,
    lng: 76.6536,
    summary: 'One of the most frequently climbed of the Karakoram giants.',
  },
  {
    id: 'shishapangma',
    name: 'Shishapangma',
    height: 8027,
    range: 'Langtang Himal',
    lat: 28.3525,
    lng: 85.7792,
    summary: 'The only eight-thousander lying entirely within Tibet.',
  },
]
