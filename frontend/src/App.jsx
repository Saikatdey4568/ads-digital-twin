import React, { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import CombinedGraph from './components/CombinedGraph'
import Toast, { useToasts } from './components/Toast'
import { uploadCSV, runSimulation, deployConfig, getDeviceStatus } from './api'
import { DEFAULT_PARAMS } from './api/params'

export default function App() {
  const [params, setParams]             = useState({ ...DEFAULT_PARAMS })
  const [originalData, setOriginalData] = useState([])
  const [simData, setSimData]           = useState([])
  const [loading, setLoading]           = useState(false)
  const [deploying, setDeploying]       = useState(false)
  const [fileName, setFileName]         = useState('')
  const [deviceEvent, setDeviceEvent]   = useState(null)
  const [graphH, setGraphH]             = useState(380)
  const { toasts, addToast, dismiss }   = useToasts()

  useEffect(() => {
    const calc = () => setGraphH(Math.floor((window.innerHeight - 44 - 4) / 2))
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  useEffect(() => {
    const poll = async () => {
      try { const s = await getDeviceStatus(); setDeviceEvent(s.event || null) } catch {}
    }
    poll()
    const t = setInterval(poll, 15000)
    return () => clearInterval(t)
  }, [])

  const handleParamChange = useCallback((name, value) => {
    setParams(prev => ({ ...prev, [name]: value }))
  }, [])

  const handleUpload = async (file) => {
    setLoading(true)
    try {
      const res = await uploadCSV(file)
      setOriginalData(res.data)
      setSimData([])
      setFileName(file.name)
      addToast('success', `Loaded ${res.rows.toLocaleString()} rows from ${file.name}`)
    } catch (e) {
      addToast('error', e.response?.data?.detail || 'Upload failed')
    } finally { setLoading(false) }
  }

  const handleRun = async () => {
    if (!originalData.length) { addToast('warning', 'Upload a CSV file first'); return }
    setLoading(true)
    try {
      const res = await runSimulation(params)
      setSimData(res.data)
      addToast('success', `Simulation complete — ${res.rows.toLocaleString()} rows`)
    } catch (e) {
      addToast('error', e.response?.data?.detail || 'Simulation failed')
    } finally { setLoading(false) }
  }

  const handleDeploy = async () => {
    setDeploying(true)
    addToast('info', 'Deploying config to CM4 via ThingsBoard…')
    try {
      const res = await deployConfig(params)
      addToast('success', `✓ Config deployed successfully`)
    } catch (e) {
      const status = e.response?.status
      const msg    = e.response?.data?.detail || 'Deploy failed'
      if (status === 409) addToast('warning', `🔒 ${msg}`)
      else if (status === 503) addToast('error', `📡 ThingsBoard unreachable — check .env`)
      else if (status === 400) addToast('error', `⚙ ${msg} — set TB_DEVICE_ID in .env`)
      else addToast('error', msg)
    } finally { setDeploying(false) }
  }

  const handleReset = () => {
    setParams({ ...DEFAULT_PARAMS })
    setSimData([])
    addToast('info', 'Parameters reset to defaults')
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#06080f', display: 'flex', flexDirection: 'column' }}>
      <Header dataLoaded={originalData.length > 0} rowCount={originalData.length} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar
          params={params}
          onChange={handleParamChange}
          onUpload={handleUpload}
          onRun={handleRun}
          onDeploy={handleDeploy}
          onReset={handleReset}
          loading={loading}
          deploying={deploying}
          fileName={fileName}
          deviceEvent={deviceEvent}
          onToast={addToast}
        />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#080c18' }}>
          <div style={{ height: graphH, borderBottom: '2px solid #1a2744', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
            <div style={{ height: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', background: 'rgba(0,128,255,.04)', borderBottom: '1px solid #0f1a30' }}>
              <span style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '.12em', color: '#00f5ff' }}>SENSOR COMBINED GRAPH — ORIGINAL DATASET</span>
              {originalData.length > 0 && <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 9, color: '#2a3a5a' }}>{originalData.length.toLocaleString()} pts</span>}
            </div>
            <div style={{ height: graphH - 28 }}>
              <CombinedGraph data={originalData} height={graphH - 28} emptyText="Upload CSV to view original telemetry" />
            </div>
          </div>
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            <div style={{ height: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', background: 'rgba(57,255,20,.03)', borderBottom: '1px solid #0f1a30' }}>
              <span style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '.12em', color: '#39ff14' }}>SENSOR COMBINED GRAPH — SIMULATED DATASET</span>
              {loading && <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 9, color: '#39ff14', display: 'flex', alignItems: 'center', gap: 6 }}><span className="spinner" /> SIMULATING…</span>}
              {simData.length > 0 && !loading && <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 9, color: '#2a3a5a' }}>{simData.length.toLocaleString()} pts</span>}
            </div>
            <div style={{ height: graphH - 28 }}>
              <CombinedGraph data={simData} height={graphH - 28} emptyText="Run simulation to view results" />
            </div>
          </div>
        </main>
      </div>
      <Toast toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
