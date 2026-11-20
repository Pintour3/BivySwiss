import { Link } from 'react-router-dom';
import { PageHeader } from './PageHeader.jsx';

export function NotFoundPage() {
  return (
    <div className="pageContainer">
      <PageHeader eyebrow="Erreur 404" title="Sentier introuvable" lede="Cette page n'existe pas, ou plus." />
      <Link className="buttonPrimary" to="/" style={{ justifySelf: 'start' }}>Revenir à l'accueil</Link>
    </div>
  );
}
