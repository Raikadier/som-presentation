import React from 'react'
import { motion } from 'framer-motion'
import FormulaBlock from '../components/metrics/FormulaBlock.jsx'

const NEURONS = [
  { id: 'N1', color: '#10b981', a: 3, b: 0, H: 0, label: 'A' },
  { id: 'N2', color: '#f43f5e', a: 0, b: 3, H: 0, label: 'B' },
  { id: 'N3', color: '#f59e0b', a: 1, b: 1, H: 1.0, label: 'B*', warn: true },
]

function NeuronMini({ n, delay }) {
  const total = n.a + n.b
  const pA = n.a / total, pB = n.b / total
  return (
    <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.45, type: 'spring' }}
      className="glass-card p-3 flex flex-col gap-2"
      style={{ borderTop: `3px solid ${n.color}` }}>
      <div className="flex justify-between items-center">
        <span className="font-black text-lg" style={{ color: n.color }}>{n.id}</span>
        <span className="text-xs px-2 py-0.5 rounded-full font-bold"
          style={{ background: `${n.color}20`, color: n.color }}>
          {n.warn ? '⚠️ Empate' : `Clase ${n.label}`}
        </span>
      </div>
      <div className="flex gap-1 text-xs text-slate-400">
        <span style={{ color: '#10b981' }}>A: {n.a}</span>
        <span className="text-slate-600">·</span>
        <span style={{ color: '#f43f5e' }}>B: {n.b}</span>
      </div>
      {/* Bar */}
      <div className="h-2 rounded-full overflow-hidden flex" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pA * 100}%` }}
          transition={{ delay: delay + 0.2, duration: 0.5 }} style={{ background: '#10b981' }}/>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pB * 100}%` }}
          transition={{ delay: delay + 0.35, duration: 0.5 }} style={{ background: '#f43f5e' }}/>
      </div>
      <div className="text-xs flex justify-between">
        <span className="text-slate-500">H =</span>
        <span className="font-bold font-mono" style={{ color: n.H === 1.0 ? '#f59e0b' : '#10b981' }}>
          {n.H}{n.H === 1.0 ? ' ← máxima' : ' ← pura'}
        </span>
      </div>
    </motion.div>
  )
}

export default function PurityEntropySlide() {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-14 gap-5">
      <motion.h2 initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-black gradient-text">
        Pureza y Entropía
      </motion.h2>

      <div className="grid grid-cols-2 gap-8">
        <FormulaBlock steps={[
          {
            label: 'Pureza global',
            color: '#10b981',
            latex: 'Purity = \\dfrac{1}{N} \\sum_{j} \\max_{k} |C_k \\cap \\text{cluster}_j|',
            text: '% de muestras correctamente representadas. Máximo por neurona.',
            delay: 0.2,
          },
          {
            label: 'Entropía por neurona',
            color: '#f59e0b',
            latex: 'H_j = -\\sum_{c} p(c|j) \\log_2 p(c|j)',
            text: 'Mide la mezcla de clases en una neurona. H=0 → pura. H=1 → mezcla máxima (2 clases).',
            delay: 0.5,
          },
          {
            label: 'Relación',
            color: '#8b5cf6',
            items: [
              { symbol: 'H = 0', text: '→ neurona pura (una sola clase)', color: '#10b981' },
              { symbol: 'H = 1', text: '→ neurona con máxima incertidumbre (50/50)', color: '#f43f5e' },
              { symbol: '↑ Pureza', text: '→ ↓ Entropía promedio (inversamente relacionados)', color: '#8b5cf6' },
            ],
            delay: 0.8,
          },
        ]} />

        <div className="flex flex-col gap-3">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Neuronas del ejemplo</p>
          {NEURONS.map((n, i) => <NeuronMini key={n.id} n={n} delay={0.3 + i * 0.15} />)}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
            className="glass-card p-3 text-center" style={{ borderTop: '2px solid #10b981' }}>
            <span className="text-sm text-slate-300">Pureza global = </span>
            <span className="text-xl font-black" style={{ color: '#10b981' }}>87.5%</span>
            <span className="text-xs text-slate-500 block mt-0.5">(3 + 3 + 1) / 8 = 7/8</span>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
