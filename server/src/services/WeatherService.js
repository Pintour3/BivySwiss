// Prévisions météo via Open-Meteo (gratuit, sans clé). Prévision jusqu'à 16 jours.
import { HttpClient } from './HttpClient.js';

const WEATHER_LABELS = {
  0: 'Ciel dégagé', 1: 'Plutôt dégagé', 2: 'Partiellement nuageux', 3: 'Couvert',
  45: 'Brouillard', 48: 'Brouillard givrant', 51: 'Bruine légère', 53: 'Bruine', 55: 'Bruine forte',
  56: 'Bruine verglaçante', 57: 'Bruine verglaçante forte', 61: 'Pluie faible', 63: 'Pluie', 65: 'Pluie forte', 66: 'Pluie verglaçante', 67: 'Pluie verglaçante forte', 71: 'Neige faible', 73: 'Neige', 75: 'Neige forte', 77: 'Grains de neige',
  80: 'Averses', 81: 'Averses fortes', 82: 'Averses violentes', 85: 'Averses de neige', 86: 'Averses de neige fortes', 95: 'Orage', 96: 'Orage avec grêle', 99: 'Orage violent',
};

export class WeatherService {
  constructor(httpClient = new HttpClient({ cacheTtlMs: 30 * 60 * 1000 })) {
    this.httpClient = httpClient;
  }

  async dailyForecast([lon, lat], { days = 16 } = {}) {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.search = new URLSearchParams({
      latitude: lat.toFixed(4), longitude: lon.toFixed(4), timezone: 'Europe/Zurich', forecast_days: String(days),
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max',
    });
    const data = await this.httpClient.getJson(url.toString());
    const d = data.daily;
    return d.time.map((date, i) => WeatherService.summarize({
      date,
      code: d.weather_code[i],
      tempMax: d.temperature_2m_max[i],
      tempMin: d.temperature_2m_min[i],
      rainProbability: d.precipitation_probability_max[i],
      rainMm: d.precipitation_sum[i],
      windMax: d.wind_speed_10m_max[i],
    }));
  }

  /** Prévision pour une période donnée ; null si la date est trop lointaine. */
  async forecastForTrip(coordinates, startDate, durationDays = 1) {
    const all = await this.dailyForecast(coordinates);
    const start = all.findIndex((day) => day.date === startDate);
    if (start === -1) return null;
    return all.slice(start, start + durationDays);
  }

  static summarize(day) {
    const label = WEATHER_LABELS[day.code] ?? 'Variable';
    const isStorm = day.code >= 95;
    const isWet = (day.rainProbability ?? 0) >= 50 || (day.rainMm ?? 0) >= 2;
    const isCold = (day.tempMin ?? 10) <= 3;
    const isHot = (day.tempMax ?? 0) >= 26;
    const isWindy = (day.windMax ?? 0) >= 40;
    const isSnow = [71, 73, 75, 77, 85, 86].includes(day.code);
    let verdict = 'bonne';
    if (isWet || isCold || isWindy) verdict = 'moyenne';
    if (isStorm || isSnow || (day.rainProbability ?? 0) >= 80) verdict = 'mauvaise';
    return { ...day, label, flags: { isStorm, isWet, isCold, isHot, isWindy, isSnow }, verdict };
  }
}
