/**
 * TopProductViz3D — Topographic Product k-Neighbor Visualization
 *
 * Demonstrates how P compares input-space neighborhoods to map-space
 * neighborhoods for a single query sample xᵢ.
 *
 *   z = 3  →  Input space  (data points)
 *   z = 0  →  SOM 3×3 map  (neurons at grid positions)
 *
 * Colour code for k-neighbor lines:
 *   GREEN  — k=1 (nearest neighbor)
 *   AMBER  — k=2 (second neighbor)
 *
 * Vertical dashed lines link each input-space neighbor to its
 * corresponding map-space neighbor, showing the ORDER is preserved
 * → Q₁·Q₂ ≈ 1 → P ≈ 0  (topology preserved).
 */
import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Line, Html } from '@react-three/drei'

/* ─────────────────────── Data ─────────────────────────────────────── */

/* 3×3 SOM grid:  positions (col-1)×2, (row-1)×2 → [-2,0,2] × [-2,0,2] */
const GRID_POS = []
for (let r = -1; r <= 1; r++) {
  for (let c = -1; c <= 1; c++) {
    GRID_POS.push([c * 2, r * 2, 0])
  }
}
/* BMU = centre neuron index 4: [0,0,0] */

/* Grid connections (connectivity-4) */
const GRID_LINES = []
for (let r = -1; r <= 1; r++) {
  for (let c = -1; c <= 1; c++) {
    if (c < 1) GRID_LINES.push([[c*2,r*2,0], [(c+1)*2,r*2,0]])   // horizontal
    if (r < 1) GRID_LINES.push([[c*2,r*2,0], [c*2,(r+1)*2,0]])   // vertical
  }
}

/* Query point xᵢ at origin of input plane */
const QUERY    = [0.0,  0.0, 3]
const BMU      = [0.0,  0.0, 0]

/* k=1,2 neighbors in INPUT SPACE */
const IN_K1    = [-1.7,  0.0, 3]
const IN_K2    = [ 0.0, -1.7, 3]
/* k=3 (context only, faint) */
const IN_K3    = [-1.3, -1.2, 3]

/* k=1,2 grid-neighbors of BMU */
const MAP_K1   = [-2.0,  0.0, 0]   // matches IN_K1 → green ✓
const MAP_K2   = [ 0.0, -2.0, 0]   // matches IN_K2 → amber ✓

/* Other data points (context) */
const OTHERS_IN = [
  [1.8,  1.4, 3],
  [-0.9,  1.7, 3],
]

/* ─────────────────────── DiagLabel ────────────────────────────────── */
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

/* ─────────────────────── Scene ─────────────────────────────────────── */
function Scene() {
  return (
    <>
      <ambientLight intensity={0.40}/>
      <pointLight position={[4, 2, 7]}  intensity={2.5} color="#8b5cf6"/>
      <pointLight position={[-3,-2, 5]} intensity={1.5} color="#6366f1"/>

      {/* SOM map plane (z=0) */}
      <mesh position={[0,0,-0.08]}>
        <planeGeometry args={[8,8]}/>
        <meshBasicMaterial color="#060615" transparent opacity={0.80}/>
      </mesh>

      {/* Input-space plane (z=3) — very faint */}
      <mesh position={[0,0,3.06]}>
        <planeGeometry args={[8,8]}/>
        <meshBasicMaterial color="#06061a" transparent opacity={0.18}/>
      </mesh>

      {/* Plane labels */}
      <DiagLabel position={[-3.2,3.2,3.06]} offset={[-36,-24]}
        title="Espacio de entrada" sub="vecindad de xᵢ en espacio original" color="#818cf8" alignRight/>
      <DiagLabel position={[3.2,-3.2,-0.08]} offset={[36,26]}
        title="Mapa SOM  3×3" sub="vecindad de BMU en cuadrícula" color="#6366f1"/>

      {/* Grid connections */}
      {GRID_LINES.map((pts, i) => (
        <Line key={i} points={pts} color="#6366f1" lineWidth={1.5} opacity={0.40} transparent/>
      ))}

      {/* SOM neurons */}
      {GRID_POS.map((pos, i) => {
        const isBMU = pos[0]===0 && pos[1]===0
        const isK1  = pos[0]===-2 && pos[1]===0
        const isK2  = pos[0]===0  && pos[1]===-2
        const col   = isBMU ? '#818cf8' : isK1 ? '#10b981' : isK2 ? '#f59e0b' : '#334155'
        const em    = isBMU ? 0.65 : isK1||isK2 ? 0.55 : 0.15
        const r     = isBMU ? 0.32 : isK1||isK2 ? 0.26 : 0.18
        return (
          <group key={i} position={pos}>
            <mesh><sphereGeometry args={[r,20,20]}/>
              <meshStandardMaterial color={col} emissive={col} emissiveIntensity={em} roughness={0.25}/>
            </mesh>
            {(isBMU||isK1||isK2) && <pointLight color={col} intensity={0.8} distance={3.5}/>}
          </group>
        )
      })}

      {/* Input-space data points */}
      {/* Query xᵢ */}
      <group position={QUERY}>
        <mesh><sphereGeometry args={[0.30,24,24]}/>
          <meshStandardMaterial color="#e2e8f0" emissive="#e2e8f0" emissiveIntensity={0.55} roughness={0.2}/>
        </mesh>
        <pointLight color="#e2e8f0" intensity={1.0} distance={3.0}/>
      </group>

      {/* k=1 input neighbor */}
      <mesh position={IN_K1}>
        <sphereGeometry args={[0.20,18,18]}/>
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.65} roughness={0.25}/>
      </mesh>

      {/* k=2 input neighbor */}
      <mesh position={IN_K2}>
        <sphereGeometry args={[0.20,18,18]}/>
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.65} roughness={0.25}/>
      </mesh>

      {/* Other context points */}
      {OTHERS_IN.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.12,12,12]}/>
          <meshStandardMaterial color="#334155" roughness={0.4}/>
        </mesh>
      ))}

      {/* ── k-neighbor lines in INPUT SPACE ── */}
      <Line points={[QUERY, IN_K1]} color="#10b981" lineWidth={2.8} opacity={0.92} transparent/>
      <Line points={[QUERY, IN_K2]} color="#f59e0b" lineWidth={2.2} opacity={0.85} transparent/>
      <Line points={[QUERY, IN_K3]} color="#334155" lineWidth={1.2} opacity={0.35} transparent/>

      {/* ── k-neighbor lines in MAP SPACE ── */}
      <Line points={[BMU, MAP_K1]}  color="#10b981" lineWidth={2.8} opacity={0.92} transparent/>
      <Line points={[BMU, MAP_K2]}  color="#f59e0b" lineWidth={2.2} opacity={0.85} transparent/>

      {/* ── Matching vertical lines (input → map neighbor correspondence) ── */}
      <Line points={[IN_K1, MAP_K1]} color="#10b981" lineWidth={1.2} opacity={0.35} transparent/>
      <Line points={[IN_K2, MAP_K2]} color="#f59e0b" lineWidth={1.2} opacity={0.35} transparent/>

      {/* Labels */}
      <DiagLabel position={QUERY}  offset={[52,-24]}
        title="xᵢ" sub="muestra consulta" color="#e2e8f0"/>
      <DiagLabel position={BMU}    offset={[52, 22]}
        title="BMU(xᵢ)" sub="neurona ganadora" color="#818cf8"/>
      <DiagLabel position={IN_K1}  offset={[-50,-20]}
        title="k=1 · entrada" sub="Q₁(1,i)" color="#10b981" alignRight/>
      <DiagLabel position={MAP_K1} offset={[-50, 24]}
        title="k=1 · mapa" sub="Q₂(1,i)" color="#10b981" alignRight/>
      <DiagLabel position={IN_K2}  offset={[50, -20]}
        title="k=2 · entrada" sub="Q₁(2,i)" color="#f59e0b"/>
      <DiagLabel position={MAP_K2} offset={[50,  24]}
        title="k=2 · mapa" sub="Q₂(2,i)" color="#f59e0b"/>

      {/* Summary: P ≈ 0 */}
      <DiagLabel position={[3.2, 2.5, 1.5]} offset={[44, 0]}
        title="Q₁·Q₂ ≈ 1  →  P ≈ 0"
        sub="órdenes coinciden · topología preservada" color="#10b981"/>

      <OrbitControls
        target={[0, 0, 1.5]}
        autoRotate autoRotateSpeed={0.38}
        enableZoom enablePan={false}
        maxPolarAngle={Math.PI / 1.65}
        minPolarAngle={Math.PI / 5.5}
      />
    </>
  )
}

/* ─────────────────────── Export ────────────────────────────────────────── */
export default function TopProductViz3D() {
  return (
    <Canvas
      camera={{ position: [5.5, 2.5, 9.5], fov: 46 }}
      style={{ background:'transparent', width:'100%', height:'100%', display:'block' }}
    >
      <Scene/>
    </Canvas>
  )
}
