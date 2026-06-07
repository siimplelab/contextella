'use client';
import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { SANS, cosmicBg, formatDate, accentInk } from '@/lib/tokens';
import { useStore, accentHex } from '@/lib/store';
import { buildDayReport, dayHeadline, dailyAdvice, peakHourOf, dayPillarOf } from '@/lib/saju';
import { ElementOrb, StarField } from '@/components/primitives';
import { ScreenHeader, BottomTabBar } from '@/components/chrome';
import { FlowRow } from '@/components/today-flow';
import { pick } from '@/lib/i18n';
import type { Lang } from '@/lib/types';

const WEEKDAYS: Record<Lang, string[]> = {
  ko: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  ja: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
  zh: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  es: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
};

export default function TodayScreen() {
  const router = useRouter();
  const lang = useStore(s => s.lang);
  const dark = useStore(s => s.tweaks.darkMode);
  const accent = accentHex(useStore(s => s.tweaks.accent));
  const ink = accentInk(accent, dark);
  const universes = useStore(s => s.universes);

  const today = new Date();
  const todayStr = today.toDateString();
  const report = useMemo(() => buildDayReport(universes), [universes, todayStr]);
  const headline = dayHeadline(report, lang);
  const fg = dark ? '#fff' : '#1A1538';
  const sub = dark ? 'rgba(255,255,255,0.6)' : 'rgba(26,21,56,0.6)';
  const weekday = WEEKDAYS[lang][today.getDay()];

  const todayDate = today.getDate();
  const hours = useMemo(() => {
    const arr: { h: number; e: number }[] = [];
    const peakHour = peakHourOf(dayPillarOf());
    for (let h = 0; h < 24; h += 2) {
      const dist = Math.min(Math.abs(h - peakHour), 24 - Math.abs(h - peakHour));
      const base = 60 + Math.cos((dist / 12) * Math.PI) * 30;
      const wobble = ((h * 7 + todayDate) % 9) - 4;
      arr.push({ h, e: Math.max(20, Math.min(98, Math.round(base + wobble))) });
    }
    return arr;
  }, [report.dayElement, todayDate]);

  const peakIdx = hours.reduce((mi, p, i) => p.e > hours[mi].e ? i : mi, 0);
  const lowIdx = hours.reduce((mi, p, i) => p.e < hours[mi].e ? i : mi, 0);

  const cardBg = dark
    ? 'linear-gradient(155deg, rgba(120,90,200,0.16), rgba(60,40,140,0.05))'
    : 'linear-gradient(155deg, rgba(255,255,255,0.85), rgba(240,233,255,0.6))';
  const cardBorder = `0.5px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)'}`;

  const advice = useMemo(() => dailyAdvice(report.dayElement, lang), [report.dayElement, lang]);

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      background: cosmicBg(dark), color: fg, overflow: 'hidden', fontFamily: SANS,
    }}>
      <StarField count={dark ? 70 : 22} seed={3} opacity={dark ? 0.55 : 0.14} />
      <div style={{ position: 'relative', height: '100%', overflow: 'auto', paddingBottom: 130 }}>
        <div style={{ height: 20 }} />
        <ScreenHeader title={pick(lang, { ko: '오늘', en: 'Today', ja: '今日', zh: '今天', es: 'Hoy' })}
                      sub={`${formatDate(today, lang)} · ${weekday}`} />

        <div style={{
          margin: '12px 16px 0', borderRadius: 28, padding: '22px 20px',
          background: cardBg, border: cardBorder,
          backdropFilter: 'blur(24px)', position: 'relative', overflow: 'hidden',
          animation: 'ctx-rise .5s ease both',
        }}>
          <StarField count={20} seed={31} opacity={dark ? 0.5 : 0.18} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, position: 'relative' }}>
            <ElementOrb element={report.dayElement} size={84} animated />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, letterSpacing: 1.4, color: ink,
                            textTransform: 'uppercase', fontWeight: 600 }}>
                {headline.eyebrow}
              </div>
              <div style={{ fontSize: 22, fontWeight: 600, color: fg, letterSpacing: -0.5,
                            lineHeight: 1.25, marginTop: 6 }}>
                {headline.title}
              </div>
              <div style={{ fontSize: 13.5, color: sub, lineHeight: 1.5, letterSpacing: -0.2, marginTop: 8 }}>
                {headline.body}
              </div>
            </div>
          </div>
        </div>

        <div style={{
          margin: '14px 16px 0', borderRadius: 24, padding: '18px 16px 14px',
          background: cardBg, border: cardBorder,
          animation: 'ctx-rise .5s ease both .05s',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: fg }}>
              {pick(lang, { ko: '시간별 흐름', en: 'Hour by hour', ja: '時間ごとの流れ', zh: '逐时流动', es: 'Hora por hora' })}
            </div>
            <div style={{ fontSize: 11, color: sub }}>
              {pick(lang, { ko: '결의 높낮이', en: 'Energy curve', ja: '気の高低', zh: '气的起伏', es: 'Curva de energía' })}
            </div>
          </div>
          <HourCurve hours={hours} peakIdx={peakIdx} lowIdx={lowIdx} accent={accent} dark={dark} lang={lang} />
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <PeakBadge type="peak" hour={hours[peakIdx].h} energy={hours[peakIdx].e} dark={dark} lang={lang} />
            <PeakBadge type="low" hour={hours[lowIdx].h} energy={hours[lowIdx].e} dark={dark} lang={lang} />
          </div>
        </div>

        {report.bright.length > 0 && (
          <div style={{
            margin: '14px 16px 0', borderRadius: 24, padding: '18px 16px',
            background: cardBg, border: cardBorder,
            animation: 'ctx-rise .5s ease both .1s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: '#7BD89A' }} />
              <span style={{ fontSize: 11, color: sub, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
                {pick(lang, {
                  ko: '오늘 잘 맞는 결', en: 'Today’s bright currents',
                  ja: '今日よく合う機微', zh: '今天契合的纹理',
                  es: 'Corrientes luminosas de hoy',
                })}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {report.bright.map(p => (
                <FlowRow key={p.id} person={p} lang={lang} dark={dark} onClick={() => router.push(`/result/${p.id}`)} />
              ))}
            </div>
          </div>
        )}

        {report.careful.length > 0 && (
          <div style={{
            margin: '14px 16px 0', borderRadius: 24, padding: '18px 16px',
            background: cardBg, border: cardBorder,
            animation: 'ctx-rise .5s ease both .15s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: '#E8A4B5' }} />
              <span style={{ fontSize: 11, color: sub, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
                {pick(lang, {
                  ko: '한 발 거리를 둘 결', en: 'Step softly',
                  ja: '一歩の距離を置く機微', zh: '宜留一步距离的纹理',
                  es: 'Pisar con suavidad',
                })}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {report.careful.map(p => (
                <FlowRow key={p.id} person={p} lang={lang} dark={dark} onClick={() => router.push(`/result/${p.id}`)} />
              ))}
            </div>
          </div>
        )}

        <div style={{
          margin: '14px 16px 0', borderRadius: 24, padding: '20px',
          background: dark
            ? `linear-gradient(135deg, rgba(120,90,200,0.28), rgba(60,40,140,0.10))`
            : `linear-gradient(135deg, ${accent}22, rgba(255,255,255,0.6))`,
          border: cardBorder,
          animation: 'ctx-rise .5s ease both .2s',
        }}>
          <div style={{ fontSize: 11, color: ink, letterSpacing: 1.4, fontWeight: 600, textTransform: 'uppercase' }}>
            {pick(lang, {
              ko: '오늘의 결을 다듬는 법', en: 'Tune today’s grain',
              ja: '今日の機微を整える', zh: '调理今日的纹理',
              es: 'Afina la textura de hoy',
            })}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
            {advice.map((a, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, alignItems: 'flex-start', paddingTop: i > 0 ? 10 : 0,
                borderTop: i > 0 ? `0.5px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(26,21,56,0.06)'}` : 'none',
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 11, flexShrink: 0,
                  background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)',
                  color: ink, fontSize: 11, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontVariantNumeric: 'tabular-nums',
                }}>{i + 1}</span>
                <span style={{ fontSize: 14, color: fg, lineHeight: 1.5, letterSpacing: -0.2 }}>{a}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <BottomTabBar activeTab="today" />
    </div>
  );
}

function HourCurve({ hours, peakIdx, lowIdx, accent, dark, lang }:
  { hours: { h: number; e: number }[]; peakIdx: number; lowIdx: number; accent: string; dark: boolean; lang: Lang }) {
  const W = 330, H = 110, PAD = 10;
  const max = 100, min = 10;
  const pts = hours.map((p, i) => {
    const x = PAD + (i / (hours.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((p.e - min) / (max - min)) * (H - PAD * 2);
    return { x, y, ...p };
  });
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaD = `${pathD} L${pts[pts.length-1].x},${H - PAD} L${pts[0].x},${H - PAD} Z`;
  return (
    <div style={{ marginTop: 10, width: '100%', overflowX: 'auto' }}>
      <svg width={W} height={H + 24} viewBox={`0 0 ${W} ${H + 24}`} style={{ display: 'block', width: '100%' }}>
        <defs>
          <linearGradient id="hc-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={accent} stopOpacity="0.45" />
            <stop offset="1" stopColor={accent} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[25, 50, 75].map(v => {
          const y = H - PAD - ((v - min) / (max - min)) * (H - PAD * 2);
          return <line key={v} x1={PAD} x2={W - PAD} y1={y} y2={y}
                       stroke={dark ? 'rgba(255,255,255,0.05)' : 'rgba(26,21,56,0.06)'}
                       strokeDasharray="2 4" />;
        })}
        <path d={areaD} fill="url(#hc-fill)" />
        <path d={pathD} fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => {
          const isPeak = i === peakIdx, isLow = i === lowIdx;
          return (
            <g key={i}>
              {(isPeak || isLow) && (
                <circle cx={p.x} cy={p.y} r="6" fill={isPeak ? '#7BD89A' : '#E8A4B5'} opacity="0.25" />
              )}
              <circle cx={p.x} cy={p.y} r={isPeak || isLow ? 3.2 : 1.5}
                      fill={isPeak ? '#7BD89A' : isLow ? '#E8A4B5' : accent} />
            </g>
          );
        })}
        {[0, 6, 12, 18].map(h => {
          const x = PAD + (h / 22) * (W - PAD * 2);
          return (
            <text key={h} x={x} y={H + 14} fill={dark ? 'rgba(255,255,255,0.45)' : 'rgba(26,21,56,0.5)'}
                  fontSize="10" textAnchor="middle" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {String(h).padStart(2, '0')}{pick(lang, { ko: '시', en: ':00', ja: '時', zh: '时', es: ':00' })}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function PeakBadge({ type, hour, energy, dark, lang }:
  { type: 'peak' | 'low'; hour: number; energy: number; dark: boolean; lang: Lang }) {
  const c = type === 'peak' ? '#7BD89A' : '#E8A4B5';
  const label = type === 'peak'
    ? pick(lang, { ko: '가장 맑은 시간', en: 'Brightest hour', ja: '最も澄んだ時間', zh: '最清朗的时辰', es: 'La hora más luminosa' })
    : pick(lang, { ko: '잠시 쉬어가는 시간', en: 'Softest hour', ja: 'ひと休みの時間', zh: '稍作休息的时辰', es: 'La hora más suave' });
  return (
    <div style={{
      flex: 1, padding: '10px 12px', borderRadius: 12,
      background: `${c}1f`, border: `0.5px solid ${c}33`, fontFamily: SANS,
    }}>
      <div style={{ fontSize: 10, color: c, letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2,
                    color: dark ? '#fff' : '#1A1538',
                    fontVariantNumeric: 'tabular-nums', letterSpacing: -0.3 }}>
        {String(hour).padStart(2, '0')}:00 · {energy}
      </div>
    </div>
  );
}
