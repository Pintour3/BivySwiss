import { IconSun, IconCloud, IconCloudRain, IconCloudStorm, IconSnowflake, IconCloudFog } from '@tabler/icons-react';
import { api } from '../../api/apiClient.js';
import { useApi } from '../../hooks/useApi.js';
import { LoadingState, ErrorState } from '../Common/StatusBlocks.jsx';

function WeatherIcon({ code, size = 26 }) {
  if (code >= 95) return <IconCloudStorm size={size} />;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return <IconSnowflake size={size} />;
  if (code >= 51) return <IconCloudRain size={size} />;
  if (code >= 45) return <IconCloudFog size={size} />;
  if (code >= 2) return <IconCloud size={size} />;
  return <IconSun size={size} />;
}

export function WeatherStrip({ slug }) {
  const { data, error, loading } = useApi((signal) => api.hikeWeather(slug, signal), [slug]);
  if (loading) return <LoadingState label="Prévisions…" />;
  if (error) return <ErrorState error={error} />;
  return (
    <div className="weatherStrip">
      {data.map((d) => (
        <div key={d.date} className={`weatherDay weatherDay_${d.verdict}`}>
          <span className="weatherDayDate">{new Date(d.date).toLocaleDateString('fr-CH', { weekday: 'short', day: 'numeric' })}</span>
          <WeatherIcon code={d.code} />
          <span className="weatherDayTemp">{Math.round(d.tempMin)}° / {Math.round(d.tempMax)}°</span>
          <span className="weatherDayRain">{d.rainProbability ?? 0} % pluie</span>
        </div>
      ))}
    </div>
  );
}
