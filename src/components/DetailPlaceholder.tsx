import { PEAKS } from '../data/peaks'
import { useStore } from '../store/useStore'

// Placeholder for the peak detail scene (built in a later step). It fades in
// once the camera flight settles into 'detail' mode. "Back to globe" routes
// the return flight through the shared camera rig — never moving the camera
// directly.
export function DetailPlaceholder() {
  const mode = useStore((s) => s.cameraMode)
  const selectedPeak = useStore((s) => s.selectedPeak)
  const setSelectedPeak = useStore((s) => s.setSelectedPeak)
  const flyTo = useStore((s) => s.flyTo)

  const peak = PEAKS.find((p) => p.id === selectedPeak)
  const visible = mode === 'detail' && !!peak

  const backToGlobe = () => {
    flyTo?.({ position: [0, 1.8, 7], lookAt: [0, 0, 0], settle: 'idle' })
    setSelectedPeak(null)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '0 0 9vh 7vw',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.9s ease',
        pointerEvents: visible ? 'auto' : 'none',
        background:
          'radial-gradient(120% 90% at 20% 100%, rgba(5,7,11,0.72), rgba(5,7,11,0) 60%)',
      }}
    >
      {peak && (
        <div style={{ maxWidth: 520 }}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: '#7f97b8',
              marginBottom: 12,
            }}
          >
            {peak.range}
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(40px, 6vw, 78px)',
              fontWeight: 600,
              lineHeight: 1.02,
              letterSpacing: '-0.02em',
              color: '#f1f6ff',
            }}
          >
            {peak.name}
          </h1>
          <div
            style={{
              marginTop: 8,
              fontSize: 'clamp(18px, 2.2vw, 26px)',
              color: '#aec4e6',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {peak.height.toLocaleString()} m
          </div>
          <p
            style={{
              marginTop: 18,
              maxWidth: 460,
              fontSize: 15,
              lineHeight: 1.55,
              color: '#9fb0c8',
            }}
          >
            {peak.summary}
          </p>

          <button
            type="button"
            onClick={backToGlobe}
            style={{
              marginTop: 30,
              padding: '11px 22px',
              fontSize: 13,
              letterSpacing: '0.08em',
              color: '#eaf2ff',
              background: 'rgba(159,196,255,0.08)',
              border: '1px solid rgba(159,196,255,0.3)',
              borderRadius: 999,
              cursor: 'pointer',
              backdropFilter: 'blur(6px)',
            }}
          >
            ← Back to globe
          </button>
        </div>
      )}
    </div>
  )
}
