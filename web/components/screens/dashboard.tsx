'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ELEMENTS, SANS, cosmicBg, formatDate } from '@/lib/tokens';
import { I18N } from '@/lib/i18n';
import { useStore, accentHex } from '@/lib/store';
import { ConstellationViz, OrbitalViz, GridViz, StarField, ElementOrb } from '@/components/primitives';
import { AppHeader } from '@/components/chrome';
import { BottomTabBar, FloatingAddBtn } from '@/components/chrome';
import { TodaysFlowCard } from '@/components/today-flow';
import { AddPersonSheet, NewUniverseSheet } from '@/components/sheets';

export default function DashboardScreen() {
  const router = useRouter();
  const lang = useStore(s => s.lang);
  const dark = useStore(s => s.tweaks.darkMode);
  const accent = accentHex(useStore(s => s.tweaks.accent));
  const vizStyle = useStore(s => s.tweaks.vizStyle);
  const universes = useStore(s => s.universes);
  const me = useStore(s => s.me);
  const activeUniverseId = useStore(s => s.activeUniverseId);
  const setActiveUniverse = useStore(s => s.setActiveUniverse);
  const t = I18N[lang];
  const fg = dark ? '#fff' : '#1A1538';
  const sub = dark ? 'rgba(255,255,255,0.55)' : 'rgba(26,21,56,0.6)';

  const [addOpen, setAddOpen] = useState(false);
  const [newUniverseOpen, setNewUniverseOpen] = useState(false);
  const universe = universes.find(u => u.id === activeUniverseId) || universes[0];
  const network = universe ? [me, ...universe.members] : [me];
  const onSelectPerson = (id: string) => { if (id !== 'me') router.push(`/result/${id}`); };

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      background: cosmicBg(dark), color: fg, overflow: 'hidden', fontFamily: SANS,
    }}>
      <StarField count={dark ? 80 : 30} seed={5} opacity={dark ? 0.65 : 0.15} />
      <div style={{ position: 'relative', height: '100%', overflow: 'auto', paddingBottom: 140 }}>
        <div style={{ height: 54 }} />
        <AppHeader />
        <div style={{ padding: '12px 22px 8px', animation: 'ctx-rise .45s ease both' }}>
          <div style={{
            fontSize: 26, fontWeight: 600, letterSpacing: -0.7, color: fg,
            lineHeight: 1.25, whiteSpace: 'pre-line',
          }}>
            {lang === 'ko' ? '안녕,\n오늘의 결을 살펴볼까요' : 'Hello,\nshall we read today’s grain'}
          </div>
        </div>
        <TodaysFlowCard onPersonClick={onSelectPerson} />

        <div style={{
          margin: '12px 16px 0', borderRadius: 22, padding: '14px 18px',
          background: dark
            ? 'linear-gradient(155deg, rgba(120,90,200,0.10), rgba(60,40,140,0.04))'
            : 'linear-gradient(155deg, rgba(255,255,255,0.7), rgba(240,233,255,0.5))',
          border: `0.5px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)'}`,
          display: 'flex', alignItems: 'center', gap: 14, fontFamily: SANS,
          animation: 'ctx-rise .55s cubic-bezier(.22,.7,.3,1) both',
        }}>
          <ElementOrb element={me.element} size={48} animated />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase',
                          color: accent, fontWeight: 600 }}>
              {lang === 'ko' ? '나의 기운' : 'My Aura'}
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: fg, letterSpacing: -0.4, marginTop: 2 }}>
              {ELEMENTS[me.element].label_en}
            </div>
            <div style={{ fontSize: 12, color: sub, marginTop: 2, lineHeight: 1.4 }}>
              {t.elementWaterPoetic}
            </div>
          </div>
        </div>

        <div style={{ margin: '24px 0 0' }}>
          <div style={{ padding: '0 22px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 600, color: fg, letterSpacing: -0.5 }}>
                {t.myUniverse}
              </div>
              <div style={{ fontSize: 13, color: sub, marginTop: 2 }}>
                {t.myUniverseSub(universe?.members.length || 0)}
              </div>
            </div>
            <div style={{ fontSize: 12, color: accent, letterSpacing: 0.3, fontWeight: 500 }}>
              {formatDate(new Date(), lang)}
            </div>
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 8, padding: '0 18px', overflowX: 'auto' }}>
            {universes.map(u => {
              const active = u.id === activeUniverseId;
              return (
                <button key={u.id} onClick={() => setActiveUniverse(u.id)} style={{
                  minHeight: 38, padding: '0 16px', borderRadius: 19,
                  background: active
                    ? (dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.85)')
                    : 'transparent',
                  border: `0.5px solid ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(26,21,56,0.10)'}`,
                  color: active ? fg : sub,
                  fontSize: 14, fontWeight: active ? 600 : 500, letterSpacing: -0.2,
                  cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: 8, fontFamily: SANS,
                }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: 4,
                    background: active ? accent : (dark ? 'rgba(255,255,255,0.25)' : 'rgba(26,21,56,0.2)'),
                    boxShadow: active ? `0 0 8px ${accent}` : 'none',
                  }} />
                  <span>{lang === 'ko' ? u.name_ko : u.name_en}</span>
                  <span style={{ fontSize: 11, color: active ? accent : sub,
                                 fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{u.members.length}</span>
                </button>
              );
            })}
            <button onClick={() => setNewUniverseOpen(true)} style={{
              minHeight: 38, width: 38, borderRadius: 19, background: 'transparent',
              border: `0.5px dashed ${dark ? 'rgba(255,255,255,0.20)' : 'rgba(26,21,56,0.18)'}`,
              color: sub, cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, lineHeight: 1, fontFamily: SANS,
            }} aria-label="add universe">+</button>
          </div>
          <div key={activeUniverseId} style={{ marginTop: 12, padding: '0 8px',
                                                animation: 'ctx-fade .35s ease both' }}>
            {vizStyle === 'constellation' && (
              <ConstellationViz network={network} width={358} height={320}
                                accent={accent} onSelect={onSelectPerson} lang={lang} />
            )}
            {vizStyle === 'orbital' && (
              <OrbitalViz network={network} width={358} height={320}
                          accent={accent} onSelect={onSelectPerson} lang={lang} />
            )}
            {vizStyle === 'grid' && (
              <div style={{ padding: '12px 12px 0' }}>
                <GridViz network={network} accent={accent} onSelect={onSelectPerson} lang={lang} />
              </div>
            )}
          </div>
        </div>
      </div>
      <FloatingAddBtn onClick={() => setAddOpen(true)} label={t.addPerson} />
      <BottomTabBar activeTab="home" />
      <AddPersonSheet open={addOpen} onClose={() => setAddOpen(false)}
                      onSaved={(id) => router.push(`/result/${id}`)} />
      <NewUniverseSheet open={newUniverseOpen} onClose={() => setNewUniverseOpen(false)} />
    </div>
  );
}
