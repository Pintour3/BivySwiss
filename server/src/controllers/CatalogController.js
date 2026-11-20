// Lecture des catalogues (itinéraires, recettes, plats, sacs, matériel).
import { Backpack, GearItem, Hike, Meal, Recipe } from '../models/index.js';
import { ExportService } from '../services/ExportService.js';
import { HttpError } from '../utils/HttpError.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export class CatalogController {
  static async listHikes(req, res) {
    const { canton, difficulty, multiDay, bivouac, maxDurationMin, q, near, radiusKm = 50 } = req.query;
    const filter = {};
    if (canton) filter.canton = String(canton).toUpperCase();
    if (difficulty) filter.difficulty = { $in: String(difficulty).split(',') };
    if (multiDay === 'true') filter.multiDay = true;
    if (bivouac === 'true') filter['bivouac.suitable'] = true;
    if (maxDurationMin) filter.durationMin = { $lte: Number(maxDurationMin) };
    if (q) filter.$or = [{ name: new RegExp(escapeRegex(q), 'i') }, { region: new RegExp(escapeRegex(q), 'i') }, { tags: new RegExp(escapeRegex(q), 'i') }];
    if (near) {
      const [lon, lat] = String(near).split(',').map(Number);
      if (Number.isFinite(lon) && Number.isFinite(lat)) {
        filter.startPoint = { $nearSphere: { $geometry: { type: 'Point', coordinates: [lon, lat] }, $maxDistance: Number(radiusKm) * 1000 } };
      }
    }
    const hikes = await Hike.find(filter).select('-route').sort(near ? undefined : { name: 1 }).lean();
    res.json(hikes);
  }

  static async getHike(req, res) {
    const hike = await Hike.findOne({ slug: req.params.slug }).lean();
    if (!hike) throw HttpError.notFound('Itinéraire introuvable');
    res.json({ ...hike, exportLinks: ExportService.links(hike) });
  }

  static async exportGpx(req, res) {
    const hike = await Hike.findOne({ slug: req.params.slug }).lean();
    if (!hike) throw HttpError.notFound('Itinéraire introuvable');
    res.type('application/gpx+xml').attachment(`${hike.slug}.gpx`).send(ExportService.toGpx(hike));
  }

  static async listRecipes(req, res) {
    const filter = {};
    if (req.query.meal) filter.meal = req.query.meal;
    if (req.query.vegetarian === 'true') filter.vegetarian = true;
    if (req.query.noCooking === 'true') filter.fuel = 'aucun';
    res.json(await Recipe.find(filter).sort({ meal: 1, name: 1 }).lean());
  }

  static async getRecipe(req, res) {
    const recipe = await Recipe.findOne({ slug: req.params.slug }).lean();
    if (!recipe) throw HttpError.notFound('Recette introuvable');
    res.json(recipe);
  }

  static async listMeals(req, res) {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.vegetarian === 'true') filter.vegetarian = true;
    res.json(await Meal.find(filter).sort({ category: 1, name: 1 }).lean());
  }

  static async listBackpacks(req, res) {
    const filter = {};
    if (req.query.brand) filter.brand = req.query.brand;
    if (req.query.usage) filter.usage = req.query.usage;
    if (req.query.minVolume || req.query.maxVolume) {
      filter.volumeL = {};
      if (req.query.minVolume) filter.volumeL.$gte = Number(req.query.minVolume);
      if (req.query.maxVolume) filter.volumeL.$lte = Number(req.query.maxVolume);
    }
    res.json(await Backpack.find(filter).sort({ volumeL: 1 }).lean());
  }

  static async listGear(req, res) {
    res.json(await GearItem.find().sort({ category: 1, name: 1 }).lean());
  }
}
