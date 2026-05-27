import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

function useCountUp(target, duration = 1200, delay = 0) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let start = null
    let raf
    const timeout = setTimeout(() => {
      const step = (timestamp) => {
        if (!start) start = timestamp
        const progress = Math.min((timestamp - start) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setValue(parseFloat((eased * target).toFixed(3)))
        if (progress < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    }, delay)
    return () => { clearTimeout(timeout); cancelAnimationFrame(raf) }
  }, [target, duration, delay])
  return value
}

export default function MetricCard({ label, value, color = '#6366f1', formula, unit = '', delay = 0, size = 'md' }) {
  const displayed = useCountUp(value, 1000, delay * 1000)
  const isPercent = unit === '%'
  const shown = isPercent ? (displayed * 100).toFixed(1) : displayed.toFixed(3)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      className="glass-card p-4 flex flex-col gap-1 relative overflow-hidden"
      style={{ borderTop: `3px solid ${color}` }}
    >
      <div className="text-xs font-semibold uppercase tracking-widest" style={{ color }}>
        {label}
      </div>
      <div className={`font-black ${size === 'lg' ? 'text-4xl' : 'text-2xl'}`} style={{ color }}>
        {shown}{unit}
      </div>
      {formula && (
        <div className="text-xs text-slate-500 font-mono mt-1">{formula}</div>
      )}
      <div
        className="absolute bottom-0 left-0 w-full h-0.5 opacity-30"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
      />
    </motion.div>
  )
}
