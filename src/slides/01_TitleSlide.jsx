import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

/* ── Animated SOM heatmap — fills the entire slide background ─────────── */
function SOMCanvas() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    /* Grid dimensions */
    const COLS = 10, ROWS = 6

    /*
     * Four corner colours → bilinear interpolation gives each neuron a
     * smooth, distinct hue, mimicking a real trained-SOM topology map.
     */
    const CORNERS = [
      [79,  70, 229],   // TL — deep indigo
      [16, 185, 129],   // TR — emerald
      [168, 85, 247],   // BL — violet
      [244, 63,  94],   // BR — rose
    ]

    const lerp  = (a, b, t) => a + (b - a) * t
    const lerpC = (a, b, t) => a.map((v, i) => lerp(v, b[i], t))

    function nodeColor(ri, ci) {
      const nx = ci / (COLS - 1)
      const ny = ri / (ROWS - 1)
      return lerpC(
        lerpC(CORNERS[0], CORNERS[1], nx),
        lerpC(CORNERS[2], CORNERS[3], nx),
        ny,
      )
    }

    /* Ripple system */
    let ripples     = []
    let lastRippleT = -99
    let animId

    function draw(ts) {
      const t = ts / 1000
      const W = canvas.width, H = canvas.height

      /* Spawn one ripple every ~3.2 s from a random neuron */
      if (t - lastRippleT > 3.2) {
        ripples.push({
          ci:   Math.floor(Math.random() * COLS),
          ri:   Math.floor(Math.random() * ROWS),
          born: t,
        })
        lastRippleT = t
      }
      ripples = ripples.filter(r => t - r.born < 3.8)

      ctx.clearRect(0, 0, W, H)

      /* Node grid — padded so neurons don't sit on the raw edges */
      const PX = W * 0.045, PY = H * 0.08
      const stepX = (W - PX * 2) / (COLS - 1)
      const stepY = (H - PY * 2) / (ROWS - 1)

      const nodes = []
      for (let ri = 0; ri < ROWS; ri++) {
        for (let ci = 0; ci < COLS; ci++) {
          const x = PX + ci * stepX
          const y = PY + ri * stepY

          /* Slow breathing pulse (different phase per neuron) */
          const pulse = 1 + Math.sin(t * 1.15 + ri * 0.9 + ci * 0.65) * 0.11

          /* Ripple contribution */
          let boost = 0
          for (const r of ripples) {
            const age  = t - r.born
            const dist = Math.hypot(ci - r.ci, ri - r.ri)
            const wave = Math.sin(age * 3.0 - dist * 1.4)
                       * Math.exp(-age  * 0.85)
                       * Math.exp(-dist * 0.38)
            boost += Math.max(0, wave)
          }

          nodes.push({ x, y, pulse, boost, color: nodeColor(ri, ci), ri, ci })
        }
      }

      /* ── Connections ─────────────────────────────────────────── */
      for (const n of nodes) {
        const neighbors = [
          nodes.find(m => m.ri === n.ri     && m.ci === n.ci + 1),
          nodes.find(m => m.ri === n.ri + 1 && m.ci === n.ci),
        ].filter(Boolean)

        for (const nb of neighbors) {
          const alpha = 0.18 + Math.max(n.boost, nb.boost) * 0.42
          const [r1, g1, b1] = n.color
          const [r2, g2, b2] = nb.color
          const grad = ctx.createLinearGradient(n.x, n.y, nb.x, nb.y)
          grad.addColorStop(0, `rgba(${r1 | 0},${g1 | 0},${b1 | 0},${alpha.toFixed(2)})`)
          grad.addColorStop(1, `rgba(${r2 | 0},${g2 | 0},${b2 | 0},${alpha.toFixed(2)})`)
          ctx.beginPath()
          ctx.moveTo(n.x, n.y)
          ctx.lineTo(nb.x, nb.y)
          ctx.strokeStyle = grad
          ctx.lineWidth   = 1.4 + n.boost * 1.2
          ctx.stroke()
        }
      }

      /* ── Neurons ─────────────────────────────────────────────── */
      for (const n of nodes) {
        const [r, g, b] = n.color
        const rad = 11 * n.pulse + n.boost * 9

        /* Outer glow halo */
        const haloR = rad * 2.9
        const glowA = (0.09 + n.boost * 0.22).toFixed(2)
        const halo  = ctx.createRadialGradient(n.x, n.y, rad * 0.5, n.x, n.y, haloR)
        halo.addColorStop(0, `rgba(${r | 0},${g | 0},${b | 0},${glowA})`)
        halo.addColorStop(1, `rgba(${r | 0},${g | 0},${b | 0},0)`)
        ctx.beginPath()
        ctx.arc(n.x, n.y, haloR, 0, Math.PI * 2)
        ctx.fillStyle = halo
        ctx.fill()

        /* Core with inner radial gradient (subtle highlight) */
        const rr = Math.min(255, (r | 0) + 55)
        const gg = Math.min(255, (g | 0) + 55)
        const bb = Math.min(255, (b | 0) + 55)
        const core = ctx.createRadialGradient(
          n.x - rad * 0.28, n.y - rad * 0.28, 0,
          n.x, n.y, rad,
        )
        core.addColorStop(0, `rgba(${rr},${gg},${bb},0.92)`)
        core.addColorStop(1, `rgba(${r | 0},${g | 0},${b | 0},0.72)`)
        ctx.beginPath()
        ctx.arc(n.x, n.y, rad, 0, Math.PI * 2)
        ctx.fillStyle = core
        ctx.fill()
      }

      animId = requestAnimationFrame(draw)
    }

    function resize() {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    resize()
    animId = requestAnimationFrame(draw)
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    return () => { cancelAnimationFrame(animId); ro.disconnect() }
  }, [])

  return (
    <canvas
      ref={ref}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        opacity: 0.72,
      }}
    />
  )
}

/* ── Stagger helper ─────────────────────────────────────────────────────── */
const fadeUp = (delay, y = 24, blur = false) => ({
  initial: { opacity: 0, y, ...(blur ? { filter: 'blur(10px)' } : {}) },
  animate: {
    opacity: 1, y: 0, ...(blur ? { filter: 'blur(0px)' } : {}),
    transition: { delay, duration: 0.85, ease: [0.25, 0.46, 0.45, 0.94] },
  },
})

/* ── TitleSlide ─────────────────────────────────────────────────────────── */
export default function TitleSlide() {
  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden">

      {/* SOM heatmap background */}
      <SOMCanvas />

      {/*
        Radial dark mask — very dark in the centre (text lives here)
        and fades to near-transparent at the edges (SOM visible).
      */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 62% 74% at 50% 50%, ' +
            'rgba(4,4,15,0.92) 0%, ' +
            'rgba(4,4,15,0.68) 42%, ' +
            'rgba(4,4,15,0.16) 78%, ' +
            'transparent 100%)',
        }}
      />

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="relative z-10 text-center px-10 max-w-4xl w-full flex flex-col items-center">

        {/* Eyebrow badge */}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.65 }}
          className="text-xs font-bold uppercase px-5 py-1.5 rounded-full mb-7"
          style={{
            letterSpacing: '0.2em',
            background: 'rgba(99,102,241,0.12)',
            color:      '#818cf8',
            border:     '1px solid rgba(99,102,241,0.38)',
          }}
        >
          Inteligencia Artificial — Corte 3
        </motion.div>

        {/* Main title — blur-in entrance */}
        <motion.h1
          {...fadeUp(0.35, 36, true)}
          className="font-black leading-none gradient-text mb-3"
          style={{ fontSize: 'clamp(2.6rem, 5vw, 4.6rem)' }}
        >
          Métricas de Evaluación
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          {...fadeUp(0.65, 18)}
          className="text-slate-300 font-light mb-8"
          style={{ fontSize: 'clamp(0.95rem, 1.7vw, 1.3rem)', letterSpacing: '0.03em' }}
        >
          Mapas Autoorganizados de Kohonen&nbsp;(SOM)
        </motion.p>

        {/* Animated gradient divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.9, duration: 1.0, ease: 'easeInOut' }}
          style={{
            width: 240, height: 1,
            background:
              'linear-gradient(90deg, transparent, rgba(99,102,241,0.75), rgba(139,92,246,0.75), transparent)',
            transformOrigin: 'center',
            marginBottom: 26,
          }}
        />

        {/* Author block */}
        <motion.div
          {...fadeUp(1.05, 12)}
          className="flex flex-col items-center gap-1.5"
        >
          <p className="text-slate-200 font-medium tracking-wide"
            style={{ fontSize: 'clamp(0.85rem, 1.4vw, 1rem)' }}>
            David Santiago Barceló Terán
          </p>
          <p className="text-slate-500 text-sm">
            Grupo 03&nbsp;&nbsp;·&nbsp;&nbsp;Universidad Popular del Cesar&nbsp;&nbsp;·&nbsp;&nbsp;2026-I
          </p>
        </motion.div>

        {/* Start hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.45, duration: 0.8 }}
          className="text-slate-600 text-xs mt-10"
        >
          Presiona&nbsp;
          <kbd
            className="px-1.5 py-0.5 rounded text-slate-500"
            style={{
              background: 'rgba(99,102,241,0.1)',
              border:     '1px solid rgba(99,102,241,0.28)',
            }}
          >
            →
          </kbd>
          &nbsp;para comenzar
        </motion.p>
      </div>
    </div>
  )
}
