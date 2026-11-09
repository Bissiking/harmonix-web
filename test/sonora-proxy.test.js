import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createServer } from 'vite';

test('Vite relaie directement auth, écritures et Range vers Sonora, sans serveur Harmonix', async (t) => {
  const received = [];
  let upgradeHeaders;
  const upstream = http.createServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    received.push({ path: req.url, cookie: req.headers.cookie, origin: req.headers.origin, body: Buffer.concat(chunks).toString() });
    if (req.url === '/auth/config') return res.end('{"provider":"kyros","hasClientId":true}');
    if (req.url === '/auth/login') {
      res.writeHead(302, { location: '/auth/callback', 'set-cookie': 'sonora.oauth.state=test; HttpOnly; Path=/auth; SameSite=Lax' });
      return res.end();
    }
    if (req.url === '/api/harmonix/apps/v2/stream/track') {
      assert.equal(req.headers.range, 'bytes=2-5');
      res.writeHead(206, { 'Content-Range': 'bytes 2-5/8', 'Content-Type': 'audio/wav' });
      return res.end('2345');
    }
    res.setHeader('Content-Type', 'application/json');
    res.end('{"ok":true}');
  });
  upstream.on('upgrade', (req, socket) => {
    upgradeHeaders = req.headers;
    socket.end('HTTP/1.1 401 Unauthorized\r\nConnection: close\r\nContent-Length: 0\r\n\r\n');
  });
  await new Promise((resolve) => upstream.listen(0, '127.0.0.1', resolve));
  const previous = process.env.SONORA_URL;
  process.env.SONORA_URL = `http://127.0.0.1:${upstream.address().port}`;
  let vite;
  t.after(async () => {
    if (previous === undefined) delete process.env.SONORA_URL; else process.env.SONORA_URL = previous;
    await vite?.close();
    await new Promise((resolve) => upstream.close(resolve));
  });
  vite = await createServer({ server: { host: '127.0.0.1', port: 0, strictPort: false }, logLevel: 'silent' });
  await vite.listen();
  const base = `http://127.0.0.1:${vite.httpServer.address().port}`;
  const config = await fetch(`${base}/auth/config`);
  assert.equal((await config.json()).hasClientId, true);
  const login = await fetch(`${base}/auth/login`, { redirect: 'manual' });
  assert.equal(login.status, 302);
  assert.match(login.headers.get('set-cookie'), /^sonora.oauth.state=/);
  await login.text();
  const body = JSON.stringify({ name: 'Ma playlist' });
  const mutation = await fetch(`${base}/api/harmonix/apps/v2/playlists`, { method: 'POST', headers: { cookie: 'sonora.sid=opaque', origin: base, 'content-type': 'application/json' }, body });
  await mutation.text();
  assert.deepEqual(received.at(-1), { path: '/api/harmonix/apps/v2/playlists', cookie: 'sonora.sid=opaque', origin: base, body });
  const stream = await fetch(`${base}/api/harmonix/apps/v2/stream/track`, { headers: { range: 'bytes=2-5' } });
  assert.equal(stream.status, 206);
  assert.equal(stream.headers.get('content-range'), 'bytes 2-5/8');
  assert.equal(await stream.text(), '2345');
  const status = await new Promise((resolve, reject) => {
    const req = http.request(`${base}/api/rifts/test/ws`, { headers: {
      connection: 'Upgrade', upgrade: 'websocket', 'sec-websocket-version': '13',
      'sec-websocket-key': 'dGhlIHNhbXBsZSBub25jZQ==', cookie: 'sonora.sid=opaque', origin: base,
    } }, (res) => { res.resume(); resolve(res.statusCode); });
    req.on('error', reject); req.end();
  });
  assert.equal(status, 401);
  assert.equal(upgradeHeaders.cookie, 'sonora.sid=opaque');
  assert.equal(upgradeHeaders.origin, base);
});
