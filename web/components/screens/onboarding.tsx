'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SANS, cosmicBg, shade, formatDate, accentInk } from '@/lib/tokens';
import { useStore, accentHex } from '@/lib/store';
import { StarField, ElementOrb } from '@/components/primitives';
import { LanguageMenu } from '@/components/chrome';
import { pick } from '@/lib/i18n';
import type { Lang } from '@/lib/types';

interface OnboardCopy {
  title: string; sub: string; name: string; namePh: string;
  birthDate: string; birthTime: string; timeUnknown: string; timeUnknownHint: string;
  gender: string; genderF: string; genderM: string; genderO: string;
  cta: string; working: string;
  yyyy: string; mm: string; dd: string; hh: string; min: string;
}

const COPY: Record<Lang, OnboardCopy> = {
  ko: {
    title: '나의 결을 알려주세요',
    sub: '생년월일과 태어난 시간으로 사주를 읽어드려요',
    name: '이름', namePh: '예) 김하늘',
    birthDate: '생년월일', birthTime: '태어난 시간',
    timeUnknown: '시간을 몰라요',
    timeUnknownHint: '괜찮아요. 시간 없이 더 큰 그림으로 읽어드릴게요.',
    gender: '성별', genderF: '여성', genderM: '남성', genderO: '비공개',
    cta: '시작하기', working: '결을 읽는 중…',
    yyyy: '연도', mm: '월', dd: '일', hh: '시', min: '분',
  },
  en: {
    title: 'Tell us your grain',
    sub: 'We read your Saju from your birth date and time',
    name: 'Name', namePh: 'e.g. Skye Kim',
    birthDate: 'Date of birth', birthTime: 'Time of birth',
    timeUnknown: 'I don’t know the time',
    timeUnknownHint: 'That’s fine — we’ll read the wider picture without it.',
    gender: 'Gender', genderF: 'Female', genderM: 'Male', genderO: 'Private',
    cta: 'Begin', working: 'Reading the grain…',
    yyyy: 'YYYY', mm: 'MM', dd: 'DD', hh: 'HH', min: 'MM',
  },
  ja: {
    title: 'あなたの機微を教えてください',
    sub: '生年月日と生まれた時刻から四柱を読み解きます',
    name: '名前', namePh: '例）山田はる',
    birthDate: '生年月日', birthTime: '生まれた時刻',
    timeUnknown: '時刻が分かりません',
    timeUnknownHint: '大丈夫です。時刻なしでも、より大きな視点で読み解きます。',
    gender: '性別', genderF: '女性', genderM: '男性', genderO: '非公開',
    cta: 'はじめる', working: '機微を読み取り中…',
    yyyy: '年', mm: '月', dd: '日', hh: '時', min: '分',
  },
  zh: {
    title: '请告诉我们你的纹理',
    sub: '我们将依据出生日期与时辰解读你的四柱',
    name: '姓名', namePh: '例）王小天',
    birthDate: '出生日期', birthTime: '出生时辰',
    timeUnknown: '不知道时辰',
    timeUnknownHint: '没关系，没有时辰我们也会从更宏观的角度解读。',
    gender: '性别', genderF: '女', genderM: '男', genderO: '不公开',
    cta: '开始', working: '正在解读纹理…',
    yyyy: '年', mm: '月', dd: '日', hh: '时', min: '分',
  },
  es: {
    title: 'Cuéntanos tu textura',
    sub: 'Leemos tu Saju a partir de tu fecha y hora de nacimiento',
    name: 'Nombre', namePh: 'ej. Lucía Soler',
    birthDate: 'Fecha de nacimiento', birthTime: 'Hora de nacimiento',
    timeUnknown: 'No sé la hora',
    timeUnknownHint: 'No pasa nada — sin la hora leeremos el panorama más amplio.',
    gender: 'Género', genderF: 'Mujer', genderM: 'Hombre', genderO: 'Privado',
    cta: 'Comenzar', working: 'Leyendo la textura…',
    yyyy: 'AAAA', mm: 'MM', dd: 'DD', hh: 'HH', min: 'MM',
  },
};

export default function OnboardingScreen() {
  const router = useRouter();
  const lang = useStore(s => s.lang);
  const dark = useStore(s => s.tweaks.darkMode);
  const accent = accentHex(useStore(s => s.tweaks.accent));
  const updateProfile = useStore(s => s.updateProfile);
  const storedProfile = useStore(s => s.profile);
  const t = COPY[lang];

  // Prefill from any partial profile so a returning user keeps what they had.
  const pb = (storedProfile?.birthDate ?? '').split('.');
  const pt = (storedProfile?.birthTime ?? '').split(':');
  const [name, setName] = useState(storedProfile?.name ?? '');
  const [year, setYear] = useState(pb[0] ?? '');
  const [month, setMonth] = useState(pb[1] ? String(+pb[1]) : '');
  const [day, setDay] = useState(pb[2] ? String(+pb[2]) : '');
  const [hour, setHour] = useState(pt[0] ?? '');
  const [min, setMin] = useState(pt[1] ?? '');
  const [unknown, setUnknown] = useState(!!storedProfile && !storedProfile.birthTime);
  const [gender, setGender] = useState(storedProfile?.gender || 'o');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const fg = dark ? '#fff' : '#1A1538';
  const sub = dark ? 'rgba(255,255,255,0.6)' : 'rgba(26,21,56,0.6)';
  const fieldBg = dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)';
  const fieldBorder = dark ? 'rgba(255,255,255,0.10)' : 'rgba(26,21,56,0.10)';
  const cardBg = dark
    ? 'linear-gradient(155deg, rgba(120,90,200,0.16), rgba(60,40,140,0.05))'
    : 'linear-gradient(155deg, rgba(255,255,255,0.85), rgba(240,233,255,0.6))';

  const num = (val: string, set: (v: string) => void, max: number, ph: string) => (
    <input value={val} onChange={e => set(e.target.value.replace(/\D/g, '').slice(0, String(max).length))}
           placeholder={ph} inputMode="numeric"
           style={{
             flex: 1, minWidth: 0, minHeight: 54, padding: '0 12px', borderRadius: 14,
             background: fieldBg, border: `0.5px solid ${fieldBorder}`,
             color: fg, fontSize: 17, fontWeight: 500, textAlign: 'center',
             fontVariantNumeric: 'tabular-nums', outline: 'none', fontFamily: SANS,
           }} />
  );

  const datePreview = () => {
    const y = +year, m = +month, d = +day;
    if (!y || !m || !d) return '';
    return formatDate(new Date(y, m - 1, d), lang);
  };

  const submit = async () => {
    if (busy) return;
    setError('');
    const y = +year, m = +month, d = +day;
    if (!y || y < 1900 || y > 2100 || !m || m > 12 || !d || d > 31) {
      setError(pick(lang, {
        ko: '생년월일을 확인해 주세요', en: 'Check your date of birth',
        ja: '生年月日を確認してください', zh: '请检查出生日期', es: 'Revisa tu fecha de nacimiento',
      }));
      return;
    }
    const birthDate = `${y}.${String(m).padStart(2, '0')}.${String(d).padStart(2, '0')}`;
    let birthTime: string | null = null;
    if (!unknown) {
      const h = +hour, mi = +min;
      if (hour === '' || min === '' || h > 23 || mi > 59) {
        setError(pick(lang, {
          ko: '태어난 시간을 확인해 주세요', en: 'Check the time of birth',
          ja: '生まれた時刻を確認してください', zh: '请检查出生时辰', es: 'Revisa la hora de nacimiento',
        }));
        return;
      }
      birthTime = `${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}`;
    }
    setBusy(true);
    const fallbackName = pick(lang, { ko: '나', en: 'Me', ja: '私', zh: '我', es: 'Yo' });
    updateProfile({ name: name.trim() || fallbackName, birthDate, birthTime, gender });
    router.push('/');
  };

  const label = (text: string, extra?: string) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
      <span style={{ fontSize: 13, color: sub, fontWeight: 500, letterSpacing: 0.2 }}>{text}</span>
      {extra && <span style={{ fontSize: 12, color: accentInk(accent, dark) }}>{extra}</span>}
    </div>
  );

  const genderOptions = [
    { v: 'f', label: t.genderF },
    { v: 'm', label: t.genderM },
    { v: 'o', label: t.genderO },
  ];

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      background: cosmicBg(dark), color: fg, overflow: 'hidden', fontFamily: SANS,
    }}>
      <StarField count={dark ? 70 : 22} seed={11} opacity={dark ? 0.6 : 0.14} />
      <div style={{ position: 'relative', height: '100%', overflow: 'auto', padding: '16px 22px 36px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <LanguageMenu />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
          <ElementOrb element="wood" size={68} animated />
          <div style={{ fontSize: 22, fontWeight: 600, color: fg, letterSpacing: -0.5, marginTop: 14, textAlign: 'center' }}>
            {t.title}
          </div>
          <div style={{ fontSize: 13.5, color: sub, marginTop: 6, textAlign: 'center', lineHeight: 1.5 }}>
            {t.sub}
          </div>
        </div>

        <div style={{
          borderRadius: 24, padding: '20px 18px', background: cardBg,
          border: `0.5px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)'}`,
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          <div>
            {label(t.name)}
            <input value={name} onChange={e => setName(e.target.value)} placeholder={t.namePh}
                   style={{
                     width: '100%', minHeight: 54, padding: '0 16px', borderRadius: 14,
                     background: fieldBg, border: `0.5px solid ${fieldBorder}`,
                     color: fg, fontSize: 16, outline: 'none', boxSizing: 'border-box', fontFamily: SANS,
                   }} />
          </div>

          <div>
            {label(t.birthDate, datePreview())}
            <div style={{ display: 'flex', gap: 8 }}>
              {num(year, setYear, 9999, t.yyyy)}
              {num(month, setMonth, 12, t.mm)}
              {num(day, setDay, 31, t.dd)}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: sub, fontWeight: 500, letterSpacing: 0.2 }}>{t.birthTime}</span>
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
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {num(hour, setHour, 23, t.hh)}
                <span style={{ color: sub, fontSize: 18 }}>:</span>
                {num(min, setMin, 59, t.min)}
              </div>
            ) : (
              <div style={{
                padding: '14px 16px', borderRadius: 14,
                background: `${accent}1a`, border: `0.5px solid ${accent}40`,
                fontSize: 13, color: fg, lineHeight: 1.5,
              }}>{t.timeUnknownHint}</div>
            )}
          </div>

          <div>
            {label(t.gender)}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6,
              padding: 4, borderRadius: 14, background: fieldBg, border: `0.5px solid ${fieldBorder}`,
            }}>
              {genderOptions.map(o => {
                const active = gender === o.v;
                return (
                  <button key={o.v} onClick={() => setGender(o.v)} style={{
                    minHeight: 44, border: 'none', borderRadius: 10, cursor: 'pointer',
                    background: active ? (dark ? 'rgba(255,255,255,0.14)' : '#fff') : 'transparent',
                    boxShadow: active ? '0 1px 4px rgba(0,0,0,0.18)' : 'none',
                    color: active ? (dark ? accent : '#1A1538') : sub,
                    fontSize: 14, fontWeight: active ? 600 : 500, fontFamily: SANS, transition: 'all .15s',
                  }}>{o.label}</button>
                );
              })}
            </div>
          </div>

          {error && <div style={{ fontSize: 13, color: '#E8A4B5' }}>{error}</div>}

          <button onClick={submit} disabled={busy} style={{
            minHeight: 54, borderRadius: 14, border: 'none', cursor: busy ? 'wait' : 'pointer',
            background: `linear-gradient(135deg, ${accent}, ${shade(accent, -15)})`,
            color: '#1A1538', fontSize: 16, fontWeight: 600, letterSpacing: -0.2,
            boxShadow: `0 8px 20px ${accent}55`, fontFamily: SANS, opacity: busy ? 0.7 : 1,
          }}>{busy ? t.working : t.cta}</button>
        </div>
      </div>
    </div>
  );
}
