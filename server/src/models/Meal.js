import mongoose from 'mongoose';

// Plats et aliments à emporter, prêts à manger ou à préparer avant de partir.
const mealSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, enum: ['lyophilise', 'maison', 'encas', 'pain', 'fromage', 'fruit'], required: true },
  needsCooking: { type: Boolean, default: false },
  needsWaterMl: { type: Number, default: 0 },
  weightG: Number,
  kcal: Number,
  shelfLifeDays: Number,       // conservation sans frigo
  volumeL: Number,
  priceChf: Number,            // prix indicatif
  whereToBuy: [String],
  notes: String,
  vegetarian: { type: Boolean, default: false },
  image: {                     // photo libre (Wikimedia Commons) et attribution
    url: String, author: String, license: String, licenseUrl: String, sourceUrl: String,
  },
}, { timestamps: true });

export const Meal = mongoose.model('Meal', mealSchema);
