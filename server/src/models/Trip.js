import mongoose from 'mongoose';

// Sortie planifiée (rando + sac + liste de matériel). Liée à un utilisateur quand le login sera actif.
const tripSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  hike: { type: mongoose.Schema.Types.ObjectId, ref: 'Hike', required: true },
  date: Date,
  durationDays: { type: Number, default: 1 },
  quizAnswers: mongoose.Schema.Types.Mixed,
  gearList: mongoose.Schema.Types.Mixed,
  backpack: { type: mongoose.Schema.Types.ObjectId, ref: 'Backpack' },
  customItems: [{ name: String, weightG: Number, volumeL: Number, _id: false }],
}, { timestamps: true });

export const Trip = mongoose.model('Trip', tripSchema);
