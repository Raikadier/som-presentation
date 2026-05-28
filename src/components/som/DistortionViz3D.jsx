/**
 * DistortionViz3D — 3-D Gaussian Neighborhood Surface
 *
 * Shows the h(r,j) = exp(−d²/2σ²) function as a 3-D bell-curve
 * landscape sitting above the SOM grid.
 *
 *   z-axis  → h value (0…1)
 *   XY plane → grid position of each neuron
 *   σ ring  → circle at radius σ=1.8 where h = e⁻⁰·⁵ ≈ 0.61
 *
 * 5×5 conceptual SOM grid; BMU at origin (0, 0).
 */
import React, { useMemo } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Line, Html } from '@react-three/drei'

/* ─────────────────────── Constants ───────────────────────────────────── */
const SIG  = 1.8
const HMAX = 2.5

/* 5×5 SOM grid neurons at integer × 2 positions */
const GRID_NEURONS = (() => {
  const out = []
  for (let i = -2; i <= 2; i++) {
    for (let j = -2; j <= 2; j++) {
      const x = i * 2, y = j * 2
      const h = Math.exp(-(x * x + y * y) / (2 * SIG * SIG))
      out.push({ pos: [x, y, 0], h })
    }
  }
  return out
})()

/* σ ring */
const SIGMA_RING = Array.from({ length: 65 }, (_, i) => {
  const a = (i / 64) * Math.PI * 2
  return [Math.cos(a) * SIG, Math.sin(a) * SIG, 0.025]
})

/* ─────────────────────── DiagLabel ────────────────────────────────────── */
function DiagLabel({ position=[0,0,0], offset=[52,-28], title, sub, color='#94a3b8', alignRight=false }) {
  const [ox, oy] = offset
  return (
    <Html position={position} zIndexRange={[20,0]} style={{ pointerEvents:'none', userSelect:'none' }}>
      <div style={{ position:'relative', width:0, height:0 }}>
        <svg style={{ position:'absolute', overflow:'visible', top:0, left:0 }} width="1" height="1">
          <line x1="0" y1="0" x2={ox} y2={oy} stroke={color} strokeWidth="1.1" strokeDasharray="4.5 2.8" opacity="0.55"/>
          <line x1="0" y1="0" x2={ox*0.22} y2={oy*0.22} stroke={color} strokeWidth="1.5" opacity="0.9"/>
          <circle cx="0" cy="0" r="2.8" fill={color} opacity="0.9"/>
          <circle cx={ox} cy={oy} r="1.4" fill={color} opacity="0.55"/>
        </svg>
        <div style={{
          position:'absolute', left:ox, top:oy,
          transform: alignRight ? 'translate(-100%,-50%)' : 'translateY(-50%)',
          background:'rgba(4,4,22,0.92)', border:`1px solid ${color}30`,
          ...(alignRight ? { borderRight:`2px solid ${color}` } : { borderLeft:`2px solid ${color}` }),
          borderRadius:'3px', padding: sub ? '3px 8px 3px 6px' : '3px 7px',
          backdropFilter:'blur(6px)', whiteSpace:'nowrap', lineHeight:1,
          boxShadow:`0 2px 12px ${color}18`,
        }}>
          <div style={{ color, fontSize:'9.5px', fontWeight:700, fontFamily:'"Courier New",monospace',
            letterSpacing:'0.03em', marginBottom: sub ? '2px' : 0 }}>{title}</div>
          {sub && <div style={{ color:'#64748b', fontSize:'7.5px', fontFamily:'system-ui,sans-serif',
            fontWeight:400, lineHeight:1.2 }}>{sub}</div>}
        </div>
      </div>
    </Html>
  )
}

/* ─────────────────────── Gaussian Surface ──────────────────────────────── */
function GaussianSurface() {
  const geo = useMemo(() => {
    const N = 44, EXT = 5.2
    const nv  = (N + 1) * (N + 1)
    const pos = new Float32Array(nv * 3)
    const col = new Float32Array(nv * 3)
    const idx = []
    let vi = 0

    for (let i = 0; i <= N; i++) {
      for (let j = 0; j <= N; j++) {
        const x = (i / N - 0.5) * EXT * 2
        const y = (j / N - 0.5) * EXT * 2
        const h = Math.exp(-(x * x + y * y) / (2 * SIG * SIG))
        pos[vi * 3]     = x
        pos[vi * 3 + 1] = y
        pos[vi * 3 + 2] = h * HMAX
        // Colour: dark indigo-blue at base → bright violet at peak
        const c = new THREE.Color().setHSL(
          0.625 + h * 0.07,   // hue: 0.63→0.70 (blue-violet)
          0.28  + h * 0.60,   // saturation
          0.06  + h * 0.54,   // lightness
        )
        col[vi * 3]     = c.r
        col[vi * 3 + 1] = c.g
        col[vi * 3 + 2] = c.b
        vi++
      }
    }
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const a = i * (N + 1) + j
        const b = a + 1
        const c = (i + 1) * (N + 1) + j
        const d = c + 1
        idx.push(a, b, d, a, d, c)
      }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('color',    new THREE.BufferAttribute(col, 3))
    g.setIndex(idx)
    g.computeVertexNormals()
    return g
  }, [])

  return (
    <>
      {/* Solid surface */}
      <mesh geometry={geo}>
        <meshStandardMaterial
          vertexColors side={THREE.DoubleSide}
          roughness={0.35} metalness={0.15}
        />
      </mesh>
      {/* Wireframe overlay — shows the mathematical grid */}
      <mesh geometry={geo}>
        <meshBasicMaterial vertexColors wireframe transparent opacity={0.07}/>
      </mesh>
    </>
  )
}

/* ─────────────────────── Grid Neuron ──────────────────────────────────── */
function GridNeuron({ pos, h }) {
  const r = 0.11 + h * 0.22
  /* lerp colour: dark blue-indigo → bright violet */
  const c = new THREE.Color().setHSL(0.67 + h * 0.05, 0.55 + h * 0.40, 0.14 + h * 0.48)
  return (
    <mesh position={pos}>
      <sphereGeometry args={[r, 14, 14]}/>
      <meshStandardMaterial
        color={c} emissive={c}
        emissiveIntensity={h * 0.6} roughness={0.3}
      />
    </mesh>
  )
}

/* ─────────────────────── Scene ─────────────────────────────────────────── */
function Scene() {
  return (
    <>
      <ambientLight intensity={0.42}/>
      <pointLight position={[3,  2, 7]} intensity={2.5} color="#8b5cf6"/>
      <pointLight position={[-3,-2, 5]} intensity={1.5} color="#6366f1"/>

      {/* Gaussian surface */}
      <GaussianSurface/>

      {/* σ ring */}
      <Line points={SIGMA_RING} color="#f59e0b" lineWidth={1.9} opacity={0.75} transparent/>

      {/* SOM grid neurons */}
      {GRID_NEURONS.map((n, i) => <GridNeuron key={i} pos={n.pos} h={n.h}/>)}

      {/* Vertical axis at BMU (visual guide) */}
      <Line points={[[0,0,0],[0,0,HMAX]]} color="#8b5cf6" lineWidth={1.2} opacity={0.35} transparent/>

      {/* Base plane */}
      <mesh position={[0,0,-0.06]}>
        <planeGeometry args={[11,11]}/>
        <meshBasicMaterial color="#060615" transparent opacity={0.75}/>
      </mesh>

      {/* Labels */}
      <DiagLabel position={[0, 0, HMAX + 0.45]}
        offset={[54,-22]} title="BMU · h = 1.0"
        sub="neurona ganadora (máximo)" color="#8b5cf6"/>
      <DiagLabel position={[SIG, 0, 0.12]}
        offset={[52, 24]} title={`σ = ${SIG}`}
        sub="h = e⁻⁰·⁵ ≈ 0.61 — radio de vecindad" color="#f59e0b"/>
      <DiagLabel position={[4.0, 4.0, 0.06]}
        offset={[40, 26]} title="h ≈ 0.01"
        sub="sin influencia en la distorsión" color="#475569"/>
      <DiagLabel position={[-4.8,-4.8, 0.0]}
        offset={[-40, 28]} title="Cuadrícula SOM"
        sub="neuronas en posición de cuadrícula" color="#6366f1" alignRight/>

      <OrbitControls
        target={[0, 0, 1.2]}
        autoRotate autoRotateSpeed={0.38}
        enableZoom enablePan={false}
        maxPolarAngle={Math.PI / 1.75}
        minPolarAngle={Math.PI / 8}
      />
    </>
  )
}

/* ─────────────────────── Export ────────────────────────────────────────── */
export default function DistortionViz3D() {
  return (
    <Canvas
      camera={{ position: [1, -5.5, 8], fov: 50 }}
      style={{ background:'transparent', width:'100%', height:'100%', display:'block' }}
    >
      <Scene/>
    </Canvas>
  )
}
