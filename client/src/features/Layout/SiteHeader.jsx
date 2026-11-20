import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { IconMenu2, IconX, IconUserCircle } from '@tabler/icons-react';
import { Logo } from './Logo.jsx';

const LINKS = [
  { to: '/itineraires', label: 'Itinéraires' },
  { to: '/planifier', label: 'Planifier' },
  { to: '/bivouac', label: 'Bivouac' },
  { to: '/sacs', label: 'Mon sac' },
  { to: '/recettes', label: 'Recettes' },
  { to: '/plats', label: 'Plats' },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="siteHeader">
      <div className="siteHeaderInner">
        <Link to="/" className="siteBrand" onClick={() => setOpen(false)}>
          <Logo size={34} />
          <span className="siteBrandName">BivySwiss</span>
        </Link>
        <button type="button" className="siteMenuToggle" aria-expanded={open} aria-controls="siteNav" onClick={() => setOpen((o) => !o)}>
          {open ? <IconX size={22} /> : <IconMenu2 size={22} />}
          <span className="visuallyHidden">Menu</span>
        </button>
        <nav id="siteNav" className={`siteNav ${open ? 'siteNavOpen' : ''}`}>
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `siteNavLink ${isActive ? 'siteNavLinkActive' : ''}`} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
          <NavLink to="/connexion" className="siteNavLink siteNavAccount" onClick={() => setOpen(false)}>
            <IconUserCircle size={20} /> Compte
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
