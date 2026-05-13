'use client';
import React from 'react';
import { ELEMENTS, SANS, cosmicBg, formatDate, parseBirth, LANGS } from '@/lib/tokens';
import { useStore, accentHex } from '@/lib/store';
import { ElementOrb, StarField } from '@/components/primitives';
import { ScreenHeader, BottomTabBar } from '@/components/chrome';

export default function MeScreen() {
  const lang = useStore(s => s.lang);
  const dark = useStore(s => s.tweaks.darkMode);
  const accent = accentHex(useStore(s => s.tweaks.accent));
  const me = useStore(s => s.me);
  const universes = useStore(s => s.universes);
  const tweaks = useStore(s => s.tweaks);
  const setTweak = useStore(s => s.setTweak);

  const fg = dark ? '#fff' : '#1A1538';
  const sub = dark ? 'rgba(255,255,255,0.6)' : 'rgba(26,21,56,0.6)';
  const cardBg = dark
    ? 'linear-gradient(155deg, rgba(120,90,200,0.16), rgba(60,40,140,0.05))'
    : 'linear-gradient(155deg, rgba(255,255,255,0.85), rgba(240,233,255,0.6))';
  const cardBorder = `0.5px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)'}`;
  const e = ELEMENTS[me.element];

  const pillars = lang === 'ko'
    ? [
        { label: '년주', sky: '계', earth: '유', el: 'metal' as const },
        { label: '월주', sky: '무', earth: '오', el: 'fire' as const },
        { label: '일주', sky: '경', earth: '인', el: 'wood' as const },
        { label: '시주', sky: '임', earth: '자', el: 'water' as const },
      ]
    : [
        { label: 'Year', sky: 'Gye', earth: 'Yu', el: 'metal' as const },
        { label: 'Month', sky: 'Mu', earth: 'O', el: 'fire' as const },
        { label: 'Day', sky: 'Gyeong', earth: 'In', el: 'wood' as const },
        { label: 'Hour', sky: 'Im', earth: 'Ja', el: 'water' as const },
      ];

  const balance = [
    { el: 'water' as const, val: 32 },
    { el: 'wood' as const, val: 18 },
    { el: 'fire' as const, val: 14 },
    { el: 'earth' as const, val: 22 },
    { el: 'metal' as const, val: 14 },
  ];
  const totalPeople = universes.reduce((s, u) => s + u.members.length, 0);

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      background: cosmicBg(dark), color: fg, overflow: 'hidden', fontFamily: SANS,
    }}>
      <StarField count={dark ? 70 : 20} seed={13} opacity={dark ? 0.5 : 0.12} />
      <div style={{ position: 'relative', height: '100%', overflow: 'auto', paddingBottom: 130 }}>
        <div style={{ height: 54 }} />
        <ScreenHeader title={lang === 'ko' ? '나' : 'Me'}
                      sub={lang === 'ko' ? '나의 사주와 결' : 'My saju & grain'} />

        <div style={{
          margin: '12px 16px 0', borderRadius: 28, padding: '22px 20px',
          background: cardBg, border: cardBorder, position: 'relative', overflow: 'hidden',
          animation: 'ctx-rise .5s ease both',
        }}>
          <StarField count={18} seed={51} opacity={dark ? 0.5 : 0.18} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
            <ElementOrb element={me.element} size={88} animated />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: accent, letterSpacing: 1.4, fontWeight: 600, textTransform: 'uppercase' }}>
                {lang === 'ko' ? '본인' : 'Self'}
              </div>
              <div style={{ fontSize: 26, fontWeight: 600, color: fg, letterSpacing: -0.6, marginTop: 2 }}>
                {lang === 'ko' ? me.name_ko : me.name_en}
              </div>
              <div style={{ fontSize: 13, color: sub, marginTop: 4 }}>
                {formatDate(parseBirth(me.birth)!, lang)} · {me.time}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 8, marginTop: 18, position: 'relative' }}>
            <Stat label={lang === 'ko' ? '주된 기운' : 'Element'} value={lang === 'ko' ? e.label_ko : e.label_en} dark={dark} fg={fg} sub={sub} />
            <Stat label={lang === 'ko' ? '우주' : 'Universes'} value={universes.length} dark={dark} fg={fg} sub={sub} />
            <Stat label={lang === 'ko' ? '사람' : 'People'} value={totalPeople} dark={dark} fg={fg} sub={sub} />
          </div>
        </div>

        <div style={{
          margin: '14px 16px 0', borderRadius: 24, padding: '18px 16px',
          background: cardBg, border: cardBorder,
          animation: 'ctx-rise .5s ease both .05s',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: fg, letterSpacing: -0.2 }}>
              {lang === 'ko' ? '사주 · 네 기둥' : 'Saju · Four Pillars'}
            </div>
            <div style={{ fontSize: 11, color: sub }}>
              {lang === 'ko' ? '나를 이루는 결' : 'Your grain'}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {pillars.map((p, i) => {
              const el = ELEMENTS[p.el];
              return (
                <div key={i} style={{
                  padding: '12px 8px', borderRadius: 14,
                  background: `${el.c3}18`, border: `0.5px solid ${el.c3}33`, textAlign: 'center',
                  animation: `ctx-rise .5s ease both ${0.1 + i * 0.04}s`,
                }}>
                  <div style={{ fontSize: 10, color: sub, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                    {p.label}
                  </div>
                  <div style={{
                    margin: '8px auto 6px', width: 28, height: 28, borderRadius: 14,
                    background: `radial-gradient(circle at 35% 30%, ${el.c1}, ${el.c2} 65%, ${el.c3})`,
                    boxShadow: `0 2px 8px ${el.c3}55`,
                  }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: fg, letterSpacing: -0.2 }}>{p.sky}</div>
                  <div style={{ fontSize: 11, color: sub, marginTop: 2 }}>{p.earth}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{
          margin: '14px 16px 0', borderRadius: 24, padding: '18px 16px',
          background: cardBg, border: cardBorder,
          animation: 'ctx-rise .5s ease both .1s',
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: fg, letterSpacing: -0.2, marginBottom: 14 }}>
            {lang === 'ko' ? '오행 분포' : 'Element balance'}
          </div>
          <div style={{ display: 'flex', height: 16, borderRadius: 8, overflow: 'hidden',
                        background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(26,21,56,0.05)' }}>
            {balance.map((b, i) => {
              const el = ELEMENTS[b.el];
              return (
                <div key={b.el} style={{
                  width: `${b.val}%`, height: '100%',
                  background: `linear-gradient(135deg, ${el.c1}, ${el.c3})`,
                  animation: `ctx-fade .8s ease both ${i * 0.06}s`,
                }} />
              );
            })}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {balance.map(b => {
              const el = ELEMENTS[b.el];
              return (
                <div key={b.el} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 5,
                    background: `linear-gradient(135deg, ${el.c1}, ${el.c3})` }} />
                  <span style={{ fontSize: 11, color: sub }}>
                    {lang === 'ko' ? el.label_ko.replace(' 기운', '') : el.label_en}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: fg,
                                 fontVariantNumeric: 'tabular-nums' }}>{b.val}%</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{
          margin: '14px 16px 0', borderRadius: 24, padding: '6px',
          background: cardBg, border: cardBorder,
          animation: 'ctx-rise .5s ease both .15s',
        }}>
          <SettingsToggle label={lang === 'ko' ? '다크 모드' : 'Dark mode'}
                          value={tweaks.darkMode}
                          onChange={v => setTweak('darkMode', v)}
                          dark={dark} accent={accent} />
          <SettingsDivider dark={dark} />
          <SettingsRow label={lang === 'ko' ? '언어' : 'Language'}
                       value={LANGS.find(l => l.code === lang)?.label} dark={dark} />
          <SettingsDivider dark={dark} />
          <SettingsRow label={lang === 'ko' ? '시각화 스타일' : 'Visualization'}
                       value={tweaks.vizStyle} dark={dark} />
        </div>

        <div style={{
          margin: '24px 16px 0', textAlign: 'center', fontSize: 11, color: sub,
          letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 600,
        }}>
          contextella · v0.1
        </div>
      </div>
      <BottomTabBar activeTab="me" />
    </div>
  );
}

function Stat({ label, value, dark, fg, sub }: { label: string; value: string | number; dark: boolean; fg: string; sub: string }) {
  return (
    <div style={{
      padding: '12px 14px', borderRadius: 14,
      background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.55)',
    }}>
      <div style={{ fontSize: 10, color: sub, letterSpacing: 1, fontWeight: 600, textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontSize: typeof value === 'string' ? 15 : 18, fontWeight: 600, color: fg, marginTop: 4,
                    fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
    </div>
  );
}

function SettingsRow({ label, value, dark }: { label: string; value?: string; dark: boolean }) {
  const fg = dark ? '#fff' : '#1A1538';
  const sub = dark ? 'rgba(255,255,255,0.55)' : 'rgba(26,21,56,0.55)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 12px', minHeight: 52, fontFamily: SANS }}>
      <span style={{ flex: 1, fontSize: 14.5, fontWeight: 500, color: fg, letterSpacing: -0.2 }}>{label}</span>
      {value && <span style={{ fontSize: 13, color: sub }}>{value}</span>}
    </div>
  );
}

function SettingsToggle({ label, value, onChange, dark, accent }: { label: string; value: boolean; onChange: (v: boolean) => void; dark: boolean; accent: string }) {
  const fg = dark ? '#fff' : '#1A1538';
  return (
    <button onClick={() => onChange(!value)} style={{
      display: 'flex', alignItems: 'center', gap: 12, width: '100%',
      padding: '14px 12px', minHeight: 52, border: 'none', background: 'transparent',
      cursor: 'pointer', fontFamily: SANS, textAlign: 'left',
    }}>
      <span style={{ flex: 1, fontSize: 14.5, fontWeight: 500, color: fg, letterSpacing: -0.2 }}>{label}</span>
      <div style={{
        width: 42, height: 24, borderRadius: 12, position: 'relative',
        background: value ? accent : (dark ? 'rgba(255,255,255,0.15)' : 'rgba(26,21,56,0.15)'),
        transition: 'background .2s',
      }}>
        <div style={{
          position: 'absolute', top: 2, left: value ? 20 : 2,
          width: 20, height: 20, borderRadius: 10, background: '#fff',
          transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }} />
      </div>
    </button>
  );
}

function SettingsDivider({ dark }: { dark: boolean }) {
  return <div style={{
    height: 0.5, margin: '0 14px',
    background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(26,21,56,0.06)',
  }} />;
}
