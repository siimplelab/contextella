'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ELEMENTS, SANS, cosmicBg, formatDate, pillBtn } from '@/lib/tokens';
import { I18N } from '@/lib/i18n';
import { useStore, accentHex } from '@/lib/store';
import { CompatGauge, CompatStars, CompatMerge, StarField, ElementOrb } from '@/components/primitives';

export default function ResultScreen({ personId }: { personId: string }) {
  const router = useRouter();
  const lang = useStore(s => s.lang);
  const dark = useStore(s => s.tweaks.darkMode);
  const accent = accentHex(useStore(s => s.tweaks.accent));
  const gaugeStyle = useStore(s => s.tweaks.gaugeStyle);
  const me = useStore(s => s.me);
  const findPerson = useStore(s => s.findPerson);
  const t = I18N[lang];
  const person = findPerson(personId);

  if (!person) {
    return (
      <div style={{ padding: 40, color: '#fff', fontFamily: SANS, background: cosmicBg(dark), height: '100%' }}>
        Person not found.
        <button onClick={() => router.back()} style={{ marginLeft: 12, color: accent, background: 'transparent', border: 'none', cursor: 'pointer' }}>back</button>
      </div>
    );
  }

  const eMe = ELEMENTS[me.element];
  const eOther = ELEMENTS[person.element];
  const score = person.score ?? 75;
  const fg = dark ? '#fff' : '#1A1538';
  const sub = dark ? 'rgba(255,255,255,0.6)' : 'rgba(26,21,56,0.6)';
  const cardBg = dark
    ? 'linear-gradient(155deg, rgba(120,90,200,0.14), rgba(60,40,140,0.05))'
    : 'linear-gradient(155deg, rgba(255,255,255,0.85), rgba(240,233,255,0.6))';
  const cardBorder = dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)';

  const synergies = lang === 'ko' ? [
    '깊은 직관과 따뜻한 추진력의 결합',
    '서로의 침묵을 편안하게 해주는 결',
    '함께 있을 때 새로운 길이 보입니다',
  ] : [
    'Deep intuition meets warm momentum',
    'Both find ease in each other’s silence',
    'New paths reveal themselves together',
  ];
  const conflicts = lang === 'ko' ? [
    '결정의 속도가 서로 다를 수 있어요',
    '감정이 가라앉을 때 함께 가라앉지 마세요',
  ] : [
    'You may move at different speeds',
    'When one sinks, the other must stay afloat',
  ];

  const stagger = (i: number): React.CSSProperties => ({ animation: `ctx-rise .5s cubic-bezier(.22,.7,.3,1) both ${0.05 + i * 0.07}s` });

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      background: cosmicBg(dark), color: fg, overflow: 'hidden', fontFamily: SANS,
    }}>
      <StarField count={dark ? 80 : 25} seed={9} opacity={dark ? 0.7 : 0.15} />
      <div style={{ position: 'relative', height: '100%', overflow: 'auto', paddingBottom: 60 }}>
        <div style={{ height: 54 }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 20px', height: 44 }}>
          <button onClick={() => router.push('/')} style={{ ...pillBtn(dark), gap: 6, paddingRight: 16, color: fg }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{lang === 'ko' ? '우주' : 'Universe'}</span>
          </button>
          <div style={{ fontSize: 13, color: sub, letterSpacing: 0.5, fontWeight: 500 }}>{t.resultTitle}</div>
          <div style={{ width: 44 }} />
        </div>

        <div style={{ padding: '12px 20px 0', ...stagger(0) }}>
          <div style={{ fontSize: 12, color: accent, letterSpacing: 0.3, fontWeight: 600 }}>
            {lang === 'ko' ? `나 · ${person.name_ko}` : `You · ${person.name_en}`}
          </div>
          <div style={{ fontSize: 28, fontWeight: 600, color: fg, letterSpacing: -0.7,
                        marginTop: 6, lineHeight: 1.2, whiteSpace: 'pre-line' }}>
            {lang === 'ko'
              ? `${eMe.label_ko}과\n${eOther.label_ko}의 만남`
              : `Where ${eMe.label_en.toLowerCase()}\nmeets ${eOther.label_en.toLowerCase()}`}
          </div>
          <div style={{ fontSize: 14, color: sub, marginTop: 10, lineHeight: 1.5, letterSpacing: -0.2 }}>
            {t.poeticLead}
          </div>
        </div>

        <div style={{
          margin: '20px 16px 12px', borderRadius: 28, padding: '24px 20px',
          background: cardBg, border: `0.5px solid ${cardBorder}`,
          backdropFilter: 'blur(24px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative',
          ...stagger(1),
        }}>
          <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
                        color: accent, fontWeight: 600, marginBottom: 14 }}>{t.compatScore}</div>
          {gaugeStyle === 'gauge' && (
            <CompatGauge score={score} accent={accent} label={t.compatLabel(score)} size={200} />
          )}
          {gaugeStyle === 'stars' && (
            <CompatStars score={score} accent={accent} label={t.compatLabel(score)} size={200} />
          )}
          {gaugeStyle === 'merge' && (
            <CompatMerge score={score} accent={accent} label={t.compatLabel(score)} size={200}
                         elementA={me.element} elementB={person.element} />
          )}
        </div>

        <div style={{ margin: '0 16px', display: 'grid', gap: 10, gridTemplateColumns: '1fr 1fr' }}>
          <div style={{
            gridColumn: '1 / -1', borderRadius: 24, padding: '20px',
            background: cardBg, border: `0.5px solid ${cardBorder}`, ...stagger(2),
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{
                width: 28, height: 28, borderRadius: 14,
                background: `${accent}33`, color: accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
              }}>✦</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: fg, letterSpacing: -0.3 }}>
                {t.synergies}
              </span>
            </div>
            {synergies.map((s, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, padding: '8px 0', alignItems: 'flex-start',
                borderTop: i > 0 ? `0.5px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(26,21,56,0.06)'}` : 'none',
              }}>
                <span style={{ fontSize: 13, color: accent, fontVariantNumeric: 'tabular-nums', minWidth: 18, paddingTop: 2 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{ fontSize: 14, color: fg, lineHeight: 1.5, letterSpacing: -0.2 }}>{s}</span>
              </div>
            ))}
          </div>

          <div style={{
            gridColumn: '1 / -1', borderRadius: 24, padding: '20px',
            background: cardBg, border: `0.5px solid ${cardBorder}`, ...stagger(3),
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{
                width: 28, height: 28, borderRadius: 14,
                background: 'rgba(232,164,181,0.2)', color: '#E8A4B5',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              }}>◐</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: fg, letterSpacing: -0.3 }}>
                {t.conflicts}
              </span>
            </div>
            {conflicts.map((s, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, padding: '8px 0', alignItems: 'flex-start',
                borderTop: i > 0 ? `0.5px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(26,21,56,0.06)'}` : 'none',
              }}>
                <span style={{ fontSize: 13, color: '#E8A4B5', fontVariantNumeric: 'tabular-nums', minWidth: 18, paddingTop: 2 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{ fontSize: 14, color: fg, lineHeight: 1.5, letterSpacing: -0.2 }}>{s}</span>
              </div>
            ))}
          </div>

          <div style={{
            borderRadius: 24, padding: '18px',
            background: cardBg, border: `0.5px solid ${cardBorder}`, ...stagger(4),
          }}>
            <div style={{ fontSize: 11, color: sub, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>
              {t.todaysJoint}
            </div>
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="38" height="38" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="9" fill={accent} opacity="0.85">
                  <animate attributeName="r" values="9;9.6;9" dur="3s" repeatCount="indefinite" />
                </circle>
                {[0,45,90,135,180,225,270,315].map((a, i) => (
                  <line key={i} x1="20" y1="20"
                        x2={20 + Math.cos(a * Math.PI / 180) * 16}
                        y2={20 + Math.sin(a * Math.PI / 180) * 16}
                        stroke={accent} strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" />
                ))}
              </svg>
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, color: fg, letterSpacing: -0.4 }}>
                  {t.weatherSunny}
                </div>
                <div style={{ fontSize: 12, color: sub, marginTop: 2 }}>
                  {lang === 'ko' ? '대화가 잘 풀려요' : 'Words flow easily'}
                </div>
              </div>
            </div>
          </div>

          <div style={{
            borderRadius: 24, padding: '18px',
            background: cardBg, border: `0.5px solid ${cardBorder}`, ...stagger(5),
          }}>
            <div style={{ fontSize: 11, color: sub, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>
              {lang === 'ko' ? '두 기운' : 'Two energies'}
            </div>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
              <ElementOrb element={me.element} size={36} animated />
              <span style={{ color: sub, fontSize: 16, margin: '0 4px' }}>+</span>
              <ElementOrb element={person.element} size={36} animated />
            </div>
            <div style={{ fontSize: 13, color: fg, marginTop: 10, letterSpacing: -0.2, lineHeight: 1.4 }}>
              {lang === 'ko'
                ? `${eMe.label_ko.replace(' 기운', '')} · ${eOther.label_ko.replace(' 기운', '')}`
                : `${eMe.label_en} · ${eOther.label_en}`}
            </div>
          </div>

          <div style={{
            gridColumn: '1 / -1', borderRadius: 24, padding: '24px 22px',
            background: dark
              ? `linear-gradient(135deg, rgba(120,90,200,0.30), rgba(60,40,140,0.10))`
              : `linear-gradient(135deg, ${accent}33, rgba(255,255,255,0.6))`,
            border: `0.5px solid ${cardBorder}`,
            position: 'relative', overflow: 'hidden', ...stagger(6),
          }}>
            <div style={{ fontSize: 17, color: fg, lineHeight: 1.55, letterSpacing: -0.2, fontWeight: 500 }}>
              {lang === 'ko'
                ? '같은 하늘 아래, 서로 다른 시간을 흐르는 두 강. 오늘 잠시 같은 풍경을 비춥니다.'
                : 'Two rivers beneath the same sky, flowing through different hours — today, briefly mirroring the same view.'}
            </div>
            <div style={{ marginTop: 14, fontSize: 11, color: sub, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 600 }}>
              contextella · {formatDate(new Date(), lang)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
