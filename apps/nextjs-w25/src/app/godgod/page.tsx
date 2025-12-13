"use client";
import React from "react";
import { useGodSidebarMargin } from '@/components/GodSidebarMarginContext';

export default function GodGodPage() {
  const { godMargin, setGodMargin, switchMargin, setSwitchMargin, wheelMargin, setWheelMargin } = useGodSidebarMargin();

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">GodGod Sidebar Margin Controls</h1>
      <div className="space-y-6">
        <div>
          <label className="block mb-2 font-semibold">GodModeLogo margin-top (px): {godMargin}</label>
          <input type="range" min={0} max={300} value={godMargin} onChange={e => setGodMargin(Number(e.target.value))} />
        </div>
        <div>
          <label className="block mb-2 font-semibold">ThemeSwitch margin-top (px): {switchMargin}</label>
          <input type="range" min={-100} max={300} value={switchMargin} onChange={e => setSwitchMargin(Number(e.target.value))} />
        </div>
        <div>
          <label className="block mb-2 font-semibold">WheelLogo margin-top (px): {wheelMargin}</label>
          <input type="range" min={-100} max={300} value={wheelMargin} onChange={e => setWheelMargin(Number(e.target.value))} />
        </div>
      </div>
      <div className="mt-10">
        <div className="flex flex-col items-center" style={{ width: 40 }}>
          <button style={{ marginTop: godMargin }}>
            <span className="font-bold">GodModeLogo</span>
          </button>
          <div style={{ marginTop: switchMargin }}>
            <span>ThemeSwitch</span>
          </div>
          <button style={{ marginTop: wheelMargin }}>
            <span>WheelLogo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
