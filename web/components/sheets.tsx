'use client';
import React, { useEffect, useState } from 'react';
import { SANS, formatDate, shade } from '@/lib/tokens';
import { I18N } from '@/lib/i18n';
import { useStore, accentHex } from '@/lib/store';
import type { Person, ElementKey } from '@/lib/types';

const ELEMENT_POOL: ElementKey[] = ['water', 'fire', 'wood', 'metal', 'earth'];

export function AddPersonSheet({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved?: (id: string) => void }) {
  const lang = useStore(s => s.lang);
  const dark = useStore(s => s.tweaks.darkMode);
  const accent = accentHex(useStore(s => s.tweaks.accent));
  const universes = useStore(s => s.universes);
  const activeUniverseId = useStore(s => s.activeUniverseId);
  const addPerson = useStore(s => s.addPerson);
  const t = I18N[lang];

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
    setTimeout(() => {
      const id = 'p' + Date.now();
      const y = parseInt(year, 10) || 1990;
      const m = String(parseInt(month, 10) || 1).padStart(2, '0');
      const d = String(parseInt(day, 10) || 1).padStart(2, '0');
      const element = ELEMENT_POOL[(y + parseInt(m, 10) + parseInt(d, 10)) % 5];
      const score = 55 + ((y + parseInt(m, 10) * 7 + parseInt(d, 10) * 3) % 40);
      const p: Person = {
        id,
        name_ko: name || '이름',
        name_en: name || 'Friend',
        relation_ko: relation,
        relation_en: relation,
        element,
        birth: `${y}.${m}.${d}`,
        time: unknown ? null : `${hour}:${min}`,
        initials: (name || 'A').slice(0, 1),
        emoji: emoji || undefined,
        score,
        angle: (parseInt(d, 10) * 12) % 360,
        distance: 0.45 + ((parseInt(m, 10) % 5) * 0.08),
      };
      addPerson(universe, p);
      setSaving(false);
      setName(''); setEmoji('');
      onSaved?.(id);
      onClose();
    }, 900);
  };

  const seg = (label: string, value: string, options: { v: string; label: string }[], setter: (v: string) => void) => (
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
              background: active ? (dark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,1)') : 'transparent',
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

  const numField = (val: string, setter: (v: string) => void, max: number, ph: string, w: number | 'auto' = 'auto') => (
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
            <div style={{ fontSize: 22, fontWeight: 600, color: fg, letterSpacing: -0.5 }}>{t.addTitle}</div>
            <div style={{ fontSize: 13, color: sub, marginTop: 4, letterSpacing: -0.1 }}>{t.addSubtitle}</div>
          </div>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: 18, border: 'none', cursor: 'pointer',
            background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(26,21,56,0.06)',
            color: fg, fontSize: 18, lineHeight: 1, fontFamily: SANS,
          }}>×</button>
        </div>

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
                  background: active ? (dark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,1)') : fieldBg,
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
          <div style={{ fontSize: 13, color: sub, marginBottom: 8, letterSpacing: 0.2, fontWeight: 500 }}>{t.name}</div>
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
              color: emoji ? undefined : sub, fontFamily: SANS, transition: 'all .2s',
            }} aria-label="emoji">
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <div style={{ fontSize: 13, color: sub, letterSpacing: 0.2, fontWeight: 500 }}>{t.birthDate}</div>
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
            <div style={{ fontSize: 13, color: sub, letterSpacing: 0.2, fontWeight: 500 }}>{t.birthTime}</div>
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
                  width: 18, height: 18, borderRadius: 9, background: '#fff',
                  transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
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
              background: `${accent}1a`, border: `0.5px solid ${accent}40`,
              fontSize: 13, color: fg, lineHeight: 1.5, fontFamily: SANS,
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

export function NewUniverseSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const lang = useStore(s => s.lang);
  const dark = useStore(s => s.tweaks.darkMode);
  const accent = accentHex(useStore(s => s.tweaks.accent));
  const addUniverse = useStore(s => s.addUniverse);
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
          <button onClick={() => { if (name.trim()) { addUniverse(name.trim()); setName(''); onClose(); } }} style={{
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
