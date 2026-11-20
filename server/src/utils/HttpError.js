export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }

  static badRequest(message, details) { return new HttpError(400, message, details); }
  static unauthorized(message = 'Connexion requise') { return new HttpError(401, message); }
  static notFound(message = 'Introuvable') { return new HttpError(404, message); }
  static notImplemented(message = 'Pas encore disponible') { return new HttpError(501, message); }
}

// Enveloppe un handler async pour transmettre les erreurs à Express.
export const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);
