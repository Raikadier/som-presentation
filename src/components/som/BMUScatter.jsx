import React, { useRef, useEffect, useCallback, useState } from 'react'
import * as d3 from 'd3'
import { motion } from 'framer-motion'
import { neurons, samples } from '../../data/somData'

const BASE_W = 520
const BASE_H = 480
const PAD = 58

export default function BMUScatter({ step = 0 }) {
  const svgRef = useRef(null)
  const zoomRef = useRef(null)
  const gMainRef = useRef(null)
  const [zoomLevel, setZoomLevel] = useState(1)

  // ── Build the chart (no zoom transform) ─────────────────────────────────
  const draw = useCallback((svg, g) => {
    g.selectAll('*').remove()

    const xScale = d3.scaleLinear().domain([0, 1]).range([PAD, BASE_W - PAD])
    const yScale = d3.scaleLinear().domain([0, 1]).range([BASE_H - PAD, PAD])

    // Background grid
    const gridVals = [0, 0.25, 0.5, 0.75, 1.0]
    const gridG = g.append('g')
    gridVals.forEach(v => {
      gridG.append('line')
        .attr('x1', xScale(v)).attr('y1', yScale(0))
        .attr('x2', xScale(v)).attr('y2', yScale(1))
        .attr('stroke', 'rgba(99,102,241,0.12)').attr('stroke-width', 1)
      gridG.append('line')
        .attr('x1', xScale(0)).attr('y1', yScale(v))
        .attr('x2', xScale(1)).attr('y2', yScale(v))
        .attr('stroke', 'rgba(99,102,241,0.12)').attr('stroke-width', 1)
    })

    // Axes
    const axG = g.append('g')
    axG.append('line')
      .attr('x1', PAD).attr('y1', BASE_H - PAD)
      .attr('x2', BASE_W - PAD).attr('y2', BASE_H - PAD)
      .attr('stroke', 'rgba(148,163,184,0.45)').attr('stroke-width', 1.5)
    axG.append('line')
      .attr('x1', PAD).attr('y1', PAD)
      .attr('x2', PAD).attr('y2', BASE_H - PAD)
      .attr('stroke', 'rgba(148,163,184,0.45)').attr('stroke-width', 1.5)

    // Tick labels
    const ticks = [0, 0.25, 0.5, 0.75, 1.0]
    ticks.forEach(v => {
      g.append('text')
        .attr('x', xScale(v)).attr('y', BASE_H - PAD + 18)
        .attr('text-anchor', 'middle').attr('fill', '#64748b').attr('font-size', 11)
        .text(v.toFixed(2))
      g.append('text')
        .attr('x', PAD - 12).attr('y', yScale(v) + 4)
        .attr('text-anchor', 'end').attr('fill', '#64748b').attr('font-size', 11)
        .text(v.toFixed(2))
    })

    // Axis labels
    g.append('text')
      .attr('x', BASE_W / 2).attr('y', BASE_H - 8)
      .attr('text-anchor', 'middle').attr('fill', '#94a3b8').attr('font-size', 13)
      .attr('font-weight', '600').text('x₁')
    g.append('text')
      .attr('x', 16).attr('y', BASE_H / 2)
      .attr('text-anchor', 'middle').attr('fill', '#94a3b8').attr('font-size', 13)
      .attr('font-weight', '600')
      .attr('transform', `rotate(-90, 16, ${BASE_H / 2})`).text('x₂')

    // ── Distance lines for current step ──
    if (step > 0 && step <= samples.length) {
      const cur = samples[step - 1]
      neurons.forEach(neuron => {
        const isBMU = neuron.id === cur.bmu
        if (neuron.isDead) return

        const realDist = Math.sqrt(
          Math.pow(neuron.weights[0] - cur.x1, 2) +
          Math.pow(neuron.weights[1] - cur.x2, 2)
        ).toFixed(3)

        g.append('line')
          .attr('x1', xScale(cur.x1)).attr('y1', yScale(cur.x2))
          .attr('x2', xScale(neuron.weights[0])).attr('y2', yScale(neuron.weights[1]))
          .attr('stroke', isBMU ? neuron.color : 'rgba(148,163,184,0.35)')
          .attr('stroke-width', isBMU ? 2.5 : 1.2)
          .attr('stroke-dasharray', isBMU ? 'none' : '5,4')
          .attr('opacity', isBMU ? 1 : 0.65)

        const midX = (xScale(cur.x1) + xScale(neuron.weights[0])) / 2
        const midY = (yScale(cur.x2) + yScale(neuron.weights[1])) / 2

        if (isBMU) {
          g.append('rect')
            .attr('x', midX - 22).attr('y', midY - 13)
            .attr('width', 44).attr('height', 16)
            .attr('rx', 4).attr('ry', 4)
            .attr('fill', 'rgba(13,13,43,0.85)')
          g.append('text')
            .attr('x', midX).attr('y', midY - 1)
            .attr('text-anchor', 'middle')
            .attr('fill', neuron.color)
            .attr('font-size', 11).attr('font-weight', 'bold')
            .text(`d=${realDist}`)
        } else {
          g.append('text')
            .attr('x', midX + 6).attr('y', midY - 4)
            .attr('text-anchor', 'middle')
            .attr('fill', 'rgba(148,163,184,0.65)')
            .attr('font-size', 9.5)
            .text(realDist)
        }
      })
    }

    // ── Past assignment traces ──
    for (let i = 0; i < Math.min(step - 1, samples.length); i++) {
      const s = samples[i]
      const n = neurons.find(n => n.id === s.bmu)
      if (!n) continue
      g.append('line')
        .attr('x1', xScale(s.x1)).attr('y1', yScale(s.x2))
        .attr('x2', xScale(n.weights[0])).attr('y2', yScale(n.weights[1]))
        .attr('stroke', s.correct ? '#10b981' : '#f59e0b')
        .attr('stroke-width', 1)
        .attr('opacity', 0.2)
    }

    // ── Neuron diamonds ──
    neurons.forEach(neuron => {
      const x = xScale(neuron.weights[0])
      const y = yScale(neuron.weights[1])
      const sz = 13

      // Glow halo
      if (!neuron.isDead) {
        g.append('ellipse')
          .attr('cx', x).attr('cy', y)
          .attr('rx', sz + 8).attr('ry', sz + 8)
          .attr('fill', neuron.color)
          .attr('opacity', 0.12)
      }

      g.append('polygon')
        .attr('points', `${x},${y - sz} ${x + sz},${y} ${x},${y + sz} ${x - sz},${y}`)
        .attr('fill', neuron.color)
        .attr('opacity', neuron.isDead ? 0.35 : 1)
        .attr('stroke', '#f1f5f9')
        .attr('stroke-width', 1.8)

      // Label background
      g.append('rect')
        .attr('x', x + sz + 2).attr('y', y - 14)
        .attr('width', 26).attr('height', 15)
        .attr('rx', 3).attr('fill', 'rgba(13,13,43,0.75)')
      g.append('text')
        .attr('x', x + sz + 15).attr('y', y - 3)
        .attr('text-anchor', 'middle')
        .attr('fill', neuron.isDead ? '#475569' : neuron.color)
        .attr('font-size', 11.5).attr('font-weight', 'bold')
        .text(neuron.id)

      if (neuron.isDead) {
        g.append('text')
          .attr('x', x).attr('y', y + sz + 14)
          .attr('text-anchor', 'middle')
          .attr('fill', '#475569').attr('font-size', 10)
          .text('(muerta)')
      }
    })

    // ── Data points ──
    samples.forEach((sample, idx) => {
      const isActive = step > 0 && idx === step - 1
      const isDone   = idx < step - 1
      const x = xScale(sample.x1)
      const y = yScale(sample.x2)
      const color = sample.class === 'A' ? '#10b981' : '#f43f5e'
      const r = isActive ? 10 : 7.5

      // Animated pulse ring for active
      if (isActive) {
        g.append('circle')
          .attr('cx', x).attr('cy', y).attr('r', 20)
          .attr('fill', 'none').attr('stroke', color)
          .attr('stroke-width', 1.8).attr('opacity', 0.55)
          .attr('stroke-dasharray', '4,3')
      }

      g.append('circle')
        .attr('cx', x).attr('cy', y).attr('r', r)
        .attr('fill', color)
        .attr('opacity', isActive ? 1 : (isDone ? 0.65 : 0.88))
        .attr('stroke', isActive ? '#f1f5f9' : 'none')
        .attr('stroke-width', 2)

      // Label
      const labelY = isActive ? y - 14 : y - 11
      if (isActive) {
        g.append('rect')
          .attr('x', x - 13).attr('y', labelY - 10)
          .attr('width', 26).attr('height', 14)
          .attr('rx', 3).attr('fill', 'rgba(13,13,43,0.85)')
      }
      g.append('text')
        .attr('x', x).attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('fill', isActive ? '#f1f5f9' : 'rgba(241,245,249,0.55)')
        .attr('font-size', isActive ? 11.5 : 9)
        .attr('font-weight', isActive ? 'bold' : 'normal')
        .text(sample.id)

      // Misclassification badge
      if (isActive && !sample.correct) {
        g.append('text')
          .attr('x', x + 14).attr('y', y + 5)
          .attr('fill', '#f59e0b').attr('font-size', 13)
          .text('⚠')
      }
    })
  }, [step])

  // ── Init SVG & zoom ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // Clip path to prevent overflow
    svg.append('defs').append('clipPath')
      .attr('id', 'bmu-clip')
      .append('rect')
      .attr('x', 0).attr('y', 0)
      .attr('width', BASE_W).attr('height', BASE_H)

    const g = svg.append('g').attr('clip-path', 'url(#bmu-clip)')
    gMainRef.current = g

    const zoom = d3.zoom()
      .scaleExtent([0.6, 5])
      .translateExtent([[-80, -80], [BASE_W + 80, BASE_H + 80]])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString())
        setZoomLevel(+event.transform.k.toFixed(2))
      })

    zoomRef.current = zoom
    svg.call(zoom)

    // Scroll-wheel hint: prevent page scroll when hovering chart
    svgRef.current.addEventListener('wheel', e => e.preventDefault(), { passive: false })

    draw(svg, g)
  }, [])

  // ── Re-draw when step changes ─────────────────────────────────────────────
  useEffect(() => {
    if (!svgRef.current || !gMainRef.current) return
    const svg = d3.select(svgRef.current)
    draw(svg, gMainRef.current)
  }, [step, draw])

  const handleZoom = (factor) => {
    if (!svgRef.current || !zoomRef.current) return
    d3.select(svgRef.current)
      .transition().duration(280)
      .call(zoomRef.current.scaleBy, factor)
  }

  const handleReset = () => {
    if (!svgRef.current || !zoomRef.current) return
    d3.select(svgRef.current)
      .transition().duration(320)
      .call(zoomRef.current.transform, d3.zoomIdentity)
  }

  const activeSample = step > 0 && step <= samples.length ? samples[step - 1] : null
  const bmuNeuron = activeSample ? neurons.find(n => n.id === activeSample.bmu) : null

  return (
    <div className="flex flex-col items-center gap-2 w-full h-full min-h-0">
      {/* Chart — fills available space via viewBox */}
      <div className="relative w-full flex-1 min-h-0">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${BASE_W} ${BASE_H}`}
          preserveAspectRatio="xMidYMid meet"
          style={{
            width: '100%',
            height: '100%',
            background: 'rgba(13,13,43,0.75)',
            borderRadius: 14,
            border: '1px solid rgba(99,102,241,0.28)',
            cursor: 'grab',
            display: 'block',
          }}
        />

        {/* Zoom controls overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          <button
            onClick={() => handleZoom(1.5)}
            title="Zoom in"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all hover:scale-110"
            style={{ background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.45)', color: '#818cf8' }}
          >
            +
          </button>
          <button
            onClick={() => handleZoom(1 / 1.5)}
            title="Zoom out"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all hover:scale-110"
            style={{ background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.45)', color: '#818cf8' }}
          >
            −
          </button>
          <button
            onClick={handleReset}
            title="Reset zoom"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all hover:scale-110"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#64748b' }}
          >
            ↺
          </button>
        </div>

        {/* Zoom level badge */}
        <div
          className="absolute bottom-3 right-3 text-xs font-mono px-2 py-0.5 rounded"
          style={{ background: 'rgba(13,13,43,0.8)', color: '#475569', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          {(zoomLevel * 100).toFixed(0)}%
        </div>

        {/* Scroll hint */}
        <div
          className="absolute bottom-3 left-3 text-xs px-2 py-0.5 rounded"
          style={{ background: 'rgba(13,13,43,0.8)', color: '#334155', border: '1px solid rgba(99,102,241,0.15)' }}
        >
          🖱 scroll / drag
        </div>
      </div>

      {/* Active sample caption */}
      {activeSample && (
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="text-center text-xs"
        >
          <span className="text-slate-400">Muestra activa:</span>{' '}
          <span className="font-black text-white">{activeSample.id}</span>
          <span className="text-slate-500 mx-1">→</span>
          <span className="text-slate-400">BMU:</span>{' '}
          <span className="font-black" style={{ color: bmuNeuron?.color }}>{activeSample.bmu}</span>
          <span className="text-slate-500 mx-1">|</span>
          <span className="text-slate-400">dist =</span>{' '}
          <span className="font-mono font-bold text-amber-400">{activeSample.dist}</span>
          {!activeSample.correct && (
            <span className="ml-2 text-amber-400 font-bold">⚠ mal clasificada</span>
          )}
        </motion.div>
      )}
    </div>
  )
}
