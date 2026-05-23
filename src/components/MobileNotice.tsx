import { useEffect, useState } from 'react'

// Desktop-first experience: show a gentle notice on small screens.
export function MobileNotice() {
  const [small, setSmall] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const update = () => setSmall(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  if (!small) return null

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        padding: '12px 16px',
        textAlign: 'center',
        fontSize: 13,
        letterSpacing: '0.04em',
        color: '#cbd5e1',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
        pointerEvents: 'none',
      }}
    >
      Best experienced on desktop
    </div>
  )
}
