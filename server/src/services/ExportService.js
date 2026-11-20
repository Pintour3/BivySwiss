// Export d'un itinéraire : fichier GPX et liens Google Maps / Apple Maps.
const escapeXml = (s = '') => String(s).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
const latLon = ([lon, lat]) => `${lat},${lon}`;

export class ExportService {
  static toGpx(hike) {
    const wpts = (hike.waypoints ?? []).map((w) => `  <wpt lat="${w.coordinates[1]}" lon="${w.coordinates[0]}"><name>${escapeXml(w.name)}</name></wpt>`).join('\n');
    const trkpts = hike.route.coordinates.map(([lon, lat]) => `      <trkpt lat="${lat}" lon="${lon}"/>`).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="BivySwiss" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata><name>${escapeXml(hike.name)}</name><desc>${escapeXml(hike.description)}</desc></metadata>
${wpts}
  <trk>
    <name>${escapeXml(hike.name)}</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>
`;
  }

  /** Google Maps : itinéraire à pied avec jusqu'à 8 étapes intermédiaires. */
  static googleMapsUrl(hike) {
    const coords = hike.route.coordinates;
    const params = new URLSearchParams({
      api: '1',
      origin: latLon(coords[0]),
      destination: latLon(coords[coords.length - 1]),
      travelmode: 'walking',
    });
    const middle = coords.slice(1, -1);
    if (middle.length) params.set('waypoints', ExportService.sample(middle, 8).map(latLon).join('|'));
    return `https://www.google.com/maps/dir/?${params}`;
  }

  /** Apple Maps : départ et arrivée seulement (pas d'étapes dans les liens Apple). */
  static appleMapsUrl(hike) {
    const coords = hike.route.coordinates;
    const isLoop = hike.isLoop && coords.length > 2;
    // Pour une boucle, on vise le point le plus éloigné (le but de la rando).
    const target = isLoop ? coords[Math.floor(coords.length / 2)] : coords[coords.length - 1];
    const params = new URLSearchParams({ saddr: latLon(coords[0]), daddr: latLon(target), dirflg: 'w' });
    return `https://maps.apple.com/?${params}`;
  }

  static sample(list, max) {
    if (list.length <= max) return list;
    const step = list.length / max;
    return Array.from({ length: max }, (_, i) => list[Math.floor(i * step)]);
  }

  static links(hike) {
    return { googleMaps: ExportService.googleMapsUrl(hike), appleMaps: ExportService.appleMapsUrl(hike), gpx: `/api/hikes/${hike.slug}/export.gpx` };
  }
}
