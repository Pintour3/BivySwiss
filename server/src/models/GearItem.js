import mongoose from 'mongoose';

// Catalogue du matériel utilisé par le quiz bivouac et l'éditeur de sac.
const gearItemSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, enum: ['couchage', 'abri', 'cuisine', 'eau', 'vetements', 'securite', 'hygiene', 'navigation', 'divers'], required: true },
  weightG: Number,
  volumeL: Number,
  shareable: { type: Boolean, default: false }, // peut être partagé dans un groupe (tente, réchaud...)
  notes: String,
  image: {                     // photo libre (Wikimedia Commons) et attribution
    url: String, author: String, license: String, licenseUrl: String, sourceUrl: String,
  },
}, { timestamps: true });

export const GearItem = mongoose.model('GearItem', gearItemSchema);
