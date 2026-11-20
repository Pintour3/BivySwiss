# Journal des changements

Un petit résumé à chaque push : ce qui a été ajouté ou corrigé.

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
