import React from 'react'
import { useUIStore } from '../context/store'

export const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) => {
  const isDark = useUIStore((state) => state.isDark)

  const variants = {
    primary: isDark
      ? 'bg-blue-600 hover:bg-blue-700 text-white'
      : 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: isDark
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-100'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    success: isDark
      ? 'bg-green-600 hover:bg-green-700 text-white'
      : 'bg-green-600 hover:bg-green-700 text-white',
    danger: isDark
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : 'bg-red-600 hover:bg-red-700 text-white',
    outline: isDark
      ? 'border-2 border-gray-600 hover:bg-gray-800 text-gray-300'
      : 'border-2 border-gray-300 hover:bg-gray-50 text-gray-900',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        font-semibold rounded-lg transition-all duration-300
        ${variants[variant]}
        ${sizes[size]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? '⏳ Loading...' : children}
    </button>
  )
}
