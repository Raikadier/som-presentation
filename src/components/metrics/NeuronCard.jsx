import React from 'react'
import { motion } from 'framer-motion'
import { neuronSamples, samples, neuronEntropy } from '../../data/somData'

const CLASS_COLOR = { A: '#10b981', B: '#f43f5e', null: '#475569' }

export default function NeuronCard({ neuron, delay = 0 }) {
  const assignedIds = neuronSamples[neuron.id] || []
  const assigned = assignedIds.map(id => samples.find(s => s.id === id))
  const countA = assigned.filter(s => s?.class === 'A').length
  const countB = assigned.filter(s => s?.class === 'B').length
  const total = assigned.length
  const entropy = neuronEntropy[neuron.id]
  const isDead = neuron.isDead

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      className="glass-card p-4 flex flex-col gap-3 relative overflow-hidden"
      style={{ borderLeft: `4px solid ${neuron.color}` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xl font-black" style={{ color: neuron.color }}>{neuron.id}</span>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{
            background: isDead ? 'rgba(71,85,105,0.3)' : `${neuron.color}25`,
            color: neuron.color,
            border: `1px solid ${neuron.color}50`
          }}
        >
          {isDead ? '💀 Muerta' : `Clase ${neuron.label}`}
        </span>
      </div>

      {/* Weights */}
      <div className="text-xs text-slate-400 font-mono">
        w = [{neuron.weights[0]}, {neuron.weights[1]}]
      </div>

      {/* Assigned samples */}
      {!isDead ? (
        <>
          <div className="flex flex-wrap gap-1">
            {assigned.map(s => (
              <span
                key={s.id}
                className="text-xs px-2 py-0.5 rounded-full font-mono font-semibold"
                style={{
                  background: `${CLASS_COLOR[s.class]}20`,
                  color: CLASS_COLOR[s.class],
                  border: `1px solid ${CLASS_COLOR[s.class]}40`,
                  outline: !s.correct ? '1px solid #f59e0b' : 'none'
                }}
              >
                {s.id} [{s.class}]{!s.correct ? ' ⚠' : ''}
              </span>
            ))}
          </div>

          {/* Distribution bar */}
          {total > 0 && (
            <div className="h-2 rounded-full overflow-hidden flex" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(countA / total) * 100}%` }}
                transition={{ delay: delay + 0.3, duration: 0.6 }}
                style={{ background: '#10b981' }}
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(countB / total) * 100}%` }}
                transition={{ delay: delay + 0.5, duration: 0.6 }}
                style={{ background: '#f43f5e' }}
              />
            </div>
          )}

          {/* Entropy */}
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">
              A: <span style={{ color: '#10b981' }}>{countA}</span>  B: <span style={{ color: '#f43f5e' }}>{countB}</span>
            </span>
            <span style={{ color: entropy === 1.0 ? '#f59e0b' : '#94a3b8' }}>
              H = <span className="font-bold font-mono">{entropy ?? '—'}</span>
              {entropy === 1.0 && ' ⚠️'}
            </span>
          </div>
        </>
      ) : (
        <div className="text-sm text-slate-500 italic">
          Sin muestras asignadas.<br />
          <span className="text-amber-400 not-italic text-xs">Considerar reducir el tamaño del mapa.</span>
        </div>
      )}
    </motion.div>
  )
}
