import type { Person, Universe, ElementKey } from '@/lib/types';
import {
  computeFourPillars,
  parseBirthInput,
  dayMaster,
  elementBalance,
  pillarViews,
  compatibility,
  type FourPillars,
  type PillarView,
} from '@/lib/saju/index';

// --- DB row shapes (structural; avoids coupling to generated Prisma types) ---
export interface DbPerson {
  id: string;
  nameKo: string;
  nameEn: string;
  relation: string;
  gender: string;
  birthDate: string;
  birthTime: string | null;
  emoji: string | null;
}
export interface DbUniverse {
  id: string;
  nameKo: string;
  nameEn: string;
  icon: string | null;
  accentTint: string | null;
  members: DbPerson[];
}
export interface DbUser {
  id: string;
  name: string;
  birthDate: string | null;
  birthTime: string | null;
  gender: string | null;
}

// Pillars for the signed-in user; null until onboarding supplies birth data.
export function userPillars(user: DbUser): FourPillars | null {
  if (!user.birthDate) return null;
  const input = parseBirthInput(user.birthDate, user.birthTime);
  return input ? computeFourPillars(input) : null;
}

// Deterministic constellation layout derived from the Saju pillars.
function layout(p: FourPillars): { angle: number; distance: number } {
  const angle = (p.day.branch * 31 + p.day.stem * 7 + p.month.branch * 13) % 360;
  const distance = 0.42 + ((p.month.branch + p.day.stem) % 7) * 0.055;
  return { angle, distance };
}

// A DB person → the frontend Person shape, enriched with real Saju values.
// `mePil` is the signed-in user's pillars, used to compute the compat score.
export function serializePerson(row: DbPerson, mePil: FourPillars | null): Person {
  const input = parseBirthInput(row.birthDate, row.birthTime);
  const pillars = input ? computeFourPillars(input) : null;
  const element: ElementKey = pillars ? dayMaster(pillars) : 'earth';
  const { angle, distance } = pillars ? layout(pillars) : { angle: 0, distance: 0.6 };
  const score = pillars && mePil ? compatibility(mePil, pillars).score : undefined;

  return {
    id: row.id,
    name_ko: row.nameKo,
    name_en: row.nameEn,
    relation: row.relation,
    element,
    birth: row.birthDate,
    time: row.birthTime,
    initials: (row.nameKo || row.nameEn || '·').slice(0, 1),
    emoji: row.emoji ?? undefined,
    score,
    angle,
    distance,
  };
}

export function serializeUniverse(row: DbUniverse, mePil: FourPillars | null): Universe {
  return {
    id: row.id,
    name_ko: row.nameKo,
    name_en: row.nameEn,
    icon: row.icon ?? undefined,
    accentTint: row.accentTint ?? undefined,
    members: row.members.map(m => serializePerson(m, mePil)),
  };
}

// The signed-in user as a Person ("me"). Returns null if not yet onboarded.
export function serializeMe(user: DbUser): Person | null {
  if (!user.birthDate) return null;
  const input = parseBirthInput(user.birthDate, user.birthTime);
  if (!input) return null;
  const pillars = computeFourPillars(input);
  return {
    id: 'me',
    name_ko: user.name,
    name_en: user.name,
    relation: 'self',
    element: dayMaster(pillars),
    birth: user.birthDate,
    time: user.birthTime,
    initials: (user.name || '·').slice(0, 1),
    angle: 0,
  };
}

// The Saju profile detail for the Me screen: four pillars + element balance.
export function meSaju(user: DbUser):
  { pillars: PillarView[]; balance: Record<ElementKey, number> } | null {
  const pil = userPillars(user);
  if (!pil) return null;
  return { pillars: pillarViews(pil), balance: elementBalance(pil) };
}
