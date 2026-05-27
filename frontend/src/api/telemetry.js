import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
})

export const uploadCSV = async (file) => {
  const form = new FormData()
  form.append('file', file)
  const res = await api.post('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

export const runSimulation = async (params) => {
  const res = await api.post('/simulate', params)
  return res.data
}

export const getOriginal = async () => {
  const res = await api.get('/original')
  return res.data
}

export const healthCheck = async () => {
  const res = await api.get('/health')
  return res.data
}

export default api