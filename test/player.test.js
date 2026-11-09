import { test } from "node:test";
import assert from "node:assert/strict";
import { PlayerController } from "../web/src/core/PlayerController.js";
import { eventBus } from "../web/src/core/EventBus.js";
import { AudioEngine } from "../web/src/core/AudioEngine.js";
import { parseLyrics, activeLyricIndex } from "../web/src/core/lyrics.js";
import { normalizeTrack, unwrap } from "../web/src/api/library.js";

const tracks = [{ id: 'a', title: 'A' }, { id: 'b', title: 'B' }, { id: 'c', title: 'C' }];
function player() {
  const engine = { currentTime: 0, src: null, load(src) { this.src = src; }, async play() {}, async unlock() {}, seek(time) { this.currentTime = time; } };
  return { engine, controller: new PlayerController({ engine, getSrc: (track) => track.id }) };
}
test('sélectionner le deuxième titre met à jour la piste diffusée et la file', async () => {
  const { engine, controller } = player();
  controller.setPlaylist(tracks);
  const events = [];
  const off = eventBus.on('queue:updated', (queue) => events.push(queue.current.id));
  await controller.loadByPlaylistIndex(1, { autoPlay: true });
  off();
  assert.equal(engine.src, 'b');
  assert.equal(controller.currentId, 'b');
  assert.deepEqual(events, ['b']);
  assert.equal(controller.peekNext()[0].id, 'c');
});
test('Suivant passe au titre suivant même avec répétition du morceau', async () => {
  const { controller } = player();
  controller.setPlaylist(tracks);
  controller.setRepeat('one');
  await controller.next();
  assert.equal(controller.currentId, 'b');
});
test('la fin naturelle répète le morceau, puis la file manuelle reprend la liste', async () => {
  const { controller, engine } = player();
  controller.setPlaylist(tracks);
  controller.setRepeat('one');
  engine.currentTime = 20;
  await controller.handleEnded();
  assert.equal(controller.currentId, 'a');
  assert.equal(engine.currentTime, 0);
  controller.setRepeat('none');
  controller.addToQueue({ id: 'manual' });
  await controller.next();
  assert.equal(controller.currentId, 'manual');
  await controller.next();
  assert.equal(controller.currentId, 'b');
});
test('la lecture s’arrête en fin de liste, ou revient au début avec repeat all', async () => {
  const { controller } = player();
  controller.setPlaylist(tracks);
  await controller.loadByPlaylistIndex(2);
  assert.equal(await controller.handleEnded(), null);
  controller.setRepeat('all');
  await controller.handleEnded();
  assert.equal(controller.currentId, 'a');
});
test('jouer un ajout manuel retire les ajouts précédents sans perdre la liste principale', async () => {
  const { controller } = player();
  controller.setPlaylist(tracks);
  controller.addToQueue({ id: 'manual-1' });
  controller.addToQueue({ id: 'manual-2' });
  await controller.playQueued(1);
  assert.equal(controller.currentId, 'manual-2');
  assert.equal(controller.customNext.length, 0);
  await controller.next();
  assert.equal(controller.currentId, 'b');
});
test('changer le shuffle pendant un ajout manuel conserve titre, audio et ancre de reprise', async () => {
  const { controller, engine } = player();
  controller.setPlaylist(tracks);
  controller.addToQueue({ id: 'manual' });
  await controller.next();
  const changed = [];
  const off = eventBus.on('queue:updated', (queue) => changed.push(queue.current.id));
  controller.setShuffle(true, { seed: 17 });
  assert.equal(controller.currentId, 'manual');
  assert.equal(engine.src, 'manual');
  assert.equal(controller.playlist[controller.order[controller.orderIndex]].id, 'a');
  controller.setShuffle(false);
  assert.deepEqual(changed, ['manual', 'manual']);
  off();
  await controller.next();
  assert.equal(controller.currentId, 'b');
  assert.equal(engine.src, 'b');
});
test('reprise audio différée jusqu’aux métadonnées, annulée si la source change', () => {
  class Audio extends EventTarget { readyState = 0; duration = 120; currentTime = 0; load() {} }
  const audio = new Audio(), engine = new AudioEngine(audio);
  engine.load('a'); engine.seek(32);
  assert.equal(audio.currentTime, 0);
  audio.readyState = 1; audio.dispatchEvent(new Event('loadedmetadata'));
  assert.equal(audio.currentTime, 32);
  audio.readyState = 0; engine.seek(75); engine.load('b');
  audio.currentTime = 0; audio.readyState = 1; audio.dispatchEvent(new Event('loadedmetadata'));
  assert.equal(audio.currentTime, 0);
});
test('LRC : fractions, répétitions de vers, offset et silences', () => {
  const lines = parseLyrics('[ar:Test]\n[offset:-500]\n[00:02.50][00:05.500]Même vers\n[00:09.000]\n[01:02.1]Fin', true);
  assert.deepEqual(lines.map((line) => line.time), [2, 5, 8.5, 61.6]);
  assert.equal(activeLyricIndex(lines, 1), -1);
  assert.equal(activeLyricIndex(lines, 5), 1);
  assert.equal(lines[2].text, '');
  assert.deepEqual(parseLyrics('Premier\n\nSecond'), [{ time: null, text: 'Premier' }, { time: null, text: 'Second' }]);
});
test('le format Sonora partagé devient un morceau web sans perdre les millisecondes', () => {
  const track = normalizeTrack(unwrap({ ok: true, data: { id: 42, duration_ms: 125500, cover_file: 'cover.jpg' } }));
  assert.equal(track.id, '42'); assert.equal(track.duration, 125.5); assert.equal(track.cover, 'cover.jpg');
  assert.equal(unwrap({ ok: true, data: null }), null);
});
