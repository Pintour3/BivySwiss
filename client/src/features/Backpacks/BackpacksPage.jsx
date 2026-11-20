import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { IconBackpack, IconSparkles, IconScale, IconBox } from '@tabler/icons-react';
import { api } from '../../api/apiClient.js';
import { useApi } from '../../hooks/useApi.js';
import { useReveal } from '../../hooks/useReveal.js';
import { PageHeader } from '../Common/PageHeader.jsx';
import { ErrorState, LoadingState } from '../Common/StatusBlocks.jsx';
import { formatChf, formatKg } from '../Common/format.js';
import { BackpackGauge } from './BackpackGauge.jsx';
import './backpacks.css';

const USAGE_LABELS = { journee: 'Journée', weekend: 'Week-end', trek: 'Trek' };
const FOOD_VOLUME_L_PER_DAY = 2.5;
const CATEGORY_LABELS = { abri: 'Abri', couchage: 'Couchage', cuisine: 'Cuisine', eau: 'Eau', vetements: 'Vêtements', securite: 'Sécurité', navigation: 'Navigation', hygiene: 'Hygiène', divers: 'Divers' };
const SMALLEST_USEFUL_BAG_L = 20;

export function BackpacksPage() {
  const { state } = useLocation();
  const fromQuiz = state?.fromQuiz;
  const [brand, setBrand] = useState('');
  const [usage, setUsage] = useState('');
  const [durationDays, setDurationDays] = useState(fromQuiz?.durationDays ?? 1);
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [checked, setChecked] = useState(() => new Set(fromQuiz?.items.map((i) => i.key) ?? ['veste', 'polaire', 'pharmacie', 'gourde1l', 'creme', 'frontale', 'couverture']));
  const [advice, setAdvice] = useState(null);

  const bags = useApi((signal) => api.backpacks({ brand, usage }, signal), [brand, usage]);
  const allBags = useApi((signal) => api.backpacks({}, signal), []);
  const gear = useApi((signal) => api.gear(signal), []);
  const scope = useReveal([bags.data]);

  const brands = useMemo(() => [...new Set((allBags.data ?? []).map((b) => b.brand))], [allBags.data]);
  const selected = (allBags.data ?? []).find((b) => b.slug === selectedSlug) ?? null;
  const quizByKey = useMemo(() => new Map((fromQuiz?.items ?? []).map((i) => [i.key, i])), [fromQuiz]);

  const totals = useMemo(() => {
    let weightG = 0; let volumeL = 0;
    for (const item of gear.data ?? []) {
      if (!checked.has(item.key)) continue;
      const q = quizByKey.get(item.key); // quantités partagées issues du quiz
      weightG += q ? q.weightG : item.weightG;
      volumeL += q ? q.volumeL : item.volumeL;
    }
    volumeL += FOOD_VOLUME_L_PER_DAY * durationDays;
    weightG += fromQuiz?.foodWeightG ?? 700 * durationDays;
    return { weightG, volumeL: Math.round(volumeL * 10) / 10 };
  }, [gear.data, checked, durationDays, quizByKey, fromQuiz]);

  const fillPercent = selected ? Math.round((totals.volumeL / selected.volumeL) * 100) : 0;
  const toggle = (key) => setChecked((s) => { const n = new Set(s); n.has(key) ? n.delete(key) : n.add(key); return n; });
  const groups = useMemo(() => (gear.data ?? []).reduce((acc, i) => ((acc[i.category] ??= []).push(i), acc), {}), [gear.data]);

  async function askAdvice() {
    const res = await api.recommendBackpack({ gearVolumeL: totals.volumeL - FOOD_VOLUME_L_PER_DAY * durationDays, gearWeightG: totals.weightG, durationDays, brand: brand || undefined });
    setAdvice(res);
    if (res.recommendations[0]) setSelectedSlug(res.recommendations[0].backpack.slug);
  }

  return (
    <div className="pageContainer" ref={scope}>
      <PageHeader eyebrow="Mon sac" title="Composer mon sac" lede={fromQuiz ? 'Ta liste du quiz bivouac est déjà cochée. Choisis un sac pour voir s\'il suffit.' : 'Coche ce que tu emportes, choisis un sac, et vois s\'il est assez grand. Ou laisse BivySwiss te conseiller.'} />

      <div className="backpackBuilder">
        <section className="card backpackGearPicker" data-reveal>
          <div className="backpackBuilderHead">
            <h2>Contenu</h2>
            <label className="formField">Durée
              <select id="bagDays" value={durationDays} onChange={(e) => setDurationDays(Number(e.target.value))}>
                {[1, 2, 3, 4, 5].map((d) => <option key={d} value={d}>{d} jour{d > 1 ? 's' : ''}</option>)}
              </select>
            </label>
          </div>
          {gear.loading && <LoadingState />}
          {gear.error && <ErrorState error={gear.error} />}
          <div className="backpackGearGroups">
            {Object.entries(groups).map(([cat, items]) => (
              <fieldset key={cat} className="backpackGearGroup">
                <legend>{CATEGORY_LABELS[cat] ?? cat}</legend>
                {items.map((i) => (
                  <label key={i.key} className="formCheck">
                    <input type="checkbox" id={`bag-${i.key}`} checked={checked.has(i.key)} onChange={() => toggle(i.key)} />
                    <span>{i.name} <small>{i.volumeL} L · {i.weightG} g</small></span>
                  </label>
                ))}
              </fieldset>
            ))}
          </div>
        </section>

        <aside className="card backpackSummary" data-reveal>
          <h2>{selected ? `${selected.brand} ${selected.model}` : 'Aucun sac choisi'}</h2>
          <BackpackGauge percent={fillPercent} />
          <div className="statRow">
            <span><IconBox size={16} /> Volume <b>{totals.volumeL} L</b>{selected && <> / {selected.volumeL} L</>}</span>
            <span><IconScale size={16} /> Poids <b>{formatKg(totals.weightG + (selected?.weightG ?? 0))}</b></span>
          </div>
          <p className="backpackHint">Nourriture comptée : {FOOD_VOLUME_L_PER_DAY} L par jour. Eau non comptée (gourdes et poches à part).</p>
          {fillPercent > 100 && <p className="notice noticeDanger">Trop plein : choisis un sac plus grand ou allège la liste.</p>}
          {selected && selected.volumeL > SMALLEST_USEFUL_BAG_L && fillPercent > 0 && fillPercent < 55 && <p className="notice noticeWarn">Le sac sera à moitié vide : un modèle plus petit serait plus léger.</p>}
          <button type="button" className="buttonPrimary" onClick={askAdvice}><IconSparkles size={18} /> Conseille-moi un sac</button>
          {advice && <p className="backpackHint">Volume conseillé : <b>{advice.neededVolumeL} L</b> ({USAGE_LABELS[advice.usage]}). Meilleur choix sélectionné.</p>}
        </aside>
      </div>

      <section className="pageHeader" data-reveal><h2>Catalogue des sacs</h2></section>
      <div className="filterBar" data-reveal>
        <label className="formField">Marque
          <select id="bagBrand" value={brand} onChange={(e) => setBrand(e.target.value)}><option value="">Toutes</option>{brands.map((b) => <option key={b}>{b}</option>)}</select>
        </label>
        <label className="formField">Usage
          <select id="bagUsage" value={usage} onChange={(e) => setUsage(e.target.value)}><option value="">Tous</option>{Object.entries(USAGE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        </label>
      </div>
      {bags.error && <ErrorState error={bags.error} />}
      <div className="cardGrid">
        {(bags.data ?? []).map((b) => {
          const isSelected = b.slug === selectedSlug;
          const isAdvised = advice?.recommendations.some((r) => r.backpack.slug === b.slug);
          return (
            <article key={b.slug} className={`card backpackCard ${isSelected ? 'backpackCardSelected' : ''}`} data-reveal>
              <div className="hikeCardTop"><span className="chip">{USAGE_LABELS[b.usage]}</span>{isAdvised && <span className="chip"><IconSparkles size={14} /> Conseillé</span>}</div>
              <span className="pageHeaderEyebrow">{b.brand}</span>
              <h3>{b.model}</h3>
              <div className="statRow"><span><b>{b.volumeL} L</b></span><span><b>{formatKg(b.weightG)}</b></span><span>≈ <b>{formatChf(b.priceChf)}</b></span></div>
              <p className="backpackHint">{b.features.join(' · ')}</p>
              <button type="button" className={isSelected ? 'buttonPrimary' : 'buttonSecondary'} onClick={() => setSelectedSlug(b.slug)}>
                <IconBackpack size={18} /> {isSelected ? 'Sac choisi' : 'Choisir ce sac'}
              </button>
            </article>
          );
        })}
      </div>
      <p className="backpackHint">Poids et prix indicatifs d'après les fiches fabricants, à vérifier avant achat.</p>
    </div>
  );
}
