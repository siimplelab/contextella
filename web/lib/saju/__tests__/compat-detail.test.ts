import { describe, it, expect } from 'vitest';
import type { FourPillars } from '../pillars';
import { compatDetail } from '../compat-detail';

const P = (stem: number, branch: number) => ({ stem, branch });
const pillars = (y: [number, number], m: [number, number], d: [number, number], h: [number, number] | null = null): FourPillars => ({
  year: P(...y), month: P(...m), day: P(...d), hour: h ? P(...h) : null,
});

describe('compatibility detail', () => {
  it('always returns four scored dimensions in 0..100', () => {
    const a = pillars([0, 0], [0, 0], [0, 0]);
    const b = pillars([2, 2], [2, 2], [2, 2]);
    const d = compatDetail(a, b);
    expect(d.dimensions.map(x => x.key)).toEqual(['dayMaster', 'dayBranch', 'complement', 'usefulGod']);
    for (const dim of d.dimensions) {
      expect(dim.value).toBeGreaterThanOrEqual(0);
      expect(dim.value).toBeLessThanOrEqual(100);
    }
  });

  it('scores a generative day-master pair higher than a controlling one', () => {
    // 甲(wood) day master vs 丙(fire) → wood generates fire (generative).
    const gen = compatDetail(pillars([0, 0], [0, 0], [0, 0]), pillars([2, 0], [2, 0], [2, 0]));
    // 甲(wood) vs 庚(metal) → metal controls wood (controlling).
    const ctrl = compatDetail(pillars([0, 0], [0, 0], [0, 0]), pillars([6, 0], [6, 0], [6, 0]));
    const g = gen.dimensions.find(d => d.key === 'dayMaster')!.value;
    const c = ctrl.dimensions.find(d => d.key === 'dayMaster')!.value;
    expect(g).toBeGreaterThan(c);
  });

  it('flags 육합 day branches as a top-tier day-branch bond and a 천생연분 star', () => {
    // Day branches 子(0) and 丑(1) are a 육합 pair.
    const d = compatDetail(pillars([0, 0], [0, 0], [0, 0]), pillars([0, 1], [0, 1], [0, 1]));
    expect(d.dimensions.find(x => x.key === 'dayBranch')!.tone).toBe('good');
    expect(d.stars).toContain('yukhap');
    expect(d.pillarBonds.find(b => b.key === 'day')!.type).toBe('h6');
  });

  it('detects a 충 clash and a 원진 resentment star on the day branch', () => {
    // 子(0) vs 午(6): 충 (six apart). 子-未(7) is 원진; test 충 here.
    const clash = compatDetail(pillars([0, 0], [0, 0], [0, 0]), pillars([0, 6], [0, 6], [0, 6]));
    expect(clash.stars).toContain('chung');
    expect(clash.pillarBonds.find(b => b.key === 'day')!.type).toBe('clash');
    // 子(0) vs 未(7): 원진.
    const wonjin = compatDetail(pillars([0, 0], [0, 0], [0, 0]), pillars([0, 7], [0, 7], [0, 7]));
    expect(wonjin.stars).toContain('wonjin');
  });

  it('omits the hour pillar bond when either chart lacks a birth time', () => {
    const a = pillars([0, 0], [0, 0], [0, 0], [0, 0]);
    const b = pillars([0, 1], [0, 1], [0, 1]); // no hour
    expect(compatDetail(a, b).pillarBonds.some(x => x.key === 'hour')).toBe(false);
  });
});
