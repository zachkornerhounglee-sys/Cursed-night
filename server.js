#!/usr/bin/env node
/* ======================================================================
   CURSED NIGHT — co-op relay server
   Zero dependencies. Serves index.html and relays co-op messages between
   players in the same room over plain WebSockets (RFC 6455).

   Run:   node server.js          (PORT=8080 node server.js to change port)
   Open:  http://localhost:3000   then   MULTIPLAYER -> Create Room
   ====================================================================== */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const MAX_PLAYERS = Math.max(2, Math.min(8, parseInt(process.env.MAX_PLAYERS, 10) || 4));
const MAX_ROOMS = 300;
const MAX_FRAME = 32 * 1024;          // largest accepted client message (bytes)
const MODES = ['normal', 'endless', 'rush'];
const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const INDEX = path.join(__dirname, 'index.html');

/* ---------------------------------------------------------------- HTTP */
const server = http.createServer((req, res) => {
  const url = (req.url || '/').split('?')[0];
  if (url === '/' || url === '/index.html') {
    fs.readFile(INDEX, (err, data) => {
      if (err) { res.writeHead(500); res.end('index.html missing next to server.js'); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
      res.end(data);
    });
  } else if (url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, rooms: rooms.size }));
  } else {
    res.writeHead(404); res.end('not found');
  }
});

/* ---------------------------------------------------------------- rooms */
const rooms = new Map();   // code -> Room

function makeCode() {
  for (let tries = 0; tries < 200; tries++) {
    let c = '';
    for (let i = 0; i < 4; i++) c += CODE_CHARS[crypto.randomInt(CODE_CHARS.length)];
    if (!rooms.has(c)) return c;
  }
  return null;
}
function cleanName(n) {
  n = String(n == null ? '' : n).replace(/[\u0000-\u001f\u007f<>]/g, '').trim().slice(0, 16);
  return n || 'Player';
}
function cleanCode(c) {
  c = String(c == null ? '' : c).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  return c.length >= 3 ? c : '';
}
function roster(room) {
  const out = [];
  for (const c of room.clients.values()) out.push({ id: c.id, name: c.name, char: c.char });
  return out;
}
function broadcastRoster(room) {
  const msg = JSON.stringify({ t: 'roster', roster: roster(room), host: room.host, mode: room.mode, started: room.started, max: MAX_PLAYERS });
  for (const c of room.clients.values()) c.sendRaw(msg);
}

/* ------------------------------------------------------------ websocket */
class Client {
  constructor(sock) {
    this.sock = sock;
    this.buf = Buffer.alloc(0);
    this.frag = [];
    this.fragLen = 0;
    this.alive = true;
    this.dead = false;
    this.id = null;
    this.room = null;
    this.name = 'Player';
    this.char = 'gojo';
    this.tokens = 300;
    this.tokenT = Date.now();
    this.lastChat = 0;
    sock.setNoDelay(true);
    sock.on('data', d => this.onData(d));
    sock.on('close', () => this.close());
    sock.on('error', () => this.close());
  }

  /* ---- framing ---- */
  onData(d) {
    this.alive = true;
    this.buf = this.buf.length ? Buffer.concat([this.buf, d]) : d;
    if (this.buf.length > MAX_FRAME * 4) return this.kill();
    for (;;) {
      const b = this.buf;
      if (b.length < 2) return;
      const fin = !!(b[0] & 0x80), op = b[0] & 0x0f, masked = !!(b[1] & 0x80);
      let len = b[1] & 0x7f, off = 2;
      if (len === 126) { if (b.length < 4) return; len = b.readUInt16BE(2); off = 4; }
      else if (len === 127) {
        if (b.length < 10) return;
        if (b.readUInt32BE(2) !== 0) return this.kill();
        len = b.readUInt32BE(6); off = 10;
      }
      if (!masked || len > MAX_FRAME) return this.kill();
      if (b.length < off + 4 + len) return;
      const payload = Buffer.allocUnsafe(len);
      for (let i = 0; i < len; i++) payload[i] = b[off + 4 + i] ^ b[off + (i & 3)];
      this.buf = b.subarray(off + 4 + len);
      this.onFrame(fin, op, payload);
      if (this.dead) return;
    }
  }
  onFrame(fin, op, p) {
    if (op === 0x8) return this.kill();
    if (op === 0x9) return this.sendFrame(0xA, p);
    if (op === 0xA) return;
    if (op === 0x1) { this.frag = [p]; this.fragLen = p.length; }
    else if (op === 0x0) {
      if (!this.frag.length) return;
      this.frag.push(p); this.fragLen += p.length;
      if (this.fragLen > MAX_FRAME) return this.kill();
    } else return;                                  // binary frames are ignored
    if (!fin) return;
    const text = Buffer.concat(this.frag).toString('utf8');
    this.frag = []; this.fragLen = 0;
    this.onText(text);
  }
  sendFrame(op, payload) {
    if (this.dead) return;
    const len = payload.length;
    let h;
    if (len < 126) h = Buffer.from([0x80 | op, len]);
    else if (len < 65536) { h = Buffer.alloc(4); h[0] = 0x80 | op; h[1] = 126; h.writeUInt16BE(len, 2); }
    else { h = Buffer.alloc(10); h[0] = 0x80 | op; h[1] = 127; h.writeUInt32BE(0, 2); h.writeUInt32BE(len, 6); }
    if (this.sock.writableLength > 2 * 1024 * 1024) return this.kill();   // client can't keep up
    this.sock.write(Buffer.concat([h, payload]));
  }
  sendRaw(str) { this.sendFrame(0x1, Buffer.from(str, 'utf8')); }
  send(obj) { this.sendRaw(JSON.stringify(obj)); }
  kill() { try { this.sock.destroy(); } catch (_) {} this.close(); }

  /* ---- messages ---- */
  onText(text) {
    // token bucket: ~200 msgs/s sustained, 400 burst
    const now = Date.now();
    this.tokens = Math.min(400, this.tokens + (now - this.tokenT) * 0.2);
    this.tokenT = now;
    if (this.tokens < 1) return;
    this.tokens -= 1;

    let m;
    try { m = JSON.parse(text); } catch (_) { return; }
    if (!m || typeof m !== 'object') return;

    switch (m.t) {
      case 'ping': return this.send({ t: 'pong', ts: m.ts });
      case 'join': return this.join(m);
      case 'set': return this.setProfile(m);
      case 'mode': return this.setMode(m);
      case 'start': return this.startRun();
      case 'end': return this.endRun();
      case 'chat': return this.chat(m);
      case 'r': return this.relay(m);
    }
  }
  join(m) {
    if (this.room) return;
    const wantCreate = !!m.create;
    let code = cleanCode(m.room);
    let room = code ? rooms.get(code) : null;
    if (!room) {
      if (!wantCreate && !m.rejoin) return this.send({ t: 'err', m: 'Room "' + (code || '?') + '" not found.' });
      if (rooms.size >= MAX_ROOMS) return this.send({ t: 'err', m: 'Server is full, try again later.' });
      if (!code || wantCreate) code = makeCode();
      if (!code) return this.send({ t: 'err', m: 'Could not allocate a room.' });
      room = { code, clients: new Map(), host: null, mode: 'normal', started: false, nextId: 1 };
      rooms.set(code, room);
    }
    if (room.clients.size >= MAX_PLAYERS) return this.send({ t: 'err', m: 'Room is full (' + MAX_PLAYERS + ' players).' });
    this.room = room;
    this.id = String(room.nextId++);
    this.name = cleanName(m.name);
    this.char = typeof m.char === 'string' ? m.char.replace(/[^a-z0-9_]/gi, '').slice(0, 20) || 'gojo' : 'gojo';
    room.clients.set(this.id, this);
    if (!room.host) room.host = this.id;
    this.send({ t: 'joined', id: this.id, room: room.code, host: room.host, roster: roster(room), mode: room.mode, started: room.started, max: MAX_PLAYERS });
    broadcastRoster(room);
    this.announce({ t: 'sys', m: this.name + ' joined' });
    log(`[${room.code}] ${this.name} joined (${room.clients.size}/${MAX_PLAYERS})`);
  }
  setProfile(m) {
    if (!this.room) return;
    if (typeof m.char === 'string') this.char = m.char.replace(/[^a-z0-9_]/gi, '').slice(0, 20) || this.char;
    if (typeof m.name === 'string') this.name = cleanName(m.name);
    broadcastRoster(this.room);
  }
  setMode(m) {
    if (!this.room || this.room.host !== this.id || this.room.started) return;
    if (MODES.includes(m.mode)) { this.room.mode = m.mode; broadcastRoster(this.room); }
  }
  startRun() {
    const r = this.room;
    if (!r || r.host !== this.id || r.started) return;
    r.started = true;
    const msg = JSON.stringify({ t: 'start', mode: r.mode });
    for (const c of r.clients.values()) c.sendRaw(msg);
    broadcastRoster(r);
    log(`[${r.code}] run started (${r.mode}, ${r.clients.size} players)`);
  }
  endRun() {
    const r = this.room;
    if (!r || !r.started) return;
    r.started = false;                 // everyone is back in the lobby when they reload
    broadcastRoster(r);
  }
  chat(m) {
    if (!this.room) return;
    const now = Date.now();
    if (now - this.lastChat < 350) return;
    this.lastChat = now;
    const text = String(m.m == null ? '' : m.m).replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 140);
    if (!text) return;
    const msg = JSON.stringify({ t: 'chat', f: this.id, n: this.name, m: text });
    for (const c of this.room.clients.values()) c.sendRaw(msg);
  }
  relay(m) {
    const r = this.room;
    if (!r || !m.d || typeof m.d !== 'object') return;
    const msg = '{"t":"r","f":"' + this.id + '","d":' + JSON.stringify(m.d) + '}';
    if (m.to != null) {
      const c = r.clients.get(String(m.to));
      if (c && c !== this) c.sendRaw(msg);
      return;
    }
    for (const c of r.clients.values()) if (c !== this) c.sendRaw(msg);
  }
  announce(obj) {
    const msg = JSON.stringify(obj);
    for (const c of this.room.clients.values()) if (c !== this) c.sendRaw(msg);
  }
  close() {
    if (this.dead) return;
    this.dead = true;
    const r = this.room;
    this.room = null;
    if (!r) return;
    r.clients.delete(this.id);
    if (!r.clients.size) { rooms.delete(r.code); log(`[${r.code}] closed`); return; }
    if (r.host === this.id) r.host = r.clients.keys().next().value;
    const msg = JSON.stringify({ t: 'sys', m: this.name + ' left', left: this.id });
    for (const c of r.clients.values()) c.sendRaw(msg);
    broadcastRoster(r);
    log(`[${r.code}] ${this.name} left (${r.clients.size}/${MAX_PLAYERS})`);
  }
}

server.on('upgrade', (req, socket) => {
  const key = req.headers['sec-websocket-key'];
  if (String(req.headers.upgrade || '').toLowerCase() !== 'websocket' || !key) { socket.destroy(); return; }
  const accept = crypto.createHash('sha1').update(key + GUID).digest('base64');
  socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\n\r\n');
  const c = new Client(socket);
  c._hb = true;
});

/* heartbeat: drop connections that went silent */
setInterval(() => {
  for (const room of rooms.values()) {
    for (const c of Array.from(room.clients.values())) {
      if (!c.alive) { c.kill(); continue; }
      c.alive = false;
      c.sendFrame(0x9, Buffer.alloc(0));
    }
  }
}, 20000).unref();

function log(s) { console.log(new Date().toLocaleTimeString() + '  ' + s); }
process.on('uncaughtException', e => console.error('uncaught:', e && e.stack || e));

server.listen(PORT, () => {
  console.log('\n  CURSED NIGHT — co-op server\n');
  console.log('  Local:   http://localhost:' + PORT);
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) for (const n of nets[name]) {
    if (n.family === 'IPv4' && !n.internal) console.log('  Network: http://' + n.address + ':' + PORT + '   (friends on your Wi-Fi/LAN)');
  }
  console.log('\n  Max players per room: ' + MAX_PLAYERS + '   (MAX_PLAYERS=6 node server.js to change)\n');
});
