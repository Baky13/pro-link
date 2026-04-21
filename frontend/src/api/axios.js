import axios from 'axios'
import { useAuthStore } from '../store'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshPromise = null

const forceLogout = () => {
  try { useAuthStore.getState().logout() } catch {}
  try {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  } catch {}
  if (!window.location.pathname.startsWith('/login')) {
    window.location.href = '/login'
  }
}

api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (!original || err.response?.status !== 401 || original._retry) {
      return Promise.reject(err)
    }

    if (original.url && original.url.includes('/auth/refresh')) {
      forceLogout()
      return Promise.reject(err)
    }

    original._retry = true
    const refresh = localStorage.getItem('refreshToken')
    if (!refresh) {
      forceLogout()
      return Promise.reject(err)
    }

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post('/api/auth/refresh', { refreshToken: refresh })
          .finally(() => { refreshPromise = null })
      }
      const { data } = await refreshPromise
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      try {
        useAuthStore.setState({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        })
      } catch {}
      original.headers.Authorization = `Bearer ${data.accessToken}`
      return api(original)
    } catch (refreshErr) {
      console.error('Refresh failed:', refreshErr?.message || refreshErr)
      forceLogout()
      return Promise.reject(refreshErr)
    }
  }
)

export default api
