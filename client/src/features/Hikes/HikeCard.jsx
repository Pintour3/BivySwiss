import { Link } from 'react-router-dom';
import { IconClock, IconRuler2, IconTrendingUp, IconTent, IconMapPin } from '@tabler/icons-react';
import { formatDuration } from '../Common/format.js';

export function HikeCard({ hike, children }) {
  return (
    <article className="card hikeCard" data-reveal>
      <div className="hikeCardTop">
        <span className="chip">{hike.difficulty}</span>
        <span className="chipOutline chip">{hike.canton}</span>
        {hike.multiDay && <span className="chip">2 jours</span>}
        {hike.bivouac?.suitable && <span className="chip"><IconTent size={14} /> Bivouac</span>}
      </div>
      <h3><Link to={`/itineraires/${hike.slug}`} className="hikeCardLink">{hike.name}</Link></h3>
      <p className="hikeCardRegion"><IconMapPin size={16} /> {hike.region}</p>
      <div className="statRow">
        <span><IconRuler2 size={16} /><b>{hike.distanceKm} km</b></span>
        <span><IconTrendingUp size={16} /><b>+{hike.ascentM} m</b></span>
        <span><IconClock size={16} /><b>{formatDuration(hike.durationMin)}</b></span>
      </div>
      {children}
    </article>
  );
}
