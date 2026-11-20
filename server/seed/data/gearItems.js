// Catalogue de matériel. Poids (g) et volumes (L) moyens pour du matériel courant.
const g = (key, name, category, weightG, volumeL, shareable = false, notes) => ({ key, name, category, weightG, volumeL, shareable, notes });

export const gearItems = [
  // Abri
  g('tente1p', 'Tente 1 personne', 'abri', 1300, 4, false),
  g('tente2p', 'Tente 2 personnes', 'abri', 1900, 5, true),
  g('tente3p', 'Tente 3 personnes', 'abri', 2600, 7, true),
  g('hamac', 'Hamac avec moustiquaire', 'abri', 700, 2),
  g('sanglesHamac', 'Sangles d\'arbre', 'abri', 250, 0.5),
  g('tarp', 'Tarp (bâche)', 'abri', 450, 1.5, true),
  g('sursacBivy', 'Sursac de bivouac', 'abri', 400, 1.5, false, 'Indispensable pour dormir à la belle étoile.'),
  // Couchage
  g('sacCouchage', 'Sac de couchage (confort 5 °C)', 'couchage', 1000, 6),
  g('sacCouchageFroid', 'Sac de couchage (confort -2 °C)', 'couchage', 1400, 8),
  g('matelas', 'Matelas gonflable', 'couchage', 500, 1.5),
  g('underquilt', 'Sous-couverture de hamac', 'couchage', 600, 4, false, 'Le froid vient par-dessous en hamac.'),
  g('oreiller', 'Oreiller gonflable', 'couchage', 80, 0.2),
  // Cuisine
  g('rechaud', 'Réchaud à gaz', 'cuisine', 100, 0.3, true),
  g('cartouche', 'Cartouche de gaz 230 g', 'cuisine', 370, 0.6, true),
  g('popote', 'Popote 1 L', 'cuisine', 200, 1, true),
  g('briquet', 'Briquet', 'cuisine', 20, 0.02),
  g('couverts', 'Cuillère longue', 'cuisine', 20, 0.05),
  g('tasse', 'Tasse', 'cuisine', 60, 0.3),
  g('couteau', 'Couteau suisse', 'cuisine', 90, 0.05),
  g('sacPoubelle', 'Sac à déchets', 'divers', 20, 0.05, true, 'On redescend tout.'),
  // Eau
  g('gourde1l', 'Gourde 1 L', 'eau', 150, 1),
  g('poche2l', 'Poche à eau 2 L', 'eau', 180, 2),
  g('filtre', 'Filtre à eau', 'eau', 80, 0.2, true),
  g('pastilles', 'Pastilles de purification', 'eau', 20, 0.02, true),
  // Vêtements
  g('veste', 'Veste imperméable', 'vetements', 400, 1.5),
  g('doudoune', 'Doudoune légère', 'vetements', 350, 2),
  g('polaire', 'Polaire', 'vetements', 350, 2),
  g('bonnet', 'Bonnet et gants', 'vetements', 120, 0.4),
  g('surpantalon', 'Surpantalon imperméable', 'vetements', 250, 0.8),
  g('casquette', 'Casquette', 'vetements', 70, 0.3),
  g('rechange', 'Sous-vêtements et chaussettes de rechange', 'vetements', 250, 1),
  g('housseSac', 'Housse de pluie du sac', 'vetements', 100, 0.3),
  // Sécurité
  g('pharmacie', 'Pharmacie', 'securite', 250, 0.5, true),
  g('frontale', 'Lampe frontale', 'securite', 90, 0.1),
  g('couverture', 'Couverture de survie', 'securite', 60, 0.1),
  g('creme', 'Crème solaire et lunettes', 'securite', 150, 0.3, true),
  g('batons', 'Bâtons de marche', 'securite', 500, 0),
  g('powerbank', 'Batterie externe', 'navigation', 200, 0.2, true),
  g('carte', 'Carte topo ou appli hors ligne', 'navigation', 50, 0.1, true),
  // Hygiène
  g('trousse', 'Trousse de toilette légère', 'hygiene', 150, 0.4),
  g('pelle', 'Petite pelle et papier', 'hygiene', 80, 0.2, true),
  g('antimoustique', 'Anti-moustique', 'hygiene', 60, 0.1, true),
];
