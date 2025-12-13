'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface IntroContextType {
  isIntroVisible: boolean
  setIntroVisible: (visible: boolean) => void
}

const IntroContext = createContext<IntroContextType>({
  isIntroVisible: true,
  setIntroVisible: () => {},
})

export function IntroProvider({ children }: { children: ReactNode }) {
  const [isIntroVisible, setIntroVisible] = useState(true)

  return (
    <IntroContext.Provider value={{ isIntroVisible, setIntroVisible }}>
      {children}
    </IntroContext.Provider>
  )
}

export function useIntro() {
  return useContext(IntroContext)
}
