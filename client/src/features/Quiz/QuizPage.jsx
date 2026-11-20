import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { IconX, IconArrowLeft, IconRefresh } from '@tabler/icons-react';
import { api } from '../../api/apiClient.js';
import { useApi } from '../../hooks/useApi.js';
import { useReveal, finishAnimationSafely } from '../../hooks/useReveal.js';
import { PageHeader } from '../Common/PageHeader.jsx';
import { ErrorState, LoadingState } from '../Common/StatusBlocks.jsx';
import { confetti } from '../Common/particles.js';
import { QuizStep } from './QuizStep.jsx';
import { QuizProgressBar } from './QuizProgressBar.jsx';
import { GearListResult } from './GearListResult.jsx';
import './quiz.css';

const CHEERS = ['Bien vu !', 'Parfait', 'Noté !', 'Super choix', 'On avance !', 'Presque fini'];

export function QuizPage() {
  const [params] = useSearchParams();
  const [answers, setAnswers] = useState(() => ({ durationDays: 2, groupCount: 4, hike: params.get('hike') ?? undefined, date: params.get('date') ?? undefined }));
  const [questions, setQuestions] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [cheer, setCheer] = useState(null);
  const [result, setResult] = useState({ busy: false, data: null, error: null });
  const { data: hikes } = useApi((signal) => api.hikes({}, signal), []);
  const stepRef = useRef(null);
  const direction = useRef(1);
  const scope = useReveal([result.data]);

  // Les questions affichées dépendent des réponses (ex. nombre de personnes seulement en groupe).
  useEffect(() => { api.quizQuestions(answers).then((d) => setQuestions(d.questions)).catch(() => {}); }, [answers]);

  const sortedHikes = useMemo(() => [...(hikes ?? [])].sort((a, b) => Number(b.bivouac?.suitable) - Number(a.bivouac?.suitable) || a.name.localeCompare(b.name)), [hikes]);
  const current = questions[Math.min(stepIndex, questions.length - 1)];
  const isLast = stepIndex >= questions.length - 1;
  const value = current ? answers[current.id] : undefined;
  const answered = current && (current.type === 'number' || current.optional || value !== undefined);

  useEffect(() => {
    if (!stepRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const tween = gsap.fromTo(stepRef.current, { x: 40 * direction.current, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: 'power3.out' });
    return finishAnimationSafely(tween, 800);
  }, [stepIndex]);

  const finish = useCallback(async () => {
    setResult({ busy: true, data: null, error: null });
    try {
      const data = await api.quizResult(answers);
      setResult({ busy: false, data, error: null });
      window.scrollTo({ top: 0 });
      setTimeout(confetti, 150);
    } catch (error) { setResult({ busy: false, data: null, error }); }
  }, [answers]);

  const next = useCallback(() => {
    if (!answered) return;
    if (isLast) { finish(); return; }
    direction.current = 1;
    setCheer(CHEERS[stepIndex % CHEERS.length]);
    setStepIndex((i) => i + 1);
  }, [answered, isLast, finish, stepIndex]);

  const back = () => { direction.current = -1; setCheer(null); setStepIndex((i) => Math.max(0, i - 1)); };

  // Raccourcis clavier façon Duolingo : 1, 2, 3 pour choisir, Entrée pour continuer.
  useEffect(() => {
    if (result.data || !current) return undefined;
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' && e.target.type !== 'radio') return;
      if (e.key === 'Enter') { e.preventDefault(); next(); return; }
      const n = Number(e.key);
      const options = current.type === 'date' ? null : current.options;
      if (options && n >= 1 && n <= options.length) {
        document.getElementById(`${current.id}-${String(options[n - 1].value)}`)?.click();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, next, result.data]);

  if (result.data) {
    return (
      <div className="pageContainer" ref={scope}>
        <PageHeader eyebrow="Bivouac" title="Ton sac est prêt !" lede={result.data.summary.hike ? `Pour ${result.data.summary.hike.name}, ${result.data.summary.durationDays} jour(s).` : `Sortie de ${result.data.summary.durationDays} jour(s).`}>
          <button type="button" className="buttonSecondary" style={{ justifySelf: 'start' }} onClick={() => { setResult({ busy: false, data: null, error: null }); setStepIndex(0); setCheer(null); }}><IconRefresh size={18} /> Refaire le quiz</button>
        </PageHeader>
        <GearListResult result={result.data} />
      </div>
    );
  }

  return (
    <div className="quizShell">
      <div className="quizTop">
        <Link to="/" className="quizClose" aria-label="Quitter le quiz"><IconX size={26} /></Link>
        <QuizProgressBar value={stepIndex + (answered ? 0.5 : 0)} max={Math.max(questions.length, 1)} message={cheer} />
      </div>

      <main className="quizBody">
        {!current ? <LoadingState /> : (
          <div ref={stepRef} className="quizStep">
            <span className="quizEyebrow">Préparer mon bivouac · {stepIndex + 1}/{questions.length}</span>
            <h1 className="quizQuestion">{current.label}</h1>
            {current.hint && <p className="quizHint">{current.hint}</p>}
            <QuizStep question={current} value={value} hikes={sortedHikes} onChange={(v) => setAnswers((a) => ({ ...a, [current.id]: v }))} />
            {result.error && <ErrorState error={result.error} />}
          </div>
        )}
      </main>

      <footer className={`quizFooter ${answered ? 'quizFooterReady' : ''}`}>
        <div className="quizFooterInner">
          <button type="button" className="buttonGhost" onClick={back} disabled={stepIndex === 0}><IconArrowLeft size={18} /> Retour</button>
          <button type="button" className="quizContinue" onClick={next} disabled={!answered || result.busy}>
            {result.busy ? 'Calcul…' : isLast ? 'Voir ma liste' : current?.optional && value === undefined ? 'Passer' : 'Continuer'}
          </button>
        </div>
      </footer>
    </div>
  );
}
