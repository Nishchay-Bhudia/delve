// ---------- Standalone quiz page — same questions/results as the homepage's
// modal quiz (script.js), rendered inline instead of in a popup. ----------

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
    power: '🌬️ <strong>Your power to learn: The One Breath</strong> — one heartbeat of space before you leap.',
    practiceLink: '../practice/',
  },
  elephant: {
    emoji: '🐘', name: 'Bhaari the Elephant', title: 'The Deep Rememberer',
    line: 'Your mind is a mighty elephant — it never forgets, and sometimes the memories feel heavy. But learn to ride it, and nothing in the world can stop you.',
    stats: [['Memory', 95], ['Kindness', 85], ['Courage', 40]],
    power: '🪑 <strong>Your power to learn: The Witness Seat</strong> — stop hiding under the elephant. Climb on, and watch your thoughts like a movie.',
    practiceLink: '../practice/',
  },
  peacock: {
    emoji: '🦚', name: 'Shaan the Peacock', title: 'The Dazzling Display',
    line: "Your mind is a proud peacock with truly dazzling feathers. Here's a secret: the bravest, most magical thing it can ever do is fold the fan — and share.",
    stats: [['Confidence', 94], ['Style', 90], ['Sharing', 35]],
    power: '🪶 <strong>Your power to learn: The Open Hand</strong> — what a peacock lets go of, Krishna wears in his crown.',
    practiceLink: '../practice/',
  },
};

const quizBody = document.getElementById('quizBody');
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
  DelveStore.set('last-creature', winner);
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
      <a class="btn btn--white" href="${r.practiceLink}">Go Practice ✨</a>
    </div>
    <p class="quiz__note">Psst — a little of all three creatures lives in every mind. Even Hanuman's.</p>`;
  requestAnimationFrame(() =>
    setTimeout(() =>
      quizBody.querySelectorAll('[data-fill]').forEach((el) => {
        el.style.width = `${el.dataset.fill}%`;
      }), 60)
  );
  document.getElementById('quizRetry').addEventListener('click', startQuiz);
}

function startQuiz() {
  quizScores = { monkey: 0, elephant: 0, peacock: 0 };
  quizStep = 0;
  showQuestion();
}

startQuiz();
