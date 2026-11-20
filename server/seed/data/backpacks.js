// Sacs de randonnée populaires. Volumes, poids et prix sont indicatifs (fiches fabricants,
// prix publics suisses approximatifs) : à vérifier avant achat.
const bp = (brand, model, volumeL, weightG, priceChf, usage, features = [], extra = {}) => ({
  slug: `${brand}-${model}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  brand, model, volumeL, weightG, priceChf, usage, features, ...extra,
});

export const backpacks = [
  // Decathlon (Quechua / Forclaz)
  bp('Decathlon', 'Quechua MH500 20L', 20, 600, 45, 'journee', ['dos ventilé', 'housse pluie']),
  bp('Decathlon', 'Quechua MH500 30L', 30, 900, 60, 'journee', ['dos ventilé', 'housse pluie']),
  bp('Decathlon', 'Forclaz MT500 Air 45+10L', 55, 2100, 150, 'trek', ['dos ventilé', 'réglable', 'housse pluie'], { maxLoadKg: 18 }),
  bp('Decathlon', 'Forclaz MT900 Symbium 50+10L', 60, 1650, 190, 'trek', ['léger', 'housse pluie'], { maxLoadKg: 16 }),
  bp('Decathlon', 'Forclaz Travel 500 40L', 40, 1500, 90, 'weekend', ['ouverture valise']),
  // Mammut
  bp('Mammut', 'Lithium 15', 15, 600, 100, 'journee', ['poche hydratation']),
  bp('Mammut', 'Lithium 25', 25, 900, 140, 'journee', ['poche hydratation', 'housse pluie']),
  bp('Mammut', 'Lithium 40', 40, 1350, 190, 'weekend', ['poche hydratation', 'housse pluie']),
  bp('Mammut', 'Ducan 30', 30, 1250, 170, 'weekend', ['dos ventilé', 'accès frontal']),
  bp('Mammut', 'Trion 50', 50, 1800, 260, 'trek', ['alpinisme', 'porte-piolet'], { maxLoadKg: 18 }),
  // Arc'teryx
  bp('Arc\'teryx', 'Aerios 18', 18, 600, 160, 'journee', ['léger', 'poche hydratation']),
  bp('Arc\'teryx', 'Aerios 30', 30, 900, 210, 'journee', ['léger', 'poche hydratation']),
  bp('Arc\'teryx', 'Aerios 45', 45, 1250, 280, 'weekend', ['léger']),
  bp('Arc\'teryx', 'Bora 65', 65, 2300, 520, 'trek', ['ceinture pivotante', 'charge lourde'], { maxLoadKg: 25 }),
  // Références très répandues
  bp('Osprey', 'Talon 22', 22, 850, 140, 'journee', ['dos ventilé']),
  bp('Osprey', 'Exos 48', 48, 1200, 230, 'trek', ['ultraléger'], { maxLoadKg: 14 }),
  bp('Deuter', 'Futura 32', 32, 1450, 160, 'weekend', ['dos Aircomfort', 'housse pluie']),
  bp('Deuter', 'Aircontact Lite 50+10', 60, 2000, 230, 'trek', ['charge lourde', 'housse pluie'], { maxLoadKg: 20 }),
];
