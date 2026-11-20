// Personnalisation, quiz bivouac, conseil de sac, météo, horaires, géocodage.
import { Hike } from '../models/index.js';
import { PlannerService } from '../services/PlannerService.js';
import { QuizService } from '../services/QuizService.js';
import { BackpackAdvisor } from '../services/BackpackAdvisor.js';
import { WeatherService } from '../services/WeatherService.js';
import { TransportService } from '../services/TransportService.js';
import { GeocodingService } from '../services/GeocodingService.js';
import { HttpError } from '../utils/HttpError.js';

const geocodingService = new GeocodingService();
const transportService = new TransportService();
const weatherService = new WeatherService();
const backpackAdvisor = new BackpackAdvisor();
const plannerService = new PlannerService({ transportService, geocodingService });
const quizService = new QuizService({ weatherService, backpackAdvisor });

export class PlanningController {
  static async suggest(req, res) {
    const body = req.body ?? {};
    let home = body.home;
    if (!home?.coordinates && home?.name) {
      const [found] = await geocodingService.search(home.name, 1);
      if (!found) throw HttpError.badRequest(`Lieu introuvable : ${home.name}`);
      home = { name: home.name, coordinates: found.coordinates };
    }
    if (!home?.coordinates) throw HttpError.badRequest('Indique ton point de départ (home.name ou home.coordinates)');
    res.json(await plannerService.suggest({ ...body, home }));
  }

  static quizQuestions(req, res) {
    res.json({ questions: QuizService.visibleQuestions(req.body?.answers ?? req.query ?? {}) });
  }

  static async quizResult(req, res) {
    res.json(await quizService.buildGearList(req.body?.answers ?? {}));
  }

  static async recommendBackpack(req, res) {
    const { gearVolumeL = 0, gearWeightG = 0, durationDays = 1, brand } = { ...req.query, ...req.body };
    res.json(await backpackAdvisor.recommend({ gearVolumeL: Number(gearVolumeL), gearWeightG: Number(gearWeightG), durationDays: Number(durationDays), brand }));
  }

  static async weatherForHike(req, res) {
    const hike = await Hike.findOne({ slug: req.params.slug }).select('startPoint').lean();
    if (!hike) throw HttpError.notFound('Itinéraire introuvable');
    res.json(await weatherService.dailyForecast(hike.startPoint.coordinates, { days: Number(req.query.days ?? 7) }));
  }

  static async connections(req, res) {
    const { from, to, date, time } = req.query;
    if (!from || !to) throw HttpError.badRequest('Paramètres from et to requis');
    res.json({ connections: await transportService.connections({ from, to, date, time }), sbbUrl: TransportService.sbbTimetableUrl(from, to, date) });
  }

  static async geocode(req, res) {
    if (!req.query.q) throw HttpError.badRequest('Paramètre q requis');
    res.json(await geocodingService.search(String(req.query.q)));
  }
}
