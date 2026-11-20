// Carte swisstopo servie par notre API (tuiles en cache sur le serveur).
import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import './map.css';

const SWISS_CENTER = [46.8, 8.2];
const BASE_LAYERS = [
  { key: 'topo', label: 'Carte' },
  { key: 'aerial', label: 'Photo' },
];

function FitToRoute({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 1) map.fitBounds(positions, { padding: [30, 30] });
  }, [map, positions]);
  return null;
}

/**
 * @param {Array} routes  [{ id, coordinates: [[lon,lat]], waypoints?, highlighted? }]
 * @param {Array} markers [{ id, coordinates: [lon,lat], label, onClick }]
 */
export function SwissMap({ routes = [], markers = [], height = 420, showTrails = true }) {
  const [base, setBase] = useState('topo');
  const allPositions = useMemo(() => routes.flatMap((r) => r.coordinates.map(([lon, lat]) => [lat, lon])), [routes]);

  return (
    <div className="swissMap" style={{ height }}>
      <MapContainer center={SWISS_CENTER} zoom={8} minZoom={7} maxZoom={17} scrollWheelZoom className="swissMapCanvas"
        maxBounds={[[45.6, 5.6], [48.0, 10.8]]}>
        <TileLayer key={base} url={`/api/map/tiles/${base}/{z}/{x}/{y}`} attribution="© swisstopo" maxZoom={17} />
        {showTrails && <TileLayer url="/api/map/tiles/trails/{z}/{x}/{y}" maxZoom={17} opacity={0.8} />}
        {routes.map((r) => (
          <Polyline key={r.id} positions={r.coordinates.map(([lon, lat]) => [lat, lon])}
            pathOptions={{ color: '#1C2A24', weight: r.highlighted === false ? 3 : 5, opacity: 0.9 }} />
        ))}
        {routes.flatMap((r) => (r.waypoints ?? []).map((w, i) => (
          <CircleMarker key={`${r.id}-${i}`} center={[w.coordinates[1], w.coordinates[0]]} radius={5}
            pathOptions={{ color: '#FFFFFF', weight: 2, fillColor: '#2C3F37', fillOpacity: 1 }}>
            <Tooltip>{w.name}</Tooltip>
          </CircleMarker>
        )))}
        {markers.map((m) => (
          <CircleMarker key={m.id} center={[m.coordinates[1], m.coordinates[0]]} radius={7}
            pathOptions={{ color: '#FFFFFF', weight: 2, fillColor: '#2C3F37', fillOpacity: 1 }}
            eventHandlers={m.onClick ? { click: m.onClick } : undefined}>
            <Tooltip>{m.label}</Tooltip>
          </CircleMarker>
        ))}
        {allPositions.length > 1 && <FitToRoute positions={allPositions} />}
      </MapContainer>
      <div className="swissMapSwitch" role="group" aria-label="Fond de carte">
        {BASE_LAYERS.map((l) => (
          <button key={l.key} type="button" className={base === l.key ? 'swissMapSwitchActive' : ''} onClick={() => setBase(l.key)}>{l.label}</button>
        ))}
      </div>
    </div>
  );
}
