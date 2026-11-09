import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchSession, login, logout, useSession } from '../web/src/stores/session.js';

test('le frontend utilise la session et la déconnexion POST de Sonora', async (t) => {
  const previousFetch = globalThis.fetch, previousWindow = globalThis.window;
  const requests = [];
  globalThis.window = { location: { origin: 'http://localhost:5174', href: '' }, dispatchEvent() {} };
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    return new Response(JSON.stringify(url === '/auth/me' ? { id: 'sonora-user', username: 'Validation', permissions: ['tracks:read'] } : { success: true }), { status: 200 });
  };
  t.after(() => { globalThis.fetch = previousFetch; globalThis.window = previousWindow; });
  await fetchSession();
  assert.equal(useSession().state.user.id, 'sonora-user');
  assert.equal(requests[0].options.credentials, 'same-origin');
  login();
  assert.equal(new URL(window.location.href, window.location.origin).searchParams.get('return_to'), 'http://localhost:5174');
  await logout();
  assert.equal(requests.at(-1).url, '/auth/logout');
  assert.equal(requests.at(-1).options.method, 'POST');
  assert.equal(window.location.href, '/connexion');
});
