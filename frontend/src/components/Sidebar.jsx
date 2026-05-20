import React, { useRef, useState, useEffect } from 'react'
import SliderControl from './SliderControl'
import { SLIDER_DEFS } from '../api/params'
import { listPresets, loadPreset, savePreset, deletePreset } from '../api'

export default function Sidebar({
  params, onChange, onUpload, onRun, onDeploy, onReset,
  loading, deploying, fileName, deviceEvent, onToast
}) {
  const fileRef = useRef()
  const [collapsed, setCollapsed] = useState({})
  const [presets, setPresets]     = useState([])
  const [showPresets, setShowPresets] = useState(false)
  const [presetName, setPresetName]   = useState('')

  useEffect(() => { fetchPresets() }, [])

  const fetchPresets = async () => {
    try { const r = await listPresets(); setPresets(r.presets || []) } catch {}
  }

  const handleFile = (e) => {
    const f = e.target.files[0]; if (f) onUpload(f); e.target.value = ''
  }

  const toggleSection = (s) => setCollapsed(p => ({ ...p, [s]: !p[s] }))

  const handleSavePreset = async () => {
    if (!presetName.trim()) return
    try {
      await savePreset(presetName.trim(), params)
      onToast('success', `Preset "${presetName}" saved`)
      setPresetName(''); await fetchPresets()
    } catch { onToast('error', 'Failed to save preset') }
  }

  const handleLoadPreset = async (name) => {
    try {
      const r = await loadPreset(name)
      Object.entries(r.config).forEach(([k, v]) => onChange(k, v))
      onToast('info', `Preset "${name}" loaded`)
    } catch { onToast('error', 'Failed to load preset') }
  }

  const handleDeletePreset = async (name) => {
    try {
      await deletePreset(name)
      onToast('info', `Preset "${name}" deleted`)
      await fetchPresets()
    } catch { onToast('error', 'Failed to delete preset') }
  }

  const deviceColor = deviceEvent === 'IDLE' ? '#39ff14' : deviceEvent ? '#ff6b00' : '#4a6080'
  const deviceLabel = deviceEvent ? `${deviceEvent} — ${deviceEvent === 'IDLE' ? 'SAFE' : 'NOT SAFE'}` : 'STATE UNKNOWN'

  return (
    <aside style={{
      width: 268,
      height: '100%',
      background: '#080c18',
      borderRight: '1px solid #1a2744',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      flexShrink: 0,
    }}>

      {/* ── Header ── */}
      <div style={{ padding: '7px 12px', borderBottom: '1px solid #1a2744', background: 'rgba(0,245,255,.02)', flexShrink: 0 }}>
        <span style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '.12em', color: '#00f5ff' }}>
          ⚙ SIMULATION CONTROLS
        </span>
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', minHeight: 0 }}>

        {/* CSV Upload */}
        <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFile} />
        <button
          onClick={() => fileRef.current.click()}
          style={{
            width: '100%', padding: '7px 10px', borderRadius: 4, fontSize: 10,
            marginBottom: 8, textAlign: 'center', cursor: 'pointer',
            background: '#0d1224', border: '1px dashed #1a2744',
            color: fileName ? '#39ff14' : '#00f5ff',
            fontFamily: 'JetBrains Mono,monospace',
          }}>
          {fileName
            ? `📄 ${fileName.length > 24 ? fileName.slice(0, 22) + '…' : fileName}`
            : '⬆  UPLOAD CSV TELEMETRY'}
        </button>

        <hr style={{ borderColor: '#1a2744', margin: '6px 0' }} />

        {/* Slider sections */}
        {SLIDER_DEFS.map(({ section, params: sParams }) => (
          <div key={section} style={{ marginBottom: 4 }}>
            <div
              onClick={() => toggleSection(section)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '4px 0', marginBottom: collapsed[section] ? 0 : 4 }}
            >
              <span style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '.12em', color: '#0080ff', textTransform: 'uppercase' }}>
                {section}
              </span>
              <span style={{ color: '#4a6080', fontSize: 10 }}>{collapsed[section] ? '▶' : '▼'}</span>
            </div>
            {!collapsed[section] && sParams.map(s => (
              <SliderControl key={s.key} label={s.label} name={s.key}
                value={params[s.key]} min={s.min} max={s.max} step={s.step} onChange={onChange} />
            ))}
            <hr style={{ borderColor: '#1a2744', margin: '4px 0' }} />
          </div>
        ))}

        {/* Presets */}
        <div style={{ marginBottom: 6 }}>
          <div onClick={() => setShowPresets(p => !p)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '4px 0', marginBottom: showPresets ? 6 : 0 }}>
            <span style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '.12em', color: '#ff6b00', textTransform: 'uppercase' }}>
              PRESETS
            </span>
            <span style={{ color: '#4a6080', fontSize: 10 }}>{showPresets ? '▼' : '▶'}</span>
          </div>
          {showPresets && (
            <div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                <input value={presetName} onChange={e => setPresetName(e.target.value)}
                  placeholder="Preset name…"
                  style={{ flex: 1, padding: '4px 6px', background: '#0a0e1a', border: '1px solid #1a2744', borderRadius: 3, color: '#e0eaff', fontSize: 10, fontFamily: 'JetBrains Mono,monospace', outline: 'none' }} />
                <button onClick={handleSavePreset}
                  style={{ padding: '4px 8px', borderRadius: 3, background: '#0d1224', border: '1px solid #1a2744', color: '#ff6b00', fontSize: 10, cursor: 'pointer', fontFamily: 'JetBrains Mono,monospace' }}>
                  SAVE
                </button>
              </div>
              {presets.length === 0
                ? <p style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 9, color: '#2a3a5a', textAlign: 'center', padding: '4px 0' }}>No presets saved</p>
                : presets.map(name => (
                  <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 6px', marginBottom: 3, background: '#0a0e1a', border: '1px solid #1a2744', borderRadius: 3 }}>
                    <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 10, color: '#8aa0c0' }}>{name}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => handleLoadPreset(name)} style={{ padding: '2px 6px', borderRadius: 2, background: 'transparent', border: '1px solid #1a2744', color: '#00f5ff', fontSize: 10, cursor: 'pointer' }}>LOAD</button>
                      <button onClick={() => handleDeletePreset(name)} style={{ padding: '2px 6px', borderRadius: 2, background: 'transparent', border: '1px solid #1a2744', color: '#ff2244', fontSize: 10, cursor: 'pointer' }}>✕</button>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>

      </div>

      {/* ── Device state ── */}
      <div style={{ padding: '5px 10px', borderTop: '1px solid #1a2744', flexShrink: 0, background: 'rgba(0,0,0,.2)', fontFamily: 'JetBrains Mono,monospace', fontSize: 9 }}>
        <span style={{ color: '#2a3a5a' }}>DEVICE: </span>
        <span style={{ color: deviceColor }}>{deviceLabel}</span>
      </div>

      {/* ── Action Buttons — always visible at bottom ── */}
      <div style={{ padding: '8px 10px', borderTop: '1px solid #1a2744', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>

        {/* RESET + RUN SIMULATION row */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={onReset}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 4, fontSize: 10, cursor: 'pointer',
              background: '#0d1224', color: '#e0eaff',
              border: '1px solid #1a2744', fontFamily: 'Rajdhani,sans-serif',
              fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase',
            }}>
            RESET
          </button>
          <button
            onClick={onRun}
            disabled={loading}
            style={{
              flex: 2, padding: '8px 0', borderRadius: 4, fontSize: 10, cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? '#1a4a00' : 'linear-gradient(135deg,#1a8a00,#39ff14)',
              color: '#000', border: 'none',
              fontFamily: 'Rajdhani,sans-serif', fontWeight: 700,
              letterSpacing: '.1em', textTransform: 'uppercase',
              boxShadow: loading ? 'none' : '0 0 14px rgba(57,255,20,.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              opacity: loading ? 0.6 : 1,
            }}>
            {loading
              ? <><span className="spinner" style={{ width: 11, height: 11 }} /> RUNNING…</>
              : '▶ RUN SIMULATION'}
          </button>
        </div>

        {/* DEPLOY CONFIG full-width button */}
        <button
          onClick={onDeploy}
          disabled={deploying}
          style={{
            width: '100%', padding: '9px 0', borderRadius: 4, fontSize: 10,
            cursor: deploying ? 'not-allowed' : 'pointer',
            background: deploying ? '#003080' : 'linear-gradient(135deg,#003580,#0080ff)',
            color: '#fff', border: 'none',
            fontFamily: 'Rajdhani,sans-serif', fontWeight: 700,
            letterSpacing: '.1em', textTransform: 'uppercase',
            boxShadow: deploying ? 'none' : '0 0 14px rgba(0,128,255,.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            opacity: deploying ? 0.6 : 1,
          }}>
          {deploying
            ? <><span className="spinner" style={{ width: 11, height: 11, borderTopColor: '#fff' }} /> DEPLOYING…</>
            : '🚀 DEPLOY CONFIG TO CM4'}
        </button>

      </div>
    </aside>
  )
}