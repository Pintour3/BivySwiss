import { Link, useParams } from 'react-router-dom';
import { IconArrowLeft, IconClock, IconRuler2, IconTrendingUp, IconTrendingDown, IconMountain, IconTrain, IconTent, IconDroplet, IconCalendar } from '@tabler/icons-react';
import { api } from '../../api/apiClient.js';
import { useApi } from '../../hooks/useApi.js';
import { useReveal } from '../../hooks/useReveal.js';
import { LoadingState, ErrorState } from '../Common/StatusBlocks.jsx';
import { DIFFICULTY_LABELS, formatDuration } from '../Common/format.js';
import { SwissMap } from '../Map/SwissMap.jsx';
import { ExportButtons } from './ExportButtons.jsx';
import { WeatherStrip } from './WeatherStrip.jsx';
import './hikes.css';

const MONTHS = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sep', 'oct', 'nov', 'déc'];

export function HikeDetailPage() {
  const { slug } = useParams();
  const { data: hike, error, loading } = useApi((signal) => api.hike(slug, signal), [slug]);
  const scope = useReveal([hike]);
  if (loading) return <div className="pageContainer"><LoadingState /></div>;
  if (error) return <div className="pageContainer"><ErrorState error={error} /></div>;

  return (
    <div className="pageContainer" ref={scope}>
      <Link to="/itineraires" className="buttonGhost" style={{ justifySelf: 'start' }}><IconArrowLeft size={18} /> Tous les itinéraires</Link>
      <header className="pageHeader" data-reveal>
        <span className="pageHeaderEyebrow">{hike.region} · {hike.canton}</span>
        <h1>{hike.name}</h1>
        <p className="pageHeaderLede">{hike.description}</p>
      </header>
      <div className="hikeDetailGrid">
        <div className="hikeDetailMap" data-reveal>
          <SwissMap routes={[{ id: hike.slug, coordinates: hike.route.coordinates, waypoints: hike.waypoints }]} height={460} />
          <p className="hikeDetailNote">Tracé simplifié par points de passage. Suis le balisage officiel sur le terrain.</p>
        </div>
        <aside className="hikeDetailFacts" data-reveal>
          <dl className="factList">
            <div><dt><IconMountain size={18} /> Difficulté</dt><dd>{DIFFICULTY_LABELS[hike.difficulty]}</dd></div>
            <div><dt><IconRuler2 size={18} /> Distance</dt><dd>{hike.distanceKm} km {hike.isLoop ? '(boucle)' : ''}</dd></div>
            <div><dt><IconTrendingUp size={18} /> Montée</dt><dd>{hike.ascentM} m</dd></div>
            <div><dt><IconTrendingDown size={18} /> Descente</dt><dd>{hike.descentM} m</dd></div>
            <div><dt><IconClock size={18} /> Durée</dt><dd>{formatDuration(hike.durationMin)}</dd></div>
            <div><dt><IconMountain size={18} /> Point haut</dt><dd>{hike.maxAltitudeM} m</dd></div>
            <div><dt><IconTrain size={18} /> Départ</dt><dd>{hike.startStation.name}</dd></div>
            {hike.endStation && <div><dt><IconTrain size={18} /> Arrivée</dt><dd>{hike.endStation.name}</dd></div>}
            <div><dt><IconCalendar size={18} /> Saison</dt><dd>{hike.bestMonths.map((m) => MONTHS[m - 1]).join(', ')}</dd></div>
          </dl>
          <div className={`notice ${hike.bivouac?.suitable ? '' : 'noticeWarn'}`}>
            <IconTent size={20} />
            <div><b>{hike.bivouac?.suitable ? 'Bivouac toléré' : 'Bivouac déconseillé'}</b><br />{hike.bivouac?.notes}
              {hike.bivouac?.waterSources && <><br /><IconDroplet size={14} /> Sources d'eau sur le parcours.</>}
              <br /><small>Règles indicatives : vérifie auprès de la commune ou du canton.</small>
            </div>
          </div>
          <ExportButtons links={hike.exportLinks} />
          <Link className="buttonPrimary" to={`/bivouac?hike=${hike.slug}`}><IconTent size={18} /> Préparer mon sac pour cette rando</Link>
        </aside>
      </div>
      <section className="pageHeader" data-reveal>
        <h2>Météo sur place</h2>
        <WeatherStrip slug={hike.slug} />
      </section>
    </div>
  );
}
