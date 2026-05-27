import React from 'react'
import { motion } from 'framer-motion'
import ConfusionMatrixViz from '../components/metrics/ConfusionMatrixViz.jsx'
import MetricCard from '../components/metrics/MetricCard.jsx'

const CARDS = [
  { label: 'Accuracy',   value: 0.875, unit: '%', color: '#10b981', formula: '(3+4)/8',   delay: 0.5 },
  { label: 'Pureza',     value: 0.875, unit: '%', color: '#6366f1', formula: '(3+3+1)/8', delay: 0.65 },
  { label: 'Entropía N3',value: 1.0,   unit: '',  color: '#f59e0b', formula: '-2·(0.5·log₂0.5)', delay: 0.8 },
  { label: 'F1 Clase A', value: 0.857, unit: '',  color: '#818cf8', formula: '2·(1.0·0.75)/1.75',delay: 0.95 },
  { label: 'F1 Clase B', value: 0.889, unit: '',  color: '#a78bfa', formula: '2·(0.8·1.0)/1.8',  delay: 1.1 },
  { label: 'F1 Promedio',value: 0.873, unit: '',  color: '#c4b5fd', formula: '(0.857+0.889)/2',   delay: 1.25 },
]

export default function ExampleMetricsSlide() {
  return (
    <div className="w-full h-full flex flex-col justify-center px-12 pt-14 gap-5">
      <motion.h2 initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-black gradient-text">
        Ejemplo — Métricas Finales
      </motion.h2>

      <div className="grid grid-cols-2 gap-8 items-start">
        {/* Left: confusion matrix */}
        <div className="flex flex-col gap-3">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <ConfusionMatrixViz animate={true} />
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
            className="glass-card p-3 text-xs" style={{ borderLeft: '3px solid #f43f5e' }}>
            <span className="text-rose-400 font-bold">m7</span>: clase A → predicha B (N3 etiquetada B por empate).
            Es el único error del modelo.
          </motion.div>
        </div>

        {/* Right: metric cards */}
        <div className="grid grid-cols-2 gap-3">
          {CARDS.map(c => (
            <MetricCard key={c.label} {...c} />
          ))}
          {/* Dead neuron card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.35 }}
            className="glass-card p-4 col-span-2 flex items-center gap-3"
            style={{ borderTop: '3px solid #475569' }}>
            <span className="text-2xl">💀</span>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Neurona Muerta</p>
              <p className="text-sm font-bold text-slate-500">N4 — sin muestras asignadas</p>
              <p className="text-xs text-amber-500 mt-0.5">Reducir el mapa a 3 neuronas o reinicializar pesos.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
