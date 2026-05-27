import React from 'react'
import { motion } from 'framer-motion'
import { samples, neurons } from '../data/somData.js'

export default function ExampleQESlide() {
  const total = samples.reduce((s, m) => s + m.dist, 0)
  const qe = (total / samples.length).toFixed(3)

  return (
    <div className="w-full h-full flex flex-col justify-center px-12 pt-14 gap-5">
      <motion.h2 initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-black gradient-text">
        Ejemplo — Cálculo de QE
      </motion.h2>
      <div className="grid grid-cols-2 gap-8">
        {/* Step table */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="glass-card p-5 flex flex-col gap-2">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Distancias muestra → BMU</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 text-xs">
                <th className="text-left pb-2">Muestra</th>
                <th className="text-left pb-2">BMU</th>
                <th className="text-left pb-2">Fórmula</th>
                <th className="text-right pb-2">dist</th>
              </tr>
            </thead>
            <tbody>
              {samples.map((s, i) => {
                const n = neurons.find(n => n.id === s.bmu)
                return (
                  <motion.tr key={s.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.09 }}
                    style={{ borderTop: '1px solid rgba(99,102,241,0.08)' }}>
                    <td className="py-1 font-mono font-bold" style={{ color: s.class==='A'?'#10b981':'#f43f5e' }}>{s.id}</td>
                    <td className="py-1 font-mono text-xs" style={{ color: n.color }}>{s.bmu}</td>
                    <td className="py-1 text-xs text-slate-500 font-mono">
                      √[({s.x1}−{n.weights[0]})²+({s.x2}−{n.weights[1]})²]
                    </td>
                    <td className="py-1 text-right font-mono font-bold text-amber-400">{s.dist}</td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </motion.div>

        {/* Calculation steps */}
        <div className="flex flex-col gap-4">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
            className="glass-card p-4" style={{ borderLeft: '3px solid #6366f1' }}>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Suma total</p>
            <p className="text-sm font-mono text-slate-300 leading-loose">
              {samples.map((s,i) => (
                <span key={s.id}>
                  <span className="text-amber-400">{s.dist}</span>
                  {i < samples.length-1 && <span className="text-slate-600"> + </span>}
                </span>
              ))}
            </p>
            <p className="text-right font-mono text-lg font-bold text-indigo-400 mt-2">= {total.toFixed(3)}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
            className="glass-card p-4" style={{ borderLeft: '3px solid #8b5cf6' }}>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">División por N=8</p>
            <p className="text-center font-mono text-slate-300">
              QE = <span className="text-indigo-400">{total.toFixed(3)}</span> ÷ <span className="text-slate-400">8</span>
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.3, type: 'spring', stiffness: 180 }}
            className="glass-card p-5 text-center animate-pulse-glow"
            style={{ border: '2px solid rgba(16,185,129,0.6)' }}>
            <p className="text-xs text-emerald-600 uppercase tracking-widest mb-1">Resultado</p>
            <p className="text-5xl font-black" style={{ color: '#10b981' }}>QE = {qe}</p>
            <p className="text-sm text-emerald-600 mt-2">✅ Valor bajo — representación buena</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
