import { IconWalk, IconTrain, IconSearch } from '@tabler/icons-react';
import { CANTONS } from '../Common/format.js';

export function PlannerForm({ values, onChange, onSubmit, busy }) {
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  return (
    <form className="plannerForm card" onSubmit={(e) => { e.preventDefault(); onSubmit(); }} data-reveal>
      <label className="formField">Ton point de départ
        <input id="plannerHome" required value={values.home} onChange={set('home')} placeholder="ex. Lausanne, 1700 Fribourg" />
      </label>

      <fieldset className="plannerModes">
        <legend className="formField">Comment y aller ?</legend>
        <label className={`plannerMode ${values.transport === 'local' ? 'plannerModeActive' : ''}`}>
          <input type="radio" name="transport" value="local" checked={values.transport === 'local'} onChange={set('transport')} />
          <IconWalk size={22} /><span><b>Près de chez moi</b><small>dans un rayon d'environ 45 km</small></span>
        </label>
        <label className={`plannerMode ${values.transport === 'train' ? 'plannerModeActive' : ''}`}>
          <input type="radio" name="transport" value="train" checked={values.transport === 'train'} onChange={set('transport')} />
          <IconTrain size={22} /><span><b>En train CFF</b><small>horaires et prix estimé</small></span>
        </label>
      </fieldset>

      {values.transport === 'train' && (
        <div className="plannerRow">
          <label className="formCheck"><input id="plannerGa" type="checkbox" checked={values.hasGeneralAbonnement} onChange={set('hasGeneralAbonnement')} />J'ai l'abonnement général (AG)</label>
          {!values.hasGeneralAbonnement && <label className="formCheck"><input id="plannerHalf" type="checkbox" checked={values.hasHalfFare} onChange={set('hasHalfFare')} />J'ai le demi-tarif</label>}
        </div>
      )}

      <div className="plannerRow">
        <label className="formField">Temps de marche : {values.durationHours} h
          <input id="plannerHours" type="range" min="1" max="9" step="0.5" value={values.durationHours} onChange={set('durationHours')} />
        </label>
        <label className="formField">Durée de la sortie
          <select id="plannerDays" value={values.durationDays} onChange={set('durationDays')}>
            <option value="1">Une journée</option><option value="2">2 jours avec bivouac</option><option value="3">3 jours</option>
          </select>
        </label>
        <label className="formField">Date
          <input id="plannerDate" type="date" value={values.date} onChange={set('date')} />
        </label>
      </div>

      <div className="plannerRow">
        <label className="formField">Canton préféré
          <select id="plannerCanton" value={values.canton} onChange={set('canton')}>
            <option value="">Peu importe</option>{CANTONS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="formField">Ville préférée
          <input id="plannerCity" value={values.city} onChange={set('city')} placeholder="ex. Interlaken" />
        </label>
      </div>

      <button className="buttonPrimary" type="submit" disabled={busy}><IconSearch size={18} /> {busy ? 'Recherche…' : 'Trouver ma rando'}</button>
    </form>
  );
}
