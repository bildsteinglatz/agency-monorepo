'use client'

import { useRouter } from 'next/navigation'

export function ExhibitionBackButton() {
  const router = useRouter()

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault()
    // Check if there is history to go back to
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/app/exhibitions')
    }
  }

  return (
    <a 
      href="/app/exhibitions" 
      onClick={handleBack}
      className="px-0 py-0 hover:opacity-60 transition-opacity cursor-pointer"
    >
      back
    </a>
  )
}
