// screens.jsx — Dashboard, AddPerson, Result
// Sans-serif only (Pretendard). Multiple universes. Animated.

const { useState, useEffect, useRef } = React;

// ─── shared style helpers ───────────────────────────────────
const cosmicBg = (dark) => dark
  ? 'radial-gradient(ellipse 90% 60% at 50% 0%, #2A1F5E 0%, #16103A 38%, #0B0824 78%, #050415 100%)'
  : 'radial-gradient(ellipse 90% 60% at 50% 0%, #F0E9FF 0%, #E1D6F8 38%, #D6C7EC 78%, #C9B6E0 100%)';

const SANS = "'Pretendard Variable', Pretendard, -apple-system, system-ui, 'Apple SD Gothic Neo', sans-serif";

// inject keyframes once
function injectKeyframes() {
  if (document.getElementById('ctx-kf')) return;
  const s = document.createElement('style');
  s.id = 'ctx-kf';
  s.textContent = `
    @keyframes ctx-rise { from { opacity:0.001; transform: translateY(14px) } to { opacity:1; transform:translateY(0) } }
    @keyframes ctx-fade { from { opacity:0.001 } to { opacity:1 } }
    @keyframes ctx-pulse { 0%{transform:scale(1);opacity:.55} 60%{transform:scale(1.7);opacity:0} 100%{opacity:0} }
    @keyframes ctx-orbit { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
    @keyframes ctx-spin { to { transform: rotate(360deg) } }
    @keyframes ctx-line-draw { from { stroke-dashoffset: 240 } to { stroke-dashoffset: 0 } }
    @keyframes ctx-pop { 0%{transform:scale(.4);opacity:0} 60%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
    @keyframes ctx-shimmer {
      0%{background-position:-200% 0} 100%{background-position:200% 0}
    }
  `;
  document.head.appendChild(s);
}
injectKeyframes();

const pillBtn = (dark) => ({
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  minWidth: 44, height: 44, padding: '0 10px',
  borderRadius: 22,
  background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.55)',
  border: `0.5px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)'}`,
  cursor: 'pointer', color: 'inherit',
  fontFamily: SANS,
});

function shade(hex, pct) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, ((n >> 16) & 0xff) + Math.round(255 * pct / 100)));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + Math.round(255 * pct / 100)));
  const b = Math.max(0, Math.min(255, (n & 0xff) + Math.round(255 * pct / 100)));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

// ─── Top header (globe icon only) ──────────────────────────
function AppHeader({ lang, onLangChange, accent, dark }) {
  const [open, setOpen] = useState(false);
  const fg = dark ? '#fff' : '#1A1538';
  return (
    <div style={{ padding: '0 20px 4px', position: 'relative', fontFamily: SANS }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 44 }}>
        <div style={{
          fontSize: 19, fontWeight: 600, letterSpacing: -0.4,
          color: accent,
        }}>contextella</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setOpen(o => !o)} style={pillBtn(dark)} aria-label="Language">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <ellipse cx="12" cy="12" rx="4" ry="9" />
              <path d="M3 12h18" />
            </svg>
          </button>
          <button style={pillBtn(dark)} aria-label="notifications">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10 21a2 2 0 004 0" />
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <div style={{
          position: 'absolute', right: 20, top: 48, zIndex: 30,
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
              <span>{l.label}</span>
              {l.code === lang && <span style={{ color: accent, fontSize: 14 }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── My Aura card ──────────────────────────────────────────
function MyAuraCardCompact({ t, lang, dark, accent }) {
  const fg = dark ? '#fff' : '#1A1538';
  const sub = dark ? 'rgba(255,255,255,0.6)' : 'rgba(26,21,56,0.6)';
  return (
    <div style={{
      margin: '12px 16px 0', borderRadius: 22, padding: '14px 18px',
      background: dark
        ? 'linear-gradient(155deg, rgba(120,90,200,0.10), rgba(60,40,140,0.04))'
        : 'linear-gradient(155deg, rgba(255,255,255,0.7), rgba(240,233,255,0.5))',
      border: `0.5px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)'}`,
      display: 'flex', alignItems: 'center', gap: 14, fontFamily: SANS,
      animation: 'ctx-rise .55s cubic-bezier(.22,.7,.3,1) both',
    }}>
      <ElementOrb element={ME.element} size={48} animated />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase',
                      color: accent, fontWeight: 600 }}>
          {lang === 'ko' ? '나의 기운' : 'My Aura'}
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, color: fg, letterSpacing: -0.4, marginTop: 2 }}>
          {t.elementWater}
        </div>
        <div style={{ fontSize: 12, color: sub, marginTop: 2, lineHeight: 1.4 }}>
          {t.elementWaterPoetic}
        </div>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={sub} strokeWidth="2"
           strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 6l6 6-6 6" />
      </svg>
    </div>
  );
}

function MyAuraCard({ t, lang, dark, accent }) {
  const e = ELEMENTS[ME.element];
  const fg = dark ? '#fff' : '#1A1538';
  const sub = dark ? 'rgba(255,255,255,0.6)' : 'rgba(26,21,56,0.6)';
  return (
    <div style={{
      margin: '8px 16px 0', borderRadius: 28, padding: '24px 22px',
      background: dark
        ? 'linear-gradient(155deg, rgba(120,90,200,0.18), rgba(60,40,140,0.08))'
        : 'linear-gradient(155deg, rgba(255,255,255,0.85), rgba(240,233,255,0.6))',
      border: `0.5px solid ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.7)'}`,
      backdropFilter: 'blur(24px)',
      position: 'relative', overflow: 'hidden',
      animation: 'ctx-rise .55s cubic-bezier(.22,.7,.3,1) both',
      fontFamily: SANS,
    }}>
      <StarField count={20} seed={11} opacity={dark ? 0.5 : 0.2} />
      <div style={{ display: 'flex', gap: 18, alignItems: 'center', position: 'relative' }}>
        <ElementOrb element={ME.element} size={88} animated />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
                        color: accent, marginBottom: 4, fontWeight: 600 }}>
            {lang === 'ko' ? '나의 기운' : 'My Aura'}
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, color: fg, letterSpacing: -0.5, lineHeight: 1.2 }}>
            {t.elementWater}
          </div>
          <div style={{ fontSize: 14, color: sub, marginTop: 6, lineHeight: 1.45, letterSpacing: -0.2 }}>
            {t.elementWaterPoetic}
          </div>
        </div>
      </div>
      <div style={{
        marginTop: 18, paddingTop: 16, position: 'relative',
        borderTop: `0.5px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(26,21,56,0.08)'}`,
      }}>
        <div style={{ fontSize: 12, color: sub, marginBottom: 6, letterSpacing: 0.3 }}>
          {t.todaysVibe} · {formatDate(new Date(), lang)}
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.55, color: fg, letterSpacing: -0.2 }}>
          {t.todaysVibeBody}
        </div>
      </div>
    </div>
  );
}

// ─── Universe tabs ─────────────────────────────────────────
function UniverseTabs({ universes, activeId, onChange, accent, dark, lang }) {
  const fg = dark ? '#fff' : '#1A1538';
  const sub = dark ? 'rgba(255,255,255,0.55)' : 'rgba(26,21,56,0.55)';
  return (
    <div style={{
      display: 'flex', gap: 8, padding: '0 18px', overflowX: 'auto',
      scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
      fontFamily: SANS,
    }}>
      <style>{`.ctx-tabs::-webkit-scrollbar{display:none}`}</style>
      {universes.map(u => {
        const active = u.id === activeId;
        return (
          <button key={u.id} onClick={() => onChange(u.id)}
                  style={{
                    minHeight: 38, padding: '0 16px', borderRadius: 19,
                    background: active
                      ? (dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.85)')
                      : 'transparent',
                    border: `0.5px solid ${active
                      ? (dark ? 'rgba(255,255,255,0.18)' : 'rgba(26,21,56,0.10)')
                      : (dark ? 'rgba(255,255,255,0.10)' : 'rgba(26,21,56,0.10)')}`,
                    color: active ? fg : sub,
                    fontSize: 14, fontWeight: active ? 600 : 500,
                    letterSpacing: -0.2, cursor: 'pointer',
                    whiteSpace: 'nowrap', flexShrink: 0,
                    display: 'flex', alignItems: 'center', gap: 8,
                    transition: 'all .25s',
                    fontFamily: SANS,
                  }}>
            <span style={{
              width: 7, height: 7, borderRadius: 4,
              background: active ? accent : (dark ? 'rgba(255,255,255,0.25)' : 'rgba(26,21,56,0.2)'),
              boxShadow: active ? `0 0 8px ${accent}` : 'none',
            }} />
            <span>{lang === 'ko' ? u.name_ko : u.name_en}</span>
            <span style={{
              fontSize: 11, color: active ? accent : sub,
              fontVariantNumeric: 'tabular-nums', fontWeight: 600,
            }}>{u.members.length}</span>
          </button>
        );
      })}
      <button onClick={() => onChange('__add')}
              style={{
                minHeight: 38, width: 38, borderRadius: 19,
                background: 'transparent',
                border: `0.5px dashed ${dark ? 'rgba(255,255,255,0.20)' : 'rgba(26,21,56,0.18)'}`,
                color: sub, cursor: 'pointer', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, lineHeight: 1, fontFamily: SANS,
              }} aria-label={lang === 'ko' ? '우주 추가' : 'Add universe'}>+</button>
    </div>
  );
}

// ─── Universe section ──────────────────────────────────────
function UniverseSection({ t, lang, dark, accent, vizStyle, universes, activeUniverseId,
                           setActiveUniverseId, onSelect, selectedId }) {
  const fg = dark ? '#fff' : '#1A1538';
  const sub = dark ? 'rgba(255,255,255,0.55)' : 'rgba(26,21,56,0.6)';
  const universe = universes.find(u => u.id === activeUniverseId) || universes[0];
  const network = [ME, ...universe.members];

  return (
    <div style={{ margin: '24px 0 0', fontFamily: SANS }}>
      <div style={{ padding: '0 22px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 600, color: fg, letterSpacing: -0.5 }}>
            {t.myUniverse}
          </div>
          <div style={{ fontSize: 13, color: sub, marginTop: 2 }}>
            {typeof t.myUniverseSub === 'function' ? t.myUniverseSub(universe.members.length) : t.myUniverseSub}
          </div>
        </div>
        <div style={{ fontSize: 12, color: accent, letterSpacing: 0.3, fontWeight: 500 }}>
          {formatDate(new Date(), lang).replace(/(.+\d{4}).*/, '$1') /* keep concise */}
        </div>
      </div>
      <div style={{ marginTop: 14 }}>
        <UniverseTabs universes={universes} activeId={activeUniverseId}
                      onChange={(id) => { if (id !== '__add') setActiveUniverseId(id); }}
                      accent={accent} dark={dark} lang={lang} />
      </div>
      <div key={activeUniverseId} style={{ marginTop: 12, padding: '0 8px',
                                            animation: 'ctx-fade .35s ease both' }}>
        {vizStyle === 'constellation' && (
          <ConstellationViz network={network} width={358} height={320}
                            accent={accent} onSelect={onSelect} selectedId={selectedId} />
        )}
        {vizStyle === 'orbital' && (
          <OrbitalViz network={network} width={358} height={320}
                      accent={accent} onSelect={onSelect} selectedId={selectedId} />
        )}
        {vizStyle === 'grid' && (
          <div style={{ padding: '12px 12px 0' }}>
            <GridViz network={network} accent={accent}
                     onSelect={onSelect} selectedId={selectedId} lang={lang} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Floating add button (no duplicate +) ──────────────────
function FloatingAddBtn({ onClick, accent, label }) {
  return (
    <button onClick={onClick} style={{
      position: 'absolute', bottom: 100, right: 20, zIndex: 40,
      height: 56, padding: '0 22px 0 18px',
      borderRadius: 28,
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

// ─── Bottom tab bar ────────────────────────────────────────
function BottomTabBar({ lang, dark, accent, activeTab, onTabChange }) {
  const dim = dark ? 'rgba(255,255,255,0.45)' : 'rgba(26,21,56,0.45)';
  const tabs = [
    { id: 'home', ko: '홈', en: 'Home',
      icon: <path d="M3 11l9-8 9 8v10a2 2 0 01-2 2h-4v-7h-6v7H5a2 2 0 01-2-2V11z" /> },
    { id: 'rel', ko: '관계', en: 'Relations',
      icon: <><circle cx="9" cy="8" r="3.5"/><circle cx="17" cy="11" r="2.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M15 20c0-2 1.3-4 4-4"/></> },
    { id: 'today', ko: '오늘', en: 'Today',
      icon: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></> },
    { id: 'me', ko: '나', en: 'Me',
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
            <button key={tab.id} onClick={() => onTabChange && onTabChange(tab.id)} style={{
              minWidth: 48, minHeight: 48, padding: '6px 10px', border: 'none',
              background: 'transparent', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              color: active ? accent : dim, fontFamily: SANS,
              transition: 'color .2s',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth={active ? 2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
                {tab.icon}
              </svg>
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 600, letterSpacing: 0.2,
                             whiteSpace: 'nowrap', wordBreak: 'keep-all' }}>
                {lang === 'ko' ? tab.ko : tab.en}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── DASHBOARD ─────────────────────────────────────────────
function DashboardScreen({ t, lang, dark, accent, vizStyle, onLang, onAdd, onAddUniverse,
                          onSelectPerson, selectedId, universes, activeUniverseId, setActiveUniverseId,
                          onTabChange }) {
  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      background: cosmicBg(dark), color: dark ? '#fff' : '#1A1538',
      overflow: 'hidden', fontFamily: SANS,
    }}>
      <StarField count={dark ? 80 : 30} seed={5} opacity={dark ? 0.65 : 0.15} />
      <div style={{ position: 'relative', height: '100%', overflow: 'auto', paddingBottom: 140 }}>
        <div style={{ height: 54 }} />{/* status bar spacer */}
        <AppHeader lang={lang} onLangChange={onLang} accent={accent} dark={dark} />
        <div style={{ padding: '12px 22px 8px', animation: 'ctx-rise .45s ease both' }}>
          <div style={{
            fontSize: 26, fontWeight: 600, letterSpacing: -0.7,
            color: dark ? '#fff' : '#1A1538', lineHeight: 1.25, whiteSpace: 'pre-line',
          }}>
            {lang === 'ko' ? '안녕,\n오늘의 결을 살펴볼까요' : 'Hello,\nshall we read today\u2019s grain'}
          </div>
        </div>
        <TodaysFlowCard lang={lang} dark={dark} accent={accent}
                        onPersonClick={onSelectPerson} />
        <MyAuraCardCompact t={t} lang={lang} dark={dark} accent={accent} />
        <UniverseSection t={t} lang={lang} dark={dark} accent={accent}
                         vizStyle={vizStyle}
                         universes={universes}
                         activeUniverseId={activeUniverseId}
                         setActiveUniverseId={setActiveUniverseId}
                         onSelect={onSelectPerson} selectedId={selectedId} />
      </div>
      <FloatingAddBtn onClick={onAdd} accent={accent}
                      label={lang === 'ko' ? '사람 추가' : 'Add person'} />
      <BottomTabBar lang={lang} dark={dark} accent={accent}
                    activeTab="home" onTabChange={onTabChange} />
    </div>
  );
}

// ─── ADD PERSON BOTTOM SHEET ───────────────────────────────
function AddPersonSheet({ t, lang, dark, accent, open, onClose, onSave, universes, activeUniverseId }) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [universe, setUniverse] = useState(activeUniverseId);
  const [relation, setRelation] = useState('partner');
  const [gender, setGender] = useState('f');
  const [year, setYear] = useState('1994');
  const [month, setMonth] = useState('11');
  const [day, setDay] = useState('02');
  const [hour, setHour] = useState('09');
  const [min, setMin] = useState('15');
  const [unknown, setUnknown] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setUniverse(activeUniverseId); }, [activeUniverseId, open]);

  const fg = dark ? '#fff' : '#1A1538';
  const sub = dark ? 'rgba(255,255,255,0.6)' : 'rgba(26,21,56,0.6)';
  const fieldBg = dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)';
  const fieldBorder = dark ? 'rgba(255,255,255,0.10)' : 'rgba(26,21,56,0.10)';

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); onSave(universe); }, 1200);
  };

  const seg = (label, value, options, setter) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 13, color: sub, marginBottom: 8, letterSpacing: 0.2, fontWeight: 500 }}>{label}</div>
      <div style={{
        display: 'grid', gridTemplateColumns: `repeat(${options.length}, 1fr)`, gap: 6,
        padding: 4, borderRadius: 14, background: fieldBg,
        border: `0.5px solid ${fieldBorder}`,
      }}>
        {options.map(o => {
          const active = value === o.v;
          return (
            <button key={o.v} onClick={() => setter(o.v)} style={{
              minHeight: 44, border: 'none', borderRadius: 10, cursor: 'pointer',
              background: active
                ? (dark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,1)')
                : 'transparent',
              boxShadow: active ? '0 1px 4px rgba(0,0,0,0.18)' : 'none',
              color: active ? (dark ? accent : '#1A1538') : sub,
              fontSize: 14, fontWeight: active ? 600 : 500, letterSpacing: -0.2,
              fontFamily: SANS, transition: 'all .15s',
            }}>{o.label}</button>
          );
        })}
      </div>
    </div>
  );

  const numField = (val, setter, max, ph, w = 'auto') => (
    <input value={val} onChange={e => setter(e.target.value.replace(/\D/g, '').slice(0, String(max).length))}
           placeholder={ph}
           style={{
             flex: w === 'auto' ? 1 : undefined, width: w !== 'auto' ? w : undefined,
             minHeight: 56, padding: '0 14px', borderRadius: 14,
             background: fieldBg, border: `0.5px solid ${fieldBorder}`,
             color: fg, fontSize: 18, fontWeight: 500,
             textAlign: 'center', letterSpacing: 0.5,
             fontVariantNumeric: 'tabular-nums', outline: 'none',
             fontFamily: SANS,
           }} />
  );

  // Live preview of formatted date
  const datePreview = () => {
    const y = parseInt(year, 10), m = parseInt(month, 10), d = parseInt(day, 10);
    if (!y || !m || !d) return '';
    return formatDate(new Date(y, m - 1, d), lang);
  };

  return (
    <>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, zIndex: 100,
        background: 'rgba(8,5,24,0.55)',
        backdropFilter: 'blur(8px)',
        opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity 0.3s',
      }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 101,
        background: dark
          ? 'linear-gradient(180deg, #1F1648 0%, #150F38 100%)'
          : 'linear-gradient(180deg, #FFFFFF 0%, #F4EEFF 100%)',
        borderTopLeftRadius: 32, borderTopRightRadius: 32,
        border: `0.5px solid ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(26,21,56,0.06)'}`,
        boxShadow: '0 -20px 60px rgba(0,0,0,0.5)',
        padding: '12px 20px 28px', maxHeight: '92%', overflow: 'auto',
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.4s cubic-bezier(0.3, 0.8, 0.4, 1)',
        fontFamily: SANS,
      }}>
        <div style={{
          width: 38, height: 4, borderRadius: 2,
          background: dark ? 'rgba(255,255,255,0.25)' : 'rgba(26,21,56,0.18)',
          margin: '4px auto 18px',
        }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 600, color: fg, letterSpacing: -0.5 }}>
              {t.addTitle}
            </div>
            <div style={{ fontSize: 13, color: sub, marginTop: 4, letterSpacing: -0.1 }}>
              {t.addSubtitle}
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: 18, border: 'none', cursor: 'pointer',
            background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(26,21,56,0.06)',
            color: fg, fontSize: 18, lineHeight: 1, fontFamily: SANS,
          }}>×</button>
        </div>

        {/* Universe selection */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 13, color: sub, marginBottom: 8, letterSpacing: 0.2, fontWeight: 500 }}>
            {lang === 'ko' ? '어느 우주에' : 'Which universe'}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {universes.map(u => {
              const active = u.id === universe;
              return (
                <button key={u.id} onClick={() => setUniverse(u.id)} style={{
                  minHeight: 44, padding: '0 16px', borderRadius: 14,
                  background: active
                    ? (dark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,1)')
                    : fieldBg,
                  border: `0.5px solid ${active ? accent : fieldBorder}`,
                  color: active ? (dark ? accent : '#1A1538') : sub,
                  fontSize: 14, fontWeight: active ? 600 : 500, letterSpacing: -0.2,
                  cursor: 'pointer', fontFamily: SANS, transition: 'all .15s',
                }}>{lang === 'ko' ? u.name_ko : u.name_en}</button>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 13, color: sub, marginBottom: 8, letterSpacing: 0.2, fontWeight: 500 }}>
            {t.name}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => {
              const pool = ['💖','🌊','🌸','🌳','🌶','🦋','💼','🎨','📚','🌙','☀️','🍀','🐱','🐶','✨','🌈','🍷','⚡️','🎵','🪐'];
              setEmoji(pool[Math.floor(Math.random() * pool.length)]);
            }} style={{
              minHeight: 56, minWidth: 56, borderRadius: 14,
              background: emoji ? `${accent}22` : fieldBg,
              border: `0.5px solid ${emoji ? accent : fieldBorder}`,
              fontSize: emoji ? 26 : 22, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: emoji ? '' : sub, fontFamily: SANS,
              transition: 'all .2s',
            }} aria-label={lang === 'ko' ? '이모지 선택 (선택사항)' : 'Pick emoji (optional)'}>
              {emoji || '☺︎'}
            </button>
            <input value={name} onChange={e => setName(e.target.value)}
                   placeholder={t.namePlaceholder}
                   style={{
                     flex: 1, minHeight: 56, padding: '0 18px', borderRadius: 14,
                     background: fieldBg, border: `0.5px solid ${fieldBorder}`,
                     color: fg, fontSize: 17, letterSpacing: -0.2, outline: 'none',
                     boxSizing: 'border-box', fontFamily: SANS,
                   }} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {['💖','🌊','🌸','🌳','🌶','🦋','💼','🎨','📚','🌙','☀️','🍀','🐱','✨','🪐'].map(em => (
              <button key={em} onClick={() => setEmoji(em === emoji ? '' : em)}
                      style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: em === emoji ? `${accent}33` : 'transparent',
                        border: `0.5px solid ${em === emoji ? accent : fieldBorder}`,
                        fontSize: 18, cursor: 'pointer', fontFamily: SANS,
                      }}>{em}</button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: sub, marginTop: 6, letterSpacing: 0.2 }}>
            {lang === 'ko' ? '이모지를 선택하면 우주에서 이모지로 표시돼요 (선택)' : 'Optional — shown in your universe instead of initials'}
          </div>
        </div>

        {seg(t.relation, relation, [
          { v: 'family', label: t.relationFamily },
          { v: 'partner', label: t.relationPartner },
          { v: 'friend', label: t.relationFriend },
          { v: 'colleague', label: t.relationColleague },
        ], setRelation)}

        {seg(t.gender, gender, [
          { v: 'f', label: t.genderF },
          { v: 'm', label: t.genderM },
          { v: 'o', label: t.genderO },
        ], setGender)}

        <div style={{ marginBottom: 18 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8,
          }}>
            <div style={{ fontSize: 13, color: sub, letterSpacing: 0.2, fontWeight: 500 }}>
              {t.birthDate}
            </div>
            <div style={{ fontSize: 12, color: accent, letterSpacing: -0.1 }}>{datePreview()}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {numField(year, setYear, 9999, lang === 'ko' ? '연도' : 'YYYY')}
            {numField(month, setMonth, 12, lang === 'ko' ? '월' : 'MM', 80)}
            {numField(day, setDay, 31, lang === 'ko' ? '일' : 'DD', 80)}
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 13, color: sub, letterSpacing: 0.2, fontWeight: 500 }}>
              {t.birthTime}
            </div>
            <button onClick={() => setUnknown(u => !u)} style={{
              display: 'flex', alignItems: 'center', gap: 8, border: 'none', cursor: 'pointer',
              background: 'transparent', color: unknown ? accent : sub, fontSize: 13, fontWeight: 500,
              fontFamily: SANS,
            }}>
              <div style={{
                width: 38, height: 22, borderRadius: 11, position: 'relative',
                background: unknown ? accent : (dark ? 'rgba(255,255,255,0.15)' : 'rgba(26,21,56,0.15)'),
                transition: 'background 0.2s',
              }}>
                <div style={{
                  position: 'absolute', top: 2, left: unknown ? 18 : 2,
                  width: 18, height: 18, borderRadius: 9,
                  background: '#fff', transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }} />
              </div>
              <span>{t.timeUnknown}</span>
            </button>
          </div>
          {!unknown ? (
            <div style={{ display: 'flex', gap: 8 }}>
              {numField(hour, setHour, 23, lang === 'ko' ? '시' : 'HH', 110)}
              <div style={{ alignSelf: 'center', color: sub, fontSize: 18, fontWeight: 500 }}>:</div>
              {numField(min, setMin, 59, lang === 'ko' ? '분' : 'MM', 110)}
            </div>
          ) : (
            <div style={{
              padding: '14px 16px', borderRadius: 14,
              background: `${accent}1a`,
              border: `0.5px solid ${accent}40`,
              fontSize: 13, color: dark ? '#fff' : '#1A1538', lineHeight: 1.5,
              fontFamily: SANS,
            }}>{t.timeUnknownHint}</div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button onClick={onClose} style={{
            flex: 1, minHeight: 56, borderRadius: 16, border: 'none', cursor: 'pointer',
            background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(26,21,56,0.06)',
            color: fg, fontSize: 16, fontWeight: 500, letterSpacing: -0.2, fontFamily: SANS,
          }}>{t.cancel}</button>
          <button onClick={handleSave} disabled={saving} style={{
            flex: 2, minHeight: 56, borderRadius: 16, border: 'none', cursor: saving ? 'wait' : 'pointer',
            background: saving
              ? `linear-gradient(90deg, ${accent}, ${shade(accent, -10)}, ${accent})`
              : `linear-gradient(135deg, ${accent}, ${shade(accent, -15)})`,
            backgroundSize: saving ? '200% 100%' : '100% 100%',
            animation: saving ? 'ctx-shimmer 1.4s linear infinite' : 'none',
            color: '#1A1538', fontSize: 16, fontWeight: 600, letterSpacing: -0.2,
            boxShadow: `0 8px 20px ${accent}55`, fontFamily: SANS,
          }}>{saving ? t.saving : t.save}</button>
        </div>
      </div>
    </>
  );
}

// ─── New universe sheet (small) ────────────────────────────
function NewUniverseSheet({ open, onClose, onSave, dark, accent, lang }) {
  const [name, setName] = useState('');
  const fg = dark ? '#fff' : '#1A1538';
  const sub = dark ? 'rgba(255,255,255,0.6)' : 'rgba(26,21,56,0.6)';
  const fieldBg = dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)';
  const fieldBorder = dark ? 'rgba(255,255,255,0.10)' : 'rgba(26,21,56,0.10)';
  return (
    <>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, zIndex: 100,
        background: 'rgba(8,5,24,0.55)', backdropFilter: 'blur(8px)',
        opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity 0.3s',
      }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 101,
        background: dark
          ? 'linear-gradient(180deg, #1F1648 0%, #150F38 100%)'
          : 'linear-gradient(180deg, #FFFFFF 0%, #F4EEFF 100%)',
        borderTopLeftRadius: 32, borderTopRightRadius: 32,
        padding: '12px 20px 28px',
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.4s cubic-bezier(0.3, 0.8, 0.4, 1)',
        fontFamily: SANS,
      }}>
        <div style={{
          width: 38, height: 4, borderRadius: 2,
          background: dark ? 'rgba(255,255,255,0.25)' : 'rgba(26,21,56,0.18)',
          margin: '4px auto 18px',
        }} />
        <div style={{ fontSize: 22, fontWeight: 600, color: fg, letterSpacing: -0.5 }}>
          {lang === 'ko' ? '새 우주 만들기' : 'New universe'}
        </div>
        <div style={{ fontSize: 13, color: sub, marginTop: 4, marginBottom: 16 }}>
          {lang === 'ko' ? '관계의 묶음에 이름을 붙여보세요' : 'Name a circle of people'}
        </div>
        <input value={name} onChange={e => setName(e.target.value)}
               placeholder={lang === 'ko' ? '예) 동아리, 운동 모임' : 'e.g. Book club, Gym crew'}
               style={{
                 width: '100%', minHeight: 56, padding: '0 18px', borderRadius: 14,
                 background: fieldBg, border: `0.5px solid ${fieldBorder}`,
                 color: fg, fontSize: 17, outline: 'none', boxSizing: 'border-box',
                 fontFamily: SANS,
               }} />
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button onClick={onClose} style={{
            flex: 1, minHeight: 56, borderRadius: 16, border: 'none', cursor: 'pointer',
            background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(26,21,56,0.06)',
            color: fg, fontSize: 16, fontWeight: 500, fontFamily: SANS,
          }}>{lang === 'ko' ? '취소' : 'Cancel'}</button>
          <button onClick={() => { if (name.trim()) onSave(name.trim()); }} style={{
            flex: 2, minHeight: 56, borderRadius: 16, border: 'none', cursor: 'pointer',
            background: `linear-gradient(135deg, ${accent}, ${shade(accent, -15)})`,
            color: '#1A1538', fontSize: 16, fontWeight: 600, fontFamily: SANS,
            boxShadow: `0 8px 20px ${accent}55`,
          }}>{lang === 'ko' ? '만들기' : 'Create'}</button>
        </div>
      </div>
    </>
  );
}

// ─── RESULT SCREEN ─────────────────────────────────────────
function ResultScreen({ t, lang, dark, accent, gaugeStyle, person, onBack }) {
  if (!person) return null;
  const eMe = ELEMENTS[ME.element];
  const eOther = ELEMENTS[person.element];
  const score = person.score || 75;
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
    'Both find ease in each other\u2019s silence',
    'New paths reveal themselves together',
  ];
  const conflicts = lang === 'ko' ? [
    '결정의 속도가 서로 다를 수 있어요',
    '감정이 가라앉을 때 함께 가라앉지 마세요',
  ] : [
    'You may move at different speeds',
    'When one sinks, the other must stay afloat',
  ];

  const stagger = (i) => ({ animation: `ctx-rise .5s cubic-bezier(.22,.7,.3,1) both ${0.05 + i * 0.07}s` });

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
          <button onClick={onBack} style={{ ...pillBtn(dark), gap: 6, paddingRight: 16, color: fg }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{lang === 'ko' ? '우주' : 'Universe'}</span>
          </button>
          <div style={{ fontSize: 13, color: sub, letterSpacing: 0.5, fontWeight: 500 }}>{t.resultTitle}</div>
          <button style={{ ...pillBtn(dark), color: fg }} aria-label="share">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
              <polyline points="16 6 12 2 8 6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
          </button>
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
          <div style={{
            fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
            color: accent, fontWeight: 600, marginBottom: 14,
          }}>{t.compatScore}</div>
          {gaugeStyle === 'gauge' && (
            <CompatGauge score={score} accent={accent} label={t.compatLabel(score)} size={200} />
          )}
          {gaugeStyle === 'stars' && (
            <CompatStars score={score} accent={accent} label={t.compatLabel(score)} size={200} />
          )}
          {gaugeStyle === 'merge' && (
            <CompatMerge score={score} accent={accent} label={t.compatLabel(score)} size={200}
                         elementA={ME.element} elementB={person.element} />
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
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
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
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14,
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
              <ElementOrb element={ME.element} size={36} animated />
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
            <div style={{
              fontSize: 17, color: fg, lineHeight: 1.55, letterSpacing: -0.2, fontWeight: 500,
            }}>
              {lang === 'ko'
                ? '같은 하늘 아래, 서로 다른 시간을 흐르는 두 강. 오늘 잠시 같은 풍경을 비춥니다.'
                : 'Two rivers beneath the same sky, flowing through different hours \u2014 today, briefly mirroring the same view.'}
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

Object.assign(window, {
  DashboardScreen, AddPersonSheet, NewUniverseSheet, ResultScreen,
  BottomTabBar, FloatingAddBtn, cosmicBg, SANS, pillBtn, shade,
});
