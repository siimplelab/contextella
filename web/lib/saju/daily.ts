import type { ElementKey, Lang } from '../types';
import { STEMS, GENERATES, CONTROLS, inHarmony6, harmony3Element, isClash, isHarm, isPunish } from './constants';
import { julianDayNumber } from './astronomy';
import { DAY_GANZHI_OFFSET } from './pillars';
import type { Pillar, FourPillars } from './pillars';
import { dayMaster } from './profile';

// The day pillar (60갑자) for a calendar date — defaults to today (KST).
export function dayPillarOf(date: Date = new Date()): Pillar {
  const kst = new Date(date.getTime() + 9 * 3600000);
  const jdn = julianDayNumber(kst.getUTCFullYear(), kst.getUTCMonth() + 1, kst.getUTCDate());
  const idx = ((jdn + DAY_GANZHI_OFFSET) % 60 + 60) % 60;
  return { stem: idx % 10, branch: idx % 12 };
}

// The day's governing element — its day-stem element.
export function dayElementOf(date: Date = new Date()): ElementKey {
  return STEMS[dayPillarOf(date).stem].element;
}

// Deterministic flow score (20..98) between a person and a given day pillar:
// how the day's energy interacts with the person's day master and day branch.
export function dailyFlow(person: FourPillars, day: Pillar): number {
  const pe = dayMaster(person);
  const de = STEMS[day.stem].element;
  let score = 58;
  if (GENERATES[de] === pe) score += 20;
  else if (pe === de) score += 8;
  else if (GENERATES[pe] === de) score += 4;
  else if (CONTROLS[de] === pe) score -= 16;
  else if (CONTROLS[pe] === de) score -= 6;

  const a = person.day.branch;
  const b = day.branch;
  if (inHarmony6(a, b)) score += 10;
  else if (harmony3Element(a, b)) score += 8;
  else if (isClash(a, b)) score -= 12;
  else if (isPunish(a, b) || isHarm(a, b)) score -= 6;

  return Math.max(20, Math.min(98, Math.round(score)));
}

// Peak-energy hour (0..23) for a day — the two-hour branch in 삼합/육합 with
// the day branch, used to anchor the hourly-flow visualization.
export function peakHourOf(day: Pillar): number {
  for (let h = 0; h < 24; h += 2) {
    const branch = Math.floor((h + 1) / 2) % 12;
    if (inHarmony6(branch, day.branch)) return h;
  }
  return ((day.branch + 6) % 12) * 2;
}

// Advice for tuning the day's grain — a curated content table keyed by the
// day element, in every supported language.
const ADVICE: Record<ElementKey, Record<Lang, string[]>> = {
  water: {
    ko: ['깊이 듣는 대화', '결정을 미루지 말고 따뜻하게', '물 한 잔, 짧은 산책'],
    en: ['Listen deeply in conversation', 'Decide with warmth, not delay', 'Water, a brief walk'],
    ja: ['深く耳を傾ける会話', '決断を先延ばしにせず、温かく', '水を一杯、短い散歩'],
    zh: ['用心倾听的对话', '别拖延，温和地做决定', '喝杯水，短暂散步'],
    es: ['Una conversación de escucha profunda', 'Decide con calidez, sin demorar', 'Un vaso de agua, un paseo breve'],
  },
  wood: {
    ko: ['새 시작을 격려해 보세요', '작은 약속부터 지키기', '식물 곁에서 잠시'],
    en: ['Encourage a new beginning', 'Keep one small promise', 'Pause near something green'],
    ja: ['新しい始まりを後押しして', '小さな約束から守る', '緑のそばでひと休み'],
    zh: ['鼓励一个新的开始', '从小小的约定开始守信', '在绿意旁稍作停留'],
    es: ['Anima un nuevo comienzo', 'Cumple una pequeña promesa', 'Haz una pausa junto a algo verde'],
  },
  fire: {
    ko: ['따뜻한 안부 전하기', '큰 감정 다루기 좋아요', '햇볕 아래 5분'],
    en: ['Send a warm hello', 'Big emotions land well today', 'Five minutes of sunlight'],
    ja: ['温かい挨拶を伝える', '大きな感情を扱うのに良い日', '日差しの下で5分'],
    zh: ['送上温暖的问候', '适合处理强烈的情绪', '在阳光下待五分钟'],
    es: ['Envía un saludo cálido', 'Hoy las emociones intensas fluyen bien', 'Cinco minutos de sol'],
  },
  earth: {
    ko: ['천천히, 차근차근 마무리', '책상 위 정리', '땅에 발을 붙이기'],
    en: ['Wrap things up slowly', 'Tidy your desk', 'Feet on the ground'],
    ja: ['ゆっくり、一つずつ仕上げる', '机の上を整える', '足を地につける'],
    zh: ['慢慢地、一步步收尾', '整理桌面', '让双脚踏实落地'],
    es: ['Cierra las cosas con calma', 'Ordena tu escritorio', 'Pies en la tierra'],
  },
  metal: {
    ko: ['군더더기를 덜어내기', '경계를 분명히', '깊은 호흡 세 번'],
    en: ['Trim what is excess', 'Hold a clean boundary', 'Three deep breaths'],
    ja: ['余分なものを削ぎ落とす', '境界をはっきりと', '深い呼吸を三回'],
    zh: ['删去多余之物', '划清界限', '三次深呼吸'],
    es: ['Recorta lo que sobra', 'Mantén un límite claro', 'Tres respiraciones profundas'],
  },
};

export function dailyAdvice(element: ElementKey, lang: Lang): string[] {
  return ADVICE[element][lang];
}
