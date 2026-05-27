import React from 'react'
import { motion } from 'framer-motion'

const STEPS = [
  { icon: '🧠', title: 'SOM Entrenado', desc: 'El mapa ya aprendió la distribución de los datos (pesos w ajustados)', color: '#6366f1' },
  { icon: '📍', title: 'Asignar BMU', desc: 'Para cada muestra xᵢ, encontrar la neurona ganadora: BMU = argmin‖xᵢ − wⱼ‖', color: '#8b5cf6' },
  { icon: '🏷️', title: 'Etiquetar neuronas', desc: 'Asignar a cada neurona la clase más frecuente entre sus muestras asignadas (voto mayoritario)', color: '#a78bfa' },
  { icon: '🔮', title: 'Predecir clases', desc: 'La clase predicha de xᵢ = etiqueta de su neurona BMU', color: '#f59e0b' },
  { icon: '📊', title: 'Calcular métricas', desc: 'Comparar predicciones vs clases reales → Pureza, Accuracy, F1, Matriz de Confusión', color: '#10b981' },
]

export default function ClassificationFlowSlide() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-12 pt-14 gap-5">
      <motion.h2 initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-black gradient-text text-center">
        Métricas de Clasificación — Flujo
      </motion.h2>
      <p className="text-slate-400 text-sm text-center -mt-2">Solo aplicable cuando las muestras tienen etiqueta conocida</p>

      <div className="flex flex-col items-center gap-1 w-full max-w-3xl">
        {STEPS.map((step, i) => (
          <React.Fragment key={i}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.18, duration: 0.5, ease: 'easeOut' }}
              className="w-full glass-card px-5 py-3 flex items-center gap-4"
              style={{ borderLeft: `4px solid ${step.color}` }}
            >
              <span className="text-2xl">{step.icon}</span>
              <div>
                <p className="font-bold text-sm" style={{ color: step.color }}>{step.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{step.desc}</p>
              </div>
            </motion.div>
            {i < STEPS.length - 1 && (
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ delay: 0.35 + i * 0.18, duration: 0.3 }}
                style={{ width: 2, height: 16, background: `linear-gradient(${step.color},${STEPS[i+1].color})`, transformOrigin: 'top' }}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }}
        className="glass-card px-5 py-2 text-xs text-amber-300 max-w-3xl text-center"
        style={{ borderLeft: '3px solid #f59e0b' }}>
        ⚠️ Una neurona muerta (sin muestras) no recibe etiqueta y crea zonas sin representar en el mapa.
      </motion.div>
    </div>
  )
}
