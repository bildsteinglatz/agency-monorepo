'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { X, Plus } from 'lucide-react';

interface PotteryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PotteryModal({ isOpen, onClose }: PotteryModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const [status, setStatus] = useState("READY - PRESS SPACE");
  const [stressText, setStressText] = useState("....................");
  const [isCritical, setIsCritical] = useState(false);

  // Touch controls for mobile - Relative movement
  const touchState = useRef<{ [key: number]: { lastX: number, lastY: number, hand: 'L' | 'R' } }>({});

  // Game state refs to avoid re-renders during animation loop
  const gameState = useRef({
    isSpinning: false,
    isCollapsed: false,
    stress: 0,
    wheelRotation: 0,
    symmetryBonus: 1.0,
    handLX: 35,
    handLY: 105,
    handRX: 125,
    handRY: 105,
    clay: [] as any[],
    keys: {} as { [key: string]: boolean }
  });

  const WIDTH = 160;
  const HEIGHT = 144;
  const WHEEL_Y = 120;
  const CENTER_X = WIDTH / 2;
  const LAYER_COUNT = 45;
  const INITIAL_WIDTH = 42;
  const MAX_STRESS = 80;

  const resetClay = () => {
    const clay = [];
    for (let i = 0; i < LAYER_COUNT; i++) {
      const heightFactor = i < 20 ? 1 : Math.max(0, 1 - (i - 20) / 12);
      const initOffset = (Math.random() * 5 - 2.5);
      const initWidth = (INITIAL_WIDTH + (Math.random() * 3 - 1.5)) * heightFactor;

      clay.push({
        width: initWidth,
        x: CENTER_X + initOffset,
        active: i < 28
      });
    }
    gameState.current.clay = clay;
    gameState.current.stress = 0;
    gameState.current.symmetryBonus = 1.0;
    gameState.current.isCollapsed = false;
    gameState.current.handLX = CENTER_X - 45;
    gameState.current.handLY = WHEEL_Y - 15;
    gameState.current.handRX = CENTER_X + 45;
    gameState.current.handRY = WHEEL_Y - 15;
    setStatus("READY - TAP TO START");
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    resetClay();

    const handleKeyDown = (e: KeyboardEvent) => {
      gameState.current.keys[e.code] = true;

      // Prevent background scrolling/interaction for game keys
      const gameKeys = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'];
      if (gameKeys.includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'Space') {
        if (gameState.current.isCollapsed) {
          resetClay();
        } else {
          gameState.current.isSpinning = !gameState.current.isSpinning;
          setStatus(gameState.current.isSpinning ? "SHAPING..." : "PAUSED - TAP TO START");
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      gameState.current.keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const handleTouchStart = (e: TouchEvent) => {
      // Only prevent default if touching the game area to allow scrolling the modal if needed
      // but usually we want to capture all touches in the modal
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const scaleX = WIDTH / rect.width;
      const scaleY = HEIGHT / rect.height;

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const x = (touch.clientX - rect.left) * scaleX;
        const y = (touch.clientY - rect.top) * scaleY;
        
        // Assign hand based on initial touch position (left half vs right half of screen/modal)
        const hand = touch.clientX < window.innerWidth / 2 ? 'L' : 'R';
        touchState.current[touch.identifier] = { lastX: x, lastY: y, hand };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const scaleX = WIDTH / rect.width;
      const scaleY = HEIGHT / rect.height;
      const state = gameState.current;

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const ts = touchState.current[touch.identifier];
        if (!ts) continue;

        const x = (touch.clientX - rect.left) * scaleX;
        const y = (touch.clientY - rect.top) * scaleY;

        const dx = x - ts.lastX;
        const dy = y - ts.lastY;

        // Apply delta to the assigned hand
        if (ts.hand === 'L') {
          state.handLX += dx;
          state.handLY += dy;
        } else {
          state.handRX += dx;
          state.handRY += dy;
        }

        ts.lastX = x;
        ts.lastY = y;
      }

      // Apply constraints
      state.handLX = Math.max(5, state.handLX);
      state.handRX = Math.min(WIDTH - 5, state.handRX);
      state.handLY = Math.max(25, Math.min(WHEEL_Y, state.handLY));
      state.handRY = Math.max(25, Math.min(WHEEL_Y, state.handRY));
      
      if (state.handLX > state.handRX - 1) state.handLX = state.handRX - 1;
      if (state.handRX < state.handLX + 1) state.handRX = state.handLX + 1;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        delete touchState.current[e.changedTouches[i].identifier];
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    let animationFrameId: number;

    const drawHand = (x: number, y: number, isRight: boolean) => {
      ctx.save();
      ctx.translate(x, y);
      if (isRight) ctx.scale(-1, 1);
      ctx.fillStyle = '#0f380f';

      // Draw arm/forearm extending down (visible when touch offset is used)
      ctx.fillRect(2, 0, 4, 40); // Vertical arm from hand downward

      // Draw hand (original)
      ctx.fillRect(0, -4, 8, 8);
      ctx.fillRect(8, -4, 6, 1);
      ctx.fillRect(9, -2, 6, 1);
      ctx.fillRect(9, 0, 6, 1);
      ctx.fillRect(8, 2, 5, 1);
      ctx.fillRect(2, -7, 3, 3);
      ctx.restore();
    };

    const update = () => {
      const state = gameState.current;
      if (state.isCollapsed) return;

      const moveSpeed = 1.35;

      if (state.keys['KeyA']) state.handLX -= moveSpeed;
      if (state.keys['KeyD']) state.handLX += moveSpeed;
      if (state.keys['KeyW']) state.handLY -= moveSpeed;
      if (state.keys['KeyS']) state.handLY += moveSpeed;

      if (state.keys['ArrowLeft']) state.handRX -= moveSpeed;
      if (state.keys['ArrowRight']) state.handRX += moveSpeed;
      if (state.keys['ArrowUp']) state.handRY -= moveSpeed;
      if (state.keys['ArrowDown']) state.handRY += moveSpeed;

      if (state.handLX > state.handRX - 1) state.handLX = state.handRX - 1;
      if (state.handRX < state.handLX + 1) state.handRX = state.handLX + 1;

      state.handLX = Math.max(5, state.handLX);
      state.handRX = Math.min(WIDTH - 5, state.handRX);
      state.handLY = Math.max(25, Math.min(WHEEL_Y, state.handLY));
      state.handRY = Math.max(25, Math.min(WHEEL_Y, state.handRY));

      if (state.isSpinning) {
        if (state.handLX > CENTER_X + 1 || state.handRX < CENTER_X - 1) {
          state.isCollapsed = true;
          state.isSpinning = false;
          setStatus("CROSSED CENTER! RUINED");
          return;
        }

        state.wheelRotation += 0.3;

        let instabilityScore = 0;
        let totalDrift = 0;
        let totalOffCenter = 0;
        let highestActiveLayer = 0;

        let avgBaseWidth = 0;
        for (let i = 0; i < 8; i++) avgBaseWidth += state.clay[i].width;
        avgBaseWidth /= 8;

        for (let i = 0; i < state.clay.length; i++) {
          const layer = state.clay[i];
          if (layer.width > 3) highestActiveLayer = i;

          const layerY = WHEEL_Y - i;
          const layerLeft = layer.x - layer.width / 2;
          const layerRight = layer.x + layer.width / 2;

          const distL = Math.abs(state.handLY - layerY);
          const distR = Math.abs(state.handRY - layerY);

          if (distL < 7 && state.handLX >= layerLeft) {
            const push = 0.55;
            layer.width -= push * 0.45;
            layer.x += push * 0.4;
          }
          if (distR < 7 && state.handRX <= layerRight) {
            const push = 0.55;
            layer.width -= push * 0.45;
            layer.x -= push * 0.4;
          }

          if (i > 0) {
            const drift = Math.abs(state.clay[i].x - state.clay[i - 1].x);
            totalDrift += drift;
            instabilityScore += drift * 3.0;
          }

          const offCenter = Math.abs(layer.x - CENTER_X);
          totalOffCenter += offCenter;
          instabilityScore += offCenter * 1.0;

          if (i > 15 && layer.width > avgBaseWidth * 2.0) {
            const excess = (layer.width - (avgBaseWidth * 2.0));
            instabilityScore += excess * 10.0;
          }
        }

        const smoothness = totalDrift / (highestActiveLayer || 1);
        const centeredness = totalOffCenter / (highestActiveLayer || 1);

        const currentSymmetry = 1.0 / (smoothness * 0.3 + centeredness * 0.15 + 0.05);
        state.symmetryBonus = state.symmetryBonus * 0.9 + (Math.min(6.0, currentSymmetry) * 0.1);

        const baseStability = 400;
        const dynamicThreshold = baseStability * (state.symmetryBonus * 0.6);

        if (instabilityScore > dynamicThreshold) {
          state.stress += (instabilityScore - dynamicThreshold) * 0.0025;
        } else {
          state.stress = Math.max(0, state.stress - (0.25 * state.symmetryBonus));
        }

        if (state.stress > MAX_STRESS) {
          state.isCollapsed = true;
          state.isSpinning = false;
          setStatus("COLLAPSED! SPACE TO RESET");
        }
      }

      const segments = 20;
      const filled = Math.min(segments, Math.floor((state.stress / MAX_STRESS) * segments));
      setStressText("|".repeat(filled) + ".".repeat(segments - filled));
      setIsCritical(state.stress > MAX_STRESS * 0.8);
    };

    const draw = () => {
      const state = gameState.current;
      ctx.fillStyle = '#9bbc0f';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.fillStyle = '#0f380f';
      ctx.fillRect(CENTER_X - 55, WHEEL_Y, 110, 6);

      if (state.isSpinning) {
        ctx.fillStyle = '#306230';
        const offset = (Math.sin(state.wheelRotation) * 40);
        ctx.fillRect(CENTER_X + offset - 8, WHEEL_Y + 1, 16, 2);
      }

      if (state.isCollapsed) {
        ctx.fillStyle = '#306230';
        ctx.beginPath();
        ctx.moveTo(CENTER_X - 50, WHEEL_Y);
        ctx.quadraticCurveTo(CENTER_X, WHEEL_Y - 10, CENTER_X + 50, WHEEL_Y);
        ctx.fill();
      } else {
        state.clay.forEach((layer, i) => {
          const y = WHEEL_Y - i - 1;
          const offCenter = (layer.x - CENTER_X);
          const wobbleScale = 0.5 / (0.5 + state.symmetryBonus * 0.5);
          const wobble = state.isSpinning ? (Math.sin(state.wheelRotation + i * 0.4) * offCenter * wobbleScale) : 0;

          ctx.fillStyle = (i % 2 === 0) ? '#306230' : '#0f380f';
          ctx.fillRect(layer.x - layer.width / 2 + wobble, y, layer.width, 1);
        });
      }

      drawHand(state.handLX - 14, state.handLY, false);
      drawHand(state.handRX + 14, state.handRY, true);

      ctx.fillStyle = '#0f380f';
      ctx.font = '8px monospace';
      if (state.isCollapsed) {
        ctx.fillText("STATUS: RUINED", 5, 10);
      } else if (state.isSpinning) {
        const symQual = state.symmetryBonus > 4.5 ? "PERFECT" : state.symmetryBonus > 2.5 ? "STABLE" : state.symmetryBonus > 1.5 ? "WOBBLY" : "CENTERING...";
        ctx.fillText("BALANCE: " + symQual, 5, 10);
      }
    };

    const loop = () => {
      update();
      draw();
      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <motion.div
        ref={containerRef}
        drag
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={false}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="pointer-events-auto bg-[#1a1a1a] p-4 border-8 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center"
      >
        {/* Toolbar */}
        <div className="w-full flex justify-between items-center mb-4 bg-black p-2">
          <div
            onPointerDown={(e) => dragControls.start(e)}
            className="cursor-grab active:cursor-grabbing text-white hover:text-yellow-400 transition-colors"
          >
            <Plus size={20} />
          </div>
          <div className="text-white font-mono text-xs uppercase tracking-widest">Franzi&apos;s Pixel Pottery</div>
          <button onClick={onClose} className="text-white hover:text-[#FF3100] transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="bg-[#9bbc0f] p-2 border-4 border-[#0f380f] text-center">
          <div
            onClick={() => {
              const state = gameState.current;
              if (state.isCollapsed) {
                resetClay();
              } else {
                state.isSpinning = !state.isSpinning;
                setStatus(state.isSpinning ? "SHAPING..." : "PAUSED - TAP TO START");
              }
            }}
            className="uppercase font-bold text-sm text-[#0f380f] mb-1 h-5 cursor-pointer hover:underline active:scale-95 transition-transform"
          >
            {status === "READY - PRESS SPACE" ? "READY - TAP TO START" : status}
          </div>
          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            className="block bg-[#9bbc0f] image-pixelated w-[320px] h-[288px] cursor-none"
          />
          <div className="mt-2 uppercase font-bold text-sm text-[#0f380f]">
            STRESS: [<span className={isCritical ? 'text-red-600 animate-pulse' : ''}>{stressText}</span>]
          </div>
        </div>

        <div className="mt-4 text-[10px] text-[#8bac0f] font-mono text-center uppercase leading-tight">
          TAP STATUS TO START/STOP WHEEL<br />
          WASD: LEFT | ARROWS: RIGHT<br />
          <span className="md:hidden">TOUCH: DRAG ANYWHERE (LEFT/RIGHT SIDE) TO MOVE HANDS<br /></span>
          WARNING: DO NOT CROSS THE CENTER LINE
        </div>
      </motion.div>
    </div>
  );
}
