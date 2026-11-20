# BivySwiss

Application de randonnée et de bivouac en Suisse : itinéraires sur la carte nationale swisstopo,
planification avec les CFF, quiz de matériel selon la météo, choix du sac, recettes et plats à emporter.

- **Backend** : Node.js + Express + MongoDB (Mongoose), JavaScript (modules ES).
- **Frontend** : React + Vite, JavaScript, icônes [Tabler](https://tabler.io/icons), animations GSAP.
- **Identité** : logo « Bivouac », palette Forêt, polices Yanone Kaffeesatz (titres) et Chakra Petch (texte). Voir `branding/`.

## Démarrer

Prérequis : Node.js 20+ et MongoDB (`mongod`). Sur ce poste, MongoDB 8.0 est installé dans
`~/.local/opt/mongodb` (sans sudo) ; le script le trouve tout seul.

```bash
npm install            # installe server/ et client/
cp .env.example .env   # puis remplis JWT_SECRET (jamais commité)
npm run db             # lance MongoDB de dev (données dans .data/)
npm run seed           # charge itinéraires, recettes, plats, sacs, matériel
npm run dev:server     # API sur http://localhost:4000/api
npm run dev:client     # app sur http://localhost:5173
```

Autres commandes : `npm run db:stop`, `npm test` (tests du backend),
`npm run tiles:prefetch --workspace server` (pré-télécharge les cartes autour des itinéraires).

## Organisation

```
server/
  src/config/        configuration (.env) et connexion MongoDB
  src/models/        Hike, Recipe, Meal, Backpack, GearItem, User, Trip
  src/services/      logique métier, une classe par service :
                     TileCacheService (cartes swisstopo), PlannerService, TransportService (CFF),
                     WeatherService (Open-Meteo), QuizService, BackpackAdvisor, ExportService, AuthService
  src/controllers/   CatalogController, PlanningController, MapController, AuthController
  src/routes/        toutes les routes /api
  src/middleware/    auth (JWT prêt), gestion des erreurs
  seed/              données de départ + script de chargement
  scripts/           prefetchTiles.js
client/src/
  api/               client de l'API
  hooks/             useApi, useReveal (GSAP)
  styles/            jetons de couleur et styles de base
  features/          un dossier par catégorie : Layout, Home, Hikes, Map, Planner, Quiz,
                     Backpacks, Recipes, Meals, Auth, Common
```

Conventions : composants et classes JS en PascalCase, classes CSS en camelCase (`hikeCard`, `quizChoiceActive`).

## API principale

| Route | Rôle |
| --- | --- |
| `GET /api/hikes` | itinéraires (filtres `canton`, `difficulty`, `bivouac`, `q`, `near=lon,lat`) |
| `GET /api/hikes/:slug` | détail + liens Google Maps / Apple Plans |
| `GET /api/hikes/:slug/export.gpx` | export GPX |
| `GET /api/hikes/:slug/weather` | météo sur place |
| `POST /api/planner/suggest` | randos selon départ, train/local, AG, demi-tarif, durée, canton, ville |
| `POST /api/quiz/questions` / `POST /api/quiz/result` | quiz bivouac dynamique et liste de matériel |
| `GET /api/backpacks`, `POST /api/backpacks/recommend` | catalogue et conseil de sac |
| `GET /api/recipes`, `GET /api/meals`, `GET /api/gear` | recettes, plats, matériel |
| `GET /api/map/tiles/:layer/:z/:x/:y` | cartes swisstopo en cache (`topo`, `aerial`, `trails`) |
| `/api/auth/*` | préparé pour le login (Google + email), répond 501 pour l'instant |

## Sources de données

- Cartes : swisstopo (données ouvertes, mention « © swisstopo » obligatoire).
- Horaires : transport.opendata.ch. Les prix de billets sont **estimés** d'après la distance ; le prix exact est sur sbb.ch.
- Météo : Open-Meteo.
- Les tracés d'itinéraires sont des points de passage approximatifs, et les règles de bivouac sont indicatives : à vérifier auprès des communes et cantons.

## Sécurité

`.env`, `.data/` (base locale) et le cache de cartes ne sont jamais versionnés (voir `.gitignore`).
Le détail des changements est dans `CHANGELOG.md`.
