'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SANS, cosmicBg, shade, LANGS, accentInk } from '@/lib/tokens';
import { useStore, accentHex } from '@/lib/store';
import { StarField, ElementOrb } from '@/components/primitives';
import type { Lang, ElementKey } from '@/lib/types';

interface Slide { title: string; body: string }

const COPY: Record<Lang, { langTitle: string; slides: Slide[]; back: string; next: string; begin: string }> = {
  ko: {
    langTitle: '언어를 선택하세요',
    slides: [
      {
        title: '관계의 결을 읽다',
        body: 'contextella는 사주를 통해 나와 주변 사람들 사이에 흐르는, 보이지 않는 결을 읽어주는 앱이에요.',
      },
      {
        title: '사주란?',
        body: '사주(四柱)는 태어난 연·월·일·시를 네 개의 기둥으로 풀어내는 동아시아의 오랜 지혜예요. 그 안에서 나의 기운과 흐름을 읽어냅니다.',
      },
      {
        title: '시작하는 법',
        body: '생년월일과 태어난 시간만 알려주면 바로 시작할 수 있어요. 계정 없이도 쓸 수 있고, 원할 때 로그인해 클라우드에 저장하세요.',
      },
    ],
    back: '이전', next: '다음', begin: '시작하기',
  },
  en: {
    langTitle: 'Choose your language',
    slides: [
      {
        title: 'Read the grain of relationships',
        body: 'contextella reads the unseen grain that flows between you and the people around you — through Saju.',
      },
      {
        title: 'What is Saju?',
        body: 'Saju (四柱, “four pillars”) is an East Asian tradition that reads your birth — year, month, day and hour — as four pillars, revealing your element and how it flows.',
      },
      {
        title: 'How to begin',
        body: 'Just share your birth date and time to start. You can use contextella without an account — and sign in anytime to back up to the cloud.',
      },
    ],
    back: 'Back', next: 'Next', begin: 'Begin',
  },
  ja: {
    langTitle: '言語を選択してください',
    slides: [
      {
        title: '関係の機微を読む',
        body: 'contextella は四柱（サジュ）を通して、自分と周りの人々の間に流れる、見えない機微を読み解くアプリです。',
      },
      {
        title: '四柱（サジュ）とは？',
        body: '四柱は、生まれた年・月・日・時を四つの柱として読み解く東アジアの古い知恵です。そこからあなたの気と流れを読み取ります。',
      },
      {
        title: 'はじめ方',
        body: '生年月日と生まれた時刻を教えてもらえれば、すぐに始められます。アカウントなしでも使え、いつでもログインしてクラウドに保存できます。',
      },
    ],
    back: '戻る', next: '次へ', begin: 'はじめる',
  },
  zh: {
    langTitle: '请选择语言',
    slides: [
      {
        title: '解读关系的纹理',
        body: 'contextella 借助四柱（Saju），解读你与身边人之间流动着的、那份看不见的纹理。',
      },
      {
        title: '什么是四柱（Saju）？',
        body: '四柱（“四根支柱”）是东亚流传已久的智慧，将出生的年、月、日、时解读为四根支柱，从中读出你的气与流动。',
      },
      {
        title: '如何开始',
        body: '只需告诉我们出生日期与时辰即可开始。无需账号也能使用，随时登录即可备份到云端。',
      },
    ],
    back: '上一步', next: '下一步', begin: '开始',
  },
  es: {
    langTitle: 'Elige tu idioma',
    slides: [
      {
        title: 'Lee la textura de los vínculos',
        body: 'contextella lee la textura invisible que fluye entre tú y quienes te rodean, a través del Saju.',
      },
      {
        title: '¿Qué es el Saju?',
        body: 'El Saju (四柱, “cuatro pilares”) es una tradición de Asia Oriental que lee tu nacimiento —año, mes, día y hora— como cuatro pilares, revelando tu elemento y su flujo.',
      },
      {
        title: 'Cómo empezar',
        body: 'Solo comparte tu fecha y hora de nacimiento para empezar. Puedes usar contextella sin cuenta — e iniciar sesión cuando quieras para respaldar en la nube.',
      },
    ],
    back: 'Atrás', next: 'Siguiente', begin: 'Comenzar',
  },
};

const SLIDE_ELEMENTS: ElementKey[] = ['water', 'wood', 'fire', 'earth', 'metal'];
const TOTAL_STEPS = 4; // 0 = language, 1-3 = intro slides

export default function WelcomeScreen() {
  const router = useRouter();
  const lang = useStore(s => s.lang);
  const setLang = useStore(s => s.setLang);
  const dark = useStore(s => s.tweaks.darkMode);
  const accent = accentHex(useStore(s => s.tweaks.accent));
  const markIntroSeen = useStore(s => s.markIntroSeen);
  const t = COPY[lang];

  const [step, setStep] = useState(0);
  const last = step === TOTAL_STEPS - 1;
  const isLangStep = step === 0;
  const slide = isLangStep ? null : t.slides[step - 1];

  const fg = dark ? '#fff' : '#1A1538';
  const sub = dark ? 'rgba(255,255,255,0.62)' : 'rgba(26,21,56,0.62)';
  const fieldBorder = dark ? 'rgba(255,255,255,0.10)' : 'rgba(26,21,56,0.10)';

  const advance = () => {
    if (last) {
      markIntroSeen();
      router.push('/onboarding');
    } else {
      setStep(s => s + 1);
    }
  };
  const goBack = () => setStep(s => Math.max(0, s - 1));

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      background: cosmicBg(dark), color: fg, overflow: 'hidden', fontFamily: SANS,
    }}>
      <StarField count={dark ? 70 : 22} seed={17} opacity={dark ? 0.6 : 0.14} />
      <div style={{
        position: 'relative', height: '100%', display: 'flex', flexDirection: 'column',
        padding: '40px 26px 36px',
      }}>
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          overflow: 'auto',
        }}>
          {isLangStep ? (
            <div key="lang" style={{ width: '100%', maxWidth: 320, animation: 'ctx-rise .45s ease both' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke={accent}
                     strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9.5" />
                  <ellipse cx="12" cy="12" rx="4" ry="9.5" />
                  <path d="M2.5 12h19" />
                </svg>
              </div>
              <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.5, color: fg, marginBottom: 18 }}>
                {t.langTitle}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {LANGS.map(l => {
                  const active = l.code === lang;
                  return (
                    <button key={l.code} onClick={() => setLang(l.code)} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      width: '100%', minHeight: 50, padding: '0 18px', borderRadius: 14,
                      background: active
                        ? (dark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.85)')
                        : 'transparent',
                      border: `0.5px solid ${active ? accent : fieldBorder}`,
                      color: fg, fontSize: 15.5, fontWeight: active ? 600 : 500,
                      cursor: 'pointer', fontFamily: SANS, transition: 'all .15s',
                    }}>
                      <span>{l.label}</span>
                      {active && <span style={{ color: accentInk(accent, dark), fontSize: 15 }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              {step === 2 ? (
                <div key="orbs" style={{ display: 'flex', gap: 6, marginBottom: 30, animation: 'ctx-rise .5s ease both' }}>
                  {SLIDE_ELEMENTS.map(el => <ElementOrb key={el} element={el} size={46} animated />)}
                </div>
              ) : (
                <div key={`orb-${step}`} style={{ marginBottom: 34, animation: 'ctx-rise .5s ease both' }}>
                  <ElementOrb element={step === 1 ? 'water' : 'wood'} size={108} animated />
                </div>
              )}
              <div key={`title-${step}`} style={{
                fontSize: 25, fontWeight: 600, letterSpacing: -0.6, color: fg,
                lineHeight: 1.3, animation: 'ctx-rise .45s ease both .05s',
              }}>
                {slide!.title}
              </div>
              <div key={`body-${step}`} style={{
                fontSize: 14.5, color: sub, lineHeight: 1.65, letterSpacing: -0.2,
                marginTop: 12, maxWidth: 340, animation: 'ctx-rise .45s ease both .1s',
              }}>
                {slide!.body}
              </div>
            </>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, marginTop: 16 }}>
          <div style={{ display: 'flex', gap: 7 }}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <button key={i} onClick={() => setStep(i)} aria-label={`Step ${i + 1}`} style={{
                width: i === step ? 22 : 7, height: 7, borderRadius: 4, border: 'none',
                padding: 0, cursor: 'pointer', transition: 'width .25s, background .25s',
                background: i === step ? accent : (dark ? 'rgba(255,255,255,0.22)' : 'rgba(26,21,56,0.2)'),
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            {step > 0 && (
              <button onClick={goBack} style={{
                flex: 1, minHeight: 54, borderRadius: 16, cursor: 'pointer',
                border: `0.5px solid ${fieldBorder}`, background: 'transparent',
                color: fg, fontSize: 16, fontWeight: 500, fontFamily: SANS,
              }}>{t.back}</button>
            )}
            <button onClick={advance} style={{
              flex: step > 0 ? 2 : 1, minHeight: 54, borderRadius: 16, border: 'none', cursor: 'pointer',
              background: `linear-gradient(135deg, ${accent}, ${shade(accent, -15)})`,
              color: '#1A1538', fontSize: 16, fontWeight: 600, letterSpacing: -0.2,
              boxShadow: `0 8px 20px ${accent}55`, fontFamily: SANS,
            }}>{last ? t.begin : t.next}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
