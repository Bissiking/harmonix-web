import test from 'node:test';
import assert from 'node:assert/strict';
import { loginAvailability } from '../web/src/api/auth.js';

test('le contrat historique Sonora n’est pas assimilé à une panne Kyros', () => {
  assert.equal(loginAvailability({ provider: 'kyros', issuer: 'kyros', audience: 'kyros-modules', validation_mode: 'jwks' }), 'available');
});
test('une configuration explicitement absente reste refusée, même avec un issuer', () => {
  assert.equal(loginAvailability({ provider: 'kyros', hasClientId: false, issuer: 'kyros' }), 'unconfigured');
  assert.equal(loginAvailability({ provider: 'kyros', hasClientId: true }), 'available');
});
test('une réponse inconnue ne devient pas une connexion disponible', () => {
  for (const value of [null, {}, [], { provider: 'other', issuer: 'kyros' }, { provider: 'kyros' }]) {
    assert.equal(loginAvailability(value), 'incompatible');
  }
});
