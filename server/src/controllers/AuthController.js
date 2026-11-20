// Routes d'authentification : la structure est prête, l'activation viendra avec le système de login.
import { AuthService } from '../services/AuthService.js';
import { User } from '../models/index.js';
import { HttpError } from '../utils/HttpError.js';

export class AuthController {
  static status(req, res) {
    res.json({
      loginEnabled: false,
      providers: { local: false, google: AuthService.isGoogleConfigured() },
      user: req.user ?? null,
    });
  }

  static async me(req, res) {
    const user = await User.findById(req.user.sub);
    if (!user) throw HttpError.unauthorized();
    res.json(user.toPublicJSON());
  }

  // À implémenter : inscription / connexion email + mot de passe (AuthService.hashPassword / signToken).
  static register() { throw HttpError.notImplemented('Inscription pas encore disponible'); }
  static login() { throw HttpError.notImplemented('Connexion pas encore disponible'); }
  // À implémenter : OAuth Google (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET dans .env).
  static googleStart() { throw HttpError.notImplemented('Connexion Google pas encore disponible'); }
  static googleCallback() { throw HttpError.notImplemented('Connexion Google pas encore disponible'); }
  static logout(req, res) { res.clearCookie('bivyToken').status(204).end(); }
}
