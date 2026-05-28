/**
 * ViewToggle — 2D / 3D mode switcher pill
 *
 * Usage:
 *   const [mode, setMode] = useState('2d')
 *   <ViewToggle mode={mode} onChange={setMode} />
 *
 * `mode` is either '2d' or '3d'.
 */
import React from 'react'

export default function ViewToggle({ mode, onChange }) {
  return (
    <div style={{
      display:'flex',
      borderRadius:'5px',
      overflow:'hidden',
      border:'1px solid rgba(99,102,241,0.30)',
      flexShrink: 0,
    }}>
      {['2D','3D'].map(m => {
        const active = mode === m.toLowerCase()
        return (
          <button
            key={m}
            onClick={() => onChange(m.toLowerCase())}
            style={{
              padding:'3px 10px',
              fontSize:'10px',
              fontWeight: 700,
              fontFamily:'"Courier New",monospace',
              letterSpacing:'0.04em',
              background: active ? 'rgba(99,102,241,0.38)' : 'transparent',
              color: active ? '#818cf8' : '#475569',
              border:'none',
              cursor:'pointer',
              transition:'background 0.15s, color 0.15s',
              lineHeight:1.4,
            }}
          >
            {m}
          </button>
        )
      })}
    </div>
  )
}
