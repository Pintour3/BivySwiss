// Petites particules animées avec GSAP (étincelles au choix, confettis à la fin du quiz).
// Rien ne s'affiche si l'utilisateur préfère réduire les animations.
import gsap from 'gsap';

const COLORS = ['#9BAF4C', '#B7C96B', '#2C3F37', '#E8C547', '#FFFFFF'];
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function layer() {
  let el = document.getElementById('particleLayer');
  if (!el) {
    el = document.createElement('div');
    el.id = 'particleLayer';
    el.setAttribute('aria-hidden', 'true');
    Object.assign(el.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '3000', overflow: 'hidden' });
    document.body.appendChild(el);
  }
  return el;
}

function spawn(x, y, { count, spread, distance, size, duration, gravity, shapes }) {
  if (reducedMotion()) return;
  const host = layer();
  for (let i = 0; i < count; i += 1) {
    const p = document.createElement('span');
    const s = size * (0.6 + Math.random() * 0.8);
    const isStrip = shapes === 'confetti' && Math.random() > 0.4;
    Object.assign(p.style, {
      position: 'absolute', left: `${x}px`, top: `${y}px`,
      width: `${isStrip ? s * 0.5 : s}px`, height: `${isStrip ? s * 1.4 : s}px`,
      borderRadius: isStrip ? '2px' : '50%', background: COLORS[Math.floor(Math.random() * COLORS.length)],
      boxShadow: '0 0 0 1px rgba(28,42,36,.08)', transform: 'translate(-50%, -50%)',
    });
    host.appendChild(p);
    const angle = (-90 + (Math.random() - 0.5) * spread) * (Math.PI / 180);
    const dist = distance * (0.4 + Math.random() * 0.6);
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    const tl = gsap.timeline({ onComplete: () => p.remove() });
    tl.to(p, { x: dx, y: dy, rotation: (Math.random() - 0.5) * 540, duration: duration * 0.45, ease: 'power2.out' })
      .to(p, { y: dy + gravity, x: dx * 1.15, opacity: 0, duration: duration * 0.55, ease: 'power1.in' });
    setTimeout(() => p.remove(), duration * 1000 + 600); // nettoyage même si l'animation est suspendue
  }
}

const centerOf = (el) => {
  const r = el.getBoundingClientRect();
  return [r.left + r.width / 2, r.top + r.height / 2];
};

/** Petite gerbe d'étincelles depuis un élément (choix sélectionné, bout de la barre). */
export function sparkleFrom(el, { count = 12, at } = {}) {
  if (!el) return;
  const [x, y] = at ?? centerOf(el);
  spawn(x, y, { count, spread: 220, distance: 70, size: 8, duration: 0.8, gravity: 40 });
}

/** Confettis qui partent du bas de l'écran (fin du quiz). */
export function confetti() {
  const w = window.innerWidth; const h = window.innerHeight;
  spawn(w * 0.2, h, { count: 45, spread: 50, distance: h * 0.8, size: 10, duration: 1.8, gravity: 200, shapes: 'confetti' });
  spawn(w * 0.8, h, { count: 45, spread: 50, distance: h * 0.8, size: 10, duration: 1.8, gravity: 200, shapes: 'confetti' });
}
