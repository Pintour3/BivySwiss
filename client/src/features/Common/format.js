export const formatDuration = (min) => {
  if (min == null) return '–';
  const h = Math.floor(min / 60); const m = Math.round(min % 60);
  return h ? `${h} h${m ? ` ${String(m).padStart(2, '0')}` : ''}` : `${m} min`;
};
export const formatKg = (g) => `${(g / 1000).toLocaleString('fr-CH', { maximumFractionDigits: 1 })} kg`;
export const formatChf = (n) => (n === 0 ? 'Gratuit' : `CHF ${n.toLocaleString('fr-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
export const formatTime = (iso) => (iso ? new Date(iso).toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' }) : '–');

export const CANTONS = ['AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR', 'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG', 'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH'];
export const DIFFICULTY_LABELS = { T1: 'T1 · Randonnée', T2: 'T2 · Montagne', T3: 'T3 · Montagne exigeante', T4: 'T4 · Alpine', T5: 'T5 · Alpine exigeante', T6: 'T6 · Alpine difficile' };
