import React from 'react'
import { useUIStore } from '../context/store'

export const Card = ({
  title,
  description,
  icon,
  children,
  onClick,
  className = '',
  headerColor = 'blue',
}) => {
  const isDark = useUIStore((state) => state.isDark)

  const headerColors = {
    blue: isDark ? 'border-blue-500 bg-blue-900/20' : 'border-blue-200 bg-blue-50',
    green: isDark ? 'border-green-500 bg-green-900/20' : 'border-green-200 bg-green-50',
    purple: isDark ? 'border-purple-500 bg-purple-900/20' : 'border-purple-200 bg-purple-50',
    red: isDark ? 'border-red-500 bg-red-900/20' : 'border-red-200 bg-red-50',
  }

  return (
    <div
      onClick={onClick}
      className={`${
        isDark
          ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
          : 'bg-white border-gray-200 hover:border-gray-300'
      } border rounded-xl p-6 transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-lg' : ''} ${className}`}
    >
      {/* Header */}
      {(title || icon) && (
        <div
          className={`flex items-center gap-3 mb-4 pb-4 border-b ${
            headerColors[headerColor]
          }`}
        >
          {icon && <span className="text-3xl">{icon}</span>}
          {title && (
            <h3
              className={`text-lg font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              {title}
            </h3>
          )}
        </div>
      )}

      {/* Description */}
      {description && (
        <p
          className={`mb-4 text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          {description}
        </p>
      )}

      {/* Content */}
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}

export const StatCard = ({ label, value, unit = '', icon, color = 'blue' }) => {
  const isDark = useUIStore((state) => state.isDark)

  const colorClasses = {
    blue: isDark ? 'text-blue-400 bg-blue-900/20' : 'text-blue-600 bg-blue-50',
    green: isDark ? 'text-green-400 bg-green-900/20' : 'text-green-600 bg-green-50',
    purple: isDark ? 'text-purple-400 bg-purple-900/20' : 'text-purple-600 bg-purple-50',
    red: isDark ? 'text-red-400 bg-red-900/20' : 'text-red-600 bg-red-50',
  }

  return (
    <div
      className={`${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border rounded-lg p-6 transition-all duration-300`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p
            className={`text-sm font-medium ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {label}
          </p>
          <p className="flex items-baseline gap-2 mt-2">
            <span
              className={`text-3xl font-bold ${colorClasses[color].split(' ')[0]}`}
            >
              {value}
            </span>
            {unit && (
              <span
                className={`text-sm ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}
              >
                {unit}
              </span>
            )}
          </p>
        </div>
        {icon && (
          <div
            className={`p-4 rounded-lg text-3xl ${colorClasses[color]}`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
