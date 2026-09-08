const MAX_STATEMENTS = 3;

const CATEGORIES = [
  { id: 'relationship', label: '연애 여부 탐색형', short: '연애 탐색', risk: 1 },
  { id: 'marriage', label: '결혼 직접 질문형', short: '결혼 질문', risk: 1 },
  { id: 'age', label: '나이 압박형', short: '나이 압박', risk: 2 },
  { id: 'comparison', label: '비교형', short: '비교', risk: 2 },
  { id: 'family', label: '가족·부모 소환형', short: '가족 소환', risk: 2 },
  { id: 'future', label: '미래 걱정형', short: '미래 걱정', risk: 2 },
  { id: 'personality', label: '성격·조건 판단형', short: '성격 판단', risk: 3 },
  { id: 'privacy', label: '사생활 침범형', short: '사생활 침범', risk: 4 },
  { id: 'insult', label: '비하·모욕형', short: '비하·모욕', risk: 5 }
];

const RELATIONS = ['가족', '친구', '직장 사람', '처음 본 사람', '기타'];

const CORPUS = {
  relationship: ['사귀는 사람 없어?', '남자친구 없어?', '요즘 만나는 사람 없어?', '썸 타는 사람도 없어?', '연애는 안 해?', '소개팅 안 해?', '주변에 괜찮은 사람 없어?', '연락하는 사람도 없어?'],
  marriage: ['결혼 생각 없어?', '결혼 안 해?', '결혼할 사람 없어?', '언제 결혼할 거야?', '결혼할 계획은 있어?', '결혼할 생각은 하고 있지?', '이제 결혼해야 하지 않아?', '좋은 사람 만나서 결혼해야지'],
  age: ['이 나이면 결혼할 사람 있지 않아?', '이 나이면 남자친구 있겠네?', '이제 나이도 있는데', '더 늦기 전에 만나야지', '그러다 늦는다', '지금부터 만나도 시간 걸리잖아', '네 나이면 다들 결혼하지 않았어?', '이제 슬슬 결혼해야지'],
  comparison: ['친구들은 다 결혼했지?', '김ㅇㅇ는 벌써 결혼했더라', '동갑들은 거의 다 결혼하지 않았어?', '너만 아직 안 한 거 아니야?', '이ㅇㅇ는 벌써 애도 있더라', '동생도 결혼했는데 넌 언제 해?', '주변 사람들은 다 가정 꾸렸잖아'],
  family: ['부모님이 걱정하시겠다', '부모님도 결혼하는 거 보고 싶으실 텐데', '부모님이 아무 말씀 안 하셔?', '집에서는 결혼하라고 안 해?', '부모님도 손주 보고 싶어 하시지 않아?', '부모님 생각하면 결혼해야지'],
  future: ['혼자 늙으면 외롭지 않아?', '나중에 누가 챙겨줘?', '평생 혼자 살 거야?', '나중에 아프면 어떡해?', '그래도 가족은 있어야지', '혼자 살면 힘들어', '나이 들면 더 외로워져', '결국 배우자는 있어야 하지 않아?'],
  personality: ['눈이 너무 높은 거 아니야?', '너무 까다로운 거 아니야?', '조건을 너무 따지는 거 아니야?', '사람을 너무 재는 거 아니야?', '성격 때문에 못 만나는 거 아니야?', '조금만 눈을 낮춰봐', '네가 먼저 마음을 열어야지', '너무 혼자 있는 데 익숙해진 거 아니야?'],
  privacy: ['너는 여자 좋아해?', '남자를 안 좋아해?', '남자한테 관심이 없는 거야?', '연애를 안 하는 특별한 이유가 있어?', '전에 무슨 일 있었어?', '남자가 싫어진 거야?', '결혼 못 하는 거야, 안 하는 거야?', '왜 그렇게까지 연애를 안 해?'],
  insult: ['그러니까 아직 결혼 못 했지', '결혼 못 한 사람들은 이유가 있어', '그렇게 하니까 남자가 없지', '그 나이까지 혼자면 문제 있는 거 아니야?', '문제 있으니까 혼자인 거 아니야?', '너는 결혼하기 어렵겠다', '계속 그러면 평생 혼자 산다', '결혼 안 하는 패배자들이 그렇게 말하지']
};

const STATEMENTS = [];
let statementSeq = 0;
for (const category of CATEGORIES) {
  for (const text of CORPUS[category.id]) {
    statementSeq = statementSeq + 1;
    const id = 'statement_' + String(statementSeq).padStart(3, '0');
    STATEMENTS.push({ id: id, text: text, categoryId: category.id });
  }
}

const QUICK_SOURCE = [
  { text: '그 나이인데, 사귀는 사람 없어?', categoryId: 'age' },
  { text: '그 나이인데,결혼할 사람 없어?', categoryId: 'age' },
  { text: '그 나이인데,결혼 생각 없어?', categoryId: 'age' },
  { text: '그 나이인데, 결혼 안 해?', categoryId: 'age' },
  { text: '이 나이면 결혼할 사람 있지 않아?', categoryId: 'age' },
  { text: '이 나이면 남자친구 있겠네?', categoryId: 'age' },
  { text: '좋은 사람 좀 만나야지', categoryId: 'marriage' },
  { text: '소개팅 안 해?', categoryId: 'relationship' },
  { text: '너는 여자 좋아해?', categoryId: 'privacy' },
  { text: '결혼 안 하는 패배자들이 그렇게 말하지', categoryId: 'insult' }
];

const QUICK_STATEMENTS = [];
for (let i = 0; i < QUICK_SOURCE.length; i = i + 1) {
  const source = QUICK_SOURCE[i];
  const id = 'quick_' + String(i + 1).padStart(3, '0');
  QUICK_STATEMENTS.push({ id: id, text: source.text, categoryId: source.categoryId });
}

const PRAYERS = [
  { id: 'arrow', label: '화살기도', mode: 'timer', seconds: 30, act: '그 자리에서 짧게 기도', suffix: '의 결혼을 위한 화살기도' },
  { id: 'two_min', label: '2분 기도', mode: 'timer', seconds: 120, act: '2분 타이머', suffix: '의 결혼을 위한 2분 기도' },
  { id: 'consider', label: '하나님과 고민하는 기도', mode: 'timer', seconds: 120, act: '어떤 형제를 만나면 좋을지 구체적으로 기도', subject: true, suffix: ' 어떤 형제를 만나면 좋을지 하나님과 고민하는 기도' },
  { id: 'happy', label: '행복기도', mode: 'timer', seconds: 150, act: '어떻게 결혼해서 행복했으면 하는지 기도', subject: true, suffix: ' 어떻게 결혼해서 행복했으면 하는지 하나님께 말하는 기도' },
  { id: 'knee', label: '무릎 통성기도', mode: 'checklist', act: '무릎 꿇고 간절히 기도', subject: true, suffix: ' 형제를 만나 사랑하기를 간절히 원하는 무릎 꿇고 통성기도' },
  { id: 'tears', label: '눈물의 기도', mode: 'checklist', act: '행복하게 신앙하기를 진심으로 기도', subject: true, suffix: ' 형제를 만나 행복하게 신앙하기를 바라는 눈물의 기도' },
  { id: 'samchang', label: '주여삼창기도', mode: 'checklist', act: '주여 3번 외친 후 통성기도', subject: true, suffix: ' 형제를 만나기 위해 주여 삼창 외치고 기도하기' }
];

const LEDGER_KEY = 'pfl_ledger_v1';
const PIN_PREFIX = 'pfl_admin_pin:';
const SESSION_PREFIX = 'pfl_admin_session:';
