import { describe, it, expect } from 'vitest';
import type { FourPillars } from '../pillars';
import { computeFourPillars } from '../pillars';
import {
  tenGodOf, twelveStage, dayStrength, usefulGods,
  chartPattern, lifeStages, sinsalList,
} from '../analysis';

// 갑자 = stem 0, branch 0. Helper to build a pillar.
const P = (stem: number, branch: number) => ({ stem, branch });
const pillars = (y: [number, number], m: [number, number], d: [number, number], h: [number, number] | null = null): FourPillars => ({
  year: P(...y), month: P(...m), day: P(...d), hour: h ? P(...h) : null,
});

// ---------------------------------------------------------------------------
// 십신 (Ten Gods) — every relation to a 甲 (yang wood) day master.
// ---------------------------------------------------------------------------
describe('ten gods relative to day master', () => {
  it('names all ten relations for a 甲 day master', () => {
    expect(tenGodOf(0, 0)).toBe('bijian');    // 甲–甲 same/同
    expect(tenGodOf(0, 1)).toBe('geopjae');   // 甲–乙 same elem, opp polarity
    expect(tenGodOf(0, 2)).toBe('siksin');    // 甲→丙 wood gen fire, same
    expect(tenGodOf(0, 3)).toBe('sanggwan');  // 甲→丁 opp
    expect(tenGodOf(0, 4)).toBe('pyeonjae');  // 甲→戊 wood ctrl earth, same
    expect(tenGodOf(0, 5)).toBe('jeongjae');  // 甲→己 opp
    expect(tenGodOf(0, 6)).toBe('pyeongwan'); // 庚→甲 metal ctrl wood, same
    expect(tenGodOf(0, 7)).toBe('jeonggwan'); // 辛 opp
    expect(tenGodOf(0, 8)).toBe('pyeonin');   // 壬→甲 water gen wood, same
    expect(tenGodOf(0, 9)).toBe('jeongin');   // 癸 opp
  });
});

// ---------------------------------------------------------------------------
// 십이운성 (Twelve Life Stages) — anchored to the classic 장생 table.
// ---------------------------------------------------------------------------
describe('twelve life stages', () => {
  it('places 甲 (yang wood) running forward from 亥', () => {
    expect(twelveStage(0, 11)).toBe('jangsaeng'); // 亥
    expect(twelveStage(0, 0)).toBe('mokyok');     // 子
    expect(twelveStage(0, 2)).toBe('geollok');    // 寅 임관/건록
    expect(twelveStage(0, 3)).toBe('jewang');     // 卯 제왕
  });
  it('places 乙 (yin wood) running backward from 午', () => {
    expect(twelveStage(1, 6)).toBe('jangsaeng');  // 午
    expect(twelveStage(1, 5)).toBe('mokyok');     // 巳
    expect(twelveStage(1, 2)).toBe('jewang');     // 寅 을목 제왕
  });
});

// ---------------------------------------------------------------------------
// 신강·신약 (body strength) — direction of the 억부 weighting.
// ---------------------------------------------------------------------------
describe('day-master strength', () => {
  it('reports a strong day master when wood floods the chart', () => {
    // 갑인 / 갑인 / 갑인 / 갑인 — all wood, month branch 寅 (wood) supports.
    const s = dayStrength(pillars([0, 2], [0, 2], [0, 2], [0, 2]));
    expect(s.D).toBe('wood');
    expect(s.rootedInMonth).toBe(true);
    expect(s.percent).toBeGreaterThan(60);
    expect(['strong', 'very-strong']).toContain(s.level);
  });
  it('reports a weak day master when controllers/drainers dominate', () => {
    // 甲 day master surrounded by metal (관성) and fire (식상) — no wood/water root.
    const s = dayStrength(pillars([6, 9], [6, 9], [0, 9], [2, 5]));
    expect(s.percent).toBeLessThan(45);
    expect(['weak', 'very-weak']).toContain(s.level);
  });
  it('keeps the support share within 0..100', () => {
    const s = dayStrength(computeFourPillars({ year: 1993, month: 6, day: 14, hour: 23, minute: 40 }));
    expect(s.percent).toBeGreaterThanOrEqual(0);
    expect(s.percent).toBeLessThanOrEqual(100);
  });
});

// ---------------------------------------------------------------------------
// 용신 (favorable element) — opposite groups for strong vs weak charts.
// ---------------------------------------------------------------------------
describe('useful gods', () => {
  it('favors draining elements for a strong wood chart', () => {
    const p = pillars([0, 2], [0, 2], [0, 2], [0, 2]);
    const u = usefulGods(p, dayStrength(p));
    // strong wood → favor 식상(fire)/재성(earth)/관성(metal), avoid wood/water
    expect(u.favorable).toEqual(expect.arrayContaining(['fire', 'earth', 'metal']));
    expect(u.avoid).toEqual(expect.arrayContaining(['wood', 'water']));
    expect(u.favorable).toContain(u.primary);
  });
});

// ---------------------------------------------------------------------------
// 격국 (structure) — named from the month branch's main hidden stem.
// ---------------------------------------------------------------------------
describe('chart pattern', () => {
  it('reads 정관격 when the month branch governs the day master', () => {
    // Day master 甲 (wood); month branch 酉 (main hidden 辛 = 정관 to 甲).
    const p = pillars([0, 0], [0, 9], [0, 0]);
    expect(chartPattern(p).key).toBe('jeonggwan');
  });
  it('maps a 비견 month command to 건록격', () => {
    // Day master 甲; month branch 寅 (main hidden 甲 = 비견) → 건록격.
    const p = pillars([0, 0], [0, 2], [0, 0]);
    expect(chartPattern(p).key).toBe('geollok');
  });
});

// ---------------------------------------------------------------------------
// 신살 (symbolic stars) — table lookups against the day stem / day branch.
// ---------------------------------------------------------------------------
describe('symbolic stars', () => {
  it('detects 천을귀인 / 양인 / 문창 for a 甲 day stem', () => {
    // 甲 → 천을 丑·未, 양인 卯, 문창 巳.
    const p = pillars([0, 1], [0, 3], [0, 0], [0, 5]); // branches 丑,卯,子,巳
    const found = sinsalList(p);
    expect(found).toContain('cheoneul'); // 丑
    expect(found).toContain('yangin');   // 卯
    expect(found).toContain('munchang'); // 巳
  });
  it('detects trio stars (도화·역마·화개) off the day branch', () => {
    // Day branch 子 → water trio: 도화 酉, 역마 寅, 화개 辰.
    const p = pillars([0, 9], [0, 2], [0, 0], [0, 4]); // 酉,寅,子,辰
    const found = sinsalList(p);
    expect(found).toContain('dohwa');  // 酉
    expect(found).toContain('yeokma'); // 寅
    expect(found).toContain('hwagae'); // 辰
  });
  it('detects 괴강 on a 庚辰 day pillar', () => {
    const p = pillars([0, 0], [0, 0], [6, 4]); // day 庚辰
    expect(sinsalList(p)).toContain('goegang');
  });
});

// ---------------------------------------------------------------------------
// lifeStages omits the hour when birth time is unknown.
// ---------------------------------------------------------------------------
describe('life stages coverage', () => {
  it('returns three stages without an hour pillar, four with one', () => {
    expect(lifeStages(pillars([0, 0], [0, 0], [0, 0])).length).toBe(3);
    expect(lifeStages(pillars([0, 0], [0, 0], [0, 0], [0, 0])).length).toBe(4);
  });
});
