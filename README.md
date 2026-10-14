# Dumpster Diver — One More Bin

A three-minute scavenging game around Brimble Lane. Search bins, stack strange treasures on your back, fend off the locals, and reach the van before collection.

This repository contains the latest playable **Playtest 06 / v6.3** browser alpha. It runs entirely in the player's browser: no account, API key, GPU generation service, database, or multiplayer server is needed. The personal best is saved in that browser.

## Deploy to Vercel

1. Push this repository to GitHub. A **private repository** is fine; the deployed game can still be shared.
2. In [Vercel's new project page](https://vercel.com/new), import the repository.
3. Leave **Root Directory** at the repository root (`./`). The included `vercel.json` supplies the settings below.
4. Select **Deploy**, then share the resulting HTTPS address. Test it in a signed-out browser; if Vercel asks viewers to sign in, review that project's Deployment Protection settings for the production URL.

| Setting | Value |
| --- | --- |
| Framework preset | Other |
| Build command | `npm run build` |
| Output directory | `public` |
| Install command | Empty (no packages to install) |
| Environment variables | None |
| Node.js | 22.x |

The build runs the gameplay tests and checks the bundled files. There is no compilation step. Only `public/` is served; the GPU pipeline, model-generation cache, private tokens, development notes, and tests are not part of the website.

Vercel's [build configuration documentation](https://vercel.com/docs/builds/configure-a-build) explains these settings. Importing a Git repository allows later pushes to trigger new deployments. Hosting usage is governed by your own Vercel plan.

## Play locally

Install Node.js 22, open a terminal in this folder, then run:

```sh
npm start
```

Open **http://127.0.0.1:8772/**. No `npm install` is necessary. For a different port, run `npm start -- --port 8780`. Use a local server rather than double-clicking the HTML file.

Desktop keyboard and mouse with WebGL 2 are recommended. Mobile controls are not complete. Sound starts after pressing the play button.

| Control | Action |
| --- | --- |
| WASD / arrow keys | Move |
| Click | Walk; approach a bin or the van |
| E | Search, collect, or extract |
| Space | Swing / three-hit combo |
| Shift | Dodge, then hurry |
| F | Hop |
| Q | Drop selected find |
| C | Craft with a sock and batteries |
| Tab / I | Inspect your kit |
| M | Overview |
| Escape | Cancel an action or pause |

Searches are live: threats and the clock keep moving while you rummage. Inventory inspection pauses this solo alpha. A fresh raid fixes its loot in advance; the decorative reel cannot reroll it. Append `?seed=7` for a repeatable test raid.

## Working on the game

```text
public/                 Website, gameplay, art, models, and vendor code
  game-core.js          Simulation, encounters, loot, inventory, combat
  game.js               Input, HUD, and game loop
  world.js              Three.js scene and camera
  architecture.js       Shopfronts and windows
  models.js             Model loading, animation, and brush materials
  audio.js              Synthesized jazz and sound effects
  loadout.*             Kit inspection UI
  rummage.js            Search and loot reveal
  art-lab.html          Separate painted / stacked-paper experiment
  model-credits.html    Attribution page linked from the game
tests/                  Gameplay and audio tests
scripts/                Local preview server and release checks
docs/                   Play guide and validation notes
vercel.json             Static deployment settings
```

Edit this repository for future shareable builds. It is a snapshot of the previous alpha folder; the two folders do not automatically synchronize.

```sh
npm test
npm run build
```

This remains a solo playtest. It has no persistent stash, economy, wallet, accounts, networking, or anti-cheat. Browser saves do not sync between devices or deployment domains. The separate goose-generation workshop is not included.

## Credits and licensing

Keep `public/model-credits.html`, the asset licenses, and the Three.js MIT notice with redistributed builds. Models use CC0 or CC BY 3.0 as documented beside each asset. Project-specific code and artwork have not been assigned an open-source license; `UNLICENSED` in package metadata does not replace any third-party license. See [NOTICE.txt](NOTICE.txt).

See [the play guide](docs/PLAY-ME.txt) for mechanics and [the original alpha validation](docs/alpha-validation.txt) for its tested scope and limitations.
