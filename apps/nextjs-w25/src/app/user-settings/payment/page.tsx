'use client';

import React from 'react';
import { ArrowLeft, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function PaymentPage() {
  return (
    <div className="min-h-screen pt-24 px-4 pb-20 max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/user-settings" className="flex items-center gap-2 text-sm uppercase font-bold opacity-50 hover:opacity-100 mb-4">
          <ArrowLeft size={16} /> Back to Control Room
        </Link>
        <h1 className="font-owners font-black italic text-4xl uppercase">Payment Settings</h1>
      </div>

      <div className="border border-foreground p-8 text-center">
        <CreditCard size={48} className="mx-auto mb-4 opacity-50" />
        <h2 className="font-owners font-bold text-xl uppercase mb-2">No Payment Methods</h2>
        <p className="opacity-70 mb-6">You have not added any payment methods yet.</p>
        <button className="bg-foreground text-background font-bold uppercase px-6 py-3 hover:bg-neon-orange hover:text-black transition-colors">
          Add Payment Method
        </button>
      </div>
    </div>
  );
}
