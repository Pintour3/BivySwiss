import { IconAlertTriangle, IconLoader2 } from '@tabler/icons-react';

export function LoadingState({ label = 'Chargement…' }) {
  return <p className="notice" role="status"><IconLoader2 size={20} className="spinIcon" /> {label}</p>;
}

export function ErrorState({ error }) {
  const hint = error?.status === 500 || error?.message?.includes('fetch') ? ' Vérifie que l\'API tourne (npm run dev:server) et que MongoDB est lancée (npm run db).' : '';
  return <p className="notice noticeDanger" role="alert"><IconAlertTriangle size={20} /> {error?.message ?? 'Erreur inconnue'}.{hint}</p>;
}
