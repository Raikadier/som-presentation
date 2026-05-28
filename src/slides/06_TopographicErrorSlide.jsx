import React, { useState } from 'react'
import { motion } from 'framer-motion'
import FormulaBlock from '../components/metrics/FormulaBlock.jsx'
import ZoomableSVG  from '../components/ui/ZoomableSVG.jsx'
import ViewToggle   from '../components/ui/ViewToggle.jsx'
import TEViz3D      from '../components/som/TEViz3D.jsx'

/* ── 2-D fallback SVG data ──────────────────────────────────────────────── */
const SC = { x: (w) => 30 + w * 280, y: (w) => 30 + (1 - w) * 240 }

const NEURONS_2D = [
  { id:'N1', w:[0.15,0.20], color:'#10b981', isDead:false },
  { id:'N2', w:[0.80,0.85], color:'#f43f5e', isDead:false },
  { id:'N3', w:[0.55,0.45], color:'#f59e0b', isDead:false },
  { id:'N4', w:[0.30,0.60], color:'#64748b', isDead:true  },
]
const GRID_ADJ_2D = [['N1','N2'],['N1','N3'],['N2','N4'],['N3','N4']]
const NM2D = Object.fromEntries(NEURONS_2D.map(n => [n.id, n]))

const SAMPLES_2D = [
  { x1:0.10, x2:0.20, bmu:'N1', isError:true  },
  { x1:0.20, x2:0.10, bmu:'N1', isError:false },
  { x1:0.10, x2:0.30, bmu:'N1', isError:true  },
  { x1:0.80, x2:0.90, bmu:'N2', isError:true  },
  { x1:0.90, x2:0.80, bmu:'N2', isError:true  },
  { x1:0.70, x2:0.90, bmu:'N2', isError:true  },
  { x1:0.50, x2:0.50, bmu:'N3', isError:false },
  { x1:0.60, x2:0.40, bmu:'N3', isError:false },
]

export default function TopographicErrorSlide() {
  const [mode, setMode] = useState('3d')

  return (
    <div className="w-full h-full flex flex-col px-12 pt-14 pb-3 gap-4">

      {/* Title */}
      <motion.h2
        initial={{ opacity:0, y:-18 }} animate={{ opacity:1, y:0 }}
        className="text-4xl font-black gradient-text shrink-0"
      >
        Error Topográfico{' '}
        <span className="text-2xl text-slate-400 font-normal">(TE)</span>
      </motion.h2>

      {/* Two-column body */}
      <div className="grid grid-cols-2 gap-7 flex-1 min-h-0">

        {/* ── LEFT: formulas ── */}
        <FormulaBlock steps={[
          {
            label:'Definición', color:'#6366f1',
            latex:'TE = \\dfrac{1}{N} \\sum_{i=1}^{N} t(x_i)',
            delay:0.2,
          },
          {
            label:'Función indicadora t', color:'#f59e0b',
            latex:
              't(x_i) = \\begin{cases} 1 & \\text{si BMU}_1 \\text{ y BMU}_2 \\text{ no son adyacentes} \\\\ 0 & \\text{en caso contrario} \\end{cases}',
            delay:0.45,
          },
          {
            label:'Interpretación', color:'#10b981',
            items:[
              { symbol:'TE = 0', text:'→ topología perfectamente preservada',        color:'#10b981' },
              { symbol:'TE = 1', text:'→ todas las muestras tienen error topológico', color:'#f43f5e' },
              { symbol:'⚠️',    text:'Detecta pliegues o roturas en la superficie del mapa', color:'#f59e0b' },
            ],
            delay:0.75,
          },
        ]}/>

        {/* ── RIGHT: visualization ── */}
        <motion.div
          initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }}
          transition={{ delay:0.3 }}
          className="flex flex-col gap-2.5 min-h-0"
        >
          {/* Header row with toggle */}
          <div className="flex items-center justify-between shrink-0">
            <p className="text-xs text-slate-500 uppercase tracking-wider">
              Espacio de entrada → Mapa SOM
            </p>
            <ViewToggle mode={mode} onChange={setMode}/>
          </div>

          {/* Viz panel */}
          <div className="glass-card flex-1 min-h-0 overflow-hidden" style={{ minHeight:220 }}>
            {mode === '3d' ? (
              <TEViz3D/>
            ) : (
              <ZoomableSVG>
                <svg viewBox="0 0 340 270"
                  style={{ width:'100%', height:'100%', display:'block' }}>
                  {/* Grid connections */}
                  {GRID_ADJ_2D.map(([a,b],i) => (
                    <line key={i}
                      x1={SC.x(NM2D[a].w[0])} y1={SC.y(NM2D[a].w[1])}
                      x2={SC.x(NM2D[b].w[0])} y2={SC.y(NM2D[b].w[1])}
                      stroke="rgba(99,102,241,0.5)" strokeWidth={1.8}/>
                  ))}
                  {/* Samples + BMU lines */}
                  {SAMPLES_2D.map((s,i) => {
                    const sx = SC.x(s.x1), sy = SC.y(s.x2)
                    const bmu = NM2D[s.bmu]
                    const bx = SC.x(bmu.w[0]), by = SC.y(bmu.w[1])
                    const col = s.isError ? '#f43f5e' : '#10b981'
                    return (
                      <g key={i}>
                        <line x1={sx} y1={sy} x2={bx} y2={by}
                          stroke={col} strokeWidth={s.isError ? 1.8 : 1.2}
                          strokeDasharray={s.isError ? undefined : '3,2'}
                          opacity={0.75}/>
                        <circle cx={sx} cy={sy} r={4.5} fill={col} opacity={0.9}/>
                      </g>
                    )
                  })}
                  {/* Neurons */}
                  {NEURONS_2D.map(n => {
                    const cx = SC.x(n.w[0]), cy = SC.y(n.w[1])
                    return (
                      <g key={n.id}>
                        <circle cx={cx} cy={cy} r={14}
                          fill={`${n.color}20`} stroke={n.color}
                          strokeWidth={2} opacity={n.isDead ? 0.35 : 1}/>
                        <text x={cx} y={cy+1} textAnchor="middle" dominantBaseline="middle"
                          fill={n.color} fontSize={12} fontWeight="bold"
                          opacity={n.isDead ? 0.5 : 1}>{n.id}</text>
                        <text x={cx} y={cy+21} textAnchor="middle"
                          fill="#64748b" fontSize={7.5}>
                          [{n.w[0]}, {n.w[1]}]
                        </text>
                        {n.isDead && (
                          <text x={cx} y={cy+31} textAnchor="middle"
                            fill="#f43f5e" fontSize={7}>muerta</text>
                        )}
                      </g>
                    )
                  })}
                  {/* Legend */}
                  <circle cx={22} cy={261} r={4} fill="#10b981"/>
                  <text x={30} y={264} fill="#10b981" fontSize={8}>t = 0 (adyacente)</text>
                  <circle cx={122} cy={261} r={4} fill="#f43f5e"/>
                  <text x={130} y={264} fill="#f43f5e" fontSize={8}>t = 1 (error topográfico)</text>
                </svg>
              </ZoomableSVG>
            )}
          </div>

          {/* Legend strip */}
          <motion.div
            initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:0.85 }}
            className="glass-card px-4 py-2.5 flex items-center justify-between text-xs shrink-0"
          >
            <div className="flex gap-5">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400"/>
                <span className="text-slate-300">t = 0 &nbsp;(3 muestras)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-400"/>
                <span className="text-slate-300">t = 1 &nbsp;(5 muestras)</span>
              </span>
            </div>
            <span className="font-mono font-bold text-amber-400 tabular-nums">
              TE = 5/8 = 0.625
            </span>
          </motion.div>

          {/* Diagonal note */}
          <motion.div
            initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:1.05 }}
            className="glass-card px-4 py-2 text-xs text-slate-300 shrink-0"
            style={{ borderLeft:'3px solid #f59e0b' }}
          >
            <span className="text-amber-400 font-semibold">N1↔N4</span> y{' '}
            <span className="text-amber-400 font-semibold">N2↔N3</span> son diagonales —
            no adyacentes en conectividad-4. N4 (muerta) amplifica el error.
          </motion.div>

        </motion.div>
      </div>
    </div>
  )
}
