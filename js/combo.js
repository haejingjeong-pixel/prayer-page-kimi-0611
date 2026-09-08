const normalizeText = (text) => {
  const source = text ? String(text) : '';
  return source.toLowerCase().replace(/\s+/g, '');
};

const searchStatements = (statements, query) => {
  const needle = normalizeText(query);
  if (!needle) {
    return statements;
  }
  const found = [];
  for (const statement of statements) {
    if (normalizeText(statement.text).indexOf(needle) !== -1) {
      found.push(statement);
    }
  }
  return found;
};

const findCategory = (categoryId) => {
  for (const category of CATEGORIES) {
    if (category.id === categoryId) {
      return category;
    }
  }
  return null;
};

const categoryLabel = (categoryId) => {
  const category = findCategory(categoryId);
  return category ? category.label : '직접 입력';
};

const categoryShort = (categoryId) => {
  const category = findCategory(categoryId);
  return category ? category.short : '직접 입력';
};

const hasFinalConsonant = (word) => {
  const source = word ? String(word).trim() : '';
  if (!source) {
    return false;
  }
  const code = source.charCodeAt(source.length - 1);
  if (code < 0xac00 || code > 0xd7a3) {
    return false;
  }
  return (code - 0xac00) % 28 !== 0;
};

const josa = (word, pair) => {
  const table = { '이': ['이', '가'], '을': ['을', '를'], '은': ['은', '는'], '과': ['과', '와'] };
  const option = table[pair];
  if (!option) {
    return pair;
  }
  return hasFinalConsonant(word) ? option[0] : option[1];
};

const prayerTitle = (prayer, who) => {
  if (prayer.subject) {
    return who + josa(who, '이') + prayer.suffix;
  }
  return who + prayer.suffix;
};

const prayerChecklist = (who) => [
  '무릎을 꿇었습니다.',
  who + josa(who, '을') + ' 떠올렸습니다.',
  '좋은 형제를 만나기를 기도했습니다.',
  '행복한 신앙생활을 하기를 기도했습니다.',
  '아멘했습니다.'
];

const uniqueCategoryIds = (statements) => {
  const ids = [];
  for (const statement of statements) {
    if (statement.categoryId && ids.indexOf(statement.categoryId) === -1) {
      ids.push(statement.categoryId);
    }
  }
  return ids;
};

const judgeCombo = (statements) => {
  const ids = uniqueCategoryIds(statements);
  let risk = 0;
  for (const id of ids) {
    const category = findCategory(id);
    risk = risk + (category ? category.risk : 1);
  }
  const hasPrivacy = ids.indexOf('privacy') !== -1;
  const hasInsult = ids.indexOf('insult') !== -1;
  const count = ids.length;
  let grade = '기본 발언';
  if (count === 2) {
    grade = '2콤보';
  }
  if (count >= 3) {
    grade = '3콤보';
  }
  return {
    categories: ids,
    comboCount: count,
    grade: grade,
    risk: risk,
    hasPrivacy: hasPrivacy,
    hasInsult: hasInsult
  };
};

const assignPrayer = (verdict) => {
  let index = Math.min(3, Math.max(0, verdict.comboCount - 1)) + Math.max(0, Math.round(verdict.risk / 2) - 1);
  if (verdict.hasPrivacy) {
    index = Math.max(index, 5);
  }
  if (verdict.hasInsult) {
    index = PRAYERS.length - 1;
  }
  if (index < 0) {
    index = 0;
  }
  if (index > PRAYERS.length - 1) {
    index = PRAYERS.length - 1;
  }
  return PRAYERS[index];
};

const findPrayer = (prayerId) => {
  for (const prayer of PRAYERS) {
    if (prayer.id === prayerId) {
      return prayer;
    }
  }
  return PRAYERS[0];
};

const comboHeadline = (who, verdict) => {
  if (verdict.comboCount >= 3) {
    return who + '의 행복을 위한 세 겹의 기도';
  }
  if (verdict.comboCount === 2) {
    return who + '의 행복을 위한 사랑의 기도';
  }
  return who + '의 행복을 위한 기도';
};

const comboNote = (who) => '전해주신 관심을 이제 ' + who + '의 행복을 위한 기도로 이어가 주세요.';
