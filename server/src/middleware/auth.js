// Middlewares d'authentification, prêts pour le futur système de login.
// Le jeton JWT est lu dans le cookie httpOnly "bivyToken" ou dans l'en-tête Authorization.
import { AuthService } from '../services/AuthService.js';
import { HttpError } from '../utils/HttpError.js';

function readToken(req) {
  if (req.cookies?.bivyToken) return req.cookies.bivyToken;
  const header = req.get('authorization') ?? '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

/** Ajoute req.user si un jeton valide est présent, sans bloquer sinon. */
export function optionalAuth(req, res, next) {
  const token = readToken(req);
  if (token) {
    try { req.user = AuthService.verifyToken(token); } catch { /* jeton invalide : visiteur anonyme */ }
  }
  next();
}

/** Bloque la route si l'utilisateur n'est pas connecté. */
export function requireAuth(req, res, next) {
  optionalAuth(req, res, () => (req.user ? next() : next(HttpError.unauthorized())));
}
