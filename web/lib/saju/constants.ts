import type { ElementKey } from '../types';

// 천간 (Heavenly Stems) — index 0..9, 갑乙병정무기경신임계
export interface Stem {
  ko: string;
  en: string;
  hanja: string;
  element: ElementKey;
  yin: boolean;
}

export const STEMS: Stem[] = [
  { ko: '갑', en: 'Gap', hanja: '甲', element: 'wood', yin: false },
  { ko: '을', en: 'Eul', hanja: '乙', element: 'wood', yin: true },
  { ko: '병', en: 'Byeong', hanja: '丙', element: 'fire', yin: false },
  { ko: '정', en: 'Jeong', hanja: '丁', element: 'fire', yin: true },
  { ko: '무', en: 'Mu', hanja: '戊', element: 'earth', yin: false },
  { ko: '기', en: 'Gi', hanja: '己', element: 'earth', yin: true },
  { ko: '경', en: 'Gyeong', hanja: '庚', element: 'metal', yin: false },
  { ko: '신', en: 'Sin', hanja: '辛', element: 'metal', yin: true },
  { ko: '임', en: 'Im', hanja: '壬', element: 'water', yin: false },
  { ko: '계', en: 'Gye', hanja: '癸', element: 'water', yin: true },
];

// 지지 (Earthly Branches) — index 0..11, 자축인묘진사오미신유술해
// hidden = 지장간: [stemIndex, weight] pairs, weights sum to 30 per branch.
export interface Branch {
  ko: string;
  en: string;
  hanja: string;
  element: ElementKey;
  animal: string;
  hidden: [number, number][];
}

export const BRANCHES: Branch[] = [
  { ko: '자', en: 'Ja', hanja: '子', element: 'water', animal: 'rat', hidden: [[8, 10], [9, 20]] },
  { ko: '축', en: 'Chuk', hanja: '丑', element: 'earth', animal: 'ox', hidden: [[9, 9], [7, 3], [5, 18]] },
  { ko: '인', en: 'In', hanja: '寅', element: 'wood', animal: 'tiger', hidden: [[4, 7], [2, 7], [0, 16]] },
  { ko: '묘', en: 'Myo', hanja: '卯', element: 'wood', animal: 'rabbit', hidden: [[0, 10], [1, 20]] },
  { ko: '진', en: 'Jin', hanja: '辰', element: 'earth', animal: 'dragon', hidden: [[1, 9], [9, 3], [4, 18]] },
  { ko: '사', en: 'Sa', hanja: '巳', element: 'fire', animal: 'snake', hidden: [[4, 7], [6, 7], [2, 16]] },
  { ko: '오', en: 'O', hanja: '午', element: 'fire', animal: 'horse', hidden: [[2, 10], [5, 9], [3, 11]] },
  { ko: '미', en: 'Mi', hanja: '未', element: 'earth', animal: 'goat', hidden: [[3, 9], [1, 3], [5, 18]] },
  { ko: '신', en: 'Sin', hanja: '申', element: 'metal', animal: 'monkey', hidden: [[4, 7], [8, 7], [6, 16]] },
  { ko: '유', en: 'Yu', hanja: '酉', element: 'metal', animal: 'rooster', hidden: [[6, 10], [7, 20]] },
  { ko: '술', en: 'Sul', hanja: '戌', element: 'earth', animal: 'dog', hidden: [[7, 9], [3, 3], [4, 18]] },
  { ko: '해', en: 'Hae', hanja: '亥', element: 'water', animal: 'pig', hidden: [[4, 7], [0, 5], [8, 18]] },
];

export const ELEMENT_KEYS: ElementKey[] = ['water', 'wood', 'fire', 'earth', 'metal'];

// 오행 상생 (generation) / 상극 (control) cycles.
export const GENERATES: Record<ElementKey, ElementKey> = {
  wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood',
};
export const CONTROLS: Record<ElementKey, ElementKey> = {
  wood: 'earth', earth: 'water', water: 'fire', fire: 'metal', metal: 'wood',
};

// 지지 육합 (six harmonies): pairs of branch indices.
export const SIX_HARMONY: [number, number][] = [
  [0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7],
];

// 지지 삼합 (three harmonies): each trio resonates toward one element.
export const THREE_HARMONY: { branches: number[]; element: ElementKey }[] = [
  { branches: [8, 0, 4], element: 'water' },
  { branches: [2, 6, 10], element: 'fire' },
  { branches: [11, 3, 7], element: 'wood' },
  { branches: [5, 9, 1], element: 'metal' },
];

// 지지 충 (clash): a branch clashes with the one 6 positions away.
export function isClash(a: number, b: number): boolean {
  return (a - b + 12) % 12 === 6;
}

// 지지 해 (harm).
export const HARM: [number, number][] = [
  [0, 7], [1, 6], [2, 5], [3, 4], [8, 11], [9, 10],
];

// 지지 형 (punishment) — 삼형 + 상형.
export const PUNISH: number[][] = [
  [2, 5, 8],   // 인사신
  [1, 10, 7],  // 축술미
  [0, 3],      // 자묘 상형
];

export function inHarmony6(a: number, b: number): boolean {
  return SIX_HARMONY.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

export function harmony3Element(a: number, b: number): ElementKey | null {
  for (const t of THREE_HARMONY) {
    if (t.branches.includes(a) && t.branches.includes(b) && a !== b) return t.element;
  }
  return null;
}

export function isHarm(a: number, b: number): boolean {
  return HARM.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

export function isPunish(a: number, b: number): boolean {
  if (a === b && [4, 6, 9, 11].includes(a)) return true; // 자형
  return PUNISH.some(set => set.includes(a) && set.includes(b) && a !== b);
}
