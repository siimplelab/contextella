'use client';
import React, { useMemo } from 'react';
import { ELEMENTS, accentInk } from '@/lib/tokens';
import { pick } from '@/lib/i18n';
import type { ElementKey, Lang, Person } from '@/lib/types';
import {
  sajuFromBirth, pillarViews, dayMasterReading, tenGodProfile,
  flowFor, flowTone, dailyAdvice, todaysElement,
  inDepthReading, STRENGTH_TEXT, STAGE_INFO, SINSAL_INFO, ELEMENT_REMEDY,
} from '@/lib/saju';
import { ElementOrb, StarField } from '@/components/primitives';

// The full in-depth Saju reading for one person's chart, independent of any
// compatibility. Shared by the person detail page (`/result/[id]`) and the
// "나" (Me) screen. `self` switches the copy to first-person where it matters.
export function SajuDetail({ person, lang, dark, accent, self = false }:
  { person: Person; lang: Lang; dark: boolean; accent: string; self?: boolean }) {
  const fg = dark ? '#fff' : '#1A1538';
  const sub = dark ? 'rgba(255,255,255,0.6)' : 'rgba(26,21,56,0.6)';
  const cardBg = dark
    ? 'linear-gradient(155deg, rgba(120,90,200,0.14), rgba(60,40,140,0.05))'
    : 'linear-gradient(155deg, rgba(255,255,255,0.85), rgba(240,233,255,0.6))';
  const cardBorder = dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)';
  const stagger = (i: number): React.CSSProperties =>
    ({ animation: `ctx-rise .5s cubic-bezier(.22,.7,.3,1) both ${0.05 + i * 0.06}s` });

  const detail = useMemo(() => {
    const s = sajuFromBirth(person.birth, person.time);
    if (!s) return null;
    return {
      pillars: pillarViews(s.pillars),
      balance: s.balance,
      reading: dayMasterReading(s.pillars),
      tenGods: tenGodProfile(s.pillars),
      element: s.element,
      hasTime: s.pillars.hour !== null,
      depth: inDepthReading(s.pillars),
    };
  }, [person]);
  const flow = useMemo(() => flowFor(person), [person]);

  if (!detail) {
    return (
      <div style={{ margin: '8px 16px 0', padding: '20px', borderRadius: 24, textAlign: 'center',
                    background: cardBg, border: `0.5px solid ${cardBorder}`, color: sub, fontSize: 13 }}>
        {pick(lang, {
          ko: '생년월일을 확인할 수 없어 사주를 풀 수 없어요.',
          en: 'The birth date could not be read, so no chart could be drawn.',
          ja: '生年月日が読み取れず、四柱を立てられません。',
          zh: '无法读取出生日期，无法排盘。',
          es: 'No se pudo leer la fecha de nacimiento, así que no hay carta.',
        })}
      </div>
    );
  }

  const { strength, useful, pattern, stages, sinsal } = detail.depth;
  const st = STRENGTH_TEXT[strength.level];
  const remedy = ELEMENT_REMEDY[useful.primary];
  const dayStage = stages.find(s => s.key === 'day');
  const stageLabel: Record<'year' | 'month' | 'day' | 'hour', Record<string, string>> = {
    year: { ko: '년', en: 'Yr', ja: '年', zh: '年', es: 'Año' },
    month: { ko: '월', en: 'Mo', ja: '月', zh: '月', es: 'Mes' },
    day: { ko: '일', en: 'Day', ja: '日', zh: '日', es: 'Día' },
    hour: { ko: '시', en: 'Hr', ja: '時', zh: '时', es: 'Hr' },
  };

  return (
    <div style={{ margin: '4px 16px 0' }}>
      {/* Day master — core temperament */}
      <div style={{ borderRadius: 24, padding: '18px', background: cardBg,
                    border: `0.5px solid ${cardBorder}`, position: 'relative', overflow: 'hidden', ...stagger(0) }}>
        <StarField count={14} seed={person.id.length + 21} opacity={dark ? 0.4 : 0.14} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
          <ElementOrb element={detail.element} size={64} animated />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: accentInk(accent, dark), letterSpacing: 1.2,
                          fontWeight: 600, textTransform: 'uppercase' }}>
              {pick(lang, { ko: '일간 · 타고난 결', en: 'Day master', ja: '日干 · 生まれの機微',
                            zh: '日主 · 天生纹理', es: 'Maestro del día' })}
            </div>
            <div style={{ fontSize: 19, fontWeight: 600, color: fg, letterSpacing: -0.4, marginTop: 2 }}>
              {detail.reading.title[lang]}
            </div>
            <div style={{ fontSize: 12.5, color: sub, marginTop: 3 }}>
              {detail.reading.stem[lang]} · {ELEMENTS[detail.element].label[lang]} · {detail.reading.yin
                ? pick(lang, { ko: '음', en: 'yin', ja: '陰', zh: '阴', es: 'yin' })
                : pick(lang, { ko: '양', en: 'yang', ja: '陽', zh: '阳', es: 'yang' })}
            </div>
          </div>
        </div>
        <div style={{ fontSize: 14, color: fg, lineHeight: 1.55, letterSpacing: -0.2, marginTop: 14, position: 'relative' }}>
          {detail.reading.body[lang]}
        </div>
        <div style={{ fontSize: 12, color: sub, marginTop: 8, position: 'relative' }}>
          {pick(lang, { ko: '상징', en: 'Image', ja: '象徴', zh: '象征', es: 'Imagen' })} · {detail.reading.image[lang]}
        </div>
      </div>

      {/* Four pillars */}
      <div style={{ marginTop: 10, borderRadius: 24, padding: '18px 16px', background: cardBg,
                    border: `0.5px solid ${cardBorder}`, ...stagger(1) }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: fg, letterSpacing: -0.2 }}>
            {pick(lang, { ko: '사주 · 네 기둥', en: 'Saju · Four Pillars', ja: '四柱 · 四つの柱',
                          zh: '四柱 · 四根支柱', es: 'Saju · Cuatro pilares' })}
          </div>
          {!detail.hasTime && (
            <div style={{ fontSize: 11, color: sub }}>
              {pick(lang, { ko: '시간 미상 · 시주 생략', en: 'time unknown · hour omitted',
                            ja: '時刻不明 · 時柱省略', zh: '时辰未知 · 略时柱', es: 'sin hora · sin pilar horario' })}
            </div>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${detail.pillars.length}, 1fr)`, gap: 8 }}>
          {detail.pillars.map((p, i) => {
            const el = ELEMENTS[p.element];
            return (
              <div key={i} style={{ padding: '12px 8px', borderRadius: 14,
                                    background: `${el.c3}18`, border: `0.5px solid ${el.c3}33`, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: sub, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  {p.label[lang]}
                </div>
                <div style={{ margin: '8px auto 6px', width: 28, height: 28, borderRadius: 14,
                              background: `radial-gradient(circle at 35% 30%, ${el.c1}, ${el.c2} 65%, ${el.c3})`,
                              boxShadow: `0 2px 8px ${el.c3}55` }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: fg, letterSpacing: -0.2 }}>{p.stem[lang]}</div>
                <div style={{ fontSize: 11, color: sub, marginTop: 2 }}>{p.branch[lang]}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Element balance */}
      <div style={{ marginTop: 10, borderRadius: 24, padding: '18px 16px', background: cardBg,
                    border: `0.5px solid ${cardBorder}`, ...stagger(2) }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: fg, letterSpacing: -0.2, marginBottom: 14 }}>
          {pick(lang, { ko: '오행 분포', en: 'Element balance', ja: '五行のバランス',
                        zh: '五行分布', es: 'Equilibrio de elementos' })}
        </div>
        <div style={{ display: 'flex', height: 16, borderRadius: 8, overflow: 'hidden',
                      background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(26,21,56,0.05)' }}>
          {(['water', 'wood', 'fire', 'earth', 'metal'] as ElementKey[]).map(elk => {
            const el = ELEMENTS[elk];
            return (
              <div key={elk} style={{ width: `${detail.balance[elk]}%`, height: '100%',
                                      background: `linear-gradient(135deg, ${el.c1}, ${el.c3})` }} />
            );
          })}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          {(['water', 'wood', 'fire', 'earth', 'metal'] as ElementKey[]).map(elk => {
            const el = ELEMENTS[elk];
            return (
              <div key={elk} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 5,
                               background: `linear-gradient(135deg, ${el.c1}, ${el.c3})` }} />
                <span style={{ fontSize: 11, color: sub }}>{el.short[lang]}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: fg, fontVariantNumeric: 'tabular-nums' }}>
                  {detail.balance[elk]}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ten Gods — temperament breakdown */}
      <div style={{ marginTop: 10, borderRadius: 24, padding: '18px 16px', background: cardBg,
                    border: `0.5px solid ${cardBorder}`, ...stagger(3) }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: fg, letterSpacing: -0.2 }}>
          {pick(lang, { ko: '십성 · 기질', en: 'Ten Gods · temperament', ja: '十星 · 気質',
                        zh: '十神 · 气质', es: 'Diez dioses · temperamento' })}
        </div>
        <div style={{ fontSize: 12, color: sub, marginTop: 4, lineHeight: 1.5 }}>
          {pick(lang, {
            ko: `가장 두드러진 결은 ‘${detail.tenGods[0].label.ko}’.`,
            en: `The strongest current is ${detail.tenGods[0].label.en}.`,
            ja: `最も際立つのは「${detail.tenGods[0].label.ja}」。`,
            zh: `最突出的是「${detail.tenGods[0].label.zh}」。`,
            es: `La corriente más fuerte es ${detail.tenGods[0].label.es}.`,
          })}
        </div>
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {detail.tenGods.map((g, i) => (
            <div key={g.key}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 13, fontWeight: i === 0 ? 700 : 500,
                               color: i === 0 ? accentInk(accent, dark) : fg, letterSpacing: -0.2 }}>
                  {g.label[lang]}
                </span>
                <span style={{ fontSize: 12, color: sub, fontVariantNumeric: 'tabular-nums' }}>{g.value}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, overflow: 'hidden',
                            background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(26,21,56,0.06)' }}>
                <div style={{ width: `${g.value}%`, height: '100%', borderRadius: 3,
                              background: i === 0 ? accent : (dark ? 'rgba(255,255,255,0.3)' : 'rgba(26,21,56,0.25)') }} />
              </div>
              <div style={{ fontSize: 11.5, color: sub, marginTop: 4, lineHeight: 1.4 }}>{g.meaning[lang]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 신강·신약 + 용신 */}
      <div style={{ marginTop: 10, borderRadius: 24, padding: '18px 16px', background: cardBg,
                    border: `0.5px solid ${cardBorder}`, ...stagger(4) }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: fg, letterSpacing: -0.2 }}>
            {pick(lang, { ko: '일간 강약 · 용신', en: 'Strength & favorable element',
                          ja: '日干の強弱 · 用神', zh: '日主强弱 · 用神', es: 'Fuerza y elemento favorable' })}
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: accentInk(accent, dark) }}>{st.label[lang]}</span>
        </div>
        <div style={{ marginTop: 12, height: 8, borderRadius: 4, overflow: 'hidden', position: 'relative',
                      background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(26,21,56,0.06)' }}>
          <div style={{ width: `${strength.percent}%`, height: '100%', borderRadius: 4,
                        background: `linear-gradient(90deg, ${accent}, ${ELEMENTS[detail.element].c2})` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 10.5, color: sub }}>
          <span>{pick(lang, { ko: '약', en: 'weak', ja: '弱', zh: '弱', es: 'débil' })}</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>
            {pick(lang, { ko: `신강도 ${strength.percent}`, en: `${strength.percent}% self`,
                          ja: `身強度 ${strength.percent}`, zh: `身强 ${strength.percent}`, es: `${strength.percent}% propio` })}
          </span>
          <span>{pick(lang, { ko: '강', en: 'strong', ja: '強', zh: '强', es: 'fuerte' })}</span>
        </div>
        <div style={{ fontSize: 13.5, color: fg, lineHeight: 1.55, letterSpacing: -0.2, marginTop: 12 }}>
          {st.body[lang]}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 14 }}>
          <div>
            <div style={{ fontSize: 10.5, color: sub, letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>
              {pick(lang, { ko: '유리한 기운', en: 'Favorable', ja: '有利な気', zh: '有利之气', es: 'Favorable' })}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {useful.favorable.map(el => (
                <ElementChip key={el} el={el} lang={lang} highlight={el === useful.primary} dark={dark} accent={accent} />
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10.5, color: sub, letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>
              {pick(lang, { ko: '주의할 기운', en: 'To balance', ja: '注意の気', zh: '宜节制', es: 'A moderar' })}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {useful.avoid.map(el => (
                <ElementChip key={el} el={el} lang={lang} dark={dark} accent={accent} muted />
              ))}
            </div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: sub, marginTop: 12, lineHeight: 1.5 }}>
          {pick(lang, {
            ko: `용신은 ${ELEMENTS[useful.primary].short.ko}. ${remedy.color.ko} 색, ${remedy.dir.ko} 방향, ${remedy.season.ko} 기운이 힘이 됩니다.`,
            en: `Useful god: ${ELEMENTS[useful.primary].short.en.toLowerCase()}. ${remedy.color.en}, the ${remedy.dir.en}, and ${remedy.season.en} lend strength.`,
            ja: `用神は${ELEMENTS[useful.primary].short.ja}。${remedy.color.ja}の色、${remedy.dir.ja}の方角、${remedy.season.ja}の気が力になります。`,
            zh: `用神为${ELEMENTS[useful.primary].short.zh}。${remedy.color.zh}之色、${remedy.dir.zh}之方、${remedy.season.zh}之气为助力。`,
            es: `Dios útil: ${ELEMENTS[useful.primary].short.es.toLowerCase()}. ${remedy.color.es}, el ${remedy.dir.es} y ${remedy.season.es} dan fuerza.`,
          })}
        </div>
      </div>

      {/* 격국 */}
      <div style={{ marginTop: 10, borderRadius: 24, padding: '18px 16px', background: cardBg,
                    border: `0.5px solid ${cardBorder}`, ...stagger(4) }}>
        <div style={{ fontSize: 11, color: accentInk(accent, dark), letterSpacing: 1.2,
                      fontWeight: 600, textTransform: 'uppercase' }}>
          {pick(lang, { ko: '격국 · 타고난 그릇', en: 'Structure', ja: '格局 · 器', zh: '格局 · 器', es: 'Estructura' })}
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, color: fg, letterSpacing: -0.4, marginTop: 4 }}>
          {pattern.name[lang]}
        </div>
        <div style={{ fontSize: 13.5, color: fg, lineHeight: 1.55, letterSpacing: -0.2, marginTop: 8 }}>
          {pattern.body[lang]}
        </div>
      </div>

      {/* 십이운성 */}
      <div style={{ marginTop: 10, borderRadius: 24, padding: '18px 16px', background: cardBg,
                    border: `0.5px solid ${cardBorder}`, ...stagger(5) }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: fg, letterSpacing: -0.2, marginBottom: 14 }}>
          {pick(lang, { ko: '십이운성 · 기운의 흐름', en: 'Twelve Life Stages',
                        ja: '十二運星 · 気の流れ', zh: '十二运星 · 气之流', es: 'Doce etapas vitales' })}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${stages.length}, 1fr)`, gap: 8 }}>
          {stages.map(s => {
            const info = STAGE_INFO[s.stage];
            const isDay = s.key === 'day';
            return (
              <div key={s.key} style={{ padding: '12px 6px', borderRadius: 14, textAlign: 'center',
                background: isDay ? `${accent}22` : (dark ? 'rgba(255,255,255,0.04)' : 'rgba(26,21,56,0.04)'),
                border: `0.5px solid ${isDay ? accent : (dark ? 'rgba(255,255,255,0.08)' : 'rgba(26,21,56,0.06)')}` }}>
                <div style={{ fontSize: 10, color: sub, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  {stageLabel[s.key][lang]}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: isDay ? accentInk(accent, dark) : fg, marginTop: 6 }}>
                  {info.name[lang]}
                </div>
              </div>
            );
          })}
        </div>
        {dayStage && (
          <div style={{ fontSize: 12.5, color: sub, marginTop: 12, lineHeight: 1.5 }}>
            {pick(lang, {
              ko: `일지의 운성은 ‘${STAGE_INFO[dayStage.stage].name.ko}’ — ${STAGE_INFO[dayStage.stage].gloss.ko}.`,
              en: `The day-branch stage is ${STAGE_INFO[dayStage.stage].name.en} — ${STAGE_INFO[dayStage.stage].gloss.en}.`,
              ja: `日支の運星は「${STAGE_INFO[dayStage.stage].name.ja}」— ${STAGE_INFO[dayStage.stage].gloss.ja}。`,
              zh: `日支运星为「${STAGE_INFO[dayStage.stage].name.zh}」— ${STAGE_INFO[dayStage.stage].gloss.zh}。`,
              es: `La etapa de rama del día es ${STAGE_INFO[dayStage.stage].name.es} — ${STAGE_INFO[dayStage.stage].gloss.es}.`,
            })}
          </div>
        )}
      </div>

      {/* 신살 */}
      <div style={{ marginTop: 10, borderRadius: 24, padding: '18px 16px', background: cardBg,
                    border: `0.5px solid ${cardBorder}`, ...stagger(5) }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: fg, letterSpacing: -0.2 }}>
          {pick(lang, { ko: '신살 · 특별한 기운', en: 'Symbolic stars', ja: '神殺 · 特別な気',
                        zh: '神煞 · 特别之气', es: 'Estrellas simbólicas' })}
        </div>
        {sinsal.length === 0 ? (
          <div style={{ fontSize: 12.5, color: sub, marginTop: 8, lineHeight: 1.5 }}>
            {pick(lang, {
              ko: '두드러진 신살은 없어요. 잔잔하고 균형 잡힌 기운입니다.',
              en: 'No prominent stars — a calm, even-keeled chart.',
              ja: '際立つ神殺はありません。穏やかで均整のとれた気です。',
              zh: '没有突出的神煞，气息平和均衡。',
              es: 'Sin estrellas marcadas: una carta serena y equilibrada.',
            })}
          </div>
        ) : (
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sinsal.map(key => {
              const info = SINSAL_INFO[key];
              const toneColor = info.tone === 'lucky' ? '#7BD89A' : info.tone === 'caution' ? '#E8A4B5' : accentInk(accent, dark);
              return (
                <div key={key} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 4, marginTop: 6, flexShrink: 0,
                                 background: toneColor, boxShadow: `0 0 8px ${toneColor}88` }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: fg, letterSpacing: -0.2 }}>{info.name[lang]}</span>
                    <span style={{ fontSize: 12.5, color: sub, marginLeft: 8 }}>{info.gloss[lang]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Today's flow */}
      <div style={{ marginTop: 10, borderRadius: 24, padding: '18px 16px', background: cardBg,
                    border: `0.5px solid ${cardBorder}`, ...stagger(6) }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: fg, letterSpacing: -0.2 }}>
            {self
              ? pick(lang, { ko: '오늘 나의 결', en: 'My flow today', ja: '今日の私の機微', zh: '我的今日纹理', es: 'Mi flujo de hoy' })
              : pick(lang, { ko: '오늘의 결', en: 'Today’s flow', ja: '今日の機微', zh: '今日纹理', es: 'Flujo de hoy' })}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, padding: '4px 12px',
                        borderRadius: 14, background: flowTone(flow, dark).bg }}>
            <span style={{ fontSize: 18, fontWeight: 600, color: flowTone(flow, dark).color,
                           fontVariantNumeric: 'tabular-nums' }}>{flow}</span>
            <span style={{ fontSize: 11, color: sub }}>/ 100</span>
          </div>
        </div>
        <div style={{ fontSize: 12, color: sub, marginTop: 8, lineHeight: 1.5 }}>
          {self
            ? pick(lang, {
                ko: `오늘의 기운은 ${ELEMENTS[todaysElement()].short.ko}. 오늘 나에게 좋은 것들:`,
                en: `Today’s energy is ${ELEMENTS[todaysElement()].short.en.toLowerCase()}. Good for you today:`,
                ja: `今日の気は${ELEMENTS[todaysElement()].short.ja}。今日の自分に良いこと：`,
                zh: `今日之气为${ELEMENTS[todaysElement()].short.zh}。今天适合你的：`,
                es: `La energía de hoy es ${ELEMENTS[todaysElement()].short.es.toLowerCase()}. Bueno para ti hoy:`,
              })
            : pick(lang, {
                ko: `오늘의 기운은 ${ELEMENTS[todaysElement()].short.ko}. ${person.name_ko}님과 나누기 좋은 것들:`,
                en: `Today’s energy is ${ELEMENTS[todaysElement()].short.en.toLowerCase()}. Good to share with ${person.name_ko}:`,
                ja: `今日の気は${ELEMENTS[todaysElement()].short.ja}。${person.name_ko}さんと分かち合うと良いこと：`,
                zh: `今日之气为${ELEMENTS[todaysElement()].short.zh}。适合与${person.name_ko}分享：`,
                es: `La energía de hoy es ${ELEMENTS[todaysElement()].short.es.toLowerCase()}. Bueno para compartir con ${person.name_ko}:`,
              })}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {dailyAdvice(todaysElement(), lang).map((a, i) => (
            <span key={i} style={{ fontSize: 12.5, color: fg, padding: '6px 12px', borderRadius: 14,
                                   background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.6)',
                                   border: `0.5px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(26,21,56,0.06)'}` }}>
              {a}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// A small element pill used in the 용신 (favorable element) breakdown.
function ElementChip({ el, lang, highlight, muted, dark, accent }:
  { el: ElementKey; lang: Lang; highlight?: boolean; muted?: boolean; dark: boolean; accent: string }) {
  const e = ELEMENTS[el];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 13,
      background: highlight ? `${accent}2e` : (dark ? 'rgba(255,255,255,0.05)' : 'rgba(26,21,56,0.04)'),
      border: `0.5px solid ${highlight ? accent : (dark ? 'rgba(255,255,255,0.10)' : 'rgba(26,21,56,0.08)')}`,
      opacity: muted ? 0.6 : 1,
    }}>
      <span style={{ width: 10, height: 10, borderRadius: 5,
                     background: `linear-gradient(135deg, ${e.c1}, ${e.c3})` }} />
      <span style={{ fontSize: 12.5, fontWeight: highlight ? 700 : 500,
                     color: dark ? '#fff' : '#1A1538', letterSpacing: -0.2 }}>{e.short[lang]}</span>
    </span>
  );
}
