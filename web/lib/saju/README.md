# The Saju engine — how the fortune logic works

This directory computes a person's **사주 (Saju, "Four Pillars of Destiny")** and
everything derived from it: their dominant element, their five-element balance,
a daily-energy flow score, and a compatibility (궁합) reading between two people.

The guiding principle is **transparency and reproducibility**. There is no
randomness, no hidden server, and no hand-tuned "magic numbers" that vary per
user. The same birth data always yields the same chart, and every number traces
back to a documented rule of traditional Saju or to a published astronomical
formula. This is what makes the readings trustworthy: they are *verifiable*, not
arbitrary. Every rule below is covered by reference tests in
[`__tests__/`](./__tests__) anchored to authoritative 만세력 (perpetual
calendar) values.

> **What Saju is.** Saju reads the heavenly stem and earthly branch of the
> *year, month, day and hour* of birth — four "pillars", eight characters
> (팔자) — and interprets the interplay of the five elements (오행) within them.
> It is a centuries-old East-Asian tradition, offered here for reflection and
> entertainment, not as deterministic prediction.

---

## 1. The building blocks (`constants.ts`)

### 천간 — 10 Heavenly Stems
`갑 을 병 정 무 기 경 신 임 계`, cycling through the five elements in
yin/yang pairs:

| Stem | 갑 | 을 | 병 | 정 | 무 | 기 | 경 | 신 | 임 | 계 |
|------|----|----|----|----|----|----|----|----|----|----|
| Element | 木 | 木 | 火 | 火 | 土 | 土 | 金 | 金 | 水 | 水 |
| Polarity | 陽 | 陰 | 陽 | 陰 | 陽 | 陰 | 陽 | 陰 | 陽 | 陰 |

### 지지 — 12 Earthly Branches
`자 축 인 묘 진 사 오 미 신 유 술 해`, each tied to an element and an animal,
and each carrying **지장간 (hidden stems)** — the stems concealed inside the
branch, with weights that sum to 30. These hidden stems are what let a branch
contribute to the element balance (e.g. 인 is nominally Wood, but hides 戊/丙/甲).

### 오행 cycles
- **상생 (generation)** — 木→火→土→金→水→木 (one element nourishes the next).
- **상극 (control)** — 木→土→水→火→金→木 (one element restrains another).

### 지지 relations (used for both daily flow and compatibility)
- **육합 (six harmonies)** — six branch pairs that bind comfortably: 자축, 인해, 묘술, 진유, 사신, 오미.
- **삼합 (three harmonies)** — four trios that resonate toward one element: 신자진→水, 인오술→火, 해묘미→木, 사유축→金.
- **충 (clash)** — a branch opposes the one 6 positions away (자오, 축미, …).
- **형 (punishment)** — the 삼형 trios 인사신 / 축술미, the 상형 pair 자묘, and the 자형 self-set 진오유해.
- **해 (harm)** — six pairs whose contact slowly grates: 자미, 축오, 인사, 묘진, 신해, 유술.

---

## 2. Astronomy (`astronomy.ts`)

Saju is a **solar** system: months and the year boundary are defined by the
Sun's position on the ecliptic, not by the civil calendar. We therefore need
real astronomy, not approximations.

- **`julianDayNumber(y, m, d)`** — the integer Julian Day Number of a civil date
  (Fliegel & Van Flandern). It increments by exactly 1 each calendar day across
  month, leap-day and year boundaries, which is what keeps the 60갑자 day cycle
  unbroken.
- **`solarLongitude(jd)`** — the Sun's apparent ecliptic longitude in degrees,
  via Meeus' low-precision series (accurate to ≈0.01°, far finer than the ~1°/day
  the Sun moves, so solar-term boundaries land within about a minute).
- **`solarTermJD(targetLongitude, guess)`** — Newton iteration that finds the
  instant the Sun reaches a given longitude (the Sun moves ~0.98565°/day).
- **`ipchunJD(year)`** — the moment of **입춘 (Lichun, longitude 315°)**, the
  start of spring and the boundary at which the Saju year turns over. It falls
  around Feb 3–5.

All birth datetimes are interpreted as **Korea Standard Time (UTC+9)**, which has
no daylight saving. Times are converted to UT before any astronomical step so the
comparison against solar instants is timezone-correct.

---

## 3. The four pillars (`pillars.ts`)

Given a validated birth input, `computeFourPillars` produces the year, month, day
and (optional) hour pillars.

### Year pillar — turns at 입춘
The Saju year is the civil year, **rolled back by one if the birth precedes that
year's 입춘**. So someone born 1984-01-15 belongs to the 1983 (계해) year, while
1984-06-15 is 1984 (갑자). Stem = `(sajuYear − 4) mod 10`, branch =
`(sajuYear − 4) mod 12` (the year 4 CE was 갑자).

### Month pillar — solar term + 五虎遁
The branch comes from which **30° solar sector** the Sun occupies: 인月 begins at
입춘 (315°), 묘月 at 345°, and so on around the wheel. The stem follows the
**五虎遁 (Five-Tiger) rule**, which fixes the 인月 stem from the year stem
(갑·기년 → 丙寅, 을·경년 → 戊寅, …) and counts forward from there.

### Day pillar — the unbroken 60갑자 cycle
The day is the workhorse of Saju. Its index is
`(julianDayNumber + 49) mod 60`, where 0 = 갑자. The offset **49** is calibrated
so the cycle matches authoritative 만세력: 1900-01-01 = 갑술, 2000-01-01 = 무오.
Because the Julian Day Number is purely date-based and gap-free, the cycle never
drifts.

### Hour pillar — two-hour branches + 五鼠遁
Each branch spans two clock hours, with **子時 (자시) spanning 23:00–00:59**.
The stem follows the **五鼠遁 (Five-Rat) rule**, deriving the 子時 stem from the
day stem (갑·기일 → 甲子, 을·경일 → 丙子, …). If the birth time is unknown the
hour pillar is omitted entirely rather than guessed — the rest of the chart is
still read.

---

## 4. Profile: day master & element balance (`profile.ts`)

- **일간 / Day Master (`dayMaster`)** — the **day stem's element** is the
  person's core self and the element shown throughout the app. (For 무오 the day
  master is 土 / earth.)
- **오행 분포 / Element balance (`elementBalance`)** — every visible stem counts
  once, and every branch distributes one unit across its hidden stems by weight.
  The totals are normalised to sum to **exactly 100** using largest-remainder
  rounding, so the distribution bar is always honest.

---

## 5. Daily flow (`daily.ts`)

`dailyFlow(person, dayPillar)` scores 20–98 how today's energy meets a person,
and is **directional** (the day acts on the person):

1. Start at 58.
2. Compare the **day's element** to the person's day master: it *nourishes* them
   (+20), is the *same* (+8), is *nourished by* them (+4), is *controlled by*
   them (−6), or *controls* them (−16).
3. Compare the **day branch** to the person's day branch: 육합 (+10),
   삼합 (+8), 충 (−12), 형/해 (−6).

`dayElementOf` (today's governing element) and `dailyAdvice` (a curated phrase
table per element, in every supported language) drive the "Today" screen.

---

## 6. Compatibility / 궁합 (`compat.ts`)

`compatibility(a, b)` returns a 5–98 score plus the **factors** that produced it,
starting from a neutral 50:

- **Day master (일간) relation** — same element +9, a 상생 generative pairing
  +18 (the strongest single signal), a 상극 controlling pairing −7.
- **Branch relations, per pillar** — 육합 / 삼합 add, 충 / 형 / 해 subtract, and
  the **day branch (일지) is weighted most heavily** (it governs the intimate,
  day-to-day relationship), with year, month and hour contributing less.
- **Element complement** — a small bonus when one person is rich in an element
  the other lacks, i.e. they fill each other's gaps.

Two important properties, both locked by tests:

- **Symmetric** — `compatibility(a, b) == compatibility(b, a)`. A relationship
  reads the same from either side; fairness is built in.
- **Deterministic & bounded** — identical input always gives the identical
  score, clamped to 5–98 (never a bleak 0 or an absolute 100).

The matching factors are turned into human prose by `synergyConflict`, which
maps each factor id to a localized phrase, orders them by weight, and falls back
to a gentle default when a chart is quiet.

---

## 7. Conventions & assumptions

These are deliberate modelling choices. We state them plainly so a reader can
judge the result for themselves.

- **Timezone.** All birth times are read as **KST (UTC+9)**. The app does not
  ask for birth location and does **not** apply a true-solar-time / Local Mean
  Time longitude correction. For births within a few minutes of a 시 (two-hour)
  boundary, or under Korea's historical half-hour standard-time periods, the hour
  pillar could differ from a location-corrected calculation.
- **Day boundary (야자시).** The day pillar follows the **civil date**: a
  23:00–23:59 birth keeps that day's day-pillar and uses 子 for the hour
  (the *야자시* convention). Some schools instead start a new day at 23:00; we use
  the mainstream Korean-manse convention and document it rather than hide it.
- **Year boundary.** The Saju year turns at **입춘**, computed astronomically per
  year — not on January 1 and not on the lunar new year.
- **Unknown time.** Charts without a birth time omit the hour pillar entirely; no
  placeholder hour is invented.

## 8. Limitations

Saju is an interpretive tradition with many schools that disagree on weightings,
the day boundary, and how strongly each relation counts. The numbers here encode
*one* coherent, internally consistent reading; they are not a universal truth.
Treat the app as a lens for reflection and conversation, not as a forecast.

## 9. Verifying it yourself

Run the suite:

```bash
npm test
```

[`__tests__/saju.test.ts`](./__tests__/saju.test.ts) and
[`__tests__/engine.test.ts`](./__tests__/engine.test.ts) check, among other
things: the day-pillar anchors (1900-01-01 갑술, 2000-01-01 무오), one-step-per-day
continuity across leap and year boundaries, the 입춘 year roll-back, the
五虎遁/五鼠遁 stem rules, the full 2000-01-01 12:00 KST chart (기묘 / 병자 / 무오 /
무오), element balances that always sum to 100, compatibility symmetry and bounds,
and the solar-term solver landing within an arcminute of every requested
longitude.
