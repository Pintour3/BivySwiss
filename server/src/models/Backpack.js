import mongoose from 'mongoose';

const backpackSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  brand: { type: String, required: true, index: true },
  model: { type: String, required: true },
  volumeL: { type: Number, required: true },
  weightG: Number,
  priceChf: Number,            // prix public indicatif, à vérifier
  usage: { type: String, enum: ['journee', 'weekend', 'trek'], required: true },
  gender: { type: String, enum: ['mixte', 'femme', 'homme'], default: 'mixte' },
  features: [String],
  maxLoadKg: Number,
  url: String,
}, { timestamps: true });

export const Backpack = mongoose.model('Backpack', backpackSchema);
