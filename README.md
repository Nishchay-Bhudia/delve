# Delve (testing fork)

This is Nishchay's working fork of [bhujmandir/delve](https://github.com/bhujmandir/delve) — the
landing page + platform skeleton for Delve. New features get built and tried out here first; once
something's solid it can be opened as a PR back to the upstream repo.

Live test site: **https://nishchay-bhudia.github.io/delve/**

## Layout

```
index.html, style.css, script.js, images/   the original landing page (unchanged)
assets/                                     shared chrome for every sub-page (pages.css, common.js)
podcast/  comics/  games/  quiz/  dhun/  practice/  discuss/  parent/
                                             each section is a plain static folder (index.html + assets)
src/HanumanQuest/                           "Hanuman's Leap" — the C# game, a .NET 8 Blazor WebAssembly app
.github/workflows/pages.yml                 builds the game and deploys everything to GitHub Pages
```

No build step for the site itself — it's plain HTML/CSS/JS, same as upstream. The only thing that
needs compiling is the game.

## Running it locally

**The static site** — just serve the repo root with any static file server and open it:

```
python3 -m http.server 8000
```

**The game on its own** (fastest way to iterate on it):

```
cd src/HanumanQuest
dotnet watch
```

**The game embedded in the site, exactly as it deploys** — the game's `<base href>` is hardcoded to
`/delve/games/hanuman-quest/` to match where GitHub Pages serves this fork. That means the embedded
version (via the iframe on `/games/`) only resolves correctly when served from that exact path — it
won't load right from a bare `localhost:8000/games/hanuman-quest/`. To check the full embedded flow
locally, mirror what CI does:

```
dotnet publish src/HanumanQuest -c Release -o /tmp/pub
mkdir -p games/hanuman-quest
cp -r /tmp/pub/wwwroot/. games/hanuman-quest/
python3 -m http.server 8000   # then visit /games/
rm -rf games/hanuman-quest    # clean up — this folder is CI-generated, not committed
```

If this fork is ever renamed, update the `<base href>` in `src/HanumanQuest/wwwroot/index.html`
to match.

## Deploying

Push to `main` — `.github/workflows/pages.yml` publishes the game, assembles the static site, and
deploys both to GitHub Pages automatically.
