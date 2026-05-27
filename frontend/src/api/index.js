import axios from 'axios'
const api = axios.create({ baseURL: '/api', timeout: 60000 })
export const uploadCSV       = (file) => { const f = new FormData(); f.append('file', file); return api.post('/upload', f, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data) }
export const runSimulation   = (params) => api.post('/simulate', params).then(r => r.data)
export const deployConfig    = (params) => api.post('/deploy', params).then(r => r.data)
export const getDeviceStatus = () => api.get('/device-status').then(r => r.data)
export const savePreset      = (name, config) => api.post('/presets/save', { name, config }).then(r => r.data)
export const listPresets     = () => api.get('/presets').then(r => r.data)
export const loadPreset      = (name) => api.get(`/presets/${name}`).then(r => r.data)
export const deletePreset    = (name) => api.delete(`/presets/${name}`).then(r => r.data)
export default api