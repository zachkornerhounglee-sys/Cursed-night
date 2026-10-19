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
