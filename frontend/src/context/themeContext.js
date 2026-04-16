import { create } from 'zustand'

export const useThemeStore = create((set) => ({
  isDark: localStorage.getItem('theme') === 'dark',
  
  toggleTheme: () => set((state) => {
    const newTheme = !state.isDark
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
    return { isDark: newTheme }
  }),
  
  setTheme: (isDark) => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
    set({ isDark })
  }
}))
