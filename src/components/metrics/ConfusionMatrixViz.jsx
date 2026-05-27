import React from 'react'
import { motion } from 'framer-motion'
import { confusionMatrix } from '../../data/somData'

const { TP, FN, FP, TN } = confusionMatrix

const cells = [
  { row: 1, col: 1, value: TP, label: 'VP=3', bg: 'rgba(16,185,129,0.25)', border: '#10b981', text: '#10b981', note: '✓ Correcto' },
  { row: 1, col: 2, value: FN, label: 'FN=1', bg: 'rgba(244,63,94,0.25)', border: '#f43f5e', text: '#f43f5e', note: '← m7 error' },
  { row: 2, col: 1, value: FP, label: 'FP=0', bg: 'rgba(19,19,58,0.8)', border: 'rgba(99,102,241,0.3)', text: '#94a3b8', note: '✓ Correcto' },
  { row: 2, col: 2, value: TN, label: 'VN=4', bg: 'rgba(16,185,129,0.25)', border: '#10b981', text: '#10b981', note: '✓ Correcto' },
]

export default function ConfusionMatrixViz({ animate = true }) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Matrix grid */}
      <div className="relative">
        <div className="grid" style={{ gridTemplateColumns: '80px 1fr 1fr', gridTemplateRows: '36px 1fr 1fr', gap: '4px' }}>
          {/* Corner */}
          <div />
          {/* Column headers */}
          <motion.div
            initial={animate ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center rounded-md text-sm font-bold"
            style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}
          >
            Pred A
          </motion.div>
          <motion.div
            initial={animate ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center rounded-md text-sm font-bold"
            style={{ background: 'rgba(244,63,94,0.15)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.3)' }}
          >
            Pred B
          </motion.div>

          {/* Row 1 header */}
          <motion.div
            initial={animate ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center rounded-md text-sm font-bold"
            style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}
          >
            Real A
          </motion.div>
          {/* Row 1, Col 1 — TP */}
          <motion.div
            initial={animate ? { opacity: 0, scale: 0.8 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
            className="relative flex flex-col items-center justify-center rounded-lg p-3 min-w-[100px] min-h-[80px]"
            style={{ background: cells[0].bg, border: `2px solid ${cells[0].border}` }}
          >
            <span className="text-3xl font-black" style={{ color: cells[0].text }}>{TP}</span>
            <span className="text-xs font-semibold mt-1" style={{ color: cells[0].text }}>{cells[0].label}</span>
            <span className="text-xs text-slate-400 mt-0.5">{cells[0].note}</span>
          </motion.div>
          {/* Row 1, Col 2 — FN */}
          <motion.div
            initial={animate ? { opacity: 0, scale: 0.8 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            className="relative flex flex-col items-center justify-center rounded-lg p-3 min-w-[100px] min-h-[80px]"
            style={{ background: cells[1].bg, border: `2px solid ${cells[1].border}` }}
          >
            <span className="text-3xl font-black" style={{ color: cells[1].text }}>{FN}</span>
            <span className="text-xs font-semibold mt-1" style={{ color: cells[1].text }}>{cells[1].label}</span>
            <span className="text-xs" style={{ color: '#f59e0b' }}>{cells[1].note}</span>
          </motion.div>

          {/* Row 2 header */}
          <motion.div
            initial={animate ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center rounded-md text-sm font-bold"
            style={{ background: 'rgba(244,63,94,0.15)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.3)' }}
          >
            Real B
          </motion.div>
          {/* Row 2, Col 1 — FP */}
          <motion.div
            initial={animate ? { opacity: 0, scale: 0.8 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
            className="relative flex flex-col items-center justify-center rounded-lg p-3 min-w-[100px] min-h-[80px]"
            style={{ background: cells[2].bg, border: `1px solid ${cells[2].border}` }}
          >
            <span className="text-3xl font-black" style={{ color: cells[2].text }}>{FP}</span>
            <span className="text-xs font-semibold mt-1" style={{ color: cells[2].text }}>{cells[2].label}</span>
            <span className="text-xs text-slate-500">{cells[2].note}</span>
          </motion.div>
          {/* Row 2, Col 2 — TN */}
          <motion.div
            initial={animate ? { opacity: 0, scale: 0.8 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
            className="relative flex flex-col items-center justify-center rounded-lg p-3 min-w-[100px] min-h-[80px]"
            style={{ background: cells[3].bg, border: `2px solid ${cells[3].border}` }}
          >
            <span className="text-3xl font-black" style={{ color: cells[3].text }}>{TN}</span>
            <span className="text-xs font-semibold mt-1" style={{ color: cells[3].text }}>{cells[3].label}</span>
            <span className="text-xs text-slate-400">{cells[3].note}</span>
          </motion.div>
        </div>
      </div>

      {/* Legend chips */}
      <motion.div
        initial={animate ? { opacity: 0, y: 10 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="flex flex-wrap gap-2 justify-center"
      >
        {[
          { label: 'VP (TP)', value: TP, color: '#10b981' },
          { label: 'FN', value: FN, color: '#f43f5e' },
          { label: 'FP', value: FP, color: '#94a3b8' },
          { label: 'VN (TN)', value: TN, color: '#10b981' },
        ].map(chip => (
          <div
            key={chip.label}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: `${chip.color}20`, border: `1px solid ${chip.color}50`, color: chip.color }}
          >
            <span>{chip.label}</span>
            <span className="font-black">=</span>
            <span>{chip.value}</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
