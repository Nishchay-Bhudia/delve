// ---------- Shared across every sub-page: reveal-on-scroll + nav shadow ----------
// (same behaviour as script.js on the homepage, factored out so every new
// section feels like the same site)

const reveals = document.querySelectorAll('.reveal');
const groups = new Map();

reveals.forEach((el) => {
  const section = el.closest('section, header, main') || document.body;
  const count = groups.get(section) || 0;
  el.style.setProperty('--stagger', `${Math.min(count * 0.12, 0.6)}s`);
  groups.set(section, count + 1);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.12 }
);
reveals.forEach((el) => revealObserver.observe(el));

const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener(
    'scroll',
    () => nav.classList.toggle('is-scrolled', window.scrollY > 40),
    { passive: true }
  );
}

// ---------- Tiny local-storage helper, used by Practice streaks & Discuss ----------
const DelveStore = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(`delve:${key}`);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(`delve:${key}`, JSON.stringify(value));
    } catch {
      /* storage unavailable — practice still works, just doesn't persist */
    }
  },
};
