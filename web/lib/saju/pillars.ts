import {
  julianDayNumber,
  julianDayFromKST,
  solarLongitude,
  ipchunJD,
} from './astronomy';

export interface BirthInput {
  year: number;
  month: number;
  day: number;
  hour: number | null;
  minute: number | null;
}

export interface Pillar {
  stem: number;   // 0..9  index into STEMS
  branch: number; // 0..11 index into BRANCHES
}

export interface FourPillars {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar | null; // null when birth time is unknown
}

// Parse stored birth strings: date "1993.06.14", time "23:40" | null.
export function parseBirthInput(birth: string, time: string | null): BirthInput | null {
  const dm = birth.match(/^(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})$/);
  if (!dm) return null;
  const year = +dm[1];
  const month = +dm[2];
  const day = +dm[3];
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  let hour: number | null = null;
  let minute: number | null = null;
  if (time) {
    const tm = time.match(/^(\d{1,2}):(\d{1,2})$/);
    if (tm) {
      hour = +tm[1];
      minute = +tm[2];
      if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        hour = null;
        minute = null;
      }
    }
  }
  return { year, month, day, hour, minute };
}

// Month-pillar branch from the sun's longitude: each 30° solar sector starting
// at 입춘 (315°) is one month. Sector 0 (longitude 285–315) → 축월; the月 branch
// 인 begins at 입춘. Returns a branch index 0..11.
function monthBranchFromLongitude(longitude: number): number {
  const sector = Math.floor((((longitude - 285) % 360) + 360) % 360 / 30);
  return (sector + 1) % 12;
}

export function computeFourPillars(birth: BirthInput): FourPillars {
  const knownTime = birth.hour !== null;
  const hour = birth.hour ?? 12;
  const minute = birth.minute ?? 0;

  // --- Year pillar: increments at 입춘 ---
  const birthJD = julianDayFromKST(birth.year, birth.month, birth.day, hour, minute);
  const ipchun = ipchunJD(birth.year);
  const sajuYear = birthJD >= ipchun ? birth.year : birth.year - 1;
  const yearStem = ((sajuYear - 4) % 10 + 10) % 10;
  const yearBranch = ((sajuYear - 4) % 12 + 12) % 12;

  // --- Month pillar: branch from solar term, stem via 五虎遁 ---
  const monthBranch = monthBranchFromLongitude(solarLongitude(birthJD));
  const monthOrder = (monthBranch - 2 + 12) % 12; // months since 인월
  const monthStem = ((yearStem % 5) * 2 + 2 + monthOrder) % 10;

  // --- Day pillar: 60갑자 from the Julian Day Number ---
  const jdn = julianDayNumber(birth.year, birth.month, birth.day);
  const dayIdx = ((jdn + DAY_GANZHI_OFFSET) % 60 + 60) % 60;
  const dayStem = dayIdx % 10;
  const dayBranch = dayIdx % 12;

  // --- Hour pillar: 12 two-hour branches, stem via 五鼠遁 ---
  let hourPillar: Pillar | null = null;
  if (knownTime) {
    const hourBranch = Math.floor((hour + 1) / 2) % 12;
    const hourStem = ((dayStem % 5) * 2 + hourBranch) % 10;
    hourPillar = { stem: hourStem, branch: hourBranch };
  }

  return {
    year: { stem: yearStem, branch: yearBranch },
    month: { stem: monthStem, branch: monthBranch },
    day: { stem: dayStem, branch: dayBranch },
    hour: hourPillar,
  };
}

// Calibration constant for the day 60갑자 cycle: (JDN + offset) mod 60, where
// index 0 = 갑자. With offset 49, JDN 2451545 (2000-01-01) → 戊午 (무오).
// Verified against reference 만세력 in lib/saju/__tests__.
export const DAY_GANZHI_OFFSET = 49;
