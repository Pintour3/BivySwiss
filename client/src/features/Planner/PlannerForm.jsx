import { IconWalk, IconTrain, IconSearch, IconSun, IconTent, IconBackpack } from '@tabler/icons-react';
import { ChoiceCards } from '../Common/ChoiceCards.jsx';
import { sparkleFrom } from '../Common/particles.js';
import { CANTONS } from '../Common/format.js';

export function PlannerForm({ values, onChange, onSubmit, busy }) {
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  return (
    <form className="plannerForm card" onSubmit={(e) => { e.preventDefault(); onSubmit(); }} data-reveal>
      <label className="formField">Ton point de départ
        <input id="plannerHome" required value={values.home} onChange={set('home')} placeholder="ex. Lausanne, 1700 Fribourg" />
      </label>

      <div className="formField">Comment y aller ?
        <ChoiceCards name="transport" layout="list" value={values.transport} onChange={(v) => onChange({ ...values, transport: v })} onPicked={(el) => sparkleFrom(el, { count: 8 })}
          options={[
            { value: 'local', icon: IconWalk, label: 'Près de chez moi', description: 'Dans un rayon d\'environ 45 km' },
            { value: 'train', icon: IconTrain, label: 'En train CFF', description: 'Horaires réels et prix estimé' },
          ]} />
      </div>

      {values.transport === 'train' && (
        <div className="plannerRow">
          <label className="formCheck"><input id="plannerGa" type="checkbox" checked={values.hasGeneralAbonnement} onChange={set('hasGeneralAbonnement')} />J'ai l'abonnement général (AG)</label>
          {!values.hasGeneralAbonnement && <label className="formCheck"><input id="plannerHalf" type="checkbox" checked={values.hasHalfFare} onChange={set('hasHalfFare')} />J'ai le demi-tarif</label>}
        </div>
      )}

      <div className="formField">Durée de la sortie
        <ChoiceCards name="durationDays" columns={3} value={values.durationDays} onChange={(v) => onChange({ ...values, durationDays: v })} onPicked={(el) => sparkleFrom(el, { count: 8 })}
          options={[
            { value: '1', icon: IconSun, label: '1 jour', description: 'Aller-retour' },
            { value: '2', icon: IconTent, label: '2 jours', description: 'Une nuit en bivouac' },
            { value: '3', icon: IconBackpack, label: '3 jours', description: 'Petit trek' },
          ]} />
      </div>

      <div className="plannerRow">
        <label className="formField">Temps de marche : {values.durationHours} h
          <input id="plannerHours" type="range" min="1" max="9" step="0.5" value={values.durationHours} onChange={set('durationHours')} />
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
