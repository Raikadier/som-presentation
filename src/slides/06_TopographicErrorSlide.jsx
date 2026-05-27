import React from 'react'
import { motion } from 'framer-motion'
import FormulaBlock from '../components/metrics/FormulaBlock.jsx'

const N_POS = { N1:[60,60], N2:[200,60], N3:[60,200], N4:[200,200] }
const ADJ = [['N1','N2'],['N1','N3'],['N2','N4'],['N3','N4']]
const NON_ADJ = [['N1','N4'],['N2','N3']]

export default function TopographicErrorSlide() {
  return (
    <div className="w-full h-full flex flex-col justify-center px-12 pt-14 gap-6">
      <motion.h2 initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-black gradient-text">
        Error Topográfico <span className="text-2xl text-slate-400 font-normal">(TE)</span>
      </motion.h2>

      <div className="grid grid-cols-2 gap-8">
        <FormulaBlock steps={[
          {
            label: 'Definición',
            color: '#6366f1',
            latex: 'TE = \\dfrac{1}{N} \\sum_{i=1}^{N} t(x_i)',
            delay: 0.2,
          },
          {
            label: 'Función indicadora t',
            color: '#f59e0b',
            latex: 't(x_i) = \\begin{cases} 1 & \\text{si BMU}_1 \\text{ y BMU}_2 \\text{ no son adyacentes} \\\\ 0 & \\text{en caso contrario} \\end{cases}',
            delay: 0.45,
          },
          {
            label: 'Interpretación',
            color: '#10b981',
            items: [
              { symbol: 'TE = 0', text: '→ topología perfectamente preservada', color: '#10b981' },
              { symbol: 'TE = 1', text: '→ todas las muestras tienen error topológico', color: '#f43f5e' },
              { symbol: '⚠️', text: 'Detecta pliegues o roturas en la superficie del mapa', color: '#f59e0b' },
            ],
            delay: 0.75,
          },
        ]} />

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          className="flex flex-col gap-4">
          <div className="glass-card p-5">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-3">Cuadrícula SOM 2×2 — adyacencias</p>
            <svg viewBox="0 0 270 270" preserveAspectRatio="xMidYMid meet"
              style={{ width: '100%', maxHeight: 290 }}>
              {/* Adjacent lines (solid) */}
              {ADJ.map(([a,b],i) => (
                <motion.line key={`adj-${i}`}
                  initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.5+i*0.1, duration: 0.4 }}
                  x1={N_POS[a][0]} y1={N_POS[a][1]} x2={N_POS[b][0]} y2={N_POS[b][1]}
                  stroke="#6366f1" strokeWidth={2} strokeLinecap="round"
                />
              ))}
              {/* Non-adjacent (dashed) */}
              {NON_ADJ.map(([a,b],i) => (
                <motion.line key={`nonadj-${i}`}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 0.9+i*0.15 }}
                  x1={N_POS[a][0]} y1={N_POS[a][1]} x2={N_POS[b][0]} y2={N_POS[b][1]}
                  stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="5,4" opacity={0.5}
                />
              ))}
              {/* Neurons */}
              {Object.entries(N_POS).map(([id,[x,y]],i) => {
                const colors = {N1:'#10b981',N2:'#f43f5e',N3:'#f43f5e',N4:'#475569'}
                return (
                  <motion.g key={id} initial={{scale:0}} animate={{scale:1}} transition={{delay:0.35+i*0.08, type:'spring'}}>
                    <circle cx={x} cy={y} r={22} fill={`${colors[id]}20`} stroke={colors[id]} strokeWidth={2}/>
                    <text x={x} y={y+1} textAnchor="middle" dominantBaseline="middle" fill={colors[id]} fontSize={13} fontWeight="bold">{id}</text>
                  </motion.g>
                )
              })}
              {/* Legend */}
              <line x1={10} y1={245} x2={40} y2={245} stroke="#6366f1" strokeWidth={2}/>
              <text x={48} y={249} fill="#94a3b8" fontSize={9}>Adyacentes (t=0)</text>
              <line x1={130} y1={245} x2={160} y2={245} stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="4,3"/>
              <text x={168} y={249} fill="#94a3b8" fontSize={9}>No adyacentes (t=1)</text>
            </svg>
          </div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
            className="glass-card p-3 text-xs text-slate-300" style={{ borderLeft: '3px solid #f59e0b' }}>
            <span className="text-amber-400 font-semibold">N1↔N4</span> y <span className="text-amber-400 font-semibold">N2↔N3</span> son diagonales → <strong>NO</strong> adyacentes en conectividad-4.
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
