'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function PongPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const WIDTH = 600;
    const HEIGHT = 400;
    
    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = WIDTH * dpr;
    canvas.height = HEIGHT * dpr;
    ctx.scale(dpr, dpr);
    
    // CSS size
    canvas.style.width = '100%';
    canvas.style.height = 'auto';

    const ball = {
        x: WIDTH / 2,
        y: HEIGHT / 2,
        radius: 6,
        speedX: 4,
        speedY: 4
    };

    const paddleWidth = 12;
    const paddleHeight = 80;

    const p1 = {
        x: 20,
        y: HEIGHT / 2 - paddleHeight / 2,
        score: 0
    };

    const p2 = {
        x: WIDTH - 20 - paddleWidth,
        y: HEIGHT / 2 - paddleHeight / 2,
        score: 0
    };

    let keys: { [key: string]: boolean } = {};
    let animationFrameId: number;

    const handleKeyDown = (e: KeyboardEvent) => {
        keys[e.code] = true;
        if(["ArrowUp","ArrowDown","Space", "KeyW", "KeyS"].includes(e.code)) e.preventDefault();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const handleTouch = (e: TouchEvent) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const scaleY = HEIGHT / rect.height;
        const scaleX = WIDTH / rect.width;

        for (let i = 0; i < e.touches.length; i++) {
            const touch = e.touches[i];
            const touchX = (touch.clientX - rect.left) * scaleX;
            const touchY = (touch.clientY - rect.top) * scaleY;

            // If touch is on the left half, move p1
            if (touchX < WIDTH / 2) {
                p1.y = touchY - paddleHeight / 2;
            } 
            // If touch is on the right half, move p2
            else {
                p2.y = touchY - paddleHeight / 2;
            }
        }

        // Clamp positions
        p1.y = Math.max(0, Math.min(HEIGHT - paddleHeight, p1.y));
        p2.y = Math.max(0, Math.min(HEIGHT - paddleHeight, p2.y));
    };

    canvas.addEventListener('touchstart', handleTouch, { passive: false });
    canvas.addEventListener('touchmove', handleTouch, { passive: false });

    function resetBall() {
        ball.x = WIDTH / 2;
        ball.y = HEIGHT / 2;
        ball.speedX = (ball.speedX > 0 ? -4 : 4);
        ball.speedY = (Math.random() - 0.5) * 6;
    }

    // Expose resetGame to window for the button to call, or just use a ref/state
    // Since we are in React, we'll attach it to the component instance or just use a function inside useEffect
    // But the button is outside. Let's use a ref or just a function defined here and passed to the button via React onClick.
    
    // Actually, I can just define resetGame here and use it.
    // But I need to expose it to the button in the JSX.
    // I'll move the game logic into a custom hook or just keep it here and use a ref to store the reset function?
    // Or simpler: define resetGame inside useEffect and assign it to a ref that is accessible by the button handler.
    
    // Better: The button handler can just trigger a state change or call a function ref.
    
    function resetGameLogic() {
        p1.score = 0;
        p2.score = 0;
        p1.y = HEIGHT / 2 - paddleHeight / 2;
        p2.y = HEIGHT / 2 - paddleHeight / 2;
        resetBall();
    }
    
    // Assign to ref for external access if needed, but we can just pass it to the button if we define the button inside the component.
    // Wait, the button is in the JSX returned by this component. So I can just call a function that sets a flag or something?
    // No, the game loop is running in useEffect.
    // I can use a mutable ref to communicate.
    
    (window as any).resetPongGame = resetGameLogic;

    function drawRect(x: number, y: number, w: number, h: number, color: string) {
        if (!ctx) return;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
    }

    function drawText(text: string | number, x: number, y: number) {
        if (!ctx) return;
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.font = "32px 'Press Start 2P', monospace"; // Fallback to monospace if font not loaded
        ctx.textAlign = "center";
        ctx.fillText(String(text), x, y);
    }

    function update() {
        const moveSpeed = 7;

        // Player 1 (Left Bar)
        if (keys['KeyW'] && p1.y > 0) p1.y -= moveSpeed;
        if (keys['KeyS'] && p1.y < HEIGHT - paddleHeight) p1.y += moveSpeed;

        // Player 2 (Right Bar)
        if (keys['ArrowUp'] && p2.y > 0) p2.y -= moveSpeed;
        if (keys['ArrowDown'] && p2.y < HEIGHT - paddleHeight) p2.y += moveSpeed;

        ball.x += ball.speedX;
        ball.y += ball.speedY;

        if (ball.y < 0 || ball.y > HEIGHT) {
            ball.speedY = -ball.speedY;
        }

        if (ball.x < p1.x + paddleWidth && 
            ball.x > p1.x && 
            ball.y > p1.y && 
            ball.y < p1.y + paddleHeight) {
            
            ball.speedX = Math.abs(ball.speedX) * 1.05;
            let deltaY = ball.y - (p1.y + paddleHeight / 2);
            ball.speedY = deltaY * 0.2;
            ball.x = p1.x + paddleWidth + 1;
        }

        if (ball.x > p2.x && 
            ball.x < p2.x + paddleWidth && 
            ball.y > p2.y && 
            ball.y < p2.y + paddleHeight) {
            
            ball.speedX = -Math.abs(ball.speedX) * 1.05;
            let deltaY = ball.y - (p2.y + paddleHeight / 2);
            ball.speedY = deltaY * 0.2;
            ball.x = p2.x - 1;
        }

        if (ball.x < 0) {
            p2.score++;
            resetBall();
        } else if (ball.x > WIDTH) {
            p1.score++;
            resetBall();
        }
    }

    function draw() {
        if (!ctx) return;
        ctx.fillStyle = "#0a0a0a";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        ctx.setLineDash([10, 10]);
        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.beginPath();
        ctx.moveTo(WIDTH/2, 0);
        ctx.lineTo(WIDTH/2, HEIGHT);
        ctx.stroke();
        ctx.setLineDash([]);

        drawText(p1.score, WIDTH / 4, 80);
        drawText(p2.score, 3 * WIDTH / 4, 80);

        drawRect(p1.x, p1.y, paddleWidth, paddleHeight, "#FFFFFF");
        drawRect(p2.x, p2.y, paddleWidth, paddleHeight, "#FFFFFF");
        drawRect(ball.x - 4, ball.y - 4, 8, 8, "#FFFFFF");
    }

    function gameLoop() {
        update();
        draw();
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    resetBall();
    gameLoop();

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        canvas.removeEventListener('touchstart', handleTouch);
        canvas.removeEventListener('touchmove', handleTouch);
        cancelAnimationFrame(animationFrameId);
        delete (window as any).resetPongGame;
    };
  }, []);

  const handleReset = () => {
      if ((window as any).resetPongGame) {
          (window as any).resetPongGame();
      }
  };

  return (
    <div className="pong-body">
        <style jsx global>{`
            @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

            :root {
                --glow-color: #ffffff;
                --crt-bg: #0a0a0a;
            }

            .pong-body {
                background-color: #121212;
                overflow: hidden;
                font-family: Arial, Helvetica, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                width: 100vw;
                position: fixed;
                top: 0;
                left: 0;
                z-index: 9999;
            }

            .table-frame {
                background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
                border: 12px solid #333;
                box-shadow: 
                    0 0 50px rgba(0,0,0,0.8),
                    inset 0 0 20px rgba(255,255,255,0.05);
                border-radius: 40px;
                position: relative;
                padding: 40px;
                width: 100%;
                max-width: 700px;
            }

            .screen-bezel {
                background: #000;
                padding: 20px;
                border-radius: 15px;
                border: 4px solid #111;
                box-shadow: inset 0 0 30px #000;
                position: relative;
                overflow: hidden;
            }

            canvas {
                display: block;
                background: var(--crt-bg);
                filter: blur(0.4px) contrast(1.2);
                image-rendering: pixelated;
                width: 100%;
                height: auto;
                touch-action: none;
            }

            .crt-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(
                    rgba(18, 16, 16, 0) 50%, 
                    rgba(0, 0, 0, 0.1) 50%
                ), linear-gradient(
                    90deg, 
                    rgba(255, 0, 0, 0.03), 
                    rgba(0, 255, 0, 0.01), 
                    rgba(0, 255, 0, 0.03)
                );
                background-size: 100% 3px, 3px 100%;
                pointer-events: none;
                z-index: 2;
            }

            .crt-flicker {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.02);
                opacity: 0;
                pointer-events: none;
                animation: flicker 0.15s infinite;
                z-index: 3;
            }

            @keyframes flicker {
                0% { opacity: 0.01; }
                50% { opacity: 0.03; }
                100% { opacity: 0.01; }
            }

            .control-panel {
                margin-top: 30px;
                display: flex;
                justify-content: space-around;
                align-items: center;
            }

            .dial {
                width: 60px;
                height: 60px;
                background: radial-gradient(circle, #444, #111);
                border-radius: 50%;
                border: 3px solid #222;
                box-shadow: 0 4px 10px rgba(0,0,0,0.5);
                position: relative;
            }

            .dial::after {
                content: '';
                position: absolute;
                top: 5px;
                left: 50%;
                transform: translateX(-50%);
                width: 4px;
                height: 12px;
                background: #666;
                border-radius: 2px;
            }

            .status-light {
                width: 14px;
                height: 14px;
                background: #00ff00;
                border-radius: 50%;
                box-shadow: 0 0 12px #00ff00;
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0%, 100% { opacity: 0.6; }
                50% { opacity: 1; }
            }

            .start-btn {
                cursor: pointer;
                transition: transform 0.1s;
                user-select: none;
            }

            .start-btn:active {
                transform: scale(0.95);
            }
        `}</style>

        <div className="table-frame">
            <div className="flex justify-between items-center mb-4 text-white">
                <span className="text-xs font-bold uppercase tracking-wider">MODEL: H-5000 ROF-LR</span>
                <button onClick={() => router.push('/')} className="text-xs font-bold hover:text-yellow-400 transition-colors">EXIT</button>
            </div>
            
            <div className="screen-bezel">
                <div className="crt-overlay"></div>
                <div className="crt-flicker"></div>
                <canvas ref={canvasRef} id="pongCanvas"></canvas>
            </div>

            <div className="control-panel">
                <div className="flex flex-col items-center gap-2">
                    <div className="dial"></div>
                    <span className="text-[11px] font-bold text-white uppercase">PLAYER 1 (W/S)</span>
                </div>
                
                {/* Centered Start Button Area */}
                <div onClick={handleReset} className="start-btn flex flex-col items-center justify-center gap-2">
                    <div className="status-light"></div>
                    <span className="text-xs font-bold text-white tracking-widest">START</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <div className="dial"></div>
                    <span className="text-[11px] font-bold text-white uppercase">PLAYER 2 (ARROWS)</span>
                </div>
            </div>
        </div>
    </div>
  );
}
