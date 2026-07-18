// ---------- Reveal on scroll, with automatic stagger per section ----------
const reveals = document.querySelectorAll('.reveal');
const groups = new Map(); // parent section -> counter for stagger

reveals.forEach((el) => {
  const section = el.closest('section, header') || document.body;
  const count = groups.get(section) || 0;
  el.style.setProperty('--stagger', `${Math.min(count * 0.12, 0.6)}s`);
  groups.set(section, count + 1);
});

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.12 }
);
reveals.forEach((el) => observer.observe(el));

// ---------- Nav background + hero hills parallax ----------
const nav = document.getElementById('nav');
const parallaxEls = document.querySelectorAll('[data-parallax]');
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let ticking = false;
window.addEventListener('scroll', () => {
  nav.classList.toggle('is-scrolled', window.scrollY > 40);
  if (prefersReduced || ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const y = window.scrollY;
    parallaxEls.forEach((el) => {
      el.style.transform = `translateY(${y * parseFloat(el.dataset.parallax)}px)`;
    });
    ticking = false;
  });
}, { passive: true });

// ---------- Title: thoughts swirl in, settle, breathe — click to scatter again ----------
const heroTitle = document.querySelector('.hero__title');
const heroLetters = document.querySelectorAll('.hero__letter');
const SETTLE_MS = 2300; // swirl-in duration + last letter's delay

const settleLetters = () =>
  setTimeout(() => heroLetters.forEach((l) => l.classList.add('is-settled')), SETTLE_MS);

settleLetters();

if (heroTitle && !prefersReduced) {
  heroTitle.addEventListener('click', () => {
    heroTitle.classList.add('is-resetting'); // hide the shirorekha bar
    heroLetters.forEach((l) => {
      l.classList.remove('is-settled');
      l.style.animation = 'none';
    });
    void heroTitle.offsetWidth; // force reflow so the animations replay
    heroTitle.classList.remove('is-resetting');
    heroLetters.forEach((l) => (l.style.animation = ''));
    settleLetters();
  });
}

// ---------- Twinkling sparkles in the hero ----------
const sparkleHost = document.getElementById('sparkles');
if (sparkleHost && !prefersReduced) {
  const glyphs = ['✨', '⭐', '🌟'];
  const sparkleCount = window.matchMedia('(max-width: 640px)').matches ? 7 : 14;
  for (let i = 0; i < sparkleCount; i++) {
    const s = document.createElement('span');
    s.className = 'sparkle';
    s.textContent = glyphs[i % glyphs.length];
    s.style.left = `${5 + Math.random() * 90}%`;
    s.style.top = `${5 + Math.random() * 60}%`;
    s.style.setProperty('--dur', `${2.5 + Math.random() * 3}s`);
    s.style.setProperty('--delay', `${Math.random() * 4}s`);
    sparkleHost.appendChild(s);
  }
}

// ---------- Mind-weather tracker: the page settles as you scroll ----------
const WEATHER = {
  storm: { icon: '⛈️', label: 'Mind-weather: Storm' },
  fog: { icon: '🌫️', label: 'Mind-weather: Fog' },
  clear: { icon: '☀️', label: 'Mind-weather: Clear' },
};
const chip = document.getElementById('weatherChip');
const chipIcon = document.getElementById('weatherIcon');
const chipLabel = document.getElementById('weatherLabel');

if (chip) {
  let current = 'storm';
  const weatherObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const w = entry.target.dataset.weather;
        if (w && w !== current && WEATHER[w]) {
          current = w;
          chipIcon.textContent = WEATHER[w].icon;
          chipLabel.textContent = WEATHER[w].label;
          chip.classList.add('is-changing');
          setTimeout(() => chip.classList.remove('is-changing'), 400);
        }
      }
    },
    { threshold: 0.4 }
  );
  document.querySelectorAll('[data-weather]').forEach((el) => weatherObserver.observe(el));
}

// ---------- The One Breath: settle Chanchal the monkey ----------
const breathBtn = document.getElementById('breathBtn');
const breathCircle = document.getElementById('breathCircle');
const breathLabel = document.getElementById('breathLabel');

if (breathBtn && breathCircle && breathLabel) {
  const IN_MS = 4000;
  const OUT_MS = 4000;
  breathBtn.addEventListener('click', () => {
    breathBtn.disabled = true;
    breathBtn.style.opacity = '.5';
    breathCircle.classList.remove('is-calm', 'is-out');
    breathCircle.classList.add('is-breathing', 'is-in');
    breathLabel.textContent = 'Breathe in… slowly… fill up like a balloon… 🎈';

    setTimeout(() => {
      breathCircle.classList.remove('is-in');
      breathCircle.classList.add('is-out');
      breathLabel.textContent = 'And breathe out… slowly… let it all go… 🍃';
    }, IN_MS);

    setTimeout(() => {
      breathCircle.classList.remove('is-breathing', 'is-out');
      breathCircle.classList.add('is-calm');
      breathLabel.textContent = 'Look — Chanchal sat down beside you! That’s the oldest secret in the world. ✨';
      breathBtn.textContent = 'Once More? 🌬️';
      breathBtn.disabled = false;
      breathBtn.style.opacity = '1';
    }, IN_MS + OUT_MS);
  });
}

// ---------- Weather cards: a little pop when tapped ----------
document.querySelectorAll('.weather__card').forEach((card) => {
  card.addEventListener('click', () => {
    card.animate(
      [
        { transform: 'scale(1) rotate(0deg)' },
        { transform: 'scale(1.12) rotate(-3deg)' },
        { transform: 'scale(.96) rotate(2deg)' },
        { transform: 'scale(1) rotate(0deg)' },
      ],
      { duration: 450, easing: 'ease-out' }
    );
  });
});

// ---------- Character introductions: Hanuman turns to their scrapbook page ----------
const CHARACTERS = {
  mohan: {
    img: 'images/mohan.png',
    accent: '#23BBA8', accentDeep: '#169787',
    name: 'Mohan', trait: 'The Timid Heart · Level 1 Over-Preparer',
    caption: 'Packs everything. Trusts nothing — least of all himself.',
    narration: 'A timid, shy personality… but don’t be fooled by the outward persona. This boy’s backpack holds supplies for every disaster — except the one inside his own head.',
    sceneLabel: 'A page from his life',
    scene: 'The corridor goes quiet. A shove — Mohan hits the lockers, his glasses clatter to the floor. Crunch. Everyone stares. He gently picks up the cracked, crooked frames… and hopelessly puts them back on. His mind will replay this moment a thousand times. It never lets him forget.',
    creature: '🐘', creatureName: 'His mind-creature: Bhaari the elephant',
    creatureLine: 'Bhaari remembers every bad moment and replays them all — and he’s big enough to block every path Mohan is scared to walk. Worry stability: low. Over-analysis: very, very high.',
    stats: [['Memory', 95], ['Kindness', 85], ['Courage', 40]],
    power: '🪑 <strong>The power he will learn: The Witness Seat</strong> — stop hiding under the elephant. Climb on, hold the reins, and watch the memories like a movie instead of drowning in them.',
    whisper: '“The boy who doubts every direction… will one day be the compass for us all.”',
  },
  tej: {
    img: 'images/tej.png',
    accent: '#FF6B57', accentDeep: '#D14A38',
    name: 'Tej', trait: 'The Restless Spark',
    caption: 'Focus stability: low. Fun: unstoppable.',
    narration: 'An overexuberant troublemaker who loves a bit of mischief. Ten ideas a second, and every single one of them is GO.',
    sceneLabel: 'A page from his life',
    scene: '“Your child has been in trouble AGAIN.” The phone call from school. “Son, you need to calm down — you nearly burnt down the science lab!” Tej nods along to the scolding, very seriously… while already planning tomorrow’s even bigger experiment.',
    creature: '🐒', creatureName: 'His mind-creature: Chanchal the monkey',
    creatureLine: 'Chanchal grabs everything and holds on to nothing — mid-leap before Tej has even finished the thought. Bored? BORED. What’s next? What’s THAT?',
    stats: [['Energy', 96], ['Imagination', 82], ['Focus Stability', 30]],
    power: '🌬️ <strong>The power he will learn: The One Breath</strong> — one heartbeat of space between impulse and action. That’s all a monkey ever needs.',
    whisper: '“I once leapt at the sun because I couldn’t wait. This one… reminds me of me.”',
  },
  mansi: {
    img: 'images/mansi.png',
    accent: '#9B5DE5', accentDeep: '#7A3FC4',
    name: 'Mansi', trait: 'The Know-It-All',
    caption: 'Always right. Just ask her.',
    narration: 'A smart, cunning force to be reckoned with. She knows the price of everything — and makes sure everyone else knows she knows.',
    sceneLabel: 'A page from her life',
    scene: 'Strutting across the playground with her brand-new gadget held high, Mansi trips over a boy tying his shoelace — CRACK. “Do you KNOW how much that costs?!” The boy whispers sorry. She isn’t having any of it. The crowd gathers… around the broken gadget, not around her.',
    creature: '🦚', creatureName: 'Her mind-creature: Shaan the peacock',
    creatureLine: 'Shaan fans his dazzling feathers open for every audience — and shrieks when nobody looks. But feathers molt. And crowds move on to shinier things.',
    stats: [['Confidence', 94], ['Style', 90], ['Sharing', 35]],
    power: '🪶 <strong>The power she will learn: The Open Hand</strong> — folding the fan, and letting go. What a peacock drops, Krishna wears in his crown.',
    whisper: '“They gather around her things. One day, they will gather around her.”',
  },
};

const charModal = document.getElementById('charModal');
const charBody = document.getElementById('charBody');
let typeTimer = null;

function typewrite(el, text, speed = 18) {
  clearInterval(typeTimer);
  if (prefersReduced) {
    el.textContent = text;
    el.classList.add('is-done');
    return;
  }
  let i = 0;
  el.textContent = '';
  typeTimer = setInterval(() => {
    el.textContent = text.slice(0, ++i);
    if (i >= text.length) {
      clearInterval(typeTimer);
      el.classList.add('is-done');
    }
  }, speed);
}

function openCharacter(key) {
  const c = CHARACTERS[key];
  if (!c) return;
  charBody.innerHTML = `
    <div class="charmodal__grid" style="--accent:${c.accent}; --accent-deep:${c.accentDeep}">
      <div class="charmodal__photo">
        <img src="${c.img}" alt="${c.name}">
        <p class="charmodal__caption">${c.caption}</p>
      </div>
      <div>
        <p class="charmodal__kicker">📖 Hanuman turns the page…</p>
        <h3 class="charmodal__name">${c.name}</h3>
        <p class="charmodal__trait">${c.trait}</p>
        <p class="charmodal__narration" id="charNarration"></p>
        <div class="charmodal__panel">
          <span class="charmodal__panel-label">${c.sceneLabel}</span>
          ${c.scene}
        </div>
        <div class="charmodal__panel charmodal__creature">
          <span class="charmodal__creature-emoji">${c.creature}</span>
          <span><span class="charmodal__panel-label">${c.creatureName}</span>${c.creatureLine}</span>
        </div>
        <div class="quiz__stats">
          ${c.stats.map(([label, val]) => `
            <div class="quiz__stat">
              <span class="quiz__stat-label">${label}</span>
              <span class="quiz__stat-track"><span class="quiz__stat-fill" data-fill="${val}"></span></span>
            </div>`).join('')}
        </div>
        <p class="quiz__power">${c.power}</p>
        <blockquote class="charmodal__whisper">${c.whisper}<cite>— Hanuman, quietly</cite></blockquote>
      </div>
    </div>`;
  charModal.hidden = false;
  document.body.style.overflow = 'hidden';
  typewrite(document.getElementById('charNarration'), c.narration);
  requestAnimationFrame(() =>
    setTimeout(() =>
      charBody.querySelectorAll('[data-fill]').forEach((el) => {
        el.style.width = `${el.dataset.fill}%`;
      }), 400)
  );
}

function closeCharacter() {
  clearInterval(typeTimer);
  charModal.hidden = true;
  document.body.style.overflow = '';
}

if (charModal) {
  document.querySelectorAll('[data-char]').forEach((card) => {
    card.addEventListener('click', () => openCharacter(card.dataset.char));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openCharacter(card.dataset.char);
      }
    });
  });
  charModal.querySelectorAll('[data-char-close]').forEach((el) =>
    el.addEventListener('click', closeCharacter));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !charModal.hidden) closeCharacter();
  });
}

// ---------- Meet Your Mind-Creature quiz ----------
const QUIZ_QUESTIONS = [
  {
    q: "It's a boring afternoon. What does your mind do?",
    a: [
      { e: '🐒', t: 'Jumps to ten new ideas in ten seconds!', k: 'monkey' },
      { e: '🐘', t: 'Replays that embarrassing thing from last week…', k: 'elephant' },
      { e: '🦚', t: 'Plans how to impress everyone tomorrow.', k: 'peacock' },
    ],
  },
  {
    q: 'Someone in class gets a shiny new gadget…',
    a: [
      { e: '🐒', t: '"Ooh!! What is it? Can I try? What else is new?!"', k: 'monkey' },
      { e: '🐘', t: '"I could never have something like that…"', k: 'elephant' },
      { e: '🦚', t: '"Mine\'s better. Or it will be, very soon."', k: 'peacock' },
    ],
  },
  {
    q: 'Homework time! You sit down and…',
    a: [
      { e: '🐒', t: '…get up six times for snacks, water and "important" things.', k: 'monkey' },
      { e: '🐘', t: '…worry it will go wrong before you even start.', k: 'elephant' },
      { e: '🦚', t: "…imagine everyone's faces when you get top marks.", k: 'peacock' },
    ],
  },
  {
    q: 'Your friend beats you at your favourite game.',
    a: [
      { e: '🐒', t: '"Again! Again! Rematch RIGHT NOW!"', k: 'monkey' },
      { e: '🐘', t: '"I\'m just bad at everything, aren\'t I…"', k: 'elephant' },
      { e: '🦚', t: '"The game was unfair. Obviously."', k: 'peacock' },
    ],
  },
  {
    q: 'At night, just before you sleep, your mind…',
    a: [
      { e: '🐒', t: '…bounces: tomorrow! ideas! wait — did you hear that?!', k: 'monkey' },
      { e: '🐘', t: '…replays the whole day on a loop.', k: 'elephant' },
      { e: '🦚', t: '…rehearses your next big moment, in detail.', k: 'peacock' },
    ],
  },
];

const QUIZ_RESULTS = {
  monkey: {
    emoji: '🐒', name: 'Chanchal the Monkey', title: 'The Restless Spark',
    line: 'Your mind is a bouncy monkey — huge energy, tiny patience, brilliant ideas everywhere. Guess what: Hanuman had one too. Look what a monkey can do!',
    stats: [['Energy', 96], ['Imagination', 82], ['Focus Stability', 30]],
    power: '🌬️ <strong>Your power to learn: The One Breath</strong> — one heartbeat of space before you leap. Try it above!',
  },
  elephant: {
    emoji: '🐘', name: 'Bhaari the Elephant', title: 'The Deep Rememberer',
    line: 'Your mind is a mighty elephant — it never forgets, and sometimes the memories feel heavy. But learn to ride it, and nothing in the world can stop you.',
    stats: [['Memory', 95], ['Kindness', 85], ['Courage', 40]],
    power: '🪑 <strong>Your power to learn: The Witness Seat</strong> — stop hiding under the elephant. Climb on, and watch your thoughts like a movie.',
  },
  peacock: {
    emoji: '🦚', name: 'Shaan the Peacock', title: 'The Dazzling Display',
    line: "Your mind is a proud peacock with truly dazzling feathers. Here's a secret: the bravest, most magical thing it can ever do is fold the fan — and share.",
    stats: [['Confidence', 94], ['Style', 90], ['Sharing', 35]],
    power: '🪶 <strong>Your power to learn: The Open Hand</strong> — what a peacock lets go of, Krishna wears in his crown.',
  },
};

const quizEl = document.getElementById('quiz');
const quizBody = document.getElementById('quizBody');
const quizOpenBtn = document.getElementById('quizOpen');
let quizScores = { monkey: 0, elephant: 0, peacock: 0 };
let quizStep = 0;

function quizProgress() {
  return `<div class="quiz__progress">${QUIZ_QUESTIONS.map((_, i) =>
    `<span class="quiz__dot ${i < quizStep ? 'is-done' : i === quizStep ? 'is-now' : ''}"></span>`
  ).join('')}</div>`;
}

function showQuestion() {
  const { q, a } = QUIZ_QUESTIONS[quizStep];
  quizBody.innerHTML = `
    ${quizProgress()}
    <p class="quiz__question">${q}</p>
    <div class="quiz__answers">
      ${a.map((ans, i) => `
        <button class="quiz__answer" type="button" data-answer="${i}">
          <span class="quiz__answer-emoji">${ans.e}</span><span>${ans.t}</span>
        </button>`).join('')}
    </div>`;
  quizBody.querySelectorAll('[data-answer]').forEach((btn) => {
    btn.addEventListener('click', () => {
      quizScores[a[btn.dataset.answer].k]++;
      quizStep++;
      quizStep < QUIZ_QUESTIONS.length ? showQuestion() : showResult();
    });
  });
}

function showResult() {
  const winner = Object.keys(quizScores).reduce((best, k) =>
    quizScores[k] > quizScores[best] ? k : best);
  const r = QUIZ_RESULTS[winner];
  quizBody.innerHTML = `
    <div class="quiz__result-creature">${r.emoji}</div>
    <p class="quiz__result-name">${r.name}</p>
    <p class="quiz__result-title">${r.title}</p>
    <p class="quiz__result-line">${r.line}</p>
    <div class="quiz__stats">
      ${r.stats.map(([label, val]) => `
        <div class="quiz__stat">
          <span class="quiz__stat-label">${label}</span>
          <span class="quiz__stat-track"><span class="quiz__stat-fill" data-fill="${val}"></span></span>
        </div>`).join('')}
    </div>
    <p class="quiz__power">${r.power}</p>
    <div class="quiz__actions">
      <button class="btn btn--saffron" type="button" id="quizRetry">Try Again 🔄</button>
      <button class="btn btn--white" type="button" data-quiz-close>Done ✨</button>
    </div>
    <p class="quiz__note">Psst — a little of all three creatures lives in every mind. Even Hanuman's.</p>`;
  requestAnimationFrame(() =>
    setTimeout(() =>
      quizBody.querySelectorAll('[data-fill]').forEach((el) => {
        el.style.width = `${el.dataset.fill}%`;
      }), 60)
  );
  document.getElementById('quizRetry').addEventListener('click', startQuiz);
  quizBody.querySelectorAll('[data-quiz-close]').forEach((el) =>
    el.addEventListener('click', closeQuiz));
}

function startQuiz() {
  quizScores = { monkey: 0, elephant: 0, peacock: 0 };
  quizStep = 0;
  showQuestion();
}

function openQuiz() {
  quizEl.hidden = false;
  document.body.style.overflow = 'hidden';
  startQuiz();
}

function closeQuiz() {
  quizEl.hidden = true;
  document.body.style.overflow = '';
}

if (quizOpenBtn && quizEl) {
  quizOpenBtn.addEventListener('click', openQuiz);
  quizEl.querySelectorAll('[data-quiz-close]').forEach((el) =>
    el.addEventListener('click', closeQuiz));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !quizEl.hidden) closeQuiz();
  });
}

// ---------- Email capture placeholder (no backend yet) ----------
const joinForm = document.getElementById('joinForm');
if (joinForm) {
  joinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    joinForm.innerHTML = '<p class="join__thanks">Thank you — the scrapbook will find you! 📖✨</p>';
  });
}
