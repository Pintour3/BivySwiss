// Cache serveur des cartes swisstopo (WMTS, données ouvertes « © swisstopo »).
// Chaque tuile demandée est téléchargée une seule fois puis servie depuis le disque.
import fs from 'node:fs/promises';
import path from 'node:path';
import { env } from '../config/env.js';
import { HttpClient } from './HttpClient.js';

export const TILE_LAYERS = {
  topo: { id: 'ch.swisstopo.pixelkarte-farbe', ext: 'jpeg', label: 'Carte nationale', minZoom: 7, maxZoom: 18 },
  aerial: { id: 'ch.swisstopo.swissimage', ext: 'jpeg', label: 'Photo aérienne', minZoom: 7, maxZoom: 19 },
  trails: { id: 'ch.swisstopo.swisstlm3d-wanderwege', ext: 'png', label: 'Chemins de randonnée', minZoom: 7, maxZoom: 18 },
};

export class TileCacheService {
  constructor({ cacheDir = env.tileCacheDir, httpClient = new HttpClient({ timeoutMs: 10000 }) } = {}) {
    this.cacheDir = cacheDir;
    this.httpClient = httpClient;
    this.pending = new Map(); // évite de télécharger deux fois la même tuile en parallèle
  }

  static validate(layerKey, z, x, y) {
    const layer = TILE_LAYERS[layerKey];
    if (!layer) return null;
    const [zi, xi, yi] = [z, x, y].map(Number);
    if (![zi, xi, yi].every(Number.isInteger)) return null;
    if (zi < layer.minZoom || zi > layer.maxZoom) return null;
    const max = 2 ** zi;
    if (xi < 0 || yi < 0 || xi >= max || yi >= max) return null;
    return { layer, z: zi, x: xi, y: yi };
  }

  tilePath(layerKey, z, x, y) {
    return path.join(this.cacheDir, layerKey, String(z), String(x), `${y}.${TILE_LAYERS[layerKey].ext}`);
  }

  remoteUrl(layer, z, x, y) {
    return `https://wmts.geo.admin.ch/1.0.0/${layer.id}/default/current/3857/${z}/${x}/${y}.${layer.ext}`;
  }

  /** Retourne { buffer, contentType, fromCache } ou null si la tuile n'existe pas. */
  async getTile(layerKey, z, x, y) {
    const valid = TileCacheService.validate(layerKey, z, x, y);
    if (!valid) return null;
    const file = this.tilePath(layerKey, valid.z, valid.x, valid.y);
    const contentType = valid.layer.ext === 'png' ? 'image/png' : 'image/jpeg';
    try {
      return { buffer: await fs.readFile(file), contentType, fromCache: true };
    } catch { /* pas encore en cache */ }

    if (!this.pending.has(file)) {
      const job = this.httpClient.getBuffer(this.remoteUrl(valid.layer, valid.z, valid.x, valid.y))
        .then(async ({ buffer }) => {
          await fs.mkdir(path.dirname(file), { recursive: true });
          await fs.writeFile(file, buffer);
          return buffer;
        })
        .finally(() => this.pending.delete(file));
      this.pending.set(file, job);
    }
    return { buffer: await this.pending.get(file), contentType, fromCache: false };
  }

  async stats() {
    const result = {};
    for (const key of Object.keys(TILE_LAYERS)) {
      result[key] = await TileCacheService.countFiles(path.join(this.cacheDir, key));
    }
    return result;
  }

  static async countFiles(dir) {
    let count = 0; let bytes = 0;
    let entries;
    try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return { count, bytes }; }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const sub = await TileCacheService.countFiles(full);
        count += sub.count; bytes += sub.bytes;
      } else {
        count += 1; bytes += (await fs.stat(full)).size;
      }
    }
    return { count, bytes };
  }
}
