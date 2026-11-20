import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/apiClient.js';
import { useApi } from '../../hooks/useApi.js';
import { useReveal } from '../../hooks/useReveal.js';
import { PageHeader } from '../Common/PageHeader.jsx';
import { LoadingState, ErrorState } from '../Common/StatusBlocks.jsx';
import { CANTONS } from '../Common/format.js';
import { SwissMap } from '../Map/SwissMap.jsx';
import { HikeCard } from './HikeCard.jsx';
import './hikes.css';

export function HikesPage() {
  const [filters, setFilters] = useState({ q: '', canton: '', difficulty: '', bivouac: false });
  const { data: hikes, error, loading } = useApi((signal) => api.hikes(filters, signal), [filters.q, filters.canton, filters.difficulty, filters.bivouac]);
  const scope = useReveal([hikes]);
  const navigate = useNavigate();
  const update = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const markers = useMemo(() => (hikes ?? []).map((h) => ({ id: h.slug, coordinates: h.startPoint.coordinates, label: h.name, onClick: () => navigate(`/itineraires/${h.slug}`) })), [hikes, navigate]);

  return (
    <div className="pageContainer" ref={scope}>
      <PageHeader eyebrow="Catalogue" title="Itinéraires" lede="Des randonnées dans toute la Suisse, accessibles en transports publics. Clique sur un point de la carte pour voir le détail." />
      <div className="filterBar" data-reveal>
        <label className="formField">Recherche<input id="hikeSearch" value={filters.q} onChange={update('q')} placeholder="lac, Jura, Valais…" /></label>
        <label className="formField">Canton
          <select id="hikeCanton" value={filters.canton} onChange={update('canton')}>
            <option value="">Tous</option>{CANTONS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="formField">Difficulté
          <select id="hikeDifficulty" value={filters.difficulty} onChange={update('difficulty')}>
            <option value="">Toutes</option><option value="T1">T1 facile</option><option value="T1,T2">Jusqu'à T2</option><option value="T3">T3</option>
          </select>
        </label>
        <label className="formCheck"><input id="hikeBivouac" type="checkbox" checked={filters.bivouac} onChange={update('bivouac')} />Bivouac toléré</label>
      </div>
      <div data-reveal><SwissMap markers={markers} height={380} showTrails={false} /></div>
      {loading && <LoadingState />}
      {error && <ErrorState error={error} />}
      {hikes && (
        <>
          <p className="pageHeaderLede">{hikes.length} itinéraire{hikes.length > 1 ? 's' : ''}</p>
          <div className="cardGrid">{hikes.map((h) => <HikeCard key={h.slug} hike={h} />)}</div>
        </>
      )}
    </div>
  );
}
