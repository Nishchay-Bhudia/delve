// ---------- Delve comic reader: minimal panel-by-panel viewer ----------
// Each issue is a script of panels. Panel `img` values reference the three
// character portraits already in /images — Hanuman-era panels lean on emoji,
// matching the site's existing emoji-as-illustration language until real
// artwork is commissioned.

const ISSUES = {
  '01': {
    title: 'Spoilt Brats',
    kicker: 'Issue 01 · Ready to read',
    grownups: 'Tej\'s mischief mirrors young Hanuman\'s — both are corrected not by punishment alone, but by a curse/consequence that becomes the very thing that humbles them later. Ask afterwards: "What\'s the smallest version of this that happened to you this week?"',
    panels: [
      {
        label: 'A boring afternoon',
        art: ['../images/tej.png'],
        caption: 'Tej is bored. Ten ideas a second, and every single one of them is GO. Today\'s idea: "what happens if I mix THIS with THIS?"',
        speech: '"Ooh — what\'s the WORST that could happen?"',
      },
      {
        label: 'The science lab',
        art: ['../images/tej.png'],
        caption: 'Smoke. An alarm. A very singed eyebrow. Tej nearly burns down the science lab — again.',
        speech: '🔥💨🚨',
      },
      {
        label: 'The phone call home',
        art: ['../images/tej.png'],
        caption: '"Your child has been in trouble AGAIN." Tej nods along to the scolding, very seriously — while already planning tomorrow\'s even bigger experiment.',
        speech: '"I hear you, I hear you… anyway, about tomorrow—"',
      },
      {
        label: 'Hanuman turns the page…',
        art: [],
        caption: 'The scrapbook glows. A much, much older story rises off the page.',
        speech: '📖✨🐒',
      },
      {
        label: 'From the Scrapbook',
        art: [],
        caption: 'Little Hanuman sees the rising sun and — thinking it\'s a gigantic, glowing fruit — leaps to swallow it whole.',
        speech: '"MUST. EAT. FRUIT."',
      },
      {
        label: 'The consequence',
        art: [],
        caption: 'The leap earns him a curse: he forgets his own powers, until the day he needs them most and someone reminds him who he is.',
        speech: '👑💫🙈',
      },
      {
        label: 'The truth',
        art: ['../images/tej.png'],
        caption: 'Mischief is part of being a kid — every kid, even the mightiest. But every action still has a consequence, and the bigger the leap, the bigger the lesson.',
        speech: null,
      },
    ],
  },
};

const params = new URLSearchParams(location.search);
const ep = params.get('ep') || '01';
const issue = ISSUES[ep];

const viewer = document.getElementById('viewer');
const issueTitle = document.getElementById('issueTitle');
const issueKicker = document.getElementById('issueKicker');
const grownupsNote = document.getElementById('grownupsNote');

if (!issue) {
  issueKicker.textContent = `Issue ${ep}`;
  issueTitle.textContent = 'This page of the scrapbook is still being drawn';
  viewer.innerHTML = `<div class="comic-panel is-active"><p class="comic-panel__caption">
    Illustrations for this issue are in progress. Issue 01 — "Spoilt Brats" — is ready to read now.</p>
    <a class="btn btn--saffron mt" href="./">← Back to Comics</a></div>`;
  grownupsNote.remove();
} else {
  issueKicker.textContent = issue.kicker;
  issueTitle.textContent = issue.title;
  grownupsNote.innerHTML = `<span class="grownups__label">🌿 For the grown-ups</span><p>${issue.grownups}</p>`;

  let step = 0;

  function render() {
    const p = issue.panels[step];
    viewer.innerHTML = `
      <div class="comic-panel is-active">
        <span class="comic-panel__label">${p.label}</span>
        ${p.art.length ? `<div class="comic-panel__art">${p.art.map((src) => `<img src="${src}" alt="">`).join('')}</div>` : ''}
        <p class="comic-panel__caption">${p.caption}</p>
        ${p.speech ? `<p class="comic-panel__speech">${p.speech}</p>` : ''}
      </div>
      <div class="comic-nav">
        <button type="button" id="prevBtn" ${step === 0 ? 'disabled' : ''}>← Prev</button>
        <div class="comic-nav__dots">
          ${issue.panels.map((_, i) => `<span class="comic-nav__dot ${i === step ? 'is-current' : ''}"></span>`).join('')}
        </div>
        <button type="button" id="nextBtn">${step === issue.panels.length - 1 ? 'Finish ✨' : 'Next →'}</button>
      </div>`;

    document.getElementById('prevBtn').addEventListener('click', () => { step--; render(); });
    document.getElementById('nextBtn').addEventListener('click', () => {
      if (step === issue.panels.length - 1) {
        location.href = '../discuss/';
      } else {
        step++;
        render();
      }
    });
  }

  render();

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') document.getElementById('nextBtn')?.click();
    if (e.key === 'ArrowLeft') document.getElementById('prevBtn')?.click();
  });
}
