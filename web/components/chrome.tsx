'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LANGS, SANS, pillBtn, shade, accentInk } from '@/lib/tokens';
import type { Lang } from '@/lib/types';
import { useStore, accentHex } from '@/lib/store';

type Tab = 'home' | 'rel' | 'today' | 'me';

export function BottomTabBar({ activeTab }: { activeTab: Tab }) {
  const router = useRouter();
  const dark = useStore(s => s.tweaks.darkMode);
  const accent = accentInk(accentHex(useStore(s => s.tweaks.accent)), dark);
  const lang = useStore(s => s.lang);
  const dim = dark ? 'rgba(255,255,255,0.45)' : 'rgba(26,21,56,0.45)';

  const tabs: { id: Tab; label: Record<Lang, string>; path: string; icon: React.ReactNode }[] = [
    { id: 'home', label: { ko: '홈', en: 'Home', ja: 'ホーム', zh: '主页', es: 'Inicio' }, path: '/',
      icon: <path d="M3 11l9-8 9 8v10a2 2 0 01-2 2h-4v-7h-6v7H5a2 2 0 01-2-2V11z" /> },
    { id: 'rel', label: { ko: '관계', en: 'Relations', ja: '関係', zh: '关系', es: 'Vínculos' }, path: '/relations',
      icon: <><circle cx="9" cy="8" r="3.5"/><circle cx="17" cy="11" r="2.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M15 20c0-2 1.3-4 4-4"/></> },
    { id: 'today', label: { ko: '오늘', en: 'Today', ja: '今日', zh: '今天', es: 'Hoy' }, path: '/today',
      icon: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></> },
    { id: 'me', label: { ko: '나', en: 'Me', ja: '私', zh: '我', es: 'Yo' }, path: '/me',
      icon: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></> },
  ];

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30,
      paddingBottom: 30, paddingTop: 12,
      background: dark
        ? 'linear-gradient(180deg, rgba(11,8,36,0) 0%, rgba(11,8,36,0.85) 35%, rgba(11,8,36,1) 100%)'
        : 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 35%, rgba(255,255,255,1) 100%)',
      fontFamily: SANS,
    }}>
      <div style={{
        margin: '0 14px', height: 56, borderRadius: 28,
        background: dark ? 'rgba(30,22,68,0.7)' : 'rgba(255,255,255,0.85)',
        border: `0.5px solid ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.8)'}`,
        backdropFilter: 'blur(24px) saturate(180%)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        padding: '0 10px',
      }}>
        {tabs.map(tab => {
          const active = tab.id === activeTab;
          return (
            <button key={tab.id} onClick={() => router.push(tab.path)} style={{
              minWidth: 48, minHeight: 48, padding: '6px 10px', border: 'none',
              background: 'transparent', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              color: active ? accent : dim, fontFamily: SANS, transition: 'color .2s',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth={active ? 2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
                {tab.icon}
              </svg>
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 600, letterSpacing: 0.2,
                             whiteSpace: 'nowrap', wordBreak: 'keep-all' }}>
                {tab.label[lang]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function FloatingAddBtn({ onClick, label }: { onClick: () => void; label: string }) {
  const accent = accentHex(useStore(s => s.tweaks.accent));
  return (
    <button onClick={onClick} style={{
      position: 'absolute', bottom: 100, right: 20, zIndex: 40,
      height: 56, padding: '0 22px 0 18px', borderRadius: 28,
      background: `linear-gradient(135deg, ${accent}, ${shade(accent, -15)})`,
      border: 'none', color: '#1A1538', fontWeight: 600, fontSize: 15,
      display: 'flex', alignItems: 'center', gap: 8,
      boxShadow: `0 12px 32px ${accent}55, 0 4px 12px rgba(0,0,0,0.3)`,
      cursor: 'pointer', letterSpacing: -0.2,
      fontFamily: SANS, whiteSpace: 'nowrap', wordBreak: 'keep-all',
      animation: 'ctx-pop .5s cubic-bezier(.3,1.5,.5,1) both',
    }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1538"
           strokeWidth="2.4" strokeLinecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
      {label}
    </button>
  );
}

export function LanguageMenu() {
  const [open, setOpen] = useState(false);
  const dark = useStore(s => s.tweaks.darkMode);
  const accent = accentInk(accentHex(useStore(s => s.tweaks.accent)), dark);
  const lang = useStore(s => s.lang);
  const setLang = useStore(s => s.setLang);
  const fg = dark ? '#fff' : '#1A1538';
  return (
    <>
      <button onClick={() => setOpen(o => !o)} style={pillBtn(dark)} aria-label="Language">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={fg}
             strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <ellipse cx="12" cy="12" rx="4" ry="9" />
          <path d="M3 12h18" />
        </svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 20, top: 60, zIndex: 30,
          background: dark ? 'rgba(30,22,68,0.95)' : 'rgba(255,255,255,0.96)',
          border: `0.5px solid ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}`,
          backdropFilter: 'blur(20px)',
          borderRadius: 14, padding: 6, minWidth: 160,
          boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
          animation: 'ctx-rise .22s ease both',
        }}>
          {LANGS.map(l => (
            <button key={l.code} onClick={() => { setLang(l.code as Lang); setOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      width: '100%', padding: '10px 12px', minHeight: 44,
                      background: l.code === lang
                        ? (dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)')
                        : 'transparent',
                      border: 'none', borderRadius: 10, cursor: 'pointer',
                      color: fg, fontSize: 14, textAlign: 'left',
                      fontFamily: SANS, fontWeight: 500,
                    }}>
              <span>{l.label}</span>
              {l.code === lang && <span style={{ color: accent, fontSize: 14 }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

export function AppHeader() {
  const dark = useStore(s => s.tweaks.darkMode);
  const accent = accentInk(accentHex(useStore(s => s.tweaks.accent)), dark);
  const fg = dark ? '#fff' : '#1A1538';
  return (
    <div style={{ padding: '0 20px 4px', position: 'relative', fontFamily: SANS }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 44 }}>
        <div style={{ fontSize: 19, fontWeight: 600, letterSpacing: -0.4, color: accent }}>contextella</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <LanguageMenu />
          <button style={pillBtn(dark)} aria-label="notifications">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10 21a2 2 0 004 0" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export function ScreenHeader({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  const dark = useStore(s => s.tweaks.darkMode);
  const accent = accentInk(accentHex(useStore(s => s.tweaks.accent)), dark);
  const fg = dark ? '#fff' : '#1A1538';
  const subC = dark ? 'rgba(255,255,255,0.6)' : 'rgba(26,21,56,0.6)';
  return (
    <div style={{ padding: '0 20px 4px', position: 'relative', fontFamily: SANS }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    minHeight: 44, gap: 12 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 11, color: accent, letterSpacing: 1.5, fontWeight: 600,
                        textTransform: 'uppercase' }}>contextella</div>
          <div style={{ fontSize: 24, fontWeight: 600, color: fg, letterSpacing: -0.6,
                        marginTop: 2, wordBreak: 'keep-all' }}>{title}</div>
          {sub && <div style={{ fontSize: 13, color: subC, marginTop: 2 }}>{sub}</div>}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          {right}
          <LanguageMenu />
        </div>
      </div>
    </div>
  );
}
