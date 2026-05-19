// Astronomical helpers for Saju: Julian Day numbers and the sun's apparent
// ecliptic longitude (Meeus, low-precision). Birth datetimes are interpreted
// as Korea Standard Time (UTC+9); KST has no daylight saving.

const KST_OFFSET_HOURS = 9;
const RAD = Math.PI / 180;

// Integer Julian Day Number for a civil (Gregorian) date — used for the day
// pillar's 60갑자 cycle. Calendar-date based; the day boundary is midnight.
export function julianDayNumber(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

// Fractional Julian Day (UT) for a KST wall-clock moment.
export function julianDayFromKST(
  year: number,
  month: number,
  day: number,
  hour = 12,
  minute = 0,
): number {
  const ms = Date.UTC(year, month - 1, day, hour - KST_OFFSET_HOURS, minute);
  return ms / 86400000 + 2440587.5;
}

// Sun's apparent ecliptic longitude in degrees [0, 360) for a given JD (UT).
export function solarLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const Mr = M * RAD;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mr) +
    0.000289 * Math.sin(3 * Mr);
  const trueLong = L0 + C;
  const omega = 125.04 - 1934.136 * T;
  const lambda = trueLong - 0.00569 - 0.00478 * Math.sin(omega * RAD);
  return ((lambda % 360) + 360) % 360;
}

// Signed angular difference a - b, wrapped to (-180, 180].
function angleDiff(a: number, b: number): number {
  return ((a - b + 540) % 360) - 180;
}

// JD (UT) of the instant the sun reaches `targetLongitude` near `guessJd`.
// Newton iteration; the sun moves ~0.98565°/day.
export function solarTermJD(targetLongitude: number, guessJd: number): number {
  let jd = guessJd;
  for (let i = 0; i < 8; i++) {
    const diff = angleDiff(solarLongitude(jd), targetLongitude);
    jd -= diff / 0.98565;
  }
  return jd;
}

// JD (UT) of 입춘 (Lichun, solar longitude 315°) for a given civil year —
// the boundary at which the Saju year increments. 입춘 falls near Feb 4.
export function ipchunJD(year: number): number {
  const guess = Date.UTC(year, 1, 4) / 86400000 + 2440587.5;
  return solarTermJD(315, guess);
}
