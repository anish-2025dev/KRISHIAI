import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 30000,
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('krishiai_portal_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('krishiai_portal_token')
      localStorage.removeItem('krishiai_portal_user')
    }
    return Promise.reject(err)
  }
)

export default API
