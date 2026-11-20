# Journal des changements

Un petit résumé à chaque push : ce qui a été ajouté ou corrigé.

## 0.4.0 — Quiz façon Duolingo, cartes de choix façon Airbnb (2026-11-20)

- Quiz bivouac plein écran, sobre (blanc, ardoise, grands titres) : une question par écran, transition glissée entre les étapes.
- Barre de progression épaisse et arrondie qui rebondit en avançant, avec étincelles au bout de la barre et petits encouragements (« Bien vu ! »).
- Bouton « Continuer » en relief en bas d'écran, qui s'active (bandeau vert lichen) dès qu'une réponse est donnée ; « Passer » pour les questions facultatives.
- Raccourcis clavier : 1, 2, 3 pour choisir, Entrée pour continuer.
- Cartes de choix réutilisables (icône, titre, description, coche, bordure épaisse) : quiz, choix d'itinéraire, dates rapides (demain, ce samedi, dans une semaine), et planificateur (train ou local, durée de la sortie).
- Compteur animé pour le nombre de jours et de personnes, confettis à l'affichage de la liste de matériel.
- Les particules et animations sont désactivées si le système demande de réduire les animations.

## 0.3.0 — Photos des plats, recettes et matériel (2026-11-20)

- Photos libres (Wikimedia Commons) pour les 10 recettes, les 12 plats et 40 objets de matériel, stockées dans `server/public/images/` et servies par l'API sous `/images`.
- Script `npm run images:fetch --workspace server` : télécharge la photo principale de l'article Wikipédia choisi (ou un fichier précis), garde l'auteur et la licence, et réessaie si Wikimedia limite le débit.
- Attribution : auteur et licence affichés sur chaque photo, et page « Crédits photos » accessible depuis le pied de page.
- Photos visibles dans Recettes, Plats, Mon sac et la liste du quiz bivouac. Sans photo (sursac, batterie), l'icône de la catégorie s'affiche.
- Correctif : 7 photos hors sujet remplacées après vérification (cartouche, casquette, crème solaire, filtre, pastilles…).

## 0.2.0 — Frontend React (2026-11-20)

- Application React (Vite) avec la palette Ardoise et lichen (logo et SVG mis à jour), les icônes Tabler et les animations GSAP.
- Pages : accueil, itinéraires (carte swisstopo, filtres), détail (tracé, météo, export Google/Apple/GPX), planificateur, quiz bivouac, composition du sac (jauge de remplissage), recettes, plats, compte (préparé).
- Correctif : les animations se terminent toujours, même si le navigateur suspend l'animation (contenu jamais invisible).
- Correctif : en mode train, les sorties d'un jour de plus de 13 h (trajet + marche) sont écartées, et le temps de trajet pèse dans le classement.
- Correctif : plus d'alerte « sac à moitié vide » sur les plus petits sacs.

## 0.1.0 — Backend initial (2026-11-20)

- Structure du projet : `server/` (Node.js + Express + MongoDB) et `client/` (React).
- MongoDB de développement locale lancée par `npm run db` (données dans `.data/`, jamais versionnées).
- Modèles : itinéraires, recettes, plats à emporter, sacs, matériel, utilisateurs, sorties.
- Données de départ : 18 itinéraires suisses, 10 recettes de bivouac, 12 plats, 18 sacs (Decathlon, Mammut, Arc'teryx, Osprey, Deuter), 42 objets de matériel.
- Cartes swisstopo mises en cache sur le serveur (carte nationale, photo aérienne, chemins de randonnée) + script de pré-téléchargement.
- Personnalisation : rando proche de chez soi ou en train CFF (horaires réels, prix estimé, AG / demi-tarif), durée, canton ou ville préférés, saison.
- Quiz bivouac : questions dynamiques, liste de matériel selon abri, groupe, repas, météo prévue (Open-Meteo) et eau à porter.
- Conseil de sac selon la durée et le volume du matériel.
- Export des itinéraires : GPX, Google Maps, Apple Maps.
- Authentification préparée (modèle utilisateur, JWT, routes en attente) pour le futur login Google + email.
- Correctif : alertes neige, mauvaise météo et hors saison dans le quiz et le planificateur.
