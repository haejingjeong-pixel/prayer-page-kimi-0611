const appState = {
  step: 'step-name',
  target: '',
  speaker: '',
  relation: '',
  picked: [],
  customText: '',
  customCategory: '',
  task: null,
  checks: [],
  secondsLeft: 0,
  running: false,
  ticker: 0
};

const readLedger = () => {
  const raw = localStorage.getItem(LEDGER_KEY);
  if (!raw) {
    return [];
  }
  const parsed = JSON.parse(raw);
  return parsed ? parsed : [];
};

const writeLedger = (rows) => {
  localStorage.setItem(LEDGER_KEY, JSON.stringify(rows));
};

const appendTask = (task) => {
  const rows = readLedger();
  rows.push(task);
  writeLedger(rows);
};

const markTaskDone = (taskId) => {
  const rows = readLedger();
  for (const row of rows) {
    if (row.id === taskId) {
      row.status = 'done';
      row.doneAt = Date.now();
    }
  }
  writeLedger(rows);
};

const ledgerFor = (target) => {
  const rows = readLedger();
  const mine = [];
  for (const row of rows) {
    if (row.target === target) {
      mine.push(row);
    }
  }
  return mine;
};

const shareCode = (taskId) => 'prayer.love/' + String(taskId).replace('task_', '');

const summarizeLedger = (rows) => {
  const people = [];
  let says = 0;
  let done = 0;
  for (const row of rows) {
    const count = row.statements ? row.statements.length : 1;
    says = says + count;
    if (row.status === 'done') {
      done = done + 1;
    }
    let person = null;
    for (const candidate of people) {
      if (candidate.speaker === row.speaker) {
        person = candidate;
      }
    }
    if (!person) {
      person = { speaker: row.speaker, relation: row.relation, says: 0, tasks: 0, done: 0, prayers: {} };
      people.push(person);
    }
    person.says = person.says + count;
    person.tasks = person.tasks + 1;
    if (row.status === 'done') {
      person.done = person.done + 1;
    }
    const label = row.prayerLabel;
    person.prayers[label] = person.prayers[label] ? person.prayers[label] + 1 : 1;
  }
  for (const person of people) {
    let headLabel = '';
    let headCount = 0;
    let rest = 0;
    for (const label in person.prayers) {
      const value = person.prayers[label];
      if (value > headCount) {
        if (headLabel) {
          rest = rest + headCount;
        }
        headLabel = label;
        headCount = value;
      } else {
        rest = rest + value;
      }
    }
    let text = '—';
    if (headLabel) {
      text = headLabel + ' ' + headCount + '회';
      if (rest > 0) {
        text = text + ' 외 ' + rest + '건';
      }
    }
    person.prayerText = text;
  }
  for (let i = 0; i < people.length; i = i + 1) {
    for (let j = i + 1; j < people.length; j = j + 1) {
      if (people[j].says > people[i].says) {
        const swap = people[i];
        people[i] = people[j];
        people[j] = swap;
      }
    }
  }
  return { says: says, tasks: rows.length, done: done, open: rows.length - done, people: people };
};

const isPicked = (text) => {
  for (const statement of appState.picked) {
    if (statement.text === text) {
      return true;
    }
  }
  return false;
};

const togglePicked = (statement) => {
  if (isPicked(statement.text)) {
    const next = [];
    for (const item of appState.picked) {
      if (item.text !== statement.text) {
        next.push(item);
      }
    }
    appState.picked = next;
    return;
  }
  if (appState.picked.length >= MAX_STATEMENTS) {
    return;
  }
  appState.picked.push(statement);
};

const buildTask = () => {
  const verdict = judgeCombo(appState.picked);
  const prayer = assignPrayer(verdict);
  return {
    id: 'task_' + Date.now().toString(36),
    target: appState.target,
    speaker: appState.speaker,
    relation: appState.relation,
    statements: appState.picked.slice(0),
    categories: verdict.categories,
    comboName: comboHeadline(appState.target, verdict),
    grade: verdict.grade,
    prayerId: prayer.id,
    prayerLabel: prayer.label,
    status: 'pending',
    createdAt: Date.now()
  };
};

const resetFlow = () => {
  appState.picked = [];
  appState.customText = '';
  appState.customCategory = '';
  appState.task = null;
  appState.checks = [];
  appState.running = false;
  if (appState.ticker) {
    clearInterval(appState.ticker);
    appState.ticker = 0;
  }
};
