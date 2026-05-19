import type { Lang } from '../types';
import { STEMS, GENERATES, inHarmony6, harmony3Element, isClash, isHarm, isPunish } from './constants';
import type { FourPillars } from './pillars';
import { elementBalance } from './profile';

export interface CompatFactor {
  id: string;
  polarity: 'positive' | 'negative';
  weight: number;
}

export interface Compatibility {
  score: number; // 5..98
  factors: CompatFactor[];
}

type BranchRel = 'h6' | 'h3' | 'clash' | 'punish' | 'harm' | null;

function branchRelation(a: number, b: number): BranchRel {
  if (inHarmony6(a, b)) return 'h6';
  if (harmony3Element(a, b)) return 'h3';
  if (isClash(a, b)) return 'clash';
  if (isPunish(a, b)) return 'punish';
  if (isHarm(a, b)) return 'harm';
  return null;
}

// Per-pillar branch-relation weights. Day branch (일지) carries the most weight.
const BRANCH_WEIGHTS: Record<'day' | 'year' | 'month' | 'hour', Partial<Record<NonNullable<BranchRel>, number>>> = {
  day: { h6: 14, h3: 13, clash: -17, punish: -9, harm: -7 },
  year: { h6: 7, h3: 6, clash: -8, punish: -3, harm: -4 },
  month: { h6: 5, h3: 5, clash: -6, punish: -3, harm: -3 },
  hour: { h6: 5, h3: 4, clash: -6, punish: -2, harm: -2 },
};

export function compatibility(a: FourPillars, b: FourPillars): Compatibility {
  const factors: CompatFactor[] = [];
  let score = 50;

  const add = (id: string, weight: number) => {
    factors.push({ id, polarity: weight >= 0 ? 'positive' : 'negative', weight });
    score += weight;
  };

  // --- Day master (일간) element relation ---
  const ea = STEMS[a.day.stem].element;
  const eb = STEMS[b.day.stem].element;
  if (ea === eb) {
    add('dm_same', 9);
  } else if (GENERATES[ea] === eb || GENERATES[eb] === ea) {
    add('dm_generative', 18);
  } else {
    add('dm_controlling', -7);
  }

  // --- Branch relations across the pillars ---
  const pillarPairs: ['day' | 'year' | 'month' | 'hour', number | null, number | null][] = [
    ['day', a.day.branch, b.day.branch],
    ['year', a.year.branch, b.year.branch],
    ['month', a.month.branch, b.month.branch],
    ['hour', a.hour?.branch ?? null, b.hour?.branch ?? null],
  ];
  for (const [key, ba, bb] of pillarPairs) {
    if (ba === null || bb === null) continue;
    const rel = branchRelation(ba, bb);
    if (!rel) continue;
    const w = BRANCH_WEIGHTS[key][rel];
    if (w !== undefined) add(`${key}_${rel}`, w);
  }

  // --- Element-balance complement: each fills the other's deficiency ---
  const balA = elementBalance(a);
  const balB = elementBalance(b);
  let complement = 0;
  (['water', 'wood', 'fire', 'earth', 'metal'] as const).forEach(el => {
    if (balA[el] < 12 && balB[el] > 25) complement += 3;
    if (balB[el] < 12 && balA[el] > 25) complement += 3;
  });
  if (complement > 0) add('balance_complement', Math.min(complement, 9));

  score = Math.max(5, Math.min(98, Math.round(score)));
  return { score, factors };
}

// --- Synergy / conflict prose generated from the compatibility factors ---

const PHRASES: Record<string, Record<Lang, string>> = {
  dm_same: {
    ko: '같은 결을 타고나, 말하지 않아도 통하는 사이',
    en: 'Born of the same grain — you understand without speaking',
    ja: '同じ機微を生まれ持ち、語らずとも通じ合う間柄',
    zh: '生来便是同样的纹理，无需言语也能相通',
    es: 'Nacidos de la misma textura: se entienden sin hablar',
  },
  dm_generative: {
    ko: '한 사람이 다른 사람을 자라게 하는, 생(生)의 결',
    en: 'One nourishes the other — a generative current',
    ja: '一方がもう一方を育てる、相生の流れ',
    zh: '一方滋养着另一方——相生的流动',
    es: 'Uno nutre al otro: una corriente que genera vida',
  },
  dm_controlling: {
    ko: '서로의 속도와 방향이 다를 수 있어요',
    en: 'Your pace and direction may pull apart',
    ja: '互いの速さと方向が異なるかもしれません',
    zh: '彼此的节奏与方向可能并不一致',
    es: 'Su ritmo y su rumbo pueden tirar en direcciones distintas',
  },
  day_h6: {
    ko: '일상의 결이 자연스럽게 맞물립니다',
    en: 'Your everyday rhythms lock together easily',
    ja: '日常の機微が自然とかみ合います',
    zh: '日常的纹理自然地契合在一起',
    es: 'Sus ritmos cotidianos encajan con naturalidad',
  },
  day_h3: {
    ko: '함께 있을 때 더 큰 흐름이 만들어집니다',
    en: 'Together you form a larger current',
    ja: '一緒にいると、より大きな流れが生まれます',
    zh: '在一起时，会形成更大的流动',
    es: 'Juntos forman una corriente más amplia',
  },
  day_clash: {
    ko: '가까운 거리에서 부딪힘이 생기기 쉬워요',
    en: 'Friction sparks easily at close range',
    ja: '近い距離では衝突が生じやすいです',
    zh: '距离太近时容易产生摩擦',
    es: 'A corta distancia, la fricción surge con facilidad',
  },
  day_punish: {
    ko: '오래 머물면 서로를 시험하게 될 수 있어요',
    en: 'Lingering too long, you may test each other',
    ja: '長くとどまると、互いを試すことになりがちです',
    zh: '相处过久，可能会彼此考验',
    es: 'Si se quedan demasiado, pueden ponerse a prueba',
  },
  day_harm: {
    ko: '사소한 어긋남이 쌓이지 않게 살펴주세요',
    en: 'Watch that small misalignments do not pile up',
    ja: '小さなズレが積み重ならないよう気を配って',
    zh: '留意别让细微的错位不断累积',
    es: 'Cuiden que los pequeños desencuentros no se acumulen',
  },
  year_h6: {
    ko: '뿌리와 배경이 서로를 편안하게 합니다',
    en: 'Your roots and backgrounds put each other at ease',
    ja: '根や背景が互いを安心させます',
    zh: '彼此的根基与背景让对方感到安心',
    es: 'Sus raíces y orígenes los hacen sentir cómodos',
  },
  year_h3: {
    ko: '큰 그림에서 같은 곳을 바라봅니다',
    en: 'In the big picture you look toward the same place',
    ja: '大きな視点で同じ場所を見つめています',
    zh: '在大方向上望向同一处',
    es: 'En el panorama amplio, miran hacia el mismo lugar',
  },
  year_clash: {
    ko: '자라온 결이 달라 기대가 어긋날 수 있어요',
    en: 'Different upbringings can misalign expectations',
    ja: '育ってきた機微が違い、期待がずれることがあります',
    zh: '成长的纹理不同，期待可能会错位',
    es: 'Crianzas distintas pueden desalinear las expectativas',
  },
  year_harm: {
    ko: '서로의 배경을 천천히 이해해 보세요',
    en: 'Take time to understand each other’s background',
    ja: '互いの背景をゆっくり理解してみましょう',
    zh: '试着慢慢理解彼此的背景',
    es: 'Tómense tiempo para entender el origen del otro',
  },
  month_h6: {
    ko: '함께하는 일과 계획이 잘 흘러갑니다',
    en: 'Shared work and plans flow smoothly',
    ja: '共にする仕事や計画がよく流れます',
    zh: '共同的工作与计划进展顺畅',
    es: 'El trabajo y los planes compartidos fluyen bien',
  },
  month_h3: {
    ko: '같이 무언가를 키워나가기 좋은 결',
    en: 'A grain well-suited to building something together',
    ja: '共に何かを育てていくのに良い機微',
    zh: '适合一起培育某些事物的纹理',
    es: 'Una textura propicia para construir algo juntos',
  },
  month_clash: {
    ko: '일의 우선순위가 엇갈릴 수 있어요',
    en: 'Priorities in work may cross',
    ja: '仕事の優先順位がすれ違うことがあります',
    zh: '工作的优先次序可能会有分歧',
    es: 'Las prioridades en el trabajo pueden cruzarse',
  },
  hour_h6: {
    ko: '하루의 끝, 함께 있을 때 편안합니다',
    en: 'At day’s end, you rest easy together',
    ja: '一日の終わり、共にいると安らげます',
    zh: '一天结束时，相伴会很安心',
    es: 'Al final del día, descansan a gusto juntos',
  },
  hour_h3: {
    ko: '깊은 시간을 함께 보내기 좋은 결',
    en: 'A grain for sharing the quieter hours',
    ja: '静かな時間を共に過ごすのに良い機微',
    zh: '适合一起度过静谧时光的纹理',
    es: 'Una textura para compartir las horas más calmas',
  },
  hour_clash: {
    ko: '쉬는 방식이 달라 거리감이 들 수 있어요',
    en: 'Different ways of resting can feel like distance',
    ja: '休み方が違い、距離を感じることがあります',
    zh: '休息方式不同，可能让人感到疏离',
    es: 'Descansar de forma distinta puede sentirse como distancia',
  },
  balance_complement: {
    ko: '서로의 부족한 기운을 채워주는 사이',
    en: 'You each fill what the other lacks',
    ja: '互いの足りない気を補い合う間柄',
    zh: '彼此填补对方欠缺之气的关系',
    es: 'Cada uno llena lo que al otro le falta',
  },
};

const FALLBACK: Record<'synergy' | 'conflict', Record<Lang, string>> = {
  synergy: {
    ko: '잔잔하지만 오래가는 결을 가진 사이',
    en: 'A quiet grain that lasts',
    ja: '穏やかながら長く続く機微を持つ間柄',
    zh: '拥有平静却长久纹理的关系',
    es: 'Una textura serena que perdura',
  },
  conflict: {
    ko: '특별히 조심할 결은 보이지 않아요',
    en: 'No grain that needs special care',
    ja: '特に気をつけるべき機微は見当たりません',
    zh: '没有需要特别留心的纹理',
    es: 'No hay textura que requiera un cuidado especial',
  },
};

export function synergyConflict(
  factors: CompatFactor[],
  lang: Lang,
): { synergies: string[]; conflicts: string[] } {
  const choose = (polarity: 'positive' | 'negative') =>
    factors
      .filter(f => f.polarity === polarity && PHRASES[f.id])
      .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
      .map(f => PHRASES[f.id][lang]);

  const synergies = choose('positive');
  const conflicts = choose('negative');
  if (synergies.length === 0) synergies.push(FALLBACK.synergy[lang]);
  if (conflicts.length === 0) conflicts.push(FALLBACK.conflict[lang]);
  return { synergies: synergies.slice(0, 4), conflicts: conflicts.slice(0, 3) };
}
