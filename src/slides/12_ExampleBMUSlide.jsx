import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BMUScatter from '../components/som/BMUScatter.jsx'
import { samples, neurons } from '../data/somData.js'

export default function ExampleBMUSlide() {
  const [step, setStep] = useState(0)
  const cur = step > 0 ? samples[step - 1] : null
  const bmuNeuron = cur ? neurons.find(n => n.id === cur.bmu) : null

  return (
    <div className="w-full h-full flex flex-col px-12 pt-14 pb-3 gap-4">
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-black gradient-text shrink-0"
      >
        Ejemplo — Asignación de BMU
      </motion.h2>

      {/* Content: scatter (large, left) + compact panel (right) */}
      <div className="flex gap-6 flex-1 min-h-0 items-stretch">

        {/* ── Scatter (dominant) — fills available height ── */}
        <div className="flex flex-col gap-3 flex-1 min-h-0">
          <div className="flex-1 min-h-0">
            <BMUScatter step={step} />
          </div>

          {/* Step controls */}
          <div className="flex gap-3 items-center justify-center">
            <button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              className="px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-25 transition-all hover:scale-105"
              style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.35)' }}
            >
              ← Anterior
            </button>
            <div className="flex items-center gap-2">
              {samples.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i + 1)}
                  className="w-2.5 h-2.5 rounded-full transition-all"
                  style={{
                    background: step === i + 1
                      ? (samples[i].class === 'A' ? '#10b981' : '#f43f5e')
                      : 'rgba(148,163,184,0.25)',
                    transform: step === i + 1 ? 'scale(1.4)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
            <button
              onClick={() => setStep(s => Math.min(samples.length, s + 1))}
              disabled={step === samples.length}
              className="px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-25 transition-all hover:scale-105"
              style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.35)' }}
            >
              Siguiente →
            </button>
            <span className="text-xs text-slate-600 font-mono ml-1">
              {step === 0 ? '—' : `${step} / ${samples.length}`}
            </span>
          </div>
        </div>

        {/* ── Right panel ────────────────────────────── */}
        <div className="w-80 flex flex-col gap-3 shrink-0">

          {/* Sample detail card */}
          <AnimatePresence mode="wait">
            {cur ? (
              <motion.div
                key={cur.id}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.22 }}
                className="glass-card p-4 flex flex-col gap-3"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black" style={{ color: cur.class === 'A' ? '#10b981' : '#f43f5e' }}>
                    {cur.id}
                  </span>
                  <span
                    className="text-xs px-2.5 py-0.5 rounded-full font-bold"
                    style={{
                      background: cur.class === 'A' ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)',
                      color: cur.class === 'A' ? '#10b981' : '#f43f5e',
                    }}
                  >
                    Clase {cur.class}
                  </span>
                </div>

                <div className="text-xs font-mono text-slate-400">
                  x = ({cur.x1}, {cur.x2})
                </div>

                {/* Distance bars */}
                <div className="space-y-2">
                  <p className="text-xs text-slate-600 uppercase tracking-wider">Distancias a neuronas:</p>
                  {neurons.map(n => {
                    const d = Math.sqrt(
                      Math.pow(cur.x1 - n.weights[0], 2) + Math.pow(cur.x2 - n.weights[1], 2)
                    )
                    const isBMU = n.id === cur.bmu
                    return (
                      <div key={n.id} className="flex items-center gap-2 text-xs" style={{ opacity: n.isDead ? 0.35 : 1 }}>
                        <span className="font-mono font-bold w-5" style={{ color: n.color }}>{n.id}</span>
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(4, (1 - d) * 100)}%` }}
                            transition={{ duration: 0.45, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ background: isBMU ? n.color : 'rgba(148,163,184,0.3)' }}
                          />
                        </div>
                        <span className="font-mono w-10 text-right tabular-nums"
                          style={{ color: isBMU ? n.color : '#475569', fontWeight: isBMU ? '700' : '400' }}>
                          {d.toFixed(3)}
                        </span>
                        {isBMU && <span className="text-xs font-bold" style={{ color: n.color }}>★</span>}
                      </div>
                    )
                  })}
                </div>

                {/* Result */}
                <div
                  className="pt-2 border-t text-sm flex items-center gap-1.5 flex-wrap"
                  style={{ borderColor: 'rgba(99,102,241,0.15)' }}
                >
                  <span className="text-slate-400 text-xs">BMU =</span>
                  <span className="font-black text-base" style={{ color: bmuNeuron?.color }}>{cur.bmu}</span>
                  <span className="text-slate-600 text-xs">|</span>
                  <span className="text-slate-400 text-xs">d =</span>
                  <span className="font-mono font-bold text-amber-400 text-xs">{cur.dist}</span>
                  {!cur.correct && (
                    <span className="text-amber-400 text-xs font-bold w-full mt-0.5">⚠ mal clasificada</span>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="start"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass-card p-5 text-center text-slate-500 text-sm leading-relaxed"
              >
                Presiona <strong className="text-indigo-400">Siguiente →</strong><br />
                para ver la asignación BMU de cada muestra paso a paso.
              </motion.div>
            )}
          </AnimatePresence>

          {/* Running assignment table */}
          {step > 0 && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="glass-card p-3 overflow-auto"
              style={{ maxHeight: 220 }}
            >
              <p className="text-xs text-slate-600 uppercase tracking-wider mb-2">Asignaciones completadas</p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-600 text-left">
                    <th className="pb-1.5 font-semibold">ID</th>
                    <th className="pb-1.5 font-semibold">Cls</th>
                    <th className="pb-1.5 font-semibold">BMU</th>
                    <th className="pb-1.5 font-semibold text-right">d</th>
                  </tr>
                </thead>
                <tbody>
                  {samples.slice(0, step).map((s, i) => {
                    const nColor = neurons.find(n => n.id === s.bmu)?.color
                    const isLast = i === step - 1
                    return (
                      <tr
                        key={s.id}
                        style={{
                          borderTop: '1px solid rgba(99,102,241,0.08)',
                          background: isLast ? 'rgba(99,102,241,0.07)' : 'transparent',
                        }}
                      >
                        <td className="py-0.5 font-mono font-bold" style={{ color: isLast ? '#f1f5f9' : '#94a3b8' }}>
                          {s.id}
                        </td>
                        <td className="py-0.5">
                          <span style={{ color: s.class === 'A' ? '#10b981' : '#f43f5e' }}>{s.class}</span>
                        </td>
                        <td className="py-0.5 font-mono" style={{ color: nColor }}>{s.bmu}</td>
                        <td className="py-0.5 font-mono text-amber-400 text-right tabular-nums">{s.dist}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
