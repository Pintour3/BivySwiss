// Article Wikipédia (anglais) dont la photo principale illustre chaque élément.
// Le script scripts/fetchImages.js télécharge ces photos depuis Wikimedia Commons
// (licences libres) et enregistre l'auteur et la licence pour l'attribution.
// Sans entrée (sursac, batterie) : l'app affiche l'icône de la catégorie.
// Pour imposer un fichier précis : { file: 'File:Nom.jpg' } au lieu d'un titre d'article.
export const imageSources = {
  recipes: {
    'porridge-pommes-cannelle': 'Porridge',
    'roesti-express': 'Rösti',
    'couscous-legumes': 'Couscous',
    'pates-pesto-parmesan': 'Pesto',
    'risotto-champignons': 'Risotto',
    'wrap-houmous': 'Wrap (food)',
    'soupe-lentilles-corail': 'Lentil soup',
    'chocolat-chaud-epice': 'Hot chocolate',
    'barres-avoine-maison': 'Flapjack (oat bar)',
    'oeufs-brouilles-poudre': 'Scrambled eggs',
  },
  meals: {
    'lyo-chili-sin-carne': 'Chili con carne',
    'lyo-poulet-curry': 'Chicken tikka masala',
    'lyo-muesli-fruits': 'Muesli',
    'taboule-maison': 'Tabbouleh',
    'sandwich-viande-sechee': 'Sandwich',
    'pain-seigle-valaisan': 'Rye bread',
    'gruyere-aop': 'Gruyère cheese',
    'viande-sechee-grisons': 'Bündnerfleisch',
    'trail-mix': 'Trail mix',
    'chocolat-noir': 'Dark chocolate',
    'pommes': 'Apple',
    'barres-cereales': 'Granola bar',
  },
  gear: {
    tente1p: 'Camping', tente2p: 'Camping', tente3p: 'Camping',
    hamac: 'Hammock camping', sanglesHamac: 'Hammock', tarp: 'Tarpaulin',
    sacCouchage: 'Sleeping bag', sacCouchageFroid: 'Sleeping bag', matelas: 'Sleeping pad', underquilt: 'Hammock camping', oreiller: 'Pillow',
    rechaud: 'Portable stove', cartouche: { file: 'File:1970s Bahco Primus 2255 Grasshopper camping stove mounted on a Primus-Sievert 2201 butane gas canister.jpg' }, popote: 'Mess kit', briquet: 'Lighter', couverts: 'Spork', tasse: 'Mug', couteau: 'Swiss Army knife',
    sacPoubelle: 'Bin bag',
    gourde1l: 'Water bottle', poche2l: 'Hydration pack', filtre: { file: 'File:WR126.8 Hiker Filters Water from Intermittent Stream (33500630740).jpg' }, pastilles: { file: 'File:Water purification, June 2011 (cropped).jpg' },
    veste: 'Raincoat', doudoune: 'Down jacket', polaire: 'Polar fleece', bonnet: 'Knit cap', surpantalon: { file: 'File:Uniformbroek, regenbroek van donkerblauw kunststof, objectnr 72481-13(1).JPG' }, casquette: { file: 'File:Baseball cap.jpg' }, rechange: 'Sock', housseSac: 'Backpack',
    pharmacie: 'First aid kit', frontale: 'Headlamp (outdoor)', couverture: 'Space blanket', creme: { file: 'File:Day 1- Hiking Essentials (19444913913).jpg' }, batons: { file: 'File:Retracted trekking poles.jpg' }, carte: 'Topographic map',
    trousse: 'Toiletry bag', pelle: 'Trowel', antimoustique: 'Insect repellent',
  },
};
