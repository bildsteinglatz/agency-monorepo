'use client';

import { useState } from 'react';
import BrutalistSearchTrigger from './BrutalistSearchTrigger';
import BrutalistSearchModal from './BrutalistSearchModal';

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <BrutalistSearchTrigger onClick={() => setIsOpen(true)} />
      <BrutalistSearchModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
