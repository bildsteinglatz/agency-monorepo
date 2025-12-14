import React, {useRef, useState, useEffect, useCallback} from 'react';
import {PatchEvent, set} from 'sanity';

type Anchor = { name: string; hex: string };

const ANCHORS: Anchor[] = [
  { name: 'white', hex: '#ffffff' },
  { name: 'light-grey', hex: '#d9d9d9' },
  { name: 'yellow', hex: '#ffd400' },
  { name: 'green', hex: '#2ecc71' },
  { name: 'blue', hex: '#3498db' },
  { name: 'violet', hex: '#8e44ad' },
  { name: 'magenta', hex: '#ff00a8' },
  { name: 'red', hex: '#e74c3c' },
  { name: 'brown', hex: '#8b5a2b' },
  { name: 'dark-grey', hex: '#444444' },
  { name: 'black', hex: '#000000' },
];

function hexToRgb(hex: string) {
  const parsed = hex.replace('#', '');
  const r = parseInt(parsed.slice(0, 2), 16);
  const g = parseInt(parsed.slice(2, 4), 16);
  const b = parseInt(parsed.slice(4, 6), 16);
  return [r, g, b];
}

function rgbToHex(r: number, g: number, b: number) {
  return (
    '#' + [r, g, b].map(n => n.toString(16).padStart(2, '0')).join('')
  ).toLowerCase();
}

function lerp(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

function interpolateAlongAnchors(t: number) {
  const n = ANCHORS.length;
  if (t <= 0) return ANCHORS[0].hex;
  if (t >= 1) return ANCHORS[n - 1].hex;
  const scaled = t * (n - 1);
  const idx = Math.floor(scaled);
  const localT = scaled - idx;
  const aRgb = hexToRgb(ANCHORS[idx].hex);
  const bRgb = hexToRgb(ANCHORS[idx + 1].hex);
  const r = lerp(aRgb[0], bRgb[0], localT);
  const g = lerp(aRgb[1], bRgb[1], localT);
  const b = lerp(aRgb[2], bRgb[2], localT);
  return rgbToHex(r, g, b);
}

export default function ColorSlider(props: any) {
  const {value, onChange, readOnly, schemaType} = props;
  const initial = value || ANCHORS[Math.floor((ANCHORS.length - 1) / 2)].hex;
  const [hex, setHex] = useState(initial.toLowerCase());
  const trackRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    setHex((value || initial || '').toLowerCase());
  }, [value, initial]);

  const emit = useCallback((h: string) => {
    if (readOnly) return;
    setHex(h.toLowerCase());
    onChange(PatchEvent.from([set(h.toLowerCase())]));
  }, [onChange, readOnly]);

  const onPointer = useCallback((clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    let t = (clientX - rect.left) / rect.width;
    t = Math.max(0, Math.min(1, t));
    const picked = interpolateAlongAnchors(t);
    emit(picked);
  }, [emit]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      onPointer(e.clientX);
    };
    const onUp = () => { draggingRef.current = false; };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [onPointer]);

  const startDrag = (e: React.PointerEvent) => {
    if (readOnly) return;
    draggingRef.current = true;
    (e.target as Element).setPointerCapture?.((e as any).pointerId);
    onPointer(e.clientX);
  };

  const onClickTrack = (e: React.MouseEvent) => {
    if (readOnly) return;
    onPointer(e.clientX);
  };

  const onAnchorClick = (hex: string) => {
    if (readOnly) return;
    emit(hex);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.trim();
    // simple hex validation
    if (/^#([0-9a-fA-F]{6})$/.test(v)) {
      emit(v.toLowerCase());
    } else {
      setHex(v.toLowerCase());
    }
  };

  // build CSS gradient
  const gradient = ANCHORS.map(a => a.hex).join(', ');

  return (
    <div>
      <label style={{display: 'block', fontWeight: 600, marginBottom: 6}}>{schemaType?.title || 'Select color'}</label>
      {schemaType?.description && <div style={{marginBottom: 8, color: '#666'}}>{schemaType.description}</div>}

      <div
        ref={trackRef}
        onPointerDown={startDrag}
        onClick={onClickTrack}
        style={{
          height: 28,
          borderRadius: 6,
          background: `linear-gradient(90deg, ${gradient})`,
          position: 'relative',
          cursor: readOnly ? 'not-allowed' : 'pointer',
          border: '1px solid #ccc'
        }}
      >
        {/* thumb position */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            transform: 'translate(-12px, -50%)',
            left: `${(() => {
              // compute left percent based on current hex by finding best t
              try {
                const target = hexToRgb(hex);
                // brute-force sample along anchors to find closest color
                const samples = 200;
                let bestT = 0;
                let bestDist = Infinity;
                for (let i = 0; i <= samples; i++) {
                  const t = i / samples;
                  const sampleHex = interpolateAlongAnchors(t);
                  const s = hexToRgb(sampleHex);
                  const dist = (s[0]-target[0])**2 + (s[1]-target[1])**2 + (s[2]-target[2])**2;
                  if (dist < bestDist) { bestDist = dist; bestT = t; }
                }
                return `${Math.round(bestT * 100)}%`;
              } catch (err) { return '50%'; }
            })()}`
          }}
        >
          <div style={{width: 24, height: 24, borderRadius: 12, background: hex, border: '2px solid #fff', boxShadow: '0 1px 2px rgba(0,0,0,0.2)'}} />
        </div>
      </div>

      <div style={{display: 'flex', gap: 8, alignItems: 'center', marginTop: 8}}>
        {ANCHORS.map(a => (
          <button key={a.name} type="button" onClick={() => onAnchorClick(a.hex)} disabled={readOnly}
            style={{background: a.hex, border: '1px solid #ddd', width: 28, height: 28, borderRadius: 6, cursor: 'pointer'}}
            title={a.name}
          />
        ))}
        <input value={hex} onChange={onInputChange} style={{marginLeft: 12, padding: '6px 8px'}} placeholder="#rrggbb" />
      </div>
    </div>
  );
}
