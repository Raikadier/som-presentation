import React from 'react'
import { motion } from 'framer-motion'
import { samples, neurons } from '../data/somData.js'

const N_POS = { N1:[70,65], N2:[210,65], N3:[70,195], N4:[210,195] }
const CONNECTIONS = [['N1','N2'],['N1','N3'],['N2','N4'],['N3','N4']]

export default function ExampleDataSlide() {
  return (
    <div className="w-full h-full flex flex-col px-12 pt-14 pb-5 gap-3 overflow-hidden">

      {/* Title — no badge here, App.jsx already shows it */}
      <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} className="shrink-0">
        <h2 className="text-4xl font-black gradient-text">Dataset del Ejemplo</h2>
        <p className="text-slate-400 text-sm mt-1">
          8 muestras · 2 características · 2 clases · SOM 2×2 entrenado
        </p>
      </motion.div>

      {/* 3-col grid — fills remaining height */}
      <div className="grid grid-cols-3 gap-5 flex-1 min-h-0">

        {/* ── Table ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 flex flex-col min-h-0"
        >
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-3 shrink-0">
            Muestras
          </p>
          <div className="overflow-auto flex-1 min-h-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs">
                  <th className="text-left pb-2 sticky top-0" style={{ background: 'rgba(19,19,58,0.95)' }}>ID</th>
                  <th className="text-left pb-2 sticky top-0" style={{ background: 'rgba(19,19,58,0.95)' }}>x₁</th>
                  <th className="text-left pb-2 sticky top-0" style={{ background: 'rgba(19,19,58,0.95)' }}>x₂</th>
                  <th className="text-left pb-2 sticky top-0" style={{ background: 'rgba(19,19,58,0.95)' }}>Clase</th>
                </tr>
              </thead>
              <tbody>
                {samples.map((s, i) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.07 }}
                    style={{ borderTop: '1px solid rgba(99,102,241,0.1)' }}
                  >
                    <td className="py-1.5 font-mono font-bold text-slate-300">{s.id}</td>
                    <td className="py-1.5 font-mono text-slate-400">{s.x1}</td>
                    <td className="py-1.5 font-mono text-slate-400">{s.x2}</td>
                    <td className="py-1.5">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-bold"
                        style={{
                          background: s.class === 'A' ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)',
                          color:      s.class === 'A' ? '#10b981'              : '#f43f5e',
                        }}
                      >{s.class}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* ── Scatter ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-4 flex flex-col min-h-0"
        >
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2 shrink-0">
            Distribución (x₁, x₂)
          </p>
          <div className="flex-1 min-h-0">
            <svg
              viewBox="0 0 240 230"
              preserveAspectRatio="xMidYMid meet"
              style={{ width: '100%', height: '100%', display: 'block' }}
            >
              {/* Grid */}
              {[0,0.25,0.5,0.75,1].map(v => (
                <g key={v}>
                  <line x1={22+v*196} y1={12} x2={22+v*196} y2={208}
                    stroke="rgba(99,102,241,0.08)" strokeWidth={1}/>
                  <line x1={22} y1={208-v*196} x2={218} y2={208-v*196}
                    stroke="rgba(99,102,241,0.08)" strokeWidth={1}/>
                  <text x={22+v*196} y={220} textAnchor="middle" fill="#475569" fontSize={8}>
                    {v.toFixed(2)}
                  </text>
                  <text x={12} y={211-v*196} textAnchor="middle" fill="#475569" fontSize={8}>
                    {v.toFixed(2)}
                  </text>
                </g>
              ))}
              {/* Axes */}
              <line x1={22} y1={208} x2={218} y2={208} stroke="rgba(148,163,184,0.3)" strokeWidth={1}/>
              <line x1={22} y1={12}  x2={22}  y2={208} stroke="rgba(148,163,184,0.3)" strokeWidth={1}/>

              {/* Data points */}
              {samples.map(s => {
                const cx = 22 + s.x1 * 196
                const cy = 208 - s.x2 * 196
                const c  = s.class === 'A' ? '#10b981' : '#f43f5e'
                return (
                  <motion.g key={s.id}
                    initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + samples.indexOf(s) * 0.07, type: 'spring' }}
                  >
                    <circle cx={cx} cy={cy} r={8} fill={c} opacity={0.9}/>
                    <text x={cx} y={cy - 11} textAnchor="middle" fill={c} fontSize={9} fontWeight="bold">
                      {s.id}
                    </text>
                  </motion.g>
                )
              })}

              {/* Labels */}
              <text x={120} y={230} textAnchor="middle" fill="#64748b" fontSize={10}>x₁ →</text>
              <text x={6} y={110} textAnchor="middle" fill="#64748b" fontSize={10}
                transform="rotate(-90,6,110)">x₂</text>

              {/* Legend */}
              <circle cx={26} cy={17} r={5} fill="#10b981"/>
              <text x={35} y={21} fill="#10b981" fontSize={9}>Clase A</text>
              <circle cx={80} cy={17} r={5} fill="#f43f5e"/>
              <text x={89} y={21} fill="#f43f5e" fontSize={9}>Clase B</text>
            </svg>
          </div>
        </motion.div>

        {/* ── SOM 2×2 grid ── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-4 flex flex-col min-h-0"
        >
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2 shrink-0">
            SOM 2×2 (pesos)
          </p>
          <div className="flex-1 min-h-0">
            <svg
              viewBox="0 0 290 260"
              preserveAspectRatio="xMidYMid meet"
              style={{ width: '100%', height: '100%', display: 'block' }}
            >
              {/* Connections */}
              {CONNECTIONS.map(([a, b], i) => (
                <line key={i}
                  x1={N_POS[a][0]} y1={N_POS[a][1]}
                  x2={N_POS[b][0]} y2={N_POS[b][1]}
                  stroke="rgba(99,102,241,0.45)" strokeWidth={1.8}
                />
              ))}

              {/* Neurons */}
              {neurons.map((n, i) => {
                const [x, y] = N_POS[n.id]
                return (
                  <motion.g key={n.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6 + i * 0.1, type: 'spring', stiffness: 200 }}
                    style={{ transformOrigin: `${x}px ${y}px` }}
                  >
                    {/* Halo */}
                    {!n.isDead && (
                      <circle cx={x} cy={y} r={34}
                        fill={n.color} opacity={0.08}/>
                    )}
                    {/* Circle */}
                    <circle cx={x} cy={y} r={26}
                      fill={`${n.color}22`}
                      stroke={n.color} strokeWidth={2.2}
                      opacity={n.isDead ? 0.4 : 1}/>
                    {/* ID */}
                    <text x={x} y={n.isDead ? y - 3 : y - 5}
                      textAnchor="middle" fill={n.color}
                      fontSize={14} fontWeight="bold"
                      opacity={n.isDead ? 0.5 : 1}
                    >{n.id}</text>
                    {/* Label */}
                    <text x={x} y={y + 10}
                      textAnchor="middle" fill={n.isDead ? '#475569' : '#94a3b8'}
                      fontSize={9}
                    >{n.isDead ? 'dead' : n.label}</text>
                    {/* Weights */}
                    <text x={x} y={y + 44}
                      textAnchor="middle" fill="#475569" fontSize={8.5}>
                      [{n.weights[0]}, {n.weights[1]}]
                    </text>
                  </motion.g>
                )
              })}

              {/* Footer label */}
              <text x={145} y={250}
                textAnchor="middle" fill="#334155" fontSize={9}>
                Pesos w = [w₁, w₂]
              </text>
            </svg>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
