import type { ElementKey } from '../types';
import { computeFourPillars, parseBirthInput } from './pillars';
import type { FourPillars } from './pillars';
import { dayMaster, elementBalance } from './profile';

export * from './constants';
export * from './astronomy';
export * from './pillars';
export * from './profile';
export * from './compat';
export * from './daily';
export * from './analysis';
export * from './compat-detail';

export interface SajuProfile {
  pillars: FourPillars;
  element: ElementKey;
  balance: Record<ElementKey, number>;
}

// Compute a full Saju profile from stored birth strings.
// `birth` is "YYYY.MM.DD"; `time` is "HH:MM" or null. Returns null on bad input.
export function sajuFromBirth(birth: string, time: string | null): SajuProfile | null {
  const input = parseBirthInput(birth, time);
  if (!input) return null;
  const pillars = computeFourPillars(input);
  return {
    pillars,
    element: dayMaster(pillars),
    balance: elementBalance(pillars),
  };
}
