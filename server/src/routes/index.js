import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { asyncHandler as h } from '../utils/HttpError.js';
import { CatalogController } from '../controllers/CatalogController.js';
import { PlanningController } from '../controllers/PlanningController.js';
import { MapController } from '../controllers/MapController.js';
import { AuthController } from '../controllers/AuthController.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import imageCredits from '../../seed/data/imageCredits.json' with { type: 'json' };

export const apiRouter = Router();
apiRouter.use(optionalAuth);

apiRouter.get('/health', (req, res) => res.json({ ok: true, service: 'bivyswiss' }));

// Catalogues
apiRouter.get('/hikes', h(CatalogController.listHikes));
apiRouter.get('/hikes/:slug', h(CatalogController.getHike));
apiRouter.get('/hikes/:slug/export.gpx', h(CatalogController.exportGpx));
apiRouter.get('/hikes/:slug/weather', h(PlanningController.weatherForHike));
apiRouter.get('/recipes', h(CatalogController.listRecipes));
apiRouter.get('/recipes/:slug', h(CatalogController.getRecipe));
apiRouter.get('/meals', h(CatalogController.listMeals));
apiRouter.get('/backpacks', h(CatalogController.listBackpacks));
apiRouter.post('/backpacks/recommend', h(PlanningController.recommendBackpack));
apiRouter.get('/gear', h(CatalogController.listGear));
apiRouter.get('/image-credits', (req, res) => res.json(Object.entries(imageCredits).map(([key, c]) => ({ key, ...c }))));

// Planification (appels à des services externes : limités)
const externalLimiter = rateLimit({ windowMs: 60_000, limit: 60 });
apiRouter.post('/planner/suggest', externalLimiter, h(PlanningController.suggest));
apiRouter.post('/quiz/questions', h(PlanningController.quizQuestions));
apiRouter.post('/quiz/result', externalLimiter, h(PlanningController.quizResult));
apiRouter.get('/transport/connections', externalLimiter, h(PlanningController.connections));
apiRouter.get('/geocode', externalLimiter, h(PlanningController.geocode));

// Cartes swisstopo en cache
apiRouter.get('/map/layers', MapController.layers);
apiRouter.get('/map/tiles/:layer/:z/:x/:y', h(MapController.tile));
apiRouter.get('/map/stats', h(MapController.stats));

// Authentification (préparée)
const authLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 30 });
apiRouter.get('/auth/status', AuthController.status);
apiRouter.get('/auth/me', requireAuth, h(AuthController.me));
apiRouter.post('/auth/register', authLimiter, h(AuthController.register));
apiRouter.post('/auth/login', authLimiter, h(AuthController.login));
apiRouter.get('/auth/google', h(AuthController.googleStart));
apiRouter.get('/auth/google/callback', h(AuthController.googleCallback));
apiRouter.post('/auth/logout', AuthController.logout);
