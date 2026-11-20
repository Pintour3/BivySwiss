// Quiz bivouac : questions dynamiques puis liste de matériel personnalisée
// (abri, couchage, cuisine, eau, vêtements selon la météo prévue sur place).
import { GearItem, Hike, Meal, Recipe } from '../models/index.js';
import { WeatherService } from './WeatherService.js';
import { BackpackAdvisor } from './BackpackAdvisor.js';

export const QUIZ_QUESTIONS = [
  { id: 'durationDays', label: 'Combien de jours pars-tu ?', type: 'number', min: 1, max: 7, default: 2 },
  { id: 'groupSize', label: 'Tu pars seul ou à plusieurs ?', type: 'choice', options: [
    { value: 'solo', label: 'Seul' }, { value: 'duo', label: 'À deux' }, { value: 'groupe', label: 'En groupe' }] },
  { id: 'groupCount', label: 'Combien de personnes en tout ?', type: 'number', min: 3, max: 12, default: 4, showIf: { groupSize: 'groupe' } },
  { id: 'shelter', label: 'Comment vas-tu dormir ?', type: 'choice', showIf: { durationDays: { gte: 2 } }, options: [
    { value: 'tente', label: 'Sous tente' }, { value: 'hamac', label: 'En hamac' }, { value: 'belleEtoile', label: 'À la belle étoile' }] },
  { id: 'food', label: 'Comment veux-tu manger ?', type: 'choice', options: [
    { value: 'cuisiner', label: 'Je cuisine sur place' }, { value: 'lyophilise', label: 'Lyophilisé (eau chaude seulement)' }, { value: 'froid', label: 'Tout prêt, sans cuisson' }] },
  { id: 'shareGear', label: 'Partagez-vous le matériel commun (tente, réchaud) ?', type: 'boolean', default: true, showIf: { groupSize: { in: ['duo', 'groupe'] } } },
  { id: 'hike', label: 'Quel itinéraire ?', type: 'hike' },
  { id: 'date', label: 'Quand pars-tu ?', type: 'date' },
];

export class QuizService {
  constructor({ weatherService = new WeatherService(), backpackAdvisor = new BackpackAdvisor() } = {}) {
    this.weatherService = weatherService;
    this.backpackAdvisor = backpackAdvisor;
  }

  static isVisible(question, answers) {
    if (!question.showIf) return true;
    return Object.entries(question.showIf).every(([key, rule]) => {
      const value = answers[key] ?? QUIZ_QUESTIONS.find((q) => q.id === key)?.default;
      if (rule && typeof rule === 'object') {
        if ('gte' in rule) return Number(value) >= rule.gte;
        if ('in' in rule) return rule.in.includes(value);
      }
      return value === rule;
    });
  }

  static visibleQuestions(answers = {}) {
    return QUIZ_QUESTIONS.filter((q) => QuizService.isVisible(q, answers));
  }

  static peopleCount(answers) {
    if (answers.groupSize === 'solo') return 1;
    if (answers.groupSize === 'duo') return 2;
    return Math.max(3, Number(answers.groupCount ?? 4));
  }

  /**
   * Eau à porter par personne (L). Base : 0,5 L par heure de marche, +40 % s'il fait chaud,
   * + eau de cuisine et de nuit. S'il y a des sources (avec filtre), on part avec une réserve réduite.
   */
  static waterPlan({ hike, durationDays, food, forecast }) {
    const hours = (hike?.durationMin ?? 240) / 60;
    const hot = forecast?.some((d) => d.flags.isHot);
    const walkingPerDay = (hours / Math.max(1, durationDays)) * 0.5 * (hot ? 1.4 : 1);
    const cookingPerNight = food === 'cuisiner' ? 1.2 : food === 'lyophilise' ? 0.9 : 0.3;
    const nights = Math.max(0, durationDays - 1);
    const totalNeed = walkingPerDay * durationDays + cookingPerNight * nights + (nights ? 0.5 * nights : 0);
    const hasSources = Boolean(hike?.bivouac?.waterSources);
    const toCarry = hasSources ? Math.min(totalNeed, Math.max(1.5, walkingPerDay + 0.5)) : totalNeed;
    const round = (n) => Math.round(n * 2) / 2; // au demi-litre
    return {
      totalNeedL: round(totalNeed),
      toCarryL: round(Math.max(1, toCarry)),
      hasSources,
      reason: hasSources
        ? 'Des sources existent sur le parcours : pars avec une réserve et remplis avec un filtre.'
        : 'Pas de source fiable signalée : prends toute l\'eau au départ.',
      hot,
    };
  }

  async buildGearList(answers) {
    const durationDays = Math.max(1, Number(answers.durationDays ?? 1));
    const people = QuizService.peopleCount(answers);
    const share = people > 1 && answers.shareGear !== false;
    const shelter = durationDays >= 2 ? (answers.shelter ?? 'tente') : null;
    const food = answers.food ?? 'lyophilise';

    const hike = answers.hike ? await Hike.findOne({ slug: answers.hike }).lean() : null;
    let forecast = null;
    const warnings = [];
    if (hike && answers.date) {
      try {
        forecast = await this.weatherService.forecastForTrip(hike.startPoint.coordinates, answers.date, durationDays);
        if (!forecast) warnings.push('Météo pas encore disponible pour cette date (prévision à 16 jours maximum).');
      } catch {
        warnings.push('Service météo injoignable : liste préparée sans la météo.');
      }
    }
    const flags = {
      isWet: forecast?.some((d) => d.flags.isWet),
      isCold: forecast?.some((d) => d.flags.isCold) || (hike?.maxAltitudeM ?? 0) > 2200,
      isHot: forecast?.some((d) => d.flags.isHot),
      isStorm: forecast?.some((d) => d.flags.isStorm),
    };
    flags.isSnow = forecast?.some((d) => d.flags.isSnow);
    if (flags.isSnow) warnings.push('Neige prévue sur place : itinéraire probablement impraticable en randonnée d\'été.');
    else if (forecast?.some((d) => d.verdict === 'mauvaise')) warnings.push('Météo mauvaise prévue : envisage de décaler la sortie.');
    const month = answers.date ? Number(answers.date.slice(5, 7)) : null;
    if (hike && month && hike.bestMonths?.length && !hike.bestMonths.includes(month)) warnings.push('Hors de la bonne saison pour cet itinéraire (neige ou chemins fermés possibles).');
    if (flags.isStorm) warnings.push('Orages prévus : évite les crêtes l\'après-midi et prévois un plan B.');
    if (hike && durationDays >= 2 && !hike.bivouac?.suitable) warnings.push(`Bivouac non conseillé sur cet itinéraire : ${hike.bivouac?.notes ?? 'vérifie les règles locales.'}`);

    const catalog = new Map((await GearItem.find().lean()).map((i) => [i.key, i]));
    const items = [];
    const add = (key, reason, quantity = 1) => {
      const item = catalog.get(key);
      if (!item || items.some((i) => i.key === key)) return;
      const perPerson = item.shareable && share ? 1 / people : 1;
      items.push({ key, name: item.name, category: item.category, quantity, reason,
        weightG: Math.round(item.weightG * quantity * perPerson), volumeL: Math.round(item.volumeL * quantity * perPerson * 10) / 10,
        shared: item.shareable && share });
    };

    // Base de toute sortie
    ['pharmacie', 'frontale', 'couverture', 'creme', 'carte', 'veste', 'polaire', 'casquette', 'sacPoubelle', 'couteau'].forEach((k) => add(k, 'Essentiel de sécurité'));
    add('gourde1l', 'Eau pendant la marche');

    if (durationDays >= 2) {
      add('powerbank', 'Plusieurs jours sans prise');
      add('rechange', 'Vêtements secs pour la nuit');
      add('trousse', 'Hygiène'); add('pelle', 'Toilettes sans trace');
      add(flags.isCold ? 'sacCouchageFroid' : 'sacCouchage', flags.isCold ? 'Nuits fraîches prévues ou altitude élevée' : 'Nuit en bivouac');
      add('doudoune', 'Soirées en altitude');
      if (shelter === 'tente') {
        const tent = people === 1 || !share ? 'tente1p' : people === 2 ? 'tente2p' : 'tente3p';
        add(tent, 'Abri choisi');
        if (share && people > 3) items.find((i) => i.key === 'tente3p').quantity = Math.ceil(people / 3);
        add('matelas', 'Isolation du sol');
      } else if (shelter === 'hamac') {
        add('hamac', 'Abri choisi'); add('sanglesHamac', 'Fixation sans abîmer les arbres');
        add('underquilt', 'Le froid vient par-dessous en hamac');
        add('tarp', flags.isWet ? 'Pluie prévue' : 'Protection contre la rosée');
        if (hike && (hike.maxAltitudeM ?? 0) > 1900) warnings.push('Au-dessus de la limite des arbres, il est difficile d\'accrocher un hamac.');
      } else {
        add('matelas', 'Isolation du sol'); add('sursacBivy', 'Protection contre l\'humidité et le vent');
        if (flags.isWet) { add('tarp', 'Pluie prévue : un tarp évite une nuit trempée'); warnings.push('Pluie prévue : la belle étoile sera difficile, pense à un abri.'); }
      }
      add('oreiller', 'Confort');
      add('antimoustique', 'Bords de lacs');
    }

    if (food !== 'froid') {
      add('rechaud', food === 'cuisiner' ? 'Cuisine sur place' : 'Eau chaude pour le lyophilisé');
      add('cartouche', 'Une cartouche suffit pour 2 à 3 jours à deux');
      add('popote', 'Chauffer l\'eau'); add('briquet', 'Allumer le réchaud');
      add('couverts', 'Manger dans le sachet'); add('tasse', 'Boissons chaudes');
    }

    const water = QuizService.waterPlan({ hike, durationDays, food, forecast });
    if (water.toCarryL > 1) add('poche2l', `Porter ${water.toCarryL} L d'eau`);
    if (water.hasSources && durationDays >= 2) add('filtre', 'Remplir aux sources du parcours');

    if (flags.isWet) { add('surpantalon', 'Pluie prévue'); add('housseSac', 'Garder le sac au sec'); }
    if (flags.isCold) add('bonnet', 'Températures basses');
    if ((hike?.ascentM ?? 0) > 700) add('batons', 'Fort dénivelé');

    const foodPlan = await QuizService.foodPlan({ food, durationDays });
    const foodWeightG = foodPlan.reduce((sum, f) => sum + (f.weightG ?? 0), 0);
    const totals = {
      gearWeightG: items.reduce((s, i) => s + i.weightG, 0),
      gearVolumeL: Math.round(items.reduce((s, i) => s + i.volumeL, 0) * 10) / 10,
      foodWeightG,
      waterWeightG: water.toCarryL * 1000,
    };
    totals.totalWeightG = totals.gearWeightG + totals.foodWeightG + totals.waterWeightG;

    const backpack = await this.backpackAdvisor.recommend({ gearVolumeL: totals.gearVolumeL, gearWeightG: totals.totalWeightG, durationDays });

    return {
      summary: { durationDays, people, shelter, food, shared: share, hike: hike ? { slug: hike.slug, name: hike.name } : null },
      forecast, weatherFlags: flags, warnings, water, items, foodPlan, totals, backpack,
    };
  }

  static async foodPlan({ food, durationDays }) {
    const nights = Math.max(0, durationDays - 1);
    if (food === 'cuisiner') {
      const [dinners, breakfasts] = await Promise.all([
        Recipe.find({ meal: 'diner' }).limit(nights || 1).lean(),
        Recipe.find({ meal: 'petitDejeuner' }).limit(nights).lean(),
      ]);
      return [...dinners, ...breakfasts].map((r) => ({ type: 'recette', slug: r.slug, name: r.name, weightG: r.weightG }));
    }
    const category = food === 'lyophilise' ? 'lyophilise' : 'maison';
    const mains = await Meal.find({ category }).limit(Math.max(1, nights * 2)).lean();
    const snacks = await Meal.find({ category: 'encas' }).limit(2).lean();
    return [...mains, ...snacks].map((m) => ({ type: 'plat', slug: m.slug, name: m.name, weightG: m.weightG }));
  }
}
