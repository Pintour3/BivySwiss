import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { IconArrowLeft, IconArrowRight, IconChecklist, IconRefresh } from '@tabler/icons-react';
import { api } from '../../api/apiClient.js';
import { useApi } from '../../hooks/useApi.js';
import { useReveal, finishAnimationSafely } from '../../hooks/useReveal.js';
import { PageHeader } from '../Common/PageHeader.jsx';
import { ErrorState, LoadingState } from '../Common/StatusBlocks.jsx';
import { QuizStep } from './QuizStep.jsx';
import { GearListResult } from './GearListResult.jsx';
import './quiz.css';

export function QuizPage() {
  const [params] = useSearchParams();
  const [answers, setAnswers] = useState(() => ({ durationDays: 2, groupSize: 'solo', groupCount: 4, shelter: 'tente', food: 'lyophilise', shareGear: true, hike: params.get('hike') ?? undefined, date: params.get('date') ?? undefined }));
  const [questions, setQuestions] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState({ busy: false, data: null, error: null });
  const { data: hikes } = useApi((signal) => api.hikes({}, signal), []);
  const stepRef = useRef(null);
  const scope = useReveal([result.data]);

  // Les questions affichées dépendent des réponses (ex. nombre de personnes seulement en groupe).
  useEffect(() => { api.quizQuestions(answers).then((d) => setQuestions(d.questions)).catch(() => {}); }, [answers]);

  const sortedHikes = useMemo(() => [...(hikes ?? [])].sort((a, b) => Number(b.bivouac?.suitable) - Number(a.bivouac?.suitable)), [hikes]);
  const current = questions[Math.min(stepIndex, questions.length - 1)];
  const isLast = stepIndex >= questions.length - 1;

  useEffect(() => {
    if (!stepRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const tween = gsap.fromTo(stepRef.current, { x: 24, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out' });
    return finishAnimationSafely(tween, 700);
  }, [stepIndex]);

  async function finish() {
    setResult({ busy: true, data: null, error: null });
    try { setResult({ busy: false, data: await api.quizResult(answers), error: null }); }
    catch (error) { setResult({ busy: false, data: null, error }); }
  }

  if (result.data) {
    return (
      <div className="pageContainer" ref={scope}>
        <PageHeader eyebrow="Bivouac" title="Ton sac est prêt" lede={result.data.summary.hike ? `Pour ${result.data.summary.hike.name}, ${result.data.summary.durationDays} jour(s).` : `Sortie de ${result.data.summary.durationDays} jour(s).`}>
          <button type="button" className="buttonSecondary" style={{ justifySelf: 'start' }} onClick={() => { setResult({ busy: false, data: null, error: null }); setStepIndex(0); }}><IconRefresh size={18} /> Refaire le quiz</button>
        </PageHeader>
        <GearListResult result={result.data} />
      </div>
    );
  }

  return (
    <div className="pageContainer" ref={scope}>
      <PageHeader eyebrow="Bivouac" title="Qu'est-ce que je prends ?" lede="Quelques questions, puis une liste de matériel adaptée à ton groupe, ton abri, tes repas et la météo prévue sur place." />
      {!current ? <LoadingState /> : (
        <div className="quizCard card" data-reveal>
          <div className="quizProgress" aria-hidden="true"><span style={{ width: `${((stepIndex + 1) / questions.length) * 100}%` }} /></div>
          <span className="pageHeaderEyebrow">Question {stepIndex + 1} sur {questions.length}</span>
          <div ref={stepRef} className="quizStep">
            <h2>{current.label}</h2>
            <QuizStep question={current} value={answers[current.id]} hikes={sortedHikes} onChange={(v) => setAnswers((a) => ({ ...a, [current.id]: v }))} />
          </div>
          {result.error && <ErrorState error={result.error} />}
          <div className="quizNav">
            <button type="button" className="buttonGhost" disabled={stepIndex === 0} onClick={() => setStepIndex((i) => i - 1)}><IconArrowLeft size={18} /> Retour</button>
            {isLast
              ? <button type="button" className="buttonPrimary" onClick={finish} disabled={result.busy}><IconChecklist size={18} /> {result.busy ? 'Calcul…' : 'Voir ma liste'}</button>
              : <button type="button" className="buttonPrimary" onClick={() => setStepIndex((i) => i + 1)}>Suivant <IconArrowRight size={18} /></button>}
          </div>
        </div>
      )}
    </div>
  );
}
