import React from 'react'
import { motion } from 'framer-motion'
import NeuronCard from '../components/metrics/NeuronCard.jsx'
import { neurons } from '../data/somData.js'

export default function ExampleLabelingSlide() {
  return (
    <div className="w-full h-full flex flex-col justify-center px-12 pt-14 gap-5">
      <motion.h2 initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-black gradient-text">
        Ejemplo — Etiquetado de Neuronas
      </motion.h2>
      <p className="text-slate-400 text-sm -mt-3">
        Cada neurona recibe la etiqueta de la clase más frecuente entre sus muestras asignadas
      </p>

      <div className="grid grid-cols-4 gap-4">
        {neurons.map((n, i) => (
          <NeuronCard key={n.id} neuron={n} delay={0.2 + i * 0.15} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-1">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}
          className="glass-card p-4" style={{ borderLeft: '3px solid #f59e0b' }}>
          <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">⚠️ N3 — Empate A:B (1:1)</p>
          <p className="text-sm text-slate-300">
            Al empatar, se asigna B (convención). Esto hace que <span className="text-amber-400 font-bold">m7 (clase A)</span> sea
            clasificada como B → <span className="text-rose-400 font-bold">error de clasificación</span>.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}
          className="glass-card p-4" style={{ borderLeft: '3px solid #475569' }}>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">💀 N4 — Neurona muerta</p>
          <p className="text-sm text-slate-400">
            Ninguna muestra tuvo N4 como BMU. Esta zona del espacio no está representada.
            Indica que el mapa podría ser <span className="text-amber-400">más pequeño (3 neuronas)</span>.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
