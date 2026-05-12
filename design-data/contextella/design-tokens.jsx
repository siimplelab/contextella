// design-tokens.jsx — Contextella design system
// Purple cosmic, balanced calm + cosmic, Korean-default

const ACCENT_PALETTE = {
  champagne: { hex: '#E8D4A2', name: '샴페인', soft: 'rgba(232,212,162,0.16)' },
  gold:      { hex: '#F4C26B', name: '골드',   soft: 'rgba(244,194,107,0.18)' },
  rose:      { hex: '#E8A4B5', name: '로즈',   soft: 'rgba(232,164,181,0.18)' },
};

// Five elements in Saju (오행) — colors tuned for purple cosmic palette
const ELEMENTS = {
  water: {
    ko: '수(水)', en: 'Water', ja: '水', zh: '水', es: 'Agua',
    label_ko: '물의 기운', label_en: 'Water Energy',
    c1: '#7AC4E8', c2: '#3D6FE8', c3: '#1A2A6B',
    glyph: '水',
  },
  fire: {
    ko: '화(火)', en: 'Fire',
    label_ko: '불의 기운', label_en: 'Fire Energy',
    c1: '#FFB088', c2: '#E85A6B', c3: '#7A1F4D',
    glyph: '火',
  },
  wood: {
    ko: '목(木)', en: 'Wood',
    label_ko: '나무의 기운', label_en: 'Wood Energy',
    c1: '#9DD6A8', c2: '#3FA76A', c3: '#143D2B',
    glyph: '木',
  },
  metal: {
    ko: '금(金)', en: 'Metal',
    label_ko: '쇠의 기운', label_en: 'Metal Energy',
    c1: '#F4E5C2', c2: '#C9A55E', c3: '#5C4220',
    glyph: '金',
  },
  earth: {
    ko: '토(土)', en: 'Earth',
    label_ko: '흙의 기운', label_en: 'Earth Energy',
    c1: '#D9B89A', c2: '#A87750', c3: '#3D2817',
    glyph: '土',
  },
};

// Self
const ME = {
  id: 'me',
  name_ko: '나',
  name_en: 'Me',
  relation_ko: '본인',
  relation_en: 'Self',
  element: 'water',
  birth: '1993.06.14',
  time: '23:40',
  initials: '나',
  angle: 0,
};

// Multiple universes — family, friends, work
const UNIVERSES = [
  {
    id: 'family',
    name_ko: '가족',
    name_en: 'Family',
    icon: 'home',
    accentTint: '#E8D4A2',
    members: [
      { id: 'f1', name_ko: '어머니', name_en: 'Mom', relation_ko: '엄마', relation_en: 'Mother',
        element: 'wood', birth: '1965.03.22', time: '06:30', initials: '엄', emoji: '🌸',
        score: 82, angle: 30, distance: 0.55 },
      { id: 'f2', name_ko: '아버지', name_en: 'Dad', relation_ko: '아빠', relation_en: 'Father',
        element: 'earth', birth: '1962.08.11', time: '14:00', initials: '아', emoji: '🌲',
        score: 71, angle: 115, distance: 0.7 },
      { id: 'f3', name_ko: '동생', name_en: 'Sibling', relation_ko: '여동생', relation_en: 'Sister',
        element: 'fire', birth: '1996.04.18', time: null, initials: '동', emoji: '🌶',
        score: 88, angle: 200, distance: 0.5 },
      { id: 'f4', name_ko: '할머니', name_en: 'Grandma', relation_ko: '외할머니', relation_en: 'Grandma',
        element: 'metal', birth: '1938.11.04', time: '03:15', initials: '할',
        score: 76, angle: 290, distance: 0.78 },
    ],
  },
  {
    id: 'friends1',
    name_ko: '친구 그룹 1',
    name_en: 'Friends 1',
    icon: 'sparkle',
    accentTint: '#C9A8E8',
    members: [
      { id: 'fr1', name_ko: '서연', name_en: 'Seoyeon', relation_ko: '연인', relation_en: 'Partner',
        element: 'fire', birth: '1994.11.02', time: '09:15', initials: '서', emoji: '💖',
        score: 87, angle: 35, distance: 0.5 },
      { id: 'fr2', name_ko: '도윤', name_en: 'Doyoon', relation_ko: '친구', relation_en: 'Friend',
        element: 'metal', birth: '1992.09.18', time: '14:00', initials: '도',
        score: 68, angle: 145, distance: 0.72 },
      { id: 'fr3', name_ko: '지우', name_en: 'Jiwoo', relation_ko: '오랜 친구', relation_en: 'Old friend',
        element: 'water', birth: '1993.07.30', time: '21:00', initials: '지', emoji: '🌊',
        score: 91, angle: 250, distance: 0.45 },
      { id: 'fr4', name_ko: '민서', name_en: 'Minseo', relation_ko: '친구', relation_en: 'Friend',
        element: 'wood', birth: '1995.02.09', time: null, initials: '민',
        score: 73, angle: 330, distance: 0.65 },
      { id: 'fr5', name_ko: '윤호', name_en: 'Yunho', relation_ko: '친구', relation_en: 'Friend',
        element: 'earth', birth: '1991.10.21', time: '17:50', initials: '윤',
        score: 64, angle: 90, distance: 0.85 },
    ],
  },
  {
    id: 'work',
    name_ko: '직장',
    name_en: 'Work',
    icon: 'briefcase',
    accentTint: '#E8A4B5',
    members: [
      { id: 'w1', name_ko: '하준', name_en: 'Hajun', relation_ko: '팀장', relation_en: 'Lead',
        element: 'earth', birth: '1988.12.07', time: null, initials: '하', emoji: '💼',
        score: 55, angle: 25, distance: 0.55 },
      { id: 'w2', name_ko: '예린', name_en: 'Yerin', relation_ko: '동료', relation_en: 'Colleague',
        element: 'water', birth: '1990.05.16', time: '11:20', initials: '예',
        score: 79, angle: 130, distance: 0.62 },
      { id: 'w3', name_ko: '시우', name_en: 'Siwoo', relation_ko: '동료', relation_en: 'Colleague',
        element: 'metal', birth: '1989.01.27', time: '08:00', initials: '시',
        score: 62, angle: 240, distance: 0.78 },
      { id: 'w4', name_ko: '재민', name_en: 'Jaemin', relation_ko: '주니어', relation_en: 'Junior',
        element: 'fire', birth: '1997.06.03', time: '19:40', initials: '재',
        score: 70, angle: 320, distance: 0.7 },
    ],
  },
];

// Flat helper: build network for a chosen universe with `me` at center
function getNetwork(universeId) {
  const u = UNIVERSES.find(x => x.id === universeId) || UNIVERSES[0];
  return [ME, ...u.members];
}

// Find a single person across all universes
function findPerson(id) {
  if (id === 'me') return ME;
  for (const u of UNIVERSES) {
    const m = u.members.find(p => p.id === id);
    if (m) return m;
  }
  return null;
}

// Korean / English copy bundle
const I18N = {
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
    // dashboard
    elementWater: '물의 기운',
    elementWaterPoetic: '깊고 고요한, 흐르는 마음',
    todaysVibe: '오늘의 결',
    todaysVibeBody: '잔잔한 물결처럼 흘러가는 하루입니다. 무리하지 말고, 들어주는 사람이 되어보세요.',
    weekAhead: '이번 주 흐름',
    // add person
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
    // result
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
    // misc
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
    todaysFortune: 'Today\u2019s Flow',
    relationships: 'Relations',
    settings: 'Settings',
    elementWater: 'Water Energy',
    elementWaterPoetic: 'Deep and quiet, a flowing heart',
    todaysVibe: 'Today\u2019s Grain',
    todaysVibeBody: 'A day that drifts like still water. Don\u2019t push — be the one who listens.',
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
    timeUnknown: 'I don\u2019t know the time',
    timeUnknownHint: 'That\u2019s alright — we\u2019ll read the wider picture.',
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Reading the grain\u2026',
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
};

const LANGS = [
  { code: 'ko', label: '한국어', short: 'KO' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ja', label: '日本語',  short: 'JA' },
  { code: 'zh', label: '中文',    short: 'ZH' },
  { code: 'es', label: 'Español', short: 'ES' },
];

// Date formatters per language
function formatDate(date, lang) {
  const d = (date instanceof Date) ? date : new Date(date);
  const Y = d.getFullYear(), M = d.getMonth() + 1, D = d.getDate();
  if (lang === 'ko') return `${Y}년 ${M}월 ${D}일`;
  if (lang === 'ja') return `${Y}年${M}月${D}日`;
  if (lang === 'zh') return `${Y}年${M}月${D}日`;
  if (lang === 'es') return `${D} de ${['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][M-1]} de ${Y}`;
  // en default
  return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][M-1]} ${D}, ${Y}`;
}

// Convert "1993.06.14" → Date
function parseBirth(str) {
  if (!str) return null;
  const [y, m, d] = str.split('.').map(Number);
  return new Date(y, m - 1, d);
}

Object.assign(window, {
  ACCENT_PALETTE, ELEMENTS, ME, UNIVERSES, getNetwork, findPerson, I18N, LANGS,
  formatDate, parseBirth,
});
