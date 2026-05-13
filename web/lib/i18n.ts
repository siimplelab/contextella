import type { Lang } from './types';

export interface Dict {
  appName: string;
  tagline: string;
  greeting_morning: string;
  greeting_evening: string;
  myProfile: string;
  myUniverse: string;
  myUniverseSub: (n: number) => string;
  universes: string;
  addUniverse: string;
  addPerson: string;
  todaysFortune: string;
  relationships: string;
  settings: string;
  elementWater: string;
  elementWaterPoetic: string;
  todaysVibe: string;
  todaysVibeBody: string;
  weekAhead: string;
  addTitle: string;
  addSubtitle: string;
  name: string;
  namePlaceholder: string;
  relation: string;
  relationFamily: string;
  relationPartner: string;
  relationFriend: string;
  relationColleague: string;
  relationOther: string;
  gender: string;
  genderF: string;
  genderM: string;
  genderO: string;
  birthDate: string;
  birthTime: string;
  timeUnknown: string;
  timeUnknownHint: string;
  cancel: string;
  save: string;
  saving: string;
  resultTitle: string;
  compatScore: string;
  compatLabel: (s: number) => string;
  synergies: string;
  conflicts: string;
  todaysJoint: string;
  weatherSunny: string;
  weatherCloudy: string;
  weatherRain: string;
  elementsLine: string;
  poeticLead: string;
  backToUniverse: string;
  today: string;
  score: string;
}

export const I18N: Record<Lang, Dict> = {
  ko: {
    appName: 'contextella',
    tagline: '관계의 결을 읽다',
    greeting_morning: '오늘의 결, 잘 다녀오셨나요',
    greeting_evening: '오늘 하루도, 무사히',
    myProfile: '나의 기운',
    myUniverse: '나의 우주',
    myUniverseSub: (n) => `연결된 ${n}명`,
    universes: '우주',
    addUniverse: '새 우주',
    addPerson: '사람 추가',
    todaysFortune: '오늘의 흐름',
    relationships: '관계',
    settings: '설정',
    elementWater: '물의 기운',
    elementWaterPoetic: '깊고 고요한, 흐르는 마음',
    todaysVibe: '오늘의 결',
    todaysVibeBody: '잔잔한 물결처럼 흘러가는 하루입니다. 무리하지 말고, 들어주는 사람이 되어보세요.',
    weekAhead: '이번 주 흐름',
    addTitle: '사람 추가하기',
    addSubtitle: '함께 보고 싶은 인연의 정보를 알려주세요',
    name: '이름',
    namePlaceholder: '예) 서연',
    relation: '관계',
    relationFamily: '가족',
    relationPartner: '연인',
    relationFriend: '친구',
    relationColleague: '동료',
    relationOther: '그 외',
    gender: '성별',
    genderF: '여성',
    genderM: '남성',
    genderO: '비공개',
    birthDate: '생년월일',
    birthTime: '태어난 시간',
    timeUnknown: '시간을 몰라요',
    timeUnknownHint: '괜찮아요. 더 큰 그림으로 풀어드릴게요.',
    cancel: '취소',
    save: '저장하기',
    saving: '결을 읽는 중…',
    resultTitle: '관계의 결',
    compatScore: '궁합 점수',
    compatLabel: (s) => s >= 85 ? '깊은 인연' : s >= 70 ? '잘 맞는 결' : s >= 55 ? '부드러운 거리감' : '서로 다른 결',
    synergies: '서로를 채우는 결',
    conflicts: '조심스러운 결',
    todaysJoint: '오늘, 두 사람의 흐름',
    weatherSunny: '맑음',
    weatherCloudy: '구름 조금',
    weatherRain: '잔잔한 비',
    elementsLine: '의 기운과 의 기운',
    poeticLead: '서로 다른 강을 흐르지만, 결국 같은 바다로 향하는 두 흐름.',
    backToUniverse: '우주로 돌아가기',
    today: '오늘',
    score: '점',
  },
  en: {
    appName: 'contextella',
    tagline: 'read the grain of relationships',
    greeting_morning: 'A gentle morning to you',
    greeting_evening: 'May this evening hold you well',
    myProfile: 'My Aura',
    myUniverse: 'My Universe',
    myUniverseSub: (n) => `${n} connected`,
    universes: 'Universes',
    addUniverse: 'New universe',
    addPerson: 'Add person',
    todaysFortune: 'Today’s Flow',
    relationships: 'Relations',
    settings: 'Settings',
    elementWater: 'Water Energy',
    elementWaterPoetic: 'Deep and quiet, a flowing heart',
    todaysVibe: 'Today’s Grain',
    todaysVibeBody: 'A day that drifts like still water. Don’t push — be the one who listens.',
    weekAhead: 'The week ahead',
    addTitle: 'Add a person',
    addSubtitle: 'Tell us about someone you want to read alongside',
    name: 'Name',
    namePlaceholder: 'e.g. Seoyeon',
    relation: 'Relation',
    relationFamily: 'Family',
    relationPartner: 'Partner',
    relationFriend: 'Friend',
    relationColleague: 'Colleague',
    relationOther: 'Other',
    gender: 'Gender',
    genderF: 'Female',
    genderM: 'Male',
    genderO: 'Private',
    birthDate: 'Date of birth',
    birthTime: 'Time of birth',
    timeUnknown: 'I don’t know the time',
    timeUnknownHint: 'That’s alright — we’ll read the wider picture.',
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Reading the grain…',
    resultTitle: 'The Grain Between',
    compatScore: 'Compatibility',
    compatLabel: (s) => s >= 85 ? 'Deep kinship' : s >= 70 ? 'Aligned grain' : s >= 55 ? 'Soft distance' : 'Different rivers',
    synergies: 'What you give each other',
    conflicts: 'Where to tread softly',
    todaysJoint: 'Today, between you',
    weatherSunny: 'Bright',
    weatherCloudy: 'A few clouds',
    weatherRain: 'Soft rain',
    elementsLine: ' and ',
    poeticLead: 'Two currents from different rivers, finding the same sea.',
    backToUniverse: 'Back to Universe',
    today: 'Today',
    score: 'pts',
  },
  // For ja/zh/es — fall back to English copy until full translations land
  ja: null as unknown as Dict,
  zh: null as unknown as Dict,
  es: null as unknown as Dict,
};

I18N.ja = I18N.en;
I18N.zh = I18N.en;
I18N.es = I18N.en;
