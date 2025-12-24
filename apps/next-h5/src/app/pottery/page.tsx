'use client';

import React from 'react';
import PotteryModal from '@/components/PotteryModal';

export default function PotteryPage() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
      <PotteryModal isOpen={true} onClose={() => window.location.href = '/'} />
    </div>
  );
}
