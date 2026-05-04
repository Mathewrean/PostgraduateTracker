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
          import React from 'react'
          import { useUIStore } from '../context/store'

          const COLOR_VARS = {
            blue: 'var(--color-brand)',
            green: 'var(--color-success)',
            purple: 'var(--color-info)',
            red: 'var(--color-danger)'
          }

          export const Card = ({ title, description, icon, children, onClick, className = '', headerColor = 'blue' }) => {
            const color = COLOR_VARS[headerColor] || COLOR_VARS.blue

            return (
              <div className={`card ${onClick ? 'cursor-pointer hover:shadow-lg' : ''} ${className}`} onClick={onClick}>
                {(title || icon) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', borderLeft: `4px solid ${color}`, paddingLeft: '0.75rem', backgroundColor: 'transparent' }}>
                    {icon && <span style={{ fontSize: '1.5rem' }}>{icon}</span>}
                    {title && <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>}
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
