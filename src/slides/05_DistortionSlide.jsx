import React from 'react'
import { motion } from 'framer-motion'
import FormulaBlock from '../components/metrics/FormulaBlock.jsx'

const rows = [
  { metric: 'Error de Cuantización', scope: 'Solo BMU', weights: 'Igual (1)', objective: 'Representación', color: '#6366f1' },
  { metric: 'Medida de Distorsión', scope: 'Todas las neuronas', weights: 'h (vecindad)', objective: 'Función objetivo', color: '#8b5cf6' },
]

export default function DistortionSlide() {
  return (
    <div className="w-full h-full flex flex-col justify-center px-12 pt-14 gap-6">
      <motion.h2 initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-black gradient-text">
        Medida de Distorsión
      </motion.h2>

      <div className="grid grid-cols-2 gap-8">
        <FormulaBlock steps={[
          {
            label: 'Definición',
            color: '#8b5cf6',
            latex: 'D = \\sum_{i=1}^{N} \\sum_{j=1}^{K} h\\bigl(BMU(x_i),\\, j\\bigr) \\cdot \\|x_i - w_j\\|^2',
            delay: 0.2,
          },
          {
            label: 'Función de vecindad h',
            color: '#f59e0b',
            latex: 'h(r, j) = \\exp\\!\\left(-\\frac{d_{\\text{grid}}(r,j)^2}{2\\sigma^2}\\right)',
            text: 'Decae con la distancia en la cuadrícula. Neuronas lejanas tienen peso ≈ 0.',
            delay: 0.5,
          },
          {
            label: 'Clave',
            color: '#10b981',
            text: 'Es la función objetivo que el algoritmo SOM minimiza durante el entrenamiento. QE es un caso especial donde h=1 solo para el BMU.',
            delay: 0.8,
          },
        ]} />

        <div className="flex flex-col gap-4">
          {/* Neighborhood diagram */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}
            className="glass-card p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-3">Función h — decaimiento</p>
            <svg viewBox="0 0 280 120" className="w-full">
              {/* Gaussian curve */}
              <defs>
                <linearGradient id="gauss" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0"/>
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity="1"/>
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path d={`M 10,110 ${Array.from({length:27},(_,i)=>{
                const x=10+i*10; const t=(i-13)/4; const y=110-95*Math.exp(-t*t/2)
                return `L ${x},${y}`
              }).join(' ')} L 270,110`} fill="none" stroke="url(#gauss)" strokeWidth={2}/>
              <line x1={140} y1={15} x2={140} y2={110} stroke="rgba(99,102,241,0.4)" strokeDasharray="3,2" strokeWidth={1}/>
              <text x={140} y={12} textAnchor="middle" fill="#6366f1" fontSize={9} fontWeight="bold">BMU (h=1)</text>
              {[{x:100,h:'0.6'},{x:60,h:'0.1'},{x:180,h:'0.6'},{x:220,h:'0.1'}].map(({x,h},i)=>(
                <g key={i}>
                  <circle cx={x} cy={110-95*Math.exp(-Math.pow((x-140)/40,2)/2)} r={3} fill="#8b5cf6"/>
                  <text x={x} y={110-95*Math.exp(-Math.pow((x-140)/40,2)/2)-5} textAnchor="middle" fill="#a78bfa" fontSize={8}>h≈{h}</text>
                </g>
              ))}
              <line x1={10} y1={110} x2={270} y2={110} stroke="rgba(148,163,184,0.3)" strokeWidth={1}/>
              <text x={140} y={118} textAnchor="middle" fill="#94a3b8" fontSize={8}>distancia en cuadrícula →</text>
            </svg>
          </motion.div>

          {/* Comparison table */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
            className="glass-card p-4 overflow-x-auto">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">QE vs Distorsión</p>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500">
                  <th className="text-left pb-1">Métrica</th>
                  <th className="text-left pb-1">Alcance</th>
                  <th className="text-left pb-1">Pesos</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.metric} style={{ borderTop: '1px solid rgba(99,102,241,0.1)' }}>
                    <td className="py-1.5 font-semibold" style={{ color: r.color }}>{r.metric}</td>
                    <td className="py-1.5 text-slate-300">{r.scope}</td>
                    <td className="py-1.5 font-mono text-slate-400">{r.weights}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
