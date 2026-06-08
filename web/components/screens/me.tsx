'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { ELEMENTS, SANS, cosmicBg, formatDate, parseBirth, LANGS, accentInk } from '@/lib/tokens';
import { pick } from '@/lib/i18n';
import type { Lang } from '@/lib/types';
import { useStore, accentHex } from '@/lib/store';
import { ElementOrb, StarField } from '@/components/primitives';
import { SajuDetail } from '@/components/saju-detail';
import { ScreenHeader, BottomTabBar } from '@/components/chrome';

export default function MeScreen() {
  const lang = useStore(s => s.lang);
  const dark = useStore(s => s.tweaks.darkMode);
  const accent = accentHex(useStore(s => s.tweaks.accent));
  const me = useStore(s => s.me);
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

        {/* Full in-depth Saju reading for the user — same engine as a person's
            detail page, in first-person ("나") framing. */}
        <SajuDetail person={me} lang={lang} dark={dark} accent={accent} self />

        <div style={{
          margin: '14px 16px 0', borderRadius: 24, padding: '18px 16px',
          background: cardBg, border: cardBorder,
          animation: 'ctx-rise .5s ease both .12s',
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: fg, letterSpacing: -0.2 }}>
            {pick(lang, {
              ko: '이렇게 계산해요', en: 'How this is calculated',
              ja: 'こうして計算しています', zh: '我们如何计算',
              es: 'Cómo se calcula',
            })}
          </div>
          <div style={{ fontSize: 12.5, color: sub, lineHeight: 1.5, marginTop: 6 }}>
            {pick(lang, {
              ko: '무작위 점괘가 아니라, 천문 계산과 검증된 만세력으로 사주를 세웁니다.',
              en: 'Not a random draw — your chart is built from astronomy and a verified perpetual calendar (만세력).',
              ja: 'ランダムな占いではなく、天文計算と検証済みの万歳暦で四柱を立てます。',
              zh: '并非随机抽签——你的命盘由天文计算与经过验证的万年历推得。',
              es: 'No es un sorteo al azar: tu carta se construye con astronomía y un calendario perpetuo verificado.',
            })}
          </div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              pick(lang, {
                ko: '연주 — 양력 새해가 아닌 입춘을 기준으로 바뀜',
                en: 'Year — turns at 입춘 (early Feb), not Jan 1',
                ja: '年柱 — 元日ではなく立春を基準に',
                zh: '年柱 — 以立春为界，而非元旦',
                es: 'Año — cambia en 입춘 (inicios de feb.), no el 1 de enero',
              }),
              pick(lang, {
                ko: '월주·일주 — 실제 절기와 만세력 60갑자로 계산',
                en: 'Month & day — real solar terms and the 60갑자 manse cycle',
                ja: '月柱・日柱 — 実際の節気と万歳暦の60干支で',
                zh: '月柱·日柱 — 依实际节气与六十甲子万年历',
                es: 'Mes y día — términos solares reales y el ciclo 60갑자',
              }),
              pick(lang, {
                ko: '한국 표준시(KST) 기준 · 시간을 모르면 시주는 비워둠',
                en: 'All times in KST · hour pillar omitted if unknown',
                ja: '韓国標準時(KST)基準 · 時刻不明なら時柱は省略',
                zh: '均以韩国标准时(KST)为准 · 不知时辰则留空时柱',
                es: 'Horas en KST · sin hora, se omite el pilar horario',
              }),
            ].map((line, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ color: accentInk(accent, dark), fontSize: 12, lineHeight: 1.5, flexShrink: 0 }}>✦</span>
                <span style={{ fontSize: 12.5, color: sub, lineHeight: 1.5, letterSpacing: -0.1 }}>{line}</span>
              </div>
            ))}
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
