import { describe, it, expect } from 'vitest';
import {
  julianDayNumber,
  solarLongitude,
  solarTermJD,
  ipchunJD,
} from '../astronomy';
import { computeFourPillars, parseBirthInput, daysInMonth } from '../pillars';
import { STEMS, BRANCHES } from '../constants';
import { dayMaster, elementBalance } from '../profile';
import { compatibility } from '../compat';
import { dailyFlow, dayPillarOf } from '../daily';

const ganzhi = (stem: number, branch: number) => STEMS[stem].ko + BRANCHES[branch].ko;
const chart = (y: number, m: number, d: number, h: number | null = null, mi: number | null = null) =>
  computeFourPillars({ year: y, month: m, day: d, hour: h, minute: mi });
const dayIdxOf = (jdn: number) => ((jdn + 49) % 60 + 60) % 60;

// ---------------------------------------------------------------------------
// Input parsing & calendar validity
// ---------------------------------------------------------------------------
describe('birth-input parsing', () => {
  it('accepts well-formed dates and times', () => {
    expect(parseBirthInput('1993.06.14', '23:40')).toEqual({ year: 1993, month: 6, day: 14, hour: 23, minute: 40 });
    expect(parseBirthInput('2000-01-01', null)).toEqual({ year: 2000, month: 1, day: 1, hour: null, minute: null });
  });

  it('rejects impossible calendar dates instead of rolling over', () => {
    expect(parseBirthInput('2001.02.29', null)).toBeNull(); // 2001 is not a leap year
    expect(parseBirthInput('2000.02.29', null)).not.toBeNull(); // 2000 is a leap year
    expect(parseBirthInput('1990.04.31', null)).toBeNull();
    expect(parseBirthInput('1990.13.01', null)).toBeNull();
  });

  it('drops an out-of-range time rather than the whole chart', () => {
    expect(parseBirthInput('1990.04.10', '25:00')).toEqual({ year: 1990, month: 4, day: 10, hour: null, minute: null });
  });

  it('knows the length of each month, including leap Februaries', () => {
    expect(daysInMonth(2000, 2)).toBe(29);
    expect(daysInMonth(2001, 2)).toBe(28);
    expect(daysInMonth(2024, 4)).toBe(30);
  });
});

// ---------------------------------------------------------------------------
// Day pillar — the 60갑자 cycle anchored to the Julian Day Number
// ---------------------------------------------------------------------------
describe('day pillar — 60갑자 cycle', () => {
  it('matches authoritative 만세력 anchors', () => {
    expect(ganzhi(chart(1900, 1, 1).day.stem, chart(1900, 1, 1).day.branch)).toBe('갑술');
    expect(ganzhi(chart(2000, 1, 1).day.stem, chart(2000, 1, 1).day.branch)).toBe('무오');
  });

  it('advances exactly one step per day across month, leap and year boundaries', () => {
    const pairs: [number[], number[]][] = [
      [[2024, 1, 31], [2024, 2, 1]],   // month boundary
      [[2024, 2, 28], [2024, 2, 29]],  // into a leap day
      [[2024, 2, 29], [2024, 3, 1]],   // out of a leap day
      [[2023, 2, 28], [2023, 3, 1]],   // non-leap February
      [[2023, 12, 31], [2024, 1, 1]],  // year boundary
    ];
    for (const [a, b] of pairs) {
      const ia = dayIdxOf(julianDayNumber(a[0], a[1], a[2]));
      const ib = dayIdxOf(julianDayNumber(b[0], b[1], b[2]));
      expect(ib).toBe((ia + 1) % 60);
    }
  });

  it('agrees between the birth-chart path and the daily path', () => {
    const d = new Date(Date.UTC(2024, 5, 14, 3, 0)); // 12:00 KST on 2024-06-14
    const fromChart = chart(2024, 6, 14, 12, 0).day;
    const fromDaily = dayPillarOf(d);
    expect(fromDaily.stem).toBe(fromChart.stem);
    expect(fromDaily.branch).toBe(fromChart.branch);
  });
});

// ---------------------------------------------------------------------------
// Year pillar — increments at 입춘 (solar longitude 315°), not Jan 1
// ---------------------------------------------------------------------------
describe('year pillar — 입춘 boundary', () => {
  it('uses (sajuYear - 4) for the stem/branch after 입춘', () => {
    expect(ganzhi(chart(1984, 6, 15).year.stem, chart(1984, 6, 15).year.branch)).toBe('갑자');
    expect(ganzhi(chart(1990, 6, 1).year.stem, chart(1990, 6, 1).year.branch)).toBe('경오');
  });

  it('rolls back to the previous Saju year before 입춘', () => {
    expect(ganzhi(chart(1984, 1, 15).year.stem, chart(1984, 1, 15).year.branch)).toBe('계해'); // 1983년
    expect(ganzhi(chart(1990, 1, 20).year.stem, chart(1990, 1, 20).year.branch)).toBe('기사'); // 1989년
  });

  it('places 입춘 in early February for many years', () => {
    for (const y of [1950, 1984, 2000, 2024, 2050]) {
      const date = new Date((ipchunJD(y) - 2440587.5) * 86400000);
      expect(date.getUTCMonth()).toBe(1); // February
      expect(date.getUTCDate()).toBeGreaterThanOrEqual(3);
      expect(date.getUTCDate()).toBeLessThanOrEqual(5);
    }
  });
});

// ---------------------------------------------------------------------------
// Month pillar — branch from the solar term, stem via 五虎遁
// ---------------------------------------------------------------------------
describe('month pillar — solar term + 五虎遁', () => {
  it('matches the reference manse', () => {
    // 2000-01-01 sits in 자月; year stem 기 → month stem 병.
    expect(ganzhi(chart(2000, 1, 1, 12, 0).month.stem, chart(2000, 1, 1, 12, 0).month.branch)).toBe('병자');
    // 1984 is a 갑 year; 2/20 is well inside 인月 → 五虎遁 갑기년 무... 인月 = 병인.
    expect(ganzhi(chart(1984, 2, 20).month.stem, chart(1984, 2, 20).month.branch)).toBe('병인');
  });
});

// ---------------------------------------------------------------------------
// Hour pillar — 12 two-hour branches, stem via 五鼠遁
// ---------------------------------------------------------------------------
describe('hour pillar — two-hour branches + 五鼠遁', () => {
  it('maps every clock hour to the right branch (자시 spans 23:00–00:59)', () => {
    const expected = [0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 0];
    for (let h = 0; h < 24; h++) {
      expect(chart(2000, 1, 1, h, 0).hour!.branch).toBe(expected[h]);
    }
  });

  it('derives the hour stem from the day stem (무 day → 임자 at 子時)', () => {
    expect(ganzhi(chart(2000, 1, 1, 0, 0).hour!.stem, chart(2000, 1, 1, 0, 0).hour!.branch)).toBe('임자');
    // 야자시: a 23:xx birth keeps the civil day's pillar and uses 子 for the hour.
    expect(ganzhi(chart(2000, 1, 1, 23, 30).hour!.stem, chart(2000, 1, 1, 23, 30).hour!.branch)).toBe('임자');
    expect(ganzhi(chart(2000, 1, 1, 23, 30).day.stem, chart(2000, 1, 1, 23, 30).day.branch)).toBe('무오');
  });

  it('omits the hour pillar when the time is unknown', () => {
    expect(chart(1993, 6, 14, null, null).hour).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Element balance (오행 분포)
// ---------------------------------------------------------------------------
describe('element balance', () => {
  it('always sums to exactly 100 with no negatives', () => {
    const dates: [number, number, number, number | null][] = [
      [2000, 1, 1, 12], [1993, 6, 14, null], [1988, 2, 29, 3],
      [2024, 12, 25, 18], [1950, 7, 7, 9], [1975, 11, 30, 0],
    ];
    for (const [y, m, d, h] of dates) {
      const bal = elementBalance(chart(y, m, d, h, h === null ? null : 0));
      expect(Object.values(bal).reduce((s, v) => s + v, 0)).toBe(100);
      expect(Object.values(bal).every(v => v >= 0)).toBe(true);
    }
  });

  it('reads the day master from the day stem', () => {
    expect(dayMaster(chart(2000, 1, 1, 12, 0))).toBe('earth'); // 무 = earth
  });
});

// ---------------------------------------------------------------------------
// Compatibility (궁합)
// ---------------------------------------------------------------------------
describe('compatibility', () => {
  const a = chart(1993, 6, 14, 23, 40);
  const b = chart(1994, 11, 2, 9, 15);
  const c = chart(1988, 2, 29, 3, 0);

  it('is deterministic and bounded to 5..98', () => {
    expect(compatibility(a, b).score).toBe(compatibility(a, b).score);
    for (const [x, y] of [[a, b], [a, c], [b, c]] as const) {
      const r = compatibility(x, y);
      expect(r.score).toBeGreaterThanOrEqual(5);
      expect(r.score).toBeLessThanOrEqual(98);
      expect(r.factors.length).toBeGreaterThan(0);
    }
  });

  it('is symmetric — A↔B reads the same as B↔A', () => {
    expect(compatibility(a, b).score).toBe(compatibility(b, a).score);
    expect(compatibility(a, c).score).toBe(compatibility(c, a).score);
    expect(compatibility(b, c).score).toBe(compatibility(b, c).score);
  });

  it('recognises a shared day master', () => {
    const r = compatibility(a, a);
    expect(r.factors.some(f => f.id === 'dm_same')).toBe(true);
  });

  it('responds to different birth data', () => {
    expect(compatibility(a, b).score).not.toBe(compatibility(a, c).score);
  });
});

// ---------------------------------------------------------------------------
// Daily flow
// ---------------------------------------------------------------------------
describe('daily flow', () => {
  it('stays within 20..98 and is deterministic for any person/day', () => {
    const person = chart(1993, 6, 14, 23, 40);
    for (let i = 0; i < 60; i++) {
      const day = { stem: i % 10, branch: i % 12 };
      const f = dailyFlow(person, day);
      expect(f).toBeGreaterThanOrEqual(20);
      expect(f).toBeLessThanOrEqual(98);
      expect(dailyFlow(person, day)).toBe(f);
    }
  });
});

// ---------------------------------------------------------------------------
// Astronomy — the solar-longitude solver underpinning the term boundaries
// ---------------------------------------------------------------------------
describe('astronomy — solar term solver', () => {
  it('lands within an arcminute of every requested longitude', () => {
    const guess = 2451545.0; // J2000
    for (const L of [0, 45, 90, 135, 180, 225, 270, 315]) {
      const jd = solarTermJD(L, guess + L);
      const got = solarLongitude(jd);
      const diff = Math.abs(((got - L + 540) % 360) - 180);
      expect(diff).toBeLessThan(0.02);
    }
  });
});
