import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { finishAnimationSafely } from '../../hooks/useReveal.js';

/** Jauge de remplissage du sac, animée avec GSAP. */
export function BackpackGauge({ percent }) {
  const fill = useRef(null);
  const clamped = Math.min(percent, 100);
  const state = percent > 100 ? 'backpackGaugeOver' : percent > 90 ? 'backpackGaugeTight' : '';
  useGSAP(() => {
    const tween = gsap.to(fill.current, { height: `${clamped}%`, duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.6, ease: 'power2.out' });
    return finishAnimationSafely(tween, 900);
  }, { dependencies: [clamped] });
  return (
    <div className={`backpackGauge ${state}`} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label="Remplissage du sac">
      <svg viewBox="0 0 100 130" className="backpackGaugeShape" aria-hidden="true">
        <defs><clipPath id="bagClip"><path d="M20 30 Q20 18 32 18 H68 Q80 18 80 30 V118 Q80 124 74 124 H26 Q20 124 20 118 Z" /></clipPath></defs>
        <path d="M38 18 V10 Q38 4 44 4 H56 Q62 4 62 10 V18" className="backpackGaugeHandle" />
        <g clipPath="url(#bagClip)">
          <rect x="0" y="0" width="100" height="130" className="backpackGaugeEmpty" />
          <foreignObject x="0" y="0" width="100" height="130"><div className="backpackGaugeFillWrap"><div ref={fill} className="backpackGaugeFill" /></div></foreignObject>
        </g>
        <path d="M20 30 Q20 18 32 18 H68 Q80 18 80 30 V118 Q80 124 74 124 H26 Q20 124 20 118 Z" className="backpackGaugeOutline" />
      </svg>
      <span className="backpackGaugeValue">{percent} %</span>
    </div>
  );
}
