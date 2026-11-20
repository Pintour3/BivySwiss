import { useState } from 'react';
import { IconClock, IconDroplet, IconFlame, IconScale, IconLeaf } from '@tabler/icons-react';
import { api } from '../../api/apiClient.js';
import { useApi } from '../../hooks/useApi.js';
import { useReveal } from '../../hooks/useReveal.js';
import { PageHeader } from '../Common/PageHeader.jsx';
import { ErrorState, LoadingState } from '../Common/StatusBlocks.jsx';
import { PhotoThumb } from '../Common/PhotoThumb.jsx';
import './recipes.css';

export const MEAL_LABELS = { petitDejeuner: 'Petit-déjeuner', dejeuner: 'Midi', diner: 'Souper', encas: 'En-cas', boisson: 'Boisson' };
const FUEL_LABELS = { aucun: 'Sans cuisson', faible: 'Peu de gaz', moyen: 'Gaz moyen' };

export function RecipesPage() {
  const [filters, setFilters] = useState({ meal: '', vegetarian: false, noCooking: false });
  const { data, error, loading } = useApi((signal) => api.recipes(filters, signal), [filters.meal, filters.vegetarian, filters.noCooking]);
  const scope = useReveal([data]);
  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  return (
    <div className="pageContainer" ref={scope}>
      <PageHeader eyebrow="Cuisine de bivouac" title="Recettes" lede="Une casserole, un réchaud, peu d'eau. Tout se prépare en moins de 15 minutes." />
      <div className="filterBar" data-reveal>
        <label className="formField">Repas
          <select id="recipeMeal" value={filters.meal} onChange={set('meal')}><option value="">Tous</option>{Object.entries(MEAL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        </label>
        <label className="formCheck"><input id="recipeVeg" type="checkbox" checked={filters.vegetarian} onChange={set('vegetarian')} />Végétarien</label>
        <label className="formCheck"><input id="recipeNoCook" type="checkbox" checked={filters.noCooking} onChange={set('noCooking')} />Sans cuisson</label>
      </div>
      {loading && <LoadingState />}
      {error && <ErrorState error={error} />}
      <div className="cardGrid">
        {(data ?? []).map((r) => (
          <details key={r.slug} className="card recipeCard" data-reveal>
            <summary>
              <PhotoThumb image={r.image} alt={r.name} size="large" showCredit />
              <div className="hikeCardTop"><span className="chip">{MEAL_LABELS[r.meal]}</span><span className="chip chipOutline">{FUEL_LABELS[r.fuel]}</span>{r.vegetarian && <span className="chip"><IconLeaf size={14} /> Végé</span>}</div>
              <h3>{r.name}</h3>
              <div className="statRow">
                <span><IconClock size={16} /><b>{(r.prepMin ?? 0) + (r.cookMin ?? 0)} min</b></span>
                <span><IconDroplet size={16} /><b>{r.waterMl} ml</b></span>
                <span><IconScale size={16} /><b>{r.weightG} g</b></span>
                <span><IconFlame size={16} /><b>{r.kcal} kcal</b></span>
              </div>
            </summary>
            <div className="recipeBody">
              <h4>Ingrédients ({r.servings} portion{r.servings > 1 ? 's' : ''})</h4>
              <ul>{r.ingredients.map((i) => <li key={i.name}>{i.quantity} {i.name}</li>)}</ul>
              <h4>Préparation</h4>
              <ol>{r.steps.map((s) => <li key={s}>{s}</li>)}</ol>
              {r.homePrep && <p className="notice">À la maison : {r.homePrep}</p>}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
