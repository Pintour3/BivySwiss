import mongoose from 'mongoose';

const pointSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: { type: [Number], required: true }, // [lon, lat]
}, { _id: false });

const stationSchema = new mongoose.Schema({
  name: { type: String, required: true },   // nom de l'arrêt CFF/CarPostale, utilisé pour les horaires
  location: { type: pointSchema, required: true },
}, { _id: false });

const hikeSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  canton: { type: String, required: true, index: true },   // code : VD, VS, BE...
  region: String,
  nearestCity: String,
  description: String,
  difficulty: { type: String, enum: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'], required: true }, // échelle CAS
  distanceKm: { type: Number, required: true },
  ascentM: Number,
  descentM: Number,
  durationMin: { type: Number, required: true },
  maxAltitudeM: Number,
  isLoop: { type: Boolean, default: false },
  multiDay: { type: Boolean, default: false },
  bestMonths: [Number],                    // 1 = janvier
  startStation: { type: stationSchema, required: true },
  endStation: stationSchema,
  startPoint: { type: pointSchema, required: true },
  // Tracé simplifié : points de passage principaux, pas une trace GPS précise.
  route: {
    type: { type: String, enum: ['LineString'], default: 'LineString' },
    coordinates: { type: [[Number]], required: true },
  },
  waypoints: [{ name: String, coordinates: [Number], _id: false }],
  bivouac: {
    suitable: { type: Boolean, default: false },
    notes: String,
    waterSources: { type: Boolean, default: false },
  },
  tags: [String],
}, { timestamps: true });

hikeSchema.index({ startPoint: '2dsphere' });

export const Hike = mongoose.model('Hike', hikeSchema);
