import mongoose from 'mongoose';

// Utilisateur : prêt pour la connexion Google et la connexion email + mot de passe.
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  displayName: String,
  avatarUrl: String,
  passwordHash: { type: String, select: false },  // absent pour un compte uniquement Google
  providers: {
    google: { id: { type: String, index: true, sparse: true } },
  },
  preferences: {
    homeLocation: { name: String, coordinates: [Number] },
    hasGeneralAbonnement: { type: Boolean, default: false },
    hasHalfFare: { type: Boolean, default: false },
    favoriteCantons: [String],
    defaultBackpack: { type: mongoose.Schema.Types.ObjectId, ref: 'Backpack' },
  },
  lastLoginAt: Date,
}, { timestamps: true });

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return { id: this._id, email: this.email, displayName: this.displayName, avatarUrl: this.avatarUrl, preferences: this.preferences };
};

export const User = mongoose.model('User', userSchema);
