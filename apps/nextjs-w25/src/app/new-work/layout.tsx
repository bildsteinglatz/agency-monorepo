import React from 'react';
export default function NewWorkLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen pt-[80px]">
      <main className="flex-1 p-4">
        {children}
      </main>
    </div>
  );
}
