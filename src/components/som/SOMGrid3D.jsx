import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, OrbitControls, Text, Line } from '@react-three/drei'
import { neurons, samples } from '../../data/somData'

function NeuronSphere({ neuron, animatePulse, showLabels }) {
  const meshRef = useRef()

  useFrame(({ clock }) => {
    if (meshRef.current && animatePulse && !neuron.isDead) {
      const scale = Math.sin(clock.elapsedTime * 1.5 + neuron.grid[0] * 1.2) * 0.05 + 1
      meshRef.current.scale.setScalar(scale)
    }
  })

  const emissiveIntensity = neuron.isDead ? 0.1 : 0.6
  const opacity = neuron.isDead ? 0.4 : 1.0
  const [x, y, z] = neuron.position3d

  return (
    <group position={[x, y, z]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial
          color={neuron.color}
          emissive={neuron.color}
          emissiveIntensity={emissiveIntensity}
          transparent={neuron.isDead}
          opacity={opacity}
        />
      </mesh>
      {showLabels && (
        <Text
          position={[0, 0.65, 0]}
          fontSize={0.25}
          color={neuron.isDead ? '#94a3b8' : '#f1f5f9'}
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2"
        >
          {neuron.id}
          {'\n'}
          {neuron.isDead ? '[dead]' : `[${neuron.label}]`}
        </Text>
      )}
      <pointLight
        color={neuron.color}
        intensity={neuron.isDead ? 0.3 : 1.2}
        distance={3}
      />
    </group>
  )
}

function DataPoint({ sample }) {
  const x = sample.x1 * 7 - 3.5
  const y = sample.x2 * 7 - 3.5
  const color = sample.class === 'A' ? '#10b981' : '#f43f5e'

  return (
    <mesh position={[x, y, 0.1]}>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
      />
    </mesh>
  )
}

function GridConnections() {
  const connections = [
    { from: neurons[0].position3d, to: neurons[1].position3d },
    { from: neurons[0].position3d, to: neurons[2].position3d },
    { from: neurons[1].position3d, to: neurons[3].position3d },
    { from: neurons[2].position3d, to: neurons[3].position3d },
  ]

  return (
    <>
      {connections.map((conn, i) => (
        <Line
          key={i}
          points={[conn.from, conn.to]}
          color="#6366f1"
          lineWidth={1.5}
          opacity={0.5}
          transparent
        />
      ))}
    </>
  )
}

export default function SOMGrid3D({
  showDataPoints = true,
  animatePulse = true,
  showLabels = true,
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 60 }}
      style={{ background: 'transparent' }}
    >
      <Stars radius={80} depth={50} count={3000} factor={4} fade speed={1} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#6366f1" />
      <directionalLight position={[-5, -5, 5]} intensity={0.5} color="#8b5cf6" />

      <GridConnections />

      {neurons.map(neuron => (
        <NeuronSphere
          key={neuron.id}
          neuron={neuron}
          animatePulse={animatePulse}
          showLabels={showLabels}
        />
      ))}

      {showDataPoints && samples.map(sample => (
        <DataPoint key={sample.id} sample={sample} />
      ))}

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.5}
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 4}
      />
    </Canvas>
  )
}
