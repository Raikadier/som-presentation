import React from 'react'
import { motion } from 'framer-motion'

const SUMMARY = [
  { metric: 'Error de Cuantización', value: '0.086', interp: 'Representación buena', icon: '✅', color: '#10b981' },
  { metric: 'Pureza global',         value: '87.5%', interp: 'N3 mezcla clases', icon: '⚠️', color: '#f59e0b' },
  { metric: 'Entropía N3',           value: '1.0',   interp: 'Máxima mezcla', icon: '⚠️', color: '#f59e0b' },
  { metric: 'Neurona muerta',        value: 'N4',    interp: 'Sin representación', icon: '💀', color: '#475569' },
  { metric: 'Accuracy',              value: '87.5%', interp: '1 error (m7)', icon: '✅', color: '#10b981' },
  { metric: 'F1 promedio',           value: '0.873', interp: 'Buen balance', icon: '✅', color: '#10b981' },
]

const WHEN = [
  { cond: 'Sin etiquetas disponibles', use: 'QE + Error Topográfico', color: '#6366f1' },
  { cond: 'Evaluar tamaño del mapa', use: 'Producto Topográfico', color: '#8b5cf6' },
  { cond: 'Tarea de clasificación', use: 'Pureza + F1 + Confusión', color: '#f59e0b' },
  { cond: 'Evaluación completa', use: 'Todas las métricas combinadas', color: '#10b981' },
]

export default function ConclusionSlide() {
  return (
    <div className="w-full h-full flex flex-col justify-center px-12 gap-5"
      style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.06) 0%, transparent 60%)' }}>
      <motion.h2 initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-black gradient-text">
        Conclusiones
      </motion.h2>

      <div className="grid grid-cols-2 gap-8">
        {/* Summary table */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="glass-card p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-3">Resumen del ejemplo</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 text-xs">
                <th className="text-left pb-2">Métrica</th>
                <th className="text-left pb-2">Valor</th>
                <th className="text-left pb-2">Interpretación</th>
              </tr>
            </thead>
            <tbody>
              {SUMMARY.map((r, i) => (
                <motion.tr key={r.metric}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  style={{ borderTop: '1px solid rgba(99,102,241,0.08)' }}>
                  <td className="py-1.5 font-medium text-slate-300">{r.metric}</td>
                  <td className="py-1.5 font-bold font-mono" style={{ color: r.color }}>{r.value}</td>
                  <td className="py-1.5 text-xs text-slate-400">{r.icon} {r.interp}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* When to use */}
        <div className="flex flex-col gap-3">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
            className="text-sm font-bold text-slate-300">¿Cuándo usar cada métrica?</motion.div>
          {WHEN.map(({ cond, use, color }, i) => (
            <motion.div key={cond}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.12 }}
              className="glass-card px-4 py-3 flex justify-between items-center gap-3"
              style={{ borderLeft: `3px solid ${color}` }}>
              <span className="text-sm text-slate-400">{cond}</span>
              <span className="text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap"
                style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>
                {use}
              </span>
            </motion.div>
          ))}

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
            className="glass-card p-4 text-center mt-2"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.3)' }}>
            <p className="text-slate-300 text-sm mb-2">David Santiago Barceló Terán — Grupo 03</p>
            <p className="text-xs text-slate-600">Universidad Popular del Cesar · Inteligencia Artificial · 2026-I</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
