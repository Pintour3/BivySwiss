import { IconBrandGoogle, IconMail } from '@tabler/icons-react';
import { PageHeader } from '../Common/PageHeader.jsx';
import { useAuth } from './AuthContext.jsx';
import { useReveal } from '../../hooks/useReveal.js';

export function LoginPage() {
  const { status } = useAuth();
  const scope = useReveal();
  return (
    <div className="pageContainer" ref={scope}>
      <PageHeader eyebrow="Compte" title="Se connecter" lede="La connexion arrive bientôt : elle permettra d'enregistrer ton point de départ, ton abonnement CFF, tes sacs et tes sorties." />
      <div className="card" style={{ maxWidth: 420 }} data-reveal>
        <button type="button" className="buttonSecondary" disabled><IconBrandGoogle size={20} /> Continuer avec Google</button>
        <button type="button" className="buttonSecondary" disabled><IconMail size={20} /> Continuer avec un email</button>
        <p className="pageHeaderLede" style={{ fontSize: '.9rem' }}>
          {status?.loginEnabled ? 'Connexion disponible.' : 'Pas encore activé sur ce serveur de développement.'}
        </p>
      </div>
    </div>
  );
}
