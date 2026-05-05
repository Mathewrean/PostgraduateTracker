import React from 'react'

const headerColors = {
  blue: 'badge-info',
  green: 'badge-success',
  purple: 'badge-primary',
  red: 'badge-danger',
}

const COLOR_VARS = {
  blue: 'var(--color-brand)',
  green: 'var(--color-success)',
  purple: 'var(--color-info)',
  red: 'var(--color-danger)',
  default: 'var(--color-brand)',
}

export const Card = ({
  title,
  description,
  icon,
  children,
  onClick,
  className = '',
  headerColor = 'blue',
}) => {
  return (
    <div
      onClick={onClick}
      className={`card ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="font-semibold text-lg text-text-primary">{title}</h3>
          {description && <p className="text-sm text-text-secondary mt-1">{description}</p>}
        </div>
        {icon && (
          <div className={`text-sm ${headerColors[headerColor] || headerColors.blue}`}>
            {icon}
          </div>
        )}
      </div>
      {children}
    </div>
  )
}

export const StatCard = ({ label, value, unit = '', icon, color = 'blue' }) => {
  const colorVar = COLOR_VARS[color] || COLOR_VARS.default

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
