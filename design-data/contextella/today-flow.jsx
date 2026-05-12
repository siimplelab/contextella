// today-flow.jsx — Daily relationship flow algorithm + UI

const { useMemo: useMemoTF } = React;

// Element interaction matrix (오행 상생/상극)
// generative (+): wood→fire→earth→metal→water→wood
// controlling (-): wood→earth, earth→water, water→fire, fire→metal, metal→wood
const ELEMENT_REL = {
  water: { generates: 'wood', controls: 'fire', generatedBy: 'metal', controlledBy: 'earth' },
  wood:  { generates: 'fire', controls: 'earth', generatedBy: 'water', controlledBy: 'metal' },
  fire:  { generates: 'earth', controls: 'metal', generatedBy: 'wood', controlledBy: 'water' },
  earth: { generates: 'metal', controls: 'water', generatedBy: 'fire', controlledBy: 'wood' },
  metal: { generates: 'water', controls: 'wood', generatedBy: 'earth', controlledBy: 'fire' },
};

// Today's "energy of the day" — pseudo from date
function todaysElement() {
  const d = new Date();
  const seed = d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate();
  const els = ['water','wood','fire','earth','metal'];
  return els[seed % 5];
}

// Compute today's flow score for a person, given their base compatibility
function flowFor(person, dayElement) {
  const rel = ELEMENT_REL[person.element];
  const base = person.score || 70;
  let mod = 0;
  if (rel.generatedBy === dayElement) mod = +14; // nourished
  else if (rel.generates === dayElement) mod = +7; // contributing
  else if (person.element === dayElement) mod = +4; // resonant
  else if (rel.controlledBy === dayElement) mod = -12; // pressured
  else if (rel.controls === dayElement) mod = -5; // strained
  // pseudo daily wobble for variety
  const wobble = ((person.id.charCodeAt(0) + new Date().getDate()) % 11) - 5;
  return Math.max(20, Math.min(98, Math.round(base * 0.55 + 30 + mod + wobble)));
}

function flowTone(score) {
  if (score >= 78) return { tone: 'bright', color: '#7BD89A',  bg: 'rgba(123,216,154,0.14)' };
  if (score >= 62) return { tone: 'steady', color: '#C9A8E8',  bg: 'rgba(201,168,232,0.14)' };
  if (score >= 48) return { tone: 'soft',   color: '#E8D4A2',  bg: 'rgba(232,212,162,0.14)' };
  return            { tone: 'careful',color: '#E8A4B5', bg: 'rgba(232,164,181,0.14)' };
}

// Build the day report across ALL universes
function buildDayReport(lang) {
  const dayEl = todaysElement();
  const all = [];
  UNIVERSES.forEach(u => {
    u.members.forEach(p => {
      all.push({ ...p, universeId: u.id, universeName_ko: u.name_ko,
                 universeName_en: u.name_en, flow: flowFor(p, dayEl) });
    });
  });
  // sort
  const bright = all.filter(p => p.flow >= 75).sort((a,b) => b.flow - a.flow).slice(0, 3);
  const careful = all.filter(p => p.flow < 55).sort((a,b) => a.flow - b.flow).slice(0, 2);
  const all_sorted = all.sort((a,b) => b.flow - a.flow);
  const avg = Math.round(all.reduce((s, p) => s + p.flow, 0) / all.length);
  return { dayElement: dayEl, all: all_sorted, bright, careful, avg, total: all.length };
}

// Headline generator
function dayHeadline(report, lang) {
  const e = ELEMENTS[report.dayElement];
  if (lang === 'ko') {
    return {
      eyebrow: `오늘의 기운 · ${e.label_ko}`,
      title: report.avg >= 70
        ? '관계의 결이 부드럽게 흐르는 하루'
        : report.avg >= 55
          ? '잔잔한 결, 조심스러운 흐름'
          : '쉬어가도 좋은 하루',
      body: report.bright.length > 0
        ? `${report.bright[0].name_ko}님과의 결이 가장 잘 맞아요${
            report.careful.length > 0
              ? `. ${report.careful[0].name_ko}님과는 한 발자국 거리를 두세요.`
              : '.'
          }`
        : '오늘은 나의 결을 들여다보기 좋은 하루입니다.',
    };
  }
  return {
    eyebrow: `Today\u2019s energy · ${e.label_en}`,
    title: report.avg >= 70 ? 'A day of soft, flowing connection'
         : report.avg >= 55 ? 'Quiet currents, soft caution'
         : 'A day to breathe and rest',
    body: report.bright.length > 0
      ? `Your grain aligns best with ${report.bright[0].name_en}${
          report.careful.length > 0
            ? `. With ${report.careful[0].name_en}, leave a step of space.`
            : '.'
        }`
      : 'A good day to listen to your own current.',
  };
}

// ─── Today's Flow card (replaces simple aura body) ─────────
function TodaysFlowCard({ lang, dark, accent, onPersonClick }) {
  const report = useMemoTF(() => buildDayReport(lang), [lang, new Date().toDateString()]);
  const headline = dayHeadline(report, lang);
  const fg = dark ? '#fff' : '#1A1538';
  const sub = dark ? 'rgba(255,255,255,0.6)' : 'rgba(26,21,56,0.6)';
  const dimBg = dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.5)';
  const elColors = ELEMENTS[report.dayElement];

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

      {/* Eyebrow + day orb */}
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

      {/* Flow summary stat strip */}
      <div style={{
        marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
        position: 'relative',
      }}>
        {[
          { label: lang === 'ko' ? '평균 결' : 'Avg flow', value: report.avg,
            color: flowTone(report.avg).color },
          { label: lang === 'ko' ? '잘 맞아요' : 'In flow', value: report.bright.length,
            color: '#7BD89A' },
          { label: lang === 'ko' ? '조심해요' : 'Tread soft', value: report.careful.length,
            color: '#E8A4B5' },
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

      {/* Bright connections */}
      {report.bright.length > 0 && (
        <div style={{ marginTop: 16, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: '#7BD89A' }} />
            <span style={{ fontSize: 11, color: sub, fontWeight: 600, letterSpacing: 1,
                           textTransform: 'uppercase', wordBreak: 'keep-all', whiteSpace: 'nowrap' }}>
              {lang === 'ko' ? '오늘 잘 맞는 결' : 'Today\u2019s bright currents'}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {report.bright.map(p => (
              <FlowRow key={p.id} person={p} dark={dark} accent={accent} lang={lang}
                       onClick={() => onPersonClick && onPersonClick(p.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Careful connections */}
      {report.careful.length > 0 && (
        <div style={{ marginTop: 14, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: '#E8A4B5' }} />
            <span style={{ fontSize: 11, color: sub, fontWeight: 600, letterSpacing: 1,
                           textTransform: 'uppercase' }}>
              {lang === 'ko' ? '한 발 거리를 둘 결' : 'Step softly'}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {report.careful.map(p => (
              <FlowRow key={p.id} person={p} dark={dark} accent={accent} lang={lang}
                       onClick={() => onPersonClick && onPersonClick(p.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Flow row — person with mini horizontal flow bar
function FlowRow({ person, dark, accent, lang, onClick }) {
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
      {/* avatar */}
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
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap',
                      wordBreak: 'keep-all', overflowWrap: 'normal' }}>
          <span style={{ fontSize: 14.5, fontWeight: 600, color: fg, letterSpacing: -0.3,
                         wordBreak: 'keep-all', whiteSpace: 'nowrap' }}>
            {lang === 'ko' ? person.name_ko : person.name_en}
          </span>
          <span style={{ fontSize: 11, color: sub, wordBreak: 'keep-all', whiteSpace: 'nowrap' }}>
            · {lang === 'ko' ? person.universeName_ko : person.universeName_en}
          </span>
        </div>
        {/* mini flow bar */}
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
          {lang === 'ko'
            ? (tone.tone === 'bright' ? '맑음' : tone.tone === 'steady' ? '평온'
               : tone.tone === 'soft' ? '잔잔' : '주의')
            : tone.tone}
        </span>
      </div>
    </button>
  );
}

Object.assign(window, {
  ELEMENT_REL, todaysElement, flowFor, flowTone, buildDayReport, dayHeadline,
  TodaysFlowCard, FlowRow,
});
