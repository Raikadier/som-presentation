import React, { useEffect, useRef } from 'react'

const NUM_NODES = 58
const MAX_DIST  = 135
const SPEED     = 0.18

function rand(a, b) { return a + Math.random() * (b - a) }

export default function NeuralBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let W = 0, H = 0

    const nodes = Array.from({ length: NUM_NODES }, () => ({
      x: 0, y: 0,
      vx: rand(-SPEED, SPEED),
      vy: rand(-SPEED, SPEED),
    }))

    function resize() {
      W = canvas.width  = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
      nodes.forEach(n => {
        if (n.x === 0 && n.y === 0) {
          n.x = rand(0, W)
          n.y = rand(0, H)
        }
      })
    }

    function tick() {
      ctx.clearRect(0, 0, W, H)

      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy
        if (n.x < 0 || n.x > W) n.vx *= -1
        if (n.y < 0 || n.y > H) n.vy *= -1
      })

      // connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const d  = Math.sqrt(dx * dx + dy * dy)
          if (d < MAX_DIST) {
            const a = (1 - d / MAX_DIST) * 0.13
            ctx.strokeStyle = `rgba(99,102,241,${a})`
            ctx.lineWidth   = 0.7
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }

      // nodes
      nodes.forEach(n => {
        ctx.beginPath()
        ctx.arc(n.x, n.y, 1.4, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(139,92,246,0.32)'
        ctx.fill()
      })

      animId = requestAnimationFrame(tick)
    }

    resize()
    tick()

    const obs = new ResizeObserver(resize)
    obs.observe(canvas)
    return () => { cancelAnimationFrame(animId); obs.disconnect() }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}
