import type { ElementKey, Lang } from '../types';
import { STEMS, BRANCHES, ELEMENT_KEYS, GENERATES, CONTROLS } from './constants';
import type { FourPillars, Pillar } from './pillars';

// 일간 (day stem) — the person's primary element / "day master".
export function dayMaster(p: FourPillars): ElementKey {
  return STEMS[p.day.stem].element;
}

// 오행 분포: every visible stem contributes 1 to its element; every branch
// contributes 1 distributed across its 지장간 (hidden stems) by weight.
// Returns integer percentages summing to 100.
export function elementBalance(p: FourPillars): Record<ElementKey, number> {
  const raw: Record<ElementKey, number> = { water: 0, wood: 0, fire: 0, earth: 0, metal: 0 };
  const pillars: (Pillar | null)[] = [p.year, p.month, p.day, p.hour];

  for (const pl of pillars) {
    if (!pl) continue;
    raw[STEMS[pl.stem].element] += 1;
    for (const [stemIdx, weight] of BRANCHES[pl.branch].hidden) {
      raw[STEMS[stemIdx].element] += weight / 30;
    }
  }

  const total = ELEMENT_KEYS.reduce((s, k) => s + raw[k], 0) || 1;
  // Largest-remainder rounding so the percentages sum to exactly 100.
  const exact = ELEMENT_KEYS.map(k => ({ k, v: (raw[k] / total) * 100 }));
  const floored = exact.map(e => ({ ...e, f: Math.floor(e.v), r: e.v - Math.floor(e.v) }));
  let remainder = 100 - floored.reduce((s, e) => s + e.f, 0);
  floored.sort((a, b) => b.r - a.r);
  const out: Record<ElementKey, number> = { water: 0, wood: 0, fire: 0, earth: 0, metal: 0 };
  for (const e of floored) {
    out[e.k] = e.f + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder--;
  }
  return out;
}

export interface PillarView {
  key: 'year' | 'month' | 'day' | 'hour';
  label: Record<Lang, string>;
  // The stem/branch glyph per language: Hangul for ko, Hanja for ja/zh,
  // romanization for en/es.
  stem: Record<Lang, string>;
  branch: Record<Lang, string>;
  element: ElementKey; // element of the stem
}

const PILLAR_LABELS: Record<'year' | 'month' | 'day' | 'hour', Record<Lang, string>> = {
  year: { ko: '년주', en: 'Year', ja: '年柱', zh: '年柱', es: 'Año' },
  month: { ko: '월주', en: 'Month', ja: '月柱', zh: '月柱', es: 'Mes' },
  day: { ko: '일주', en: 'Day', ja: '日柱', zh: '日柱', es: 'Día' },
  hour: { ko: '시주', en: 'Hour', ja: '時柱', zh: '时柱', es: 'Hora' },
};

// --- Day master (일간) character reading -------------------------------------
// Each of the ten heavenly stems carries a classic image (큰 나무, 태양, 바다…)
// that describes the person's core temperament. Indexed by p.day.stem (0..9).

export interface DayMasterReading {
  stem: Record<Lang, string>;   // glyph: Hangul (ko) / Hanja (ja,zh) / roman (en,es)
  element: ElementKey;
  yin: boolean;
  image: Record<Lang, string>;  // the natural image, e.g. "큰 나무"
  title: Record<Lang, string>;  // a short epithet
  body: Record<Lang, string>;   // one-sentence temperament reading
}

const DAY_MASTER_TEXT: { image: Record<Lang, string>; title: Record<Lang, string>; body: Record<Lang, string> }[] = [
  { // 0 갑 甲 — yang wood
    image: { ko: '큰 나무', en: 'a great tree', ja: '大木', zh: '大树', es: 'un gran árbol' },
    title: { ko: '곧게 자라는 사람', en: 'The one who grows upright', ja: 'まっすぐ伸びる人', zh: '正直生长之人', es: 'Quien crece recto' },
    body: {
      ko: '뿌리를 깊이 내리고 위로 곧게 뻗는 결. 책임을 지고 앞장서는 자리가 잘 어울립니다.',
      en: 'A grain that roots deep and rises straight — suited to leading and carrying responsibility.',
      ja: '深く根を張り、まっすぐ上へ伸びる機微。責任を負い先頭に立つ役がよく似合います。',
      zh: '深扎根、向上挺立的纹理，适合担当与带头。',
      es: 'Una textura que echa raíces hondas y se eleva recta: hecha para liderar y asumir responsabilidad.',
    },
  },
  { // 1 을 乙 — yin wood
    image: { ko: '화초와 덩굴', en: 'vines and flowers', ja: '草花と蔓', zh: '花草藤蔓', es: 'enredaderas y flores' },
    title: { ko: '유연하게 휘어지는 사람', en: 'The one who bends without breaking', ja: 'しなやかに曲がる人', zh: '柔韧不折之人', es: 'Quien se dobla sin romperse' },
    body: {
      ko: '바람에 휘어도 부러지지 않는 결. 환경에 부드럽게 적응하며 끈질기게 살아남습니다.',
      en: 'A grain that bends in the wind yet never breaks — adapting softly and enduring quietly.',
      ja: '風に揺れても折れない機微。環境に柔らかく適応し、粘り強く生き抜きます。',
      zh: '随风弯而不折的纹理，柔软适应、坚韧生存。',
      es: 'Una textura que se dobla con el viento sin quebrarse: se adapta con suavidad y perdura.',
    },
  },
  { // 2 병 丙 — yang fire
    image: { ko: '한낮의 태양', en: 'the midday sun', ja: '真昼の太陽', zh: '正午的太阳', es: 'el sol del mediodía' },
    title: { ko: '밝게 비추는 사람', en: 'The one who shines openly', ja: '明るく照らす人', zh: '明亮普照之人', es: 'Quien brilla sin reservas' },
    body: {
      ko: '가리지 않고 환하게 비추는 결. 솔직하고 열정적이며 주변을 따뜻하게 데웁니다.',
      en: 'A grain that lights everything without holding back — frank, warm, and full of heat.',
      ja: '隔てなく明るく照らす機微。率直で情熱的、周りを温めます。',
      zh: '不分彼此地照亮的纹理，坦率热情、温暖周遭。',
      es: 'Una textura que ilumina todo sin reservas: franca, cálida y llena de fuego.',
    },
  },
  { // 3 정 丁 — yin fire
    image: { ko: '촛불과 등불', en: 'a candle’s flame', ja: '灯火', zh: '烛火灯火', es: 'la llama de una vela' },
    title: { ko: '곁을 데우는 사람', en: 'The one who warms what is near', ja: 'そばを温める人', zh: '温暖身边之人', es: 'Quien calienta lo cercano' },
    body: {
      ko: '조용히 오래 타며 주변을 밝히는 결. 섬세하고 헌신적이며 가까운 사람을 살뜰히 챙깁니다.',
      en: 'A grain that burns quietly and long — delicate, devoted, attentive to those close by.',
      ja: '静かに長く灯る機微。繊細で献身的、近しい人を丁寧に気遣います。',
      zh: '静静长燃、照亮身边的纹理，细腻专注、体贴近人。',
      es: 'Una textura que arde callada y duradera: delicada, devota y atenta a los suyos.',
    },
  },
  { // 4 무 戊 — yang earth
    image: { ko: '높은 산과 대지', en: 'mountain and earth', ja: '高い山と大地', zh: '高山大地', es: 'la montaña y la tierra' },
    title: { ko: '든든히 버티는 사람', en: 'The one who stands firm', ja: 'どっしり構える人', zh: '稳重立定之人', es: 'Quien se mantiene firme' },
    body: {
      ko: '흔들리지 않고 자리를 지키는 결. 믿음직하고 포용력이 커서 사람들이 기대어 옵니다.',
      en: 'A grain that holds its place unshaken — dependable and broad, a place others lean on.',
      ja: '揺るがず場を守る機微。頼もしく包容力があり、人が寄りかかってきます。',
      zh: '不动如山、守住其位的纹理，可靠包容、令人依靠。',
      es: 'Una textura que sostiene su lugar sin moverse: confiable y amplia, un apoyo para otros.',
    },
  },
  { // 5 기 己 — yin earth
    image: { ko: '밭과 정원의 흙', en: 'garden soil', ja: '畑と庭の土', zh: '田园之土', es: 'la tierra del jardín' },
    title: { ko: '길러내는 사람', en: 'The one who cultivates', ja: '育てる人', zh: '培育之人', es: 'Quien cultiva' },
    body: {
      ko: '씨앗을 품어 길러내는 결. 실용적이고 헌신적이며 조용히 주변을 보살핍니다.',
      en: 'A grain that holds seeds and raises them — practical, giving, quietly nurturing.',
      ja: '種を抱いて育てる機微。実用的で献身的、静かに周りを世話します。',
      zh: '怀种育苗的纹理，务实奉献、默默照料。',
      es: 'Una textura que acoge semillas y las cría: práctica, generosa, cuidadora callada.',
    },
  },
  { // 6 경 庚 — yang metal
    image: { ko: '무쇠와 도끼', en: 'iron and axe', ja: '鋼と斧', zh: '钢铁与斧', es: 'el hierro y el hacha' },
    title: { ko: '결단하는 사람', en: 'The one who decides', ja: '決断する人', zh: '果断之人', es: 'Quien decide' },
    body: {
      ko: '단단하고 거침없는 결. 의리 있고 결단이 빨라 어려운 순간에 힘을 냅니다.',
      en: 'A grain that is hard and unhesitating — loyal and decisive, strong in hard moments.',
      ja: '硬く迷いのない機微。義理堅く決断が早く、難所で力を発揮します。',
      zh: '坚硬果决的纹理，重义气、决断快，难关之中显力量。',
      es: 'Una textura dura y sin titubeos: leal y resolutiva, fuerte en los momentos difíciles.',
    },
  },
  { // 7 신 辛 — yin metal
    image: { ko: '보석과 세공된 금속', en: 'a polished jewel', ja: '宝石と細工された金属', zh: '珠宝与精工之金', es: 'una joya pulida' },
    title: { ko: '벼려낸 사람', en: 'The one who is finely honed', ja: '研ぎ澄まされた人', zh: '精雕细琢之人', es: 'Quien está afinado' },
    body: {
      ko: '갈고 다듬어 빛나는 결. 감각이 예민하고 기준이 분명하며 아름다움을 알아봅니다.',
      en: 'A grain ground to a shine — keen-sensed, exacting, with an eye for beauty.',
      ja: '磨き上げて輝く機微。感覚が鋭く基準が明確で、美を見分けます。',
      zh: '琢磨生辉的纹理，感觉敏锐、标准分明，识得美好。',
      es: 'Una textura pulida hasta brillar: de sentidos finos, exigente y con ojo para la belleza.',
    },
  },
  { // 8 임 壬 — yang water
    image: { ko: '큰 바다와 강', en: 'sea and river', ja: '大海と川', zh: '大海与江河', es: 'el mar y el río' },
    title: { ko: '넓게 흐르는 사람', en: 'The one who flows wide', ja: '広く流れる人', zh: '广阔流动之人', es: 'Quien fluye amplio' },
    body: {
      ko: '거침없이 흐르며 모든 것을 품는 결. 지혜롭고 활달하며 변화를 두려워하지 않습니다.',
      en: 'A grain that flows freely and holds everything — wise, expansive, unafraid of change.',
      ja: '滔々と流れすべてを抱く機微。知的で活発、変化を恐れません。',
      zh: '奔流不息、容纳万物的纹理，睿智豁达、不惧变化。',
      es: 'Una textura que fluye libre y todo lo abarca: sabia, expansiva, sin miedo al cambio.',
    },
  },
  { // 9 계 癸 — yin water
    image: { ko: '비와 이슬', en: 'rain and dew', ja: '雨と露', zh: '雨与露', es: 'la lluvia y el rocío' },
    title: { ko: '스며드는 사람', en: 'The one who seeps in gently', ja: '染み入る人', zh: '润物无声之人', es: 'Quien se filtra con suavidad' },
    body: {
      ko: '소리 없이 스며 적시는 결. 직관이 깊고 부드러우며 끈질기게 제 길을 냅니다.',
      en: 'A grain that seeps in without a sound — deeply intuitive, gentle, quietly persistent.',
      ja: '音もなく染み込む機微。直感が深く柔らかで、粘り強く道を拓きます。',
      zh: '无声渗润的纹理，直觉深、性子柔，却坚持开出自己的路。',
      es: 'Una textura que se filtra sin ruido: muy intuitiva, suave y tenaz en su camino.',
    },
  },
];

export function dayMasterReading(p: FourPillars): DayMasterReading {
  const idx = p.day.stem;
  const s = STEMS[idx];
  const text = DAY_MASTER_TEXT[idx];
  return {
    stem: { ko: s.ko, en: s.en, es: s.en, ja: s.hanja, zh: s.hanja },
    element: s.element,
    yin: s.yin,
    image: text.image,
    title: text.title,
    body: text.body,
  };
}

// --- Ten Gods (십성) distribution --------------------------------------------
// Every other element relates to the day master in one of five ways. Grouping
// the chart's element weights by that relation gives a compact personality read:
// 비겁(self) · 식상(expression) · 재성(resource/control) · 관성(discipline) · 인성(support).

export type TenGodGroupKey = 'companion' | 'output' | 'wealth' | 'authority' | 'resource';

export interface TenGodGroup {
  key: TenGodGroupKey;
  label: Record<Lang, string>;
  hanja: string;
  meaning: Record<Lang, string>;
  value: number; // percentage 0..100
}

const TEN_GOD_GROUP_META: Record<TenGodGroupKey, { hanja: string; label: Record<Lang, string>; meaning: Record<Lang, string> }> = {
  companion: {
    hanja: '比劫',
    label: { ko: '비겁 · 나', en: 'Self', ja: '比劫 · 自我', zh: '比劫 · 自我', es: 'Yo' },
    meaning: {
      ko: '자립심과 경쟁심, 동료와 함께하는 힘',
      en: 'Independence, drive, and strength among peers',
      ja: '自立心と競争心、仲間と並ぶ力',
      zh: '自立与竞争，与同伴并肩之力',
      es: 'Independencia, empuje y fuerza entre iguales',
    },
  },
  output: {
    hanja: '食傷',
    label: { ko: '식상 · 표현', en: 'Expression', ja: '食傷 · 表現', zh: '食伤 · 表达', es: 'Expresión' },
    meaning: {
      ko: '창의성과 표현, 만들어내고 드러내는 힘',
      en: 'Creativity and expression — making and showing',
      ja: '創造性と表現、生み出し示す力',
      zh: '创造与表达，创作与展现之力',
      es: 'Creatividad y expresión: crear y mostrar',
    },
  },
  wealth: {
    hanja: '財星',
    label: { ko: '재성 · 현실', en: 'Resource', ja: '財星 · 現実', zh: '财星 · 现实', es: 'Recurso' },
    meaning: {
      ko: '현실 감각과 실행, 가지고 다루는 힘',
      en: 'Practicality and control — handling the tangible',
      ja: '現実感覚と実行、扱い動かす力',
      zh: '务实与执行，掌握实物之力',
      es: 'Sentido práctico y control: manejar lo tangible',
    },
  },
  authority: {
    hanja: '官星',
    label: { ko: '관성 · 절제', en: 'Discipline', ja: '官星 · 節制', zh: '官星 · 节制', es: 'Disciplina' },
    meaning: {
      ko: '책임과 규율, 자신을 다스리는 힘',
      en: 'Responsibility and order — governing oneself',
      ja: '責任と規律、自らを律する力',
      zh: '责任与规律，自我约束之力',
      es: 'Responsabilidad y orden: gobernarse a sí mismo',
    },
  },
  resource: {
    hanja: '印星',
    label: { ko: '인성 · 배움', en: 'Support', ja: '印星 · 学び', zh: '印星 · 学习', es: 'Apoyo' },
    meaning: {
      ko: '배움과 사유, 받아들이고 길러내는 힘',
      en: 'Learning and thought — receiving and nurturing',
      ja: '学びと思索、受け入れ育む力',
      zh: '学习与思考，接纳滋养之力',
      es: 'Aprendizaje y reflexión: recibir y nutrir',
    },
  },
};

function groupOf(day: ElementKey, el: ElementKey): TenGodGroupKey {
  if (el === day) return 'companion';
  if (GENERATES[day] === el) return 'output';
  if (CONTROLS[day] === el) return 'wealth';
  if (CONTROLS[el] === day) return 'authority';
  return 'resource'; // GENERATES[el] === day
}

// The five Ten-God groups, sorted strongest first, each as a percentage.
export function tenGodProfile(p: FourPillars): TenGodGroup[] {
  const day = dayMaster(p);
  const bal = elementBalance(p);
  const totals: Record<TenGodGroupKey, number> = { companion: 0, output: 0, wealth: 0, authority: 0, resource: 0 };
  ELEMENT_KEYS.forEach(el => { totals[groupOf(day, el)] += bal[el]; });
  const keys: TenGodGroupKey[] = ['companion', 'output', 'wealth', 'authority', 'resource'];
  return keys
    .map(key => ({ key, ...TEN_GOD_GROUP_META[key], value: totals[key] }))
    .sort((a, b) => b.value - a.value);
}

// Display rows for the Me screen's Four Pillars card.
export function pillarViews(p: FourPillars): PillarView[] {
  const order: ('year' | 'month' | 'day' | 'hour')[] = ['year', 'month', 'day', 'hour'];
  const views: PillarView[] = [];
  for (const key of order) {
    const pl = p[key];
    if (!pl) continue; // hour omitted when birth time unknown
    const s = STEMS[pl.stem];
    const b = BRANCHES[pl.branch];
    views.push({
      key,
      label: PILLAR_LABELS[key],
      stem: { ko: s.ko, en: s.en, es: s.en, ja: s.hanja, zh: s.hanja },
      branch: { ko: b.ko, en: b.en, es: b.en, ja: b.hanja, zh: b.hanja },
      element: s.element,
    });
  }
  return views;
}
