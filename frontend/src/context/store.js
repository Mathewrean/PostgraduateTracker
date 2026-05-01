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
  isDark: localStorage.getItem('theme') === 'dark',
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setNotifications: (notifications) => set({ notifications }),
  setUnreadCount: (count) => set({ unreadCount: count }),
  toggleTheme: () => set((state) => {
    const newTheme = !state.isDark
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
    // Update the document root class for dark mode
    if (newTheme) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    return { isDark: newTheme }
  }),
  // Initialize the theme on load
  initializeTheme: () => set((state) => {
    const isDark = localStorage.getItem('theme') === 'dark'
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    return { isDark }
  })
}))
