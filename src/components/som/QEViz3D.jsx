/**
 * QEViz3D — Quantization Error 3-D Visualization
 *
 * Two-plane scene:
 *   z = 3  →  Input space  — 8 data points at their (x₁, x₂) positions
 *   z = 0  →  SOM map      — 4 neurons at their weight-vector positions
 *
 * Connecting lines:
 *   Each sample connects to its BMU.
 *   Colour = class  (A → emerald,  B → rose)
 *   Width  ∝ distance  (shorter = finer, longer = thicker — QE contribution)
 *
 * Coordinate mapping: pos = (val − 0.5) × 6
 *   N1 [0.15, 0.20] → [−2.1, −1.8, 0]
 *   N2 [0.80, 0.85] → [ 1.8,  2.1, 0]
 *   N3 [0.55, 0.45] → [ 0.3, −0.3, 0]
 *   N4 [0.30, 0.60] → [−1.2,  0.6, 0]  ← dead
 */
import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Line, Html } from '@react-three/drei'

/* ─────────────────────────── Data ─────────────────────────────────────── */

const NEURONS = [
  { id:'N1', pos:[-2.1,-1.8,0], color:'#10b981', isDead:false,
    label:'N1', sub:'w = [0.15, 0.20]', offset:[-56,-32], alignRight:true  },
  { id:'N2', pos:[ 1.8, 2.1,0], color:'#f43f5e', isDead:false,
    label:'N2', sub:'w = [0.80, 0.85]', offset:[ 56,-32], alignRight:false },
  { id:'N3', pos:[ 0.3,-0.3,0], color:'#f59e0b', isDead:false,
    label:'N3', sub:'w = [0.55, 0.45]', offset:[ 56, 18], alignRight:false },
  { id:'N4', pos:[-1.2, 0.6,0], color:'#64748b', isDead:true,
    label:'N4', sub:'muerta — w = [0.30, 0.60]', offset:[-56, 30], alignRight:true },
]

const NM = Object.fromEntries(NEURONS.map(n => [n.id, n]))

const GRID_ADJ = [['N1','N2'],['N1','N3'],['N2','N4'],['N3','N4']]

/* class colour, line width from distance */
const C_A = '#10b981', C_B = '#f43f5e'
const lw  = d => 1.2 + (d - 0.050) / (0.112 - 0.050) * 2.4   // 1.2 → 3.6

const SAMPLES = [
  { pos:[-2.4,-1.8,3], bmu:'N1', cls:'A', dist:0.050, id:'m1' },
  { pos:[-1.8,-2.4,3], bmu:'N1', cls:'A', dist:0.112, id:'m2' },
  { pos:[-2.4,-1.2,3], bmu:'N1', cls:'A', dist:0.112, id:'m3' },
  { pos:[ 1.8, 2.4,3], bmu:'N2', cls:'B', dist:0.050, id:'m4' },
  { pos:[ 2.4, 1.8,3], bmu:'N2', cls:'B', dist:0.112, id:'m5' },
  { pos:[ 1.2, 2.4,3], bmu:'N2', cls:'B', dist:0.112, id:'m6' },
  { pos:[ 0.0, 0.0,3], bmu:'N3', cls:'A', dist:0.071, id:'m7' },
  { pos:[ 0.6,-0.6,3], bmu:'N3', cls:'B', dist:0.071, id:'m8' },
]

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
          background:'rgba(4,4,22,0.92)',
          border:`1px solid ${color}30`,
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

/* ─────────────────────── Neuron ────────────────────────────────────────── */
function Neuron({ pos, color, isDead, label, sub, offset, alignRight }) {
  const core = useRef()
  useFrame(({ clock }) => {
    if (core.current && !isDead)
      core.current.scale.setScalar(1 + Math.sin(clock.elapsedTime*1.6 + pos[0])*0.045)
  })
  return (
    <group position={pos}>
      <mesh><sphereGeometry args={[0.56,16,16]}/>
        <meshBasicMaterial color={color} transparent opacity={isDead ? 0.03 : 0.12}/>
      </mesh>
      <mesh ref={core}><sphereGeometry args={[0.28,32,32]}/>
        <meshStandardMaterial color={color} emissive={color}
          emissiveIntensity={isDead ? 0.05 : 0.55}
          transparent={isDead} opacity={isDead ? 0.30 : 1}
          roughness={0.25} metalness={0.1}/>
      </mesh>
      {!isDead && <pointLight color={color} intensity={1.0} distance={4.5}/>}
      <DiagLabel offset={offset} title={label} sub={sub} color={color} alignRight={alignRight}/>
    </group>
  )
}

/* ─────────────────────── SamplePoint ──────────────────────────────────── */
function SamplePoint({ pos, bmu, cls, dist, id }) {
  const col = cls === 'A' ? C_A : C_B
  const bmuPos = NM[bmu].pos
  const showLabel = id === 'm1' || id === 'm5' || id === 'm7'   // annotate 3 key samples
  return (
    <group>
      <mesh position={pos}>
        <sphereGeometry args={[0.16,16,16]}/>
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.70} roughness={0.3}/>
      </mesh>
      <mesh position={pos}>
        <sphereGeometry args={[0.28,12,12]}/>
        <meshBasicMaterial color={col} transparent opacity={0.09}/>
      </mesh>
      <Line points={[pos, bmuPos]} color={col} lineWidth={lw(dist)} opacity={0.88} transparent/>
      {showLabel && (
        <DiagLabel
          position={[0,0,0]}
          offset={cls === 'B' ? [46, -16] : [-46, -16]}
          title={`${id} · ${cls}`}
          sub={`d = ${dist.toFixed(3)}`}
          color={col}
          alignRight={cls === 'A'}
        />
      )}
    </group>
  )
}

/* ─────────────────────── Scene ─────────────────────────────────────────── */
function Scene() {
  return (
    <>
      <ambientLight intensity={0.40}/>
      <pointLight position={[4,3,7]}  intensity={2.8} color="#8b5cf6"/>
      <pointLight position={[-4,-2,5]} intensity={1.6} color="#6366f1"/>

      {/* SOM map plane (z=0) */}
      <mesh position={[0,0,-0.08]}>
        <planeGeometry args={[9,9]}/>
        <meshBasicMaterial color="#060615" transparent opacity={0.84}/>
      </mesh>

      {/* Input space plane (z=3) — very faint */}
      <mesh position={[0,0,3.06]}>
        <planeGeometry args={[9,9]}/>
        <meshBasicMaterial color="#06061a" transparent opacity={0.18}/>
      </mesh>

      {/* Plane labels */}
      <DiagLabel position={[-3.8,3.8,3.06]} offset={[-40,-26]}
        title="Espacio de entrada" sub="z₃ · vectores xᵢ = (x₁, x₂)"
        color="#818cf8" alignRight/>
      <DiagLabel position={[3.8,-3.8,-0.08]} offset={[40,28]}
        title="Mapa SOM  2 × 2" sub="z₀ · pesos wⱼ = (w₁, w₂)"
        color="#6366f1"/>

      {/* Grid connections */}
      {GRID_ADJ.map(([a,b],i) => (
        <Line key={i} points={[NM[a].pos, NM[b].pos]}
          color="#6366f1" lineWidth={2.0} opacity={0.50} transparent/>
      ))}

      {/* Neurons */}
      {NEURONS.map(n => (
        <Neuron key={n.id} pos={n.pos} color={n.color} isDead={n.isDead}
          label={n.label} sub={n.sub} offset={n.offset} alignRight={n.alignRight}/>
      ))}

      {/* Samples */}
      {SAMPLES.map(s => (
        <SamplePoint key={s.id} pos={s.pos} bmu={s.bmu} cls={s.cls} dist={s.dist} id={s.id}/>
      ))}

      <OrbitControls target={[0,0,1.5]}
        autoRotate autoRotateSpeed={0.4}
        enableZoom enablePan={false}
        maxPolarAngle={Math.PI/1.6} minPolarAngle={Math.PI/6}/>
    </>
  )
}

/* ─────────────────────── Export ────────────────────────────────────────── */
export default function QEViz3D() {
  return (
    <Canvas camera={{ position:[5.5,3.0,9.5], fov:46 }}
      style={{ background:'transparent', width:'100%', height:'100%', display:'block' }}>
      <Scene/>
    </Canvas>
  )
}
