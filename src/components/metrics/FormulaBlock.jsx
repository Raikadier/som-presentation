import React from 'react'
import { motion } from 'framer-motion'
import { BlockMath, InlineMath } from 'react-katex'

export default function FormulaBlock({ steps = [], className = '' }) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {steps.map((step, i) => (
        <motion.div
          key={i}
          /* ── 3Blue1Brown-style left-to-right reveal ── */
          initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0 round 8px)' }}
          animate={{ opacity: 1, clipPath: 'inset(0 0%   0 0 round 8px)' }}
          transition={{
            delay: step.delay ?? i * 0.2,
            duration: 0.65,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="glass-card p-4 relative overflow-hidden"
          style={{ borderLeft: `3px solid ${step.color || '#6366f1'}` }}
        >
          {step.label && (
            <div
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: step.color || '#6366f1' }}
            >
              {step.label}
            </div>
          )}

          {step.latex && (
            <div className="overflow-x-auto py-1">
              {step.block !== false
                ? <BlockMath math={step.latex} />
                : <InlineMath math={step.latex} />}
            </div>
          )}

          {step.text && (
            <p className="text-slate-300 text-sm mt-1">{step.text}</p>
          )}

          {step.items && (
            <ul className="mt-2 space-y-1">
              {step.items.map((item, j) => (
                <li key={j} className="text-sm flex items-start gap-2">
                  <span style={{ color: item.color || '#6366f1' }}
                    className="font-mono font-bold mt-0.5 shrink-0">
                    {item.symbol || '▸'}
                  </span>
                  <span className="text-slate-300">{item.text}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Subtle color glow */}
          <div
            className="absolute inset-0 pointer-events-none opacity-5"
            style={{
              background: `radial-gradient(circle at 0% 50%, ${step.color || '#6366f1'}, transparent 60%)`,
            }}
          />
        </motion.div>
      ))}
    </div>
  )
}
