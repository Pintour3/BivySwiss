// Recherche de lieux suisses via l'API publique de geo.admin.ch (sans clé).
import { HttpClient } from './HttpClient.js';

export class GeocodingService {
  constructor(httpClient = new HttpClient({ cacheTtlMs: 24 * 3600 * 1000 })) {
    this.httpClient = httpClient;
  }

  async search(text, limit = 5) {
    const url = new URL('https://api3.geo.admin.ch/rest/services/api/SearchServer');
    url.search = new URLSearchParams({ searchText: text, type: 'locations', sr: '4326', limit: String(limit), origins: 'gg25,zipcode,gazetteer' });
    const data = await this.httpClient.getJson(url.toString());
    return (data.results ?? []).map(({ attrs }) => ({
      name: attrs.label.replace(/<[^>]+>/g, ''),
      coordinates: [attrs.lon, attrs.lat],
      kind: attrs.origin,
    }));
  }
}
