// Cartes de choix à la Airbnb : grande zone cliquable, icône, titre, sous-titre,
// bordure épaisse et coche quand c'est sélectionné. Ce sont de vrais boutons radio (clavier OK).
import { useRef } from 'react';
import gsap from 'gsap';
import { IconCircleCheckFilled } from '@tabler/icons-react';
import './choiceCards.css';

export function ChoiceCards({ name, options, value, onChange, columns, layout = 'grid', onPicked, showShortcuts = false }) {
  const refs = useRef({});
  function pick(option) {
    const el = refs.current[option.value];
    if (el && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.fromTo(el, { scale: 0.96 }, { scale: 1, duration: 0.45, ease: 'back.out(3)', clearProps: 'transform' });
    }
    onChange(option.value);
    onPicked?.(el);
  }
  return (
    <div className={`choiceCards choiceCards_${layout}`} role="radiogroup" style={columns ? { '--choiceColumns': columns } : undefined}>
      {options.map((o, i) => {
        const Icon = o.icon;
        const selected = value === o.value;
        const id = `${name}-${String(o.value)}`;
        return (
          <label key={String(o.value)} htmlFor={id} ref={(el) => { refs.current[o.value] = el; }} className={`choiceCard ${selected ? 'choiceCardSelected' : ''}`}>
            <input type="radio" id={id} name={name} checked={selected} onChange={() => pick(o)} className="choiceCardInput" />
            {o.image ? <img className="choiceCardImage" src={o.image} alt="" loading="lazy" /> : Icon && <Icon size={layout === 'list' ? 26 : 32} stroke={1.5} className="choiceCardIcon" />}
            <span className="choiceCardText">
              <span className="choiceCardTitle">{o.label}</span>
              {o.description && <span className="choiceCardDescription">{o.description}</span>}
            </span>
            {showShortcuts && <kbd className="choiceCardKey">{i + 1}</kbd>}
            <IconCircleCheckFilled size={22} className="choiceCardCheck" aria-hidden="true" />
          </label>
        );
      })}
    </div>
  );
}
