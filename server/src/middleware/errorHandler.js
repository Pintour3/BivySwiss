import { isProduction } from '../config/env.js';

export function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route inconnue : ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let status = err.status ?? 500;
  if (err.name === 'ValidationError' || err.name === 'CastError') status = 400;
  if (status >= 500) console.error(err);
  res.status(status).json({
    error: status >= 500 && isProduction ? 'Erreur serveur' : err.message,
    ...(err.details ? { details: err.details } : {}),
  });
}
