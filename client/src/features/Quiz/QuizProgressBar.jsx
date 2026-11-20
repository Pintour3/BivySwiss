// Barre de progression façon Duolingo : épaisse, arrondie, reflet clair,
// rebond quand elle avance et étincelles au bout de la barre.
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { sparkleFrom } from '../Common/particles.js';

export function QuizProgressBar({ value, max, message }) {
  const fill = useRef(null);
  const bubble = useRef(null);
  const previous = useRef(value);
  const percent = Math.max(4, (value / max) * 100);

  useEffect(() => {
    const grew = value > previous.current;
    previous.current = value;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tween = gsap.to(fill.current, { width: `${percent}%`, duration: reduce ? 0 : 0.8, ease: 'elastic.out(1, 0.65)' });
    const timer = setTimeout(() => tween.progress(1), 1200);
    if (grew && !reduce) {
      const r = fill.current.getBoundingClientRect();
      setTimeout(() => sparkleFrom(fill.current, { count: 10, at: [r.left + (r.width * 0) + fill.current.parentElement.getBoundingClientRect().width * (percent / 100), r.top + r.height / 2] }), 250);
      if (bubble.current) gsap.fromTo(bubble.current, { y: 8, opacity: 0, scale: 0.8 }, { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(3)' });
    }
    return () => clearTimeout(timer);
  }, [value, percent]);

  return (
    <div className="quizBar">
      <div className="quizBarTrack" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label="Progression du quiz">
        <div ref={fill} className="quizBarFill" style={{ width: `${percent}%` }}><span className="quizBarShine" /></div>
      </div>
      {message && <span ref={bubble} key={message} className="quizBarBubble">{message}</span>}
    </div>
  );
}
