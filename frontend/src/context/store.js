import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('access_token'),
  loading: false,
  error: null,
  
  setUser: (user) => set({ user }),
  setToken: (token) => {
    localStorage.setItem('access_token', token)
    set({ token })
  },
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  logout: () => {
    localStorage.removeItem('access_token')
    set({ user: null, token: null })
  }
}))

export const useUIStore = create((set) => ({
  sidebarOpen: true,
  notifications: [],
  unreadCount: 0,
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setNotifications: (notifications) => set({ notifications }),
  setUnreadCount: (count) => set({ unreadCount: count }),
}))
