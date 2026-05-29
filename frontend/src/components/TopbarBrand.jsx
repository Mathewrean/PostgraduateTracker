import React from 'react'

export const TopbarBrand = ({ subtitle = 'Postgraduate Submissions Tracker', compact = false }) => (
  <div className="topbar-brand">
    <img
      src="/icons/JooustLogo.png"
      alt="JOOUST logo"
      className="topbar-brand__logo"
    />
    {!compact && (
      <div className="topbar-brand__text">
        <strong>JOOUST PST</strong>
        <span>{subtitle}</span>
      </div>
    )}
  </div>
)
