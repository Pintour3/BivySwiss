// Outils géographiques simples (WGS84).
export class GeoUtils {
  static EARTH_RADIUS_KM = 6371;

  static toRad(deg) { return (deg * Math.PI) / 180; }

  /** Distance à vol d'oiseau entre deux points [lon, lat], en km. */
  static haversineKm([lon1, lat1], [lon2, lat2]) {
    const dLat = GeoUtils.toRad(lat2 - lat1);
    const dLon = GeoUtils.toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2
      + Math.cos(GeoUtils.toRad(lat1)) * Math.cos(GeoUtils.toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * GeoUtils.EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
  }

  /** Longueur d'une ligne [[lon, lat], ...] en km. */
  static lineLengthKm(coordinates) {
    let total = 0;
    for (let i = 1; i < coordinates.length; i += 1) {
      total += GeoUtils.haversineKm(coordinates[i - 1], coordinates[i]);
    }
    return total;
  }

  /** Conversion lon/lat vers indices de tuile Web Mercator (XYZ). */
  static lonLatToTile(lon, lat, zoom) {
    const n = 2 ** zoom;
    const x = Math.floor(((lon + 180) / 360) * n);
    const latRad = GeoUtils.toRad(lat);
    const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);
    return { x, y };
  }
}
