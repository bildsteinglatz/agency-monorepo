'use client';

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Download, 
  FilePlus, 
  Info,
  X
} from 'lucide-react';

// --- Arno Stern Philosophy Constants and Colors ---
const ROOM_WALL_COLOR = '#2C1E14'; // Hintergrundfarbe der Holzwand
const PAPER_COLOR = '#F5F5E0'; // Blattfarbe: 8% warmes gelbliches Grau

// Dimensions des Zeichenpuffers (intern, nicht Display-Größe)
const WALL_WIDTH = 1000;
const WALL_HEIGHT = 800;
const SHEET_WIDTH = 780; // 65 * 12 (Proportional 65x50)
const SHEET_HEIGHT = 600; // 50 * 12

// Die 18 Farben in der gewünschten Reihenfolge
const STERN_PALETTE = [
  { name: 'Weiß', hex: '#FFFFFF' },
  { name: 'Rosa', hex: '#FFC0CB' },
  { name: 'Violett', hex: '#8B00FF' },
  { name: 'Hellblau', hex: '#ADD8E6' },
  { name: 'Grau', hex: '#808080' },
  { name: 'Ultramarin (Blau)', hex: '#120A8F' },
  { name: 'Dunkelgrün', hex: '#006400' },
  { name: 'Hellgrün', hex: '#90EE90' },
  { name: 'Gelbgrün', hex: '#ADFF2F' },
  { name: 'Gelb', hex: '#FFE600' },
  { name: 'Ocker', hex: '#CC7722' },
  { name: 'Beige', hex: '#ede3b3ff' },
  { name: 'Orange', hex: '#FF9900' },
  { name: 'Zinnober-Rot', hex: '#FF4400' },
  { name: 'Karmin-Rot', hex: '#D40000' },
  { name: 'Hellbraun', hex: '#C19A6B' },
  { name: 'Dunkelbraun', hex: '#635147' },
  { name: 'Schwarz', hex: '#1a1a1a' },
];

export default function App() {
  const router = useRouter();
  // --- State ---
  const [activeColor, setActiveColor] = useState('#1a1a1a');
  const [brushSize, setBrushSize] = useState(8); 
  const [isDrawing, setIsDrawing] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isNewSheetConfirmOpen, setIsNewSheetConfirmOpen] = useState(false); 
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
  
  // State für den Wasser-/Aquarell-Effekt
  const [isWaterMode, setIsWaterMode] = useState(false);
  const [waterAlpha, setWaterAlpha] = useState(1.0); 
  const lastActiveColorRef = useRef('#1a1a1a'); 

  // Refs für Leinwände und Container
  const sheetCanvasRef = useRef<HTMLCanvasElement>(null); // Das entfernbare Blatt (800x600 Puffer)
  const wallCanvasRef = useRef<HTMLCanvasElement>(null);   // Die persistente Wand (1000x800 Puffer)
  const paperContainerRef = useRef<HTMLDivElement>(null); // Der Wrapper für die Koordinatenberechnung
  const mainAreaRef = useRef<HTMLDivElement>(null); // Der verfügbare Platz
  
  // State für dynamische Pixel-Masse
  const [containerDims, setContainerDims] = useState({ width: 0, height: 0 });
  const [paintingDims, setPaintingDims] = useState({ width: 0, height: 0 });

  // --- Initialisierung & Resize Observer ---
  useEffect(() => {
    // 1. Initialisiere Canvas-Puffer
    const sheetCanvas = sheetCanvasRef.current;
    const wallCanvas = wallCanvasRef.current;
    
    if(sheetCanvas) {
      const sctx = sheetCanvas.getContext('2d');
      if (sctx) {
        sctx.fillStyle = PAPER_COLOR; 
        sctx.fillRect(0, 0, SHEET_WIDTH, SHEET_HEIGHT);
      }
    }
    
    if (wallCanvas) {
        wallCanvas.width = WALL_WIDTH; 
        wallCanvas.height = WALL_HEIGHT;
        const wctx = wallCanvas.getContext('2d');
        if (wctx) {
          wctx.clearRect(0, 0, WALL_WIDTH, WALL_HEIGHT); 
        }
    }
  }, []);

  // 2. Resize Logic (Separat für Robustheit)
  useLayoutEffect(() => {
    const mainArea = mainAreaRef.current;
    if (!mainArea) return;

    const calculateSize = (width: number, height: number) => {
        const targetRatio = WALL_WIDTH / WALL_HEIGHT;
        const availableRatio = width / height;
        
        let newWidth, newHeight;
        
        if (availableRatio > targetRatio) {
            newHeight = height;
            newWidth = newHeight * targetRatio;
        } else {
            newWidth = width;
            newHeight = newWidth / targetRatio;
        }
        
        // Nur aktualisieren wenn sich was ändert
        setPaintingDims(prev => {
            if (Math.abs(prev.width - newWidth) < 1 && Math.abs(prev.height - newHeight) < 1) return prev;
            return { width: newWidth, height: newHeight };
        });
        setContainerDims(prev => {
            if (Math.abs(prev.width - newWidth) < 1 && Math.abs(prev.height - newHeight) < 1) return prev;
            return { width: Math.floor(newWidth), height: Math.floor(newHeight) };
        });
    };

    // Initial check using getBoundingClientRect (fallback)
    const rect = mainArea.getBoundingClientRect();
    // Subtract padding manually if needed, but ResizeObserver contentRect is better.
    // For now, we rely on ResizeObserver for precision, but trigger this to ensure non-zero start if possible.
    if (rect.width > 0 && rect.height > 0) {
        // Approximation (ignoring padding for initial flash prevention)
        calculateSize(rect.width - 16, rect.height - 16); 
    }

    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
          const { width, height } = entries[0].contentRect;
          calculateSize(width, height);
      }
    });

    observer.observe(mainArea);

    return () => observer.disconnect();
  }, []);

  // --- Interaktions-Handler ---

  const handleColorSelect = (hex: string) => {
    setActiveColor(hex);
    setIsWaterMode(false);
    setWaterAlpha(1.0); 
    lastActiveColorRef.current = hex;
  };

  const handleWaterPotClick = () => {
    if (!isWaterMode) {
      lastActiveColorRef.current = activeColor;
      setIsWaterMode(true);
    } 
    setWaterAlpha(0.8); 
    setActiveColor(lastActiveColorRef.current); 
  };
  
  // --- Koordinatenberechnung (Vereinheitlicht auf Wall-Puffer) ---

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    // @ts-ignore - TouchEvent handling
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    // @ts-ignore - TouchEvent handling
    const clientY = e.clientY || e.touches?.[0]?.clientY;

    if (!paperContainerRef.current || clientX === undefined || clientY === undefined || containerDims.width === 0) return null;

    const containerRect = paperContainerRef.current.getBoundingClientRect();
    const wallCanvas = wallCanvasRef.current;
    
    if (!wallCanvas) return null; 

    // 1. Client-Koordinaten relativ zum Wall Container
    const clientWallX = clientX - containerRect.left;
    const clientWallY = clientY - containerRect.top;

    // 2. Skalierungsfaktor (Display-Breite zu Puffer-Breite)
    // Wir verwenden containerDims, die vom ResizeObserver korrekt gemessen werden sollten
    const scaleXWall = WALL_WIDTH / containerDims.width;
    const scaleYWall = WALL_HEIGHT / containerDims.height;
    
    // 3. Wall-Koordinaten im 1000x800 Zeichenpuffer (WallX, WallY)
    const wallX = clientWallX * scaleXWall;
    const wallY = clientWallY * scaleYWall;

    // 4. Prüfen, ob der Punkt auf dem Blatt liegt (basierend auf Wall-Koordinaten)
    const SHEET_OFFSET_X = (WALL_WIDTH - SHEET_WIDTH) / 2; // 100
    const SHEET_OFFSET_Y = (WALL_HEIGHT - SHEET_HEIGHT) / 2; // 100

    const isOnSheet = wallX >= SHEET_OFFSET_X && wallX <= (SHEET_OFFSET_X + SHEET_WIDTH) && 
                     wallY >= SHEET_OFFSET_Y && wallY <= (SHEET_OFFSET_Y + SHEET_HEIGHT);
    
    return { wallX, wallY, isOnSheet, SHEET_OFFSET_X, SHEET_OFFSET_Y };
  }

  // --- Gemeinsame Zeichenlogik (GLÄTTERER PINSELSTRICH) ---

  const drawStroke = (ctx: CanvasRenderingContext2D, x: number, y: number, isSheet: boolean) => {
    
    if (isWaterMode) {
        const r = parseInt(activeColor.slice(1,3), 16);
        const g = parseInt(activeColor.slice(3,5), 16);
        const b = parseInt(activeColor.slice(5,7), 16);
        
        // Pinselbreite des verwischten Wascheffekts (1/3 von 5.0 -> ca. 1.67)
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.05)`; 
        ctx.globalAlpha = 0.8; 
        ctx.filter = 'blur(6px)'; 
        ctx.lineWidth = brushSize * (5.0 / 3.0); 

        ctx.lineTo(x, y);
        ctx.stroke();
        
        ctx.beginPath(); 
        ctx.moveTo(x, y);

        // Pinselbreite des scharfen Kerns (1/3 des Originals)
        ctx.strokeStyle = activeColor;
        ctx.filter = 'blur(4px)'; 
        ctx.lineWidth = brushSize * ((1 + waterAlpha * 2.0) / 3.0);
        ctx.globalAlpha = waterAlpha;
    } else {
        // Reduzierte Varianz für einen glatteren Strich und eine bessere 'Übergang's-Simulation
        const variance = Math.random() * 0.5; // Vorher * 2
        ctx.lineWidth = brushSize + (variance - 0.25); // Netto-Schwankung nur +/- 0.25
        ctx.globalAlpha = 1.0;
        // Leichter Blur auf dem Blatt, um die Dicke des Pinsels an den Rändern zu simulieren
        ctx.filter = isSheet ? 'blur(0.4px)' : 'blur(0px)'; 
    }
    
    ctx.lineTo(x, y);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  
  // --- Zeichen-Handler (Unverändert) ---

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getCoordinates(e);
    if (!coords) return;
    
    setIsDrawing(true);
    
    if (!sheetCanvasRef.current || !wallCanvasRef.current) return;

    const sctx = sheetCanvasRef.current.getContext('2d');
    const wctx = wallCanvasRef.current.getContext('2d');
    
    if (!sctx || !wctx) return;

    [sctx, wctx].forEach(ctx => {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = activeColor;
    });

    wctx.beginPath();
    wctx.moveTo(coords.wallX, coords.wallY);
    drawStroke(wctx, coords.wallX, coords.wallY, false);

    if (coords.isOnSheet) {
        const sheetX = coords.wallX - coords.SHEET_OFFSET_X;
        const sheetY = coords.wallY - coords.SHEET_OFFSET_Y;
        
        sctx.beginPath();
        sctx.moveTo(sheetX, sheetY);
        drawStroke(sctx, sheetX, sheetY, true);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    // @ts-ignore
    if (e.cancelable) e.preventDefault(); 
    
    const coords = getCoordinates(e);
    if (!coords) return;

    if (!sheetCanvasRef.current || !wallCanvasRef.current) return;

    const sctx = sheetCanvasRef.current.getContext('2d');
    const wctx = wallCanvasRef.current.getContext('2d');
    
    if (!sctx || !wctx) return;
    
    drawStroke(wctx, coords.wallX, coords.wallY, false);
    
    if (coords.isOnSheet) {
        const sheetX = coords.wallX - coords.SHEET_OFFSET_X;
        const sheetY = coords.wallY - coords.SHEET_OFFSET_Y;
        drawStroke(sctx, sheetX, sheetY, true);
    }

    if (isWaterMode) {
        const decayRate = 0.007;
        setWaterAlpha(prevAlpha => Math.max(0.05, prevAlpha - decayRate));
    }
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    [sheetCanvasRef.current, wallCanvasRef.current].forEach(canvas => {
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.beginPath();
                ctx.globalAlpha = 1.0;
                ctx.filter = 'none';
            }
        }
    });
  };

  // --- Dateioperationen ---

  const promptNewSheet = () => {
      setIsNewSheetConfirmOpen(true);
  };

  const handleNewSheetConfirmed = () => {
    setIsNewSheetConfirmOpen(false); 
    const sheetCanvas = sheetCanvasRef.current;
    if (!sheetCanvas) return;

    const sctx = sheetCanvas.getContext('2d');
    if (sctx) {
        sctx.fillStyle = PAPER_COLOR;
        sctx.fillRect(0, 0, SHEET_WIDTH, SHEET_HEIGHT);
    }
  };

  const archiveFormulation = () => {
    const sheetCanvas = sheetCanvasRef.current;
    if (!sheetCanvas) return;

    // Create a temporary canvas to composite the background color
    // This ensures we save exactly the sheet appearance (with paper color)
    // and strictly excludes any wall content (since we only read from sheetCanvas)
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = sheetCanvas.width;
    tempCanvas.height = sheetCanvas.height;
    const tctx = tempCanvas.getContext('2d');
    if (!tctx) return;

    // 1. Fill with paper color (ensure no transparency)
    tctx.fillStyle = PAPER_COLOR;
    tctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // 2. Draw the sheet content on top
    tctx.drawImage(sheetCanvas, 0, 0);

    const link = document.createElement('a');
    link.download = 'formulation.png';
    link.href = tempCanvas.toDataURL('image/png', 1.0); 
    link.click();
  };
  
  // NEUER HANDLER: Archiviert und setzt dann das Blatt zurück
  const handleArchiveAndNewSheet = () => {
      archiveFormulation(); // Führt den Download aus
      handleNewSheetConfirmed(); // Löscht das Blatt und schließt das Modal
  };

  // --- Exit Handlers ---
  const handleArchiveAndExit = () => {
    archiveFormulation();
    router.push('/');
  };

  const handleDeleteAndExit = () => {
    router.push('/');
  };
  
  // --- Style-Definition für das Blatt (Rahmen entfernt) ---
  const sheetWrapperStyle = {
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      width: '78%', // 780 / 1000
      height: '75%', // 600 / 800
      transform: 'translate(-50%, -50%)',
      backgroundColor: PAPER_COLOR,
      border: 'none', 
  };

  // --- UI-Komponenten (Reißzwecken angepasst) ---
  const cursorStyle = isWaterMode ? 
    // Aktualisierter Radius: (1 + waterAlpha * 2.0) / 3.0, um 1/3 der Größe zu erhalten
    `url('data:image/svg+xml;utf8,<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="${brushSize * ((1 + waterAlpha * 2.0) / 3.0) / 2}" fill="%23${activeColor.replace('#','')}" fill-opacity="${waterAlpha}" stroke="rgba(0,0,0,0.5)" stroke-width="1"/></svg>') 20 20, auto`
    :
    `url('data:image/svg+xml;utf8,<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="${brushSize/2}" fill="%23${activeColor.replace('#','')}" stroke="black" stroke-opacity="0.2" /></svg>') 20 20, auto`;


  return (
    <div className="flex flex-col h-screen font-serif overflow-hidden relative" style={{ backgroundColor: ROOM_WALL_COLOR }}>
      
      {/* Hintergrundtextur (Die Wände des Closlieu - Kork-/Holz-Gefühl) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ 
             backgroundImage: `url("https://www.transparenttextures.com/patterns/wood-pattern.png")`,
             backgroundSize: '200px'
           }} 
      />

      {/* Header */}
      <div className="h-16 flex-shrink-0 flex items-center justify-between px-4 sm:px-8 z-20" style={{ backgroundColor: '#3E2723', borderBottom: '4px solid #1A1008' }}>
        <div className="text-[#D4C5A8] text-xl sm:text-2xl tracking-widest font-light opacity-90">
          LE CLOSLIEU
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
            <div className="text-[#8D6E63] text-sm font-serif italic opacity-70">
                "Nicht kopieren. Nicht urteilen. Einfach spielen."
            </div>
        </div>
        {/* Buttons */}
        <div className="flex space-x-3 sm:space-x-4 items-center">
          <button onClick={() => setIsInfoModalOpen(true)} className="text-[#A89F91] hover:text-[#FDFBF7] transition-colors" title="Arno Stern Philosophy & Rules">
             <Info size={20} />
          </button>
          <button onClick={promptNewSheet} className="text-[#A89F91] hover:text-[#FDFBF7] transition-colors flex items-center gap-1 sm:gap-2" title="New Sheet (Permanent action)">
            <FilePlus size={20} /> <span className="text-sm hidden sm:inline">Neues Blatt</span>
          </button>
          <button onClick={archiveFormulation} className="text-[#A89F91] hover:text-[#FDFBF7] transition-colors flex items-center gap-1 sm:gap-2" title="Archive">
            <Download size={20} /> <span className="text-sm hidden sm:inline">Archivieren</span>
          </button>
          <button onClick={() => setIsExitConfirmOpen(true)} className="text-[#A89F91] hover:text-[#FDFBF7] transition-colors" title="Exit">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Hauptraum-Bereich */}
      <div ref={mainAreaRef} className="flex-1 min-h-0 flex items-center justify-center relative z-10 overflow-hidden bg-[#2C1E14]">
        
        {/* Die Wand & Papier-Container (Der Haupt-Zeichenbereich) */}
        <div 
            ref={paperContainerRef}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={endDrawing}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
            className="relative shadow-2xl"
            style={{ 
               width: paintingDims.width,
               height: paintingDims.height,
               cursor: cursorStyle,
               touchAction: 'none', 
             }}
        >
          {/* 1. Wand-Leinwand: 1000x800 Puffer (Hintergrund) */}
          <canvas 
              ref={wallCanvasRef} 
              width={WALL_WIDTH} 
              height={WALL_HEIGHT}
              className="absolute inset-0 z-10 w-full h-full"
          />
          
          {/* 2. Blatt-Wrapper: ABSOLUT ZENTRIERT */}
          <div 
            className="absolute z-50 shadow-xl rounded-sm" // Z-50 für höchste Priorität
            style={sheetWrapperStyle} // Verwenden des rahmenlosen Styles
          >
              {/* Blatt-Leinwand: 800x600 Puffer. Füllt den Wrapper aus. */}
              <canvas
                  ref={sheetCanvasRef}
                  width={SHEET_WIDTH} 
                  height={SHEET_HEIGHT} 
                  className="w-full h-full block"
                  style={{ backgroundColor: PAPER_COLOR }} // Fallback Hintergrund
              />

              {/* Reißzwecken: Jetzt relativ zum Blatt-Wrapper positioniert (angepasst für keinen Rahmen) */}
              <div className="absolute inset-0 pointer-events-none">
                  {/* Pins positioniert leicht überlappend am Blattrand */}
                  <div className="absolute top-[-4px] left-[-4px] w-4 h-4 rounded-full bg-white shadow-md"></div>
                  <div className="absolute top-[-4px] right-[-4px] w-4 h-4 rounded-full bg-white shadow-md"></div>
                  <div className="absolute bottom-[-4px] left-[-4px] w-4 h-4 rounded-full bg-white shadow-md"></div>
                  <div className="absolute bottom-[-4px] right-[-4px] w-4 h-4 rounded-full bg-white shadow-md"></div>
              </div>
          </div>
        </div>
      </div>

      {/* Die Tisch-Palette (Unverändert) */}
      <div className="h-32 sm:h-40 w-full z-20 flex-shrink-0 flex flex-col items-center justify-center shadow-[0_-10px_40px_rgba(0,0,0,0.5)] p-1 sm:p-2" 
           style={{ 
             backgroundColor: '#5D4037', 
             backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4))',
             borderTop: '8px solid #3E2723'
           }}>
        
        <div className="flex flex-col items-center w-full max-w-7xl">
            
            {/* 1. Farben-Tablett */}
            <div className="bg-[#3E2723] p-2 sm:p-4 rounded-xl shadow-inner border border-[#4E342E] max-w-full overflow-x-auto mb-2">
                <div className="flex space-x-2"> 
                {STERN_PALETTE.map((color) => (
                    <button
                    key={color.name}
                    onClick={() => handleColorSelect(color.hex)}
                    className={`flex-shrink-0 w-8 h-8 sm:w-11 sm:h-11 rounded-full shadow-[inset_0_-2px_4px_rgba(0,0,0,0.5),0_2px_5px_rgba(0,0,0,0.4)] transition-transform duration-100 transform hover:scale-110 active:scale-95 border-2 ${activeColor === color.hex && !isWaterMode ? 'border-white ring-2 ring-white/30' : 'border-[#2C1E14]'}`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                    >
                    </button>
                ))}
                </div>
            </div>

            {/* 2. Wassertopf & Pinselgröße */}
            <div className="flex items-start justify-center space-x-8 mt-2">
                
                {/* Wassertopf (Links) */}
                <div className="flex flex-col items-center group">
                    <button 
                        onClick={handleWaterPotClick} 
                        className={`h-10 w-24 sm:h-12 sm:w-32 rounded-xl border-4 shadow-inner flex items-center justify-center relative overflow-hidden cursor-pointer transition-all ${isWaterMode ? 'border-[#00BCD4] ring-4 ring-[#00BCD4]/50 scale-105' : 'border-[#8D6E63]'}`}
                        style={{ backgroundColor: '#AED9E0' }} 
                        title={isWaterMode ? "Erneut Eintauchen (Wasserfluss zurücksetzen)" : "Wassermodus verwenden (Aquarell)"}
                    >
                        <div className="absolute inset-0 bg-blue-400 opacity-20 animate-pulse"></div>
                        <span className="text-blue-900 font-bold opacity-30 text-xs">WASSER</span>
                    </button>
                </div>

                {/* Pinselgröße (Rechts) */}
                <div className="flex items-center space-x-3"> 
                    <div className="flex flex-row gap-3 bg-[#3E2723] p-3 rounded-xl border border-[#4E342E]">
                        {[24, 12, 6].map((s) => (
                            <button 
                                key={s}
                                onClick={() => setBrushSize(s)}
                                className={`h-4 rounded-full bg-[#D7CCC8] shadow-sm transition-all ${brushSize === s ? 'bg-[#FFECB3] scale-105 shadow-[0_0_10px_#FFECB3]' : 'opacity-50 hover:opacity-80'}`}
                                style={{ 
                                    width: s * 1.5, 
                                    minWidth: s * 1.5,
                                    filter: brushSize === s ? 'drop-shadow(0 0 5px rgba(255, 236, 179, 0.7))' : 'none' 
                                }}
                                title={`Pinselgröße ${s}`}
                            />
                        ))}
                    </div>
                    <span className="text-[#D7CCC8] text-xs tracking-widest uppercase">Pinsel</span>
                </div>
            </div>
        </div>
      </div>
      
      {/* Modals (Unverändert) */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] p-4">
          <div className="bg-[#FDFBF7] p-6 sm:p-8 rounded-lg shadow-2xl max-w-lg w-full text-[#1a1a1a] relative">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-[#3E2723]">Arno Sterns Closlieu-Prinzipien</h2>
            <p className="mb-4 text-sm">Dieser virtuelle Raum ist inspiriert vom **Le Closlieu** (Der Malort), einer einzigartigen Umgebung, die von Arno Stern geschaffen wurde, um spontanen menschlichen Ausdruck zu fördern, den er als **Formulierung** bezeichnet.</p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>**Kein externer Einfluss:** Der Raum ist vor externem Urteil, Wettbewerb oder Anweisungen geschützt.</li>
              <li className='font-bold text-[#D40000]'>**Farbe spritzt auf die Wand:** Farbe erstreckt sich nun über den Rand des Papiers hinaus auf die Wand. Diese Wandfarbe ist **permanent** und bleibt erhalten, wenn Sie ein neues Blatt einlegen.</li>
              <li className='font-bold text-[#D40000]'>**Wasser-Spül-Effekt:** Der Wasserpinsel verwendet nun einen farbbasierten, transparenten Strich, um vorhandene Farben zu "spülen" (zu mischen und zu verteilen), anstatt sie zu "radieren", was einen glatteren Aquarell-Übergang ergibt.</li>
              <li>**Die Tisch-Palette:** Es dürfen nur die 18 verfügbaren spezifischen Farben verwendet werden, die zentral angeordnet sind, um eine organische Auswahl zu fördern.</li>
              <li>**Keine Themen oder Motive:** Versuchen Sie nicht, etwas Bestimmtes zu zeichnen oder zu malen. Der Fokus liegt auf dem spontanen Fluss der Spur.</li>
            </ul>
            <p className="mt-4 text-xs italic text-black">
                In diesem Raum sind Sie frei zu spielen und Ihre inneren Bedürfnisse durch Farbe und Linie zu entdecken.
            </p>
            <button
              onClick={() => setIsInfoModalOpen(false)}
              className="absolute top-3 right-3 text-black hover:text-red-500 text-2xl"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {isNewSheetConfirmOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] p-4">
              <div className="bg-[#FDFBF7] p-6 sm:p-8 rounded-lg shadow-2xl max-w-sm w-full text-[#1a1a1a] relative text-center">
                  <h2 className="text-xl font-bold mb-3 text-[#3E2723]">Blatt ersetzen</h2>
                  <p className="mb-6 text-sm">
                      Möchten Sie das aktuelle Blatt archivieren, bevor Sie ein frisches Papier einlegen? Die Farbe an der Wand bleibt erhalten.
                  </p>
                  <div className="flex flex-col space-y-3">
                      <button
                          onClick={handleArchiveAndNewSheet}
                          className="w-full px-6 py-3 rounded-lg bg-[#009688] text-white hover:bg-[#00796B] transition-colors font-bold text-sm shadow-md"
                          title="Lädt die aktuelle Formulierung herunter und legt ein neues Blatt ein."
                      >
                          Archivieren & Neues Blatt
                      </button>
                      <button
                          onClick={handleNewSheetConfirmed}
                          className="w-full px-6 py-3 rounded-lg bg-[#D40000] text-white hover:bg-[#A80000] transition-colors font-bold text-sm shadow-md"
                          title="Löscht das aktuelle Blatt, ohne es zu speichern."
                      >
                          Löschen (Ohne Archivierung)
                      </button>
                      <button
                          onClick={() => setIsNewSheetConfirmOpen(false)}
                          className="w-full px-6 py-2 rounded-lg bg-white hover:bg-white transition-colors font-medium text-sm"
                      >
                          Abbrechen
                      </button>
                  </div>
              </div>
          </div>
      )}

      {isExitConfirmOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] p-4">
              <div className="bg-[#FDFBF7] p-6 sm:p-8 rounded-lg shadow-2xl max-w-sm w-full text-[#1a1a1a] relative text-center">
                  <h2 className="text-xl font-bold mb-3 text-[#3E2723]">Closlieu verlassen</h2>
                  <p className="mb-6 text-sm">
                      Möchten Sie Ihre Arbeit archivieren, bevor Sie den Raum verlassen?
                  </p>
                  <div className="flex flex-col space-y-3">
                      <button
                          onClick={handleArchiveAndExit}
                          className="w-full px-6 py-3 rounded-lg bg-[#009688] text-white hover:bg-[#00796B] transition-colors font-bold text-sm shadow-md"
                      >
                          Archivieren & Verlassen
                      </button>
                      <button
                          onClick={handleDeleteAndExit}
                          className="w-full px-6 py-3 rounded-lg bg-[#D40000] text-white hover:bg-[#A80000] transition-colors font-bold text-sm shadow-md"
                      >
                          Löschen & Verlassen
                      </button>
                      <button
                          onClick={() => setIsExitConfirmOpen(false)}
                          className="w-full px-6 py-2 rounded-lg bg-white hover:bg-white transition-colors font-medium text-sm"
                      >
                          Abbrechen
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}