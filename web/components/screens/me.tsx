'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { ELEMENTS, SANS, cosmicBg, formatDate, parseBirth, LANGS, accentInk } from '@/lib/tokens';
import { pick } from '@/lib/i18n';
import type { ElementKey, Lang } from '@/lib/types';
import { useStore, accentHex } from '@/lib/store';
import { ElementOrb, StarField } from '@/components/primitives';
import { ScreenHeader, BottomTabBar } from '@/components/chrome';

export default function MeScreen() {
  const lang = useStore(s => s.lang);
  const dark = useStore(s => s.tweaks.darkMode);
  const accent = accentHex(useStore(s => s.tweaks.accent));
  const me = useStore(s => s.me);
  const meSaju = useStore(s => s.meSaju);
  const universes = useStore(s => s.universes);
  const tweaks = useStore(s => s.tweaks);
  const setTweak = useStore(s => s.setTweak);

  if (!me) return null;

  const fg = dark ? '#fff' : '#1A1538';
  const sub = dark ? 'rgba(255,255,255,0.6)' : 'rgba(26,21,56,0.6)';
  const cardBg = dark
    ? 'linear-gradient(155deg, rgba(120,90,200,0.16), rgba(60,40,140,0.05))'
    : 'linear-gradient(155deg, rgba(255,255,255,0.85), rgba(240,233,255,0.6))';
  const cardBorder = `0.5px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)'}`;
  const e = ELEMENTS[me.element];

  const pillars = (meSaju?.pillars ?? []).map(p => ({
    label: p.label[lang],
    sky: p.stem[lang],
    earth: p.branch[lang],
    el: p.element,
  }));

  const balanceOrder: ElementKey[] = ['water', 'wood', 'fire', 'earth', 'metal'];
  const balance = balanceOrder.map(el => ({ el, val: meSaju?.balance[el] ?? 0 }));
  const totalPeople = universes.reduce((s, u) => s + u.members.length, 0);

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      background: cosmicBg(dark), color: fg, overflow: 'hidden', fontFamily: SANS,
    }}>
      <StarField count={dark ? 70 : 20} seed={13} opacity={dark ? 0.5 : 0.12} />
      <div style={{ position: 'relative', height: '100%', overflow: 'auto', paddingBottom: 130 }}>
        <div style={{ height: 20 }} />
        <ScreenHeader title={pick(lang, { ko: '나', en: 'Me', ja: '私', zh: '我', es: 'Yo' })}
                      sub={pick(lang, {
                        ko: '나의 사주와 결', en: 'My saju & grain',
                        ja: '私の四柱と機微', zh: '我的四柱与纹理',
                        es: 'Mi saju y mi textura',
                      })} />

        <div style={{
          margin: '12px 16px 0', borderRadius: 28, padding: '22px 20px',
          background: cardBg, border: cardBorder, position: 'relative', overflow: 'hidden',
          animation: 'ctx-rise .5s ease both',
        }}>
          <StarField count={18} seed={51} opacity={dark ? 0.5 : 0.18} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
            <ElementOrb element={me.element} size={88} animated />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: accentInk(accent, dark), letterSpacing: 1.4, fontWeight: 600, textTransform: 'uppercase' }}>
                {pick(lang, { ko: '본인', en: 'Self', ja: '本人', zh: '本人', es: 'Tú' })}
              </div>
              <div style={{ fontSize: 26, fontWeight: 600, color: fg, letterSpacing: -0.6, marginTop: 2 }}>
                {me.name_ko}
              </div>
              <div style={{ fontSize: 13, color: sub, marginTop: 4 }}>
                {formatDate(parseBirth(me.birth)!, lang)}
                {me.time
                  ? ` · ${me.time}`
                  : ` · ${pick(lang, { ko: '시간 미상', en: 'time unknown', ja: '時刻不明', zh: '时辰未知', es: 'hora desconocida' })}`}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 8, marginTop: 18, position: 'relative' }}>
            <Stat label={pick(lang, { ko: '주된 기운', en: 'Element', ja: '主な気', zh: '主气', es: 'Elemento' })} value={e.label[lang]} dark={dark} fg={fg} sub={sub} />
            <Stat label={pick(lang, { ko: '우주', en: 'Universes', ja: '宇宙', zh: '宇宙', es: 'Universos' })} value={universes.length} dark={dark} fg={fg} sub={sub} />
            <Stat label={pick(lang, { ko: '사람', en: 'People', ja: '人', zh: '人物', es: 'Personas' })} value={totalPeople} dark={dark} fg={fg} sub={sub} />
          </div>
        </div>

        <div style={{
          margin: '14px 16px 0', borderRadius: 24, padding: '18px 16px',
          background: cardBg, border: cardBorder,
          animation: 'ctx-rise .5s ease both .05s',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: fg, letterSpacing: -0.2 }}>
              {pick(lang, {
                ko: '사주 · 네 기둥', en: 'Saju · Four Pillars',
                ja: '四柱 · 四つの柱', zh: '四柱 · 四根支柱',
                es: 'Saju · Cuatro pilares',
              })}
            </div>
            <div style={{ fontSize: 11, color: sub }}>
              {pick(lang, {
                ko: '나를 이루는 결', en: 'Your grain',
                ja: 'あなたを成す機微', zh: '构成你的纹理',
                es: 'La textura que te forma',
              })}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {pillars.map((p, i) => {
              const el = ELEMENTS[p.el];
              return (
                <div key={i} style={{
                  padding: '12px 8px', borderRadius: 14,
                  background: `${el.c3}18`, border: `0.5px solid ${el.c3}33`, textAlign: 'center',
                  animation: `ctx-rise .5s ease both ${0.1 + i * 0.04}s`,
                }}>
                  <div style={{ fontSize: 10, color: sub, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                    {p.label}
                  </div>
                  <div style={{
                    margin: '8px auto 6px', width: 28, height: 28, borderRadius: 14,
                    background: `radial-gradient(circle at 35% 30%, ${el.c1}, ${el.c2} 65%, ${el.c3})`,
                    boxShadow: `0 2px 8px ${el.c3}55`,
                  }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: fg, letterSpacing: -0.2 }}>{p.sky}</div>
                  <div style={{ fontSize: 11, color: sub, marginTop: 2 }}>{p.earth}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{
          margin: '14px 16px 0', borderRadius: 24, padding: '18px 16px',
          background: cardBg, border: cardBorder,
          animation: 'ctx-rise .5s ease both .1s',
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: fg, letterSpacing: -0.2, marginBottom: 14 }}>
            {pick(lang, { ko: '오행 분포', en: 'Element balance', ja: '五行のバランス', zh: '五行分布', es: 'Equilibrio de elementos' })}
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
                  <span style={{ width: 10, height: 10, borderRadius: 5,
                    background: `linear-gradient(135deg, ${el.c1}, ${el.c3})` }} />
                  <span style={{ fontSize: 11, color: sub }}>
                    {el.short[lang]}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: fg,
                                 fontVariantNumeric: 'tabular-nums' }}>{b.val}%</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{
          margin: '14px 16px 0', borderRadius: 24, padding: '6px',
          background: cardBg, border: cardBorder,
          animation: 'ctx-rise .5s ease both .15s',
        }}>
          <SettingsToggle label={pick(lang, { ko: '다크 모드', en: 'Dark mode', ja: 'ダークモード', zh: '深色模式', es: 'Modo oscuro' })}
                          value={tweaks.darkMode}
                          onChange={v => setTweak('darkMode', v)}
                          dark={dark} accent={accent} />
          <SettingsDivider dark={dark} />
          <SettingsRow label={pick(lang, { ko: '언어', en: 'Language', ja: '言語', zh: '语言', es: 'Idioma' })}
                       value={LANGS.find(l => l.code === lang)?.label} dark={dark} />
          <SettingsDivider dark={dark} />
          <SettingsRow label={pick(lang, { ko: '시각화 스타일', en: 'Visualization', ja: '表示スタイル', zh: '可视化样式', es: 'Visualización' })}
                       value={tweaks.vizStyle} dark={dark} />
        </div>

        <CloudCard dark={dark} accent={accent} lang={lang} />

        <div style={{
          margin: '24px 16px 0', textAlign: 'center', fontSize: 11, color: sub,
          letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 600,
        }}>
          contextella · v0.1
        </div>
      </div>
      <BottomTabBar activeTab="me" />
    </div>
  );
}

function Stat({ label, value, dark, fg, sub }: { label: string; value: string | number; dark: boolean; fg: string; sub: string }) {
  return (
    <div style={{
      padding: '12px 14px', borderRadius: 14,
      background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.55)',
    }}>
      <div style={{ fontSize: 10, color: sub, letterSpacing: 1, fontWeight: 600, textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontSize: typeof value === 'string' ? 15 : 18, fontWeight: 600, color: fg, marginTop: 4,
                    fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
    </div>
  );
}

function SettingsRow({ label, value, dark }: { label: string; value?: string; dark: boolean }) {
  const fg = dark ? '#fff' : '#1A1538';
  const sub = dark ? 'rgba(255,255,255,0.55)' : 'rgba(26,21,56,0.55)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 12px', minHeight: 52, fontFamily: SANS }}>
      <span style={{ flex: 1, fontSize: 14.5, fontWeight: 500, color: fg, letterSpacing: -0.2 }}>{label}</span>
      {value && <span style={{ fontSize: 13, color: sub }}>{value}</span>}
    </div>
  );
}

function SettingsToggle({ label, value, onChange, dark, accent }: { label: string; value: boolean; onChange: (v: boolean) => void; dark: boolean; accent: string }) {
  const fg = dark ? '#fff' : '#1A1538';
  return (
    <button onClick={() => onChange(!value)} style={{
      display: 'flex', alignItems: 'center', gap: 12, width: '100%',
      padding: '14px 12px', minHeight: 52, border: 'none', background: 'transparent',
      cursor: 'pointer', fontFamily: SANS, textAlign: 'left',
    }}>
      <span style={{ flex: 1, fontSize: 14.5, fontWeight: 500, color: fg, letterSpacing: -0.2 }}>{label}</span>
      <div style={{
        width: 42, height: 24, borderRadius: 12, position: 'relative',
        background: value ? accent : (dark ? 'rgba(255,255,255,0.15)' : 'rgba(26,21,56,0.15)'),
        transition: 'background .2s',
      }}>
        <div style={{
          position: 'absolute', top: 2, left: value ? 20 : 2,
          width: 20, height: 20, borderRadius: 10, background: '#fff',
          transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }} />
      </div>
    </button>
  );
}

function SettingsDivider({ dark }: { dark: boolean }) {
  return <div style={{
    height: 0.5, margin: '0 14px',
    background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(26,21,56,0.06)',
  }} />;
}

// Optional cloud backup. The app is fully usable without an account; signing
// in only mirrors local data to the cloud so it can follow the user.
function CloudCard({ dark, accent, lang }: { dark: boolean; accent: string; lang: Lang }) {
  const router = useRouter();
  const cloudEmail = useStore(s => s.cloudEmail);
  const syncing = useStore(s => s.syncing);
  const signOutLocal = useStore(s => s.signOutLocal);
  const fg = dark ? '#fff' : '#1A1538';
  const sub = dark ? 'rgba(255,255,255,0.55)' : 'rgba(26,21,56,0.55)';
  const cardBg = dark
    ? 'linear-gradient(155deg, rgba(120,90,200,0.16), rgba(60,40,140,0.05))'
    : 'linear-gradient(155deg, rgba(255,255,255,0.85), rgba(240,233,255,0.6))';
  const cardBorder = `0.5px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)'}`;

  return (
    <div style={{
      margin: '14px 16px 0', borderRadius: 24, padding: '18px 16px',
      background: cardBg, border: cardBorder,
    }}>
      <div style={{ fontSize: 11, color: accentInk(accent, dark), letterSpacing: 1.4, fontWeight: 600, textTransform: 'uppercase' }}>
        {pick(lang, { ko: '클라우드', en: 'Cloud', ja: 'クラウド', zh: '云端', es: 'Nube' })}
      </div>
      {cloudEmail ? (
        <>
          <div style={{ fontSize: 15, fontWeight: 600, color: fg, marginTop: 6, letterSpacing: -0.2 }}>
            {cloudEmail}
          </div>
          <div style={{ fontSize: 12.5, color: sub, marginTop: 3 }}>
            {syncing
              ? pick(lang, { ko: '동기화하는 중…', en: 'Syncing…', ja: '同期中…', zh: '正在同步…', es: 'Sincronizando…' })
              : pick(lang, {
                  ko: '이 기기의 데이터가 클라우드에 저장돼요',
                  en: 'This device’s data is backed up',
                  ja: 'この端末のデータはクラウドに保存されます',
                  zh: '本设备的数据已备份到云端',
                  es: 'Los datos de este dispositivo están respaldados',
                })}
          </div>
          <button onClick={() => { signOutLocal(); signOut({ callbackUrl: '/' }); }} style={{
            marginTop: 14, minHeight: 46, width: '100%', borderRadius: 14,
            border: `0.5px solid ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(26,21,56,0.10)'}`,
            background: 'transparent', color: '#E8A4B5', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: SANS,
          }}>{pick(lang, { ko: '로그아웃', en: 'Sign out', ja: 'ログアウト', zh: '退出登录', es: 'Cerrar sesión' })}</button>
        </>
      ) : (
        <>
          <div style={{ fontSize: 15, fontWeight: 600, color: fg, marginTop: 6, letterSpacing: -0.2 }}>
            {pick(lang, {
              ko: '클라우드에 저장하기', en: 'Save to the cloud',
              ja: 'クラウドに保存する', zh: '保存到云端',
              es: 'Guardar en la nube',
            })}
          </div>
          <div style={{ fontSize: 12.5, color: sub, marginTop: 3, lineHeight: 1.5 }}>
            {pick(lang, {
              ko: '계정을 만들면 다른 기기에서도 나의 결을 이어볼 수 있어요. 지금 데이터는 이 기기에만 저장돼요.',
              en: 'Create an account to carry your grain across devices. Right now everything is stored on this device only.',
              ja: 'アカウントを作れば、ほかの端末でも自分の機微を続けて見られます。今はこの端末にのみ保存されています。',
              zh: '创建账号后，可在其他设备上延续你的纹理。目前数据仅保存在本设备。',
              es: 'Crea una cuenta para llevar tu textura a otros dispositivos. Ahora todo se guarda solo en este dispositivo.',
            })}
          </div>
          <button onClick={() => router.push('/login')} style={{
            marginTop: 14, minHeight: 46, width: '100%', borderRadius: 14, border: 'none',
            background: accent, color: '#1A1538', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: SANS,
          }}>{pick(lang, {
            ko: '로그인 / 가입하기', en: 'Sign in or create account',
            ja: 'ログイン / 登録', zh: '登录 / 注册',
            es: 'Iniciar sesión o registrarse',
          })}</button>
        </>
      )}
    </div>
  );
}
