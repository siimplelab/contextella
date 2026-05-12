// more-screens.jsx — Relations, Today, Me

const { useState: useStateMS, useMemo: useMemoMS, useEffect: useEffectMS } = React;

// ─── shared chrome ────────────────────────────────────────
function ScreenHeader({ title, sub, lang, onLangChange, dark, accent, right }) {
  const fg = dark ? '#fff' : '#1A1538';
  const subC = dark ? 'rgba(255,255,255,0.6)' : 'rgba(26,21,56,0.6)';
  const [open, setOpen] = useStateMS(false);
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
          {onLangChange && (
            <button onClick={() => setOpen(o => !o)} style={pillBtn(dark)} aria-label="Language">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={fg}
                   strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <ellipse cx="12" cy="12" rx="4" ry="9" />
                <path d="M3 12h18" />
              </svg>
            </button>
          )}
        </div>
      </div>
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
            <button key={l.code} onClick={() => { onLangChange(l.code); setOpen(false); }}
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
              <span style={{ wordBreak: 'keep-all' }}>{l.label}</span>
              {l.code === lang && <span style={{ color: accent }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// RELATIONS SCREEN — list of everyone, with filter + sort
// ═══════════════════════════════════════════════════════════
function RelationsScreen({ t, lang, dark, accent, onLang, onTabChange,
                           universes, onSelectPerson, onAdd }) {
  const [query, setQuery] = useStateMS('');
  const [filter, setFilter] = useStateMS('all'); // all | family | friends1 | work | bright | careful
  const [sort, setSort] = useStateMS('flow'); // flow | name | universe

  const fg = dark ? '#fff' : '#1A1538';
  const sub = dark ? 'rgba(255,255,255,0.6)' : 'rgba(26,21,56,0.6)';
  const fieldBg = dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)';
  const fieldBorder = dark ? 'rgba(255,255,255,0.10)' : 'rgba(26,21,56,0.08)';

  const dayEl = useMemoMS(() => todaysElement(), []);

  const allPeople = useMemoMS(() => {
    const out = [];
    universes.forEach(u => {
      (u.members || []).forEach(p => {
        out.push({ ...p, universeId: u.id,
                   universeName_ko: u.name_ko || u.name,
                   universeName_en: u.name_en || u.name,
                   flow: flowFor(p, dayEl) });
      });
    });
    return out;
  }, [universes, dayEl]);

  const filtered = useMemoMS(() => {
    let r = allPeople;
    if (filter === 'bright') r = r.filter(p => p.flow >= 75);
    else if (filter === 'careful') r = r.filter(p => p.flow < 55);
    else if (filter !== 'all') r = r.filter(p => p.universeId === filter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      r = r.filter(p =>
        (p.name_ko && p.name_ko.toLowerCase().includes(q)) ||
        (p.name_en && p.name_en.toLowerCase().includes(q)) ||
        (p.relation_ko && p.relation_ko.toLowerCase().includes(q)) ||
        (p.relation_en && p.relation_en.toLowerCase().includes(q))
      );
    }
    if (sort === 'flow') r = [...r].sort((a, b) => b.flow - a.flow);
    else if (sort === 'name') r = [...r].sort((a, b) =>
      (lang === 'ko' ? a.name_ko : a.name_en).localeCompare(lang === 'ko' ? b.name_ko : b.name_en));
    else if (sort === 'universe') r = [...r].sort((a, b) => a.universeId.localeCompare(b.universeId));
    return r;
  }, [allPeople, filter, query, sort, lang]);

  // group by universe when sort=universe
  const grouped = useMemoMS(() => {
    if (sort !== 'universe') return null;
    const m = new Map();
    filtered.forEach(p => {
      if (!m.has(p.universeId)) m.set(p.universeId, []);
      m.get(p.universeId).push(p);
    });
    return Array.from(m.entries());
  }, [filtered, sort]);

  const filterChips = [
    { id: 'all', ko: '전체', en: 'All' },
    ...universes.map(u => ({ id: u.id, ko: u.name_ko || u.name, en: u.name_en || u.name })),
    { id: 'bright', ko: '잘 맞는 결', en: 'In flow' },
    { id: 'careful', ko: '조심', en: 'Careful' },
  ];

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      background: cosmicBg(dark), color: fg, overflow: 'hidden', fontFamily: SANS,
    }}>
      <StarField count={dark ? 40 : 15} seed={7} opacity={dark ? 0.4 : 0.12} />
      <div style={{ position: 'relative', height: '100%', overflow: 'auto', paddingBottom: 130 }}>
        <div style={{ height: 54 }} />
        <ScreenHeader
          title={lang === 'ko' ? '관계' : 'Relations'}
          sub={lang === 'ko' ? `${allPeople.length}명의 사람들과 연결되어 있어요` : `${allPeople.length} people in your universes`}
          lang={lang} onLangChange={onLang} dark={dark} accent={accent}
        />

        {/* search */}
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
                   placeholder={lang === 'ko' ? '이름이나 관계로 찾기' : 'Search name or relation'}
                   style={{
                     flex: 1, background: 'transparent', border: 'none', outline: 'none',
                     color: fg, fontSize: 15, fontFamily: SANS, letterSpacing: -0.2,
                     minWidth: 0,
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

        {/* filter chips */}
        <div style={{
          display: 'flex', gap: 6, padding: '12px 20px 0',
          overflowX: 'auto', scrollbarWidth: 'none',
        }}>
          <style>{`.ctx-chips::-webkit-scrollbar{display:none}`}</style>
          {filterChips.map(c => {
            const active = c.id === filter;
            return (
              <button key={c.id} onClick={() => setFilter(c.id)} style={{
                minHeight: 34, padding: '0 14px', borderRadius: 17,
                background: active
                  ? (dark ? 'rgba(255,255,255,0.14)' : 'rgba(26,21,56,0.08)')
                  : 'transparent',
                border: `0.5px solid ${active
                  ? (dark ? 'rgba(255,255,255,0.18)' : 'rgba(26,21,56,0.18)')
                  : (dark ? 'rgba(255,255,255,0.10)' : 'rgba(26,21,56,0.10)')}`,
                color: active ? (dark ? accent : '#1A1538') : sub,
                fontSize: 13, fontWeight: active ? 600 : 500, fontFamily: SANS,
                whiteSpace: 'nowrap', wordBreak: 'keep-all', cursor: 'pointer', flexShrink: 0,
              }}>{lang === 'ko' ? c.ko : c.en}</button>
            );
          })}
        </div>

        {/* sort row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 22px 6px',
        }}>
          <div style={{ fontSize: 12, color: sub, letterSpacing: 0.3,
                        wordBreak: 'keep-all', whiteSpace: 'nowrap' }}>
            {lang === 'ko' ? `${filtered.length}명` : `${filtered.length} people`}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {[
              { id: 'flow', ko: '오늘 결순', en: 'Flow' },
              { id: 'name', ko: '이름순', en: 'Name' },
              { id: 'universe', ko: '우주별', en: 'Group' },
            ].map(o => (
              <button key={o.id} onClick={() => setSort(o.id)} style={{
                minHeight: 30, padding: '0 10px', borderRadius: 15, border: 'none',
                background: sort === o.id
                  ? (dark ? 'rgba(255,255,255,0.10)' : 'rgba(26,21,56,0.06)')
                  : 'transparent',
                color: sort === o.id ? (dark ? accent : '#1A1538') : sub,
                fontSize: 12, fontWeight: sort === o.id ? 600 : 500, fontFamily: SANS,
                whiteSpace: 'nowrap', wordBreak: 'keep-all', cursor: 'pointer',
              }}>{lang === 'ko' ? o.ko : o.en}</button>
            ))}
          </div>
        </div>

        {/* list */}
        <div style={{ padding: '6px 16px 0' }}>
          {grouped ? (
            grouped.map(([uid, people]) => {
              const u = universes.find(x => x.id === uid);
              return (
                <div key={uid} style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 11, color: sub, letterSpacing: 1.2, fontWeight: 600,
                                textTransform: 'uppercase', padding: '8px 6px 6px',
                                wordBreak: 'keep-all' }}>
                    {lang === 'ko' ? (u?.name_ko || u?.name) : (u?.name_en || u?.name)}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {people.map(p => (
                      <PersonRow key={p.id} p={p} dark={dark} accent={accent} lang={lang}
                                 onClick={() => onSelectPerson(p.id)} />
                    ))}
                  </div>
                </div>
              );
            })
          ) : filtered.length === 0 ? (
            <div style={{
              padding: '60px 20px', textAlign: 'center', color: sub, fontSize: 14,
              wordBreak: 'keep-all', lineHeight: 1.6,
            }}>
              {lang === 'ko' ? '아직 이 결에 머무는 사람이 없어요' : 'No one here yet'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filtered.map((p, i) => (
                <div key={p.id} style={{ animation: `ctx-rise .4s ease both ${i * 0.03}s` }}>
                  <PersonRow p={p} dark={dark} accent={accent} lang={lang}
                             onClick={() => onSelectPerson(p.id)} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <FloatingAddBtn onClick={onAdd} accent={accent}
                      label={lang === 'ko' ? '사람 추가' : 'Add person'} />
      <BottomTabBar lang={lang} dark={dark} accent={accent}
                    activeTab="rel" onTabChange={onTabChange} />
    </div>
  );
}

function PersonRow({ p, dark, accent, lang, onClick }) {
  const fg = dark ? '#fff' : '#1A1538';
  const sub = dark ? 'rgba(255,255,255,0.55)' : 'rgba(26,21,56,0.55)';
  const tone = flowTone(p.flow);
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
        color: '#fff', fontWeight: 600,
        fontSize: p.emoji ? 22 : 16,
        boxShadow: `0 2px 10px ${e.c3}55`, flexShrink: 0,
      }}>{p.emoji || p.initials}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 15.5, fontWeight: 600, color: fg, letterSpacing: -0.3,
                         wordBreak: 'keep-all' }}>
            {lang === 'ko' ? p.name_ko : p.name_en}
          </span>
          <span style={{ fontSize: 11.5, color: sub, wordBreak: 'keep-all' }}>
            {lang === 'ko' ? p.relation_ko : p.relation_en}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <span style={{
            fontSize: 10, padding: '2px 7px', borderRadius: 6,
            background: `${e.c3}22`, color: dark ? e.c1 : e.c3,
            fontWeight: 600, letterSpacing: 0.2, wordBreak: 'keep-all', whiteSpace: 'nowrap',
          }}>{lang === 'ko' ? e.label_ko : e.label_en}</span>
          <span style={{ fontSize: 11, color: sub, wordBreak: 'keep-all', whiteSpace: 'nowrap' }}>
            · {lang === 'ko' ? p.universeName_ko : p.universeName_en}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
                    flexShrink: 0, gap: 4 }}>
        <span style={{ fontSize: 19, fontWeight: 600, color: tone.color,
                       fontVariantNumeric: 'tabular-nums', letterSpacing: -0.4, lineHeight: 1 }}>
          {p.flow}
        </span>
        <div style={{
          width: 36, height: 3, borderRadius: 2,
          background: dark ? 'rgba(255,255,255,0.10)' : 'rgba(26,21,56,0.10)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: `${p.flow}%`,
            background: `linear-gradient(90deg, ${tone.color}, ${shade(tone.color, -10)})`,
          }} />
        </div>
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════
// TODAY SCREEN — full day report, hour energy timeline, advice
// ═══════════════════════════════════════════════════════════
function TodayScreen({ t, lang, dark, accent, onLang, onTabChange, onSelectPerson }) {
  const report = useMemoMS(() => buildDayReport(lang), [lang, new Date().toDateString()]);
  const headline = dayHeadline(report, lang);
  const fg = dark ? '#fff' : '#1A1538';
  const sub = dark ? 'rgba(255,255,255,0.6)' : 'rgba(26,21,56,0.6)';
  const dayEl = ELEMENTS[report.dayElement];

  const today = new Date();
  const weekday = lang === 'ko'
    ? ['일', '월', '화', '수', '목', '금', '토'][today.getDay()] + '요일'
    : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][today.getDay()];

  // Hour-by-hour energy curve — pseudo: weighted by day element favored hours
  const hours = useMemoMS(() => {
    const arr = [];
    const peakHour = (report.dayElement.charCodeAt(0) * 3) % 22 + 1;
    for (let h = 0; h < 24; h += 2) {
      const dist = Math.min(Math.abs(h - peakHour), 24 - Math.abs(h - peakHour));
      const base = 60 + Math.cos((dist / 12) * Math.PI) * 30;
      const wobble = ((h * 7 + today.getDate()) % 9) - 4;
      arr.push({ h, e: Math.max(20, Math.min(98, Math.round(base + wobble))) });
    }
    return arr;
  }, [report.dayElement, today.getDate()]);

  const peakIdx = hours.reduce((mi, p, i) => p.e > hours[mi].e ? i : mi, 0);
  const lowIdx = hours.reduce((mi, p, i) => p.e < hours[mi].e ? i : mi, 0);

  const cardBg = dark
    ? 'linear-gradient(155deg, rgba(120,90,200,0.16), rgba(60,40,140,0.05))'
    : 'linear-gradient(155deg, rgba(255,255,255,0.85), rgba(240,233,255,0.6))';
  const cardBorder = `0.5px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)'}`;

  // Practical advice — element-specific
  const advice = useMemoMS(() => {
    const e = report.dayElement;
    const map = {
      water: { ko: ['깊이 듣는 대화', '결정을 미루지 말고 따뜻하게', '물 한 잔, 짧은 산책'],
               en: ['Listen deeply in conversation', 'Decide with warmth, not delay', 'Water, a brief walk'] },
      wood:  { ko: ['새 시작을 격려해 보세요', '작은 약속부터 지키기', '식물 곁에서 잠시'],
               en: ['Encourage a new beginning', 'Keep one small promise', 'Pause near something green'] },
      fire:  { ko: ['따뜻한 안부 전하기', '큰 감정 다루기 좋아요', '햇볕 아래 5분'],
               en: ['Send a warm hello', 'Big emotions land well today', 'Five minutes of sunlight'] },
      earth: { ko: ['천천히, 차근차근 마무리', '책상 위 정리', '땅에 발을 붙이기'],
               en: ['Wrap things up slowly', 'Tidy your desk', 'Feet on the ground'] },
      metal: { ko: ['군더더기를 덜어내기', '경계를 분명히', '깊은 호흡 세 번'],
               en: ['Trim what is excess', 'Hold a clean boundary', 'Three deep breaths'] },
    };
    return map[e][lang === 'ko' ? 'ko' : 'en'];
  }, [report.dayElement, lang]);

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      background: cosmicBg(dark), color: fg, overflow: 'hidden', fontFamily: SANS,
    }}>
      <StarField count={dark ? 70 : 22} seed={3} opacity={dark ? 0.55 : 0.14} />
      <div style={{ position: 'relative', height: '100%', overflow: 'auto', paddingBottom: 130 }}>
        <div style={{ height: 54 }} />
        <ScreenHeader title={lang === 'ko' ? '오늘' : 'Today'}
                      sub={`${formatDate(today, lang)} · ${weekday}`}
                      lang={lang} onLangChange={onLang} dark={dark} accent={accent} />

        {/* Hero day card */}
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
              <div style={{ fontSize: 11, letterSpacing: 1.4, color: accent,
                            textTransform: 'uppercase', fontWeight: 600 }}>
                {lang === 'ko' ? `오늘의 기운 · ${dayEl.label_ko}` : `Day energy · ${dayEl.label_en}`}
              </div>
              <div style={{ fontSize: 22, fontWeight: 600, color: fg, letterSpacing: -0.5,
                            lineHeight: 1.25, marginTop: 6, wordBreak: 'keep-all' }}>
                {headline.title}
              </div>
              <div style={{ fontSize: 13.5, color: sub, lineHeight: 1.5, letterSpacing: -0.2,
                            marginTop: 8, wordBreak: 'keep-all' }}>
                {headline.body}
              </div>
            </div>
          </div>
        </div>

        {/* Hour energy timeline */}
        <div style={{
          margin: '14px 16px 0', borderRadius: 24, padding: '18px 16px 14px',
          background: cardBg, border: cardBorder,
          animation: 'ctx-rise .5s ease both .05s',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: fg, letterSpacing: -0.2,
                          wordBreak: 'keep-all', whiteSpace: 'nowrap' }}>
              {lang === 'ko' ? '시간별 흐름' : 'Hour by hour'}
            </div>
            <div style={{ fontSize: 11, color: sub, wordBreak: 'keep-all', whiteSpace: 'nowrap' }}>
              {lang === 'ko' ? '결의 높낮이' : 'Energy curve'}
            </div>
          </div>
          <HourCurve hours={hours} peakIdx={peakIdx} lowIdx={lowIdx}
                     accent={accent} dark={dark} lang={lang} />
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <PeakBadge type="peak" hour={hours[peakIdx].h} energy={hours[peakIdx].e}
                       dark={dark} lang={lang} />
            <PeakBadge type="low" hour={hours[lowIdx].h} energy={hours[lowIdx].e}
                       dark={dark} lang={lang} />
          </div>
        </div>

        {/* Bright currents */}
        {report.bright.length > 0 && (
          <div style={{
            margin: '14px 16px 0', borderRadius: 24, padding: '18px 16px',
            background: cardBg, border: cardBorder,
            animation: 'ctx-rise .5s ease both .1s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: '#7BD89A' }} />
              <span style={{ fontSize: 11, color: sub, fontWeight: 600, letterSpacing: 1,
                             textTransform: 'uppercase', wordBreak: 'keep-all' }}>
                {lang === 'ko' ? '오늘 잘 맞는 결' : 'Today\u2019s bright currents'}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {report.bright.map(p => (
                <FlowRow key={p.id} person={p} dark={dark} accent={accent} lang={lang}
                         onClick={() => onSelectPerson && onSelectPerson(p.id)} />
              ))}
            </div>
          </div>
        )}

        {/* Careful */}
        {report.careful.length > 0 && (
          <div style={{
            margin: '14px 16px 0', borderRadius: 24, padding: '18px 16px',
            background: cardBg, border: cardBorder,
            animation: 'ctx-rise .5s ease both .15s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: '#E8A4B5' }} />
              <span style={{ fontSize: 11, color: sub, fontWeight: 600, letterSpacing: 1,
                             textTransform: 'uppercase', wordBreak: 'keep-all' }}>
                {lang === 'ko' ? '한 발 거리를 둘 결' : 'Step softly'}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {report.careful.map(p => (
                <FlowRow key={p.id} person={p} dark={dark} accent={accent} lang={lang}
                         onClick={() => onSelectPerson && onSelectPerson(p.id)} />
              ))}
            </div>
          </div>
        )}

        {/* Advice card */}
        <div style={{
          margin: '14px 16px 0', borderRadius: 24, padding: '20px',
          background: dark
            ? `linear-gradient(135deg, rgba(120,90,200,0.28), rgba(60,40,140,0.10))`
            : `linear-gradient(135deg, ${accent}22, rgba(255,255,255,0.6))`,
          border: cardBorder,
          animation: 'ctx-rise .5s ease both .2s',
        }}>
          <div style={{ fontSize: 11, color: accent, letterSpacing: 1.4, fontWeight: 600,
                        textTransform: 'uppercase', wordBreak: 'keep-all' }}>
            {lang === 'ko' ? '오늘의 결을 다듬는 법' : 'Tune today\u2019s grain'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
            {advice.map((a, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, alignItems: 'flex-start',
                paddingTop: i > 0 ? 10 : 0,
                borderTop: i > 0
                  ? `0.5px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(26,21,56,0.06)'}`
                  : 'none',
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 11, flexShrink: 0,
                  background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)',
                  color: accent, fontSize: 11, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontVariantNumeric: 'tabular-nums',
                }}>{i + 1}</span>
                <span style={{ fontSize: 14, color: fg, lineHeight: 1.5, letterSpacing: -0.2,
                               wordBreak: 'keep-all' }}>{a}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Poetic close */}
        <div style={{
          margin: '14px 16px 0', borderRadius: 24, padding: '22px',
          background: cardBg, border: cardBorder,
          animation: 'ctx-rise .5s ease both .25s',
        }}>
          <div style={{ fontSize: 16, color: fg, lineHeight: 1.6, letterSpacing: -0.2,
                        fontWeight: 500, wordBreak: 'keep-all' }}>
            {lang === 'ko'
              ? `오늘의 ${dayEl.label_ko}은 잠시 흐르다 갑니다.\n그 결 위에 무엇을 띄울지는, 당신의 손에 달려 있어요.`
              : `Today's ${dayEl.label_en.toLowerCase()} passes through.\nWhat you place upon its current is yours to choose.`}
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: sub, letterSpacing: 1.5,
                        textTransform: 'uppercase', fontWeight: 600 }}>
            contextella
          </div>
        </div>
      </div>

      <BottomTabBar lang={lang} dark={dark} accent={accent}
                    activeTab="today" onTabChange={onTabChange} />
    </div>
  );
}

function HourCurve({ hours, peakIdx, lowIdx, accent, dark, lang }) {
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
      <svg width={W} height={H + 24} viewBox={`0 0 ${W} ${H + 24}`}
           style={{ display: 'block', width: '100%' }}>
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
        <path d={pathD} fill="none" stroke={accent} strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" />
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
                  fontSize="10" textAnchor="middle" fontFamily={SANS}
                  style={{ fontVariantNumeric: 'tabular-nums' }}>
              {String(h).padStart(2, '0')}{lang === 'ko' ? '시' : ':00'}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function PeakBadge({ type, hour, energy, dark, lang }) {
  const c = type === 'peak' ? '#7BD89A' : '#E8A4B5';
  const labelKo = type === 'peak' ? '가장 맑은 시간' : '잠시 쉬어가는 시간';
  const labelEn = type === 'peak' ? 'Brightest hour' : 'Softest hour';
  return (
    <div style={{
      flex: 1, padding: '10px 12px', borderRadius: 12,
      background: `${c}1f`, border: `0.5px solid ${c}33`,
      fontFamily: SANS,
    }}>
      <div style={{ fontSize: 10, color: c, letterSpacing: 0.5, textTransform: 'uppercase',
                    fontWeight: 600, wordBreak: 'keep-all' }}>
        {lang === 'ko' ? labelKo : labelEn}
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2,
                    color: dark ? '#fff' : '#1A1538',
                    fontVariantNumeric: 'tabular-nums', letterSpacing: -0.3 }}>
        {String(hour).padStart(2, '0')}:00 · {energy}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ME SCREEN — my saju profile, four pillars, settings
// ═══════════════════════════════════════════════════════════
function MeScreen({ t, lang, dark, accent, onLang, onTabChange,
                    tweaks, setTweak, universes }) {
  const fg = dark ? '#fff' : '#1A1538';
  const sub = dark ? 'rgba(255,255,255,0.6)' : 'rgba(26,21,56,0.6)';
  const cardBg = dark
    ? 'linear-gradient(155deg, rgba(120,90,200,0.16), rgba(60,40,140,0.05))'
    : 'linear-gradient(155deg, rgba(255,255,255,0.85), rgba(240,233,255,0.6))';
  const cardBorder = `0.5px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)'}`;
  const me = ME;
  const e = ELEMENTS[me.element];

  // Mock four pillars (사주) — heavenly stems × earthly branches placeholders
  const pillars = lang === 'ko'
    ? [
        { label: '년주', sky: '계', earth: '유', kor: '계유년', el: 'metal' },
        { label: '월주', sky: '무', earth: '오', kor: '무오월', el: 'fire' },
        { label: '일주', sky: '경', earth: '인', kor: '경인일', el: 'wood' },
        { label: '시주', sky: '임', earth: '자', kor: '임자시', el: 'water' },
      ]
    : [
        { label: 'Year', sky: 'Gye', earth: 'Yu', kor: 'Gye·Yu', el: 'metal' },
        { label: 'Month', sky: 'Mu', earth: 'O', kor: 'Mu·O', el: 'fire' },
        { label: 'Day', sky: 'Gyeong', earth: 'In', kor: 'Gyeong·In', el: 'wood' },
        { label: 'Hour', sky: 'Im', earth: 'Ja', kor: 'Im·Ja', el: 'water' },
      ];

  // Element balance — pseudo distribution
  const balance = [
    { el: 'water', val: 32 },
    { el: 'wood', val: 18 },
    { el: 'fire', val: 14 },
    { el: 'earth', val: 22 },
    { el: 'metal', val: 14 },
  ];
  const totalPeople = universes.reduce((s, u) => s + (u.members?.length || 0), 0);

  const settings = lang === 'ko' ? [
    { ko: '프로필 편집', icon: 'edit' },
    { ko: '알림', icon: 'bell' },
    { ko: '데이터 백업', icon: 'cloud' },
    { ko: '도움말', icon: 'help' },
    { ko: '개인정보 처리방침', icon: 'lock' },
  ] : [
    { en: 'Edit profile', icon: 'edit' },
    { en: 'Notifications', icon: 'bell' },
    { en: 'Backup data', icon: 'cloud' },
    { en: 'Help', icon: 'help' },
    { en: 'Privacy', icon: 'lock' },
  ];

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      background: cosmicBg(dark), color: fg, overflow: 'hidden', fontFamily: SANS,
    }}>
      <StarField count={dark ? 70 : 20} seed={13} opacity={dark ? 0.5 : 0.12} />
      <div style={{ position: 'relative', height: '100%', overflow: 'auto', paddingBottom: 130 }}>
        <div style={{ height: 54 }} />
        <ScreenHeader title={lang === 'ko' ? '나' : 'Me'}
                      sub={lang === 'ko' ? '나의 사주와 결' : 'My saju & grain'}
                      lang={lang} onLangChange={onLang} dark={dark} accent={accent} />

        {/* Profile card */}
        <div style={{
          margin: '12px 16px 0', borderRadius: 28, padding: '22px 20px',
          background: cardBg, border: cardBorder,
          position: 'relative', overflow: 'hidden',
          animation: 'ctx-rise .5s ease both',
        }}>
          <StarField count={18} seed={51} opacity={dark ? 0.5 : 0.18} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
            <ElementOrb element={me.element} size={88} animated />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: accent, letterSpacing: 1.4, fontWeight: 600,
                            textTransform: 'uppercase' }}>
                {lang === 'ko' ? '본인' : 'Self'}
              </div>
              <div style={{ fontSize: 26, fontWeight: 600, color: fg, letterSpacing: -0.6,
                            wordBreak: 'keep-all', marginTop: 2 }}>
                {lang === 'ko' ? me.name_ko : me.name_en}
              </div>
              <div style={{ fontSize: 13, color: sub, marginTop: 4, wordBreak: 'keep-all' }}>
                {formatDate(parseBirth(me.birth), lang)} · {me.time}
              </div>
            </div>
          </div>

          {/* element + counts */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 8,
            marginTop: 18, position: 'relative',
          }}>
            <div style={{
              padding: '12px 14px', borderRadius: 14,
              background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.55)',
            }}>
              <div style={{ fontSize: 10, color: sub, letterSpacing: 1, fontWeight: 600,
                            textTransform: 'uppercase', wordBreak: 'keep-all' }}>
                {lang === 'ko' ? '주된 기운' : 'Element'}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: fg, marginTop: 4,
                            wordBreak: 'keep-all' }}>
                {lang === 'ko' ? e.label_ko : e.label_en}
              </div>
            </div>
            <div style={{
              padding: '12px 14px', borderRadius: 14,
              background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.55)',
            }}>
              <div style={{ fontSize: 10, color: sub, letterSpacing: 1, fontWeight: 600,
                            textTransform: 'uppercase', wordBreak: 'keep-all' }}>
                {lang === 'ko' ? '우주' : 'Universes'}
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: fg, marginTop: 4,
                            fontVariantNumeric: 'tabular-nums' }}>
                {universes.length}
              </div>
            </div>
            <div style={{
              padding: '12px 14px', borderRadius: 14,
              background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.55)',
            }}>
              <div style={{ fontSize: 10, color: sub, letterSpacing: 1, fontWeight: 600,
                            textTransform: 'uppercase', wordBreak: 'keep-all' }}>
                {lang === 'ko' ? '사람' : 'People'}
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: fg, marginTop: 4,
                            fontVariantNumeric: 'tabular-nums' }}>
                {totalPeople}
              </div>
            </div>
          </div>
        </div>

        {/* Four pillars — saju */}
        <div style={{
          margin: '14px 16px 0', borderRadius: 24, padding: '18px 16px',
          background: cardBg, border: cardBorder,
          animation: 'ctx-rise .5s ease both .05s',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                        marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: fg, letterSpacing: -0.2,
                          wordBreak: 'keep-all', whiteSpace: 'nowrap' }}>
              {lang === 'ko' ? '사주 · 네 기둥' : 'Saju · Four Pillars'}
            </div>
            <div style={{ fontSize: 11, color: sub, wordBreak: 'keep-all', whiteSpace: 'nowrap' }}>
              {lang === 'ko' ? '나를 이루는 결' : 'Your grain'}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {pillars.map((p, i) => {
              const el = ELEMENTS[p.el];
              return (
                <div key={i} style={{
                  padding: '12px 8px', borderRadius: 14,
                  background: `${el.c3}18`,
                  border: `0.5px solid ${el.c3}33`,
                  textAlign: 'center',
                  animation: `ctx-rise .5s ease both ${0.1 + i * 0.04}s`,
                }}>
                  <div style={{ fontSize: 10, color: sub, fontWeight: 600, letterSpacing: 0.5,
                                textTransform: 'uppercase', wordBreak: 'keep-all' }}>
                    {p.label}
                  </div>
                  <div style={{
                    margin: '8px auto 6px', width: 28, height: 28, borderRadius: 14,
                    background: `radial-gradient(circle at 35% 30%, ${el.c1}, ${el.c2} 65%, ${el.c3})`,
                    boxShadow: `0 2px 8px ${el.c3}55`,
                  }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: fg, letterSpacing: -0.2,
                                wordBreak: 'keep-all' }}>{p.sky}</div>
                  <div style={{ fontSize: 11, color: sub, marginTop: 2,
                                wordBreak: 'keep-all' }}>{p.earth}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Element balance */}
        <div style={{
          margin: '14px 16px 0', borderRadius: 24, padding: '18px 16px',
          background: cardBg, border: cardBorder,
          animation: 'ctx-rise .5s ease both .1s',
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: fg, letterSpacing: -0.2,
                        wordBreak: 'keep-all', marginBottom: 14 }}>
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
                  <span style={{
                    width: 10, height: 10, borderRadius: 5,
                    background: `linear-gradient(135deg, ${el.c1}, ${el.c3})`,
                  }} />
                  <span style={{ fontSize: 11, color: sub, wordBreak: 'keep-all',
                                 whiteSpace: 'nowrap' }}>
                    {lang === 'ko' ? el.label_ko.replace(' 기운', '') : el.label_en}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: fg,
                                 fontVariantNumeric: 'tabular-nums' }}>{b.val}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick toggles */}
        <div style={{
          margin: '14px 16px 0', borderRadius: 24, padding: '6px',
          background: cardBg, border: cardBorder,
          animation: 'ctx-rise .5s ease both .15s',
        }}>
          <SettingsToggle label={lang === 'ko' ? '다크 모드' : 'Dark mode'}
                          value={tweaks.darkMode}
                          onChange={v => setTweak('darkMode', v)}
                          dark={dark} accent={accent} icon="moon" />
          <SettingsDivider dark={dark} />
          <SettingsRow label={lang === 'ko' ? '언어' : 'Language'}
                       value={LANGS.find(l => l.code === lang)?.label}
                       dark={dark} icon="globe" />
        </div>

        {/* Settings list */}
        <div style={{
          margin: '14px 16px 0', borderRadius: 24, padding: '6px',
          background: cardBg, border: cardBorder,
          animation: 'ctx-rise .5s ease both .2s',
        }}>
          {settings.map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && <SettingsDivider dark={dark} />}
              <SettingsRow label={lang === 'ko' ? s.ko : s.en} dark={dark} icon={s.icon} chevron />
            </React.Fragment>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          margin: '24px 16px 0', textAlign: 'center', fontSize: 11, color: sub,
          letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 600,
        }}>
          contextella · v0.1
        </div>
      </div>

      <BottomTabBar lang={lang} dark={dark} accent={accent}
                    activeTab="me" onTabChange={onTabChange} />
    </div>
  );
}

function SettingsRow({ label, value, dark, icon, chevron }) {
  const fg = dark ? '#fff' : '#1A1538';
  const sub = dark ? 'rgba(255,255,255,0.55)' : 'rgba(26,21,56,0.55)';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 12px', minHeight: 52, fontFamily: SANS, cursor: 'pointer',
    }}>
      <SettingsIcon name={icon} color={sub} />
      <span style={{ flex: 1, fontSize: 14.5, fontWeight: 500, color: fg, letterSpacing: -0.2,
                     wordBreak: 'keep-all' }}>{label}</span>
      {value && <span style={{ fontSize: 13, color: sub, wordBreak: 'keep-all' }}>{value}</span>}
      {chevron && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={sub}
             strokeWidth="2" strokeLinecap="round">
          <path d="M9 6l6 6-6 6" />
        </svg>
      )}
    </div>
  );
}

function SettingsToggle({ label, value, onChange, dark, accent, icon }) {
  const fg = dark ? '#fff' : '#1A1538';
  const sub = dark ? 'rgba(255,255,255,0.55)' : 'rgba(26,21,56,0.55)';
  return (
    <button onClick={() => onChange(!value)} style={{
      display: 'flex', alignItems: 'center', gap: 12, width: '100%',
      padding: '14px 12px', minHeight: 52, border: 'none', background: 'transparent',
      cursor: 'pointer', fontFamily: SANS, textAlign: 'left',
    }}>
      <SettingsIcon name={icon} color={sub} />
      <span style={{ flex: 1, fontSize: 14.5, fontWeight: 500, color: fg, letterSpacing: -0.2,
                     wordBreak: 'keep-all' }}>{label}</span>
      <div style={{
        width: 42, height: 24, borderRadius: 12, position: 'relative',
        background: value ? accent : (dark ? 'rgba(255,255,255,0.15)' : 'rgba(26,21,56,0.15)'),
        transition: 'background .2s',
      }}>
        <div style={{
          position: 'absolute', top: 2, left: value ? 20 : 2,
          width: 20, height: 20, borderRadius: 10,
          background: '#fff', transition: 'left .2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }} />
      </div>
    </button>
  );
}

function SettingsDivider({ dark }) {
  return <div style={{
    height: 0.5, margin: '0 14px',
    background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(26,21,56,0.06)',
  }} />;
}

function SettingsIcon({ name, color }) {
  const props = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none',
                  stroke: color, strokeWidth: 1.8,
                  strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (name === 'moon') return <svg {...props}><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" /></svg>;
  if (name === 'globe') return (
    <svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <path d="M3 12h18" />
    </svg>
  );
  if (name === 'edit') return <svg {...props}><path d="M11 4H4v16h16v-7" /><path d="M18.5 2.5a2.1 2.1 0 113 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
  if (name === 'bell') return <svg {...props}><path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10 21a2 2 0 004 0" /></svg>;
  if (name === 'cloud') return <svg {...props}><path d="M17 18a5 5 0 100-10 7 7 0 00-13.6 2A4 4 0 005 18h12z" /></svg>;
  if (name === 'help') return <svg {...props}><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 015 0c0 1.5-2.5 2-2.5 4" /><circle cx="12" cy="17" r="0.5" fill={color} /></svg>;
  if (name === 'lock') return <svg {...props}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></svg>;
  return <svg {...props}><circle cx="12" cy="12" r="9" /></svg>;
}

Object.assign(window, {
  RelationsScreen, TodayScreen, MeScreen,
});
