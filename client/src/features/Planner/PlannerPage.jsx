import { useState } from 'react';
import { api } from '../../api/apiClient.js';
import { useReveal } from '../../hooks/useReveal.js';
import { PageHeader } from '../Common/PageHeader.jsx';
import { ErrorState } from '../Common/StatusBlocks.jsx';
import { SwissMap } from '../Map/SwissMap.jsx';
import { PlannerForm } from './PlannerForm.jsx';
import { PlannerResults } from './PlannerResults.jsx';
import './planner.css';

const today = () => new Date(Date.now() + 86400000).toISOString().slice(0, 10);

export function PlannerPage() {
  const [values, setValues] = useState({ home: 'Lausanne', transport: 'train', hasGeneralAbonnement: false, hasHalfFare: true, durationHours: 4, durationDays: '1', canton: '', city: '', date: today() });
  const [state, setState] = useState({ busy: false, error: null, data: null });
  const scope = useReveal([state.data]);

  async function search() {
    setState({ busy: true, error: null, data: null });
    try {
      const data = await api.suggest({
        home: { name: values.home }, transport: values.transport,
        hasGeneralAbonnement: values.hasGeneralAbonnement, hasHalfFare: values.hasHalfFare,
        durationHours: Number(values.durationHours), durationDays: Number(values.durationDays),
        canton: values.canton || undefined, city: values.city || undefined, date: values.date || undefined, limit: 6,
      });
      setState({ busy: false, error: null, data });
    } catch (error) {
      setState({ busy: false, error, data: null });
    }
  }

  return (
    <div className="pageContainer" ref={scope}>
      <PageHeader eyebrow="Personnalisation" title="Planifier une rando" lede="Dis-nous d'où tu pars et combien de temps tu as. On te propose des itinéraires adaptés, avec le train si tu veux." />
      <div className="plannerLayout">
        <PlannerForm values={values} onChange={setValues} onSubmit={search} busy={state.busy} />
        <div className="plannerOutput">
          {state.error && <ErrorState error={state.error} />}
          {state.data ? (
            <>
              <SwissMap height={320} showTrails={false}
                markers={[{ id: 'home', coordinates: state.data.criteria.home.coordinates, label: `Départ : ${state.data.criteria.home.name}` },
                  ...state.data.results.map((r) => ({ id: r.hike.slug, coordinates: r.hike.startPoint.coordinates, label: r.hike.name }))]}
                routes={state.data.results.map((r) => ({ id: r.hike.slug, coordinates: [state.data.criteria.home.coordinates, r.hike.startPoint.coordinates], highlighted: false }))} />
              <PlannerResults results={state.data.results} criteria={state.data.criteria} />
            </>
          ) : !state.error && <p className="notice">Remplis le formulaire puis lance la recherche. Les horaires viennent de l'horaire officiel des transports publics suisses.</p>}
        </div>
      </div>
    </div>
  );
}
