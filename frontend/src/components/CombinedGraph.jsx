import React, { useEffect, useRef } from 'react'
import Plotly from 'plotly.js-dist-min'

// Colors matching ThingsBoard reference exactly
// bar types match the Series config in image 1
const TRACES_CONFIG = [
  { key: 'rpm',              name: 'RPM',              color: '#39ff14', type: 'bar',    line: false },
  { key: 'dosing_amount',    name: 'Dosing Amount',    color: '#888888', type: 'bar',    line: false },
  { key: 'avg_pressure',     name: 'Average Pressure', color: '#cc00ff', type: 'scatter',line: true  },
  { key: 'master_pressure',  name: 'Master Pressure',  color: '#66cc00', type: 'bar',    line: false },
  { key: 'direction',        name: 'Direction',        color: '#336600', type: 'scatter',line: true  },
  { key: 'current_pressure', name: 'Current Pressure', color: '#0055ff', type: 'bar',    line: false },
  { key: 'pump_status',      name: 'Pump Status',      color: '#ff0066', type: 'bar',    line: false },
  { key: 'tank_level',       name: 'Tank Level',       color: '#00ccff', type: 'scatter',line: true  },
]

const plotlyConfig = {
  displaylogo: false,
  responsive: true,
  modeBarButtonsToRemove: ['select2d', 'lasso2d'],
  toImageButtonOptions: { format: 'png', scale: 2 },
}

function buildTraces(data) {
  if (!data || data.length === 0) return []
  const ts = data.map(r => r.timestamp)

  return TRACES_CONFIG.map(cfg => {
    const base = {
      x: ts,
      y: data.map(r => r[cfg.key]),
      name: cfg.name,
    }

    if (cfg.type === 'bar') {
      return {
        ...base,
        type: 'bar',
        marker: {
          color: cfg.color,
          opacity: 0.85,
        },
      }
    } else {
      return {
        ...base,
        type: 'scatter',
        mode: 'lines',
        line: { color: cfg.color, width: 1.8 },
      }
    }
  })
}

function buildLayout(height) {
  return {
    paper_bgcolor: '#0a0e1a',
    plot_bgcolor:  '#080c18',
    height,
    margin: { t: 8, b: 60, l: 52, r: 16 },
    barmode: 'overlay',
    bargap: 0,
    bargroupgap: 0,
    showlegend: true,
    legend: {
      orientation: 'h',
      x: 0, y: -0.22,
      xanchor: 'left', yanchor: 'top',
      font: { color: '#8aa0c0', size: 10, family: 'JetBrains Mono, monospace' },
      bgcolor: 'rgba(0,0,0,0)',
      itemwidth: 40,
    },
    xaxis: {
      showgrid: true, gridcolor: '#111827', gridwidth: 1,
      zeroline: false, linecolor: '#1a2744',
      tickfont: { color: '#4a6080', size: 10, family: 'JetBrains Mono, monospace' },
      tickformat: '%b %d',
      type: 'date',
      rangeslider: {
        visible: true,
        bgcolor: '#0a0e1a',
        bordercolor: '#1a2744',
        borderwidth: 1,
        thickness: 0.07,
      },
    },
    yaxis: {
      showgrid: true, gridcolor: '#111827', gridwidth: 1,
      zeroline: true, zerolinecolor: '#1e2d4a', zerolinewidth: 1,
      linecolor: '#1a2744',
      tickfont: { color: '#4a6080', size: 10, family: 'JetBrains Mono, monospace' },
      fixedrange: false,
      autorange: true,
    },
    hovermode: 'x unified',
    hoverlabel: {
      bgcolor: '#0d1224',
      bordercolor: '#1a2744',
      font: { color: '#e0eaff', size: 10, family: 'JetBrains Mono, monospace' },
    },
  }
}

export default function CombinedGraph({ data, height = 380, emptyText = 'Upload CSV to view telemetry' }) {
  const ref = useRef(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (!ref.current) return
    const traces = buildTraces(data)
    const layout = buildLayout(height)
    if (!initialized.current) {
      Plotly.newPlot(ref.current, traces, layout, plotlyConfig)
      initialized.current = true
    } else {
      Plotly.react(ref.current, traces, layout, plotlyConfig)
    }
  }, [data, height])

  useEffect(() => {
    const handler = () => {
      if (ref.current && initialized.current) Plotly.relayout(ref.current, { height })
    }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [height])

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center w-full" style={{ height, background: '#0a0e1a' }}>
        <div className="text-center">
          <div style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.3 }}>📊</div>
          <p className="font-mono text-xs" style={{ color: '#2a3a5a' }}>{emptyText}</p>
        </div>
      </div>
    )
  }

  return <div ref={ref} style={{ width: '100%', height }} />
}
