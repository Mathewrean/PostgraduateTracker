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
      } border rounded-lg p-6 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md ${className}`}
    >
      <div
        className={`flex items-center justify-between mb-4 p-3 rounded-lg ${headerColors[headerColor]}`}
      >
        <div>
          <h3 className="font-semibold text-lg text-text-primary">{title}</h3>
          {description && <p className="text-sm text-text-secondary mt-1">{description}</p>}
        </div>
        {icon && (
          <div className="text-2xl">
            {icon}
          </div>
        )}
      </div>
      {children}
    </div>
                )}

                {description && <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{description}</p>}

                {children && <div style={{ marginTop: '1rem' }}>{children}</div>}
              </div>
            )
          }

          export const StatCard = ({ label, value, unit = '', icon, color = 'blue' }) => {
            const colorVar = COLOR_VARS[color] || COLOR_VARS.blue

            return (
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</p>
                    <p style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 700, color: colorVar }}>{value}</span>
                      {unit && <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{unit}</span>}
                    </p>
                  </div>
                  {icon && <div style={{ padding: '0.75rem', borderRadius: '0.5rem', fontSize: '1.25rem', backgroundColor: colorVar, color: 'var(--bg-main)' }}>{icon}</div>}
                </div>
              </div>
            )
          }
    red: isDark ? 'text-red-400 bg-red-900/20' : 'text-red-600 bg-red-50',
