import React, { useState, useEffect, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import NeuralBackground    from './components/ui/NeuralBackground.jsx'

import TitleSlide            from './slides/01_TitleSlide.jsx'
import ContextSlide          from './slides/02_ContextSlide.jsx'
import MetricsMapSlide       from './slides/03_MetricsMapSlide.jsx'
import QESlide               from './slides/04_QESlide.jsx'
import DistortionSlide       from './slides/05_DistortionSlide.jsx'
import TopographicErrorSlide from './slides/06_TopographicErrorSlide.jsx'
import TopographicProductSlide from './slides/07_TopographicProductSlide.jsx'
import ClassificationFlowSlide from './slides/08_ClassificationFlowSlide.jsx'
import PurityEntropySlide    from './slides/09_PurityEntropySlide.jsx'
import ConfusionMatrixSlide  from './slides/10_ConfusionMatrixSlide.jsx'
import ExampleDataSlide      from './slides/11_ExampleDataSlide.jsx'
import ExampleBMUSlide       from './slides/12_ExampleBMUSlide.jsx'
import ExampleQESlide        from './slides/13_ExampleQESlide.jsx'
import ExampleLabelingSlide  from './slides/14_ExampleLabelingSlide.jsx'
import ExampleMetricsSlide   from './slides/15_ExampleMetricsSlide.jsx'
import ConclusionSlide       from './slides/16_ConclusionSlide.jsx'
import SOMTrainerSlide       from './slides/17_SOMTrainerSlide.jsx'

/* ── Slide registry ──────────────────────────────────────────────────────── */
const SLIDES = [
  { component: TitleSlide,              title: 'Introducción',           part: null },
  { component: ContextSlide,            title: '¿Por qué evaluar?',      part: 1 },
  { component: MetricsMapSlide,         title: 'Mapa de métricas',       part: 1 },
  { component: QESlide,                 title: 'Error de Cuantización',  part: 2 },
  { component: DistortionSlide,         title: 'Medida de Distorsión',   part: 2 },
  { component: TopographicErrorSlide,   title: 'Error Topográfico',      part: 2 },
  { component: TopographicProductSlide, title: 'Producto Topográfico',   part: 2 },
  { component: ClassificationFlowSlide, title: 'Flujo de Clasificación', part: 2 },
  { component: PurityEntropySlide,      title: 'Pureza y Entropía',      part: 2 },
  { component: ConfusionMatrixSlide,    title: 'Matriz de Confusión',    part: 2 },
  { component: ExampleDataSlide,        title: 'Ejemplo — Dataset',      part: 3 },
  { component: ExampleBMUSlide,         title: 'Ejemplo — BMU',          part: 3 },
  { component: ExampleQESlide,          title: 'Ejemplo — QE',           part: 3 },
  { component: ExampleLabelingSlide,    title: 'Ejemplo — Etiquetado',   part: 3 },
  { component: ExampleMetricsSlide,     title: 'Ejemplo — Métricas',     part: 3 },
  { component: SOMTrainerSlide,         title: 'Demo en Vivo',           part: 3 },
  { component: ConclusionSlide,         title: 'Conclusiones',           part: null },
]

const PART_COLORS = { 1: '#6366f1', 2: '#8b5cf6', 3: '#f59e0b' }
const PART_LABELS = { 1: 'Parte 1 — Contexto', 2: 'Parte 2 — Métricas', 3: 'Parte 3 — Ejemplo' }

/* ── Presenter notes (one per slide) ────────────────────────────────────── */
const NOTES = [
  'Slide 1 · Presentarse. Tema: métricas de evaluación de Redes de Kohonen (SOM). El SOM es no supervisado — necesita sus propias métricas.',
  'Slide 2 · ¿Por qué métricas especiales? El SOM no tiene función de pérdida estándar. Necesitamos medir calidad de representación Y preservación topológica.',
  'Slide 3 · Señalar las dos ramas. IZQUIERDA: métricas propias (siempre calculables). DERECHA: métricas de clasificación (requieren etiquetas).',
  'Slide 4 · QE = promedio de distancias muestra→BMU. Mostrar fórmula: QE = (1/N) Σ ‖xᵢ − w_BMU‖. Valor bajo = buena representación.',
  'Slide 5 · Distorsión = función objetivo del SOM. Usa pesos h (Gaussiana) para todas las neuronas, no solo BMU. Es lo que el algoritmo minimiza.',
  'Slide 6 · Error Topográfico: si BMU₁ y BMU₂ no son adyacentes, t=1. Señalar diagrama: N1↔N4 son diagonales, NO adyacentes. TE=0 es perfecto.',
  'Slide 7 · Producto Topográfico: más sofisticado, evalúa k vecinos. P=0 ideal, P<0 mapa pequeño, P>0 mapa grande. Uso principalmente en investigación.',
  'Slide 8 · Pipeline completo: entrenar → BMU → etiquetar neuronas → predecir → métricas. Señalar cada paso. Solo con etiquetas conocidas.',
  'Slide 9 · Pureza = porcentaje correcto, Entropía = mezcla por neurona. H=0 pura, H=1 máxima mezcla. Señalar N3 con empate A:B.',
  'Slide 10 · Matriz de confusión: VP/VN son aciertos, FP/FN son errores. De aquí salen Accuracy, Precisión, Recall, F1. La clase predicha = etiqueta BMU.',
  'Slide 11 · Dataset de ejemplo: 8 muestras, 2D, 2 clases, SOM 2×2. N4 es neurona muerta — nunca ganó como BMU. Señalar la distribución.',
  'Slide 12 · Interactivo: pasar cada muestra y encontrar BMU. Usar botones paso a paso. Observar distancias en barras. m7 cae en N3.',
  'Slide 13 · QE del ejemplo: suma de distancias = 0.690, dividida entre N=8 → QE=0.086. Valor bajo, representación buena.',
  'Slide 14 · Etiquetado: voto mayoritario. N1=A pura, N2=B pura, N3=empate (convención B), N4=muerta. m7 quedará mal clasificada.',
  'Slide 15 · Resultados: Accuracy 87.5%, F1 promedio 0.873. Solo 1 error: m7 (A clasificada como B por N3). N4 sugiere reducir el mapa.',
  'Slide 16 · Demo en vivo. Cambiar dataset, cuadrícula y velocidad. Observar cómo QE baja y σ decae. El mapa aprende la estructura de los datos.',
  'Slide 17 · Conclusión: Sin etiquetas → QE + TE. Tamaño del mapa → Producto Topográfico. Clasificación → Pureza + F1 + Confusión.',
]

/* ── Fade + blur slide transition ─────────────────────────────────────────── */
const variants = {
  enter: (dir) => ({
    opacity: 0,
    y:       dir > 0 ? 18 : -18,
    scale:   0.97,
    filter:  'blur(10px)',
  }),
  center: {
    opacity: 1,
    y:       0,
    scale:   1,
    filter:  'blur(0px)',
    transition: { duration: 0.48, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: (dir) => ({
    opacity: 0,
    y:       dir > 0 ? -18 : 18,
    scale:   1.02,
    filter:  'blur(10px)',
    transition: { duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

/* ── Web Audio navigation tone ───────────────────────────────────────────── */
function playNavTone(forward = true) {
  try {
    const ac  = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ac.createOscillator()
    const g   = ac.createGain()
    osc.connect(g); g.connect(ac.destination)
    osc.type = 'sine'
    const baseFreq = forward ? 820 : 640
    osc.frequency.setValueAtTime(baseFreq, ac.currentTime)
    osc.frequency.exponentialRampToValueAtTime(forward ? 620 : 880, ac.currentTime + 0.12)
    g.gain.setValueAtTime(0.07, ac.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.2)
    osc.start(); osc.stop(ac.currentTime + 0.22)
  } catch (_) { /* AudioContext unavailable */ }
}

/* ── Progress ring ───────────────────────────────────────────────────────── */
const RING_R    = 14
const RING_CIRC = 2 * Math.PI * RING_R

function ProgressRing({ current, total }) {
  const pct = (current + 1) / total
  return (
    <svg width={38} height={38} style={{ display: 'block' }}>
      {/* track */}
      <circle cx={19} cy={19} r={RING_R}
        fill="none" stroke="rgba(99,102,241,0.18)" strokeWidth={2.5} />
      {/* progress arc — separate <g> for the SVG rotate so Framer Motion doesn't conflict */}
      <g transform="rotate(-90 19 19)">
        <motion.circle cx={19} cy={19} r={RING_R}
          fill="none" stroke="#6366f1" strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray={RING_CIRC}
          initial={false}
          animate={{ strokeDashoffset: RING_CIRC * (1 - pct) }}
          transition={{ duration: 0.4 }}
        />
      </g>
      {/* counter */}
      <text x={19} y={23} textAnchor="middle"
        fill="#6366f1" fontSize={7.5} fontWeight="700" fontFamily="monospace">
        {current + 1}/{total}
      </text>
    </svg>
  )
}

/* ── Main App ─────────────────────────────────────────────────────────────── */
export default function App() {
  const [current,       setCurrent]       = useState(0)
  const [direction,     setDirection]     = useState(1)
  const [laserOn,       setLaserOn]       = useState(false)
  const [presenterMode, setPresenterMode] = useState(false)

  const laserDotRef = useRef(null)

  /* navigation */
  const goTo = useCallback((idx, dir) => {
    if (idx < 0 || idx >= SLIDES.length) return
    const d = dir ?? (idx > current ? 1 : -1)
    setDirection(d)
    setCurrent(idx)
    playNavTone(d > 0)
  }, [current])

  /* keyboard */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goTo(current + 1, 1) }
      if (e.key === 'ArrowLeft')                                          goTo(current - 1, -1)
      if (e.key === 'l' || e.key === 'L') setLaserOn(prev => !prev)
      if (e.key === 'p' || e.key === 'P') setPresenterMode(prev => !prev)
      if (e.key === 'Escape') { setLaserOn(false); setPresenterMode(false) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current, goTo])

  /* laser cursor style */
  useEffect(() => {
    document.body.style.cursor = laserOn ? 'none' : ''
    return () => { document.body.style.cursor = '' }
  }, [laserOn])

  /* laser dot — direct DOM update for 60fps smoothness */
  const onMouseMove = useCallback((e) => {
    if (laserDotRef.current) {
      laserDotRef.current.style.left = e.clientX + 'px'
      laserDotRef.current.style.top  = e.clientY + 'px'
    }
  }, [])

  const slide     = SLIDES[current]
  const SlideComp = slide.component

  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{ background: '#04040f' }}
      onMouseMove={onMouseMove}
    >
      {/* ── Neural particle background (all slides) ── */}
      <NeuralBackground />

      {/* ── Slide area ── */}
      <AnimatePresence custom={direction} mode="popLayout">
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-x-0 top-0"
          style={{ zIndex: 10, bottom: '46px' }}
        >
          <SlideComp />
        </motion.div>
      </AnimatePresence>

      {/* ── Part badge — top left ── */}
      {slide.part && (
        <motion.div
          key={`part-${current}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 left-5 z-50 text-xs font-bold px-3 py-1 rounded-full"
          style={{
            background: `${PART_COLORS[slide.part]}20`,
            color:       PART_COLORS[slide.part],
            border:      `1px solid ${PART_COLORS[slide.part]}50`,
          }}
        >
          {PART_LABELS[slide.part]}
        </motion.div>
      )}

      {/* ── Progress ring — top right ── */}
      <div className="absolute top-3 right-4 z-50">
        <ProgressRing current={current} total={SLIDES.length} />
      </div>

      {/* ── Slide title — bottom left ── */}
      <div className="absolute bottom-5 left-5 z-50 text-xs text-slate-600 truncate max-w-xs">
        {slide.title}
      </div>

      {/* ── Keyboard hints — bottom right ── */}
      <div className="absolute bottom-5 right-5 z-50 text-xs text-slate-700 flex gap-3">
        <span title="Laser pointer (L)">L: 🔴</span>
        <span title="Presenter mode (P)">P: 📋</span>
      </div>

      {/* ── Navigation arrows ── */}
      {current > 0 && (
        <button
          onClick={() => goTo(current - 1, -1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-50 w-8 h-8 flex items-center justify-center rounded-full text-slate-600 hover:text-slate-300 transition-colors"
          style={{ background: 'rgba(13,13,43,0.6)' }}
        >‹</button>
      )}
      {current < SLIDES.length - 1 && (
        <button
          onClick={() => goTo(current + 1, 1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-50 w-8 h-8 flex items-center justify-center rounded-full text-slate-600 hover:text-slate-300 transition-colors"
          style={{ background: 'rgba(13,13,43,0.6)' }}
        >›</button>
      )}

      {/* ── Progress bar — bottom ── */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 z-50"
        style={{ background: 'rgba(99,102,241,0.1)' }}>
        <motion.div
          className="h-full"
          style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
          animate={{ width: `${((current + 1) / SLIDES.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* ── Dot nav — bottom center ── */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-50 flex gap-1">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width:      i === current ? 16 : 5,
              height:     5,
              background: i === current ? '#6366f1'
                        : i < current  ? '#8b5cf650'
                        : '#1e1e4d',
            }}
          />
        ))}
      </div>

      {/* ── Laser dot ── */}
      <div
        ref={laserDotRef}
        style={{
          position:      'fixed',
          display:       laserOn ? 'block' : 'none',
          left:          0, top: 0,
          width:         18, height: 18,
          borderRadius:  '50%',
          background:    'rgba(255,38,38,0.92)',
          boxShadow:     '0 0 0 4px rgba(255,0,0,0.28), 0 0 18px 6px rgba(255,0,0,0.42)',
          transform:     'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex:        9999,
        }}
      />

      {/* ── Presenter mode overlay ── */}
      <AnimatePresence>
        {presenterMode && (
          <motion.div
            key="presenter"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 z-[9998] w-full max-w-3xl px-6"
            style={{ pointerEvents: 'none' }}
          >
            <div
              className="rounded-2xl px-6 py-4 shadow-2xl"
              style={{
                background: 'rgba(4,4,15,0.95)',
                border:     '1px solid rgba(99,102,241,0.4)',
                backdropFilter: 'blur(14px)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-indigo-400 font-bold uppercase tracking-widest">
                  📋 Notas — {slide.title}
                </span>
                <span className="ml-auto text-xs font-mono text-slate-600">
                  {current + 1} / {SLIDES.length}
                </span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                {NOTES[current]}
              </p>
              {current < SLIDES.length - 1 && (
                <p className="text-xs text-slate-600 mt-2">
                  Siguiente → <span className="text-slate-500">{SLIDES[current + 1].title}</span>
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
