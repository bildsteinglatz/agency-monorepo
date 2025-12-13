'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './page.module.css';

interface WheelState {
  isAnimating: boolean;
  startTime: number;
  startAngle: number;
  speed: number;
  isDecelerating: boolean;
  decelStartTime: number;
  decelStartSpeed: number;
  decelEndSpeed: number;
  decelDuration: number;
}

export function ColorWheelDemo() {
  // Control refs
  const wheelRef = useRef<SVGSVGElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const animationFrameRef = useRef<number>(0);
  const requestRef = useRef<number>(0);

  // Animation settings
  const [normalSpeed, setNormalSpeed] = useState(8.0);
  const [hoverSpeed, setHoverSpeed] = useState(0.85);
  const [scaleEffect, setScaleEffect] = useState(1.2);
  const [selectedColor, setSelectedColor] = useState('#4219e6');
  const [colorPosition, setColorPosition] = useState(67); // Default blue position for #4219e6
  const [selectedPattern, setSelectedPattern] = useState('rainbow');
  const [gummyBears, setGummyBears] = useState<Array<{id: number, pattern: string, angle: number, distance: number, flyingAway: boolean, flyDirection?: {x: number, y: number}, emoji: string, rotationSpeed: number, flySize: number, flySpeed: number}>>([]);
  const [isGravityOff, setIsGravityOff] = useState(false);
  const [orbitalParticles, setOrbitalParticles] = useState<Array<{
    id: number, 
    emoji: string, 
    orbitRadius: number, 
    orbitSpeed: number, 
    orbitAngle: number,
    size: number,
    wobbleAmount: number,
    wobbleSpeed: number,
    wobbleOffset: number
  }>>([]);

  // Pattern definitions
  const patterns = {
    rainbow: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
    redGummy: 'linear-gradient(to right, #ff4444, #ff6666, #ff8888, #ffaaaa, #ff4444)',
    greenGummy: 'linear-gradient(to right, #44ff44, #66ff66, #88ff88, #aaffaa, #44ff44)',
    blueGummy: 'linear-gradient(to right, #4444ff, #6666ff, #8888ff, #aaaaff, #4444ff)',
    yellowGummy: 'linear-gradient(to right, #ffff44, #ffff66, #ffff88, #ffffaa, #ffff44)',
    purpleGummy: 'linear-gradient(to right, #ff44ff, #ff66ff, #ff88ff, #ffaaff, #ff44ff)',
  };
  
  // Emoji definitions for patterns
  const patternEmojis = {
    rainbow: ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '❤️', '🧡', '💛', '💚', '💙', '💜'],
    redGummy: ['🐅', '🦊', '🦁', '🦞', '🍎'],
    greenGummy: ['🦁', '🐊', '🐢', '🥝', '🥑'],
    blueGummy: ['🦒', '🐋', '🐬', '🐟', '🌊'],
    yellowGummy: ['🐻', '🍋', '🌻', '🌟', '🍌'],
    purpleGummy: ['🐨', '🦄', '🍇', '💜', '🔮'],
  };

  // Stats display
  const [currentSpeed, setCurrentSpeed] = useState(normalSpeed);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [animationState, setAnimationState] = useState('Normal');
  const [elapsedTime, setElapsedTime] = useState(0);

  // Wheel state
  const wheelState = useRef<WheelState>({
    isAnimating: false,
    startTime: 0,
    startAngle: 0,
    speed: normalSpeed,
    isDecelerating: false,
    decelStartTime: 0,
    decelStartSpeed: 0,
    decelEndSpeed: 0,
    decelDuration: 0
  });

  // Extract rotation angle from transform string
  const extractRotationAngle = (transformStr: string): number => {
    if (!transformStr || transformStr === 'none') return 0;
    
    // Try to match a direct rotate() transform first (simpler case)
    const rotateMatch = transformStr.match(/rotate\(([0-9.-]+)deg\)/);
    if (rotateMatch && rotateMatch[1]) {
      return parseFloat(rotateMatch[1]);
    }
    
    // Fall back to matrix extraction if needed
    const matrixMatch = transformStr.match(/matrix\((.*?)\)/);
    if (!matrixMatch || !matrixMatch[1]) return 0;
    
    const values = matrixMatch[1].split(',').map(v => parseFloat(v.trim()));
    if (values.length < 4) return 0;
    
    // For a 2D rotation matrix, the angle can be extracted from the first two values
    const a = values[0];
    const b = values[1];
    
    // Use atan2 to get the angle in radians, then convert to degrees
    let angle = Math.atan2(b, a) * (180 / Math.PI);
    if (angle < 0) angle += 360; // Normalize to 0-360
    
    return angle;
  };

  // Smooth easing function for deceleration (like theme switch)
  const easeOutCubic = (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  };

    // Create a new orbital particle
  const createOrbitalParticle = (emoji: string) => {
    return {
      id: Date.now() + Math.random(),
      emoji,
      orbitRadius: 150 + Math.random() * 50, // Random orbit distance
      orbitSpeed: (Math.random() * 0.01) - 0.005, // Random speed and direction
      orbitAngle: Math.random() * Math.PI * 2, // Random start position
      size: 15 + Math.random() * 10,
      wobbleAmount: 5 + Math.random() * 10,
      wobbleSpeed: 0.005 + Math.random() * 0.01,
      wobbleOffset: Math.random() * Math.PI * 2
    };
  };

  // Add orbital particles
  const addOrbitalParticles = (pattern: string, count = 1) => {
    const emojisForPattern = patternEmojis[pattern as keyof typeof patternEmojis] || ['🦄'];
    interface NewParticle extends ReturnType<typeof createOrbitalParticle> {}

    const newParticles: NewParticle[] = [];
    
    for (let i = 0; i < count; i++) {
      const randomEmoji = emojisForPattern[Math.floor(Math.random() * emojisForPattern.length)];
      newParticles.push(createOrbitalParticle(randomEmoji));
    }
    
    setOrbitalParticles(prev => [...prev, ...newParticles]);
  };

  // Update orbital particles animation
  useEffect(() => {
    const updateParticles = () => {
      setOrbitalParticles(prevParticles => 
        prevParticles.map(particle => {
          // Update orbit angle
          const newAngle = particle.orbitAngle + particle.orbitSpeed;
          
          // Apply gravity effect if not turned off
          let newRadius = particle.orbitRadius;
          if (!isGravityOff) {
            // Particles slowly drift toward wheel center
            newRadius = Math.max(100, particle.orbitRadius - 0.1);
          } else {
            // In space, particles drift slightly in and out
            newRadius = particle.orbitRadius + Math.sin(Date.now() * 0.0001 + particle.wobbleOffset) * 0.3;
          }
          
          return {
            ...particle,
            orbitAngle: newAngle,
            orbitRadius: newRadius
          };
        }).filter(p => isGravityOff || p.orbitRadius > 100) // Remove particles that get too close to wheel
      );
    };
    
    const animationId = requestAnimationFrame(function animate() {
      updateParticles();
      requestAnimationFrame(animate);
    });
    
    return () => cancelAnimationFrame(animationId);
  }, [isGravityOff]);

  // Convert slider position (0-100) to color based on selected pattern
  const getColorFromPosition = useCallback((position: number) => {
    if (selectedPattern === 'rainbow') {
      // For rainbow, map position to hue (0-360)
      const hue = position * 3.6; // 100 * 3.6 = 360
      return `hsl(${hue}, 100%, 50%)`;
    }
    
    // For gummy patterns, return pattern-specific colors
    const patternColors: { [key: string]: string[] } = {
      redGummy: ['#ff0000', '#ff3333', '#ff6666', '#ff9999', '#ffcccc'],
      greenGummy: ['#00ff00', '#33ff33', '#66ff66', '#99ff99', '#ccffcc'],
      blueGummy: ['#0000ff', '#3333ff', '#6666ff', '#9999ff', '#ccccff'],
      yellowGummy: ['#ffff00', '#ffff33', '#ffff66', '#ffff99', '#ffffcc'],
      purpleGummy: ['#ff00ff', '#ff33ff', '#ff66ff', '#ff99ff', '#ffccff'],
    };
    
    const colors = patternColors[selectedPattern] || patternColors.redGummy;
    const index = Math.floor((position / 100) * colors.length);
    return colors[Math.min(index, colors.length - 1)];
  }, [selectedPattern]);

  // Start smooth deceleration
  const startDeceleration = (fromSpeed: number, toSpeed: number, duration: number) => {
    if (!wheelRef.current) return;

    // Get current rotation to preserve position
    const currentTransform = wheelRef.current.style.transform || 'rotate(0deg)';
    const currentAngleValue = extractRotationAngle(currentTransform);

    // Set up deceleration state
    wheelState.current.isDecelerating = true;
    wheelState.current.decelStartTime = performance.now();
    wheelState.current.decelStartSpeed = fromSpeed;
    wheelState.current.decelEndSpeed = toSpeed;
    wheelState.current.decelDuration = duration * 1000; // convert to ms

    // Preserve the current rotation position
    wheelState.current.startTime = performance.now();
    wheelState.current.startAngle = currentAngleValue;

    // Update UI state
    setAnimationState('Decelerating');
  };

  // Main animation function
  const animateWheel = useCallback((timestamp: number) => {
    if (!wheelRef.current || !wheelState.current.isAnimating) {
      requestRef.current = requestAnimationFrame(animateWheel);
      return;
    }

    // Calculate elapsed time
    const elapsed = timestamp - wheelState.current.startTime;
    const totalElapsed = (timestamp - performance.now() + wheelState.current.startTime) / 1000; // in seconds

    // Calculate current speed based on deceleration state
    let currentSpeedValue = wheelState.current.speed;

    if (wheelState.current.isDecelerating) {
      // Calculate deceleration progress
      const decelElapsed = timestamp - wheelState.current.decelStartTime;
      const decelProgress = Math.min(decelElapsed / wheelState.current.decelDuration, 1);

      // Use smooth easing for deceleration
      const easeValue = easeOutCubic(decelProgress);

      // Interpolate between start and end speeds
      currentSpeedValue = wheelState.current.decelStartSpeed + 
        (wheelState.current.decelEndSpeed - wheelState.current.decelStartSpeed) * easeValue;

      // Update the main speed state
      wheelState.current.speed = currentSpeedValue;

      // If deceleration is complete
      if (decelProgress >= 1) {
        wheelState.current.isDecelerating = false;
        wheelState.current.speed = wheelState.current.decelEndSpeed;
        setAnimationState('Normal');
      }
    }

    // Calculate rotation
    const degreesPerSecond = 360 / currentSpeedValue;
    const rotation = (wheelState.current.startAngle + (elapsed * degreesPerSecond / 1000)) % 360;

    // Apply rotation
    wheelRef.current.style.transform = `rotate(${rotation}deg)`;

    // Update stats
    setCurrentSpeed(currentSpeedValue);
    setCurrentAngle(rotation);
    setElapsedTime(totalElapsed);

    // Continue animation
    requestRef.current = requestAnimationFrame(animateWheel);
  }, []);



  const updateAnimationSpeed = (targetSpeed: number, newState: string, useDeceleration: boolean = false) => {
    if (!wheelRef.current) return;
    
    if (useDeceleration) {
      // Use smooth deceleration for mouse leave
      const currentSpeed = wheelState.current.speed;
      startDeceleration(currentSpeed, targetSpeed, 3.0); // 3 second smooth deceleration
    } else {
      // Immediate speed change for mouse enter
      const currentAngleValue = extractRotationAngle(wheelRef.current.style.transform || 'rotate(0deg)');
      wheelState.current.startTime = performance.now();
      wheelState.current.startAngle = currentAngleValue;
      wheelState.current.speed = targetSpeed;
      wheelState.current.isDecelerating = false; // Stop any ongoing deceleration
      setAnimationState(newState);
    }
  };

  // Start the animation on component mount
  useEffect(() => {
    // Initialize animation state
    wheelState.current.isAnimating = true;
    wheelState.current.startTime = performance.now();
    wheelState.current.speed = normalSpeed;

    // Start the animation loop
    requestRef.current = requestAnimationFrame(animateWheel);

    // Cleanup on unmount
    return () => {
      const wheelStateCurrent = wheelState.current;
      wheelStateCurrent.isAnimating = false;
      cancelAnimationFrame(requestRef.current);
    };
  }, [animateWheel]);

  // Handle gummy bear flying away when speed is very fast
  useEffect(() => {
    if (currentSpeed < 0.8) { // Very fast rotation
      // Mark bears as flying away with random directions
      setGummyBears(prev => prev.map(bear => ({ 
        ...bear, 
        flyingAway: true,
        flyDirection: {
          x: (Math.random() - 0.5) * 1600, // Much further x direction (-800 to 800px)
          y: (Math.random() - 0.5) * 1200  // Much further y direction (-600 to 600px)
        }
      })));
      
      // Remove bears after they fly away
      const flyAwayTimer = setTimeout(() => {
        setGummyBears(prev => prev.filter(bear => !bear.flyingAway));
      }, 4000); // Even longer time for much further flight
      
      return () => clearTimeout(flyAwayTimer);
    }
  }, [currentSpeed]);

  return (
    <div className={styles.demoSection}>
      <div className={styles.wheelDemo}>
        {/* Render orbital particles */}
        {orbitalParticles.map(particle => {
          // Calculate position based on orbit
          const x = Math.cos(particle.orbitAngle) * particle.orbitRadius;
          const y = Math.sin(particle.orbitAngle) * particle.orbitRadius;
          
          // Add wobble effect
          const wobbleX = Math.sin(Date.now() * particle.wobbleSpeed) * particle.wobbleAmount;
          const wobbleY = Math.cos(Date.now() * particle.wobbleSpeed + particle.wobbleOffset) * particle.wobbleAmount;
          
          return (
            <div
              key={particle.id}
              style={{
                position: 'absolute',
                left: `calc(50% + ${x + wobbleX}px)`,
                top: `calc(50% + ${y + wobbleY}px)`,
                fontSize: `${particle.size}px`,
                transform: `translate(-50%, -50%) ${isGravityOff ? 'rotate(' + (Date.now() * 0.01) % 360 + 'deg)' : ''}`,
                zIndex: 5,
                transition: isGravityOff ? 'left 0.5s ease-out, top 0.5s ease-out' : 'none',
                textShadow: '0 0 5px rgba(255,255,255,0.7)'
              }}
            >
              {particle.emoji}
            </div>
          );
        })}
        <button 
          ref={buttonRef}
          className={styles.wheelButton}
          style={{
            transition: 'transform 1.2s cubic-bezier(0.25, 1, 0.5, 1)',
            transform: 'scale(1)',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            border: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            background: 'transparent'
          }}
          onMouseEnter={() => {
            // Speed up rotation - start from current position
            updateAnimationSpeed(hoverSpeed, 'Accelerated');
            if (buttonRef.current) {
              buttonRef.current.style.transform = `scale(${scaleEffect})`;
              buttonRef.current.style.transition = 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            }
          }}
          onMouseLeave={() => {
            // Return to normal speed with smooth deceleration
            updateAnimationSpeed(normalSpeed, 'Normal', true);
            if (buttonRef.current) {
              buttonRef.current.style.transform = 'scale(1)';
              buttonRef.current.style.transition = 'transform 2.5s cubic-bezier(0.25, 1, 0.5, 1)';
            }
          }}
        >
          <svg 
            ref={wheelRef}
            width="60" 
            height="60" 
            viewBox="0 0 24 24" 
            style={{
              willChange: 'transform',
              transformOrigin: 'center',
              transition: 'none'
            }}
          >
            {/* Top-left quarter - Black with emojis */}
            <path 
              d="M 12 12 L 12 2 A 10 10 0 0 0 2 12 Z" 
              fill="#000000"
            />
            {/* Red animal emoji in top-left quarter when redGummy pattern is activated */}
            {selectedPattern === 'redGummy' && (
              <text x="7" y="7" fontSize="3" fill="#ff6666" textAnchor="middle">🐯</text>
            )}
            
            {/* Top-right quarter - White with emojis */}
            <path 
              d="M 12 12 L 22 12 A 10 10 0 0 0 12 2 Z" 
              fill="#ffffff"
              stroke="#ccc"
              strokeWidth="0.5"
            />
            {/* Green animal emoji in top-right quarter when greenGummy pattern is activated */}
            {selectedPattern === 'greenGummy' && (
              <text x="17" y="7" fontSize="3" fill="darkgreen" textAnchor="middle">🐊</text>
            )}
            
            {/* Bottom-right quarter - Rainbow gradient with emojis */}
            <path 
              d="M 12 12 L 12 22 A 10 10 0 0 0 22 12 Z" 
              fill="url(#pattern-demo)"
            />
            {/* Rainbow emoji in bottom-right quarter when rainbow pattern is activated */}
            {selectedPattern === 'rainbow' && (
              <text x="17" y="17" fontSize="3" fill="white" textAnchor="middle">🌈</text>
            )}
            
            {/* Bottom-left quarter - Blue with emojis */}
            <path 
              d="M 12 12 L 2 12 A 10 10 0 0 0 12 22 Z" 
              fill={selectedColor}
            />
            {/* Blue animal emoji in bottom-left quarter when blueGummy pattern is activated */}
            {selectedPattern === 'blueGummy' && (
              <text x="7" y="17" fontSize="3" fill="lightblue" textAnchor="middle">🦒</text>
            )}
            <defs>
              <linearGradient id="pattern-demo" x1="0%" y1="0%" x2="100%" y2="100%">
                {selectedPattern === 'rainbow' ? (
                  <>
                    <stop offset="0%" stopColor="#ff69b4" />
                    <stop offset="20%" stopColor="#32cd32" />
                    <stop offset="40%" stopColor="#ffd700" />
                    <stop offset="60%" stopColor="#ff1493" />
                    <stop offset="80%" stopColor="#7fff00" />
                    <stop offset="100%" stopColor="#ff6347" />
                  </>
                ) : selectedPattern === 'redGummy' ? (
                  <>
                    <stop offset="0%" stopColor="#ff2222" />
                    <stop offset="25%" stopColor="#ff4444" />
                    <stop offset="50%" stopColor="#ff6666" />
                    <stop offset="75%" stopColor="#ff8888" />
                    <stop offset="100%" stopColor="#ffaaaa" />
                  </>
                ) : selectedPattern === 'greenGummy' ? (
                  <>
                    <stop offset="0%" stopColor="#22ff22" />
                    <stop offset="25%" stopColor="#44ff44" />
                    <stop offset="50%" stopColor="#66ff66" />
                    <stop offset="75%" stopColor="#88ff88" />
                    <stop offset="100%" stopColor="#aaffaa" />
                  </>
                ) : selectedPattern === 'blueGummy' ? (
                  <>
                    <stop offset="0%" stopColor="#2222ff" />
                    <stop offset="25%" stopColor="#4444ff" />
                    <stop offset="50%" stopColor="#6666ff" />
                    <stop offset="75%" stopColor="#8888ff" />
                    <stop offset="100%" stopColor="#aaaaff" />
                  </>
                ) : selectedPattern === 'yellowGummy' ? (
                  <>
                    <stop offset="0%" stopColor="#ffff22" />
                    <stop offset="25%" stopColor="#ffff44" />
                    <stop offset="50%" stopColor="#ffff66" />
                    <stop offset="75%" stopColor="#ffff88" />
                    <stop offset="100%" stopColor="#ffffaa" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stopColor="#ff22ff" />
                    <stop offset="25%" stopColor="#ff44ff" />
                    <stop offset="50%" stopColor="#ff66ff" />
                    <stop offset="75%" stopColor="#ff88ff" />
                    <stop offset="100%" stopColor="#ffaaff" />
                  </>
                )}
              </linearGradient>
            </defs>
          </svg>
          
          {/* Multiple gummy bears overlay */}
          {gummyBears.map(bear => {
            const getHueRotation = (pattern: string) => {
              if (pattern === 'redGummy') return '0deg';
              if (pattern === 'greenGummy') return '120deg';  
              if (pattern === 'blueGummy') return '240deg';
              if (pattern === 'yellowGummy') return '60deg';
              if (pattern === 'purpleGummy') return '300deg';
              return '0deg';
            };
            
            // Calculate speed-based effects
            const isVeryFast = currentSpeed < 1; // Very fast rotation
            const isFast = currentSpeed < 3; // Fast rotation
            // Individual bear rotation based on wheel speed and bear's personal rotation speed
            const bearRotation = isFast ? currentAngle * bear.rotationSpeed * (currentSpeed < 2 ? 1.5 : 1) : currentAngle * bear.rotationSpeed * 0.1;
            
            // Handle flying away vs normal positioning
            let transform;
            if (bear.flyingAway && bear.flyDirection) {
              // Flying away: translate to random screen position with spinning
              transform = `translate(-50%, -50%) translate(${bear.flyDirection.x}px, ${bear.flyDirection.y}px) rotate(${bearRotation * 4}deg)`;
            } else {
              // Normal positioning: orbit around wheel center with individual rotation
              transform = `translate(-50%, -50%) rotate(${bear.angle}deg) translateX(${bear.distance}px) rotate(${bearRotation}deg)`;
            }
            
            return (
              <div
                key={bear.id}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform,
                  fontSize: bear.flyingAway ? '20px' : (isVeryFast ? '24px' : '28px'),
                  pointerEvents: 'none',
                  filter: `hue-rotate(${getHueRotation(bear.pattern)}) saturate(1.5) brightness(1.2)`,
                  textShadow: bear.flyingAway ? 'none' : `0 0 8px ${selectedColor}`,
                  zIndex: bear.flyingAway ? 20 : 10,
                  transition: bear.flyingAway 
                    ? 'transform 4s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 4s ease-out, font-size 0.5s ease-out' 
                    : 'transform 0.3s ease',
                  opacity: bear.flyingAway ? 0 : (isVeryFast ? 0.7 : 1),
                  animation: bear.flyingAway 
                    ? 'none'
                    : (isFast ? 'gummyBearSpin 0.5s linear infinite' : 'none')
                }}
              >
                {bear.emoji}
              </div>
              );
          })}
          
          {/* CSS for gummy bear animations */}
          <style jsx>{`
            @keyframes gummyBearSpin {
              from { transform: translate(-50%, -50%) rotate(var(--bear-angle)) translateX(var(--bear-distance)) rotate(0deg); }
              to { transform: translate(-50%, -50%) rotate(var(--bear-angle)) translateX(var(--bear-distance)) rotate(360deg); }
            }
          `}</style>
        </button>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '2rem', alignItems: 'flex-start', width: '100%', maxWidth: '900px', marginTop: '120px' }}>
          <div className={styles.controlsContainer} style={{ flexBasis: '60%', flexShrink: 0 }}>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                speed: {normalSpeed.toFixed(1)}
                <input 
                  type="range" 
                  min="1" 
                  max="9" 
                  step="0.1" 
                  value={10 - normalSpeed} 
                  onChange={(e) => setNormalSpeed(10 - parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </label>
            </div>
            
            <div className={styles.controlGroup}>
              <div className={styles.buttonGroup}>
                <button 
                  onClick={() => setIsGravityOff(!isGravityOff)}
                  style={{
                    background: isGravityOff ? '#4c1d95' : '#6b21a8',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    boxShadow: isGravityOff ? '0 0 10px rgba(147, 51, 234, 0.7)' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Gravity: {isGravityOff ? 'OFF 🚀' : 'ON 🌍'}
                </button>
                <button 
                  onClick={() => addOrbitalParticles(selectedPattern, 3)}
                  style={{
                    background: '#047857',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Add Particles 💫
                </button>
              </div>
            </div>
            
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                hover speed effect factor: {hoverSpeed.toFixed(2)}
                <input 
                  type="range" 
                  min="0.25" 
                  max="2" 
                  step="0.05" 
                  value={2.25 - hoverSpeed} 
                  onChange={(e) => setHoverSpeed(2.25 - parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </label>
            </div>
            

            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                size matters: {scaleEffect.toFixed(1)}x
                <input 
                  type="range" 
                  min="1" 
                  max="2" 
                  step="0.05" 
                  value={scaleEffect} 
                  onChange={(e) => setScaleEffect(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </label>
            </div>

            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                color:
                <div style={{ 
                  position: 'relative', 
                  width: '100%', 
                  height: '20px', 
                  background: patterns[selectedPattern as keyof typeof patterns],
                  borderRadius: '10px',
                  margin: '8px 0'
                }}>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    step="1" 
                    value={colorPosition}
                    onChange={(e) => {
                      const pos = parseFloat(e.target.value);
                      setColorPosition(pos);
                      setSelectedColor(getColorFromPosition(pos));
                    }}
                    style={{ 
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      width: '100%', 
                      height: '20px',
                      opacity: '0',
                      cursor: 'pointer'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: `${colorPosition}%`,
                    transform: 'translate(-50%, -50%)',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'transparent',
                    border: '1px solid white',
                    pointerEvents: 'none'
                  }} />
                </div>
              </label>
            </div>

            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                patterns:
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gap: '4px',
                  margin: '8px 0'
                }}>
                  {Object.entries(patterns).map(([key, gradient]) => (
                    <div
                      key={key}
                      onClick={() => {
                        setSelectedPattern(key);
                        
                        // Add orbital particles when clicking a pattern
                        addOrbitalParticles(key, 3);
                        
                        // Add a new emoji when clicking any pattern
                        const patternEmojiList = patternEmojis[key as keyof typeof patternEmojis] || ['🦊'];
                        const existingCount = gummyBears.length;
                        
                        // Position emojis randomly around the circle
                        const angle = Math.random() * 360;
                        const distanceOptions = [
                          5 + Math.random() * 10,  // Inner circle (5-15px)
                          20 + Math.random() * 15, // Middle circle (20-35px) 
                          40 + Math.random() * 15  // Outer circle (40-55px)
                        ];
                        
                        const selectedDistance = distanceOptions[existingCount % 3];
                        
                        const newBear = {
                          id: Date.now() + Math.random(),
                          pattern: key,
                          angle: angle,
                          distance: selectedDistance,
                          flyingAway: false,
                          emoji: patternEmojiList[Math.floor(Math.random() * patternEmojiList.length)],
                          rotationSpeed: 0.5 + Math.random() * 1.5,
                          flySize: 0.7 + Math.random() * 1.0,
                          flySpeed: 0.5 + Math.random() * 1.5
                        };
                        
                        if (key === 'rainbow') {
                          // Clear existing bears when switching to rainbow
                          setGummyBears([]);
                        } else {
                          // Add to existing bears for other patterns
                          setGummyBears(prev => [...prev, newBear]);
                        }
                      }}
                      style={{
                        height: '40px', // Double the height of color bar (20px)
                        background: gradient,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: selectedPattern === key ? '2px solid white' : '1px solid #ccc',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        transition: 'all 0.2s ease'
                      }}
                      title={key}
                    >
                      {/* Animal emojis for different patterns */}
                      {key === 'rainbow' && '🌈'}
                      {key === 'redGummy' && '🐅'} {/* Tiger */}
                      {key === 'greenGummy' && '🦁'} {/* Lion */}
                      {key === 'blueGummy' && '🦒'} {/* Giraffe */}
                      {key === 'yellowGummy' && '🐻'} {/* Bear */}
                      {key === 'purpleGummy' && '🐨'} {/* Koala */}
                    </div>
                  ))}
                </div>
              </label>
            </div>
          </div>
          <div className={styles.statsContainer} style={{ flexBasis: '40%', flexShrink: 0 }}>
            <div className={styles.statRow}>
              <span>Current Speed:</span>
              <span className={styles.statValue}>{currentSpeed.toFixed(2)} s/rotation</span>
            </div>
            <div className={styles.statRow}>
              <span>Current Angle:</span>
              <span className={styles.statValue}>{currentAngle.toFixed(1)}°</span>
            </div>
            <div className={styles.statRow}>
              <span>State:</span>
              <span className={styles.statValue}>{animationState}</span>
            </div>
            <div className={styles.statRow}>
              <span>Time Elapsed:</span>
              <span className={styles.statValue}>{elapsedTime.toFixed(1)} s</span>
            </div>
            <div className={styles.statRow}>
              <span>Selected Color:</span>
              <span className={styles.statValue}>{selectedColor}</span>
            </div>
            <div className={styles.statRow}>
              <span>HSL:</span>
              <span className={styles.statValue}>hsl({Math.round((colorPosition / 100) * 360)}, 80%, 50%)</span>
            </div>
            <div className={styles.statRow}>
              <span>RGB:</span>
              <span className={styles.statValue}>{(() => {
                const hue = (colorPosition / 100) * 360;
                const c = 0.8; // chroma
                const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
                const m = 0.5 - c / 2;
                let r, g, b;
                if (hue >= 0 && hue < 60) { r = c; g = x; b = 0; }
                else if (hue >= 60 && hue < 120) { r = x; g = c; b = 0; }
                else if (hue >= 120 && hue < 180) { r = 0; g = c; b = x; }
                else if (hue >= 180 && hue < 240) { r = 0; g = x; b = c; }
                else if (hue >= 240 && hue < 300) { r = x; g = 0; b = c; }
                else { r = c; g = 0; b = x; }
                r = Math.round((r + m) * 255);
                g = Math.round((g + m) * 255);
                b = Math.round((b + m) * 255);
                return `rgb(${r}, ${g}, ${b})`;
              })()}</span>
            </div>
            <div className={styles.statRow}>
              <span>Hex:</span>
              <span className={styles.statValue}>{(() => {
                const hue = (colorPosition / 100) * 360;
                const c = 0.8;
                const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
                const m = 0.5 - c / 2;
                let r, g, b;
                if (hue >= 0 && hue < 60) { r = c; g = x; b = 0; }
                else if (hue >= 60 && hue < 120) { r = x; g = c; b = 0; }
                else if (hue >= 120 && hue < 180) { r = 0; g = c; b = x; }
                else if (hue >= 180 && hue < 240) { r = 0; g = x; b = c; }
                else if (hue >= 240 && hue < 300) { r = x; g = 0; b = c; }
                else { r = c; g = 0; b = x; }
                r = Math.round((r + m) * 255);
                g = Math.round((g + m) * 255);
                b = Math.round((b + m) * 255);
                return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
              })()}</span>
            </div>
            <div className={styles.statRow}>
              <span>Position:</span>
              <span className={styles.statValue}>{colorPosition}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
