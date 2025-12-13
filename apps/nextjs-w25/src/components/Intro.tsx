'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ArrowDown } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { useIntro } from '@/context/IntroContext'

interface IntroSlide {
  _id: string
  title: string
  statement: string
  image: {
    asset: {
      url: string
      metadata: {
        lqip: string
      }
    }
    alt?: string
  }
}

export function Intro({ slides, onInteract }: { slides: IntroSlide[], onInteract?: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const { isIntroVisible, setIntroVisible } = useIntro()
  const hasSlides = slides && slides.length > 0
  const introRef = useRef<HTMLHeadingElement | null>(null)
  const [scale, setScale] = useState(1)
  const BASE_FONT_PX = 400 // fixed large base used for measurement and display
  const MIN_SCALE = 0.18 // don't let computed scale drop below this (protect against tiny fonts in prod)

  // Debug: log computed styles for the intro headline to help diagnose
  // why the font-size may be different from expectations. Also compute
  // a fitting scale so the headline fits 90% of the viewport width/height.
  useEffect(() => {
    const el = introRef.current
    if (!el) return

    const computeScale = async () => {
      // Wait for webfonts to be ready so measurements are stable
      if (document && (document as any).fonts && (document as any).fonts.ready) {
        try { await (document as any).fonts.ready } catch (e) { /* ignore */ }
      }

      // Use an off-DOM measurement element that copies the headline classes
      // and forces a single-line measurement. Use a fixed large base font
      // size so final font size = BASE_FONT_PX * scale and measurements are
      // consistent across runs.
      const text = el.textContent || ''
      const basePx = BASE_FONT_PX

      const meas = document.createElement('div')
      // Copy classes to get the same font-family/weight/italic/etc.
      meas.className = el.className || ''
      meas.style.position = 'absolute'
      meas.style.left = '-9999px'
      meas.style.top = '-9999px'
      meas.style.visibility = 'hidden'
      meas.style.whiteSpace = 'nowrap'
      meas.style.maxWidth = 'none'
      meas.style.fontSize = basePx + 'px'
      meas.style.lineHeight = 'normal'
      meas.textContent = text
      document.body.appendChild(meas)

      const measRect = meas.getBoundingClientRect()
      const maxW = window.innerWidth * 0.9
      const maxH = window.innerHeight * 0.9
      const scaleX = maxW / (measRect.width || 1)
      const scaleY = maxH / (measRect.height || 1)
      const rawScale = Math.min(1, scaleX, scaleY)
      const newScale = Math.max(MIN_SCALE, rawScale)

      // Clean up measurement node
      document.body.removeChild(meas)

      setScale(newScale)

      if (newScale <= MIN_SCALE + 0.001 && rawScale < MIN_SCALE) {
        console.warn('Intro debug — scale clamped to MIN_SCALE', { rawScale, newScale, measRect })
      }

      const cs = window.getComputedStyle(el)
      console.log('Intro debug — computed font-size (base px):', basePx + 'px', 'computed font-size:', cs.fontSize, 'font-family:', cs.fontFamily, 'line-height:', cs.lineHeight)
      console.log('Intro debug — classes:', el.className)
      console.log('Intro debug — measured single-line rect:', measRect, 'appliedScale:', newScale)
    }

    // compute after next frame (allow layout/fonts to settle)
    let raf = 0
    const schedule = () => {
      if (raf) cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => computeScale())
    }

    schedule()
    window.addEventListener('resize', schedule)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('resize', schedule)
    }
  }, [currentSlide, slides])

  // If no slides, immediately set intro as not visible so nav shows
  useEffect(() => {
    if (!hasSlides) {
      setIntroVisible(false)
    }
  }, [hasSlides, setIntroVisible])

  useEffect(() => {
    if (!hasSlides || slides.length <= 1) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [slides, hasSlides])

  // Scroll listener removed to allow native scrolling. 
  // We rely on standard scroll behavior now.
  // Context usage for `isIntroVisible` might still be relevant if used for other things, 
  // but in the new flow HomeClient manages the layout. 
  // Ideally, Intro doesn't need to know about global state anymore if it's just a section.

  // Checking usage... `setIntroVisible` was used to hide intro if no slides.
  // We should keep that logic if it's critical, or move it up.
  // For now, removing the aggressive wheel listener is the main goal.

  if (!hasSlides) {
    return null
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      {/* Initial Gradient Overlay - Fades out to reveal image */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 2.0, ease: "easeOut", delay: 1.5 }}
        className="absolute inset-0 z-[5] pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, #ff0000, #ff8c00, #ffff00, #00ff00, #0066ff, #9400d3)',
          filter: 'blur(100px)',
          transform: 'scale(1.5)'
        }}
      />

      {/* Background Image - Render a single
          child for AnimatePresence(mode="wait") to avoid conflicting presence
          behavior when animating slides. */}
      {slides[currentSlide] && slides[currentSlide].image?.asset?.url && (
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={slides[currentSlide]._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
              onClick={onInteract}
            >
              <Image
                src={slides[currentSlide].image.asset.url}
                alt={slides[currentSlide].image.alt || slides[currentSlide].title || ''}
                fill
                className="object-cover"
                priority={true}
                placeholder={slides[currentSlide].image.asset.metadata?.lqip ? "blur" : "empty"}
                blurDataURL={slides[currentSlide].image.asset.metadata?.lqip}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 pointer-events-none">
        <AnimatePresence mode="wait">
            {slides[currentSlide] && (
              <motion.h1
                ref={introRef}
                key={slides[currentSlide]._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="font-owners italic text-white text-left leading-[0.85] drop-shadow-lg intro-headline"
                style={{ fontSize: `${BASE_FONT_PX}px`, color: '#ffffff', whiteSpace: 'nowrap', transform: `scale(${scale})`, transformOrigin: 'left center', transition: 'transform 280ms cubic-bezier(.2,.9,.2,1)', textAlign: 'left', maxWidth: '90vw' }}
              >
                {slides[currentSlide].statement}
              </motion.h1>
            )}
        </AnimatePresence>
      </div>

      {/* Arrow */}
      <div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 cursor-pointer" 
        onClick={(e) => {
            e.stopPropagation();
            onInteract?.();
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ opacity: { delay: 2, duration: 1 }, y: { repeat: Infinity, duration: 2 } }}
        >
          <ArrowDown className="text-neon-orange w-8 h-8 md:w-12 md:h-12 drop-shadow-md" />
        </motion.div>
      </div>
      
      {/* Click handler for the whole area */}
      <div className="absolute inset-0 z-30 cursor-pointer" onClick={onInteract} />
    </div>
  )
}