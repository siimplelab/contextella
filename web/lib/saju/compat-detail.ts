import type { ElementKey, Lang } from '../types';
import {
  STEMS, ELEMENT_KEYS, GENERATES,
  inHarmony6, harmony3Element, isClash, isHarm, isPunish,
} from './constants';
import type { FourPillars } from './pillars';
import { elementBalance } from './profile';
import { dayStrength, usefulGods } from './analysis';

// ===========================================================================
// In-depth 궁합 (compatibility) reading — the conventional layers a Saju
// reader weighs when comparing two charts, surfaced individually instead of
// collapsed into a single number:
//   · 일간 조화   — how the two day masters' elements relate (상생/상극/비화)
//   · 일지 인연   — the bond between the two day branches (배우자궁)
//   · 오행 보완   — how well each fills the other's elemental gaps
//   · 용신 교류   — whether each supplies the element the other most needs
//   · 기둥별 인연 — the branch relation at every pillar (육합·삼합·충·형·해)
//   · 관계 신살   — relationship stars (천생연분·삼합·충·원진·도화)
// ===========================================================================

const L = (ko: string, en: string, ja: string, zh: string, es: string): Record<Lang, string> =>
  ({ ko, en, ja, zh, es });

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

// ---------------------------------------------------------------------------
// Scored dimensions — each a 0..100 sub-score with a one-line read.
// ---------------------------------------------------------------------------

export type CompatTone = 'good' | 'neutral' | 'tense';

export interface CompatDimension {
  key: 'dayMaster' | 'dayBranch' | 'complement' | 'usefulGod';
  label: Record<Lang, string>;
  value: number;
  tone: CompatTone;
  text: Record<Lang, string>;
}

const toneOf = (v: number): CompatTone => (v >= 70 ? 'good' : v >= 50 ? 'neutral' : 'tense');

// 일간 조화 — relation between the two day-master elements.
function dayMasterDim(ea: ElementKey, eb: ElementKey): CompatDimension {
  let value: number;
  let text: Record<Lang, string>;
  if (ea === eb) {
    value = 72;
    text = L('같은 기운을 타고나 말이 잘 통합니다.',
      'Born of the same element — you understand each other easily.',
      '同じ気を生まれ持ち、話が通じやすい。', '同气相求，沟通顺畅。',
      'Nacidos del mismo elemento: se entienden con facilidad.');
  } else if (GENERATES[ea] === eb || GENERATES[eb] === ea) {
    value = 90;
    text = L('한쪽이 다른 쪽을 살리는 상생의 궁합입니다.',
      'One nourishes the other — a generative bond.',
      '一方が他方を生かす相生の機微。', '一方滋养另一方，相生之缘。',
      'Uno nutre al otro: un vínculo generativo.');
  } else {
    value = 42;
    text = L('서로의 속도와 방향이 다를 수 있는 상극의 궁합입니다.',
      'A controlling relation — pace and direction may differ.',
      '互いの速さや方向が異なりうる相剋の機微。', '相克之缘，节奏方向或有不同。',
      'Una relación de control: ritmo y rumbo pueden diferir.');
  }
  return { key: 'dayMaster', value, tone: toneOf(value), text,
    label: L('일간 조화', 'Day masters', '日干の調和', '日主和合', 'Maestros del día') };
}

// 일지 인연 — bond between the two day branches (the intimate, daily axis).
function dayBranchDim(ba: number, bb: number): CompatDimension {
  let value = 60;
  let text = L('무난하게 곁을 지키는 사이입니다.',
    'A steady, easy companionship.', '無難に寄り添える間柄。', '平稳相伴的关系。',
    'Una compañía estable y llevadera.');
  if (inHarmony6(ba, bb)) {
    value = 92; text = L('일상이 자연스럽게 맞물리는 궁합입니다 (육합).',
      'Daily rhythms lock together naturally (육합).', '日常の機微が自然にかみ合う(六合)。',
      '日常自然契合（六合）。', 'Los ritmos diarios encajan solos (육합).');
  } else if (harmony3Element(ba, bb)) {
    value = 86; text = L('함께 더 큰 흐름을 만드는 삼합의 인연입니다.',
      'Together you form a larger current (삼합).', '共に大きな流れを生む三合の縁。',
      '共成更大流动（三合）。', 'Juntos forman una corriente mayor (삼합).');
  } else if (isClash(ba, bb)) {
    value = 36; text = L('가까울수록 부딪힘이 생기기 쉬워요 (충).',
      'Friction sparks at close range (충).', '近いほど衝突しやすい(沖)。',
      '越近越易摩擦（冲）。', 'A corta distancia surge fricción (충).');
  } else if (isPunish(ba, bb) || isHarm(ba, bb)) {
    value = 46; text = L('사소한 어긋남이 쌓이지 않게 살펴주세요 (형·해).',
      'Watch small misalignments (형·해).', '小さなズレに注意(刑・害)。',
      '留意细微错位（刑·害）。', 'Cuiden los pequeños desencuentros (형·해).');
  }
  return { key: 'dayBranch', value, tone: toneOf(value), text,
    label: L('일지 인연', 'Day branches', '日支の縁', '日支之缘', 'Ramas del día') };
}

// 오행 보완 — how well the two charts fill each other's elemental gaps.
function complementDim(balA: Record<ElementKey, number>, balB: Record<ElementKey, number>): CompatDimension {
  let comp = 0;
  ELEMENT_KEYS.forEach(el => {
    if (balA[el] < 12 && balB[el] > 22) comp += 1;
    if (balB[el] < 12 && balA[el] > 22) comp += 1;
  });
  const value = clamp(54 + comp * 13);
  const text = comp >= 2
    ? L('서로의 부족한 기운을 잘 채워주는 사이입니다.',
        'You fill each other’s lacking elements well.', '互いの足りない気をよく補い合う。',
        '彼此很好地补足欠缺之气。', 'Se complementan bien donde a cada uno le falta.')
    : comp === 1
      ? L('한쪽의 부족함을 다른 쪽이 채워줍니다.',
          'One fills a gap in the other.', '一方の不足を他方が補う。',
          '一方补足另一方的欠缺。', 'Uno cubre una carencia del otro.')
      : L('두 사람의 기운 구성이 비슷해 비슷한 강·약점을 공유합니다.',
          'Similar element makeup — you share the same strengths and gaps.',
          '気の構成が似て、長所も弱点も共有する。', '五行构成相近，长短处相似。',
          'Composición similar: comparten fortalezas y carencias.');
  return { key: 'complement', value, tone: toneOf(value), text,
    label: L('오행 보완', 'Element fit', '五行の補完', '五行互补', 'Complemento') };
}

// 용신 교류 — does each chart supply the element the other most needs?
function usefulGodDim(p: FourPillars, q: FourPillars,
  balA: Record<ElementKey, number>, balB: Record<ElementKey, number>) {
  const aGod = usefulGods(p, dayStrength(p)).primary;
  const bGod = usefulGods(q, dayStrength(q)).primary;
  const bSupply = balB[aGod]; // how much B carries A's needed element
  const aSupply = balA[bGod];
  const value = clamp(44 + (aSupply + bSupply) * 1.25);
  const text = (aSupply >= 20 && bSupply >= 20)
    ? L('서로가 서로의 용신을 든든히 채워주는 귀한 궁합입니다.',
        'Each richly supplies the other’s useful god — a rare fit.',
        '互いの用神を厚く満たす貴い相性。', '彼此厚补对方用神，难得之配。',
        'Cada uno nutre el dios útil del otro: un encaje raro.')
    : (aSupply >= 20 || bSupply >= 20)
      ? L('한쪽이 다른 쪽에게 꼭 필요한 기운을 줍니다.',
          'One gives the other an element they truly need.',
          '一方が相手に必要な気を与える。', '一方给予对方所需之气。',
          'Uno aporta al otro un elemento que de veras necesita.')
      : L('서로의 용신은 스스로 챙기는 편이 좋겠어요.',
          'Each is better off tending their own useful god.',
          '互いの用神は自分で補う方が良い。', '各自照顾自己的用神为宜。',
          'Cada uno hará bien en cuidar su propio dios útil.');
  return {
    dim: { key: 'usefulGod' as const, value, tone: toneOf(value), text,
      label: L('용신 교류', 'Useful-god exchange', '用神の交流', '用神交流', 'Intercambio de dios útil') },
    aGod, bGod, aSupply, bSupply,
  };
}

// ---------------------------------------------------------------------------
// 기둥별 인연 — the branch relation at each of the four pillars.
// ---------------------------------------------------------------------------

export type BondType = 'h6' | 'h3' | 'clash' | 'punish' | 'harm' | 'none';

export interface PillarBond { key: 'year' | 'month' | 'day' | 'hour'; type: BondType }

function bondType(a: number, b: number): BondType {
  if (inHarmony6(a, b)) return 'h6';
  if (harmony3Element(a, b)) return 'h3';
  if (isClash(a, b)) return 'clash';
  if (isPunish(a, b)) return 'punish';
  if (isHarm(a, b)) return 'harm';
  return 'none';
}

export const PILLAR_BOND_LABEL: Record<'year' | 'month' | 'day' | 'hour', Record<Lang, string>> = {
  year: L('년주 · 뿌리', 'Year · roots', '年柱 · 根', '年柱 · 根', 'Año · raíces'),
  month: L('월주 · 일상', 'Month · daily life', '月柱 · 日常', '月柱 · 日常', 'Mes · vida diaria'),
  day: L('일주 · 본인', 'Day · the self', '日柱 · 本人', '日柱 · 本人', 'Día · uno mismo'),
  hour: L('시주 · 속마음', 'Hour · inner world', '時柱 · 内面', '时柱 · 内心', 'Hora · interior'),
};

export const BOND_INFO: Record<BondType, { name: Record<Lang, string>; tone: CompatTone; gloss: Record<Lang, string> }> = {
  h6: { name: L('육합', '육합 (harmony)', '六合', '六合', '육합'), tone: 'good',
        gloss: L('끌어당기고 화합하는 궁합', 'drawn together, in accord', '惹かれ合い和合', '相吸和合', 'atracción y acuerdo') },
  h3: { name: L('삼합', '삼합 (alliance)', '三合', '三合', '삼합'), tone: 'good',
        gloss: L('함께 큰 흐름을 이루는 궁합', 'forming a larger current', '大きな流れを成す', '共成大势', 'forman una gran corriente') },
  clash: { name: L('충', '충 (clash)', '沖', '冲', '충'), tone: 'tense',
        gloss: L('부딪히며 자극하는 궁합', 'clashing, stimulating', 'ぶつかり刺激し合う', '冲撞激荡', 'choque y estímulo') },
  punish: { name: L('형', '형 (friction)', '刑', '刑', '형'), tone: 'tense',
        gloss: L('서로를 시험하는 궁합', 'testing one another', '互いを試す', '彼此考验', 'se ponen a prueba') },
  harm: { name: L('해', '해 (harm)', '害', '害', '해'), tone: 'tense',
        gloss: L('미세하게 어긋나는 궁합', 'small misalignments', '微かにずれる', '细微相妨', 'leves desencuentros') },
  none: { name: L('무난', 'neutral', '無難', '平', 'neutral'), tone: 'neutral',
        gloss: L('특별한 작용 없이 잔잔한 궁합', 'quiet, no strong pull', '特に作用なく穏やか', '平和无强作用', 'tranquilo, sin tirón fuerte') },
};

// ---------------------------------------------------------------------------
// 관계 신살 — relationship stars read between the two day branches.
// ---------------------------------------------------------------------------

export type CompatStarKey = 'yukhap' | 'samhap' | 'chung' | 'wonjin' | 'dohwa';

export const COMPAT_STAR_INFO: Record<CompatStarKey, { name: Record<Lang, string>; tone: CompatTone; gloss: Record<Lang, string> }> = {
  yukhap: { name: L('천생연분 · 육합', 'Made for each other · 육합', '天生の縁 · 六合', '天生一对 · 六合', 'Hechos el uno para el otro'), tone: 'good',
    gloss: L('자연스레 끌리고 오래 함께하는 궁합', 'a natural, lasting pull', '自然に惹かれ長く続く', '自然相吸、长久', 'una atracción natural y duradera') },
  samhap: { name: L('찰떡궁합 · 삼합', 'Perfect alliance · 삼합', '相性抜群 · 三合', '绝佳搭配 · 三合', 'Alianza perfecta'), tone: 'good',
    gloss: L('함께 큰일을 도모하기 좋은 궁합', 'great for building things together', '共に大事を成すに良い', '宜共谋大事', 'ideal para construir juntos') },
  chung: { name: L('애증 · 충', 'Push and pull · 충', '愛憎 · 沖', '爱憎 · 冲', 'Tira y afloja'), tone: 'tense',
    gloss: L('강하게 끌리지만 부딪히기도 하는 궁합', 'magnetic yet clashing', '強く惹かれつつ衝突も', '强烈相吸却也冲撞', 'magnético pero chocante') },
  wonjin: { name: L('원진살', 'Resentment star · 원진', '怨嗔殺', '怨嗔煞', 'Estrella del rencor'), tone: 'tense',
    gloss: L('이유 없이 서운함이 쌓이기 쉬운 궁합', 'unspoken resentment can build', '理由なく不満が募りやすい', '易生无名怨怼', 'puede crecer el rencor callado') },
  dohwa: { name: L('도화 교류', 'Peach-blossom draw · 도화', '桃花の交流', '桃花交流', 'Atracción de flor de durazno'), tone: 'good',
    gloss: L('서로에게 설레고 끌리는 궁합', 'a flush of mutual attraction', '互いにときめき惹かれる', '彼此心动相吸', 'un flechazo mutuo') },
};

// 도화 branch for a reference branch's 삼합 group.
const DOHWA_OF: Record<number, number> = {
  8: 9, 0: 9, 4: 9,   // 申子辰 → 酉
  2: 3, 6: 3, 10: 3,  // 寅午戌 → 卯
  5: 6, 9: 6, 1: 6,   // 巳酉丑 → 午
  11: 0, 3: 0, 7: 0,  // 亥卯未 → 子
};
const WONJIN: [number, number][] = [[0, 7], [1, 6], [2, 9], [3, 8], [4, 11], [5, 10]];
const isWonjin = (a: number, b: number) => WONJIN.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

function compatStars(ba: number, bb: number): CompatStarKey[] {
  const out: CompatStarKey[] = [];
  if (inHarmony6(ba, bb)) out.push('yukhap');
  if (harmony3Element(ba, bb)) out.push('samhap');
  if (isClash(ba, bb)) out.push('chung');
  if (isWonjin(ba, bb)) out.push('wonjin');
  if (DOHWA_OF[ba] === bb || DOHWA_OF[bb] === ba) out.push('dohwa');
  return out;
}

// ---------------------------------------------------------------------------
// The assembled detailed reading.
// ---------------------------------------------------------------------------

export interface CompatDetail {
  dimensions: CompatDimension[];
  pillarBonds: PillarBond[];
  stars: CompatStarKey[];
  usefulGod: { aGod: ElementKey; bGod: ElementKey; aSupply: number; bSupply: number };
}

// `a` is "me", `b` is the other person.
export function compatDetail(a: FourPillars, b: FourPillars): CompatDetail {
  const balA = elementBalance(a);
  const balB = elementBalance(b);
  const ug = usefulGodDim(a, b, balA, balB);

  const dimensions: CompatDimension[] = [
    dayMasterDim(STEMS[a.day.stem].element, STEMS[b.day.stem].element),
    dayBranchDim(a.day.branch, b.day.branch),
    complementDim(balA, balB),
    ug.dim,
  ];

  const pairs: [PillarBond['key'], number | null, number | null][] = [
    ['year', a.year.branch, b.year.branch],
    ['month', a.month.branch, b.month.branch],
    ['day', a.day.branch, b.day.branch],
    ['hour', a.hour?.branch ?? null, b.hour?.branch ?? null],
  ];
  const pillarBonds: PillarBond[] = [];
  for (const [key, x, y] of pairs) {
    if (x === null || y === null) continue;
    pillarBonds.push({ key, type: bondType(x, y) });
  }

  return {
    dimensions,
    pillarBonds,
    stars: compatStars(a.day.branch, b.day.branch),
    usefulGod: { aGod: ug.aGod, bGod: ug.bGod, aSupply: ug.aSupply, bSupply: ug.bSupply },
  };
}
