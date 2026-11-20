import { Link, Outlet } from 'react-router-dom';
import { SiteHeader } from './SiteHeader.jsx';
import './layout.css';

export function AppLayout() {
  return (
    <div className="appShell">
      <SiteHeader />
      <main className="appMain"><Outlet /></main>
      <footer className="siteFooter">
        <div className="siteFooterInner">
          <span>BivySwiss · prototype de développement</span>
          <span>Cartes © swisstopo · Météo Open-Meteo · Horaires transport.opendata.ch · <Link to="/credits">Crédits photos</Link></span>
        </div>
      </footer>
    </div>
  );
}
