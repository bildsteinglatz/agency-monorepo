import React from 'react'

interface GodModeLogoProps {
  className?: string
  title?: string
}

export function GodModeLogo({ className = 'w-6 h-6', title = 'God Mode' }: GodModeLogoProps) {
  // Eye-in-triangle logo; uses currentColor so it matches theme and hover
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={title ? undefined : true}
      role="img"
    >
      {title ? <title>{title}</title> : null}
      {/* Triangle */}
      <path
        d="M32 6 L58 54 H6 Z"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinejoin="round"
      />
      {/* Eye outline */}
      <ellipse cx="32" cy="34" rx="12" ry="7" stroke="currentColor" strokeWidth="3" fill="none" />
      {/* Pupil */}
      <circle cx="32" cy="34" r="3.5" fill="currentColor" />
    </svg>
  )
}
