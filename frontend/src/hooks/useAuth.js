import { useEffect, useState } from 'react'
import { useAuthStore } from '../context/store'
import { authService } from '../services'

export const useCurrentUser = () => {
  const storedUser = useAuthStore((state) => state.user)
  const setStoredUser = useAuthStore((state) => state.setUser)
  const [user, setUser] = useState(storedUser)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authService.getCurrentUser()
        setStoredUser(response.data)
        setUser(response.data)
      } catch (error) {
        console.error('Failed to fetch user:', error)
        setUser(storedUser)
      } finally {
        setLoading(false)
      }
    }
    
    if (useAuthStore.getState().token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [setStoredUser, storedUser])
  
  return { user, loading }
}

export const useOnClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return
      handler(event)
    }
    
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [ref, handler])
}
