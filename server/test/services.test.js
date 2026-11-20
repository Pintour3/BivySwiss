import test from 'node:test';
import assert from 'node:assert/strict';
import { GeoUtils } from '../src/utils/GeoUtils.js';
import { ExportService } from '../src/services/ExportService.js';
import { TransportService } from '../src/services/TransportService.js';
import { BackpackAdvisor } from '../src/services/BackpackAdvisor.js';
import { QuizService } from '../src/services/QuizService.js';
import { TileCacheService } from '../src/services/TileCacheService.js';

const hike = {
  slug: 'test', name: 'Test & co', description: 'd', isLoop: false,
  route: { coordinates: [[7.0, 46.0], [7.1, 46.1], [7.2, 46.2]] },
  waypoints: [{ name: 'A', coordinates: [7.0, 46.0] }],
};

test('distance Lausanne – Berne ≈ 77 km à vol d’oiseau', () => {
  const d = GeoUtils.haversineKm([6.6323, 46.5197], [7.4474, 46.948]);
  assert.ok(d > 72 && d < 82, `obtenu ${d}`);
});

test('GPX valide et échappé', () => {
  const gpx = ExportService.toGpx(hike);
  assert.match(gpx, /<trkpt lat="46.1" lon="7.1"\/>/);
  assert.match(gpx, /Test &amp; co/);
});

test('liens Google et Apple Maps à pied', () => {
  const g = new URL(ExportService.googleMapsUrl(hike));
  assert.equal(g.searchParams.get('travelmode'), 'walking');
  assert.equal(g.searchParams.get('waypoints'), '46.1,7.1');
  assert.equal(new URL(ExportService.appleMapsUrl(hike)).searchParams.get('dirflg'), 'w');
});

test('AG = trajet gratuit, demi-tarif = moitié prix', () => {
  assert.equal(TransportService.estimateFareChf(80, { hasGeneralAbonnement: true }), 0);
  const full = TransportService.estimateFareChf(80);
  const half = TransportService.estimateFareChf(80, { hasHalfFare: true });
  assert.ok(Math.abs(half - full / 2) < 0.3);
  assert.equal(TransportService.parseDuration('00d02:23:00'), 143);
});

test('volume de sac conseillé augmente avec la durée', () => {
  assert.ok(BackpackAdvisor.requiredVolume({ gearVolumeL: 20, durationDays: 3 }) > BackpackAdvisor.requiredVolume({ gearVolumeL: 20, durationDays: 1 }));
});

test('quiz : questions conditionnelles', () => {
  const solo = QuizService.visibleQuestions({ groupSize: 'solo', durationDays: 1 }).map((q) => q.id);
  assert.ok(!solo.includes('groupCount') && !solo.includes('shelter'));
  const groupe = QuizService.visibleQuestions({ groupSize: 'groupe', durationDays: 2 }).map((q) => q.id);
  assert.ok(groupe.includes('groupCount') && groupe.includes('shelter') && groupe.includes('shareGear'));
});

test('quiz : plus d\'eau sans source qu\'avec', () => {
  const base = { hike: { durationMin: 480, bivouac: { waterSources: false } }, durationDays: 2, food: 'cuisiner', forecast: null };
  const dry = QuizService.waterPlan(base);
  const wet = QuizService.waterPlan({ ...base, hike: { ...base.hike, bivouac: { waterSources: true } } });
  assert.ok(dry.toCarryL > wet.toCarryL);
});

test('tuiles : validation des coordonnées', () => {
  assert.ok(TileCacheService.validate('topo', 12, 2132, 1450));
  assert.equal(TileCacheService.validate('topo', 12, 99999, 1), null);
  assert.equal(TileCacheService.validate('inconnu', 12, 1, 1), null);
  assert.equal(TileCacheService.validate('topo', '../x', 1, 1), null);
});
