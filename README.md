# CURSED NIGHT v11 — Co-op

Your v10 game plus 2–4 player online co-op. Still one self-contained `index.html`
(no external deps except Google Fonts); the only extra piece is a tiny relay server.

## Play
**Easiest:** extract the zip and double-click **`game`** — `game.bat` (Windows), `game.command` (Mac;
if blocked, right-click → Open) or `game.sh` (Linux). It starts the co-op server and opens the game in
your browser. Keep the black window open while you play. Without Node.js it opens solo mode instead
(you can also just double-click `index.html` for solo any time).

1. Co-op needs Node.js (v16+) from https://nodejs.org (one-time install).
2. In the game, click  **CO-OP MULTIPLAYER**  →  **Create room**.
3. Friends on your Wi-Fi/LAN open the `Network:` address the server prints, click
   **CO-OP MULTIPLAYER**, type your 4-letter code, **Join room**.
   (Click the big room code to copy an invite link.)
4. Everyone picks a sorcerer; the host picks the mode and presses **Start run**.
   Players can also drop in mid-run with **Join run in progress**.

Solo play is unchanged — use PLAY as before.

## Playing over the internet
Run the same `server.js` anywhere with a public address (Render, Railway, Fly.io, a VPS…:
start command `node server.js`, it honours the `PORT` env var). Use the https URL it gives
you; the game automatically connects with `wss://`. Or keep the server at home and
port-forward 3000. Options: `MAX_PLAYERS=6 node server.js` (2–8, default 4).

## Through GitHub
GitHub Pages only hosts static files, so the **game** lives on Pages and a tiny **relay** runs elsewhere.

1. Create a repo, upload this folder's contents (keep `.github/`), push to `main`.
   Repo **Settings → Pages → Source: GitHub Actions**. Your game is then at
   `https://<you>.github.io/<repo>/` after the workflow finishes.
2. Start a relay (pick one):
   - **Render (free, easiest):** New → Blueprint → pick your repo (uses `render.yaml`).
     You get `https://cursed-night-relay.onrender.com` → relay address `wss://cursed-night-relay.onrender.com`.
     The free tier sleeps when idle, so the first connection can take ~30s.
   - **GitHub Codespaces:** open the repo in a Codespace (the server starts itself), then in the
     **Ports** tab set port 3000 visibility to **Public**; relay address is that forwarded URL with `wss://`.
   - Any other Node host, or your own PC (`node server.js`).
3. Share one link: open the Pages URL with the relay in it —
   `https://<you>.github.io/<repo>/?server=wss://cursed-night-relay.onrender.com`
   Create a room, then click the room code: it copies an invite link that already includes the
   server and room, so friends just click it, enter a name and join.
   (To avoid the `?server=` part, set `CNMP_SERVER_DEFAULT` near the top of the co-op code in `index.html`.)

Note: an https page can only reach `wss://` relays (or `ws://localhost`), not plain `ws://` LAN addresses.

## What co-op adds
- **Ally ghosts** – teammates appear in your arena with name, HP bar, aim line, and live
  status rings (domain, Sukuna, berserk, shield, chant). Their casts pop up as text.
- **Shared firepower** – your allies' shots appear in your world at 60% damage and hurt
  *your* enemies; every kill still pays XP to you.
- **Down & revive** – at 0 HP you are downed instead of dead. An ally standing within the
  green ring for 3s revives you at 50% HP. Bleed out after 40s and you spectate until the
  next stage clears (everyone is revived at 35%). All players down = game over.
- Enemy HP scales +28% per extra player. Team HUD (stage / level / kills), Enter = chat,
  per-player kill tally on the game-over screen. After a wipe or R you auto-return to the
  same room lobby.

## How it works (and its limits)
Each player runs their own full simulation (enemies, bosses, upgrades, level-ups); the
server just relays player state and shot events. Players therefore see *the same allies* but
not literally the same enemy instances, and one player's upgrade menu doesn't pause the
others. A fully shared authoritative enemy world would need the 6,000+ line enemy/boss code
reworked to target multiple players — this version keeps every v10 feature working as-is.

`server.js` limits: 32 KB per message, rate-limited per connection, 300 rooms, names sanitised.
It has no accounts or encryption of its own — put it behind HTTPS (most hosts do) for public use.
