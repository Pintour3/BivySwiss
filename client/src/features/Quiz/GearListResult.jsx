import { Link } from 'react-router-dom';
import { IconDroplet, IconAlertTriangle, IconBackpack, IconScale, IconToolsKitchen2, IconCloud, IconUsers } from '@tabler/icons-react';
import { formatKg } from '../Common/format.js';
import { PhotoThumb } from '../Common/PhotoThumb.jsx';

const CATEGORY_LABELS = { abri: 'Abri', couchage: 'Couchage', cuisine: 'Cuisine', eau: 'Eau', vetements: 'Vêtements', securite: 'Sécurité', navigation: 'Navigation', hygiene: 'Hygiène', divers: 'Divers' };

export function GearListResult({ result }) {
  const byCategory = result.items.reduce((acc, item) => ((acc[item.category] ??= []).push(item), acc), {});
  return (
    <div className="quizResult">
      {result.warnings.map((w) => <p key={w} className="notice noticeWarn" data-reveal><IconAlertTriangle size={20} /> {w}</p>)}

      <div className="quizSummary" data-reveal>
        <div className="quizSummaryTile"><IconScale size={22} /><span>Poids porté</span><b>{formatKg(result.totals.totalWeightG)}</b><small>dont {result.water.toCarryL} L d'eau</small></div>
        <div className="quizSummaryTile"><IconDroplet size={22} /><span>Eau à porter</span><b>{result.water.toCarryL} L</b><small>besoin total {result.water.totalNeedL} L</small></div>
        <div className="quizSummaryTile"><IconBackpack size={22} /><span>Sac conseillé</span><b>{result.backpack.neededVolumeL} L</b><small>matériel {result.totals.gearVolumeL} L</small></div>
        <div className="quizSummaryTile"><IconUsers size={22} /><span>Groupe</span><b>{result.summary.people} pers.</b><small>{result.summary.shared ? 'matériel commun partagé' : 'matériel individuel'}</small></div>
      </div>

      <p className="notice" data-reveal><IconDroplet size={20} /> {result.water.reason}{result.water.hot ? ' Il fera chaud : on a ajouté 40 %.' : ''}</p>

      {result.forecast && (
        <div className="notice" data-reveal><IconCloud size={20} />
          <div>{result.forecast.map((d) => <div key={d.date}><b>{new Date(d.date).toLocaleDateString('fr-CH', { weekday: 'long', day: 'numeric', month: 'long' })}</b> : {d.label}, {Math.round(d.tempMin)}° à {Math.round(d.tempMax)}°, {d.rainProbability ?? 0} % de pluie (météo {d.verdict}).</div>)}</div>
        </div>
      )}

      <section className="quizGear" data-reveal>
        <h2>Ta liste de matériel</h2>
        <div className="quizGearColumns">
          {Object.entries(byCategory).map(([cat, items]) => (
            <div key={cat} className="quizGearGroup">
              <h3>{CATEGORY_LABELS[cat] ?? cat}</h3>
              <ul>
                {items.map((i) => (
                  <li key={i.key}>
                    <label className="formCheck"><input type="checkbox" id={`gear-${i.key}`} />
                      <PhotoThumb url={i.imageUrl} alt="" category={i.category} size="small" />
                      <span><b>{i.quantity > 1 ? `${i.quantity} × ` : ''}{i.name}</b>{i.shared && <span className="chip chipOutline">partagé</span>}<small>{i.reason} · {i.weightG} g</small></span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="pageHeader" data-reveal>
        <h2><IconToolsKitchen2 size={26} /> Repas proposés</h2>
        <ul className="quizFood">{result.foodPlan.map((f) => (
          <li key={f.slug} className="quizFoodItem">
            <PhotoThumb url={f.imageUrl} alt="" size="medium" />
            <span><Link to={f.type === 'recette' ? '/recettes' : '/plats'}>{f.name}</Link><small>{f.type === 'recette' ? 'Recette' : 'Plat à emporter'} · {f.weightG} g</small></span>
          </li>
        ))}</ul>
      </section>

      <section className="pageHeader" data-reveal>
        <h2>Sacs qui conviennent</h2>
        <div className="cardGrid">
          {result.backpack.recommendations.map(({ backpack, fillPercent }) => (
            <div key={backpack.slug} className="card">
              <span className="pageHeaderEyebrow">{backpack.brand}</span>
              <h3>{backpack.model}</h3>
              <div className="statRow"><span><b>{backpack.volumeL} L</b></span><span><b>{formatKg(backpack.weightG)}</b> à vide</span><span>rempli à <b>{fillPercent} %</b></span></div>
            </div>
          ))}
        </div>
        <Link className="buttonPrimary" style={{ justifySelf: 'start' }} to="/sacs" state={{ fromQuiz: { items: result.items, durationDays: result.summary.durationDays, foodWeightG: result.totals.foodWeightG } }}>
          <IconBackpack size={18} /> Composer mon sac avec cette liste
        </Link>
      </section>
    </div>
  );
}
