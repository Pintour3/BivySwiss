// Remplit la base de développement avec les données de départ (idempotent : upsert par slug/key).
import { connectDatabase, disconnectDatabase } from '../src/config/db.js';
import { Hike, Recipe, Meal, Backpack, GearItem } from '../src/models/index.js';
import { hikes } from './data/hikes.js';
import { recipes } from './data/recipes.js';
import { meals } from './data/meals.js';
import { backpacks } from './data/backpacks.js';
import { gearItems } from './data/gearItems.js';

async function upsertAll(Model, docs, key = 'slug') {
  const ops = docs.map((doc) => ({ replaceOne: { filter: { [key]: doc[key] }, replacement: doc, upsert: true } }));
  const result = await Model.bulkWrite(ops);
  console.log(`[seed] ${Model.modelName.padEnd(9)} ${docs.length} documents (${result.upsertedCount} nouveaux)`);
}

await connectDatabase();
try {
  await Promise.all([Hike, Recipe, Meal, Backpack, GearItem].map((m) => m.syncIndexes()));
  await upsertAll(Hike, hikes);
  await upsertAll(Recipe, recipes);
  await upsertAll(Meal, meals);
  await upsertAll(Backpack, backpacks);
  await upsertAll(GearItem, gearItems, 'key');
} finally {
  await disconnectDatabase();
}
