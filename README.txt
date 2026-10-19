CURSED NIGHT — v11

PROJECT LAYOUT
- index.html: main game entry point for browsers and static hosting.
- game.html: matching standalone game file, included for a layout similar to Zach's Ultimate Buffet.
- server.js: optional zero-dependency Node.js co-op relay server.
- package.json: Node.js project metadata and start script.
- render.yaml: Render deployment configuration.
- README.txt: this guide.
- PATCH_NOTES_v11.txt: package/layout notes.

PLAY LOCALLY
1. Extract the ZIP.
2. Open index.html in a modern browser for the game.
3. For online co-op, use the relay server setup below; simply opening the HTML file does not host the relay.

RUN THE CO-OP RELAY SERVER
1. Install Node.js 16 or newer.
2. Open a terminal in this folder.
3. Run: npm start
4. Open http://localhost:3000
The server serves index.html and relays co-op room messages. The host must make the server reachable to other players for internet multiplayer.

DEPLOYMENT
The included render.yaml is configured for Render. Import the extracted project folder/repository into Render and deploy it as a Node web service. Keep index.html, server.js, package.json, and render.yaml together in the same project root.

GITHUB / STATIC HOSTING NOTE
Static hosting can serve the game files, but it cannot run server.js. For online co-op, deploy the relay server separately and ensure the game is configured to connect to that relay. Keep the server files in the repository if you use Render.
