'use client';
import React, { useMemo } from 'react';
import { ELEMENTS, SANS, shade } from '@/lib/tokens';
import { buildDayReport, dayHeadline, flowTone } from '@/lib/saju';
import type { Lang, PersonWithFlow } from '@/lib/types';
import { ElementOrb, StarField } from './primitives';
import { useStore, accentHex } from '@/lib/store';
import { pick } from '@/lib/i18n';

const TONE_LABEL: Record<'bright' | 'steady' | 'soft' | 'careful', Record<Lang, string>> = {
  bright: { ko: '맑음', en: 'bright', ja: '晴れ', zh: '晴朗', es: 'claro' },
  steady: { ko: '평온', en: 'steady', ja: '穏やか', zh: '平稳', es: 'estable' },
  soft: { ko: '잔잔', en: 'soft', ja: '静か', zh: '平静', es: 'suave' },
  careful: { ko: '주의', en: 'careful', ja: '注意', zh: '留心', es: 'cautela' },
};

export function TodaysFlowCard({ onPersonClick }: { onPersonClick?: (id: string) => void }) {
  const lang = useStore(s => s.lang);
  const dark = useStore(s => s.tweaks.darkMode);
  const universes = useStore(s => s.universes);
  const accent = accentHex(useStore(s => s.tweaks.accent));

  const today = new Date().toDateString();
  const report = useMemo(() => buildDayReport(universes), [universes, today]);
  const headline = dayHeadline(report, lang);
  const fg = dark ? '#fff' : '#1A1538';
  const sub = dark ? 'rgba(255,255,255,0.6)' : 'rgba(26,21,56,0.6)';
  const dimBg = dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.5)';

  return (
    <div style={{
      margin: '8px 16px 0', borderRadius: 28, padding: '22px 20px 20px',
      background: dark
        ? 'linear-gradient(155deg, rgba(120,90,200,0.20), rgba(60,40,140,0.06))'
        : 'linear-gradient(155deg, rgba(255,255,255,0.92), rgba(240,233,255,0.7))',
      border: `0.5px solid ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.7)'}`,
      backdropFilter: 'blur(24px)',
      position: 'relative', overflow: 'hidden',
      animation: 'ctx-rise .55s cubic-bezier(.22,.7,.3,1) both',
      fontFamily: SANS,
    }}>
      <StarField count={18} seed={11} opacity={dark ? 0.55 : 0.18} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    position: 'relative', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
                        color: accent, marginBottom: 6, fontWeight: 600 }}>
            {headline.eyebrow}
          </div>
          <div style={{ fontSize: 21, fontWeight: 600, color: fg, letterSpacing: -0.5,
                        lineHeight: 1.25 }}>
            {headline.title}
          </div>
          <div style={{ fontSize: 13.5, color: sub, marginTop: 8, lineHeight: 1.5,
                        letterSpacing: -0.2 }}>
            {headline.body}
          </div>
        </div>
        <ElementOrb element={report.dayElement} size={64} animated />
      </div>

      <div style={{
        marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
        position: 'relative',
      }}>
        {[
          { label: pick(lang, { ko: '평균 결', en: 'Avg flow', ja: '平均の流れ', zh: '平均流动', es: 'Flujo medio' }), value: report.avg, color: flowTone(report.avg).color },
          { label: pick(lang, { ko: '잘 맞아요', en: 'In flow', ja: 'よく合う', zh: '契合', es: 'En sintonía' }), value: report.bright.length, color: '#7BD89A' },
          { label: pick(lang, { ko: '조심해요', en: 'Tread soft', ja: '慎重に', zh: '需留心', es: 'Con cuidado' }), value: report.careful.length, color: '#E8A4B5' },
        ].map((s, i) => (
          <div key={i} style={{
            background: dimBg,
            borderRadius: 14, padding: '10px 12px',
            border: `0.5px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(26,21,56,0.06)'}`,
          }}>
            <div style={{ fontSize: 10, color: sub, letterSpacing: 0.5, textTransform: 'uppercase',
                          fontWeight: 600, wordBreak: 'keep-all', whiteSpace: 'nowrap' }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: s.color, letterSpacing: -0.5,
                          fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {report.bright.length > 0 && (
        <div style={{ marginTop: 16, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: '#7BD89A' }} />
            <span style={{ fontSize: 11, color: sub, fontWeight: 600, letterSpacing: 1,
                           textTransform: 'uppercase', wordBreak: 'keep-all', whiteSpace: 'nowrap' }}>
              {pick(lang, {
                ko: '오늘 잘 맞는 결', en: 'Today’s bright currents',
                ja: '今日よく合う機微', zh: '今天契合的纹理',
                es: 'Corrientes luminosas de hoy',
              })}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {report.bright.map(p => (
              <FlowRow key={p.id} person={p} lang={lang} dark={dark} onClick={() => onPersonClick?.(p.id)} />
            ))}
          </div>
        </div>
      )}

      {report.careful.length > 0 && (
        <div style={{ marginTop: 14, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: '#E8A4B5' }} />
            <span style={{ fontSize: 11, color: sub, fontWeight: 600, letterSpacing: 1,
                           textTransform: 'uppercase' }}>
              {pick(lang, {
                ko: '한 발 거리를 둘 결', en: 'Step softly',
                ja: '一歩の距離を置く機微', zh: '宜留一步距离的纹理',
                es: 'Pisar con suavidad',
              })}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {report.careful.map(p => (
              <FlowRow key={p.id} person={p} lang={lang} dark={dark} onClick={() => onPersonClick?.(p.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function FlowRow({ person, lang, dark, onClick }: { person: PersonWithFlow; lang: Lang; dark: boolean; onClick?: () => void }) {
  const fg = dark ? '#fff' : '#1A1538';
  const sub = dark ? 'rgba(255,255,255,0.55)' : 'rgba(26,21,56,0.55)';
  const tone = flowTone(person.flow);
  const e = ELEMENTS[person.element];

  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 12px', minHeight: 56, width: '100%',
      borderRadius: 14, cursor: 'pointer', textAlign: 'left',
      background: tone.bg,
      border: `0.5px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(26,21,56,0.05)'}`,
      fontFamily: SANS,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 18,
        background: `radial-gradient(circle at 35% 30%, ${e.c1}, ${e.c2} 65%, ${e.c3})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 600,
        fontSize: person.emoji ? 18 : 14,
        boxShadow: `0 2px 8px ${e.c3}55`, flexShrink: 0,
      }}>
        {person.emoji || person.initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14.5, fontWeight: 600, color: fg, letterSpacing: -0.3,
                         wordBreak: 'keep-all', whiteSpace: 'nowrap' }}>
            {person.name_ko}
          </span>
          <span style={{ fontSize: 11, color: sub, wordBreak: 'keep-all', whiteSpace: 'nowrap' }}>
            · {person.universeName_ko}
          </span>
        </div>
        <div style={{
          marginTop: 6, height: 4, borderRadius: 2,
          background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(26,21,56,0.08)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: `${person.flow}%`,
            background: `linear-gradient(90deg, ${tone.color}, ${shade(tone.color, -10)})`,
            borderRadius: 2,
            animation: 'ctx-fade .8s ease both',
          }} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
        <span style={{ fontSize: 17, fontWeight: 600, color: tone.color,
                       fontVariantNumeric: 'tabular-nums', letterSpacing: -0.4, lineHeight: 1 }}>
          {person.flow}
        </span>
        <span style={{ fontSize: 9.5, color: sub, marginTop: 3, letterSpacing: 0.5,
                       textTransform: 'uppercase', fontWeight: 600 }}>
          {TONE_LABEL[tone.tone][lang]}
        </span>
      </div>
    </button>
  );
}
