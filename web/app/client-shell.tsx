'use client';
import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { PhoneFrame } from '@/components/phone-frame';
import { useStore } from '@/lib/store';
import { cosmicBg } from '@/lib/tokens';

// Pages that render on their own without app data (optional account flows).
const ACCOUNT_PATHS = ['/login', '/register'];

function Loading({ dark }: { dark: boolean }) {
  return (
    <div style={{
      width: '100%', height: '100%', background: cosmicBg(dark),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 15,
        border: '2.5px solid rgba(255,255,255,0.18)',
        borderTopColor: 'rgba(255,255,255,0.7)',
        animation: 'ctx-spin 0.8s linear infinite',
      }} />
      <style>{'@keyframes ctx-spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  );
}

export function ClientShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dark = useStore(s => s.tweaks.darkMode);
  const hydrated = useStore(s => s.hydrated);
  const status = useStore(s => s.status);
  const init = useStore(s => s.init);

  const isAccountPage = ACCOUNT_PATHS.includes(pathname);
  const isOnboarding = pathname === '/onboarding';

  // Load local data (and reconcile with the cloud) once the store has hydrated.
  useEffect(() => {
    if (hydrated && status === 'idle') init();
  }, [hydrated, status, init]);

  // First-run onboarding gate — no account required.
  useEffect(() => {
    if (status === 'onboarding' && !isOnboarding && !isAccountPage) router.replace('/onboarding');
    else if (status === 'ready' && isOnboarding) router.replace('/');
  }, [status, isOnboarding, isAccountPage, router]);

  if (!hydrated) {
    return <PhoneFrame dark><Loading dark /></PhoneFrame>;
  }

  // Account pages and onboarding render their own UI immediately.
  if (isAccountPage || isOnboarding) {
    return <PhoneFrame dark={dark}>{children}</PhoneFrame>;
  }

  // App pages wait for local data to be derived.
  if (status !== 'ready') {
    return <PhoneFrame dark={dark}><Loading dark={dark} /></PhoneFrame>;
  }

  return <PhoneFrame dark={dark}>{children}</PhoneFrame>;
}
