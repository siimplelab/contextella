'use client';
import React, { useEffect, useState } from 'react';
import { PhoneFrame } from '@/components/phone-frame';
import { useStore } from '@/lib/store';

export function ClientShell({ children }: { children: React.ReactNode }) {
  const dark = useStore(s => s.tweaks.darkMode);
  const hydrated = useStore(s => s.hydrated);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // avoid SSR/hydration mismatch — wait until client has run
  if (!mounted || !hydrated) {
    return (
      <PhoneFrame dark>
        <div style={{ width: '100%', height: '100%', background: '#06041A' }} />
      </PhoneFrame>
    );
  }

  return <PhoneFrame dark={dark}>{children}</PhoneFrame>;
}
