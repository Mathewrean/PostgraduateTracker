import { create } from 'zustand'
import { getCookie, clearCookie } from '../services/api'

export const useAuthStore = create((set) => ({
  user: null,
  token: getCookie('pst_access_token'),
  initialized: false,
  loading: false,
  error: null,
  
  setUser: (user) => {
    set({ user })
  },
  setToken: (token) => {
    set({ token })
  },
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setInitialized: (initialized) => set({ initialized }),
  
  logout: () => {
    clearCookie('pst_access_token')
    clearCookie('pst_refresh_token')
    set({ user: null, token: null, initialized: true })
  }
}))

export const useUIStore = create((set) => ({
  sidebarOpen: true,
  notifications: [],
  unreadCount: 0,
  isDark: localStorage.getItem('pst-theme') === 'dark',
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setNotifications: (notifications) => set({ notifications }),
  setUnreadCount: (count) => set({ unreadCount: count }),
  toggleTheme: () => set((state) => {
    const newTheme = !state.isDark
    localStorage.setItem('pst-theme', newTheme ? 'dark' : 'light')
    // Update the document root attribute for dark mode
    if (newTheme) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
    return { isDark: newTheme }
  }),
  // Initialize the theme on load
  initializeTheme: () => set((state) => {
    // Respect saved preference first, then OS-level preference
    const saved = localStorage.getItem('pst-theme')
    let isDark
    if (saved === 'dark') {
      isDark = true
      document.documentElement.setAttribute('data-theme', 'dark')
    } else if (saved === 'light') {
      isDark = false
      document.documentElement.removeAttribute('data-theme')
    } else {
      isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      if (isDark) document.documentElement.setAttribute('data-theme', 'dark')
      else document.documentElement.removeAttribute('data-theme')
    }
    return { isDark }
  })
}))
