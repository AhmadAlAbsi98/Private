# Project: "14 Peaks" — Cinematic WebGL Mountain Experience

## Vision
Immersive scroll-and-click web experience exploring the 14 mountains above
8,000m. Feel: Apple product-page cinematics meets National Geographic
documentary. Dark, premium, emotional, smooth. Visual immersion and camera
feel over conventional UI.

## Non-negotiable aesthetic
- Dark cinematic palette, high contrast, HDR-style bloom
- Depth fog and atmospheric haze in every scene
- All motion eased and inertial — nothing snaps
- No game HUD, no low-poly look, no flat default lighting

## Tech stack (FIXED — do not substitute)
- React + Vite + TypeScript
- React Three Fiber + drei + @react-three/postprocessing
- GSAP for camera/scroll choreography
- Procedural heightmap terrain in Three.js with custom GLSL shaders
- Zustand for state (selected peak, selected camp, camera target)

## Camera system (the heart of the project)
- Single shared camera rig; all navigation animates its position + target
- Drone feel: ease-in-out, slight overshoot, banking on turns
- Idle: slow cinematic drift
- Transitions use GSAP timelines, never instant cuts

## Build order (do NOT build ahead)
1. Dark cinematic canvas + lighting
2. Globe + 14 markers (data-driven)
3. Hover + click response
4. Camera rig + fly-to
5. Peak detail scene (reusable, built on Everest)
6. Camp-to-camp fly-along
7. Scroll story sections
8. Polish pass

## Data
Camp placements are ILLUSTRATIVE unless sourced — flag invented data in
comments. Desktop-first; show a "best on desktop" notice on small screens.
Audio is optional, polish pass only.

## The 14 eight-thousanders
1. Everest, 8849, Mahalangur Himalaya, 27.9881, 86.9250
2. K2, 8611, Karakoram, 35.8825, 76.5133
3. Kangchenjunga, 8586, Kangchenjunga Himalaya, 27.7025, 88.1475
4. Lhotse, 8516, Mahalangur Himalaya, 27.9617, 86.9333
5. Makalu, 8485, Mahalangur Himalaya, 27.8897, 87.0883
6. Cho Oyu, 8188, Mahalangur Himalaya, 28.0942, 86.6608
7. Dhaulagiri I, 8167, Dhaulagiri Himalaya, 28.6983, 83.4875
8. Manaslu, 8163, Mansiri Himal, 28.5497, 84.5597
9. Nanga Parbat, 8126, Western Himalaya, 35.2375, 74.5892
10. Annapurna I, 8091, Annapurna Himalaya, 28.5961, 83.8203
11. Gasherbrum I, 8080, Karakoram, 35.7242, 76.6964
12. Broad Peak, 8051, Karakoram, 35.8108, 76.5658
13. Gasherbrum II, 8035, Karakoram, 35.7581, 76.6536
14. Shishapangma, 8027, Langtang Himal, 28.3525, 85.7792
