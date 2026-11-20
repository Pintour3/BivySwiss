// Horaires des transports publics suisses via transport.opendata.ch (API ouverte, sans clé).
import { HttpClient } from './HttpClient.js';

export class TransportService {
  constructor(httpClient = new HttpClient({ cacheTtlMs: 10 * 60 * 1000 })) {
    this.httpClient = httpClient;
  }

  static parseDuration(value) {
    const match = /(\d+)d(\d+):(\d+):(\d+)/.exec(value ?? '');
    return match ? Number(match[1]) * 1440 + Number(match[2]) * 60 + Number(match[3]) : null;
  }

  async connections({ from, to, date, time, limit = 3 }) {
    const url = new URL('https://transport.opendata.ch/v1/connections');
    const params = new URLSearchParams({ from, to, limit: String(limit) });
    if (date) params.set('date', date);
    if (time) params.set('time', time);
    for (const field of ['connections/from/departure', 'connections/to/arrival', 'connections/duration', 'connections/transfers', 'connections/products', 'connections/from/station/name', 'connections/to/station/name']) {
      params.append('fields[]', field);
    }
    url.search = params.toString();
    const data = await this.httpClient.getJson(url.toString());
    return (data.connections ?? []).map((c) => ({
      from: c.from?.station?.name ?? from,
      to: c.to?.station?.name ?? to,
      departure: c.from?.departure,
      arrival: c.to?.arrival,
      durationMin: TransportService.parseDuration(c.duration),
      transfers: c.transfers,
      products: c.products,
    }));
  }

  /** Lien vers l'horaire CFF officiel pour acheter le billet. */
  static sbbTimetableUrl(from, to, date) {
    const params = new URLSearchParams({ von: from, nach: to });
    if (date) params.set('datum', date);
    return `https://www.sbb.ch/fr/acheter/pages/fahrplan/fahrplan.xhtml?${params}`;
  }

  /**
   * Estimation grossière du prix d'un aller simple en 2e classe, en CHF.
   * Basée sur la distance à vol d'oiseau. À remplacer par un vrai tarif quand une API sera disponible.
   */
  static estimateFareChf(crowDistanceKm, { hasGeneralAbonnement = false, hasHalfFare = false } = {}) {
    if (hasGeneralAbonnement) return 0;
    const railKm = crowDistanceKm * 1.35;
    let fare = Math.max(3.6, 2.2 + railKm * 0.31);
    if (hasHalfFare) fare /= 2;
    return Math.round(fare * 5) / 5; // arrondi à 20 centimes
  }
}
