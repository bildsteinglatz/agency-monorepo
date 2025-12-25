'use client';

import { LazyMotion, domAnimation } from 'framer-motion';
import dynamic from 'next/dynamic';

const CommandPalette = dynamic(() => import('./CommandPalette'), {
  ssr: false,
});

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
      <CommandPalette />
    </LazyMotion>
  );
}
