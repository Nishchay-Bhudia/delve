# Delve (testing fork)

This is Nishchay's working fork of [bhujmandir/delve](https://github.com/bhujmandir/delve) — the
landing page + platform skeleton for Delve. New features get built and tried out here first; once
something's solid it can be opened as a PR back to the upstream repo.

Live test site: **https://nishchay-bhudia.github.io/delve/**

## Layout

```
index.html, style.css, script.js, images/   the original landing page (unchanged)
assets/                                     shared chrome for every sub-page (pages.css, common.js)
podcast/  comics/  quiz/  dhun/  practice/  discuss/  parent/
                                             each section is a plain static folder (index.html + assets)
games/hanuman-quest/                        "Hanuman's Leap" — a Phaser 3 platformer (plain JS)
.github/workflows/pages.yml                 assembles the site and deploys it to GitHub Pages
```

Everything is plain static HTML/CSS/JS — no build step, no framework, same as upstream. The game
is JavaScript too (Phaser 3, vendored as `games/hanuman-quest/phaser.min.js` — no CDN dependency,
no npm install needed), so `git clone` + a static file server is all you need for the whole site.

## Running it locally

```
python3 -m http.server 8000
```

Then open `localhost:8000`. Every section, including the embedded game on `/games/`, works
straight off disk — no build, no base-href gotchas, no separate dev server for the game.

## Hanuman's Leap — design note

The gada (Hanuman's mace) is real combat: it smashes rocks and generic shadow-imp enemies blocking
the path. It does **nothing** to Chanchal, Bhaari or Shaan — the three named mind-creatures from
the story — on purpose. Those only settle if you stand close, stay still, and hold the watch key,
mirroring the story's own "fight it, it grows wilder" rule. If you're changing this mechanic, that
split (generic enemies vs. the three named creatures) is the thing to preserve or deliberately drop
— see `games/hanuman-quest/game.js`.

## Deploying

Push to `main` — `.github/workflows/pages.yml` assembles the static site and deploys it to GitHub
Pages automatically. Nothing needs compiling first.
