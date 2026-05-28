import React, { useState } from 'react'
import { motion } from 'framer-motion'
import FormulaBlock      from '../components/metrics/FormulaBlock.jsx'
import ZoomableSVG       from '../components/ui/ZoomableSVG.jsx'
import ViewToggle        from '../components/ui/ViewToggle.jsx'
import TopProductViz3D   from '../components/som/TopProductViz3D.jsx'

const compare = [
  { metric:'Error Topográfico',   complexity:'Simple',  evaluates:'BMU₁ vs BMU₂', result:'Porcentaje [0,1]', usage:'Frecuente',    color:'#6366f1' },
  { metric:'Producto Topográfico', complexity:'Avanzado', evaluates:'k vecinos',     result:'log (≈ 0 ideal)', usage:'Investigación', color:'#8b5cf6' },
]

export default function TopographicProductSlide() {
  const [mode, setMode] = useState('2d')

  return (
    <div className="w-full h-full flex flex-col px-12 pt-14 pb-3 gap-4">

      <motion.h2 initial={{ opacity:0, y:-18 }} animate={{ opacity:1, y:0 }}
        className="text-4xl font-black gradient-text shrink-0">
        Producto Topográfico
      </motion.h2>

      <div className="grid grid-cols-2 gap-8 flex-1 min-h-0">

        {/* ── LEFT: formulas ── */}
        <FormulaBlock steps={[
          {
            label:'Bauer & Pawelzik (1992)', color:'#8b5cf6',
            latex:'P = \\dfrac{1}{N \\cdot \\log K} \\sum_{i=1}^{N} \\sum_{k=1}^{K} \\log\\bigl[Q_1(k,i) \\cdot Q_2(k,i)\\bigr]',
            delay:0.2,
          },
          {
            label:'Q₁ y Q₂', color:'#f59e0b',
            items:[
              { symbol:'Q₁(k,i)', text:'= razón de distancias del k-ésimo vecino en el espacio de ENTRADA', color:'#10b981' },
              { symbol:'Q₂(k,i)', text:'= razón de distancias del k-ésimo vecino en el MAPA',               color:'#8b5cf6' },
            ],
            delay:0.5,
          },
          {
            label:'Valor ideal: P = 0', color:'#10b981',
            items:[
              { symbol:'P < 0', text:'→ mapa demasiado pequeño (subdimensionado)', color:'#f43f5e' },
              { symbol:'P = 0', text:'→ tamaño óptimo ✅',                         color:'#10b981' },
              { symbol:'P > 0', text:'→ mapa demasiado grande (sobredimensionado)', color:'#f59e0b' },
            ],
            delay:0.75,
          },
        ]}/>

        {/* ── RIGHT: visualization ── */}
        <div className="flex flex-col gap-2.5 min-h-0">

          {/* Header row with toggle */}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.25 }}
            className="flex items-center justify-between shrink-0">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              {mode === '3d' ? 'Vecindades k=1,2 — entrada vs mapa' : 'Escala de interpretación'}
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
              <TopProductViz3D/>
            ) : (
              <ZoomableSVG>
                <svg viewBox="0 0 480 120" style={{ width:'100%', height:'100%', display:'block' }}>
                  <defs>
                    <linearGradient id="gauge" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%"   stopColor="#f43f5e"/>
                      <stop offset="42%"  stopColor="#f59e0b"/>
                      <stop offset="50%"  stopColor="#10b981"/>
                      <stop offset="58%"  stopColor="#f59e0b"/>
                      <stop offset="100%" stopColor="#f43f5e"/>
                    </linearGradient>
                  </defs>
                  {/* Gradient bar */}
                  <rect x={30} y={40} width={420} height={18} rx={9}
                    fill="url(#gauge)" opacity={0.85}/>
                  {/* Centre marker */}
                  <line x1={240} y1={30} x2={240} y2={66}
                    stroke="#f1f5f9" strokeWidth={2.5}/>
                  <text x={240} y={24} textAnchor="middle"
                    fill="#10b981" fontSize={13} fontWeight="bold">P = 0</text>
                  {/* Left */}
                  <text x={32}  y={82} fill="#f43f5e" fontSize={12} fontWeight="600">P ≪ 0</text>
                  <text x={32}  y={97} fill="#94a3b8" fontSize={10}>Mapa subdimensionado</text>
                  {/* Right */}
                  <text x={376} y={82} fill="#f59e0b" fontSize={12} fontWeight="600">P ≫ 0</text>
                  <text x={368} y={97} fill="#94a3b8" fontSize={10}>Mapa sobredimensionado</text>
                  {/* Optimal zone */}
                  <rect x={210} y={40} width={60} height={18} rx={4}
                    fill="none" stroke="#10b981" strokeWidth={1.5}
                    strokeDasharray="4,3" opacity={0.7}/>
                  <text x={240} y={72} textAnchor="middle"
                    fill="#10b981" fontSize={9} opacity={0.7}>óptimo</text>
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
              TE vs Producto Topográfico
            </p>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500">
                  <th className="text-left pb-1">Métrica</th>
                  <th className="text-left pb-1">Evalúa</th>
                  <th className="text-left pb-1">Uso</th>
                </tr>
              </thead>
              <tbody>
                {compare.map(r => (
                  <tr key={r.metric} style={{ borderTop:'1px solid rgba(99,102,241,0.1)' }}>
                    <td className="py-1.5 font-semibold" style={{ color:r.color }}>{r.metric}</td>
                    <td className="py-1.5 text-slate-300">{r.evaluates}</td>
                    <td className="py-1.5 text-slate-400">{r.usage}</td>
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
