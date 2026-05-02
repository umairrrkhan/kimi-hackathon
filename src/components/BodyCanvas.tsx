import { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { SimulationResult } from '../store/simulationStore'

function getOrganPosition(organ: string): [number, number, number] {
  const positions: Record<string, [number, number, number]> = {
    Brain: [0.0, 1.0, 0.05],
    Heart: [0.06, 0.32, 0.18],
    Lungs: [0.25, 0.38, 0.12],
    Liver: [0.22, -0.08, 0.15],
    Pancreas: [0.1, -0.18, 0.2],
    Kidneys: [-0.18, -0.2, 0.18],
    Stomach: [-0.06, -0.14, 0.22],
    Intestines: [0.0, -0.45, 0.14],
    Immune: [0.0, 0.18, 0.22],
    Spleen: [-0.2, -0.1, 0.2],
  }
  return positions[organ] || [0, 0, 0]
}

function OrganNode({ position, color, intensity, label, onHover, onLeave, isHovered }: {
  position: [number, number, number]
  color: string
  intensity: number
  label: string
  onHover: () => void
  onLeave: () => void
  isHovered: boolean
}) {
  const size = 0.035 + (intensity / 100) * 0.08

  return (
    <group position={position}>
      <mesh
        onPointerOver={onHover}
        onPointerOut={onLeave}
      >
        <sphereGeometry args={[isHovered ? size * 2.5 : size * 1.8, 20, 20]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isHovered ? 0.2 : 0.08 + (intensity / 100) * 0.12}
        />
      </mesh>
      <mesh
        onPointerOver={onHover}
        onPointerOut={onLeave}
      >
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  )
}

function BodySilhouette() {
  const points = useMemo(() => {
    const pts = [
      [-0.12, 1.15], [-0.18, 1.05], [-0.22, 0.9], [-0.3, 0.75],
      [-0.35, 0.6], [-0.32, 0.45], [-0.28, 0.35], [-0.22, 0.25],
      [-0.2, 0.15], [-0.18, 0.05], [-0.2, -0.05], [-0.22, -0.15],
      [-0.25, -0.25], [-0.28, -0.35], [-0.3, -0.45], [-0.28, -0.55],
      [-0.22, -0.65], [-0.12, -0.7], [0, -0.72],
      [0.12, -0.7], [0.22, -0.65], [0.28, -0.55],
      [0.3, -0.45], [0.28, -0.35], [0.25, -0.25],
      [0.22, -0.15], [0.2, -0.05], [0.18, 0.05],
      [0.2, 0.15], [0.22, 0.25], [0.28, 0.35],
      [0.32, 0.45], [0.35, 0.6], [0.3, 0.75],
      [0.22, 0.9], [0.18, 1.05], [0.12, 1.15],
    ]
    const vec3 = pts.map(([x, y]) => new THREE.Vector3(x, y, 0))
    return Float32Array.from(vec3.flatMap((v) => [v.x, v.y, 0]))
  }, [])

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} count={points.length / 3} />
      </bufferGeometry>
      <lineBasicMaterial color="#f59e0b" opacity={0.06} transparent />
    </line>
  )
}

function ConnectionLines({ result }: { result: SimulationResult | null }) {
  const lineRef = useRef<THREE.BufferGeometry>(null)
  const lineRef2 = useRef<THREE.BufferGeometry>(null)

  const { centerLines, interLines } = useMemo(() => {
    if (!result?.organStress) return { centerLines: [], interLines: [] }

    const positions = result.organStress.map((o) => getOrganPosition(o.organ))

    const toCenter: number[] = []
    positions.forEach((p) => {
      toCenter.push(0, 0, 0, p[0], p[1], p[2])
    })

    const between: number[] = []
    const pairs = [
      [0, 1], [1, 2], [1, 3], [2, 4], [3, 5],
      [4, 6], [5, 7], [6, 7], [1, 8], [3, 9], [1, 4], [0, 1],
    ]
    pairs.forEach(([a, b]) => {
      if (positions[a] && positions[b]) {
        between.push(
          positions[a][0], positions[a][1], positions[a][2],
          positions[b][0], positions[b][1], positions[b][2]
        )
      }
    })

    return { centerLines: toCenter, interLines: between }
  }, [result])

  return (
    <group>
      <line>
        <bufferGeometry ref={lineRef}>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(centerLines), 3]}
            count={centerLines.length / 3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#f59e0b" opacity={0.12} transparent />
      </line>
      <line>
        <bufferGeometry ref={lineRef2}>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(interLines), 3]}
            count={interLines.length / 3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#6366f1" opacity={0.08} transparent />
      </line>
    </group>
  )
}

function Rings() {
  const innerRef = useRef<THREE.Mesh>(null)
  const outerRef = useRef<THREE.Mesh>(null)
  const outerRef2 = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (innerRef.current) innerRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.15) * 0.01
    if (outerRef.current) outerRef.current.rotation.y = clock.elapsedTime * 0.06
    if (outerRef2.current) outerRef2.current.rotation.y = -clock.elapsedTime * 0.04
  })

  return (
    <group>
      <mesh ref={innerRef} rotation={[-Math.PI / 2.2, 0, 0]} position={[0, 0, 0]}>
        <ringGeometry args={[0.25, 0.3, 48]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={outerRef} position={[0, 0, 0]}>
        <ringGeometry args={[0.55, 0.57, 48]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={outerRef2} position={[0, 0.05, 0]} rotation={[0.3, 0, 0]}>
        <ringGeometry args={[0.45, 0.47, 48]} />
        <meshBasicMaterial color="#6366f1" transparent opacity={0.06} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function EnergyRing({ result }: { result: SimulationResult | null }) {
  const ref = useRef<THREE.BufferGeometry>(null)
  const maxGlucose = result ? Math.max(...result.glucose.map((g) => g.value)) : 200

  const points = useMemo(() => {
    if (!result) return []
    return result.glucose.map((g, i) => {
      const angle = (i / result.glucose.length) * Math.PI * 2
      const r = 0.6 + (g.value / maxGlucose) * 0.25
      return new THREE.Vector3(
        Math.cos(angle) * r,
        Math.sin(angle * 0.6) * 0.3,
        Math.sin(angle) * r
      )
    })
  }, [result])

  useFrame(({ clock }) => {
    if (ref.current) {
      const positions = ref.current.attributes.position
      if (positions) {
        const array = positions.array as Float32Array
        for (let i = 0; i < points.length; i++) {
          const idx = i * 3
          array[idx] = points[i].x
          array[idx + 1] = points[i].y + Math.sin(clock.elapsedTime * 0.25 + i * 0.04) * 0.015
          array[idx + 2] = points[i].z
        }
        positions.needsUpdate = true
      }
    }
  })

  if (points.length < 2) return null
  return (
    <line>
      <bufferGeometry ref={ref}>
        <bufferAttribute
          attach="attributes-position"
          args={[Float32Array.from(points.flatMap((p) => [p.x, p.y, p.z])), 3]}
          count={points.length}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#f59e0b" opacity={0.15} transparent />
    </line>
  )
}

function Dots() {
  const count = 35
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const r = 0.5 + Math.random() * 0.45
      const y = (Math.random() - 0.5) * 1.2
      pos[i * 3] = Math.cos(angle) * r
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = Math.sin(angle) * r
    }
    return pos
  }, [])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial size={0.006} color="#f59e0b" transparent opacity={0.15} sizeAttenuation />
    </points>
  )
}

function Tooltip({ organ, stress, color, x, y }: {
  organ: string
  stress: number
  color: string
  x: number
  y: number
}) {
  return (
    <div
      style={{
        position: 'fixed',
        left: x + 14,
        top: y - 10,
        zIndex: 100,
        background: 'rgba(255,255,255,0.95)',
        border: `1px solid ${color}40`,
        borderRadius: '10px',
        padding: '8px 12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        pointerEvents: 'none',
        fontSize: '12px',
        minWidth: '120px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
        <span style={{ fontWeight: 600, color: '#111' }}>{organ}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '11px', color: '#666' }}>
        <span>Stress Level</span>
        <span style={{ fontWeight: 600, color }}>{stress}%</span>
      </div>
    </div>
  )
}

export default function BodySimulation({ result }: { result: SimulationResult | null }) {
  const [hovered, setHovered] = useState<{ organ: string; stress: number; color: string } | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handlePointerMove = (e: React.PointerEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY })
  }

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      style={{
        width: '100%',
        height: '480px',
        borderRadius: '16px',
        overflow: 'hidden',
        background: '#f8f8fb',
        border: '1px solid rgba(0,0,0,0.04)',
        position: 'relative',
      }}
    >
      <Canvas camera={{ position: [0, 0.1, 2.8], fov: 40 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 3, 4]} intensity={0.3} />

        <Dots />
        <BodySilhouette />
        <Rings />
        <ConnectionLines result={result} />
        <EnergyRing result={result} />

        {result?.organStress.map((organ) => (
          <OrganNode
            key={organ.organ}
            position={getOrganPosition(organ.organ)}
            color={organ.color}
            intensity={organ.stress}
            label={organ.organ}
            isHovered={hovered?.organ === organ.organ}
            onHover={() => setHovered({ organ: organ.organ, stress: organ.stress, color: organ.color })}
            onLeave={() => setHovered(null)}
          />
        ))}

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.3}
          rotateSpeed={0.5}
          enableDamping
          dampingFactor={0.06}
        />
      </Canvas>

      {hovered && (
        <Tooltip
          organ={hovered.organ}
          stress={hovered.stress}
          color={hovered.color}
          x={mousePos.x}
          y={mousePos.y}
        />
      )}
    </div>
  )
}
