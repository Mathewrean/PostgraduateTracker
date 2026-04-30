import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
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
    return { isDark: newTheme }
  }),
}))
