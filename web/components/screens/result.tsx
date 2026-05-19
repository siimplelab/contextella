'use client';
import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ELEMENTS, SANS, cosmicBg, formatDate, pillBtn } from '@/lib/tokens';
import { I18N, pick } from '@/lib/i18n';
import { useStore, accentHex } from '@/lib/store';
import { sajuFromBirth, compatibility, synergyConflict } from '@/lib/saju';
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

  // Compatibility is computed locally from the Saju engine — no network needed.
  const compat = useMemo(() => {
    if (!me || !person) return null;
    const a = sajuFromBirth(me.birth, me.time);
    const b = sajuFromBirth(person.birth, person.time);
    if (!a || !b) return null;
    const { score, factors } = compatibility(a.pillars, b.pillars);
    const { synergies, conflicts } = synergyConflict(factors, lang);
    return { score, synergies, conflicts };
  }, [me, person, lang]);

  const fg = dark ? '#fff' : '#1A1538';
  const sub = dark ? 'rgba(255,255,255,0.6)' : 'rgba(26,21,56,0.6)';

  if (!person || !me) {
    return (
      <div style={{
        width: '100%', height: '100%', background: cosmicBg(dark), color: fg,
        fontFamily: SANS, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
      }}>
        <div style={{ fontSize: 14, color: sub }}>
          {pick(lang, {
            ko: '이 사람을 찾을 수 없어요', en: 'This person could not be found',
            ja: 'この人が見つかりません', zh: '找不到这个人',
            es: 'No se encontró a esta persona',
          })}
        </div>
        <button onClick={() => router.push('/')} style={{
          ...pillBtn(dark), padding: '0 18px', color: accent,
        }}>{pick(lang, { ko: '우주로', en: 'Universe', ja: '宇宙へ', zh: '前往宇宙', es: 'Al universo' })}</button>
      </div>
    );
  }

  const eMe = ELEMENTS[me.element];
  const eOther = ELEMENTS[person.element];
  const score = compat?.score ?? 50;
  const meetingTitle = pick(lang, {
    ko: `${eMe.label.ko}과\n${eOther.label.ko}의 만남`,
    en: `Where ${eMe.short.en.toLowerCase()}\nmeets ${eOther.short.en.toLowerCase()}`,
    ja: `${eMe.short.ja}と${eOther.short.ja}の出会い`,
    zh: `${eMe.short.zh}与${eOther.short.zh}的相遇`,
    es: `Donde ${eMe.short.es.toLowerCase()}\nse encuentra con ${eOther.short.es.toLowerCase()}`,
  });
  const cardBg = dark
    ? 'linear-gradient(155deg, rgba(120,90,200,0.14), rgba(60,40,140,0.05))'
    : 'linear-gradient(155deg, rgba(255,255,255,0.85), rgba(240,233,255,0.6))';
  const cardBorder = dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)';

  const synergies = compat?.synergies ?? [];
  const conflicts = compat?.conflicts ?? [];

  const stagger = (i: number): React.CSSProperties => ({ animation: `ctx-rise .5s cubic-bezier(.22,.7,.3,1) both ${0.05 + i * 0.07}s` });

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      background: cosmicBg(dark), color: fg, overflow: 'hidden', fontFamily: SANS,
    }}>
      <StarField count={dark ? 80 : 25} seed={9} opacity={dark ? 0.7 : 0.15} />
      <div style={{ position: 'relative', height: '100%', overflow: 'auto', paddingBottom: 60 }}>
        <div style={{ height: 20 }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 20px', height: 44 }}>
          <button onClick={() => router.push('/')} style={{ ...pillBtn(dark), gap: 6, paddingRight: 16, color: fg }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{pick(lang, { ko: '우주', en: 'Universe', ja: '宇宙', zh: '宇宙', es: 'Universo' })}</span>
          </button>
          <div style={{ fontSize: 13, color: sub, letterSpacing: 0.5, fontWeight: 500 }}>{t.resultTitle}</div>
          <div style={{ width: 44 }} />
        </div>

        <div style={{ padding: '12px 20px 0', ...stagger(0) }}>
          <div style={{ fontSize: 12, color: accent, letterSpacing: 0.3, fontWeight: 600 }}>
            {pick(lang, {
              ko: `나 · ${person.name_ko}`, en: `You · ${person.name_ko}`,
              ja: `私 · ${person.name_ko}`, zh: `我 · ${person.name_ko}`,
              es: `Tú · ${person.name_ko}`,
            })}
          </div>
          <div style={{ fontSize: 28, fontWeight: 600, color: fg, letterSpacing: -0.7,
                        marginTop: 6, lineHeight: 1.2, whiteSpace: 'pre-line' }}>
            {meetingTitle}
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
                  {pick(lang, {
                    ko: '대화가 잘 풀려요', en: 'Words flow easily',
                    ja: '会話がよく弾みます', zh: '对话顺畅自如',
                    es: 'Las palabras fluyen con facilidad',
                  })}
                </div>
              </div>
            </div>
          </div>

          <div style={{
            borderRadius: 24, padding: '18px',
            background: cardBg, border: `0.5px solid ${cardBorder}`, ...stagger(5),
          }}>
            <div style={{ fontSize: 11, color: sub, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>
              {pick(lang, { ko: '두 기운', en: 'Two energies', ja: '二つの気', zh: '两种气', es: 'Dos energías' })}
            </div>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
              <ElementOrb element={me.element} size={36} animated />
              <span style={{ color: sub, fontSize: 16, margin: '0 4px' }}>+</span>
              <ElementOrb element={person.element} size={36} animated />
            </div>
            <div style={{ fontSize: 13, color: fg, marginTop: 10, letterSpacing: -0.2, lineHeight: 1.4 }}>
              {`${eMe.short[lang]} · ${eOther.short[lang]}`}
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
              {pick(lang, {
                ko: '같은 하늘 아래, 서로 다른 시간을 흐르는 두 강. 오늘 잠시 같은 풍경을 비춥니다.',
                en: 'Two rivers beneath the same sky, flowing through different hours — today, briefly mirroring the same view.',
                ja: '同じ空の下、異なる時を流れる二つの川。今日、しばし同じ景色を映します。',
                zh: '同一片天空下，流经不同时光的两条河。今天，短暂地映照出同样的风景。',
                es: 'Dos ríos bajo el mismo cielo, fluyendo por horas distintas: hoy reflejan, por un instante, el mismo paisaje.',
              })}
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
