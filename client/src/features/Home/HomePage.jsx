import { useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { IconRoute, IconTent, IconBackpack, IconTrain, IconToolsKitchen2, IconArrowRight } from '@tabler/icons-react';
import { finishAnimationSafely } from '../../hooks/useReveal.js';
import './home.css';

const ENTRIES = [
  { to: '/planifier', icon: IconTrain, title: 'Planifier une rando', text: 'Près de chez toi ou en train CFF, selon ta durée, ton canton et ton abonnement.' },
  { to: '/bivouac', icon: IconTent, title: 'Préparer un bivouac', text: 'Un quiz rapide pour la liste de matériel, l\'eau à porter et la météo sur place.' },
  { to: '/sacs', icon: IconBackpack, title: 'Composer mon sac', text: 'Choisis un sac Mammut, Arc\'teryx ou Decathlon et vois s\'il suffit.' },
  { to: '/itineraires', icon: IconRoute, title: 'Itinéraires', text: 'Tracés sur la carte nationale, exportables vers Google Maps ou Apple Plans.' },
  { to: '/recettes', icon: IconToolsKitchen2, title: 'Cuisine de bivouac', text: 'Recettes à une casserole et plats à emporter.' },
];

export function HomePage() {
  const scope = useRef(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const ridge = scope.current.querySelector('.homeRidgeLine');
      const length = ridge.getTotalLength();
      const timeline = gsap.timeline();
      timeline
        .fromTo(ridge, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' })
        .from('.homeRidgeStar', { scale: 0, transformOrigin: 'center', duration: 0.4, ease: 'back.out(3)' }, '-=0.3')
        .from('.homeHeroText > *', { y: 16, opacity: 0, stagger: 0.08, duration: 0.5, clearProps: 'all' }, 0.2)
        .from('.homeEntry', { y: 18, opacity: 0, stagger: 0.06, duration: 0.45, clearProps: 'all' }, 0.6);
      return finishAnimationSafely(timeline, 2500);
    });
    return () => mm.revert();
  }, { scope });

  return (
    <div ref={scope}>
      <section className="homeHero">
        <div className="homeHeroInner">
          <div className="homeHeroText">
            <span className="pageHeaderEyebrow">Randonnée et bivouac en Suisse</span>
            <h1 className="homeTitle">Pars léger.<br />Dors là-haut.</h1>
            <p className="homeLede">BivySwiss choisit ton itinéraire, ton train et le contenu de ton sac, selon la météo prévue sur place.</p>
            <div className="homeActions">
              <Link to="/planifier" className="buttonPrimary">Trouver une rando <IconArrowRight size={18} /></Link>
              <Link to="/bivouac" className="buttonSecondary">Préparer un bivouac</Link>
            </div>
          </div>
          <svg className="homeRidge" viewBox="0 0 600 220" aria-hidden="true">
            <path className="homeRidgeLine" d="M0 200 L70 150 L110 168 L190 70 L235 110 L300 30 L360 120 L400 95 L470 160 L520 130 L600 190" />
            <path className="homeRidgeTent" d="M270 200 L300 152 L330 200 Z" />
            <circle className="homeRidgeStar" cx="470" cy="50" r="6" />
          </svg>
        </div>
      </section>
      <section className="pageContainer">
        <div className="homeEntries">
          {ENTRIES.map(({ to, icon: Icon, title, text }) => (
            <Link key={to} to={to} className="homeEntry">
              <Icon size={28} stroke={1.6} className="homeEntryIcon" />
              <h3>{title}</h3>
              <p>{text}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
