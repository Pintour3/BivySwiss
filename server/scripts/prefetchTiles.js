// Pré-télécharge les tuiles swisstopo autour des itinéraires (ou d'une zone) pour un usage hors ligne.
// Exemples :
//   npm run tiles:prefetch                       -> autour de chaque itinéraire, zooms 10 à 15
//   npm run tiles:prefetch -- --layer=trails --minZoom=12 --maxZoom=16
//   npm run tiles:prefetch -- --bbox=7.60,46.45,7.80,46.55
// La Suisse entière en haute résolution pèse des centaines de Go : on cible les zones utiles.
import { connectDatabase, disconnectDatabase } from '../src/config/db.js';
import { Hike } from '../src/models/index.js';
import { TileCacheService } from '../src/services/TileCacheService.js';
import { GeoUtils } from '../src/utils/GeoUtils.js';

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')));
const layer = args.layer ?? 'topo';
const minZoom = Number(args.minZoom ?? 10);
const maxZoom = Number(args.maxZoom ?? 15);
const marginDeg = Number(args.margin ?? 0.02);
const concurrency = 4;

function tilesForBbox([minLon, minLat, maxLon, maxLat]) {
  const tiles = [];
  for (let z = minZoom; z <= maxZoom; z += 1) {
    const a = GeoUtils.lonLatToTile(minLon, maxLat, z);
    const b = GeoUtils.lonLatToTile(maxLon, minLat, z);
    for (let x = a.x; x <= b.x; x += 1) for (let y = a.y; y <= b.y; y += 1) tiles.push([z, x, y]);
  }
  return tiles;
}

async function bboxes() {
  if (args.bbox) return [args.bbox.split(',').map(Number)];
  await connectDatabase();
  const hikes = await Hike.find().select('route').lean();
  await disconnectDatabase();
  return hikes.map(({ route }) => {
    const lons = route.coordinates.map((c) => c[0]); const lats = route.coordinates.map((c) => c[1]);
    return [Math.min(...lons) - marginDeg, Math.min(...lats) - marginDeg, Math.max(...lons) + marginDeg, Math.max(...lats) + marginDeg];
  });
}

const unique = new Map();
for (const box of await bboxes()) for (const t of tilesForBbox(box)) unique.set(t.join('/'), t);
const queue = [...unique.values()];
console.log(`[tiles] ${queue.length} tuiles « ${layer} » (zooms ${minZoom}-${maxZoom})`);

const cache = new TileCacheService();
let done = 0; let downloaded = 0; let failed = 0;
async function worker() {
  while (queue.length) {
    const [z, x, y] = queue.shift();
    try {
      const tile = await cache.getTile(layer, z, x, y);
      if (tile && !tile.fromCache) { downloaded += 1; await new Promise((r) => setTimeout(r, 50)); }
    } catch { failed += 1; }
    done += 1;
    if (done % 200 === 0) console.log(`[tiles] ${done}/${unique.size}`);
  }
}
await Promise.all(Array.from({ length: concurrency }, worker));
console.log(`[tiles] terminé : ${downloaded} téléchargées, ${unique.size - downloaded - failed} déjà en cache, ${failed} erreurs`);
