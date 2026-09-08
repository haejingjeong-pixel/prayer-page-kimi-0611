const RING_RADIUS = 104;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

const formatClock = (totalSeconds) => {
  const safe = totalSeconds > 0 ? totalSeconds : 0;
  const minutes = String(Math.floor(safe / 60)).padStart(2, '0');
  const seconds = String(safe % 60).padStart(2, '0');
  return minutes + ':' + seconds;
};

const currentPrayer = () => findPrayer(appState.task.prayerId);

const isPrayerDone = () => {
  const prayer = currentPrayer();
  if (prayer.mode === 'timer') {
    return appState.secondsLeft <= 0;
  }
  return appState.checks.length === prayerChecklist(appState.target).length;
};

const paintTimer = () => {
  const prayer = currentPrayer();
  const wrap = pickEl('timer-wrap');
  const progress = pickEl('timer-progress');
  const done = isPrayerDone();
  const ratio = (prayer.seconds - appState.secondsLeft) / prayer.seconds;
  const clamped = Math.max(0, Math.min(1, ratio));
  progress.setAttribute('stroke-dasharray', String(RING_LENGTH));
  progress.setAttribute('stroke-dashoffset', String(RING_LENGTH * (1 - clamped)));
  pickEl('timer-count').textContent = formatClock(appState.secondsLeft);
  if (done) {
    wrap.classList.add('is-done');
  } else {
    wrap.classList.remove('is-done');
  }
};

const paintPrayerState = () => {
  const done = isPrayerDone();
  const prayer = currentPrayer();
  pickEl('prayer-state').textContent = done ? '수 행 완 료' : '수 행 중';
  pickEl('prayer-done-band').hidden = !done;
  pickEl('btn-prayer-done').disabled = !done;
  pickEl('btn-prayer-done').textContent = prayer.mode === 'timer' ? '기도 완료' : '기도 완료 처리';
  pickEl('timer-controls').hidden = done || prayer.mode !== 'timer';
  pickEl('btn-timer-toggle').textContent = appState.running ? '잠시 멈추기' : '이어서 기도하기';
};

const tickTimer = () => {
  if (!appState.running) {
    return;
  }
  if (appState.secondsLeft <= 0) {
    stopTimer();
    paintTimer();
    paintPrayerState();
    return;
  }
  appState.secondsLeft = appState.secondsLeft - 1;
  paintTimer();
  if (appState.secondsLeft <= 0) {
    stopTimer();
    paintPrayerState();
  }
};

const stopTimer = () => {
  appState.running = false;
  if (appState.ticker) {
    clearInterval(appState.ticker);
    appState.ticker = 0;
  }
};

const startTimer = () => {
  stopTimer();
  appState.running = true;
  appState.ticker = setInterval(tickTimer, 1000);
};

const toggleCheck = (index) => {
  const position = appState.checks.indexOf(index);
  if (position === -1) {
    appState.checks.push(index);
  } else {
    const next = [];
    for (const value of appState.checks) {
      if (value !== index) {
        next.push(value);
      }
    }
    appState.checks = next;
  }
  renderCheckList();
  paintPrayerState();
};

const openPrayerStep = () => {
  const prayer = currentPrayer();
  const who = appState.target;
  pickEl('prayer-kind').textContent = prayer.label;
  pickEl('prayer-title').textContent = prayerTitle(prayer, who);
  pickEl('prayer-guide').textContent = who + '에게 결혼하라고 말한 만큼 ' + who + josa(who, '이') + ' 어떤 사람을 만나면 좋을지 하나님께 진지하게 기도해주세요.';
  pickEl('prayer-act').textContent = prayer.act;

  const timerMode = prayer.mode === 'timer';
  pickEl('timer-wrap').hidden = !timerMode;
  pickEl('check-list').hidden = timerMode;
  appState.checks = [];

  if (timerMode) {
    appState.secondsLeft = prayer.seconds;
    paintTimer();
    startTimer();
  } else {
    stopTimer();
    renderCheckList();
  }
  paintPrayerState();
  showStep('step-prayer');
};

const pinKeyFor = (target) => PIN_PREFIX + target;
const sessionKeyFor = (target) => SESSION_PREFIX + target;

const openLedgerGate = () => {
  if (!appState.target) {
    return;
  }
  const unlocked = sessionStorage.getItem(sessionKeyFor(appState.target)) === '1';
  if (unlocked) {
    renderLedgerStep();
    showStep('step-ledger');
    return;
  }
  const existing = localStorage.getItem(pinKeyFor(appState.target));
  const setup = !existing;
  pickEl('gate-title').innerHTML = setup ? '관리자 암호를<br>정해주세요.' : '관리자 모드로<br>들어가십니다.';
  pickEl('gate-lead').textContent = setup
    ? appState.target + ' 현황을 여는 암호입니다. 이름마다 암호가 따로 만들어지며, 발언자는 현황을 보지 못합니다.'
    : '누가 어떤 말을 했는지는 관리자만 보십니다.';
  pickEl('gate-label').textContent = appState.target + ' 관리자 암호';
  pickEl('field-pin-again').hidden = !setup;
  pickEl('btn-gate-submit').textContent = setup ? '암호 생성하기' : '관리자 모드 열기';
  pickEl('input-pin').value = '';
  pickEl('input-pin-again').value = '';
  pickEl('gate-error').hidden = true;
  showStep('step-gate');
};

const unlockLedger = () => {
  sessionStorage.setItem(sessionKeyFor(appState.target), '1');
  renderLedgerStep();
  showStep('step-ledger');
};

const digitsOnly = (value) => value.replace(/[^0-9]/g, '').slice(0, 4);

const showGateError = (message) => {
  const box = pickEl('gate-error');
  box.textContent = message;
  box.hidden = false;
};

const submitGate = () => {
  const stored = localStorage.getItem(pinKeyFor(appState.target));
  const entry = digitsOnly(pickEl('input-pin').value);
  if (!stored) {
    const again = digitsOnly(pickEl('input-pin-again').value);
    if (entry.length !== 4) {
      showGateError('네 자리 숫자를 적어주세요.');
      return;
    }
    if (entry !== again) {
      showGateError('다시 적은 숫자가 달라요.');
      return;
    }
    localStorage.setItem(pinKeyFor(appState.target), entry);
    unlockLedger();
    return;
  }
  if (entry === stored) {
    unlockLedger();
    return;
  }
  pickEl('input-pin').value = '';
  showGateError('암호가 맞지 않아요.');
};

const goStatementStep = () => {
  renderStatementStep();
  showStep('step-statement');
};

const restartFlow = () => {
  resetFlow();
  pickEl('input-search').value = '';
  goStatementStep();
};

const bindNameStep = () => {
  const form = pickEl('form-name');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = pickEl('input-name').value.trim();
    if (!value) {
      return;
    }
    appState.target = value;
    fillTargetSlots();
    showStep('step-intro');
  });
};

const bindIntroStep = () => {
  pickEl('btn-intro-next').addEventListener('click', () => showStep('step-speaker'));
};

const bindSpeakerStep = () => {
  const input = pickEl('input-speaker');
  const grid = pickEl('relation-grid');
  const button = pickEl('btn-speaker-next');
  const refresh = () => {
    button.disabled = input.value.trim().length === 0;
  };
  const pickRelation = (value) => {
    appState.relation = appState.relation === value ? '' : value;
    renderChoiceGrid(grid, RELATIONS, appState.relation, pickRelation);
  };
  renderChoiceGrid(grid, RELATIONS, appState.relation, pickRelation);
  input.addEventListener('input', refresh);
  pickEl('form-speaker').addEventListener('submit', (event) => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) {
      return;
    }
    appState.speaker = value;
    goStatementStep();
  });
};

const bindStatementStep = () => {
  pickEl('input-search').addEventListener('input', renderStatementStep);
  pickEl('btn-open-custom').addEventListener('click', openCustomStep);
  pickEl('btn-statement-next').addEventListener('click', () => {
    renderComboStep();
    showStep('step-combo');
  });
};

const openCustomStep = () => {
  const grid = pickEl('custom-category-grid');
  const input = pickEl('input-custom');
  input.value = appState.customText;
  appState.customCategory = '';
  const pickCategory = (value) => {
    appState.customCategory = appState.customCategory === value ? '' : value;
    renderChoiceGrid(grid, CATEGORIES, appState.customCategory, pickCategory);
    refreshCustomButton();
  };
  renderChoiceGrid(grid, CATEGORIES, appState.customCategory, pickCategory);
  refreshCustomButton();
  showStep('step-custom');
};

const refreshCustomButton = () => {
  const filled = pickEl('input-custom').value.trim().length > 0;
  pickEl('btn-custom-next').disabled = !filled || !appState.customCategory;
};

const bindCustomStep = () => {
  pickEl('input-custom').addEventListener('input', refreshCustomButton);
  pickEl('btn-custom-back').addEventListener('click', goStatementStep);
  pickEl('form-custom').addEventListener('submit', (event) => {
    event.preventDefault();
    const text = pickEl('input-custom').value.trim();
    if (!text || !appState.customCategory) {
      return;
    }
    const id = 'custom_' + Date.now().toString(36);
    togglePicked({ id: id, text: text, categoryId: appState.customCategory, isCustom: true });
    appState.customText = '';
    appState.customCategory = '';
    pickEl('input-custom').value = '';
    goStatementStep();
  });
};

const bindComboStep = () => {
  pickEl('btn-combo-next').addEventListener('click', () => {
    appState.task = buildTask();
    appendTask(appState.task);
    renderInviteStep();
    showStep('step-invite');
  });
};

const bindInviteStep = () => {
  pickEl('btn-invite-next').addEventListener('click', openPrayerStep);
};

const bindPrayerStep = () => {
  pickEl('btn-timer-toggle').addEventListener('click', () => {
    if (appState.running) {
      stopTimer();
    } else {
      startTimer();
    }
    paintPrayerState();
  });
  pickEl('btn-prayer-done').addEventListener('click', () => {
    stopTimer();
    markTaskDone(appState.task.id);
    appState.task.status = 'done';
    const prayer = currentPrayer();
    pickEl('done-prayer').textContent = prayerTitle(prayer, appState.target);
    pickEl('done-meta').textContent = appState.task.speaker + '님 · ' + prayer.label;
    showStep('step-done');
  });
};

const bindDoneStep = () => {
  pickEl('btn-done-ledger').addEventListener('click', openLedgerGate);
  pickEl('btn-done-restart').addEventListener('click', restartFlow);
};

const bindGateStep = () => {
  pickEl('input-pin').addEventListener('input', () => {
    pickEl('input-pin').value = digitsOnly(pickEl('input-pin').value);
  });
  pickEl('input-pin-again').addEventListener('input', () => {
    pickEl('input-pin-again').value = digitsOnly(pickEl('input-pin-again').value);
  });
  pickEl('btn-gate-back').addEventListener('click', () => {
    showStep(appState.task ? 'step-done' : 'step-name');
  });
  pickEl('form-gate').addEventListener('submit', (event) => {
    event.preventDefault();
    submitGate();
  });
};

const bindLedgerStep = () => {
  pickEl('btn-ledger-restart').addEventListener('click', restartFlow);
  pickEl('btn-ledger-lock').addEventListener('click', () => {
    sessionStorage.removeItem(sessionKeyFor(appState.target));
    showStep(appState.task ? 'step-done' : 'step-name');
  });
};

const bindBrandBar = () => {
  pickEl('btn-back').addEventListener('click', goBackStep);
  pickEl('btn-open-ledger').addEventListener('click', () => {
    if (!appState.target) {
      pickEl('input-name').focus();
      return;
    }
    openLedgerGate();
  });
};

const startApp = () => {
  bindBrandBar();
  bindNameStep();
  bindIntroStep();
  bindSpeakerStep();
  bindStatementStep();
  bindCustomStep();
  bindComboStep();
  bindInviteStep();
  bindPrayerStep();
  bindDoneStep();
  bindGateStep();
  bindLedgerStep();
  showStep('step-name');
};

startApp();
