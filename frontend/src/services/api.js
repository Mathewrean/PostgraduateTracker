import axios from 'axios'

export const getCookie = (name) => {
  if (typeof document === 'undefined') return null
  const cookies = document.cookie ? document.cookie.split('; ') : []
  const target = cookies.find((cookie) => cookie.startsWith(`${name}=`))
  return target ? decodeURIComponent(target.split('=').slice(1).join('=')) : null
}

export const setCookie = (name, value, days = 7) => {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

export const clearCookie = (name) => {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Strict`
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = getCookie('pst_access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || ''
    const isAuthAttempt = requestUrl.includes('/auth/login/') || requestUrl.includes('/users/register/')
    const hadAuthHeader = Boolean(error.config?.headers?.Authorization)

    if (error.response?.status === 401 && !isAuthAttempt && hadAuthHeader) {
      clearCookie('pst_access_token')
      clearCookie('pst_refresh_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
