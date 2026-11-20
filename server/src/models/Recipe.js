import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  meal: { type: String, enum: ['petitDejeuner', 'dejeuner', 'diner', 'encas', 'boisson'], required: true },
  servings: { type: Number, default: 1 },
  prepMin: Number,
  cookMin: Number,
  waterMl: Number,             // eau nécessaire à la cuisson / réhydratation
  fuel: { type: String, enum: ['aucun', 'faible', 'moyen'], default: 'faible' },
  weightG: Number,             // poids sec à porter pour une portion
  kcal: Number,
  equipment: [String],         // réchaud, popote, cuillère...
  ingredients: [{ name: String, quantity: String, _id: false }],
  steps: [String],
  homePrep: String,            // ce qu'on peut préparer à la maison
  tags: [String],
  vegetarian: { type: Boolean, default: false },
}, { timestamps: true });

export const Recipe = mongoose.model('Recipe', recipeSchema);
