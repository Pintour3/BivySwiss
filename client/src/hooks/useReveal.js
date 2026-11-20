import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

/**
 * Termine une animation de toute façon après un délai : si le navigateur suspend
 * requestAnimationFrame (onglet en arrière-plan), le contenu ne reste jamais invisible.
 */
export function finishAnimationSafely(animation, delayMs) {
  const timer = setTimeout(() => animation.progress(1), delayMs);
  return () => clearTimeout(timer);
}

/** Fait apparaître les éléments [data-reveal] d'un conteneur en cascade. */
export function useReveal(deps = []) {
  const scope = useRef(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tween = gsap.from('[data-reveal]', { y: 14, opacity: 0, duration: 0.5, ease: 'power2.out', stagger: 0.05, clearProps: 'all' });
      return finishAnimationSafely(tween, 1500);
    });
    return () => mm.revert();
  }, { scope, dependencies: deps, revertOnUpdate: true });
  return scope;
}
