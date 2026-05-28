/**
 * ZoomableSVG
 * Wraps any content (SVG or otherwise) inside a pan-and-zoom container.
 *
 * Controls:
 *   Mouse wheel   → zoom in / out
 *   Click + drag  → pan (only when zoomed in)
 *   Pinch         → zoom in / out (touch)
 *   Two-finger drag → pan (touch)
 *   Double-click  → reset
 *
 * Touch events call stopPropagation() so they don't bubble up to the
 * slide-swipe navigation handler in App.jsx.
 */
import React, { useRef, useState, useCallback, useEffect } from 'react'

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

export default function ZoomableSVG({
  children,
  minScale = 0.85,
  maxScale = 6,
}) {
  const containerRef = useRef(null)
  const [t, setT]    = useState({ scale: 1, x: 0, y: 0 })
  const dragRef      = useRef(null)     // { startX, startY, startTX, startTY }
  const pinchRef     = useRef(null)     // { dist, cx, cy }

  /* ── wheel zoom ── */
  const onWheel = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    const factor = e.deltaY < 0 ? 1.12 : 0.89
    setT(prev => {
      const next = clamp(prev.scale * factor, minScale, maxScale)
      return { ...prev, scale: next }
    })
  }, [minScale, maxScale])

  /* register as non-passive so preventDefault works */
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [onWheel])

  /* ── mouse drag ── */
  const onMouseDown = useCallback((e) => {
    e.stopPropagation()
    dragRef.current = {
      startX: e.clientX, startY: e.clientY,
      startTX: 0, startTY: 0,
    }
    setT(prev => {
      dragRef.current.startTX = prev.x
      dragRef.current.startTY = prev.y
      return prev
    })
  }, [])

  const onMouseMove = useCallback((e) => {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    setT(prev => ({
      ...prev,
      x: dragRef.current.startTX + dx,
      y: dragRef.current.startTY + dy,
    }))
  }, [])

  const onMouseUp   = useCallback(() => { dragRef.current = null }, [])
  const onDblClick  = useCallback(() => setT({ scale: 1, x: 0, y: 0 }), [])

  /* ── touch ── */
  const onTouchStart = useCallback((e) => {
    e.stopPropagation()
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      dragRef.current = {
        startX: touch.clientX, startY: touch.clientY,
        startTX: 0, startTY: 0,
      }
      setT(prev => {
        dragRef.current.startTX = prev.x
        dragRef.current.startTY = prev.y
        return prev
      })
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      pinchRef.current = { dist: Math.hypot(dx, dy) }
      dragRef.current  = null
    }
  }, [])

  const onTouchMove = useCallback((e) => {
    e.stopPropagation()
    if (e.touches.length === 1 && dragRef.current) {
      const dx = e.touches[0].clientX - dragRef.current.startX
      const dy = e.touches[0].clientY - dragRef.current.startY
      setT(prev => ({
        ...prev,
        x: dragRef.current.startTX + dx,
        y: dragRef.current.startTY + dy,
      }))
    } else if (e.touches.length === 2 && pinchRef.current) {
      const dx   = e.touches[0].clientX - e.touches[1].clientX
      const dy   = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.hypot(dx, dy)
      const ratio = dist / pinchRef.current.dist
      pinchRef.current = { dist }
      setT(prev => ({ ...prev, scale: clamp(prev.scale * ratio, minScale, maxScale) }))
    }
  }, [minScale, maxScale])

  const onTouchEnd = useCallback((e) => {
    e.stopPropagation()
    dragRef.current  = null
    pinchRef.current = null
  }, [])

  const transformed = t.scale !== 1 || t.x !== 0 || t.y !== 0

  return (
    <div
      ref={containerRef}
      style={{ position:'relative', width:'100%', height:'100%', overflow:'hidden',
               cursor: t.scale > 1 ? 'grab' : 'default' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onDoubleClick={onDblClick}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div style={{
        width:'100%', height:'100%',
        transform:`translate(${t.x}px,${t.y}px) scale(${t.scale})`,
        transformOrigin:'center center',
        willChange:'transform',
      }}>
        {children}
      </div>

      {/* ── Hint / reset ── */}
      <div style={{
        position:'absolute', bottom:5, left:'50%',
        transform:'translateX(-50%)',
        display:'flex', alignItems:'center', gap:5,
        pointerEvents: transformed ? 'auto' : 'none',
        opacity: transformed ? 1 : 0,
        transition:'opacity 0.2s',
      }}>
        <span style={{ color:'#475569', fontSize:'8px', whiteSpace:'nowrap' }}>
          scroll · arrastra · doble-clic para resetear
        </span>
        <button
          onClick={() => setT({ scale:1, x:0, y:0 })}
          style={{
            background:'rgba(4,4,22,0.85)', border:'1px solid rgba(99,102,241,0.4)',
            color:'#818cf8', fontSize:'8px', padding:'1px 5px',
            borderRadius:'3px', cursor:'pointer',
          }}
        >⟳</button>
      </div>

      {/* Zoom indicator */}
      {transformed && (
        <div style={{
          position:'absolute', top:5, right:6,
          color:'#475569', fontSize:'8px', fontFamily:'monospace',
          background:'rgba(4,4,22,0.7)', padding:'1px 4px', borderRadius:3,
          pointerEvents:'none',
        }}>
          {(t.scale * 100).toFixed(0)}%
        </div>
      )}
    </div>
  )
}
