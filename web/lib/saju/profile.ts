import type { ElementKey, Lang } from '../types';
import { STEMS, BRANCHES, ELEMENT_KEYS } from './constants';
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
