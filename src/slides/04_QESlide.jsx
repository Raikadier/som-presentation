import React, { useState } from 'react'
import { motion } from 'framer-motion'
import FormulaBlock from '../components/metrics/FormulaBlock.jsx'
import ZoomableSVG  from '../components/ui/ZoomableSVG.jsx'
import ViewToggle   from '../components/ui/ViewToggle.jsx'
import QEViz3D      from '../components/som/QEViz3D.jsx'
import { samples, neurons } from '../data/somData.js'

export default function QESlide() {
  const [mode, setMode] = useState('2d')

  return (
    <div className="w-full h-full flex flex-col px-12 pt-14 pb-3 gap-4">

      <motion.h2 initial={{ opacity:0, y:-18 }} animate={{ opacity:1, y:0 }}
        className="text-4xl font-black gradient-text shrink-0">
        Error de Cuantización{' '}
        <span className="text-2xl text-slate-400 font-normal">(QE)</span>
      </motion.h2>

      <div className="grid grid-cols-2 gap-8 flex-1 min-h-0">

        {/* ── LEFT: formulas ── */}
        <FormulaBlock steps={[
          {
            label:'Definición', color:'#6366f1',
            latex:'QE = \\dfrac{1}{N} \\sum_{i=1}^{N} \\| x_i - w_{\\text{BMU}(x_i)} \\|',
            delay:0.2,
          },
          {
            label:'Donde', color:'#8b5cf6', block:false,
            items:[
              { symbol:'N',      text:'= número total de muestras de entrada',       color:'#818cf8' },
              { symbol:'xᵢ',     text:'= vector de la muestra i',                    color:'#818cf8' },
              { symbol:'w_BMU',  text:'= pesos de la neurona ganadora (BMU) de xᵢ', color:'#10b981' },
              { symbol:'‖·‖',    text:'= distancia euclidiana',                      color:'#f59e0b' },
            ],
            delay:0.5,
          },
          {
            label:'Interpretación', color:'#10b981',
            text:'Valor bajo → mapa cerca de los datos. Valor alto → mala representación.',
            delay:0.8,
          },
        ]}/>

        {/* ── RIGHT: visualization ── */}
        <div className="flex flex-col gap-2.5 min-h-0">

          {/* Header row with toggle */}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.25 }}
            className="flex items-center justify-between shrink-0">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              Distancias al BMU
            </p>
            <ViewToggle mode={mode} onChange={setMode}/>
          </motion.div>

          {/* Viz panel */}
          <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}
            transition={{ delay:0.3 }}
            className="glass-card flex-1 min-h-0 overflow-hidden"
            style={{ minHeight:180 }}
          >
            {mode === '3d' ? (
              <QEViz3D/>
            ) : (
              <ZoomableSVG>
                <svg viewBox="0 0 520 270"
                  style={{ width:'100%', height:'100%', display:'block' }}>
                  {/* Grid */}
                  {[0,0.25,0.5,0.75,1].map(v => (
                    <g key={v}>
                      <line x1={38+v*444} y1={14}  x2={38+v*444} y2={250}
                        stroke="rgba(99,102,241,0.10)" strokeWidth={1}/>
                      <line x1={38} y1={250-v*236}  x2={482} y2={250-v*236}
                        stroke="rgba(99,102,241,0.10)" strokeWidth={1}/>
                    </g>
                  ))}
                  {/* Axes */}
                  <line x1={38} y1={250} x2={482} y2={250} stroke="rgba(148,163,184,0.35)" strokeWidth={1}/>
                  <line x1={38} y1={14}  x2={38}  y2={250} stroke="rgba(148,163,184,0.35)" strokeWidth={1}/>
                  <text x={260} y={266} textAnchor="middle" fill="#94a3b8" fontSize={9}>x₁ →</text>
                  <text x={12}  y={132} textAnchor="middle" fill="#94a3b8" fontSize={9}
                    transform="rotate(-90,12,132)">x₂</text>
                  {/* Neurons */}
                  {neurons.map(n => {
                    const cx = 38+n.weights[0]*444, cy = 250-n.weights[1]*236, sz = 9
                    return (
                      <g key={n.id}>
                        <polygon
                          points={`${cx},${cy-sz} ${cx+sz},${cy} ${cx},${cy+sz} ${cx-sz},${cy}`}
                          fill={n.color} opacity={n.isDead ? 0.3 : 0.9}
                          stroke="#f1f5f9" strokeWidth={0.8}/>
                        <text x={cx+12} y={cy-3} fill={n.color} fontSize={10} fontWeight="bold">{n.id}</text>
                      </g>
                    )
                  })}
                  {/* Samples + distance dashes */}
                  {samples.map(s => {
                    const sx = 38+s.x1*444, sy = 250-s.x2*236
                    const bmu = neurons.find(n => n.id === s.bmu)
                    const bx  = 38+bmu.weights[0]*444, by = 250-bmu.weights[1]*236
                    const color = s.class === 'A' ? '#10b981' : '#f43f5e'
                    const mx = (sx+bx)/2, my = (sy+by)/2
                    return (
                      <g key={s.id}>
                        <line x1={sx} y1={sy} x2={bx} y2={by}
                          stroke={color} strokeWidth={1} strokeDasharray="3,2" opacity={0.5}/>
                        <text x={mx+2} y={my-3} fill={color} fontSize={7} opacity={0.85}>{s.dist}</text>
                        <circle cx={sx} cy={sy} r={5} fill={color} opacity={0.9}/>
                        <text x={sx} y={sy-8} textAnchor="middle" fill="#94a3b8" fontSize={7.5}>{s.id}</text>
                      </g>
                    )
                  })}
                </svg>
              </ZoomableSVG>
            )}
          </motion.div>

          {/* QE result */}
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:0.9 }}
            className="glass-card px-4 py-2.5 text-center shrink-0"
            style={{ border:'1px solid rgba(99,102,241,0.4)' }}
          >
            <p className="text-xs text-slate-400 mb-1">Σ distancias = 0.690 · N = 8</p>
            <p className="text-2xl font-black" style={{ color:'#10b981' }}>QE = 0.086</p>
            <p className="text-xs text-emerald-600 mt-0.5">✅ Valor bajo — buena representación</p>
          </motion.div>
        </div>

      </div>
    </div>
  )
}
