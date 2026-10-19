CURSED NIGHT — SHARE-LINK CO-OP BUILD
====================================

WHAT CHANGED
------------
The co-op now uses PeerJS Cloud signalling plus WebRTC data connections. You do not need to deploy server.js, use Render, or install anything on your computer. The room creator's browser acts as a small relay for the existing co-op protocol.

PUT IT ON GITHUB PAGES
----------------------
1. Upload/replace index.html in the root of your existing GitHub repository.
2. Replace game.html too if you use that copy anywhere (GitHub Pages uses index.html by default).
3. Commit the changes. Keep GitHub Pages enabled on the main branch and /(root).
4. Open your published GitHub Pages URL.

HOW TO PLAY WITH FRIENDS
------------------------
1. The host opens the published game and clicks CO-OP MULTIPLAYER.
2. Enter a name and click Create room.
3. After the room appears, click the green room code. The game copies a full invite URL.
4. Send that URL to friends. When they open it, the game opens the co-op lobby and connects them to the active host room.
5. Choose characters/mode and have the host click Start run.

IMPORTANT LIMITATIONS
--------------------
- The host must keep the game tab open for the room to exist. If the host closes, refreshes, or leaves the page, friends will disconnect; create a new room and send a fresh link.
- PeerJS Cloud is a third-party free signalling service. Availability can vary, and some restrictive networks may prevent a direct WebRTC connection.
- The room is temporary and has a maximum of four players in this build.
- server.js, package.json and render.yaml are retained from the old relay build but are no longer required for the PeerJS invite-link mode.

FILES
-----
index.html       Main GitHub Pages game
 game.html       Matching copy of the game
 server.js       Legacy standalone relay (not needed for invite-link mode)
 package.json    Legacy server package metadata (not needed for invite-link mode)
 render.yaml     Legacy Render configuration (not needed for invite-link mode)
PATCH_NOTES_v12.txt  Details of the change
