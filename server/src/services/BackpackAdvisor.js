// Conseille un sac selon la durée de la sortie et le volume du matériel à emporter.
import { Backpack } from '../models/index.js';

export class BackpackAdvisor {
  static FOOD_VOLUME_L_PER_DAY = 2.5;
  static MARGIN = 1.15;

  /** Volume conseillé (L) à partir du matériel, de la nourriture et de la durée. */
  static requiredVolume({ gearVolumeL = 0, durationDays = 1 }) {
    const food = BackpackAdvisor.FOOD_VOLUME_L_PER_DAY * Math.max(1, durationDays);
    const base = durationDays <= 1 ? Math.max(gearVolumeL + food, 15) : gearVolumeL + food;
    return Math.ceil(base * BackpackAdvisor.MARGIN);
  }

  static usageFor(durationDays) {
    if (durationDays <= 1) return 'journee';
    if (durationDays <= 2) return 'weekend';
    return 'trek';
  }

  static fillRatio(backpack, neededL) {
    return Math.round((neededL / backpack.volumeL) * 100);
  }

  async recommend({ gearVolumeL = 0, gearWeightG = 0, durationDays = 1, brand, limit = 3 }) {
    const neededL = BackpackAdvisor.requiredVolume({ gearVolumeL, durationDays });
    const filter = brand ? { brand } : {};
    const all = await Backpack.find(filter).lean();

    const ranked = all
      .map((bp) => {
        const fill = BackpackAdvisor.fillRatio(bp, neededL);
        let score = 100;
        if (fill > 100) score -= 200;                 // trop petit
        score -= Math.abs(85 - fill) * 0.8;            // idéal : sac rempli à ~85 %
        score -= (bp.weightG ?? 1500) / 100;          // léger = mieux
        if (bp.usage === BackpackAdvisor.usageFor(durationDays)) score += 10;
        if (bp.maxLoadKg && gearWeightG / 1000 > bp.maxLoadKg) score -= 50;
        return { backpack: bp, fillPercent: fill, score: Math.round(score) };
      })
      .filter((r) => r.fillPercent <= 100)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return { neededVolumeL: neededL, usage: BackpackAdvisor.usageFor(durationDays), recommendations: ranked };
  }
}
