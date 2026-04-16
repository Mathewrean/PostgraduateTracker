import React from 'react'

export const Grid = ({
  children,
  columns = 3,
  gap = 6,
  className = '',
}) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5',
  }

  const gapClasses = {
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8',
  }

  return (
    <div
      className={`grid ${gridClasses[Math.min(columns, 5)]} ${
        gapClasses[gap] || gapClasses[6]
      } ${className}`}
    >
      {children}
    </div>
  )
}

export const Container = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export const Section = ({ children, className = '', ...props }) => {
  return (
    <section
      className={`py-12 md:py-16 lg:py-20 ${className}`}
      {...props}
    >
      {children}
    </section>
  )
}
