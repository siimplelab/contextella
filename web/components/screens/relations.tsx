'use client';
import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ELEMENTS, SANS, cosmicBg, shade, accentInk } from '@/lib/tokens';
import { useStore, accentHex } from '@/lib/store';
import { flowFor, flowTone, compatibility, sajuFromBirth } from '@/lib/saju';
import { pick, relationLabel } from '@/lib/i18n';
import { StarField, ConstellationViz, OrbitalViz, GridViz } from '@/components/primitives';
import { ScreenHeader, BottomTabBar, FloatingAddBtn } from '@/components/chrome';
import { AddPersonSheet, NewUniverseSheet } from '@/components/sheets';
import type { Lang, Person, PersonWithFlow } from '@/lib/types';

export default function RelationsScreen() {
  const router = useRouter();
  const lang = useStore(s => s.lang);
  const dark = useStore(s => s.tweaks.darkMode);
  const accent = accentHex(useStore(s => s.tweaks.accent));
  const universes = useStore(s => s.universes);
  const me = useStore(s => s.me);
  const vizStyle = useStore(s => s.tweaks.vizStyle);
  const activeUniverseId = useStore(s => s.activeUniverseId);
  const setActiveUniverse = useStore(s => s.setActiveUniverse);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState<'flow' | 'name' | 'universe'>('flow');
  const [addOpen, setAddOpen] = useState(false);
  const [newUniverseOpen, setNewUniverseOpen] = useState(false);

  // The active universe drives the constellation view + the 궁합 bar chart.
  const universe = universes.find(u => u.id === activeUniverseId) || universes[0];
  const network: Person[] = me ? [me, ...(universe?.members ?? [])] : (universe?.members ?? []);

  // 궁합 (compatibility) score of every member against "me", for the bar chart.
  const compatBars = useMemo(() => {
    if (!me || !universe) return [];
    const a = sajuFromBirth(me.birth, me.time);
    if (!a) return [];
    return universe.members
      .map(p => {
        const b = sajuFromBirth(p.birth, p.time);
        return { id: p.id, name: p.name_ko, element: p.element,
                 score: b ? compatibility(a.pillars, b.pillars).score : 50 };
      })
      .sort((x, y) => y.score - x.score);
  }, [me, universe]);

  const fg = dark ? '#fff' : '#1A1538';
  const sub = dark ? 'rgba(255,255,255,0.6)' : 'rgba(26,21,56,0.6)';
  const fieldBg = dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)';
  const fieldBorder = dark ? 'rgba(255,255,255,0.10)' : 'rgba(26,21,56,0.08)';

  const allPeople = useMemo<PersonWithFlow[]>(() => {
    const out: PersonWithFlow[] = [];
    universes.forEach(u => {
      u.members.forEach(p => {
        out.push({ ...p, universeId: u.id, universeName_ko: u.name_ko,
                   universeName_en: u.name_en, flow: flowFor(p) });
      });
    });
    return out;
  }, [universes]);

  const filtered = useMemo(() => {
    let r = allPeople;
    if (filter === 'bright') r = r.filter(p => p.flow >= 75);
    else if (filter === 'careful') r = r.filter(p => p.flow < 55);
    else if (filter !== 'all') r = r.filter(p => p.universeId === filter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      r = r.filter(p =>
        p.name_ko.toLowerCase().includes(q) ||
        relationLabel(p.relation, lang).toLowerCase().includes(q)
      );
    }
    if (sort === 'flow') r = [...r].sort((a, b) => b.flow - a.flow);
    else if (sort === 'name') r = [...r].sort((a, b) => a.name_ko.localeCompare(b.name_ko));
    else if (sort === 'universe') r = [...r].sort((a, b) => a.universeId.localeCompare(b.universeId));
    return r;
  }, [allPeople, filter, query, sort, lang]);

  const filterChips = [
    { id: 'all', label: pick(lang, { ko: '전체', en: 'All', ja: 'すべて', zh: '全部', es: 'Todos' }) },
    ...universes.map(u => ({ id: u.id, label: u.name_ko })),
    { id: 'bright', label: pick(lang, { ko: '잘 맞는 결', en: 'In flow', ja: 'よく合う', zh: '契合', es: 'En sintonía' }) },
    { id: 'careful', label: pick(lang, { ko: '조심', en: 'Careful', ja: '慎重に', zh: '留心', es: 'Con cuidado' }) },
  ];

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      background: cosmicBg(dark), color: fg, overflow: 'hidden', fontFamily: SANS,
    }}>
      <StarField count={dark ? 40 : 15} seed={7} opacity={dark ? 0.4 : 0.12} />
      <div style={{ position: 'relative', height: '100%', overflow: 'auto', paddingBottom: 130 }}>
        <div style={{ height: 20 }} />
        <ScreenHeader
          title={pick(lang, { ko: '관계', en: 'Relations', ja: '関係', zh: '关系', es: 'Vínculos' })}
          sub={pick(lang, {
            ko: `${allPeople.length}명의 사람들과 연결되어 있어요`,
            en: `${allPeople.length} people in your universes`,
            ja: `${allPeople.length}人とつながっています`,
            zh: `已与 ${allPeople.length} 人相连`,
            es: `${allPeople.length} personas en tus universos`,
          })}
        />

        {/* 유니버스 UI — the same constellation view as the home screen, scoped
            to the active universe, with a switcher above it. */}
        {universe && me && (
          <div style={{ marginTop: 4 }}>
            <div style={{ display: 'flex', gap: 8, padding: '6px 18px 0', overflowX: 'auto' }}>
              {universes.map(u => {
                const active = u.id === universe.id;
                return (
                  <button key={u.id} onClick={() => setActiveUniverse(u.id)} style={{
                    minHeight: 38, padding: '0 16px', borderRadius: 19,
                    background: active
                      ? (dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.85)')
                      : 'transparent',
                    border: `0.5px solid ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(26,21,56,0.10)'}`,
                    color: active ? fg : sub, fontSize: 14, fontWeight: active ? 600 : 500,
                    letterSpacing: -0.2, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                    display: 'flex', alignItems: 'center', gap: 8, fontFamily: SANS,
                  }}>
                    <span style={{ width: 7, height: 7, borderRadius: 4,
                      background: active ? accent : (dark ? 'rgba(255,255,255,0.25)' : 'rgba(26,21,56,0.2)'),
                      boxShadow: active ? `0 0 8px ${accent}` : 'none' }} />
                    <span>{u.name_ko}</span>
                    <span style={{ fontSize: 11, color: active ? accentInk(accent, dark) : sub,
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

            <div key={universe.id} style={{ padding: '4px 8px 0', animation: 'ctx-fade .35s ease both' }}>
              {vizStyle === 'constellation' && (
                <ConstellationViz network={network} width={358} height={300}
                                  accent={accent} onSelect={id => id !== 'me' && router.push(`/result/${id}`)} lang={lang} />
              )}
              {vizStyle === 'orbital' && (
                <OrbitalViz network={network} width={358} height={300}
                            accent={accent} onSelect={id => id !== 'me' && router.push(`/result/${id}`)} lang={lang} />
              )}
              {vizStyle === 'grid' && (
                <div style={{ padding: '12px 12px 0' }}>
                  <GridViz network={network} accent={accent}
                           onSelect={id => id !== 'me' && router.push(`/result/${id}`)} lang={lang} dark={dark} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* 궁합 bar chart — every member of this universe ranked by 궁합 with me. */}
        {compatBars.length > 0 && (
          <div style={{ margin: '14px 16px 0', borderRadius: 24, padding: '18px 16px',
                        background: dark
                          ? 'linear-gradient(155deg, rgba(120,90,200,0.14), rgba(60,40,140,0.05))'
                          : 'linear-gradient(155deg, rgba(255,255,255,0.85), rgba(240,233,255,0.6))',
                        border: `0.5px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)'}` }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: fg, letterSpacing: -0.2 }}>
                {pick(lang, { ko: '궁합 한눈에', en: 'Compatibility at a glance', ja: '相性をひと目で',
                              zh: '一眼看匹配', es: 'Compatibilidad de un vistazo' })}
              </div>
              <div style={{ fontSize: 11, color: sub }}>{universe?.name_ko}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {compatBars.map((b, i) => {
                const c = b.score >= 70 ? '#7BD89A' : b.score >= 55 ? accentInk(accent, dark) : b.score >= 40 ? '#E8D4A2' : '#E8A4B5';
                const el = ELEMENTS[b.element];
                return (
                  <button key={b.id} onClick={() => router.push(`/result/${b.id}`)} style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: 0,
                    background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
                    fontFamily: SANS, animation: `ctx-rise .4s ease both ${i * 0.04}s`,
                  }}>
                    <span style={{ width: 12, height: 12, borderRadius: 6, flexShrink: 0,
                                   background: `radial-gradient(circle at 35% 30%, ${el.c1}, ${el.c2} 65%, ${el.c3})` }} />
                    <span style={{ width: 56, flexShrink: 0, fontSize: 12.5, color: fg, letterSpacing: -0.2,
                                   whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</span>
                    <span style={{ flex: 1, minWidth: 0, height: 10, borderRadius: 5, overflow: 'hidden',
                                   background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(26,21,56,0.06)' }}>
                      <span style={{ display: 'block', width: `${b.score}%`, height: '100%', borderRadius: 5,
                                     background: `linear-gradient(90deg, ${c}, ${shade(c, -12)})`,
                                     transition: 'width .6s cubic-bezier(.3,.7,.4,1)' }} />
                    </span>
                    <span style={{ width: 26, flexShrink: 0, textAlign: 'right', fontSize: 13, fontWeight: 700,
                                   color: c, fontVariantNumeric: 'tabular-nums' }}>{b.score}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ padding: '16px 20px 0' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            minHeight: 48, padding: '0 14px', borderRadius: 14,
            background: fieldBg, border: `0.5px solid ${fieldBorder}`,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={sub}
                 strokeWidth="1.8" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.5-4.5" />
            </svg>
            <input value={query} onChange={e => setQuery(e.target.value)}
                   placeholder={pick(lang, {
                     ko: '이름이나 관계로 찾기', en: 'Search name or relation',
                     ja: '名前や関係で検索', zh: '按姓名或关系搜索',
                     es: 'Buscar por nombre o relación',
                   })}
                   style={{
                     flex: 1, background: 'transparent', border: 'none', outline: 'none',
                     color: fg, fontSize: 15, fontFamily: SANS, letterSpacing: -0.2, minWidth: 0,
                   }} />
            {query && (
              <button onClick={() => setQuery('')} style={{
                width: 22, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
                background: dark ? 'rgba(255,255,255,0.12)' : 'rgba(26,21,56,0.10)',
                color: fg, fontSize: 12, lineHeight: 1, fontFamily: SANS,
              }}>×</button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, padding: '12px 20px 0', overflowX: 'auto' }}>
          {filterChips.map(c => {
            const active = c.id === filter;
            return (
              <button key={c.id} onClick={() => setFilter(c.id)} style={{
                minHeight: 34, padding: '0 14px', borderRadius: 17,
                background: active
                  ? (dark ? 'rgba(255,255,255,0.14)' : 'rgba(26,21,56,0.08)')
                  : 'transparent',
                border: `0.5px solid ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(26,21,56,0.10)'}`,
                color: active ? (dark ? accent : '#1A1538') : sub,
                fontSize: 13, fontWeight: active ? 600 : 500, fontFamily: SANS,
                whiteSpace: 'nowrap', wordBreak: 'keep-all', cursor: 'pointer', flexShrink: 0,
              }}>{c.label}</button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px 6px' }}>
          <div style={{ fontSize: 12, color: sub, letterSpacing: 0.3 }}>
            {pick(lang, {
              ko: `${filtered.length}명`, en: `${filtered.length} people`,
              ja: `${filtered.length}人`, zh: `${filtered.length} 人`,
              es: `${filtered.length} personas`,
            })}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {([
              { id: 'flow', label: pick(lang, { ko: '오늘 결순', en: 'Flow', ja: '今日の流れ順', zh: '按今日流动', es: 'Flujo' }) },
              { id: 'name', label: pick(lang, { ko: '이름순', en: 'Name', ja: '名前順', zh: '按姓名', es: 'Nombre' }) },
              { id: 'universe', label: pick(lang, { ko: '우주별', en: 'Group', ja: '宇宙別', zh: '按宇宙', es: 'Grupo' }) },
            ] as const).map(o => (
              <button key={o.id} onClick={() => setSort(o.id)} style={{
                minHeight: 30, padding: '0 10px', borderRadius: 15, border: 'none',
                background: sort === o.id
                  ? (dark ? 'rgba(255,255,255,0.10)' : 'rgba(26,21,56,0.06)')
                  : 'transparent',
                color: sort === o.id ? (dark ? accent : '#1A1538') : sub,
                fontSize: 12, fontWeight: sort === o.id ? 600 : 500, fontFamily: SANS,
                whiteSpace: 'nowrap', cursor: 'pointer',
              }}>{o.label}</button>
            ))}
          </div>
        </div>

        <div style={{ padding: '6px 16px 0' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: sub, fontSize: 14 }}>
              {pick(lang, {
                ko: '아직 이 결에 머무는 사람이 없어요', en: 'No one here yet',
                ja: 'まだここに人はいません', zh: '这里还没有人',
                es: 'Aún no hay nadie aquí',
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filtered.map((p, i) => (
                <div key={p.id} style={{ animation: `ctx-rise .4s ease both ${i * 0.03}s` }}>
                  <PersonRow p={p} lang={lang} dark={dark} onClick={() => router.push(`/result/${p.id}`)} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <FloatingAddBtn onClick={() => setAddOpen(true)} label={pick(lang, {
        ko: '사람 추가', en: 'Add person', ja: '人を追加', zh: '添加人物', es: 'Añadir persona',
      })} />
      <BottomTabBar activeTab="rel" />
      <AddPersonSheet open={addOpen} onClose={() => setAddOpen(false)}
                      onSaved={(id) => router.push(`/result/${id}`)} />
      <NewUniverseSheet open={newUniverseOpen} onClose={() => setNewUniverseOpen(false)} />
    </div>
  );
}

function PersonRow({ p, lang, dark, onClick }: { p: PersonWithFlow; lang: Lang; dark: boolean; onClick: () => void }) {
  const fg = dark ? '#fff' : '#1A1538';
  const sub = dark ? 'rgba(255,255,255,0.55)' : 'rgba(26,21,56,0.55)';
  const tone = flowTone(p.flow, dark);
  const e = ELEMENTS[p.element];
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12, width: '100%',
      padding: '12px 14px', minHeight: 64, borderRadius: 16,
      background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.55)',
      border: `0.5px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(26,21,56,0.05)'}`,
      cursor: 'pointer', textAlign: 'left', fontFamily: SANS,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 22,
        background: `radial-gradient(circle at 35% 30%, ${e.c1}, ${e.c2} 65%, ${e.c3})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 600, fontSize: p.emoji ? 22 : 16,
        boxShadow: `0 2px 10px ${e.c3}55`, flexShrink: 0,
      }}>{p.emoji || p.initials}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 15.5, fontWeight: 600, color: fg, letterSpacing: -0.3 }}>
            {p.name_ko}
          </span>
          <span style={{ fontSize: 11.5, color: sub }}>
            {relationLabel(p.relation, lang)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <span style={{
            fontSize: 10, padding: '2px 7px', borderRadius: 6,
            background: `${e.c3}22`, color: dark ? e.c1 : e.c3,
            fontWeight: 600, letterSpacing: 0.2,
          }}>{e.label[lang]}</span>
          <span style={{ fontSize: 11, color: sub }}>
            · {p.universeName_ko}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, gap: 4 }}>
        <span style={{ fontSize: 19, fontWeight: 600, color: tone.color,
                       fontVariantNumeric: 'tabular-nums', letterSpacing: -0.4, lineHeight: 1 }}>
          {p.flow}
        </span>
        <div style={{
          width: 36, height: 3, borderRadius: 2,
          background: dark ? 'rgba(255,255,255,0.10)' : 'rgba(26,21,56,0.10)',
          overflow: 'hidden',
        }}>
          <div style={{ height: '100%', width: `${p.flow}%`,
            background: `linear-gradient(90deg, ${tone.color}, ${shade(tone.color, -10)})`,
          }} />
        </div>
      </div>
    </button>
  );
}
