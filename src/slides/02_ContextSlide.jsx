import React from 'react'
import { motion } from 'framer-motion'

const card = (delay, color, icon, title, desc, tag) => ({ delay, color, icon, title, desc, tag })

const CARDS = [
  card(0.3, '#6366f1', '🎯', '¿Representa bien los datos?',
    'El mapa debe colocar cada neurona cerca de las muestras que le corresponden. Una mala representación distorsiona los patrones aprendidos.',
    '→ QE · Distorsión'),
  card(0.5, '#8b5cf6', '🗺️', '¿Preserva la topología?',
    'El orden espacial del espacio de entrada debe reflejarse en el mapa. Vecinos en los datos → vecinos en la cuadrícula.',
    '→ Error Topográfico · Producto Topográfico'),
]

export default function ContextSlide() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-12 pt-14 gap-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="text-4xl font-black gradient-text mb-2">¿Por qué evaluar un SOM?</h2>
        <p className="text-slate-400 text-sm">Un mapa entrenado no garantiza calidad — necesitamos métricas para saberlo.</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-8 w-full max-w-5xl">
        {CARDS.map(({ delay, color, icon, title, desc, tag }) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay, duration: 0.6, ease: 'easeOut' }}
            className="glass-card p-6 flex flex-col gap-3"
            style={{ borderTop: `3px solid ${color}` }}
          >
            <div className="text-3xl">{icon}</div>
            <h3 className="text-lg font-bold text-slate-100">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
            <div className="text-xs font-mono font-semibold mt-auto pt-2" style={{ color, borderTop: `1px solid ${color}30` }}>
              {tag}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="glass-card px-6 py-3 text-sm text-slate-300 max-w-4xl text-center"
        style={{ borderLeft: '3px solid #f59e0b' }}
      >
        <span className="text-amber-400 font-semibold">+ Si hay etiquetas de clase →</span>
        {' '}métricas de clasificación: Pureza, Entropía, F1, Matriz de Confusión
      </motion.div>
    </div>
  )
}
