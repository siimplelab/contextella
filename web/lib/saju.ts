import type { ElementKey, Lang, Person, PersonWithFlow, DayReport, Universe } from './types';
import { ELEMENTS } from './tokens';
import { sajuFromBirth, dayPillarOf, dayElementOf, dailyFlow } from './saju/index';
export * from './saju/index';

const profileCache = new Map<string, ReturnType<typeof sajuFromBirth>>();
function cachedProfile(birth: string, time: string | null) {
  const key = `${birth}|${time ?? ''}`;
  if (!profileCache.has(key)) profileCache.set(key, sajuFromBirth(birth, time));
  return profileCache.get(key)!;
}

// Today's governing element, derived from today's day pillar.
export function todaysElement(): ElementKey {
  return dayElementOf();
}

// Real daily flow score for a person, computed from their Saju pillars
// against today's day pillar. Falls back to 50 if birth data is unparseable.
export function flowFor(person: Person): number {
  const profile = cachedProfile(person.birth, person.time);
  if (!profile) return 50;
  return dailyFlow(profile.pillars, dayPillarOf());
}

export interface FlowTone { tone: 'bright' | 'steady' | 'soft' | 'careful'; color: string; bg: string }

export function flowTone(score: number): FlowTone {
  if (score >= 78) return { tone: 'bright', color: '#7BD89A',  bg: 'rgba(123,216,154,0.14)' };
  if (score >= 62) return { tone: 'steady', color: '#C9A8E8',  bg: 'rgba(201,168,232,0.14)' };
  if (score >= 48) return { tone: 'soft',   color: '#E8D4A2',  bg: 'rgba(232,212,162,0.14)' };
  return            { tone: 'careful',color: '#E8A4B5', bg: 'rgba(232,164,181,0.14)' };
}

export function buildDayReport(universes: Universe[]): DayReport {
  const dayEl = todaysElement();
  const all: PersonWithFlow[] = [];
  universes.forEach(u => {
    u.members.forEach(p => {
      all.push({ ...p, universeId: u.id, universeName_ko: u.name_ko,
                 universeName_en: u.name_en, flow: flowFor(p) });
    });
  });
  const bright = all.filter(p => p.flow >= 75).sort((a,b) => b.flow - a.flow).slice(0, 3);
  const careful = all.filter(p => p.flow < 55).sort((a,b) => a.flow - b.flow).slice(0, 2);
  const all_sorted = [...all].sort((a,b) => b.flow - a.flow);
  const avg = all.length ? Math.round(all.reduce((s, p) => s + p.flow, 0) / all.length) : 0;
  return { dayElement: dayEl, all: all_sorted, bright, careful, avg, total: all.length };
}

const HEADLINE = {
  eyebrow: {
    ko: '오늘의 기운', en: 'Today’s energy', ja: '今日の気',
    zh: '今日之气', es: 'La energía de hoy',
  },
  title: {
    ko: ['관계의 결이 부드럽게 흐르는 하루', '잔잔한 결, 조심스러운 흐름', '쉬어가도 좋은 하루'],
    en: ['A day of soft, flowing connection', 'Quiet currents, soft caution', 'A day to breathe and rest'],
    ja: ['関係の機微がやわらかに流れる一日', '静かな機微、慎重な流れ', '休んでも良い一日'],
    zh: ['关系的纹理柔和流动的一天', '平静的纹理，谨慎的流动', '适合休息的一天'],
    es: ['Un día de conexión suave y fluida', 'Corrientes calmas, suave cautela', 'Un día para respirar y descansar'],
  } as Record<Lang, string[]>,
  soloBody: {
    ko: '오늘은 나의 결을 들여다보기 좋은 하루입니다.',
    en: 'A good day to listen to your own current.',
    ja: '今日は自分の機微を見つめるのに良い一日です。',
    zh: '今天适合审视自己的纹理。',
    es: 'Un buen día para escuchar tu propia corriente.',
  } as Record<Lang, string>,
};

function brightBody(lang: Lang, bright: string, careful: string | null): string {
  switch (lang) {
    case 'ko':
      return `${bright}님과의 결이 가장 잘 맞아요${careful ? `. ${careful}님과는 한 발자국 거리를 두세요.` : '.'}`;
    case 'ja':
      return `${bright}さんとの機微が最もよく合います${careful ? `。${careful}さんとは一歩の距離を。` : '。'}`;
    case 'zh':
      return `你与${bright}的纹理最为契合${careful ? `。与${careful}，不妨留出一步的距离。` : '。'}`;
    case 'es':
      return `Tu textura encaja mejor con ${bright}${careful ? `. Con ${careful}, deja un paso de espacio.` : '.'}`;
    default:
      return `Your grain aligns best with ${bright}${careful ? `. With ${careful}, leave a step of space.` : '.'}`;
  }
}

export function dayHeadline(report: DayReport, lang: Lang) {
  const label = ELEMENTS[report.dayElement].label[lang];
  const tier = report.avg >= 70 ? 0 : report.avg >= 55 ? 1 : 2;
  // Names are stored once and shared across languages.
  const bright = report.bright[0]?.name_ko;
  const careful = report.careful[0]?.name_ko ?? null;
  return {
    eyebrow: `${HEADLINE.eyebrow[lang]} · ${label}`,
    title: HEADLINE.title[lang][tier],
    body: bright ? brightBody(lang, bright, careful) : HEADLINE.soloBody[lang],
  };
}
