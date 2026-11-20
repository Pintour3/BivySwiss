import { IconUser, IconUsers, IconUsersGroup, IconTent, IconTrees, IconStars, IconFlame, IconPackage, IconSalad } from '@tabler/icons-react';

const OPTION_ICONS = {
  solo: IconUser, duo: IconUsers, groupe: IconUsersGroup,
  tente: IconTent, hamac: IconTrees, belleEtoile: IconStars,
  cuisiner: IconFlame, lyophilise: IconPackage, froid: IconSalad,
};

export function QuizStep({ question, value, onChange, hikes }) {
  if (question.type === 'choice') {
    return (
      <div className="quizChoices" role="radiogroup" aria-label={question.label}>
        {question.options.map((o) => {
          const Icon = OPTION_ICONS[o.value];
          return (
            <button key={o.value} type="button" role="radio" aria-checked={value === o.value}
              className={`quizChoice ${value === o.value ? 'quizChoiceActive' : ''}`} onClick={() => onChange(o.value)}>
              {Icon && <Icon size={34} stroke={1.5} />}<span>{o.label}</span>
            </button>
          );
        })}
      </div>
    );
  }
  if (question.type === 'number') {
    return (
      <div className="quizNumber">
        <button type="button" className="buttonSecondary" onClick={() => onChange(Math.max(question.min, Number(value) - 1))} aria-label="Moins">−</button>
        <output className="quizNumberValue">{value}</output>
        <button type="button" className="buttonSecondary" onClick={() => onChange(Math.min(question.max, Number(value) + 1))} aria-label="Plus">+</button>
      </div>
    );
  }
  if (question.type === 'boolean') {
    return (
      <div className="quizChoices">
        {[[true, 'Oui, on partage'], [false, 'Non, chacun son matériel']].map(([v, label]) => (
          <button key={label} type="button" className={`quizChoice ${value === v ? 'quizChoiceActive' : ''}`} onClick={() => onChange(v)}>{label}</button>
        ))}
      </div>
    );
  }
  if (question.type === 'hike') {
    return (
      <label className="formField">Itinéraire
        <select id="quizHike" value={value ?? ''} onChange={(e) => onChange(e.target.value || undefined)}>
          <option value="">Pas encore choisi</option>
          {hikes.map((h) => <option key={h.slug} value={h.slug}>{h.name} ({h.canton}{h.bivouac?.suitable ? ', bivouac toléré' : ''})</option>)}
        </select>
      </label>
    );
  }
  if (question.type === 'date') {
    return <label className="formField">Date de départ<input id="quizDate" type="date" value={value ?? ''} onChange={(e) => onChange(e.target.value)} /></label>;
  }
  return null;
}
