import React from 'react'

export function useToasts() {
  const [toasts, setToasts] = React.useState([])
  let id = React.useRef(0)
  const addToast = React.useCallback((type, message, duration = 5000) => {
    const tid = ++id.current
    setToasts(p => [...p, { id: tid, type, message }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== tid)), duration)
  }, [])
  const dismiss = React.useCallback((tid) => setToasts(p => p.filter(t => t.id !== tid)), [])
  return { toasts, addToast, dismiss }
}

export default function Toast({ toasts, onDismiss }) {
  if (!toasts.length) return null
  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} onClick={() => onDismiss(t.id)} style={{
          padding: '10px 16px', borderRadius: 6, fontSize: 12, maxWidth: 380, cursor: 'pointer',
          fontFamily: 'JetBrains Mono,monospace',
          background: t.type === 'success' ? 'rgba(57,255,20,.12)' : t.type === 'error' ? 'rgba(255,34,68,.12)' : t.type === 'warning' ? 'rgba(255,107,0,.12)' : 'rgba(0,128,255,.12)',
          border: `1px solid ${t.type === 'success' ? 'rgba(57,255,20,.4)' : t.type === 'error' ? 'rgba(255,34,68,.4)' : t.type === 'warning' ? 'rgba(255,107,0,.4)' : 'rgba(0,128,255,.4)'}`,
          color: t.type === 'success' ? '#39ff14' : t.type === 'error' ? '#ff6080' : t.type === 'warning' ? '#ff6b00' : '#60aaff',
        }}>
          {t.type === 'success' ? '✓ ' : t.type === 'error' ? '✕ ' : t.type === 'warning' ? '⚠ ' : 'ℹ '}{t.message}
        </div>
      ))}
    </div>
  )
}
