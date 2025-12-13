'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ColorWheelDemo } from './ColorWheelDemo';
import { Navigation } from '@/components/Navigation';

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState('demo');
  return (
    <>
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-20">
        <h1 className="about-title text-4xl mb-6">is a Wheel is a Wheel is a Wheel is a Wheel is a</h1>
        <div style={{ marginBottom: '120px' }} />
        <ColorWheelDemo />
        {/* Telemetry/stats section is inside ColorWheelDemo */}
      </div>
    </>
  );
}
