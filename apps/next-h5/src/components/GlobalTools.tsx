'use client';

import { useState } from 'react';
import { m } from 'framer-motion';
import BrutalistSearchTrigger from './BrutalistSearchTrigger';
import BrutalistPaintTrigger from './BrutalistPaintTrigger';
import BrutalistSearchModal from './BrutalistSearchModal';

export default function GlobalTools() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      {/* Tools Container - Positioned above the SideEvents tab */}
      <div className="fixed right-8 top-1/2 -translate-y-[240px] z-50 flex flex-col gap-6">
        <BrutalistPaintTrigger />
        <BrutalistSearchTrigger onClick={() => setIsSearchOpen(true)} />
      </div>

      <BrutalistSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
