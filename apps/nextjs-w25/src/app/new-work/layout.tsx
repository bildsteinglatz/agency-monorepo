import React from 'react';
import { HierarchicalNavigation } from '@/components/navigation/HierarchicalNavigation';

export default function NewWorkLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen pt-[80px]">
      <aside className="w-64 hidden md:block p-4 border-r border-gray-100 fixed h-[calc(100vh-80px)] overflow-y-auto">
        <HierarchicalNavigation />
      </aside>
      <main className="flex-1 md:ml-64 p-4">
        {children}
      </main>
    </div>
  );
}
