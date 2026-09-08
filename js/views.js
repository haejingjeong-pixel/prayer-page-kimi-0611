const pickEl = (id) => document.getElementById(id);

const clearNode = (node) => {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
};

const makeEl = (tag, className, text) => {
  const el = document.createElement(tag);
  if (className) {
    el.className = className;
  }
  if (text !== undefined && text !== null) {
    el.textContent = text;
  }
  return el;
};

const makeTag = (text, accent) => {
  const li = makeEl('li');
  li.appendChild(makeEl('span', accent ? 'tag tag-accent' : 'tag', text));
  return li;
};

const STEP_BACK = {
  'step-intro': 'step-name',
  'step-speaker': 'step-intro',
  'step-statement': 'step-speaker',
  'step-custom': 'step-statement',
  'step-combo': 'step-statement',
  'step-invite': 'step-combo',
  'step-prayer': 'step-invite',
  'step-gate': 'step-name'
};

const showStep = (stepId) => {
  const steps = document.querySelectorAll('.step');
  for (const step of steps) {
    if (step.id === stepId) {
      step.classList.add('is-active');
    } else {
      step.classList.remove('is-active');
    }
  }
  appState.step = stepId;
  document.body.classList.toggle('is-inner', stepId !== 'step-name');
  document.body.classList.toggle('is-wide', stepId === 'step-ledger');
  const back = pickEl('btn-back');
  if (back) {
    back.hidden = !STEP_BACK[stepId];
  }
  window.scrollTo(0, 0);
};

const goBackStep = () => {
  const target = STEP_BACK[appState.step];
  if (target) {
    showStep(target);
  }
};

const fillTargetSlots = () => {
  const slots = document.querySelectorAll('[data-slot="target"]');
  for (const slot of slots) {
    slot.textContent = appState.target;
  }
};

const renderChoiceGrid = (grid, options, selected, onPick) => {
  clearNode(grid);
  for (const option of options) {
    const value = option.id ? option.id : option;
    const label = option.label ? option.label : option;
    const button = makeEl('button', 'choice', label);
    button.type = 'button';
    button.setAttribute('aria-pressed', value === selected ? 'true' : 'false');
    button.addEventListener('click', () => onPick(value));
    grid.appendChild(button);
  }
};

const renderPickRow = (statement, list) => {
  const li = makeEl('li');
  const button = makeEl('button', 'pick-row');
  button.type = 'button';
  const picked = isPicked(statement.text);
  const full = appState.picked.length >= MAX_STATEMENTS;
  button.setAttribute('aria-pressed', picked ? 'true' : 'false');
  button.disabled = !picked && full;
  button.appendChild(makeEl('span', 'pick-mark', picked ? '✓' : ''));
  button.appendChild(makeEl('span', 'pick-text', statement.text));
  button.appendChild(makeEl('span', 'pick-cat', categoryShort(statement.categoryId)));
  button.addEventListener('click', () => {
    togglePicked(statement);
    renderStatementStep();
  });
  li.appendChild(button);
  list.appendChild(li);
};

const renderPickList = (statements) => {
  const list = makeEl('ul', 'pick-list');
  for (const statement of statements) {
    renderPickRow(statement, list);
  }
  return list;
};

const renderPickedSummary = () => {
  const counter = pickEl('picked-count');
  const list = pickEl('picked-list');
  clearNode(list);
  if (!appState.picked.length) {
    counter.hidden = true;
    return;
  }
  counter.hidden = false;
  counter.textContent = '고른 말 ' + appState.picked.length + ' / ' + MAX_STATEMENTS;
  for (const statement of appState.picked) {
    const li = makeEl('li');
    const button = makeEl('button', 'picked-item');
    button.type = 'button';
    button.appendChild(makeEl('span', '', statement.text));
    button.appendChild(makeEl('span', '', '×'));
    button.addEventListener('click', () => {
      togglePicked(statement);
      renderStatementStep();
    });
    li.appendChild(button);
    list.appendChild(li);
  }
};

const renderStatementStep = () => {
  renderPickedSummary();
  pickEl('btn-statement-next').disabled = appState.picked.length === 0;

  const host = pickEl('statement-results');
  clearNode(host);
  const query = pickEl('input-search').value;

  if (query.trim()) {
    const results = searchStatements(STATEMENTS, query);
    const group = makeEl('section', 'list-group');
    if (!results.length) {
      group.appendChild(makeEl('p', 'empty-note', '찾으시는 말이 없어요. 비슷한 표현으로 다시 검색하거나 직접 입력해주세요.'));
    } else {
      group.appendChild(makeEl('h3', 'list-group-label', '검색 결과 ' + results.length + '건'));
      group.appendChild(renderPickList(results));
    }
    host.appendChild(group);
    return;
  }

  const quickGroup = makeEl('section', 'list-group');
  quickGroup.appendChild(makeEl('h3', 'list-group-label', '자주 듣는 말'));
  quickGroup.appendChild(renderPickList(QUICK_STATEMENTS));
  host.appendChild(quickGroup);

  const browse = makeEl('section', 'list-group');
  browse.appendChild(makeEl('h3', 'list-group-label', '종류별로 보기'));
  for (const category of CATEGORIES) {
    const items = [];
    for (const statement of STATEMENTS) {
      if (statement.categoryId === category.id && !isQuickText(statement.text)) {
        items.push(statement);
      }
    }
    if (!items.length) {
      continue;
    }
    const details = makeEl('details', 'disclosure');
    details.appendChild(makeEl('summary', '', category.label + ' · ' + items.length));
    details.appendChild(renderPickList(items));
    browse.appendChild(details);
  }
  host.appendChild(browse);
};

const isQuickText = (text) => {
  for (const statement of QUICK_STATEMENTS) {
    if (statement.text === text) {
      return true;
    }
  }
  return false;
};

const renderComboStep = () => {
  const who = appState.target;
  const verdict = judgeCombo(appState.picked);
  const prayer = assignPrayer(verdict);

  pickEl('combo-title').textContent = comboHeadline(who, verdict);
  pickEl('combo-note').textContent = comboNote(who);
  pickEl('combo-grade').textContent = verdict.grade;
  pickEl('combo-prayer').textContent = prayerTitle(prayer, who);

  const tags = pickEl('combo-tags');
  clearNode(tags);
  tags.appendChild(makeTag('기도가 추가되었습니다', true));
  tags.appendChild(makeTag(verdict.grade));
  tags.appendChild(makeTag('사랑의 기도'));

  const prayerTags = pickEl('combo-prayer-tags');
  clearNode(prayerTags);
  prayerTags.appendChild(makeTag(prayer.label));
  prayerTags.appendChild(makeTag(prayerLength(prayer)));
  prayerTags.appendChild(makeTag(prayer.act));

  const quotes = pickEl('combo-quotes');
  clearNode(quotes);
  for (const statement of appState.picked) {
    const li = makeEl('li', 'quote-card');
    li.appendChild(makeEl('p', '', '“' + statement.text + '”'));
    li.appendChild(makeEl('span', '', categoryLabel(statement.categoryId)));
    quotes.appendChild(li);
  }
};

const prayerLength = (prayer) => {
  if (prayer.mode === 'timer') {
    return Math.round(prayer.seconds / 60 * 10) / 10 + '분';
  }
  return '수행 조건 5개';
};

const renderInviteStep = () => {
  const task = appState.task;
  const who = appState.target;
  const prayer = findPrayer(task.prayerId);
  const first = task.statements.length ? task.statements[0] : null;

  pickEl('invite-lead').textContent = task.speaker + '님께서는 최근 ' + who + '에게';
  pickEl('invite-quote').textContent = first ? '“' + first.text + '”' : '';
  pickEl('invite-no').textContent = String(task.id).replace('task_', 'NO. ').toUpperCase();
  pickEl('invite-prayer').textContent = prayerTitle(prayer, who);

  const fields = pickEl('invite-fields');
  clearNode(fields);
  const rows = [
    ['요청인', task.speaker + (task.relation ? ' · ' + task.relation : '')],
    ['기도 대상', who],
    ['수행 방식', prayer.act]
  ];
  for (const row of rows) {
    const group = makeEl('div', 'slip-field');
    group.appendChild(makeEl('dt', '', row[0]));
    group.appendChild(makeEl('dd', '', row[1]));
    fields.appendChild(group);
  }

  const tags = pickEl('invite-tags');
  clearNode(tags);
  tags.appendChild(makeTag(prayer.label));
  tags.appendChild(makeTag(prayerLength(prayer)));
};

const renderCheckList = () => {
  const list = pickEl('check-list');
  clearNode(list);
  const items = prayerChecklist(appState.target);
  for (let i = 0; i < items.length; i = i + 1) {
    const index = i;
    const li = makeEl('li');
    const button = makeEl('button', 'check-row');
    button.type = 'button';
    const on = appState.checks.indexOf(index) !== -1;
    button.setAttribute('aria-pressed', on ? 'true' : 'false');
    button.appendChild(makeEl('span', 'check-box', on ? '✓' : ''));
    button.appendChild(makeEl('span', '', items[index]));
    button.addEventListener('click', () => toggleCheck(index));
    li.appendChild(button);
    list.appendChild(li);
  }
};

const renderStatGrid = (summary) => {
  const grid = pickEl('stat-grid');
  clearNode(grid);
  const rows = [
    ['총 결혼 관련 발언', summary.says + '회', 'stat'],
    ['발생한 기도', summary.tasks + '건', 'stat'],
    ['기도 완료', summary.done + '건', 'stat stat-done'],
    ['미이행', summary.open + '건', 'stat stat-open']
  ];
  for (const row of rows) {
    const group = makeEl('div', row[2]);
    group.appendChild(makeEl('dt', '', row[0]));
    group.appendChild(makeEl('dd', '', row[1]));
    grid.appendChild(group);
  }
};

const renderLedgerStep = () => {
  const rows = ledgerFor(appState.target);
  const summary = summarizeLedger(rows);
  pickEl('ledger-title').textContent = appState.target + ' 결혼기도 현황';
  pickEl('ledger-empty').hidden = rows.length > 0;
  renderStatGrid(summary);

  const body = pickEl('ledger-body');
  clearNode(body);
  for (const person of summary.people) {
    const tr = makeEl('tr');
    const nameCell = makeEl('td', '', person.speaker);
    if (person.relation) {
      nameCell.appendChild(makeEl('span', 'ledger-relation', person.relation));
    }
    tr.appendChild(nameCell);
    tr.appendChild(makeEl('td', 'num', String(person.says)));
    tr.appendChild(makeEl('td', 'ledger-prayer', person.prayerText));
    const doneClass = person.done === person.tasks ? 'ledger-done' : 'ledger-open';
    tr.appendChild(makeEl('td', doneClass, person.done + '/' + person.tasks));
    body.appendChild(tr);
  }
};
