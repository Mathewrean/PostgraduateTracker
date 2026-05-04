import React from 'react'

const STAGE_ORDER = ['CONCEPT', 'PROPOSAL', 'THESIS', 'COMPLETED']

const STAGE_LABELS = {
  CONCEPT: 'Concept',
  PROPOSAL: 'Proposal',
  THESIS: 'Thesis Submission',
  COMPLETED: 'Completed',
}

const STAGE_COLORS = {
  CONCEPT: 'badge-primary',
  PROPOSAL: 'badge-info',
  THESIS: 'badge-warning',
  COMPLETED: 'badge-success',
}

export const StageIndicator = ({ currentStage }) => {
  const currentIndex = STAGE_ORDER.indexOf(currentStage) || 0
  return (
    <div style={{ padding: '1rem', borderRadius: '0.5rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
      <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Progress</h3>
      <div className="flex items-center justify-between">
        {STAGE_ORDER.map((stage, index) => {
          const isCompleted = index <= currentIndex
          const isCurrent = index === currentIndex
          const badgeClass = isCompleted ? STAGE_COLORS[stage] : 'badge-muted'

          return (
            <React.Fragment key={stage}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${badgeClass}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--bg-main)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span style={{ fontSize: '0.625rem', color: 'var(--text-secondary)' }}>{index + 1}</span>
                  )}
                </div>
                <span style={{ fontSize: '0.625rem', marginTop: '0.25rem', color: isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: isCurrent ? 600 : 400 }}>{STAGE_LABELS[stage]}</span>
              </div>

              {index < STAGE_ORDER.length - 1 && (
                <div style={{ flex: 1, height: '6px', margin: '0 0.5rem', borderRadius: '9999px', backgroundColor: index < currentIndex ? 'var(--color-brand)' : 'var(--border-color)' }} />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}