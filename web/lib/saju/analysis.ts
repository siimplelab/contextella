import type { ElementKey, Lang } from '../types';
import { STEMS, BRANCHES, GENERATES, CONTROLS, THREE_HARMONY } from './constants';
import type { FourPillars, Pillar } from './pillars';
import { elementBalance } from './profile';

// ===========================================================================
// In-depth 명리학 (Saju) analysis.
//
// Everything here follows conventional, documented Saju algorithms — the same
// logic the popular reading services use — applied deterministically to the
// four pillars. No randomness: the same chart always yields the same reading.
//   · 십신 (Ten Gods)        — relation of every stem to the day master
//   · 신강·신약 (body strength) — 억부(抑扶) weighting of support vs. drain
//   · 용신 (favorable element) — the element the chart needs for balance
//   · 격국 (structure)        — the chart's defining pattern, from the month branch
//   · 십이운성 (twelve stages) — the day master's life-stage at each branch
//   · 신살 (symbolic stars)    — classic auspicious / cautionary markers
// ===========================================================================

// Compact 5-language string helper to keep the content tables readable.
const L = (ko: string, en: string, ja: string, zh: string, es: string): Record<Lang, string> =>
  ({ ko, en, ja, zh, es });

// Element produced *by* / controlled *by* a given element (inverse cycles).
const GENERATED_BY: Record<ElementKey, ElementKey> = { fire: 'wood', earth: 'fire', metal: 'earth', water: 'metal', wood: 'water' };
const CONTROLLED_BY: Record<ElementKey, ElementKey> = { earth: 'wood', water: 'earth', fire: 'water', metal: 'fire', wood: 'metal' };

// The heaviest hidden stem of a branch (정기/본기 — the branch's "true" qi).
function mainHidden(branch: number): number {
  return BRANCHES[branch].hidden.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
}

// ---------------------------------------------------------------------------
// 십신 (Ten Gods) — the relation of any stem to the day master.
// Element relation + matching/opposing polarity gives one of ten names.
// ---------------------------------------------------------------------------

export type TenGodKey =
  | 'bijian' | 'geopjae' | 'siksin' | 'sanggwan' | 'pyeonjae'
  | 'jeongjae' | 'pyeongwan' | 'jeonggwan' | 'pyeonin' | 'jeongin';

export const TEN_GOD_INFO: Record<TenGodKey, { hanja: string; label: Record<Lang, string>; gloss: Record<Lang, string> }> = {
  bijian:   { hanja: '比肩', label: L('비견', 'Peer', '比肩', '比肩', 'Par'),        gloss: L('주체성과 독립', 'self-reliance & independence', '主体性と独立', '主体与独立', 'autonomía e independencia') },
  geopjae:  { hanja: '劫財', label: L('겁재', 'Rival', '劫財', '劫财', 'Rival'),      gloss: L('경쟁심과 추진력', 'competition & drive', '競争心と推進力', '竞争与推动', 'competencia e impulso') },
  siksin:   { hanja: '食神', label: L('식신', 'Output', '食神', '食神', 'Obra'),      gloss: L('표현과 여유', 'expression & ease', '表現とゆとり', '表达与从容', 'expresión y holgura') },
  sanggwan: { hanja: '傷官', label: L('상관', 'Spark', '傷官', '伤官', 'Chispa'),     gloss: L('재능과 비판력', 'talent & sharp wit', '才能と批判力', '才华与锋芒', 'talento y agudeza') },
  pyeonjae: { hanja: '偏財', label: L('편재', 'Venture', '偏財', '偏财', 'Empresa'),  gloss: L('수완과 융통성', 'savvy & flexibility with means', '手腕と融通', '手腕与变通', 'astucia y flexibilidad') },
  jeongjae: { hanja: '正財', label: L('정재', 'Wealth', '正財', '正财', 'Caudal'),    gloss: L('성실함과 현실 감각', 'diligence & practicality', '誠実さと現実感覚', '踏实与务实', 'constancia y realismo') },
  pyeongwan:{ hanja: '偏官', label: L('편관', 'Force', '偏官', '偏官', 'Fuerza'),     gloss: L('결단과 카리스마', 'decisiveness & charisma', '決断とカリスマ', '决断与魄力', 'decisión y carisma') },
  jeonggwan:{ hanja: '正官', label: L('정관', 'Duty', '正官', '正官', 'Deber'),       gloss: L('책임감과 명예', 'responsibility & honor', '責任感と名誉', '责任与名誉', 'responsabilidad y honor') },
  pyeonin:  { hanja: '偏印', label: L('편인', 'Insight', '偏印', '偏印', 'Intuición'),gloss: L('직관과 독창성', 'intuition & originality', '直感と独創性', '直觉与独创', 'intuición y originalidad') },
  jeongin:  { hanja: '正印', label: L('정인', 'Wisdom', '正印', '正印', 'Saber'),     gloss: L('학문과 보살핌', 'learning & nurture', '学問と慈しみ', '学识与养护', 'saber y amparo') },
};

export function tenGodOf(dayStem: number, otherStem: number): TenGodKey {
  const d = STEMS[dayStem], x = STEMS[otherStem];
  const same = d.yin === x.yin;
  if (x.element === d.element) return same ? 'bijian' : 'geopjae';
  if (GENERATES[d.element] === x.element) return same ? 'siksin' : 'sanggwan';
  if (CONTROLS[d.element] === x.element) return same ? 'pyeonjae' : 'jeongjae';
  if (CONTROLS[x.element] === d.element) return same ? 'pyeongwan' : 'jeonggwan';
  return same ? 'pyeonin' : 'jeongin'; // x generates d
}

// ---------------------------------------------------------------------------
// 신강 · 신약 (body strength) — 억부(抑扶) method.
// Weigh every stem and hidden stem as either *supporting* the day master
// (비겁 + 인성) or *draining* it (식상 + 재성 + 관성). The month branch (월령)
// carries the most weight, the day branch next; the day stem itself is "self".
// ---------------------------------------------------------------------------

export type StrengthLevel = 'very-weak' | 'weak' | 'balanced' | 'strong' | 'very-strong';

export interface DayStrength {
  D: ElementKey;
  support: number;      // raw supporting weight
  drain: number;        // raw draining weight
  percent: number;      // support share, 0..100
  level: StrengthLevel;
  rootedInMonth: boolean; // 득령 — does the month branch support the day master?
}

const STEM_POS_W: Record<'year' | 'month' | 'day' | 'hour', number> = { year: 1.0, month: 1.4, day: 1.2, hour: 0.9 };
const BRANCH_POS_W: Record<'year' | 'month' | 'day' | 'hour', number> = { year: 1.1, month: 3.0, day: 1.8, hour: 1.0 };

export function dayStrength(p: FourPillars): DayStrength {
  const D = STEMS[p.day.stem].element;
  const supportSet = new Set<ElementKey>([D, GENERATED_BY[D]]); // 비겁 + 인성
  let support = 0, drain = 0;
  const add = (el: ElementKey, w: number) => { if (supportSet.has(el)) support += w; else drain += w; };

  const entries: ['year' | 'month' | 'day' | 'hour', Pillar | null][] =
    [['year', p.year], ['month', p.month], ['day', p.day], ['hour', p.hour]];
  for (const [key, pl] of entries) {
    if (!pl) continue;
    add(STEMS[pl.stem].element, STEM_POS_W[key]);
    for (const [si, wt] of BRANCHES[pl.branch].hidden) {
      add(STEMS[si].element, BRANCH_POS_W[key] * (wt / 30));
    }
  }

  const total = support + drain || 1;
  const percent = Math.round((support / total) * 100);
  const level: StrengthLevel =
    percent >= 68 ? 'very-strong'
    : percent >= 55 ? 'strong'
    : percent >= 45 ? 'balanced'
    : percent >= 32 ? 'weak'
    : 'very-weak';
  const rootedInMonth = supportSet.has(STEMS[mainHidden(p.month.branch)].element);
  return { D, support, drain, percent, level, rootedInMonth };
}

export const STRENGTH_TEXT: Record<StrengthLevel, { label: Record<Lang, string>; body: Record<Lang, string> }> = {
  'very-strong': {
    label: L('극신강', 'Very strong', '極身強', '极身强', 'Muy fuerte'),
    body: L(
      '자기 기운이 넘칠 만큼 강해요. 베풀고 덜어낼 때 비로소 흐름이 트입니다.',
      'The self-energy is overflowing — you thrive by giving and releasing, not hoarding.',
      '自分の気が溢れるほど強い。与え、手放すことで流れが開きます。',
      '自我之气极旺，懂得给予与释放方能通畅。',
      'La energía propia desborda: fluyes al dar y soltar, no al acumular.'),
  },
  strong: {
    label: L('신강', 'Strong', '身強', '身强', 'Fuerte'),
    body: L(
      '뿌리가 단단한 사람. 스스로 끌고 가는 힘이 있어 도전이 잘 어울립니다.',
      'Firmly rooted — you carry your own momentum and take well to challenge.',
      '根が強い人。自ら推し進める力があり、挑戦が似合います。',
      '根基稳固，自带推动力，适合迎接挑战。',
      'De raíz firme: llevas tu propio impulso y te va bien el reto.'),
  },
  balanced: {
    label: L('중화', 'Balanced', '中和', '中和', 'Equilibrado'),
    body: L(
      '기운이 고르게 균형 잡힌 귀한 사주. 상황에 유연하게 적응합니다.',
      'A rare, well-balanced chart — you adapt fluidly to whatever comes.',
      '気が均整のとれた貴重な四柱。状況に柔軟に適応します。',
      '五气均衡的难得命盘，能灵活适应境遇。',
      'Una carta rara y equilibrada: te adaptas con fluidez a lo que venga.'),
  },
  weak: {
    label: L('신약', 'Weak', '身弱', '身弱', 'Débil'),
    body: L(
      '주변과 함께할 때 빛나는 사람. 좋은 인연과 배움이 큰 힘이 됩니다.',
      'You shine alongside others — good allies and learning lift you most.',
      '周囲と共にいると輝く人。良縁と学びが大きな力に。',
      '与人同行时更出色，良缘与学习是你的助力。',
      'Brillas junto a otros: buenos aliados y aprendizaje te elevan.'),
  },
  'very-weak': {
    label: L('극신약', 'Very weak', '極身弱', '极身弱', 'Muy débil'),
    body: L(
      '흐름을 거스르기보다 따라갈 때 편안한 사주. 의지할 곳을 잘 고르세요.',
      'You ease best by flowing with the current — choose what you lean on with care.',
      '流れに逆らうより従うとき楽な四柱。頼る先を丁寧に選んで。',
      '顺势而为更自在，慎选所依靠之处。',
      'Fluyes mejor con la corriente que contra ella; elige bien tus apoyos.'),
  },
};

// ---------------------------------------------------------------------------
// 용신 (favorable element) — 억부용신.
// A strong day master needs draining (식상·재성·관성); a weak one needs
// support (인성·비겁). The single most-needed favorable element is the one
// least present in the chart.
// ---------------------------------------------------------------------------

export interface UsefulGods {
  favorable: ElementKey[];
  avoid: ElementKey[];
  primary: ElementKey; // 용신
}

export function usefulGods(p: FourPillars, strength: DayStrength): UsefulGods {
  const D = strength.D;
  const supporters: ElementKey[] = [D, GENERATED_BY[D]];                 // 비겁, 인성
  const drainers: ElementKey[] = [GENERATES[D], CONTROLS[D], CONTROLLED_BY[D]]; // 식상, 재성, 관성
  const strong = strength.percent >= 50;
  const favorable = strong ? drainers : supporters;
  const avoid = strong ? supporters : drainers;
  const bal = elementBalance(p);
  const primary = [...favorable].sort((a, b) => bal[a] - bal[b])[0];
  return { favorable, avoid, primary };
}

// Lifestyle correspondences for a favorable element — the colour / direction /
// season cues that reading services translate 용신 into.
export const ELEMENT_REMEDY: Record<ElementKey, { color: Record<Lang, string>; dir: Record<Lang, string>; season: Record<Lang, string> }> = {
  wood:  { color: L('초록·청록', 'green & teal', '緑・青緑', '绿·青', 'verde y turquesa'), dir: L('동쪽', 'east', '東', '东', 'este'),   season: L('봄', 'spring', '春', '春', 'primavera') },
  fire:  { color: L('빨강·주황', 'red & orange', '赤・橙', '红·橙', 'rojo y naranja'),    dir: L('남쪽', 'south', '南', '南', 'sur'),    season: L('여름', 'summer', '夏', '夏', 'verano') },
  earth: { color: L('노랑·황토', 'yellow & ochre', '黄・黄土', '黄·土', 'amarillo y ocre'),dir: L('중앙', 'center', '中央', '中央', 'centro'), season: L('환절기', 'between seasons', '季の変わり目', '季节之交', 'entre estaciones') },
  metal: { color: L('흰색·금색', 'white & gold', '白・金', '白·金', 'blanco y dorado'),    dir: L('서쪽', 'west', '西', '西', 'oeste'),   season: L('가을', 'autumn', '秋', '秋', 'otoño') },
  water: { color: L('검정·남색', 'black & navy', '黒・紺', '黑·藏蓝', 'negro y azul marino'),dir: L('북쪽', 'north', '北', '北', 'norte'),  season: L('겨울', 'winter', '冬', '冬', 'invierno') },
};

// ---------------------------------------------------------------------------
// 격국 (structure) — the chart's defining pattern, named for the ten god of
// the month branch's main hidden stem. The strongest single descriptor of a
// person's nature in classical 명리.
// ---------------------------------------------------------------------------

export type PatternKey = TenGodKey | 'geollok' | 'yangin';

export interface PatternInfo {
  key: PatternKey;
  name: Record<Lang, string>;
  body: Record<Lang, string>;
}

const PATTERN_TEXT: Record<PatternKey, { name: Record<Lang, string>; body: Record<Lang, string> }> = {
  geollok:  { name: L('건록격', 'Self-made pattern', '建禄格', '建禄格', 'Patrón autónomo'),
              body: L('자립으로 일어서는 결. 남에게 기대기보다 스스로 길을 냅니다.', 'A self-standing grain — you build your own path rather than lean on others.', '自立で立つ機微。人に頼らず自ら道を拓きます。', '自立而起的纹理，靠己开路。', 'Una textura que se sostiene sola: abres tu propio camino.') },
  yangin:   { name: L('양인격', 'Blade pattern', '羊刃格', '羊刃格', 'Patrón del filo'),
              body: L('강한 추진력과 승부욕. 힘을 잘 벼리면 큰일을 해냅니다.', 'Fierce drive and edge — honed well, it accomplishes great things.', '強い推進力と勝負心。力を研げば大事を成します。', '强劲推力与好胜，善加打磨成大器。', 'Empuje y filo intensos: bien afilados, logran grandes cosas.') },
  jeonggwan:{ name: L('정관격', 'Officer pattern', '正官格', '正官格', 'Patrón del deber'),
              body: L('책임과 원칙을 지키는 결. 신뢰와 명예가 따라옵니다.', 'You keep duty and principle — trust and honor follow.', '責任と原則を守る機微。信頼と名誉が伴います。', '守责任与原则，信誉随之。', 'Mantienes deber y principio: te siguen confianza y honor.') },
  pyeongwan:{ name: L('편관격', 'Authority pattern', '偏官格', '偏官格', 'Patrón del poder'),
              body: L('위기에 강하고 결단이 빠른 결. 리더의 무게를 견딥니다.', 'Strong in crisis and quick to decide — you bear a leader’s weight.', '危機に強く決断が速い機微。指導者の重みに耐えます。', '临危果决，担得起领袖之重。', 'Fuerte en crisis y decidido: cargas el peso de liderar.') },
  jeongjae: { name: L('정재격', 'Steady-wealth pattern', '正財格', '正财格', 'Patrón del caudal'),
              body: L('성실하게 쌓아 올리는 결. 꾸준함이 결실로 이어집니다.', 'You accrue through diligence — steadiness becomes harvest.', '誠実に積み上げる機微。地道さが実りに。', '踏实积累的纹理，恒久成果。', 'Acumulas con constancia: la firmeza se vuelve cosecha.') },
  pyeonjae: { name: L('편재격', 'Venture pattern', '偏財格', '偏财格', 'Patrón de la empresa'),
              body: L('흐름을 읽고 크게 굴리는 결. 수완과 사교가 빛납니다.', 'You read flows and move big — savvy and sociability shine.', '流れを読み大きく動かす機微。手腕と社交が光ります。', '识势善运的纹理，手腕与交际出众。', 'Lees corrientes y mueves en grande: brillan astucia y don de gentes.') },
  jeongin:  { name: L('정인격', 'Wisdom pattern', '正印格', '正印格', 'Patrón del saber'),
              body: L('배움과 사유로 깊어지는 결. 안정된 사고가 강점입니다.', 'You deepen through learning and thought — steady reasoning is your strength.', '学びと思索で深まる機微。安定した思考が強み。', '以学思见深，思维稳健为长。', 'Profundizas con saber y reflexión: tu fuerza es el juicio sereno.') },
  pyeonin:  { name: L('편인격', 'Insight pattern', '偏印格', '偏印格', 'Patrón de la intuición'),
              body: L('독특한 직관과 전문성의 결. 남다른 시각으로 파고듭니다.', 'A grain of singular intuition and expertise — you probe from a rare angle.', '独特な直感と専門性の機微。異なる視点で掘り下げます。', '独到直觉与专精，视角与众不同。', 'Intuición y pericia singulares: indagas desde un ángulo raro.') },
  siksin:   { name: L('식신격', 'Output pattern', '食神格', '食神格', 'Patrón de la obra'),
              body: L('편안하게 표현하고 만들어내는 결. 재능이 자연스레 흐릅니다.', 'You express and create with ease — talent flows naturally.', '安らかに表現し生み出す機微。才能が自然に流れます。', '从容表达创作，才华自流。', 'Expresas y creas con holgura: el talento fluye natural.') },
  sanggwan: { name: L('상관격', 'Brilliance pattern', '傷官格', '伤官格', 'Patrón de la chispa'),
              body: L('번뜩이는 재능과 표현력의 결. 틀을 깨는 데 강합니다.', 'Flashing talent and expression — strong at breaking molds.', '閃く才能と表現力の機微。型を破るのに強い。', '才华横溢善表达，长于破格。', 'Talento y expresión chispeantes: fuerte rompiendo moldes.') },
  bijian:   { name: L('비견격', 'Peer pattern', '比肩格', '比肩格', 'Patrón del par'),
              body: L('주관이 뚜렷하고 독립적인 결. 동료와 어깨를 나란히 합니다.', 'Strong-willed and independent — you stand shoulder to shoulder with peers.', '主観が明確で独立的な機微。仲間と肩を並べます。', '主见鲜明而独立，与同伴并肩。', 'De criterio firme e independiente: vas hombro con hombro.') },
  geopjae:  { name: L('겁재격', 'Rival pattern', '劫財格', '劫财格', 'Patrón del rival'),
              body: L('경쟁 속에서 강해지는 결. 승부의 자리에서 힘을 냅니다.', 'You grow strong amid rivalry — you rise where stakes are high.', '競争の中で強くなる機微。勝負所で力を発揮します。', '于竞争中变强，关键处见力。', 'Te fortaleces en la rivalidad: creces donde hay desafío.') },
};

export function chartPattern(p: FourPillars): PatternInfo {
  const tg = tenGodOf(p.day.stem, mainHidden(p.month.branch));
  let key: PatternKey = tg;
  if (tg === 'bijian') key = 'geollok';   // 비견 월령 → 건록격
  else if (tg === 'geopjae') key = 'yangin'; // 겁재 월령 → 양인격
  const t = PATTERN_TEXT[key];
  return { key, name: t.name, body: t.body };
}

// ---------------------------------------------------------------------------
// 십이운성 (Twelve Life Stages / 포태법) — the day master's "life stage" at a
// branch. Yang stems run forward from their 장생 branch, yin stems backward.
// ---------------------------------------------------------------------------

export type StageKey =
  | 'jangsaeng' | 'mokyok' | 'gwandae' | 'geollok' | 'jewang' | 'soe'
  | 'byeong' | 'sa' | 'myo' | 'jeol' | 'tae' | 'yang';

const STAGE_ORDER: StageKey[] = [
  'jangsaeng', 'mokyok', 'gwandae', 'geollok', 'jewang', 'soe',
  'byeong', 'sa', 'myo', 'jeol', 'tae', 'yang',
];

// 장생 branch for each stem (갑을병정무기경신임계).
const CHANGSAENG_BRANCH: number[] = [11, 6, 2, 9, 2, 9, 5, 0, 8, 3];

export const STAGE_INFO: Record<StageKey, { name: Record<Lang, string>; gloss: Record<Lang, string> }> = {
  jangsaeng:{ name: L('장생', 'Birth', '長生', '长生', 'Nacer'),       gloss: L('새롭게 태어나는 기운', 'a freshly born energy', '新たに生まれる気', '新生之气', 'energía recién nacida') },
  mokyok:   { name: L('목욕', 'Bathing', '沐浴', '沐浴', 'Baño'),      gloss: L('설렘과 변화, 매력', 'flux, allure, change', '揺らぎと魅力', '变动与魅力', 'cambio y atractivo') },
  gwandae:  { name: L('관대', 'Cap & Gown', '冠帯', '冠带', 'Mayoría'),gloss: L('성장과 사회 진출', 'growth, stepping out', '成長と社会進出', '成长与出仕', 'crecer y salir al mundo') },
  geollok:  { name: L('건록', 'Prime', '建禄', '建禄', 'Plenitud'),    gloss: L('자립과 안정된 힘', 'independence, settled strength', '自立と安定した力', '自立与稳力', 'autonomía y fuerza asentada') },
  jewang:   { name: L('제왕', 'Peak', '帝旺', '帝旺', 'Cénit'),        gloss: L('기운이 가장 왕성', 'energy at its fullest', '気が最も旺盛', '气最旺盛', 'energía en su cúspide') },
  soe:      { name: L('쇠', 'Waning', '衰', '衰', 'Mengua'),          gloss: L('정점을 지나 차분해짐', 'past the peak, calming', '頂を過ぎ落ち着く', '过顶趋稳', 'tras la cima, calma') },
  byeong:   { name: L('병', 'Frailty', '病', '病', 'Fragilidad'),     gloss: L('예민하고 섬세함', 'sensitive, delicate', '敏感で繊細', '敏感细腻', 'sensible y delicado') },
  sa:       { name: L('사', 'Stillness', '死', '死', 'Quietud'),      gloss: L('고요한 사색의 기운', 'quiet, contemplative', '静かな思索の気', '静思之气', 'energía contemplativa') },
  myo:      { name: L('묘', 'Storehouse', '墓', '墓', 'Reserva'),     gloss: L('갈무리하고 모으는', 'storing, conserving', '蓄え収める', '收藏蓄积', 'guardar y conservar') },
  jeol:     { name: L('절', 'Severance', '絶', '绝', 'Corte'),        gloss: L('비우고 전환하는', 'emptying, turning point', '空にし転換する', '清空转折', 'vaciar y virar') },
  tae:      { name: L('태', 'Conception', '胎', '胎', 'Concepción'),  gloss: L('새 가능성을 품음', 'holding new potential', '新たな可能性を宿す', '孕育新机', 'gestar potencial') },
  yang:     { name: L('양', 'Nurture', '養', '养', 'Crianza'),        gloss: L('자라기를 기다리는', 'nurtured, preparing', '育ちを待つ', '养待成长', 'nutrir y preparar') },
};

export function twelveStage(stem: number, branch: number): StageKey {
  const start = CHANGSAENG_BRANCH[stem];
  const dir = STEMS[stem].yin ? -1 : 1;
  const offset = (((branch - start) * dir) % 12 + 12) % 12;
  return STAGE_ORDER[offset];
}

export interface PillarStage { key: 'year' | 'month' | 'day' | 'hour'; stage: StageKey }

// The day master's stage at each pillar's branch (시주 omitted if unknown).
export function lifeStages(p: FourPillars): PillarStage[] {
  const ds = p.day.stem;
  const out: PillarStage[] = [];
  ([['year', p.year], ['month', p.month], ['day', p.day], ['hour', p.hour]] as const)
    .forEach(([key, pl]) => { if (pl) out.push({ key, stage: twelveStage(ds, pl.branch) }); });
  return out;
}

// ---------------------------------------------------------------------------
// 신살 (symbolic stars) — classic markers most reading services surface.
// Trio-based stars (도화·역마·화개) key off the day branch's 삼합 group;
// the rest key off the day stem or a full pillar's 간지.
// ---------------------------------------------------------------------------

export type SinsalKey =
  | 'cheoneul' | 'munchang' | 'dohwa' | 'yeokma' | 'hwagae' | 'yangin' | 'goegang' | 'baekho';

export const SINSAL_INFO: Record<SinsalKey, { name: Record<Lang, string>; tone: 'lucky' | 'caution' | 'mixed'; gloss: Record<Lang, string> }> = {
  cheoneul: { name: L('천을귀인', 'Heavenly Noble', '天乙貴人', '天乙贵人', 'Noble Celeste'), tone: 'lucky',
              gloss: L('가장 길한 귀인 — 위기에 귀인이 돕습니다', 'the most auspicious star — help arrives in need', '最も吉な貴人 — 危機に助けが来る', '至吉贵人，危难有助', 'la estrella más auspiciosa: llega ayuda en la necesidad') },
  munchang: { name: L('문창귀인', 'Scholar Star', '文昌貴人', '文昌贵人', 'Estrella del Saber'), tone: 'lucky',
              gloss: L('학문과 글재주, 총명함', 'learning, eloquence, brightness', '学問と文才、聡明', '文才学识，聪颖', 'estudio, elocuencia, lucidez') },
  dohwa:    { name: L('도화살', 'Peach Blossom', '桃花', '桃花', 'Flor de Durazno'), tone: 'mixed',
              gloss: L('매력과 인기, 끌어당기는 힘', 'charm, popularity, magnetism', '魅力と人気、惹きつける力', '魅力人气，吸引力', 'encanto, popularidad, magnetismo') },
  yeokma:   { name: L('역마살', 'Travel Horse', '驛馬', '驿马', 'Caballo Viajero'), tone: 'mixed',
              gloss: L('이동과 변화, 활동성', 'movement, change, restlessness', '移動と変化、活動性', '迁移变动，好动', 'movimiento, cambio, dinamismo') },
  hwagae:   { name: L('화개살', 'Canopy Star', '華蓋', '华盖', 'Estrella del Dosel'), tone: 'mixed',
              gloss: L('예술과 영성, 고독한 깊이', 'art, spirituality, solitary depth', '芸術と霊性、孤独な深み', '艺术灵性，独处之深', 'arte, espiritualidad, hondura solitaria') },
  yangin:   { name: L('양인살', 'Blade Star', '羊刃', '羊刃', 'Estrella del Filo'), tone: 'caution',
              gloss: L('강한 기세 — 잘 벼리면 큰 힘', 'fierce force — great power if honed', '強い気勢 — 研げば大きな力', '气势刚猛，善用成力', 'fuerza fiera: gran poder si se afina') },
  goegang:  { name: L('괴강살', 'Commander Star', '魁罡', '魁罡', 'Estrella del Mando'), tone: 'caution',
              gloss: L('카리스마와 결단, 극단의 기운', 'charisma, resolve, all-or-nothing', 'カリスマと決断、極端の気', '魅力决断，极端之气', 'carisma y resolución, todo o nada') },
  baekho:   { name: L('백호살', 'White Tiger', '白虎', '白虎', 'Tigre Blanco'), tone: 'caution',
              gloss: L('강렬한 추진력 — 안전에 유의', 'intense drive — mind your safety', '激しい推進力 — 安全に注意', '猛烈推力，注意安全', 'impulso intenso: cuida tu seguridad') },
};

// Trio (삼합 group) a branch belongs to, and its derived 도화/역마/화개 branches.
function trioStars(refBranch: number): { dohwa: number; yeokma: number; hwagae: number } | null {
  const trio = THREE_HARMONY.find(t => t.branches.includes(refBranch));
  if (!trio) return null;
  // The leading branch of each trio (the "생지") fixes the offsets:
  // 도화 = 목욕지, 역마 = 충(반대), 화개 = 묘지. Encoded per element.
  // Only the four 삼합 elements have trios (earth has none).
  const TABLE: Partial<Record<ElementKey, { dohwa: number; yeokma: number; hwagae: number }>> = {
    water: { dohwa: 9, yeokma: 2, hwagae: 4 },  // 申子辰
    fire:  { dohwa: 3, yeokma: 8, hwagae: 10 }, // 寅午戌
    metal: { dohwa: 6, yeokma: 11, hwagae: 1 }, // 巳酉丑
    wood:  { dohwa: 0, yeokma: 5, hwagae: 7 },  // 亥卯未
  };
  return TABLE[trio.element] ?? null;
}

const CHEONEUL: Record<number, number[]> = {
  0: [1, 7], 4: [1, 7], 6: [1, 7],   // 甲戊庚 → 丑未
  1: [0, 8], 5: [0, 8],              // 乙己 → 子申
  2: [11, 9], 3: [11, 9],            // 丙丁 → 亥酉
  7: [2, 6],                         // 辛 → 寅午
  8: [5, 3], 9: [5, 3],              // 壬癸 → 巳卯
};
const MUNCHANG: Record<number, number> = { 0: 5, 1: 6, 2: 8, 3: 9, 4: 8, 5: 9, 6: 11, 7: 0, 8: 2, 9: 3 };
const YANGIN: Record<number, number> = { 0: 3, 2: 6, 4: 6, 6: 9, 8: 0 }; // yang day stems only
const GOEGANG: [number, number][] = [[6, 4], [6, 10], [8, 4], [4, 10], [8, 10]]; // 庚辰庚戌壬辰戊戌壬戌
const BAEKHO: [number, number][] = [[0, 4], [1, 7], [2, 10], [3, 1], [4, 4], [8, 10], [9, 1]]; // 갑진을미병술정축무진임술계축

export function sinsalList(p: FourPillars): SinsalKey[] {
  const found = new Set<SinsalKey>();
  const branches = [p.year.branch, p.month.branch, p.day.branch, ...(p.hour ? [p.hour.branch] : [])];
  const pillars: Pillar[] = [p.year, p.month, p.day, ...(p.hour ? [p.hour] : [])];
  const ds = p.day.stem;

  const noble = CHEONEUL[ds] ?? [];
  if (branches.some(b => noble.includes(b))) found.add('cheoneul');
  if (branches.includes(MUNCHANG[ds])) found.add('munchang');
  if (ds in YANGIN && branches.includes(YANGIN[ds])) found.add('yangin');

  const stars = trioStars(p.day.branch);
  if (stars) {
    if (branches.includes(stars.dohwa)) found.add('dohwa');
    if (branches.includes(stars.yeokma)) found.add('yeokma');
    if (branches.includes(stars.hwagae)) found.add('hwagae');
  }

  if (GOEGANG.some(([s, b]) => p.day.stem === s && p.day.branch === b)) found.add('goegang');
  if (pillars.some(pl => BAEKHO.some(([s, b]) => pl.stem === s && pl.branch === b))) found.add('baekho');

  return [...found];
}

// ---------------------------------------------------------------------------
// One call that assembles the full in-depth reading for a chart.
// ---------------------------------------------------------------------------

export interface InDepthReading {
  strength: DayStrength;
  useful: UsefulGods;
  pattern: PatternInfo;
  stages: PillarStage[];
  sinsal: SinsalKey[];
}

export function inDepthReading(p: FourPillars): InDepthReading {
  const strength = dayStrength(p);
  return {
    strength,
    useful: usefulGods(p, strength),
    pattern: chartPattern(p),
    stages: lifeStages(p),
    sinsal: sinsalList(p),
  };
}
