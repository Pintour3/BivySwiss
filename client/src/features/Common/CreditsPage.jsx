import { api } from '../../api/apiClient.js';
import { useApi } from '../../hooks/useApi.js';
import { useReveal } from '../../hooks/useReveal.js';
import { PageHeader } from './PageHeader.jsx';
import { ErrorState, LoadingState } from './StatusBlocks.jsx';
import { PhotoThumb } from './PhotoThumb.jsx';

export function CreditsPage() {
  const { data, error, loading } = useApi(() => api.imageCredits(), []);
  const scope = useReveal([data]);
  return (
    <div className="pageContainer" ref={scope}>
      <PageHeader eyebrow="Mentions" title="Crédits photos" lede="Les photos viennent de Wikimedia Commons, sous licence libre. Merci à leurs auteurs." />
      {loading && <LoadingState />}
      {error && <ErrorState error={error} />}
      <ul className="creditsList">
        {(data ?? []).map((c) => (
          <li key={c.key} className="creditsItem">
            <PhotoThumb url={c.url} alt="" size="small" />
            <span><b>{c.author}</b> · {c.licenseUrl ? <a href={c.licenseUrl} target="_blank" rel="noreferrer">{c.license}</a> : c.license}<br />
              <a href={c.sourceUrl} target="_blank" rel="noreferrer">{c.file.replace('File:', '')}</a></span>
          </li>
        ))}
      </ul>
    </div>
  );
}
