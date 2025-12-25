'use client';

import { LazyMotion, domMax } from 'framer-motion';
import dynamic from 'next/dynamic';

const CommandPalette = dynamic(() => import('./CommandPalette'), {
  ssr: false,
});

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      {children}
      <CommandPalette />
    </LazyMotion>
  );
}
