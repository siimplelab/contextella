import type { ElementKey, Lang, Person, PersonWithFlow, DayReport, Universe } from './types';
import { ELEMENTS } from './tokens';

export const ELEMENT_REL: Record<ElementKey, { generates: ElementKey; controls: ElementKey; generatedBy: ElementKey; controlledBy: ElementKey }> = {
  water: { generates: 'wood', controls: 'fire', generatedBy: 'metal', controlledBy: 'earth' },
  wood:  { generates: 'fire', controls: 'earth', generatedBy: 'water', controlledBy: 'metal' },
  fire:  { generates: 'earth', controls: 'metal', generatedBy: 'wood', controlledBy: 'water' },
  earth: { generates: 'metal', controls: 'water', generatedBy: 'fire', controlledBy: 'wood' },
  metal: { generates: 'water', controls: 'wood', generatedBy: 'earth', controlledBy: 'fire' },
};

export function todaysElement(): ElementKey {
  const d = new Date();
  const seed = d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate();
  const els: ElementKey[] = ['water','wood','fire','earth','metal'];
  return els[seed % 5];
}

export function flowFor(person: Person, dayElement: ElementKey): number {
  const rel = ELEMENT_REL[person.element];
  const base = person.score ?? 70;
  let mod = 0;
  if (rel.generatedBy === dayElement) mod = +14;
  else if (rel.generates === dayElement) mod = +7;
  else if (person.element === dayElement) mod = +4;
  else if (rel.controlledBy === dayElement) mod = -12;
  else if (rel.controls === dayElement) mod = -5;
  const wobble = ((person.id.charCodeAt(0) + new Date().getDate()) % 11) - 5;
  return Math.max(20, Math.min(98, Math.round(base * 0.55 + 30 + mod + wobble)));
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
                 universeName_en: u.name_en, flow: flowFor(p, dayEl) });
    });
  });
  const bright = all.filter(p => p.flow >= 75).sort((a,b) => b.flow - a.flow).slice(0, 3);
  const careful = all.filter(p => p.flow < 55).sort((a,b) => a.flow - b.flow).slice(0, 2);
  const all_sorted = [...all].sort((a,b) => b.flow - a.flow);
  const avg = all.length ? Math.round(all.reduce((s, p) => s + p.flow, 0) / all.length) : 0;
  return { dayElement: dayEl, all: all_sorted, bright, careful, avg, total: all.length };
}

export function dayHeadline(report: DayReport, lang: Lang) {
  const e = ELEMENTS[report.dayElement];
  if (lang === 'ko') {
    return {
      eyebrow: `오늘의 기운 · ${e.label_ko}`,
      title: report.avg >= 70
        ? '관계의 결이 부드럽게 흐르는 하루'
        : report.avg >= 55
          ? '잔잔한 결, 조심스러운 흐름'
          : '쉬어가도 좋은 하루',
      body: report.bright.length > 0
        ? `${report.bright[0].name_ko}님과의 결이 가장 잘 맞아요${
            report.careful.length > 0
              ? `. ${report.careful[0].name_ko}님과는 한 발자국 거리를 두세요.`
              : '.'
          }`
        : '오늘은 나의 결을 들여다보기 좋은 하루입니다.',
    };
  }
  return {
    eyebrow: `Today’s energy · ${e.label_en}`,
    title: report.avg >= 70 ? 'A day of soft, flowing connection'
         : report.avg >= 55 ? 'Quiet currents, soft caution'
         : 'A day to breathe and rest',
    body: report.bright.length > 0
      ? `Your grain aligns best with ${report.bright[0].name_en}${
          report.careful.length > 0
            ? `. With ${report.careful[0].name_en}, leave a step of space.`
            : '.'
        }`
      : 'A good day to listen to your own current.',
  };
}
