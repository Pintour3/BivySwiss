import { TileCacheService, TILE_LAYERS } from '../services/TileCacheService.js';

const tileCache = new TileCacheService();

export class MapController {
  static layers(req, res) {
    res.json(Object.entries(TILE_LAYERS).map(([key, l]) => ({
      key, label: l.label, minZoom: l.minZoom, maxZoom: l.maxZoom,
      url: `/api/map/tiles/${key}/{z}/{x}/{y}`, attribution: '© swisstopo',
    })));
  }

  static async tile(req, res) {
    const { layer, z, x, y } = req.params;
    const tile = await tileCache.getTile(layer, z, x, y);
    if (!tile) return res.status(404).end();
    res.set({ 'Content-Type': tile.contentType, 'Cache-Control': 'public, max-age=604800', 'X-Tile-Cache': tile.fromCache ? 'hit' : 'miss' });
    return res.send(tile.buffer);
  }

  static async stats(req, res) {
    res.json(await tileCache.stats());
  }
}
