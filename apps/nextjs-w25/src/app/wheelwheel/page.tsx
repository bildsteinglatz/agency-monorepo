'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ColorWheelDemo } from '../demo/ColorWheelDemo';
import { Navigation } from '@/components/Navigation';
import { useGodSidebarMargin } from '@/components/GodSidebarMarginContext';

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState('demo');
  const { godMargin, setGodMargin, switchMargin, setSwitchMargin, wheelMargin, setWheelMargin } = useGodSidebarMargin();

  return (
    <>
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-20">
        <h1 className="about-title text-4xl mb-6">is a Wheel is a Wheel is a Wheel is a Wheel is a</h1>
        <div style={{ marginBottom: '120px' }} />
        <ColorWheelDemo />

        <div className="mt-20 pt-10 border-t border-black dark:border-black">
          <h2 className="text-xl font-bold mb-6">Sidebar Margin Controls</h2>
          <div className="space-y-6 max-w-md">
            <div>
              <label className="block mb-2 font-semibold">GodModeLogo margin-top (px): {godMargin}</label>
              <input type="range" min={0} max={300} value={godMargin} onChange={e => setGodMargin(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="block mb-2 font-semibold">ThemeSwitch margin-top (px): {switchMargin}</label>
              <input type="range" min={-100} max={300} value={switchMargin} onChange={e => setSwitchMargin(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="block mb-2 font-semibold">WheelLogo margin-top (px): {wheelMargin}</label>
              <input type="range" min={-100} max={300} value={wheelMargin} onChange={e => setWheelMargin(Number(e.target.value))} className="w-full" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

