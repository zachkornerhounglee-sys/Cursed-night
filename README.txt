CURSED NIGHT v16 — CO-OP FIX
============================
Multiplayer was crashing on load (missing send/relay functions). Fixed in v16 — see PATCH_NOTES_v16.txt.

UPDATE YOUR GITHUB PAGES SITE
1. Extract this ZIP. Open the CursedNight_v16 folder.
2. In your repo click Add file > Upload files and drag in index.html and game.html
   (plus README.txt / PATCH_NOTES_v16.txt if you like). Do NOT drag the outer folder.
3. Commit to main, wait ~1 minute, then hard-refresh (Ctrl+Shift+R) or use a private window.

PLAY WITH FRIENDS
1. Host: open your GitHub Pages link > CO-OP MULTIPLAYER > Create room > Copy invite link.
2. Friends open that link; they connect automatically. Host presses Start run.
3. The host's tab must stay open (and visible) while playing.

IF A FRIEND CAN'T CONNECT: some networks (school, work, some mobile data) block direct browser-to-browser
traffic. Try another network/hotspot, or add your own free TURN server (see PATCH_NOTES_v16.txt).

CURSED NIGHT — SHARE-LINK CO-OP BUILD v13
========================================

WHAT CHANGED IN v13
-------------------
- Fixed indefinite multiplayer startup waits with a 15-second signalling timeout and an 18-second host-connection timeout.
- Added clearer errors for offline hosts, blocked networks, unsupported browsers, and unavailable signalling.
- Added a fallback CDN for loading PeerJS and explicit secure PeerJS Cloud settings.
- Added public STUN/TURN ICE entries to improve connections across home/mobile networks.
- Added mobile viewport sizing and a full-viewport game canvas so aim/input coordinates scale with the visible canvas.
- Disabled costly film grain/chroma/scanline effects on lower-powered devices and when FPS is low; reduced transient-object caps under heavy load.

PUBLISH ON GITHUB PAGES
-----------------------
1. Upload/replace index.html in the ROOT of your GitHub repository.
2. Upload/replace game.html too if you use that file separately.
3. Commit the changes and wait for GitHub Pages to redeploy.
4. Hard refresh the site (Ctrl+Shift+R on desktop) before testing.

HOW TO PLAY WITH FRIENDS
------------------------
1. The host opens the published GitHub Pages site.
2. Click CO-OP MULTIPLAYER and then Create room. Wait until the room code and roster appear.
3. Click the room code and copy/send the invite link.
4. Friends open the link in a current browser. Keep the host tab open and preferably visible.
5. Host starts the run after everyone joins.

IMPORTANT LIMITATIONS
--------------------
- Peer-to-peer rooms are hosted by the creator's browser; the host must keep the game tab open.
- PeerJS Cloud is a third-party signalling service and may be blocked by some networks. Direct WebRTC links can still fail on restricted networks even with STUN/TURN fallback.
- This is not a dedicated server; rooms are temporary, support up to four players, and stop when the host leaves/closes the page.
- The app cannot guarantee perfectly smooth performance on every device. It now scales the viewport and reduces expensive effects when a device reports low resources or frame rate.
- server.js, package.json and render.yaml are retained from the prior standalone-server build but are not required by share-link mode.


V14 CO-OP INVITE NOTES
1. Host opens the GitHub Pages game and chooses CO-OP MULTIPLAYER.
2. Host creates a private room, then uses Copy invite link (or Share invite).
3. Friend opens the link. The co-op lobby attempts to join automatically; no room code is entered.
4. Keep the host tab open while the room is in use.
5. This mode uses PeerJS signalling plus browser-to-browser WebRTC; it does not require Render, but a restrictive network may prevent the direct connection.
6. If an invite fails, ask the host to create a fresh room and resend the new invite link.


V15 INVITE-LINK FIX
- Host: open the game, choose CO-OP MULTIPLAYER, and click Create private room.
- After the lobby opens, choose Copy invite link or Share invite. No room code is shown or needed.
- Friend: open the link in a current browser. It auto-connects; if connection fails, a Retry connection button appears.
- Keep the host game tab open. Direct WebRTC can still be blocked by restrictive Wi-Fi/network settings.
- If GitHub Pages is your host, upload the new index.html to the repository root (and game.html if you use it), then commit changes.
