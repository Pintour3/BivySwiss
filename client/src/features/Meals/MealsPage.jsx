import { useState } from 'react';
import { IconScale, IconFlame, IconCalendarTime, IconDroplet, IconLeaf } from '@tabler/icons-react';
import { api } from '../../api/apiClient.js';
import { useApi } from '../../hooks/useApi.js';
import { useReveal } from '../../hooks/useReveal.js';
import { PageHeader } from '../Common/PageHeader.jsx';
import { ErrorState, LoadingState } from '../Common/StatusBlocks.jsx';
import { formatChf } from '../Common/format.js';

const CATEGORY_LABELS = { lyophilise: 'Lyophilisé', maison: 'Fait maison', encas: 'En-cas', pain: 'Pain', fromage: 'Fromage', fruit: 'Fruit' };
const shelf = (d) => (d >= 365 ? `${Math.round(d / 365)} an${d >= 730 ? 's' : ''}` : `${d} jour${d > 1 ? 's' : ''}`);

export function MealsPage() {
  const [category, setCategory] = useState('');
  const { data, error, loading } = useApi((signal) => api.meals({ category }, signal), [category]);
  const scope = useReveal([data]);
  return (
    <div className="pageContainer" ref={scope}>
      <PageHeader eyebrow="Avant de partir" title="Plats à emporter" lede="Ce qui se garde sans frigo, ce qui se prépare la veille, et combien ça pèse." />
      <div className="filterBar" data-reveal>
        <label className="formField">Catégorie
          <select id="mealCategory" value={category} onChange={(e) => setCategory(e.target.value)}><option value="">Toutes</option>{Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        </label>
      </div>
      {loading && <LoadingState />}
      {error && <ErrorState error={error} />}
      <div className="cardGrid">
        {(data ?? []).map((m) => (
          <article key={m.slug} className="card" data-reveal>
            <div className="hikeCardTop"><span className="chip">{CATEGORY_LABELS[m.category]}</span>{m.vegetarian && <span className="chip"><IconLeaf size={14} /> Végé</span>}</div>
            <h3>{m.name}</h3>
            <div className="statRow">
              <span><IconScale size={16} /><b>{m.weightG} g</b></span>
              <span><IconFlame size={16} /><b>{m.kcal} kcal</b></span>
              <span><IconCalendarTime size={16} /><b>{shelf(m.shelfLifeDays)}</b></span>
              {m.needsWaterMl > 0 && <span><IconDroplet size={16} /><b>{m.needsWaterMl} ml</b></span>}
            </div>
            <p className="backpackHint">{m.notes}</p>
            <p className="backpackHint">≈ {formatChf(m.priceChf)} · {m.whereToBuy.join(', ')}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
