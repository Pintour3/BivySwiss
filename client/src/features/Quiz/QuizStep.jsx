import { useMemo, useRef } from 'react';
import gsap from 'gsap';
import { IconUser, IconUsers, IconUsersGroup, IconTent, IconTrees, IconStars, IconFlame, IconPackage, IconSalad, IconMountain, IconHeartHandshake, IconBackpack, IconCalendarEvent, IconMinus, IconPlus } from '@tabler/icons-react';
import { ChoiceCards } from '../Common/ChoiceCards.jsx';
import { sparkleFrom } from '../Common/particles.js';
import { formatDuration } from '../Common/format.js';

const OPTION_ICONS = {
  solo: IconUser, duo: IconUsers, groupe: IconUsersGroup,
  tente: IconTent, hamac: IconTrees, belleEtoile: IconStars,
  cuisiner: IconFlame, lyophilise: IconPackage, froid: IconSalad,
  true: IconHeartHandshake, false: IconBackpack,
};

const isoDate = (d) => d.toISOString().slice(0, 10);
function quickDates() {
  const now = new Date();
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
  const saturday = new Date(now); saturday.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7 || 7));
  const nextWeek = new Date(now); nextWeek.setDate(now.getDate() + 7);
  const fmt = (d) => d.toLocaleDateString('fr-CH', { weekday: 'long', day: 'numeric', month: 'long' });
  return [
    { value: isoDate(tomorrow), label: 'Demain', description: fmt(tomorrow) },
    { value: isoDate(saturday), label: 'Ce samedi', description: fmt(saturday) },
    { value: isoDate(nextWeek), label: 'Dans une semaine', description: fmt(nextWeek) },
  ];
}

function NumberStepper({ question, value, onChange }) {
  const display = useRef(null);
  const n = Number(value ?? question.default);
  const change = (delta, el) => {
    const next = Math.min(question.max, Math.max(question.min, n + delta));
    if (next === n) return;
    onChange(next);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.fromTo(display.current, { scale: 1.25, y: delta > 0 ? -6 : 6 }, { scale: 1, y: 0, duration: 0.4, ease: 'back.out(3)' });
      if (delta > 0) sparkleFrom(el, { count: 6 });
    }
  };
  const [one, many] = question.unit ?? ['', ''];
  return (
    <div className="quizStepper">
      <button type="button" className="quizStepperButton" onClick={(e) => change(-1, e.currentTarget)} disabled={n <= question.min} aria-label="Moins"><IconMinus size={26} /></button>
      <output ref={display} className="quizStepperValue" aria-live="polite">{n}<small>{n > 1 ? many : one}</small></output>
      <button type="button" className="quizStepperButton" onClick={(e) => change(1, e.currentTarget)} disabled={n >= question.max} aria-label="Plus"><IconPlus size={26} /></button>
    </div>
  );
}

export function QuizStep({ question, value, onChange, hikes }) {
  const onPicked = (el) => sparkleFrom(el, { count: 14 });
  const dates = useMemo(quickDates, []);

  if (question.type === 'choice' || question.type === 'boolean') {
    const options = question.options.map((o) => ({ ...o, icon: OPTION_ICONS[String(o.value)] }));
    return <ChoiceCards name={question.id} options={options} value={value} onChange={onChange} onPicked={onPicked} showShortcuts columns={options.length} />;
  }
  if (question.type === 'number') return <NumberStepper question={question} value={value} onChange={onChange} />;
  if (question.type === 'hike') {
    const options = hikes.map((h) => ({
      value: h.slug, icon: IconMountain, label: h.name,
      description: `${h.region} · ${h.difficulty} · ${formatDuration(h.durationMin)}${h.bivouac?.suitable ? ' · bivouac toléré' : ''}`,
    }));
    return <div className="quizScrollList"><ChoiceCards name="hike" layout="list" options={options} value={value} onChange={onChange} onPicked={onPicked} /></div>;
  }
  if (question.type === 'date') {
    const isCustom = value && !dates.some((d) => d.value === value);
    return (
      <div className="quizDate">
        <ChoiceCards name="date" options={dates.map((d) => ({ ...d, icon: IconCalendarEvent }))} value={value} onChange={onChange} onPicked={onPicked} showShortcuts columns={3} />
        <label className={`formField quizDateOther ${isCustom ? 'quizDateOtherActive' : ''}`}>Ou une autre date
          <input id="quizDate" type="date" min={isoDate(new Date())} value={value ?? ''} onChange={(e) => onChange(e.target.value || undefined)} />
        </label>
      </div>
    );
  }
  return null;
}
