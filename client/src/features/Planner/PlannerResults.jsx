import { Link } from 'react-router-dom';
import { IconTrain, IconExternalLink, IconAlertTriangle, IconTent, IconCheck } from '@tabler/icons-react';
import { HikeCard } from '../Hikes/HikeCard.jsx';
import { formatChf, formatDuration, formatTime } from '../Common/format.js';

export function PlannerResults({ results, criteria }) {
  if (!results.length) return <p className="notice noticeWarn">Aucun itinéraire ne correspond. Essaie sans canton ou avec une autre durée.</p>;
  return (
    <div className="cardGrid">
      {results.map(({ hike, reasons, train, distanceFromHomeKm, totalDayMin, inSeason }) => (
        <HikeCard key={hike.slug} hike={hike}>
          <ul className="plannerReasons">
            {reasons.map((r) => <li key={r}><IconCheck size={16} /> {r}</li>)}
            {!inSeason && <li className="plannerReasonWarn"><IconAlertTriangle size={16} /> Hors saison idéale</li>}
            {criteria.transport === 'local' && <li>À {distanceFromHomeKm} km à vol d'oiseau</li>}
          </ul>
          {train && (
            <div className="plannerTrain">
              <div className="plannerTrainHead"><IconTrain size={18} /><b>{train.fareEstimateChf === 0 ? 'Inclus dans ton AG' : `≈ ${formatChf(train.fareEstimateChf)} aller-retour`}</b></div>
              {train.connections[0] ? (
                <p>Départ {formatTime(train.connections[0].departure)} → arrivée {formatTime(train.connections[0].arrival)} · {formatDuration(train.travelMinOneWay)} · {train.connections[0].transfers} changement{train.connections[0].transfers > 1 ? 's' : ''}</p>
              ) : <p>{train.error ?? 'Pas de connexion trouvée.'}</p>}
              {totalDayMin && <p>Journée complète : environ {formatDuration(totalDayMin)}</p>}
              {train.fareIsEstimate && <small>Prix estimé d'après la distance. Le prix exact est sur sbb.ch.</small>}
              <a href={train.sbbUrl} target="_blank" rel="noreferrer" className="buttonGhost">Horaire et billet CFF <IconExternalLink size={16} /></a>
            </div>
          )}
          <div className="plannerActions">
            <Link className="buttonSecondary" to={`/itineraires/${hike.slug}`}>Voir le tracé</Link>
            {criteria.durationDays >= 2 && <Link className="buttonPrimary" to={`/bivouac?hike=${hike.slug}${criteria.date ? `&date=${criteria.date}` : ''}`}><IconTent size={18} /> Préparer le bivouac</Link>}
          </div>
        </HikeCard>
      ))}
    </div>
  );
}
