import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import BodySimulation from '../components/BodyCanvas'
import { useSimulationStore } from '../store/simulationStore'
import { generateSimulation } from '../services/simulationEngine'
import { Link } from 'react-router-dom'

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '16px',
  padding: '18px',
}

const gradientText: React.CSSProperties = {
  background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}

function LineChart({ data, color, label, unit, maxValue, gradient = false }: {
  data: { time: number; value: number }[]
  color: string
  label: string
  unit: string
  maxValue?: number
  gradient?: boolean
}) {
  if (!data.length) return null
  const max = maxValue || Math.max(...data.map((d) => d.value)) * 1.15
  const min = Math.min(...data.map((d) => d.value)) * 0.85
  const range = max - min || 1
  const w = 100
  const h = 60
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((d.value - min) / range) * h
    return `${x},${y}`
  }).join(' ')

  return (
    <div style={{ ...cardStyle, padding: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{unit}</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '50px' }}>
        {gradient && (
          <defs>
            <linearGradient id={`g-${label.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.15" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
        )}
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
        {gradient && (
          <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#g-${label.replace(/\s/g, '')})`} />
        )}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginTop: '3px' }}>
        <span>0h</span><span>4h</span><span>8h</span>
      </div>
    </div>
  )
}

function StressBarChart({ data }: { data: { organ: string; stress: number; color: string }[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {data.map((organ) => (
        <div key={organ.organ}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
            <span style={{ color: organ.color, fontWeight: 500 }}>{organ.organ}</span>
            <span style={{ color: 'var(--text-muted)' }}>{organ.stress}%</span>
          </div>
          <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.04)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${organ.stress}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{
                height: '100%',
                borderRadius: '2px',
                background: `linear-gradient(90deg, ${organ.color}, ${organ.color}66)`,
                boxShadow: `0 0 4px ${organ.color}30`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function TimelineChart({ glucose, insulin, cognitive }: {
  glucose: { time: number; value: number }[]
  insulin: { time: number; value: number }[]
  cognitive: { time: number; focus: number; fog: number }[]
}) {
  if (!glucose.length) return null
  const w = 100
  const h = 80

  const maxG = Math.max(...glucose.map((d) => d.value)) * 1.2
  const minG = Math.min(...glucose.map((d) => d.value)) * 0.8
  const rangeG = maxG - minG || 1
  const maxI = Math.max(...insulin.map((d) => d.value)) * 1.2
  const minI = Math.min(...insulin.map((d) => d.value)) * 0.8
  const rangeI = maxI - minI || 1

  const gPts = glucose.map((d, i) => {
    const x = (i / (glucose.length - 1)) * w
    const y = h - ((d.value - minG) / rangeG) * h
    return `${x},${y}`
  }).join(' ')

  const iPts = insulin.map((d, i) => {
    const x = (i / (insulin.length - 1)) * w
    const y = h - ((d.value - minI) / rangeI) * h
    return `${x},${y}`
  }).join(' ')

  const fogPts = cognitive.map((d, i) => {
    const x = (i / (cognitive.length - 1)) * w
    const y = h - (d.fog / 100) * h
    return `${x},${y}`
  }).join(' ')

  return (
    <div style={cardStyle}>
      <h3 style={{ fontSize: '12px', fontWeight: 600, marginBottom: '10px', color: 'var(--text-muted)' }}>
        <span style={gradientText}>Predictive Timeline</span> — 8 Hour Window
      </h3>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '140px' }}>
        <defs>
          <linearGradient id="gGlucose" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gInsulin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Phase backgrounds */}
        <rect x="0" y="0" width="25" height={h} fill="rgba(239,68,68,0.02)" />
        <rect x="25" y="0" width="25" height={h} fill="rgba(245,158,11,0.02)" />
        <rect x="50" y="0" width="25" height={h} fill="rgba(16,185,129,0.02)" />
        <rect x="75" y="0" width="25" height={h} fill="rgba(99,102,241,0.02)" />

        {/* Phase labels */}
        <text x="12.5" y={h - 3} textAnchor="middle" fill="rgba(255,255,255,0.08)" fontSize="5">Digestion</text>
        <text x="37.5" y={h - 3} textAnchor="middle" fill="rgba(255,255,255,0.08)" fontSize="5">Peak</text>
        <text x="62.5" y={h - 3} textAnchor="middle" fill="rgba(255,255,255,0.08)" fontSize="5">Recovery</text>
        <text x="87.5" y={h - 3} textAnchor="middle" fill="rgba(255,255,255,0.08)" fontSize="5">Baseline</text>

        {/* Glucose area */}
        <polygon points={`0,${h} ${gPts} ${w},${h}`} fill="url(#gGlucose)" />
        <polyline points={gPts} fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />

        {/* Insulin area */}
        <polygon points={`0,${h} ${iPts} ${w},${h}`} fill="url(#gInsulin)" />
        <polyline points={iPts} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />

        {/* Fog line */}
        <polyline points={fogPts} fill="none" stroke="#ec4899" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" strokeDasharray="2,2" />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px', fontSize: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '10px', height: '2px', borderRadius: '1px', background: '#ef4444' }} />
          <span style={{ color: 'var(--text-muted)' }}>Glucose</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '10px', height: '2px', borderRadius: '1px', background: '#f59e0b' }} />
          <span style={{ color: 'var(--text-muted)' }}>Insulin</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '10px', height: '2px', borderRadius: '1px', background: '#ec4899', borderStyle: 'dashed' }} />
          <span style={{ color: 'var(--text-muted)' }}>Brain Fog</span>
        </div>
      </div>
    </div>
  )
}

function PredictionCard({ title, items, color }: {
  title: string
  items: { label: string; value: string; color?: string }[]
  color: string
}) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.04)',
      borderRadius: '10px',
      padding: '12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color, marginBottom: '8px' }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: color }} />
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {items.map((item) => (
          <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
            <span style={{ fontWeight: 600, color: item.color || 'var(--text-primary)' }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Simulation() {
  const { result, profile, currentFood, isLoading } = useSimulationStore()
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    if (!result && !isLoading && currentFood) {
      const sim = generateSimulation(currentFood, profile)
      useSimulationStore.getState().setResult(sim)
    }
  }, [])

  if (!result && !isLoading) {
    return (
      <div style={{ minHeight: 'calc(100vh - 88px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '48px', opacity: 0.2, marginBottom: '16px' }}>◉</div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>No Simulation Yet</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Analyze a food first to see your personalized body simulation.</p>
          <Link to="/analyze" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600,
            color: '#000', textDecoration: 'none',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          }}>
            Analyze Food →
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading || !result) {
    return (
      <div style={{ minHeight: 'calc(100vh - 88px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.6s linear infinite' }} />
      </div>
    )
  }

  const maxGlucose = Math.max(...result.glucose.map((g) => g.value))
  const maxInsulin = Math.max(...result.insulin.map((i) => i.value))
  const maxFog = Math.max(...result.cognitive.map((c) => c.fog))
  const maxStress = Math.max(...result.organStress.map((o) => o.stress))
  const minGlucose = Math.min(...result.glucose.map((g) => g.value))
  const avgStress = Math.round(result.organStress.reduce((a, o) => a + o.stress, 0) / result.organStress.length)

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px 60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800 }}>
            Body <span style={gradientText}>Simulation</span>
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            <div style={{
              padding: '3px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
              background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.12)', color: 'var(--accent-light)',
            }}>
              {currentFood || 'Unknown'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to="/analyze" style={{
            padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 500,
            color: 'var(--accent-light)', textDecoration: 'none',
            border: '1px solid rgba(245,158,11,0.15)', background: 'rgba(245,158,11,0.04)',
          }}>
            New Analysis
          </Link>
          <Link to="/what-if" style={{
            padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 500,
            color: 'var(--accent-light)', textDecoration: 'none',
            border: '1px solid rgba(245,158,11,0.15)', background: 'rgba(245,158,11,0.04)',
          }}>
            What-If →
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
        {[
          { label: 'Peak Glucose', value: `${maxGlucose} mg/dL`, color: '#ef4444' },
          { label: 'Peak Insulin', value: `${maxInsulin} µU/mL`, color: '#f59e0b' },
          { label: 'Avg Stress', value: `${avgStress}%`, color: '#a855f7' },
          { label: 'Brain Fog', value: `${maxFog}%`, color: '#ec4899' },
        ].map((stat) => (
          <div key={stat.label} style={{ ...cardStyle, padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))', gap: '20px' }}>
        {/* Left column */}
        <div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <BodySimulation result={result} />
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
            <LineChart data={result.glucose} color="#ef4444" label="Blood Glucose" unit="mg/dL" gradient />
            <LineChart data={result.insulin} color="#f59e0b" label="Insulin" unit="µU/mL" gradient />
            <LineChart data={result.cognitive.map((c) => ({ time: c.time, value: c.focus }))} color="#06b6d4" label="Focus Level" unit="%" maxValue={100} gradient />
            <LineChart data={result.cognitive.map((c) => ({ time: c.time, value: c.fog }))} color="#ec4899" label="Brain Fog" unit="%" maxValue={100} gradient />
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Predictive Timeline */}
          <TimelineChart glucose={result.glucose} insulin={result.insulin} cognitive={result.cognitive} />

          {/* Organ Stress */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 600 }}>Organ Stress</h3>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                style={{
                  border: 'none', color: 'var(--accent-light)',
                  fontSize: '11px', cursor: 'pointer', padding: '2px 8px',
                  borderRadius: '6px', background: 'rgba(245,158,11,0.06)',
                }}
              >
                {showAdvanced ? 'Simple' : 'Advanced'}
              </button>
            </div>
            {showAdvanced ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {result.organStress.map((organ) => (
                  <div key={organ.organ} style={{
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                    borderRadius: '10px', padding: '12px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>{organ.organ}</div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: organ.color }}>{organ.stress}%</div>
                    <div style={{ width: '100%', height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.04)', marginTop: '6px' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${organ.stress}%` }}
                        transition={{ duration: 0.8 }}
                        style={{ height: '100%', borderRadius: '2px', background: organ.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <StressBarChart data={result.organStress} />
            )}
          </div>

          {/* Prediction Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <PredictionCard
              title="Glucose Response"
              color="#ef4444"
              items={[
                { label: 'Peak', value: `${maxGlucose} mg/dL`, color: '#ef4444' },
                { label: 'Low', value: `${minGlucose} mg/dL`, color: '#06b6d4' },
                { label: 'Status', value: maxGlucose > 180 ? 'Critical' : maxGlucose > 140 ? 'Elevated' : 'Normal', color: maxGlucose > 180 ? '#ef4444' : maxGlucose > 140 ? '#f59e0b' : '#34d399' },
              ]}
            />
            <PredictionCard
              title="Insulin Demand"
              color="#f59e0b"
              items={[
                { label: 'Peak', value: `${maxInsulin} µU/mL`, color: '#f59e0b' },
                { label: 'Pancreatic Load', value: maxInsulin > 60 ? 'High' : maxInsulin > 30 ? 'Moderate' : 'Low', color: maxInsulin > 60 ? '#ef4444' : maxInsulin > 30 ? '#f59e0b' : '#34d399' },
              ]}
            />
            <PredictionCard
              title="Cognitive State"
              color="#06b6d4"
              items={[
                { label: 'Brain Fog Peak', value: `${maxFog}%`, color: maxFog > 50 ? '#ec4899' : '#34d399' },
                { label: 'Focus Impact', value: maxFog > 50 ? 'Impaired' : 'Clear', color: maxFog > 50 ? '#ef4444' : '#34d399' },
              ]}
            />
            <PredictionCard
              title="Overall Stress"
              color="#f59e0b"
              items={[
                { label: 'Highest Organ', value: result.organStress.reduce((a, b) => a.stress > b.stress ? a : b).organ },
                { label: 'Avg Stress', value: `${avgStress}%`, color: avgStress > 50 ? '#ef4444' : '#34d399' },
              ]}
            />
          </div>

          {/* Prediction Text */}
          <div style={{ ...cardStyle, padding: '16px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>Prediction Timeline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { num: '1', title: '0-2 Hours', color: '#ef4444', text: maxGlucose > 140 ? `Blood glucose rises to ${maxGlucose} mg/dL. Insulin response at ${maxInsulin} µU/mL.` : 'Blood glucose remains stable. Minimal insulin response.' },
                { num: '2', title: '2-4 Hours', color: '#f59e0b', text: maxGlucose > 140 ? 'Energy crash risk. Focus declines as glucose drops from peak. Organ stress at highest levels.' : 'Stable energy. System processing meal. Moderate digestive activity.' },
                { num: '3', title: '4-8 Hours', color: '#34d399', text: maxGlucose > 140 ? 'Gradual return to baseline. Late elevated glucose may affect sleep. Full recovery by 8 hours.' : 'Complete metabolic recovery. System returned to homeostasis.' },
              ].map((phase) => (
                <div key={phase.num} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '8px',
                    background: `${phase.color}10`, border: `1px solid ${phase.color}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '9px', fontWeight: 700, color: phase.color, flexShrink: 0,
                  }}>
                    {phase.num}
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>{phase.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{phase.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
