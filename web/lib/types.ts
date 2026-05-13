export type ElementKey = 'water' | 'fire' | 'wood' | 'metal' | 'earth';

export type Lang = 'ko' | 'en' | 'ja' | 'zh' | 'es';

export type AccentKey = 'champagne' | 'gold' | 'rose' | 'lilac';

export interface Person {
  id: string;
  name_ko: string;
  name_en: string;
  relation_ko?: string;
  relation_en?: string;
  element: ElementKey;
  birth: string;
  time: string | null;
  initials: string;
  emoji?: string;
  score?: number;
  angle?: number;
  distance?: number;
}

export interface Universe {
  id: string;
  name_ko: string;
  name_en: string;
  icon?: string;
  accentTint?: string;
  members: Person[];
}

export interface PersonWithFlow extends Person {
  universeId: string;
  universeName_ko: string;
  universeName_en: string;
  flow: number;
}

export interface DayReport {
  dayElement: ElementKey;
  all: PersonWithFlow[];
  bright: PersonWithFlow[];
  careful: PersonWithFlow[];
  avg: number;
  total: number;
}
