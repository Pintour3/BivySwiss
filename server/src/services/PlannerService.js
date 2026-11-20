// Personnalisation : propose des randonnées selon le point de départ, le mode de transport,
// l'abonnement CFF, la durée souhaitée et une préférence de ville ou de canton.
import { Hike } from '../models/index.js';
import { GeoUtils } from '../utils/GeoUtils.js';
import { TransportService } from './TransportService.js';

const LOCAL_RADIUS_KM = 45;

export class PlannerService {
  constructor({ transportService = new TransportService(), geocodingService } = {}) {
    this.transportService = transportService;
    this.geocodingService = geocodingService;
  }

  /**
   * @param {object} p
   * @param {{name:string, coordinates:[number,number]}} p.home  point de départ
   * @param {'local'|'train'} p.transport  « local » = rando proche de chez soi, « train » = trajet CFF
   * @param {number} p.durationHours  temps de marche souhaité
   * @param {number} p.durationDays   1 = journée, 2+ = avec bivouac
   */
  async suggest({ home, transport = 'local', hasGeneralAbonnement = false, hasHalfFare = false, durationHours = 4, durationDays = 1, canton, city, date, limit = 5 }) {
    if (!home?.coordinates) throw new Error('Point de départ manquant');
    const targetMin = durationHours * 60;

    const filter = {};
    if (canton) filter.canton = canton.toUpperCase();
    if (durationDays >= 2) filter.$or = [{ multiDay: true }, { 'bivouac.suitable': true }];
    let hikes = await Hike.find(filter).lean();

    let cityPoint = null;
    if (city && this.geocodingService) {
      const [found] = await this.geocodingService.search(city, 1);
      cityPoint = found?.coordinates ?? null;
    }

    const month = date ? Number(String(date).slice(5, 7)) : new Date().getMonth() + 1;
    let candidates = hikes.map((hike) => this.scoreHike(hike, { home, cityPoint, transport, targetMin, durationDays, month }));
    if (transport === 'local') {
      const near = candidates.filter((c) => c.distanceFromHomeKm <= LOCAL_RADIUS_KM);
      candidates = near.length ? near : candidates.sort((a, b) => a.distanceFromHomeKm - b.distanceFromHomeKm).slice(0, limit);
    }
    candidates.sort((a, b) => b.score - a.score);
    const top = candidates.slice(0, limit);

    if (transport === 'train') {
      await Promise.all(top.map((c) => this.attachTrainInfo(c, { home, date, hasGeneralAbonnement, hasHalfFare })));
    }
    return {
      criteria: { home, transport, hasGeneralAbonnement, hasHalfFare, durationHours, durationDays, canton: canton ?? null, city: city ?? null, date: date ?? null },
      results: top,
    };
  }

  scoreHike(hike, { home, cityPoint, transport, targetMin, durationDays, month }) {
    const reasons = [];
    const distanceFromHomeKm = GeoUtils.haversineKm(home.coordinates, hike.startPoint.coordinates);
    let score = 100;

    // Adéquation de la durée de marche (sur plusieurs jours, la durée est répartie).
    const effectiveTarget = targetMin * Math.max(1, durationDays * 0.8);
    const gap = Math.abs(hike.durationMin - effectiveTarget) / effectiveTarget;
    score -= gap * 60;
    if (gap < 0.2) reasons.push('Durée proche de ce que tu cherches');

    // Proximité : très importante en mode local, moins en train.
    score -= distanceFromHomeKm * (transport === 'local' ? 0.8 : 0.15);
    if (distanceFromHomeKm < 25) reasons.push(`À ${Math.round(distanceFromHomeKm)} km de chez toi`);

    if (cityPoint) {
      const toCity = GeoUtils.haversineKm(cityPoint, hike.startPoint.coordinates);
      score -= toCity * 0.5;
      if (toCity < 30) reasons.push('Proche de la ville choisie');
    }
    if (durationDays >= 2 && hike.bivouac?.suitable) { score += 15; reasons.push('Bivouac toléré'); }
    if (durationDays >= 2 && hike.multiDay) score += 10;
    const inSeason = !hike.bestMonths?.length || !month || hike.bestMonths.includes(month);
    if (!inSeason) score -= 40;

    return {
      hike,
      score: Math.round(score),
      distanceFromHomeKm: Math.round(distanceFromHomeKm * 10) / 10,
      reasons,
      inSeason,
    };
  }

  async attachTrainInfo(candidate, { home, date, hasGeneralAbonnement, hasHalfFare }) {
    const to = candidate.hike.startStation.name;
    const back = candidate.hike.endStation?.name ?? to;
    candidate.train = {
      fareEstimateChf: TransportService.estimateFareChf(candidate.distanceFromHomeKm, { hasGeneralAbonnement, hasHalfFare }) * 2,
      fareIsEstimate: !hasGeneralAbonnement,
      sbbUrl: TransportService.sbbTimetableUrl(home.name, to, date),
      returnSbbUrl: TransportService.sbbTimetableUrl(back, home.name, date),
      connections: [],
    };
    try {
      candidate.train.connections = await this.transportService.connections({ from: home.name, to, date, time: '07:30', limit: 2 });
      const best = candidate.train.connections[0];
      if (best?.durationMin) {
        candidate.train.travelMinOneWay = best.durationMin;
        candidate.totalDayMin = best.durationMin * 2 + candidate.hike.durationMin;
      }
    } catch (err) {
      candidate.train.error = `Horaires indisponibles (${err.message})`;
    }
  }
}
