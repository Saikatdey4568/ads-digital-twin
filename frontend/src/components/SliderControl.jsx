import React, { useState, useEffect } from 'react'

export default function SliderControl({ label, name, value, min, max, step, onChange }) {
  const [inputVal, setInputVal] = useState(String(value))
  const [editing, setEditing]   = useState(false)

  useEffect(() => {
    if (!editing) setInputVal(String(value))
  }, [value, editing])

  const handleSlider = (e) => {
    const v = parseFloat(e.target.value)
    onChange(name, v)
    setInputVal(String(v))
  }

  const commit = () => {
    setEditing(false)
    let v = parseFloat(inputVal)
    if (isNaN(v)) { setInputVal(String(value)); return }
    v = Math.min(max, Math.max(min, v))
    v = Math.round(v / step) * step
    v = parseFloat(v.toFixed(10))
    onChange(name, v)
    setInputVal(String(v))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter')  { e.target.blur() }
    if (e.key === 'Escape') { setEditing(false); setInputVal(String(value)) }
  }

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#8aa0c0' }}>
          {label}
        </span>
        <input
          type="number"
          value={inputVal}
          min={min}
          max={max}
          step={step}
          onChange={e => { setInputVal(e.target.value); setEditing(true) }}
          onBlur={commit}
          onFocus={e => { setEditing(true); e.target.select() }}
          onKeyDown={handleKeyDown}
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            color: '#00f5ff',
            background: editing ? 'rgba(0,245,255,0.1)' : 'rgba(0,245,255,0.06)',
            border: editing ? '1px solid #00f5ff' : '1px solid rgba(0,245,255,0.15)',
            borderRadius: 3,
            padding: '2px 6px',
            width: 52,
            textAlign: 'right',
            outline: 'none',
            cursor: 'text',
            boxShadow: editing ? '0 0 8px rgba(0,245,255,0.35)' : 'none',
            transition: 'all 0.15s',
          }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#2a3a5a', minWidth: 18 }}>
          {min}
        </span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSlider}
          style={{ flex: 1 }}
        />
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#2a3a5a', minWidth: 22, textAlign: 'right' }}>
          {max}
        </span>
      </div>
    </div>
  )
}
