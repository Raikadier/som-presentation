import React, { useState } from 'react'
import { motion } from 'framer-motion'
import FormulaBlock    from '../components/metrics/FormulaBlock.jsx'
import ZoomableSVG     from '../components/ui/ZoomableSVG.jsx'
import ViewToggle      from '../components/ui/ViewToggle.jsx'
import DistortionViz3D from '../components/som/DistortionViz3D.jsx'

const rows = [
  { metric:'Error de Cuantización', scope:'Solo BMU',          weights:'Igual (1)',    color:'#6366f1' },
  { metric:'Medida de Distorsión',  scope:'Todas las neuronas', weights:'h (vecindad)', color:'#8b5cf6' },
]

export default function DistortionSlide() {
  const [mode, setMode] = useState('2d')

  return (
    <div className="w-full h-full flex flex-col px-12 pt-14 pb-3 gap-4">

      <motion.h2 initial={{ opacity:0, y:-18 }} animate={{ opacity:1, y:0 }}
        className="text-4xl font-black gradient-text shrink-0">
        Medida de Distorsión
      </motion.h2>

      <div className="grid grid-cols-2 gap-8 flex-1 min-h-0">

        {/* ── LEFT: formulas ── */}
        <FormulaBlock steps={[
          {
            label:'Definición', color:'#8b5cf6',
            latex:'D = \\sum_{i=1}^{N} \\sum_{j=1}^{K} h\\bigl(BMU(x_i),\\, j\\bigr) \\cdot \\|x_i - w_j\\|^2',
            delay:0.2,
          },
          {
            label:'Función de vecindad h', color:'#f59e0b',
            latex:'h(r, j) = \\exp\\!\\left(-\\frac{d_{\\text{grid}}(r,j)^2}{2\\sigma^2}\\right)',
            text:'Decae con la distancia en la cuadrícula. Neuronas lejanas tienen peso ≈ 0.',
            delay:0.5,
          },
          {
            label:'Clave', color:'#10b981',
            text:'Es la función objetivo que el SOM minimiza durante el entrenamiento. QE es un caso especial donde h=1 solo para el BMU.',
            delay:0.8,
          },
        ]}/>

        {/* ── RIGHT: visualization ── */}
        <div className="flex flex-col gap-2.5 min-h-0">

          {/* Header row with toggle */}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.25 }}
            className="flex items-center justify-between shrink-0">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              Función h — decaimiento gaussiano
            </p>
            <ViewToggle mode={mode} onChange={setMode}/>
          </motion.div>

          {/* Viz panel */}
          <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}
            transition={{ delay:0.35 }}
            className="glass-card flex-1 min-h-0 overflow-hidden"
            style={{ minHeight:180 }}
          >
            {mode === '3d' ? (
              <DistortionViz3D/>
            ) : (
              <ZoomableSVG>
                <svg viewBox="0 0 280 130"
                  style={{ width:'100%', height:'100%', display:'block' }}>
                  <defs>
                    <linearGradient id="gauss" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%"   stopColor="#8b5cf6" stopOpacity="0"/>
                      <stop offset="50%"  stopColor="#8b5cf6" stopOpacity="1"/>
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  {/* Gaussian curve */}
                  <path d={`M 10,118 ${Array.from({length:27},(_,i)=>{
                    const x=10+i*10; const tt=(i-13)/4; const y=118-100*Math.exp(-tt*tt/2)
                    return `L ${x},${y}`
                  }).join(' ')} L 270,118`}
                    fill="none" stroke="url(#gauss)" strokeWidth={2}/>
                  {/* Fill under curve */}
                  <path d={`M 10,118 ${Array.from({length:27},(_,i)=>{
                    const x=10+i*10; const tt=(i-13)/4; const y=118-100*Math.exp(-tt*tt/2)
                    return `L ${x},${y}`
                  }).join(' ')} L 270,118 Z`}
                    fill="url(#gauss)" opacity={0.07}/>
                  {/* Baseline */}
                  <line x1={10} y1={118} x2={270} y2={118}
                    stroke="rgba(148,163,184,0.3)" strokeWidth={1}/>
                  {/* BMU marker */}
                  <line x1={140} y1={18} x2={140} y2={118}
                    stroke="rgba(99,102,241,0.4)" strokeDasharray="3,2" strokeWidth={1}/>
                  <text x={140} y={13} textAnchor="middle"
                    fill="#6366f1" fontSize={9} fontWeight="bold">BMU (h=1)</text>
                  {/* σ markers */}
                  {[{x:100,h:'0.61',side:-1},{x:180,h:'0.61',side:1}].map(({x,h,side},i)=>{
                    const y = 118-100*Math.exp(-Math.pow((x-140)/40,2)/2)
                    return (
                      <g key={i}>
                        <line x1={x} y1={118} x2={x} y2={y}
                          stroke="rgba(245,158,11,0.35)" strokeDasharray="2,2" strokeWidth={1}/>
                        <circle cx={x} cy={y} r={3} fill="#f59e0b"/>
                        <text x={x+(side*14)} y={y-5} textAnchor="middle" fill="#f59e0b" fontSize={8}>
                          h≈{h}
                        </text>
                      </g>
                    )
                  })}
                  {/* h≈0 far */}
                  {[{x:60,h:'0.1'},{x:220,h:'0.1'}].map(({x,h},i)=>{
                    const y = 118-100*Math.exp(-Math.pow((x-140)/40,2)/2)
                    return (
                      <g key={i}>
                        <circle cx={x} cy={y} r={3} fill="#8b5cf6" opacity={0.5}/>
                        <text x={x} y={y-5} textAnchor="middle" fill="#a78bfa" fontSize={8} opacity={0.7}>
                          h≈{h}
                        </text>
                      </g>
                    )
                  })}
                  {/* σ brace label */}
                  <line x1={100} y1={115} x2={140} y2={115}
                    stroke="rgba(245,158,11,0.5)" strokeWidth={1}/>
                  <text x={120} y={127} textAnchor="middle" fill="#f59e0b" fontSize={8}>σ</text>
                  {/* x-axis label */}
                  <text x={140} y={128} textAnchor="middle" fill="#94a3b8" fontSize={8}>
                    distancia en cuadrícula →
                  </text>
                </svg>
              </ZoomableSVG>
            )}
          </motion.div>

          {/* Comparison table */}
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:0.9 }}
            className="glass-card px-4 py-3 shrink-0"
          >
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">
              QE vs Distorsión
            </p>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500">
                  <th className="text-left pb-1">Métrica</th>
                  <th className="text-left pb-1">Alcance</th>
                  <th className="text-left pb-1">Pesos</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.metric} style={{ borderTop:'1px solid rgba(99,102,241,0.1)' }}>
                    <td className="py-1.5 font-semibold" style={{ color:r.color }}>{r.metric}</td>
                    <td className="py-1.5 text-slate-300">{r.scope}</td>
                    <td className="py-1.5 font-mono text-slate-400">{r.weights}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
