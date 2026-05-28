import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

/* ── helpers ───────────────────────────────────────────────────────────── */
function randNorm(mu, sigma) {
  const u = 1 - Math.random(), v = Math.random()
  return mu + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}
const cl = x => Math.max(0.04, Math.min(0.96, x))

/* ── dataset generators ────────────────────────────────────────────────── */
const DATASETS = {
  clusters: () => {
    const centers = [[0.22,0.22],[0.78,0.22],[0.5,0.8]]
    const cols    = ['#10b981','#f43f5e','#f59e0b']
    return centers.flatMap((c,ci) =>
      Array.from({ length:22 }, () => ({
        x: cl(randNorm(c[0],0.08)),
        y: cl(randNorm(c[1],0.08)),
        color: cols[ci],
      }))
    )
  },
  espiral: () => {
    const pts = []
    for (let t=0.1; t<=3.8*Math.PI; t+=0.14) {
      const r = t/(3.8*Math.PI)
      pts.push({
        x: cl(0.5+r*0.44*Math.cos(t)),
        y: cl(0.5+r*0.44*Math.sin(t)),
        color: `hsl(${(r*260+100).toFixed(0)},75%,58%)`,
      })
    }
    return pts
  },
  anillos: () => {
    const pts = []
    const rings = [{ r:0.15, n:24, c:'#818cf8' },{ r:0.32, n:40, c:'#f43f5e' }]
    rings.forEach(({ r,n,c }) => {
      for (let i=0; i<n; i++) {
        const a = (i/n)*2*Math.PI + randNorm(0,0.08)
        pts.push({
          x: cl(0.5+r*Math.cos(a)+randNorm(0,0.02)),
          y: cl(0.5+r*Math.sin(a)+randNorm(0,0.02)),
          color: c,
        })
      }
    })
    return pts
  },
}

/* ── SOM algorithm ─────────────────────────────────────────────────────── */
const TOTAL_EPOCHS = 80

function initNeurons(gW, gH, data) {
  return Array.from({ length:gW*gH }, (_,k) => {
    const s = data[Math.floor(Math.random()*data.length)]
    return {
      i: Math.floor(k/gW),
      j: k % gW,
      w: [cl(s.x+randNorm(0,0.04)), cl(s.y+randNorm(0,0.04))],
    }
  })
}

/**
 * One training epoch.
 * competition:
 *   'soft' — Gaussian neighbourhood (standard SOM)
 *   'hard' — winner-takes-all (only BMU updated, h=0 for all others)
 */
function somEpoch(neurons, data, epoch, gW, gH, competition='soft') {
  const ns = neurons.map(n => ({ ...n, w:[...n.w] }))
  const t  = epoch / TOTAL_EPOCHS
  const lr = 0.5  * Math.exp(-t * 3)
  const sg = Math.max(0.35, (Math.max(gW,gH)/1.9) * Math.exp(-t*2.8))

  const shuffled = [...data].sort(() => Math.random() - 0.5)

  for (const pt of shuffled) {
    let bmuIdx = 0, minD = Infinity
    ns.forEach((n,i) => {
      const d = Math.hypot(n.w[0]-pt.x, n.w[1]-pt.y)
      if (d < minD) { minD=d; bmuIdx=i }
    })
    const bmu = ns[bmuIdx]
    ns.forEach(n => {
      const gd = Math.hypot(n.i-bmu.i, n.j-bmu.j)
      /* hard = only BMU; soft = Gaussian decay */
      const h = competition === 'hard'
        ? (gd === 0 ? 1 : 0)
        : Math.exp(-gd*gd/(2*sg*sg))
      n.w[0] = cl(n.w[0] + lr*h*(pt.x - n.w[0]))
      n.w[1] = cl(n.w[1] + lr*h*(pt.y - n.w[1]))
    })
  }

  let qeSum = 0
  data.forEach(pt => {
    qeSum += Math.min(...ns.map(n => Math.hypot(n.w[0]-pt.x, n.w[1]-pt.y)))
  })

  return {
    neurons: ns,
    qe:    (qeSum/data.length).toFixed(4),
    lr:    lr.toFixed(3),
    sigma: competition==='hard' ? '—' : sg.toFixed(2),
  }
}

/* ── Constants ──────────────────────────────────────────────────────────── */
const GRID_OPTS  = [{ w:3,h:3 },{ w:4,h:4 },{ w:5,h:5 }]
const SPEEDS     = { lento:700, normal:260, rápido:55 }
const PAD=42, SVG_W=480, SVG_H=430

/* ── Reusable pill button ─────────────────────────────────────────────── */
function Pill({ active, onClick, accent, children }) {
  return (
    <button onClick={onClick}
      className="flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all"
      style={{
        background: active ? `rgba(${accent},0.30)` : `rgba(${accent},0.07)`,
        color:      active ? `rgb(${accent})`       : '#475569',
        border: `1px solid ${active ? `rgba(${accent},0.6)` : `rgba(${accent},0.18)`}`,
        minHeight: '36px',
      }}
    >{children}</button>
  )
}

/* ── Component ─────────────────────────────────────────────────────────── */
export default function SOMTrainerSlide() {
  const [dsKey,    setDsKey]    = useState('clusters')
  const [gridIdx,  setGridIdx]  = useState(1)
  const [speedKey, setSpeedKey] = useState('normal')
  const [compMode, setCompMode] = useState('soft')   // 'soft' | 'hard'
  const [running,  setRunning]  = useState(false)
  const [epoch,    setEpoch]    = useState(0)
  const [stats,    setStats]    = useState({ qe:'—', lr:'—', sigma:'—' })
  const [neurons,  setNeurons]  = useState([])
  const [data,     setData]     = useState([])

  const dataRef     = useRef([])
  const neuronsRef  = useRef([])
  const epochRef    = useRef(0)
  const intervalRef = useRef(null)
  const stepRef     = useRef(null)
  const compRef     = useRef(compMode)

  const { w:GW, h:GH } = GRID_OPTS[gridIdx]

  const xS = v => PAD + v*(SVG_W-PAD*2)
  const yS = v => PAD + (1-v)*(SVG_H-PAD*2)

  /* reset */
  const reset = useCallback(() => {
    clearInterval(intervalRef.current)
    setRunning(false)
    epochRef.current = 0
    setEpoch(0)
    setStats({ qe:'—', lr:'—', sigma:'—' })
    const d  = DATASETS[dsKey]()
    const ns = initNeurons(GW, GH, d)
    dataRef.current    = d
    neuronsRef.current = ns
    setData([...d])
    setNeurons([...ns])
  }, [dsKey, GW, GH])

  useEffect(() => { reset() }, [dsKey, gridIdx]) // eslint-disable-line

  /* update compRef so runStep always uses latest */
  useEffect(() => { compRef.current = compMode }, [compMode])

  /* training step */
  const runStep = useCallback(() => {
    if (epochRef.current >= TOTAL_EPOCHS) {
      clearInterval(intervalRef.current)
      setRunning(false)
      return
    }
    const result = somEpoch(neuronsRef.current, dataRef.current,
                             epochRef.current, GW, GH, compRef.current)
    neuronsRef.current = result.neurons
    epochRef.current  += 1
    setNeurons([...result.neurons])
    setEpoch(epochRef.current)
    setStats({ qe:result.qe, lr:result.lr, sigma:result.sigma })
  }, [GW, GH])

  useEffect(() => { stepRef.current = runStep }, [runStep])

  /* speed change while running */
  useEffect(() => {
    if (running) {
      clearInterval(intervalRef.current)
      intervalRef.current = setInterval(() => stepRef.current?.(), SPEEDS[speedKey])
    }
  }, [speedKey, running])

  useEffect(() => () => clearInterval(intervalRef.current), [])

  const startStop = () => {
    if (running) {
      clearInterval(intervalRef.current)
      setRunning(false)
    } else {
      if (epochRef.current >= TOTAL_EPOCHS) {
        const d  = DATASETS[dsKey]()
        const ns = initNeurons(GW, GH, d)
        dataRef.current    = d
        neuronsRef.current = ns
        epochRef.current   = 0
        setData([...d])
        setNeurons([...ns])
        setEpoch(0)
        setStats({ qe:'—', lr:'—', sigma:'—' })
      }
      setRunning(true)
      intervalRef.current = setInterval(() => stepRef.current?.(), SPEEDS[speedKey])
    }
  }

  /* grid connections */
  const connections = []
  neurons.forEach(n => {
    const right = neurons.find(m => m.i===n.i && m.j===n.j+1)
    const down  = neurons.find(m => m.i===n.i+1 && m.j===n.j)
    if (right) connections.push([n,right])
    if (down)  connections.push([n,down])
  })

  const epPct = Math.min(1, epoch/TOTAL_EPOCHS)
  const isSoft = compMode === 'soft'

  return (
    <div className="w-full h-full flex flex-col px-10 pt-14 pb-3 gap-3">
      {/* Title */}
      <motion.h2 initial={{ opacity:0, y:-18 }} animate={{ opacity:1, y:0 }}
        className="text-4xl font-black gradient-text shrink-0">
        Demo en Vivo — Entrenamiento SOM
      </motion.h2>

      <div className="flex gap-5 flex-1 min-h-0">

        {/* ── Visualization ── */}
        <div className="flex-1 min-h-0">
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            preserveAspectRatio="xMidYMid meet"
            style={{
              width:'100%', height:'100%',
              background:'rgba(13,13,43,0.8)',
              borderRadius:14,
              border:'1px solid rgba(99,102,241,0.25)',
              display:'block',
            }}
          >
            {/* Background grid */}
            {[0,0.25,0.5,0.75,1].map(v => (
              <g key={v}>
                <line x1={xS(v)} y1={PAD} x2={xS(v)} y2={SVG_H-PAD}
                  stroke="rgba(99,102,241,0.07)" strokeWidth={1}/>
                <line x1={PAD} y1={yS(v)} x2={SVG_W-PAD} y2={yS(v)}
                  stroke="rgba(99,102,241,0.07)" strokeWidth={1}/>
              </g>
            ))}
            {/* Axes */}
            <line x1={PAD} y1={SVG_H-PAD} x2={SVG_W-PAD} y2={SVG_H-PAD}
              stroke="rgba(148,163,184,0.25)" strokeWidth={1}/>
            <line x1={PAD} y1={PAD} x2={PAD} y2={SVG_H-PAD}
              stroke="rgba(148,163,184,0.25)" strokeWidth={1}/>
            {/* Data points */}
            {data.map((pt,i) => (
              <circle key={i} cx={xS(pt.x)} cy={yS(pt.y)} r={3.5}
                fill={pt.color} opacity={0.72}/>
            ))}
            {/* Connections */}
            {connections.map(([a,b],i) => (
              <line key={i}
                x1={xS(a.w[0])} y1={yS(a.w[1])}
                x2={xS(b.w[0])} y2={yS(b.w[1])}
                stroke={isSoft ? 'rgba(139,92,246,0.65)' : 'rgba(244,63,94,0.60)'}
                strokeWidth={1.6}/>
            ))}
            {/* Neurons */}
            {neurons.map((n,i) => (
              <motion.g key={`n-${i}`}
                animate={{ x:xS(n.w[0]), y:yS(n.w[1]) }}
                initial={{ x:xS(n.w[0]), y:yS(n.w[1]) }}
                transition={{ duration:0.18, ease:'easeOut' }}
              >
                <circle cx={0} cy={0} r={9}
                  fill={isSoft ? 'rgba(124,58,237,0.2)' : 'rgba(244,63,94,0.2)'}/>
                <circle cx={0} cy={0} r={6}
                  fill={isSoft ? '#7c3aed' : '#e11d48'}
                  stroke="#e2e8f0" strokeWidth={1.5} opacity={0.92}/>
              </motion.g>
            ))}
            {/* Axis labels */}
            <text x={SVG_W/2} y={SVG_H-8} textAnchor="middle" fill="#475569" fontSize={11}>x₁</text>
            <text x={14} y={SVG_H/2} textAnchor="middle" fill="#475569" fontSize={11}
              transform={`rotate(-90,14,${SVG_H/2})`}>x₂</text>
            {/* Mode badge */}
            <rect x={SVG_W-PAD-80} y={PAD+2} width={76} height={17} rx={8}
              fill={isSoft ? 'rgba(139,92,246,0.25)' : 'rgba(244,63,94,0.22)'}
              stroke={isSoft ? 'rgba(139,92,246,0.5)' : 'rgba(244,63,94,0.5)'}/>
            <text x={SVG_W-PAD-42} y={PAD+13.5} textAnchor="middle"
              fill={isSoft ? '#a78bfa' : '#f43f5e'} fontSize={9} fontWeight="bold">
              {isSoft ? 'Competencia Suave' : 'Competencia Dura'}
            </text>
          </svg>
        </div>

        {/* ── Controls & Stats ── */}
        <div className="flex flex-col gap-2.5 shrink-0" style={{ width:268 }}>

          {/* Competition mode */}
          <div className="glass-card px-4 py-3">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
              Modo de competencia
            </p>
            <div className="flex gap-1.5">
              <button onClick={() => { setCompMode('soft'); if(!running) reset() }}
                className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: isSoft ? 'rgba(139,92,246,0.30)' : 'rgba(139,92,246,0.07)',
                  color:      isSoft ? '#a78bfa' : '#475569',
                  border:`1px solid ${isSoft ? 'rgba(139,92,246,0.6)' : 'rgba(139,92,246,0.18)'}`,
                  minHeight:'36px',
                }}>
                🌐 Suave
              </button>
              <button onClick={() => { setCompMode('hard'); if(!running) reset() }}
                className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: !isSoft ? 'rgba(244,63,94,0.25)' : 'rgba(244,63,94,0.07)',
                  color:      !isSoft ? '#f43f5e' : '#475569',
                  border:`1px solid ${!isSoft ? 'rgba(244,63,94,0.55)' : 'rgba(244,63,94,0.18)'}`,
                  minHeight:'36px',
                }}>
                ⚡ Dura
              </button>
            </div>
            <p className="text-xs mt-1.5 leading-tight" style={{ color: isSoft ? '#64748b' : '#64748b' }}>
              {isSoft
                ? 'Suave: h gaussiana — neuronas vecinas también se actualizan.'
                : 'Dura: solo el BMU se actualiza (h=0 para vecinas).'}
            </p>
          </div>

          {/* Dataset */}
          <div className="glass-card px-4 py-3">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Dataset</p>
            <div className="flex gap-1.5">
              {Object.keys(DATASETS).map(k => (
                <button key={k} onClick={() => setDsKey(k)}
                  className="flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all"
                  style={{
                    background: dsKey===k ? 'rgba(99,102,241,0.35)' : 'rgba(99,102,241,0.08)',
                    color:      dsKey===k ? '#818cf8' : '#475569',
                    border:`1px solid ${dsKey===k ? 'rgba(99,102,241,0.6)' : 'rgba(99,102,241,0.18)'}`,
                    minHeight:'36px',
                  }}>
                  {k}
                </button>
              ))}
            </div>
          </div>

          {/* Grid size */}
          <div className="glass-card px-4 py-3">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Cuadrícula</p>
            <div className="flex gap-1.5">
              {GRID_OPTS.map((g,idx) => (
                <button key={idx} onClick={() => setGridIdx(idx)}
                  className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: gridIdx===idx ? 'rgba(139,92,246,0.35)' : 'rgba(139,92,246,0.08)',
                    color:      gridIdx===idx ? '#a78bfa' : '#475569',
                    border:`1px solid ${gridIdx===idx ? 'rgba(139,92,246,0.6)' : 'rgba(139,92,246,0.18)'}`,
                    minHeight:'36px',
                  }}>
                  {g.w}×{g.h}
                </button>
              ))}
            </div>
          </div>

          {/* Speed */}
          <div className="glass-card px-4 py-3">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Velocidad</p>
            <div className="flex gap-1.5">
              {Object.keys(SPEEDS).map(k => (
                <button key={k} onClick={() => setSpeedKey(k)}
                  className="flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all"
                  style={{
                    background: speedKey===k ? 'rgba(245,158,11,0.25)' : 'rgba(245,158,11,0.07)',
                    color:      speedKey===k ? '#f59e0b' : '#475569',
                    border:`1px solid ${speedKey===k ? 'rgba(245,158,11,0.5)' : 'rgba(245,158,11,0.15)'}`,
                    minHeight:'36px',
                  }}>
                  {k}
                </button>
              ))}
            </div>
          </div>

          {/* Play / Reset */}
          <div className="flex gap-2">
            <button onClick={startStop}
              className="flex-1 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
              style={{
                background: running ? 'rgba(244,63,94,0.22)' : 'rgba(16,185,129,0.22)',
                color:      running ? '#f43f5e' : '#10b981',
                border:`1.5px solid ${running ? 'rgba(244,63,94,0.5)' : 'rgba(16,185,129,0.5)'}`,
                minHeight:'44px',
              }}>
              {running ? '⏸ Pausar' : epoch>=TOTAL_EPOCHS ? '↺ Reiniciar' : '▶ Iniciar'}
            </button>
            <button onClick={reset}
              className="px-4 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
              style={{
                background:'rgba(99,102,241,0.14)', color:'#6366f1',
                border:'1.5px solid rgba(99,102,241,0.35)',
                minHeight:'44px',
              }}>
              ↺
            </button>
          </div>

          {/* Progress */}
          <div className="glass-card px-4 py-2.5">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>Época</span>
              <span className="font-mono font-bold text-indigo-400">{epoch} / {TOTAL_EPOCHS}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(99,102,241,0.14)' }}>
              <motion.div className="h-full rounded-full"
                style={{ background:'linear-gradient(90deg,#6366f1,#8b5cf6)' }}
                animate={{ width:`${epPct*100}%` }} transition={{ duration:0.2 }}/>
            </div>
          </div>

          {/* Live stats */}
          <div className="glass-card px-4 py-3">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Parámetros</p>
            {[
              { label:'QE',        value:stats.qe,    color:'#f59e0b' },
              { label:'α (LR)',    value:stats.lr,    color:'#10b981' },
              { label:'σ (radio)', value:stats.sigma, color:'#818cf8' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-center py-0.5">
                <span className="text-xs text-slate-400">{label}</span>
                <span className="font-mono font-bold text-sm" style={{ color }}>{value}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
