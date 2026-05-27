import React from 'react'
import { motion } from 'framer-motion'

/* ── primitive building blocks ─────────────────── */
const Node = ({ label, color, delay, size = 'sm' }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.7 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.4, type: 'spring', stiffness: 180 }}
    className="px-4 py-2 rounded-full font-bold whitespace-nowrap text-center"
    style={{
      background: `${color}20`,
      color,
      border: `1.5px solid ${color}55`,
      fontSize: size === 'lg' ? 15 : size === 'md' ? 13 : 11.5,
    }}
  >
    {label}
  </motion.div>
)

const VLine = ({ delay, h = 28, color = '#4338ca' }) => (
  <motion.div
    initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
    transition={{ delay, duration: 0.3 }}
    style={{ width: 2, height: h, background: color, margin: '0 auto', transformOrigin: 'top', opacity: 0.5 }}
  />
)

/* ── leaf column: sub-category + 2 leaves ─────── */
function LeafCol({ label, color, leaves, delay }) {
  return (
    <div className="flex flex-col items-center">
      <Node label={label} color={color} delay={delay} size="md" />
      <VLine delay={delay + 0.1} h={28} color={color} />
      <div className="flex flex-col items-center gap-2">
        {leaves.map((l, i) => (
          <Node key={l} label={l} color={color} delay={delay + 0.15 + i * 0.08} size="sm" />
        ))}
      </div>
    </div>
  )
}

export default function MetricsMapSlide() {
  return (
    <div className="w-full h-full flex flex-col items-center px-10 pt-14 pb-6 gap-0">

      {/* Title */}
      <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-black gradient-text mb-6 shrink-0">
        Clasificación de Métricas
      </motion.h2>

      {/* Tree */}
      <div className="flex flex-col items-center flex-1 justify-evenly w-full">

        {/* Root */}
        <Node label="Métricas de Evaluación SOM" color="#a78bfa" delay={0.1} size="lg" />

        <VLine delay={0.25} h={36} color="#7c3aed" />

        {/* Level 1: two main branches */}
        <div className="flex gap-28 items-start w-full justify-center">

          {/* ── Branch 1: Sin etiquetas ─── */}
          <div className="flex flex-col items-center gap-0">
            <Node label="Sin etiquetas  (propias del SOM)" color="#6366f1" delay={0.35} size="md" />
            <VLine delay={0.45} h={36} color="#6366f1" />

            {/* Sub-branches: Representación + Topología */}
            <div className="flex gap-16 items-start">
              <LeafCol
                label="Representación"
                color="#818cf8"
                leaves={['Error de Cuantización', 'Medida de Distorsión']}
                delay={0.5}
              />
              <LeafCol
                label="Topología"
                color="#a78bfa"
                leaves={['Error Topográfico', 'Producto Topográfico']}
                delay={0.62}
              />
            </div>
          </div>

          {/* ── Branch 2: Con etiquetas ─── */}
          <div className="flex flex-col items-center gap-0">
            <Node label="Con etiquetas  (clasificación)" color="#f59e0b" delay={0.35} size="md" />
            <VLine delay={0.45} h={36} color="#f59e0b" />

            {/* Sub-branches: Por neurona + Global */}
            <div className="flex gap-16 items-start">
              <LeafCol
                label="Por neurona"
                color="#fbbf24"
                leaves={['Pureza', 'Entropía']}
                delay={0.5}
              />
              <LeafCol
                label="Global"
                color="#d97706"
                leaves={['Accuracy · F1', 'Matriz Confusión']}
                delay={0.62}
              />
            </div>
          </div>
        </div>

        {/* Footer note */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
          className="text-xs text-slate-500 text-center mt-2">
          Las métricas propias del SOM son independientes de las etiquetas
          &nbsp;·&nbsp;
          Las de clasificación requieren <em>ground-truth</em>
        </motion.p>
      </div>
    </div>
  )
}
