'use client';
import React, { useEffect, useState } from 'react';

// App shell. On narrow viewports the app fills the window; on wide viewports
// the (mobile-first) layout is centered in a full-height column.
const APP_WIDTH = 440;

export function PhoneFrame({ children, dark = true }: { children: React.ReactNode; dark?: boolean }) {
  const [isWide, setIsWide] = useState(false);

  useEffect(() => {
    const check = () => setIsWide(window.innerWidth >= 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!isWide) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: dark ? '#000' : '#F2F2F7', overflow: 'hidden' }}>
        {children}
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', alignItems: 'stretch', justifyContent: 'center',
      background:
        'radial-gradient(ellipse 60% 50% at 30% 20%, rgba(120, 80, 220, 0.18), transparent 60%),' +
        'radial-gradient(ellipse 60% 50% at 80% 80%, rgba(232, 164, 181, 0.10), transparent 60%),' +
        'linear-gradient(180deg, #0A0720 0%, #050313 100%)',
    }}>
      <div style={{
        width: APP_WIDTH, height: '100%', position: 'relative', overflow: 'hidden',
        background: dark ? '#000' : '#F2F2F7',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 24px 80px rgba(0,0,0,0.45)',
      }}>
        {children}
      </div>
    </div>
  );
}
