/**
 * TEViz3D — 3D Topographic Error Visualization
 * with encyclopedia-style didactic labels (leader lines + text pills)
 *
 * Two-plane scene:
 *   z = 3  →  Input space  — data points at their (x₁, x₂) coordinates
 *   z = 0  →  SOM map      — neurons at their weight-space positions
 *
 * Connecting lines:
 *   GREEN  →  t = 0  (BMU₁ & BMU₂ adjacent  → topology preserved)
 *   RED    →  t = 1  (BMU₁ & BMU₂ diagonal  → topographic error)
 *
 * Coordinate mapping:  pos = (w − 0.5) × 6
 *   N1 [0.15, 0.20] → [−2.1, −1.8, 0]
 *   N2 [0.80, 0.85] → [ 1.8,  2.1, 0]
 *   N3 [0.55, 0.45] → [ 0.3, −0.3, 0]
 *   N4 [0.30, 0.60] → [−1.2,  0.6, 0]  ← dead neuron
 */
import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Line, Html } from '@react-three/drei'

/* ─────────────────────────── Data ─────────────────────────────────────── */

const NEURONS = [
  {
    id: 'N1', pos: [-2.1, -1.8, 0], color: '#10b981', isDead: false,
    label: 'N1',  sub: 'BMU₁ frecuente · 3 muestras',
    offset: [-56, -32], alignRight: true,
  },
  {
    id: 'N2', pos: [  1.8,  2.1, 0], color: '#f43f5e', isDead: false,
    label: 'N2',  sub: 'BMU₁ frecuente · 3 muestras',
    offset: [ 56, -32], alignRight: false,
  },
  {
    id: 'N3', pos: [  0.3, -0.3, 0], color: '#f59e0b', isDead: false,
    label: 'N3',  sub: 'Neurona activa · 2 muestras',
    offset: [ 56,  16], alignRight: false,
  },
  {
    id: 'N4', pos: [ -1.2,  0.6, 0], color: '#64748b', isDead: true,
    label: 'N4',  sub: 'Neurona muerta — sin actividad',
    offset: [-56,  30], alignRight: true,
  },
]

const NM = Object.fromEntries(NEURONS.map(n => [n.id, n]))

/** Adjacent pairs — 2×2 SOM grid, connectivity-4 */
const GRID_ADJ = [
  ['N1', 'N2'],   // row-0 horizontal
  ['N1', 'N3'],   // col-0 vertical
  ['N2', 'N4'],   // col-1 vertical
  ['N3', 'N4'],   // row-1 horizontal
]

/**
 * Samples at input-space positions (z = 3).
 * isError: true when BMU₁ & BMU₂ are NOT adjacent.
 *
 *  m1 N1→N4 diagonal → ERROR
 *  m2 N1→N3 adjacent → OK
 *  m3 N1→N4 diagonal → ERROR
 *  m4 N2→N3 diagonal → ERROR
 *  m5 N2→N3 diagonal → ERROR
 *  m6 N2→N3 diagonal → ERROR
 *  m7 N3→N4 adjacent → OK
 *  m8 N3→N4 adjacent → OK
 */
const SAMPLES = [
  { pos: [-2.4, -1.8, 3], bmu: 'N1', isError: true  },
  { pos: [-1.8, -2.4, 3], bmu: 'N1', isError: false },
  { pos: [-2.4, -1.2, 3], bmu: 'N1', isError: true  },
  { pos: [  1.8,  2.4, 3], bmu: 'N2', isError: true  },
  { pos: [  2.4,  1.8, 3], bmu: 'N2', isError: true  },
  { pos: [  1.2,  2.4, 3], bmu: 'N2', isError: true  },
  { pos: [  0.0,  0.0, 3], bmu: 'N3', isError: false },
  { pos: [  0.6, -0.6, 3], bmu: 'N3', isError: false },
]

/* ─────────────────────── DiagLabel ────────────────────────────────────── */
/**
 * Encyclopedia-style label with dashed leader line.
 *
 * Renders an Html overlay at `position` (3-D world coords).
 * The SVG line goes from (0,0) — the projected 3-D anchor — to
 * the pixel offset [ox, oy] where the text pill floats.
 *
 * Props:
 *   position   — [x,y,z] 3-D anchor
 *   offset     — [px, py] screen-pixel displacement to text box
 *   title      — main label (monospace, coloured)
 *   sub        — subtitle (small, slate)
 *   color      — accent colour for dot, line, left/right border
 *   alignRight — true ⇒ text box anchored by its right edge
 */
function DiagLabel({
  position = [0, 0, 0],
  offset   = [52, -28],
  title,
  sub,
  color      = '#94a3b8',
  alignRight = false,
}) {
  const [ox, oy] = offset

  return (
    <Html
      position={position}
      zIndexRange={[20, 0]}
      style={{ pointerEvents: 'none', userSelect: 'none' }}
    >
      <div style={{ position: 'relative', width: 0, height: 0 }}>

        {/* ── SVG leader line ── */}
        <svg
          style={{ position: 'absolute', overflow: 'visible', top: 0, left: 0 }}
          width="1" height="1"
        >
          {/* Dashed backbone */}
          <line
            x1="0" y1="0" x2={ox} y2={oy}
            stroke={color} strokeWidth="1.1"
            strokeDasharray="4.5 2.8" opacity="0.55"
          />
          {/* Solid stub at anchor — gives a "pops out" feel */}
          <line
            x1="0" y1="0"
            x2={ox * 0.22} y2={oy * 0.22}
            stroke={color} strokeWidth="1.5" opacity="0.9"
          />
          {/* Filled dot at the 3-D anchor */}
          <circle cx="0" cy="0" r="2.8" fill={color} opacity="0.9" />
          {/* Tiny terminus tick at text end */}
          <circle cx={ox} cy={oy} r="1.4" fill={color} opacity="0.55" />
        </svg>

        {/* ── Text pill ── */}
        <div style={{
          position: 'absolute',
          left: ox,
          top:  oy,
          transform: alignRight
            ? 'translate(-100%, -50%)'
            : 'translateY(-50%)',
          background:     'rgba(4, 4, 22, 0.92)',
          border:         `1px solid ${color}30`,
          ...(alignRight
            ? { borderRight: `2px solid ${color}` }
            : { borderLeft:  `2px solid ${color}` }),
          borderRadius:   '3px',
          padding:        sub ? '3px 8px 3px 6px' : '3px 7px',
          backdropFilter: 'blur(6px)',
          whiteSpace:     'nowrap',
          lineHeight:     1,
          boxShadow:      `0 2px 12px ${color}18`,
        }}>
          <div style={{
            color,
            fontSize:     '9.5px',
            fontWeight:   700,
            fontFamily:   '"Courier New", monospace',
            letterSpacing:'0.03em',
            marginBottom: sub ? '2px' : 0,
          }}>
            {title}
          </div>
          {sub && (
            <div style={{
              color:      '#64748b',
              fontSize:   '7.5px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: 400,
              lineHeight: 1.2,
            }}>
              {sub}
            </div>
          )}
        </div>

      </div>
    </Html>
  )
}

/* ─────────────────────── Neuron ────────────────────────────────────────── */

function Neuron({ pos, color, isDead, label, sub, offset, alignRight }) {
  const core = useRef()

  useFrame(({ clock }) => {
    if (core.current && !isDead) {
      const s = 1 + Math.sin(clock.elapsedTime * 1.6 + pos[0]) * 0.045
      core.current.scale.setScalar(s)
    }
  })

  return (
    <group position={pos}>
      {/* Halo */}
      <mesh>
        <sphereGeometry args={[0.58, 16, 16]} />
        <meshBasicMaterial
          color={color} transparent
          opacity={isDead ? 0.03 : 0.13}
        />
      </mesh>
      {/* Core */}
      <mesh ref={core}>
        <sphereGeometry args={[0.30, 32, 32]} />
        <meshStandardMaterial
          color={color} emissive={color}
          emissiveIntensity={isDead ? 0.05 : 0.55}
          transparent={isDead} opacity={isDead ? 0.32 : 1.0}
          roughness={0.25} metalness={0.1}
        />
      </mesh>
      {!isDead && <pointLight color={color} intensity={1.1} distance={4.5} />}

      {/* Encyclopedia label — anchor at sphere centre */}
      <DiagLabel
        offset={offset} title={label} sub={sub}
        color={color} alignRight={alignRight}
      />
    </group>
  )
}

/* ─────────────────────── SamplePoint ──────────────────────────────────── */

function SamplePoint({ pos, bmu, isError }) {
  const col    = isError ? '#f43f5e' : '#10b981'
  const bmuPos = NM[bmu].pos

  return (
    <group>
      <mesh position={pos}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color={col} emissive={col}
          emissiveIntensity={0.75} roughness={0.3}
        />
      </mesh>
      {/* Glow halo */}
      <mesh position={pos}>
        <sphereGeometry args={[0.26, 12, 12]} />
        <meshBasicMaterial color={col} transparent opacity={0.1} />
      </mesh>
      {/* BMU connection line */}
      <Line
        points={[pos, bmuPos]}
        color={col}
        lineWidth={isError ? 2.8 : 1.8}
        opacity={isError ? 0.9 : 0.55}
        transparent
      />
    </group>
  )
}

/* ─────────────────────── Scene ─────────────────────────────────────────── */

function Scene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.38} />
      <pointLight position={[ 4,  3, 7]} intensity={3.0} color="#8b5cf6" />
      <pointLight position={[-4, -2, 5]} intensity={1.8} color="#6366f1" />

      {/* ── SOM map plane (z = 0) ── */}
      <mesh position={[0, 0, -0.08]}>
        <planeGeometry args={[9, 9]} />
        <meshBasicMaterial color="#060615" transparent opacity={0.82} />
      </mesh>

      {/* ── Input-space plane (z = 3) — faint ── */}
      <mesh position={[0, 0, 3.06]}>
        <planeGeometry args={[9, 9]} />
        <meshBasicMaterial color="#06061a" transparent opacity={0.22} />
      </mesh>

      {/* ── Plane labels ── */}
      {/* Input space — anchored at upper-left corner */}
      <DiagLabel
        position={[-3.8, 3.8, 3.06]}
        offset={[-42, -26]}
        title="Espacio de entrada"
        sub="z₃ · posiciones x₁, x₂ originales"
        color="#818cf8"
        alignRight
      />
      {/* SOM map — anchored at lower-right corner */}
      <DiagLabel
        position={[3.8, -3.8, -0.08]}
        offset={[42, 28]}
        title="Mapa SOM  2 × 2"
        sub="z₀ · vectores de pesos aprendidos"
        color="#6366f1"
        alignRight={false}
      />

      {/* ── Grid: adjacent connections ── */}
      {GRID_ADJ.map(([a, b], i) => (
        <Line
          key={i}
          points={[NM[a].pos, NM[b].pos]}
          color="#6366f1"
          lineWidth={2.2}
          opacity={0.55}
          transparent
        />
      ))}

      {/* ── Neurons (with labels) ── */}
      {NEURONS.map(n => (
        <Neuron
          key={n.id}
          pos={n.pos} color={n.color} isDead={n.isDead}
          label={n.label} sub={n.sub}
          offset={n.offset} alignRight={n.alignRight}
        />
      ))}

      {/* ── Samples + BMU lines ── */}
      {SAMPLES.map((s, i) => (
        <SamplePoint key={i} pos={s.pos} bmu={s.bmu} isError={s.isError} />
      ))}

      {/* ── Camera controls ── */}
      <OrbitControls
        target={[0, 0, 1.5]}
        autoRotate
        autoRotateSpeed={0.45}
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 1.65}
        minPolarAngle={Math.PI / 5.5}
      />
    </>
  )
}

/* ─────────────────────── Export ────────────────────────────────────────── */

export default function TEViz3D() {
  return (
    <Canvas
      camera={{ position: [5.5, 2.5, 9.5], fov: 46 }}
      style={{
        background: 'transparent',
        width:  '100%',
        height: '100%',
        display: 'block',
      }}
    >
      <Scene />
    </Canvas>
  )
}
