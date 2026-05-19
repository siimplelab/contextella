'use client';
import React, { useState } from 'react';
import { SANS, formatDate, shade } from '@/lib/tokens';
import { I18N, pick } from '@/lib/i18n';
import { useStore, accentHex } from '@/lib/store';

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
  // Universe selection: defaults to the active universe until the user picks one.
  const [universeOverride, setUniverseOverride] = useState<string | null>(null);
  const [relation, setRelation] = useState('friend');
  const [gender, setGender] = useState('o');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [hour, setHour] = useState('');
  const [min, setMin] = useState('');
  const [unknown, setUnknown] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const universe = universeOverride && universes.some(u => u.id === universeOverride)
    ? universeOverride
    : activeUniverseId;

  const fg = dark ? '#fff' : '#1A1538';
  const sub = dark ? 'rgba(255,255,255,0.6)' : 'rgba(26,21,56,0.6)';
  const fieldBg = dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)';
  const fieldBorder = dark ? 'rgba(255,255,255,0.10)' : 'rgba(26,21,56,0.10)';

  const handleSave = async () => {
    if (saving) return;
    setError('');
    const y = parseInt(year, 10), m = parseInt(month, 10), d = parseInt(day, 10);
    if (!name.trim()) {
      setError(pick(lang, {
        ko: '이름을 입력해 주세요', en: 'Please enter a name',
        ja: '名前を入力してください', zh: '请输入姓名', es: 'Introduce un nombre',
      }));
      return;
    }
    if (!y || y < 1900 || y > 2100 || !m || m > 12 || !d || d > 31) {
      setError(pick(lang, {
        ko: '생년월일을 확인해 주세요', en: 'Check the date of birth',
        ja: '生年月日を確認してください', zh: '请检查出生日期', es: 'Revisa la fecha de nacimiento',
      }));
      return;
    }
    let birthTime: string | null = null;
    if (!unknown) {
      const h = parseInt(hour, 10), mi = parseInt(min, 10);
      if (hour === '' || min === '' || h > 23 || mi > 59) {
        setError(pick(lang, {
          ko: '태어난 시간을 확인해 주세요', en: 'Check the time of birth',
          ja: '生まれた時刻を確認してください', zh: '请检查出生时辰', es: 'Revisa la hora de nacimiento',
        }));
        return;
      }
      birthTime = `${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}`;
    }
    const birthDate = `${y}.${String(m).padStart(2, '0')}.${String(d).padStart(2, '0')}`;

    setSaving(true);
    const id = await addPerson({
      universeId: universe,
      name: name.trim(),
      relation,
      gender,
      birthDate,
      birthTime,
      emoji: emoji || undefined,
    });
    setSaving(false);
    if (!id) {
      setError(pick(lang, {
        ko: '저장에 실패했어요', en: 'Could not save',
        ja: '保存できませんでした', zh: '保存失败', es: 'No se pudo guardar',
      }));
      return;
    }
    setName(''); setEmoji('');
    setYear(''); setMonth(''); setDay(''); setHour(''); setMin('');
    setUnknown(false); setUniverseOverride(null);
    onSaved?.(id);
    onClose();
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
            {pick(lang, { ko: '어느 우주에', en: 'Which universe', ja: 'どの宇宙に', zh: '加入哪个宇宙', es: 'En qué universo' })}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {universes.map(u => {
              const active = u.id === universe;
              return (
                <button key={u.id} onClick={() => setUniverseOverride(u.id)} style={{
                  minHeight: 44, padding: '0 16px', borderRadius: 14,
                  background: active ? (dark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,1)') : fieldBg,
                  border: `0.5px solid ${active ? accent : fieldBorder}`,
                  color: active ? (dark ? accent : '#1A1538') : sub,
                  fontSize: 14, fontWeight: active ? 600 : 500, letterSpacing: -0.2,
                  cursor: 'pointer', fontFamily: SANS, transition: 'all .15s',
                }}>{u.name_ko}</button>
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
            {numField(year, setYear, 9999, pick(lang, { ko: '연도', en: 'YYYY', ja: '年', zh: '年', es: 'AAAA' }))}
            {numField(month, setMonth, 12, pick(lang, { ko: '월', en: 'MM', ja: '月', zh: '月', es: 'MM' }), 80)}
            {numField(day, setDay, 31, pick(lang, { ko: '일', en: 'DD', ja: '日', zh: '日', es: 'DD' }), 80)}
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
              {numField(hour, setHour, 23, pick(lang, { ko: '시', en: 'HH', ja: '時', zh: '时', es: 'HH' }), 110)}
              <div style={{ alignSelf: 'center', color: sub, fontSize: 18, fontWeight: 500 }}>:</div>
              {numField(min, setMin, 59, pick(lang, { ko: '분', en: 'MM', ja: '分', zh: '分', es: 'MM' }), 110)}
            </div>
          ) : (
            <div style={{
              padding: '14px 16px', borderRadius: 14,
              background: `${accent}1a`, border: `0.5px solid ${accent}40`,
              fontSize: 13, color: fg, lineHeight: 1.5, fontFamily: SANS,
            }}>{t.timeUnknownHint}</div>
          )}
        </div>

        {error && (
          <div style={{ fontSize: 13, color: '#E8A4B5', marginBottom: 10, lineHeight: 1.4 }}>{error}</div>
        )}

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
          {pick(lang, { ko: '새 우주 만들기', en: 'New universe', ja: '新しい宇宙をつくる', zh: '创建新宇宙', es: 'Nuevo universo' })}
        </div>
        <div style={{ fontSize: 13, color: sub, marginTop: 4, marginBottom: 16 }}>
          {pick(lang, {
            ko: '관계의 묶음에 이름을 붙여보세요', en: 'Name a circle of people',
            ja: '関係のまとまりに名前をつけましょう', zh: '为一组关系命名',
            es: 'Pon nombre a un círculo de personas',
          })}
        </div>
        <input value={name} onChange={e => setName(e.target.value)}
               placeholder={pick(lang, {
                 ko: '예) 동아리, 운동 모임', en: 'e.g. Book club, Gym crew',
                 ja: '例）サークル、運動仲間', zh: '例）社团、运动小组',
                 es: 'ej. Club de lectura, Grupo de gimnasio',
               })}
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
          }}>{pick(lang, { ko: '취소', en: 'Cancel', ja: 'キャンセル', zh: '取消', es: 'Cancelar' })}</button>
          <button onClick={async () => { if (name.trim()) { await addUniverse(name.trim()); setName(''); onClose(); } }} style={{
            flex: 2, minHeight: 56, borderRadius: 16, border: 'none', cursor: 'pointer',
            background: `linear-gradient(135deg, ${accent}, ${shade(accent, -15)})`,
            color: '#1A1538', fontSize: 16, fontWeight: 600, fontFamily: SANS,
            boxShadow: `0 8px 20px ${accent}55`,
          }}>{pick(lang, { ko: '만들기', en: 'Create', ja: 'つくる', zh: '创建', es: 'Crear' })}</button>
        </div>
      </div>
    </>
  );
}
