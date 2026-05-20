import React from 'react'

export default function SliderControl({ label, name, value, min, max, step = 0.1, onChange, unit = '' }) {
  return (
    <div className="mb-2">
      <div className="flex justify-between items-center mb-1">
        <span className="font-mono text-xs" style={{ color: '#8aa0c0', fontSize: '10px' }}>{label}</span>
        <span
          className="font-mono text-xs px-1 rounded"
          style={{ color: '#00f5ff', background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.15)', fontSize: '10px', minWidth: '36px', textAlign: 'right' }}
        >
          {typeof value === 'number' && value % 1 !== 0 ? value.toFixed(1) : value}{unit}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <span className="font-mono" style={{ color: '#2a3a5a', fontSize: '9px', minWidth: '16px' }}>{min}</span>
        <input
          type="range"
          name={name}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(name, parseFloat(e.target.value))}
          style={{ flex: 1 }}
        />
        <span className="font-mono" style={{ color: '#2a3a5a', fontSize: '9px', minWidth: '20px', textAlign: 'right' }}>{max}</span>
      </div>
    </div>
  )
}
