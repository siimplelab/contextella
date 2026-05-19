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
  ja: {
    appName: 'contextella',
    tagline: '関係の機微を読む',
    greeting_morning: '穏やかな朝をあなたに',
    greeting_evening: '今宵も、どうかご無事に',
    myProfile: '私の気',
    myUniverse: '私の宇宙',
    myUniverseSub: (n) => `${n}人とつながり`,
    universes: '宇宙',
    addUniverse: '新しい宇宙',
    addPerson: '人を追加',
    todaysFortune: '今日の流れ',
    relationships: '関係',
    settings: '設定',
    elementWater: '水の気',
    elementWaterPoetic: '深く静かに、流れる心',
    todaysVibe: '今日の機微',
    todaysVibeBody: '静かな水面のように流れる一日です。無理をせず、聞き手になってみましょう。',
    weekAhead: '今週の流れ',
    addTitle: '人を追加する',
    addSubtitle: '一緒に見たいご縁の情報を教えてください',
    name: '名前',
    namePlaceholder: '例）さくら',
    relation: '関係',
    relationFamily: '家族',
    relationPartner: '恋人',
    relationFriend: '友人',
    relationColleague: '同僚',
    relationOther: 'その他',
    gender: '性別',
    genderF: '女性',
    genderM: '男性',
    genderO: '非公開',
    birthDate: '生年月日',
    birthTime: '生まれた時刻',
    timeUnknown: '時刻が分かりません',
    timeUnknownHint: '大丈夫です。より大きな視点で読み解きます。',
    cancel: 'キャンセル',
    save: '保存する',
    saving: '機微を読み取り中…',
    resultTitle: '関係の機微',
    compatScore: '相性スコア',
    compatLabel: (s) => s >= 85 ? '深いご縁' : s >= 70 ? 'よく合う機微' : s >= 55 ? 'やわらかな距離' : '異なる流れ',
    synergies: '互いを満たす機微',
    conflicts: '慎重になりたい機微',
    todaysJoint: '今日、二人の流れ',
    weatherSunny: '晴れ',
    weatherCloudy: '少し曇り',
    weatherRain: '穏やかな雨',
    elementsLine: 'と',
    poeticLead: '異なる川を流れながら、やがて同じ海へ向かう二つの流れ。',
    backToUniverse: '宇宙へ戻る',
    today: '今日',
    score: '点',
  },
  zh: {
    appName: 'contextella',
    tagline: '解读关系的纹理',
    greeting_morning: '愿你拥有平静的早晨',
    greeting_evening: '愿今夜温柔待你',
    myProfile: '我的气',
    myUniverse: '我的宇宙',
    myUniverseSub: (n) => `已连接 ${n} 人`,
    universes: '宇宙',
    addUniverse: '新宇宙',
    addPerson: '添加人物',
    todaysFortune: '今日的流动',
    relationships: '关系',
    settings: '设置',
    elementWater: '水之气',
    elementWaterPoetic: '深邃而宁静，流动的心',
    todaysVibe: '今日的纹理',
    todaysVibeBody: '今天像平静的水面一样流淌。不必勉强，试着做一个倾听者。',
    weekAhead: '本周的流动',
    addTitle: '添加一个人',
    addSubtitle: '告诉我们你想一同解读的那个人',
    name: '姓名',
    namePlaceholder: '例）小明',
    relation: '关系',
    relationFamily: '家人',
    relationPartner: '恋人',
    relationFriend: '朋友',
    relationColleague: '同事',
    relationOther: '其他',
    gender: '性别',
    genderF: '女',
    genderM: '男',
    genderO: '不公开',
    birthDate: '出生日期',
    birthTime: '出生时辰',
    timeUnknown: '不知道时辰',
    timeUnknownHint: '没关系，我们会从更宏观的角度来解读。',
    cancel: '取消',
    save: '保存',
    saving: '正在解读纹理…',
    resultTitle: '关系的纹理',
    compatScore: '契合度',
    compatLabel: (s) => s >= 85 ? '深厚的缘分' : s >= 70 ? '契合的纹理' : s >= 55 ? '柔和的距离' : '不同的河流',
    synergies: '彼此成全的纹理',
    conflicts: '需要留心的纹理',
    todaysJoint: '今天，你们之间的流动',
    weatherSunny: '晴朗',
    weatherCloudy: '微云',
    weatherRain: '细雨',
    elementsLine: '与',
    poeticLead: '流经不同的河川，却终将奔向同一片海的两股水流。',
    backToUniverse: '返回宇宙',
    today: '今天',
    score: '分',
  },
  es: {
    appName: 'contextella',
    tagline: 'lee la textura de los vínculos',
    greeting_morning: 'Una mañana serena para ti',
    greeting_evening: 'Que esta noche te acoja bien',
    myProfile: 'Mi aura',
    myUniverse: 'Mi universo',
    myUniverseSub: (n) => `${n} conectados`,
    universes: 'Universos',
    addUniverse: 'Nuevo universo',
    addPerson: 'Añadir persona',
    todaysFortune: 'El flujo de hoy',
    relationships: 'Vínculos',
    settings: 'Ajustes',
    elementWater: 'Energía de agua',
    elementWaterPoetic: 'Profundo y sereno, un corazón que fluye',
    todaysVibe: 'La textura de hoy',
    todaysVibeBody: 'Un día que fluye como agua mansa. No fuerces nada — sé quien escucha.',
    weekAhead: 'La semana que viene',
    addTitle: 'Añadir una persona',
    addSubtitle: 'Cuéntanos sobre alguien a quien quieras leer a tu lado',
    name: 'Nombre',
    namePlaceholder: 'ej. Lucía',
    relation: 'Relación',
    relationFamily: 'Familia',
    relationPartner: 'Pareja',
    relationFriend: 'Amistad',
    relationColleague: 'Colega',
    relationOther: 'Otro',
    gender: 'Género',
    genderF: 'Mujer',
    genderM: 'Hombre',
    genderO: 'Privado',
    birthDate: 'Fecha de nacimiento',
    birthTime: 'Hora de nacimiento',
    timeUnknown: 'No sé la hora',
    timeUnknownHint: 'No pasa nada — leeremos el panorama más amplio.',
    cancel: 'Cancelar',
    save: 'Guardar',
    saving: 'Leyendo la textura…',
    resultTitle: 'La textura entre ambos',
    compatScore: 'Compatibilidad',
    compatLabel: (s) => s >= 85 ? 'Vínculo profundo' : s >= 70 ? 'Textura afín' : s >= 55 ? 'Distancia suave' : 'Ríos distintos',
    synergies: 'Lo que se dan mutuamente',
    conflicts: 'Dónde pisar con cuidado',
    todaysJoint: 'Hoy, entre ustedes',
    weatherSunny: 'Despejado',
    weatherCloudy: 'Algunas nubes',
    weatherRain: 'Lluvia suave',
    elementsLine: ' y ',
    poeticLead: 'Dos corrientes de ríos distintos que encuentran el mismo mar.',
    backToUniverse: 'Volver al universo',
    today: 'Hoy',
    score: 'pts',
  },
};

// Inline string picker for one-off UI text outside the Dict. Falls back to en.
export function pick(
  lang: Lang,
  opts: { ko: string; en: string; ja?: string; zh?: string; es?: string },
): string {
  return opts[lang] ?? opts.en;
}

const RELATION_DICT_KEY: Record<string, keyof Dict> = {
  family: 'relationFamily',
  partner: 'relationPartner',
  friend: 'relationFriend',
  colleague: 'relationColleague',
  other: 'relationOther',
};

// Localized label for a relation key (family/partner/friend/colleague/other).
export function relationLabel(relation: string | undefined, lang: Lang): string {
  const key = RELATION_DICT_KEY[relation ?? 'other'] ?? 'relationOther';
  return I18N[lang][key] as string;
}
