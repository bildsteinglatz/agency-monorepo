'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Intro } from '@/components/Intro';
import { client } from '@/sanity/client';
import { INTRO_SLIDES_QUERY } from '@/sanity/queries';
import { useIntro } from '@/context/IntroContext';

const PrismAnimation = () => {
  const [start, setStart] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [introSlides, setIntroSlides] = useState<any[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setIntroVisible } = useIntro();
  const isCinematic = searchParams.get('mode') === 'cinematic';

  useEffect(() => {
    if (isCinematic) {
      client.fetch(INTRO_SLIDES_QUERY).then(setIntroSlides);
    }
  }, [isCinematic]);

  useEffect(() => {
    const offset = setTimeout(() => {
      setStart(true);
    }, 100);

    // Redirect to home after animation completes (8s)
    const redirectTimer = setTimeout(() => {
      if (isCinematic) {
        setShowIntro(true);
        setIntroVisible(true);
      } else {
        router.push('/?transition=true');
      }
    }, 8000);

    return () => {
      clearTimeout(offset);
      clearTimeout(redirectTimer);
    }
  }, [router, isCinematic, setIntroVisible]);

  if (showIntro && introSlides.length > 0) {
    return (
      <Intro 
        slides={introSlides} 
        onInteract={() => router.push('/home')} 
      />
    );
  }

  // 6 distinct color bands
  const spectrumColors = [
    '#ff0000', // Red
    '#ff8c00', // Orange  
    '#ffff00', // Yellow
    '#00ff00', // Green
    '#0066ff', // Blue
    '#9400d3', // Violet
  ];

  const totalColors = spectrumColors.length;
  const totalSpread = 20;
  const anglePerColor = totalSpread / totalColors;

  const renderSpectrum = (spread: number) => {
    const angle = spread / totalColors;
    return (
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 3000 2000"
        preserveAspectRatio="xMinYMid slice"
        style={{ overflow: 'visible' }}
      >
        <g transform="translate(-10, 1000)">
          {spectrumColors.map((color, i) => {
            const startAngle = -spread / 2 + (i * angle);
            const endAngle = startAngle + angle;

            const radius = 5000;
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;

            const x1 = Math.cos(startRad) * radius;
            const y1 = Math.sin(startRad) * radius;
            const x2 = Math.cos(endRad) * radius;
            const y2 = Math.sin(endRad) * radius;

            return (
              <polygon
                key={i}
                className={start ? 'spectrum-animate' : ''}
                points={`0,0 ${x1},${y1} ${x2},${y2}`}
                fill={color}
                style={{
                  opacity: 0,
                  transformOrigin: '0 0',
                }}
              />
            );
          })}
        </g>
      </svg>
    );
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans">
      <style>{`
        /* Whole scene moves continuously from right to left */
        @keyframes scene-move {
          0% { 
            transform: translateX(60vw);
          }
          100% { 
            transform: translateX(-250vw);
          }
        }

        /* Beam grows/reveals to hit the prism */
        @keyframes beam-grow {
          0% { 
            clip-path: inset(0 100% 0 0);
          }
          20% {
            clip-path: inset(0 0 0 0);
          }
          90% { 
            clip-path: inset(0 0 0 0);
          }
        }

        /* Spectrum appears after beam hits - just fade in, no scale */
        @keyframes spectrum-appear {
          0% { 
            opacity: 0;
          }
          20% {
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          100% { 
            opacity: 1;
          }
        }

        .scene-animate {
          animation: scene-move 12s linear forwards;
        }

        .beam-animate {
          animation: beam-grow 12s ease-out forwards;
        }

        .spectrum-animate {
          animation: spectrum-appear 12s ease-out forwards;
        }

        @keyframes gradient-flicker {
          0% { filter: hue-rotate(0deg) brightness(1) saturate(1); }
          10% { filter: hue-rotate(3deg) brightness(1.05) saturate(1.05); }
          20% { filter: hue-rotate(-2deg) brightness(0.95) saturate(0.95); }
          30% { filter: hue-rotate(1deg) brightness(1.02) saturate(1.02); }
          40% { filter: hue-rotate(-3deg) brightness(0.98) saturate(0.98); }
          50% { filter: hue-rotate(2deg) brightness(1.05) saturate(1.05); }
          60% { filter: hue-rotate(-1deg) brightness(0.95) saturate(0.95); }
          70% { filter: hue-rotate(3deg) brightness(1.02) saturate(1.02); }
          80% { filter: hue-rotate(-2deg) brightness(0.98) saturate(0.98); }
          90% { filter: hue-rotate(1deg) brightness(1.05) saturate(1.05); }
          100% { filter: hue-rotate(0deg) brightness(1) saturate(1); }
        }

        .flicker-animate {
          animation: gradient-flicker 2s infinite linear;
        }

        @keyframes explode-color {
          0% { transform: translateY(-50%) scale(1); opacity: 1; }
          100% { transform: translateY(-50%) scale(4); opacity: 1; }
        }

        .explode-animate {
          animation: explode-color 1.5s ease-in forwards;
          animation-delay: 6.5s;
        }

        @keyframes fade-in-gradient {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        .gradient-overlay-animate {
          animation: fade-in-gradient 2s ease-in forwards;
          animation-delay: 6s;
        }
      `}</style>

      {/* Fixed viewport */}
      <div className="relative w-full h-full">
        {/* Gradient Overlay for transition */}
        <div 
          className={start ? 'gradient-overlay-animate' : ''}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 100,
            opacity: 0,
            background: 'linear-gradient(90deg, #ff0000, #ff8c00, #ffff00, #00ff00, #0066ff, #9400d3)',
            filter: 'blur(100px)',
            transform: 'scale(1.5)',
            pointerEvents: 'none'
          }}
        />

        {/* SCENE CONTAINER - Everything moves together from right to left */}
        <div
          className={`absolute ${start ? 'scene-animate' : ''}`}
          style={{
            left: '50%',
            top: '50%',
            transform: 'translateX(60vw)',
          }}
        >
          {/* WHITE BEAM - Grows/reveals to hit the prism, stays attached */}
          <div
            className={start ? 'beam-animate' : ''}
            style={{
              position: 'absolute',
              right: '60px',
              top: '0',
              width: '200vw',
              height: '4px',
              background: 'linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.3), white)',
              boxShadow: '0 0 8px white, 0 0 15px rgba(255,255,255,0.5)',
              transform: 'translateY(-80%)',
              clipPath: 'inset(0 100% 0 0)',
            }}
          />

          {/* PRISM - Center of the scene */}
          <div
            className="z-30"
            style={{
              position: 'relative',
              transform: 'translate(-20%, -50%)',
            }}
          >
            <svg width="120" height="120" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="prismGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(40,40,50,0.9)" />
                  <stop offset="50%" stopColor="rgba(20,20,30,0.95)" />
                  <stop offset="100%" stopColor="rgba(50,50,60,0.9)" />
                </linearGradient>
              </defs>
              <path
                d="M50 8 L95 88 L5 88 Z"
                fill="url(#prismGradient)"
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth="1"
              />
            </svg>
          </div>

          {/* SPECTRUM - Appears after beam hits, attached to prism right side */}
          <div
            className={`${start ? 'flicker-animate' : ''} ${start ? 'explode-animate' : ''}`}
            style={{
              position: 'absolute',
              left: '35px',
              top: '0',
              width: '300vw',
              height: '200vh',
              transform: 'translateY(-50%)',
            }}
          >
            {/* Sharp Layer - visible at start, fades out */}
            <div style={{
              position: 'absolute',
              inset: 0,
              filter: 'blur(25px)',
              maskImage: 'linear-gradient(to right, black 0%, black 15%, transparent 60%)',
              WebkitMaskImage: 'linear-gradient(to right, black 0%, black 15%, transparent 60%)',
            }}>
              {renderSpectrum(20)}
            </div>

            {/* Blurred Layer - invisible at start, fades in and widens */}
            <div style={{
              position: 'absolute',
              inset: 0,
              filter: 'blur(80px)',
              opacity: 0.8,
              maskImage: 'linear-gradient(to right, transparent 0%, transparent 10%, black 50%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, transparent 10%, black 50%)',
            }}>
              {renderSpectrum(50)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrismAnimation;
