// Outils d'authentification prêts pour le futur login (email + mot de passe, Google).
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export class AuthService {
  static SALT_ROUNDS = 12;

  static async hashPassword(plain) {
    return bcrypt.hash(plain, AuthService.SALT_ROUNDS);
  }

  static async verifyPassword(plain, hash) {
    return bcrypt.compare(plain, hash);
  }

  static signToken(user) {
    if (!env.auth.jwtSecret) throw new Error('JWT_SECRET manquant dans .env');
    return jwt.sign({ sub: String(user._id), email: user.email }, env.auth.jwtSecret, { expiresIn: env.auth.jwtExpiresIn });
  }

  static verifyToken(token) {
    return jwt.verify(token, env.auth.jwtSecret);
  }

  static isGoogleConfigured() {
    return Boolean(env.auth.googleClientId && env.auth.googleClientSecret);
  }
}
