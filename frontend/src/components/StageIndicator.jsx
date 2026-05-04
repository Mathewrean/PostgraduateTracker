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
    <div className="p-4 rounded-lg bg-bg-secondary border border-border-primary">
      <h3 className="text-sm font-semibold text-text-secondary mb-3">Progress</h3>
      <div className="flex items-center justify-between">
        {STAGE_ORDER.map((stage, index) => {
          const isCompleted = index <= currentIndex
          const isCurrent = index === currentIndex
          const badgeClass = isCompleted ? STAGE_COLORS[stage] : 'badge-muted'

          return (
            <React.Fragment key={stage}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${badgeClass}`}>
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-xs text-text-secondary">{index + 1}</span>
                  )}
                </div>
                <span className={`text-xs mt-1 ${isCurrent ? 'text-text-primary font-semibold' : 'text-text-secondary font-normal'}`}>{STAGE_LABELS[stage]}</span>
              </div>

              {index < STAGE_ORDER.length - 1 && (
                <div className={`flex-1 h-1.5 mx-2 rounded-full ${index < currentIndex ? 'bg-brand' : 'bg-border-primary'}`} />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}