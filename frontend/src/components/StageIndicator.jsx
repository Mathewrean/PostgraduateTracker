import React from 'react'

const STAGE_ORDER = ['CONCEPT', 'PROPOSAL', 'THESIS', 'COMPLETED']

const STAGE_LABELS = {
  CONCEPT: 'Concept',
  PROPOSAL: 'Proposal',
  THESIS: 'Thesis Submission',
  COMPLETED: 'Completed',
}

const STAGE_COLORS = {
  CONCEPT: 'bg-blue-500',
  PROPOSAL: 'bg-purple-500',
  THESIS: 'bg-orange-500',
  COMPLETED: 'bg-green-500',
}

export const StageIndicator = ({ currentStage, isDark = false }) => {
  const currentIndex = STAGE_ORDER.indexOf(currentStage) || 0
  
  const bgColor = isDark ? 'bg-gray-800' : 'bg-white'
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200'
  const textColor = isDark ? 'text-gray-300' : 'text-gray-600'

  return (
    <div className={`${bgColor} p-4 rounded-lg border ${borderColor}`}>
      <h3 className={`text-sm font-semibold ${textColor} mb-3`}>Progress</h3>
      
      <div className="flex items-center justify-between">
        {STAGE_ORDER.map((stage, index) => {
          const isCompleted = index <= currentIndex
          const isCurrent = index === currentIndex
          
          return (
            <React.Fragment key={stage}>
              {/* Stage Dot */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? STAGE_COLORS[stage]
                      : isDark
                      ? 'bg-gray-700'
                      : 'bg-gray-200'
                  } ${isCurrent ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                >
                  {isCompleted ? (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <span className="text-xs text-gray-500">{index + 1}</span>
                  )}
                </div>
                <span className={`text-xs mt-1 ${textColor} ${isCurrent ? 'font-semibold' : ''}`}>
                  {STAGE_LABELS[stage]}
                </span>
              </div>
              
              {/* Connector Line */}
              {index < STAGE_ORDER.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded ${
                    index < currentIndex
                      ? 'bg-blue-500'
                      : isDark
                      ? 'bg-gray-700'
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}