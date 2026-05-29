'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { SANS, cosmicBg, shade, accentInk } from '@/lib/tokens';
import { useStore, accentHex } from '@/lib/store';
import { StarField, ElementOrb } from '@/components/primitives';
import { pick } from '@/lib/i18n';
import type { Lang } from '@/lib/types';

const COPY: Record<Lang, {
  login: { title: string; sub: string; cta: string; alt: string; altLink: string };
  register: { title: string; sub: string; cta: string; alt: string; altLink: string };
  name: string; email: string; password: string;
  namePh: string; emailPh: string; passwordPh: string; working: string;
}> = {
  ko: {
    login: { title: '다시 만나 반가워요', sub: '관계의 결을 이어서 읽어볼까요', cta: '들어가기', alt: '아직 계정이 없나요?', altLink: '계정 만들기' },
    register: { title: 'contextella 시작하기', sub: '나와 사람들의 결을 읽는 첫 걸음', cta: '계정 만들기', alt: '이미 계정이 있나요?', altLink: '로그인' },
    name: '이름', email: '이메일', password: '비밀번호',
    namePh: '예) 김하늘', emailPh: 'you@example.com', passwordPh: '8자 이상',
    working: '잠시만요…',
  },
  en: {
    login: { title: 'Welcome back', sub: 'Pick up reading the grain of your relationships', cta: 'Enter', alt: 'No account yet?', altLink: 'Create one' },
    register: { title: 'Begin with contextella', sub: 'The first step to reading your grain and others’', cta: 'Create account', alt: 'Already have an account?', altLink: 'Sign in' },
    name: 'Name', email: 'Email', password: 'Password',
    namePh: 'e.g. Skye Kim', emailPh: 'you@example.com', passwordPh: '8+ characters',
    working: 'One moment…',
  },
  ja: {
    login: { title: 'おかえりなさい', sub: '関係の機微を続けて読み解きましょう', cta: '入る', alt: 'アカウントをお持ちでないですか？', altLink: 'アカウント作成' },
    register: { title: 'contextella をはじめる', sub: '自分と人々の機微を読む最初の一歩', cta: 'アカウント作成', alt: 'すでにアカウントをお持ちですか？', altLink: 'ログイン' },
    name: '名前', email: 'メールアドレス', password: 'パスワード',
    namePh: '例）山田はる', emailPh: 'you@example.com', passwordPh: '8文字以上',
    working: '少々お待ちください…',
  },
  zh: {
    login: { title: '欢迎回来', sub: '继续解读关系的纹理', cta: '进入', alt: '还没有账号？', altLink: '创建账号' },
    register: { title: '开始使用 contextella', sub: '解读自己与他人纹理的第一步', cta: '创建账号', alt: '已经有账号了？', altLink: '登录' },
    name: '姓名', email: '邮箱', password: '密码',
    namePh: '例）王小天', emailPh: 'you@example.com', passwordPh: '至少 8 个字符',
    working: '请稍候…',
  },
  es: {
    login: { title: 'Qué bueno verte de nuevo', sub: 'Retoma la lectura de la textura de tus vínculos', cta: 'Entrar', alt: '¿Aún no tienes cuenta?', altLink: 'Crear una' },
    register: { title: 'Empieza con contextella', sub: 'El primer paso para leer tu textura y la de los demás', cta: 'Crear cuenta', alt: '¿Ya tienes una cuenta?', altLink: 'Iniciar sesión' },
    name: 'Nombre', email: 'Correo', password: 'Contraseña',
    namePh: 'ej. Lucía Soler', emailPh: 'you@example.com', passwordPh: '8 caracteres o más',
    working: 'Un momento…',
  },
};

export default function AuthScreen({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const lang = useStore(s => s.lang);
  const dark = useStore(s => s.tweaks.darkMode);
  const accent = accentHex(useStore(s => s.tweaks.accent));
  const t = COPY[lang];
  const m = t[mode];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const fg = dark ? '#fff' : '#1A1538';
  const sub = dark ? 'rgba(255,255,255,0.6)' : 'rgba(26,21,56,0.6)';
  const fieldBg = dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)';
  const fieldBorder = dark ? 'rgba(255,255,255,0.10)' : 'rgba(26,21,56,0.10)';
  const cardBg = dark
    ? 'linear-gradient(155deg, rgba(120,90,200,0.16), rgba(60,40,140,0.05))'
    : 'linear-gradient(155deg, rgba(255,255,255,0.85), rgba(240,233,255,0.6))';

  const submit = async () => {
    if (busy) return;
    setError('');
    setBusy(true);
    try {
      if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || 'Something went wrong');
          setBusy(false);
          return;
        }
      }
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) {
        setError(pick(lang, {
          ko: '이메일 또는 비밀번호를 확인해 주세요', en: 'Check your email and password',
          ja: 'メールアドレスまたはパスワードをご確認ください', zh: '请检查邮箱或密码',
          es: 'Revisa tu correo y contraseña',
        }));
        setBusy(false);
        return;
      }
      // Reconcile with the cloud: adopt the account's data, or back local data up.
      await useStore.getState().init();
      const onboarded = useStore.getState().status === 'ready';
      router.push(onboarded ? '/' : '/onboarding');
      router.refresh();
    } catch {
      setError(pick(lang, {
        ko: '연결에 문제가 있어요', en: 'Connection problem',
        ja: '接続に問題があります', zh: '连接出现问题',
        es: 'Problema de conexión',
      }));
      setBusy(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', minHeight: 54, padding: '0 16px', borderRadius: 14,
    background: fieldBg, border: `0.5px solid ${fieldBorder}`,
    color: fg, fontSize: 16, outline: 'none', boxSizing: 'border-box', fontFamily: SANS,
  };

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      background: cosmicBg(dark), color: fg, overflow: 'hidden', fontFamily: SANS,
    }}>
      <StarField count={dark ? 70 : 22} seed={7} opacity={dark ? 0.6 : 0.14} />
      <div style={{
        position: 'relative', height: '100%', overflow: 'auto',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 22 }}>
          <ElementOrb element="water" size={72} animated />
          <div style={{ fontSize: 13, letterSpacing: 3, textTransform: 'uppercase',
                        color: accentInk(accent, dark), fontWeight: 600, marginTop: 14 }}>
            contextella
          </div>
          <div style={{ fontSize: 23, fontWeight: 600, color: fg, letterSpacing: -0.5, marginTop: 8, textAlign: 'center' }}>
            {m.title}
          </div>
          <div style={{ fontSize: 13.5, color: sub, marginTop: 6, textAlign: 'center', lineHeight: 1.5 }}>
            {m.sub}
          </div>
        </div>

        <div style={{
          borderRadius: 24, padding: '22px 20px', background: cardBg,
          border: `0.5px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)'}`,
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          {mode === 'register' && (
            <input value={name} onChange={e => setName(e.target.value)} placeholder={t.namePh}
                   aria-label={t.name} style={inputStyle} />
          )}
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder={t.emailPh}
                 type="email" autoComplete="email" aria-label={t.email} style={inputStyle} />
          <input value={password} onChange={e => setPassword(e.target.value)} placeholder={t.passwordPh}
                 type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                 aria-label={t.password} style={inputStyle}
                 onKeyDown={e => { if (e.key === 'Enter') submit(); }} />

          {error && (
            <div style={{ fontSize: 13, color: '#E8A4B5', lineHeight: 1.4 }}>{error}</div>
          )}

          <button onClick={submit} disabled={busy} style={{
            minHeight: 54, borderRadius: 14, border: 'none', cursor: busy ? 'wait' : 'pointer',
            background: `linear-gradient(135deg, ${accent}, ${shade(accent, -15)})`,
            color: '#1A1538', fontSize: 16, fontWeight: 600, letterSpacing: -0.2,
            boxShadow: `0 8px 20px ${accent}55`, fontFamily: SANS, marginTop: 4,
            opacity: busy ? 0.7 : 1,
          }}>{busy ? t.working : m.cta}</button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13.5, color: sub }}>
          {m.alt}{' '}
          <button onClick={() => router.push(mode === 'login' ? '/register' : '/login')} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: accentInk(accent, dark), fontSize: 13.5, fontWeight: 600, fontFamily: SANS,
          }}>{m.altLink}</button>
        </div>
      </div>
    </div>
  );
}
