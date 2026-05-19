import type { ElementKey, Lang } from './types';

export const ACCENT_PALETTE = {
  champagne: { hex: '#E8D4A2', name: '샴페인', soft: 'rgba(232,212,162,0.16)' },
  gold:      { hex: '#F4C26B', name: '골드',   soft: 'rgba(244,194,107,0.18)' },
  rose:      { hex: '#E8A4B5', name: '로즈',   soft: 'rgba(232,164,181,0.18)' },
  lilac:     { hex: '#C9A8E8', name: '라일락', soft: 'rgba(201,168,232,0.18)' },
} as const;

export interface ElementInfo {
  label: Record<Lang, string>; // "물의 기운" / "Water Energy" / …
  short: Record<Lang, string>; // "물" / "Water" / …
  c1: string; c2: string; c3: string;
}

export const ELEMENTS: Record<ElementKey, ElementInfo> = {
  water: {
    label: { ko: '물의 기운', en: 'Water Energy', ja: '水の気', zh: '水之气', es: 'Energía de agua' },
    short: { ko: '물', en: 'Water', ja: '水', zh: '水', es: 'Agua' },
    c1: '#7AC4E8', c2: '#3D6FE8', c3: '#1A2A6B',
  },
  fire: {
    label: { ko: '불의 기운', en: 'Fire Energy', ja: '火の気', zh: '火之气', es: 'Energía de fuego' },
    short: { ko: '불', en: 'Fire', ja: '火', zh: '火', es: 'Fuego' },
    c1: '#FFB088', c2: '#E85A6B', c3: '#7A1F4D',
  },
  wood: {
    label: { ko: '나무의 기운', en: 'Wood Energy', ja: '木の気', zh: '木之气', es: 'Energía de madera' },
    short: { ko: '나무', en: 'Wood', ja: '木', zh: '木', es: 'Madera' },
    c1: '#9DD6A8', c2: '#3FA76A', c3: '#143D2B',
  },
  metal: {
    label: { ko: '쇠의 기운', en: 'Metal Energy', ja: '金の気', zh: '金之气', es: 'Energía de metal' },
    short: { ko: '쇠', en: 'Metal', ja: '金', zh: '金', es: 'Metal' },
    c1: '#F4E5C2', c2: '#C9A55E', c3: '#5C4220',
  },
  earth: {
    label: { ko: '흙의 기운', en: 'Earth Energy', ja: '土の気', zh: '土之气', es: 'Energía de tierra' },
    short: { ko: '흙', en: 'Earth', ja: '土', zh: '土', es: 'Tierra' },
    c1: '#D9B89A', c2: '#A87750', c3: '#3D2817',
  },
};

export const LANGS: { code: Lang; label: string; short: string }[] = [
  { code: 'ko', label: '한국어', short: 'KO' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ja', label: '日本語',  short: 'JA' },
  { code: 'zh', label: '中文',    short: 'ZH' },
  { code: 'es', label: 'Español', short: 'ES' },
];

export const SANS = "'Pretendard Variable', Pretendard, -apple-system, system-ui, 'Apple SD Gothic Neo', sans-serif";

export function formatDate(date: Date | string, lang: Lang): string {
  const d = (date instanceof Date) ? date : new Date(date);
  const Y = d.getFullYear(), M = d.getMonth() + 1, D = d.getDate();
  if (lang === 'ko') return `${Y}년 ${M}월 ${D}일`;
  if (lang === 'ja') return `${Y}年${M}月${D}日`;
  if (lang === 'zh') return `${Y}年${M}月${D}日`;
  if (lang === 'es') return `${D} de ${['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][M-1]} de ${Y}`;
  return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][M-1]} ${D}, ${Y}`;
}

export function parseBirth(str: string | null | undefined): Date | null {
  if (!str) return null;
  const [y, m, d] = str.split('.').map(Number);
  return new Date(y, m - 1, d);
}

export function shade(hex: string, pct: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, ((n >> 16) & 0xff) + Math.round(255 * pct / 100)));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + Math.round(255 * pct / 100)));
  const b = Math.max(0, Math.min(255, (n & 0xff) + Math.round(255 * pct / 100)));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

export const cosmicBg = (dark: boolean) => dark
  ? 'radial-gradient(ellipse 90% 60% at 50% 0%, #2A1F5E 0%, #16103A 38%, #0B0824 78%, #050415 100%)'
  : 'radial-gradient(ellipse 90% 60% at 50% 0%, #F0E9FF 0%, #E1D6F8 38%, #D6C7EC 78%, #C9B6E0 100%)';

export const pillBtn = (dark: boolean): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  minWidth: 44, height: 44, padding: '0 10px',
  borderRadius: 22,
  background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.55)',
  border: `0.5px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)'}`,
  cursor: 'pointer', color: 'inherit',
  fontFamily: SANS,
});
