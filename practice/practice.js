// ---------- Practice page: weather check-in + quest streaks (localStorage only) ----------

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function loadLog() {
  try {
    const raw = localStorage.getItem('delve:practice-log');
    return raw ? JSON.parse(raw) : { lastDate: null, streak: 0, today: { date: null, quests: [], weather: null } };
  } catch {
    return { lastDate: null, streak: 0, today: { date: null, quests: [], weather: null } };
  }
}
function saveLog(log) {
  try {
    localStorage.setItem('delve:practice-log', JSON.stringify(log));
  } catch {
    /* practice still works this session even if it can't persist */
  }
}

let log = loadLog();
if (log.today.date !== todayStr()) {
  log.today = { date: todayStr(), quests: [], weather: null };
}

function recordActivityToday() {
  const today = todayStr();
  if (log.lastDate === today) {
    // already counted today
  } else if (log.lastDate === yesterdayStr()) {
    log.streak += 1;
  } else {
    log.streak = 1;
  }
  log.lastDate = today;
}

function renderStreak() {
  const el = document.getElementById('streakText');
  if (log.streak <= 0) {
    el.textContent = 'Start your first streak today';
  } else if (log.streak === 1) {
    el.textContent = 'Day 1 — nice start!';
  } else {
    el.textContent = `${log.streak}-day streak — keep it going!`;
  }
}

// ---------- Weather check-in ----------
document.querySelectorAll('[data-weather-pick]').forEach((btn) => {
  if (log.today.weather === btn.dataset.weatherPick) btn.classList.add('is-picked');
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-weather-pick]').forEach((b) => b.classList.remove('is-picked'));
    btn.classList.add('is-picked');
    log.today.weather = btn.dataset.weatherPick;
    recordActivityToday();
    saveLog(log);
    renderStreak();
    const note = document.getElementById('weatherNote');
    const messages = {
      storm: "Storm days happen. That's exactly what The One Breath below is for.",
      fog: 'Fog lifts slower — be extra gentle with yourself today.',
      clear: 'Clear skies! A good day to try one of the Do-Quests below.',
    };
    note.textContent = messages[btn.dataset.weatherPick] || '';
  });
});
if (log.today.weather) {
  const note = document.getElementById('weatherNote');
  const messages = {
    storm: "Storm days happen. That's exactly what The One Breath below is for.",
    fog: 'Fog lifts slower — be extra gentle with yourself today.',
    clear: 'Clear skies! A good day to try one of the Do-Quests below.',
  };
  note.textContent = messages[log.today.weather] || '';
}

// ---------- Quest checkboxes ----------
document.querySelectorAll('.quest-check').forEach((label) => {
  const id = label.dataset.quest;
  const checkbox = label.querySelector('input');
  if (log.today.quests.includes(id)) {
    checkbox.checked = true;
    label.classList.add('is-done');
  }
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      if (!log.today.quests.includes(id)) log.today.quests.push(id);
      label.classList.add('is-done');
      recordActivityToday();
    } else {
      log.today.quests = log.today.quests.filter((q) => q !== id);
      label.classList.remove('is-done');
    }
    saveLog(log);
    renderStreak();
  });
});

renderStreak();
