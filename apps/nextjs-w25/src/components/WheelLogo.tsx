import React from 'react'

interface WheelLogoProps {
  className?: string
  title?: string
  style?: React.CSSProperties
}

// Wheel icon with 4 spokes, matching the style of GodModeLogo
export function WheelLogo({ className = 'w-6 h-6', title = 'Wheel', style }: WheelLogoProps) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={title ? undefined : true}
      role="img"
    >
      {title ? <title>{title}</title> : null}
      {/* Outer rim */}
      <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="3" fill="none" />
      {/* Hub */}
      <circle cx="32" cy="32" r="4" fill="currentColor" />
      {/* Spokes (4) */}
      <line x1="32" y1="8" x2="32" y2="56" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="8" y1="32" x2="56" y2="32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
