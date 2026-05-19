import { describe, it, expect } from 'vitest';
import { julianDayNumber } from '../astronomy';
import { ipchunJD } from '../astronomy';
import { computeFourPillars } from '../pillars';
import { STEMS, BRANCHES } from '../constants';
import { dayMaster, elementBalance } from '../profile';
import { compatibility } from '../compat';
import { dayPillarOf } from '../daily';

const ganzhi = (stem: number, branch: number) => STEMS[stem].ko + BRANCHES[branch].ko;

describe('day pillar — 60갑자 cycle', () => {
  // Anchored against authoritative 만세력: 1900-01-01 = 갑술, 2000-01-01 = 무오.
  it('matches known reference dates', () => {
    const p1900 = computeFourPillars({ year: 1900, month: 1, day: 1, hour: null, minute: null });
    expect(ganzhi(p1900.day.stem, p1900.day.branch)).toBe('갑술');

    const p2000 = computeFourPillars({ year: 2000, month: 1, day: 1, hour: null, minute: null });
    expect(ganzhi(p2000.day.stem, p2000.day.branch)).toBe('무오');
  });

  it('advances exactly one 60갑자 step per calendar day', () => {
    const a = julianDayNumber(2024, 3, 10);
    const b = julianDayNumber(2024, 3, 11);
    expect(b - a).toBe(1);
    const idxA = ((a + 49) % 60 + 60) % 60;
    const idxB = ((b + 49) % 60 + 60) % 60;
    expect(idxB).toBe((idxA + 1) % 60);
  });
});

describe('year pillar — 입춘 boundary', () => {
  it('uses the civil year for births well after 입춘', () => {
    // 1984 was 갑자년; mid-June is firmly past 입춘.
    const p = computeFourPillars({ year: 1984, month: 6, day: 15, hour: null, minute: null });
    expect(ganzhi(p.year.stem, p.year.branch)).toBe('갑자');
  });

  it('rolls back to the previous Saju year for births before 입춘', () => {
    // Mid-January 1984 precedes 입춘 → Saju year is 1983 (계해년).
    const p = computeFourPillars({ year: 1984, month: 1, day: 15, hour: null, minute: null });
    expect(ganzhi(p.year.stem, p.year.branch)).toBe('계해');
  });

  it('places 입춘 in early February', () => {
    const jd = ipchunJD(2024);
    const date = new Date((jd - 2440587.5) * 86400000);
    expect(date.getUTCMonth()).toBe(1); // February
    expect(date.getUTCDate()).toBeGreaterThanOrEqual(3);
    expect(date.getUTCDate()).toBeLessThanOrEqual(5);
  });
});

describe('full four pillars — 2000-01-01 12:00 KST', () => {
  it('matches the reference manse', () => {
    const p = computeFourPillars({ year: 2000, month: 1, day: 1, hour: 12, minute: 0 });
    expect(ganzhi(p.year.stem, p.year.branch)).toBe('기묘');
    expect(ganzhi(p.month.stem, p.month.branch)).toBe('병자');
    expect(ganzhi(p.day.stem, p.day.branch)).toBe('무오');
    expect(p.hour).not.toBeNull();
    expect(ganzhi(p.hour!.stem, p.hour!.branch)).toBe('무오');
    expect(dayMaster(p)).toBe('earth'); // 무 = earth
  });
});

describe('element balance', () => {
  it('sums to 100 and reflects the pillars', () => {
    const p = computeFourPillars({ year: 2000, month: 1, day: 1, hour: 12, minute: 0 });
    const bal = elementBalance(p);
    const total = Object.values(bal).reduce((s, v) => s + v, 0);
    expect(total).toBe(100);
    expect(Object.values(bal).every(v => v >= 0)).toBe(true);
  });

  it('a 시간 미상 chart omits the hour pillar', () => {
    const p = computeFourPillars({ year: 1993, month: 6, day: 14, hour: null, minute: null });
    expect(p.hour).toBeNull();
    const total = Object.values(elementBalance(p)).reduce((s, v) => s + v, 0);
    expect(total).toBe(100);
  });
});

describe('compatibility', () => {
  it('is deterministic and within range', () => {
    const a = computeFourPillars({ year: 1993, month: 6, day: 14, hour: 23, minute: 40 });
    const b = computeFourPillars({ year: 1994, month: 11, day: 2, hour: 9, minute: 15 });
    const r1 = compatibility(a, b);
    const r2 = compatibility(a, b);
    expect(r1.score).toBe(r2.score);
    expect(r1.score).toBeGreaterThanOrEqual(5);
    expect(r1.score).toBeLessThanOrEqual(98);
    expect(r1.factors.length).toBeGreaterThan(0);
  });

  it('changes when birth data changes', () => {
    const a = computeFourPillars({ year: 1993, month: 6, day: 14, hour: 23, minute: 40 });
    const b = computeFourPillars({ year: 1994, month: 11, day: 2, hour: 9, minute: 15 });
    const c = computeFourPillars({ year: 1988, month: 2, day: 29, hour: 3, minute: 0 });
    expect(compatibility(a, b).score).not.toBe(compatibility(a, c).score);
  });
});

describe('today day pillar', () => {
  it('is a valid 60갑자 pillar', () => {
    const p = dayPillarOf();
    expect(p.stem).toBeGreaterThanOrEqual(0);
    expect(p.stem).toBeLessThan(10);
    expect(p.branch).toBeGreaterThanOrEqual(0);
    expect(p.branch).toBeLessThan(12);
  });
});
