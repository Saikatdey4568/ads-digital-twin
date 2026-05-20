import React from 'react'

export default function Header({ dataLoaded, rowCount }) {
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <header
      className="flex items-center justify-between px-4 shrink-0"
      style={{
        height: '44px',
        background: 'linear-gradient(90deg, #06080f 0%, #0a0e1a 40%, #06080f 100%)',
        borderBottom: '1px solid #1a2744',
        boxShadow: '0 2px 20px rgba(0,128,255,0.1)',
      }}
    >
      {/* Left: logo + title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <div
            className="w-5 h-5 flex items-center justify-center"
            style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.3)', borderRadius: '3px' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="1" y="1" width="4" height="4" stroke="#00f5ff" strokeWidth="1" fill="rgba(0,245,255,0.2)" />
              <rect x="7" y="1" width="4" height="4" stroke="#00f5ff" strokeWidth="1" fill="rgba(0,245,255,0.2)" />
              <rect x="1" y="7" width="4" height="4" stroke="#00f5ff" strokeWidth="1" fill="rgba(0,245,255,0.2)" />
              <rect x="7" y="7" width="4" height="4" stroke="#39ff14" strokeWidth="1" fill="rgba(57,255,20,0.2)" />
            </svg>
          </div>
        </div>
        <h1 className="font-display font-bold tracking-widest" style={{ fontSize: '18px', letterSpacing: '0.15em' }}>
          <span className="neon-text">ADS</span>
          <span style={{ color: '#e0eaff', marginLeft: '6px' }}>DIGITAL TWIN</span>
        </h1>
        <div className="h-4 w-px" style={{ background: '#1a2744' }} />
        <span className="font-mono text-xs" style={{ color: '#4a6080' }}>
          ADMIXTURE DOSING SYSTEM — TELEMETRY REPLAY & SIMULATION
        </span>
      </div>

      {/* Right: status + datetime + JT logo */}
      <div className="flex items-center gap-4">
        {dataLoaded && (
          <div className="flex items-center gap-2 font-mono text-xs" style={{ color: '#4a6080' }}>
            <span className="w-2 h-2 rounded-full pulse-dot" style={{ background: '#39ff14', display: 'inline-block' }} />
            <span style={{ color: '#39ff14' }}>{rowCount.toLocaleString()} ROWS LOADED</span>
          </div>
        )}
        <div className="flex items-center gap-2 px-3 py-1 font-mono text-xs" style={{ color: '#4a6080', border: '1px solid #1a2744', borderRadius: '3px' }}>
          <span style={{ color: '#00f5ff' }}>HISTORICAL MODE</span>
        </div>
        <div className="font-mono text-xs" style={{ color: '#4a6080' }}>
          <span>{dateStr}</span>
          <span style={{ color: '#00f5ff', marginLeft: '8px' }}>{timeStr}</span>
        </div>

        {/* Divider */}
        <div className="h-6 w-px" style={{ background: '#1a2744' }} />

        {/* Janyu Tech Logo */}
        <img
          src="/JTLOGO.png"
          alt="Janyu Tech"
          style={{
            height: '28px',
            width: 'auto',
            opacity: 0.92,
            filter: 'brightness(1.05)',
          }}
        />
      </div>
    </header>
  )
}
