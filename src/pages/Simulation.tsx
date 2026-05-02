import { useRef, useEffect } from 'react'
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

function Chart({ data, color, label, unit, maxValue }: {
  data: { time: number; value: number }[]
  color: string
  label: string
  unit: string
  maxValue?: number
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
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
        <defs>
          <linearGradient id={`g-${label.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.12" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#g-${label.replace(/\s/g, '')})`} />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginTop: '3px' }}>
        <span>0h</span><span>4h</span><span>8h</span>
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
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '11px',
        fontWeight: 600,
        color: color,
        marginBottom: '8px',
      }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: color }} />
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {items.map((item) => (
          <div key={item.label} style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            padding: '3px 0',
            borderBottom: '1px solid rgba(255,255,255,0.03)',
          }}>
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
            color: '#fff', textDecoration: 'none',
            background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
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

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800 }}>Body Simulation</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            <div style={{
              padding: '3px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              background: 'rgba(168,85,247,0.08)',
              border: '1px solid rgba(168,85,247,0.12)',
              color: 'var(--accent-light)',
            }}>
              {currentFood || 'Unknown'}
            </div>
            {currentFood && (
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                biological response
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to="/analyze" style={{
            padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 500,
            color: 'var(--accent-light)', textDecoration: 'none',
            border: '1px solid rgba(168,85,247,0.15)', background: 'rgba(168,85,247,0.04)',
          }}>
            New Analysis
          </Link>
          <Link to="/what-if" style={{
            padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 500,
            color: 'var(--accent-light)', textDecoration: 'none',
            border: '1px solid rgba(168,85,247,0.15)', background: 'rgba(168,85,247,0.04)',
          }}>
            What-If →
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))', gap: '20px' }}>
        <div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <BodySimulation result={result} />
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
            <Chart data={result.glucose} color="#ef4444" label="Blood Glucose" unit="mg/dL" />
            <Chart data={result.insulin} color="#f59e0b" label="Insulin" unit="microU/mL" />
            <Chart data={result.cognitive.map((c) => ({ time: c.time, value: c.focus }))} color="#06b6d4" label="Focus Level" unit="%" maxValue={100} />
            <Chart data={result.cognitive.map((c) => ({ time: c.time, value: c.fog }))} color="#ec4899" label="Brain Fog" unit="%" maxValue={100} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={cardStyle}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>Organ Stress</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {result.organStress.map((organ) => (
                <div key={organ.organ}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                    <span style={{ color: organ.color, fontWeight: 500 }}>{organ.organ}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{organ.stress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.04)' }}>
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
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <PredictionCard
              title="Glucose Response"
              color="#ef4444"
              items={[
                { label: 'Peak Value', value: `${maxGlucose} mg/dL`, color: '#ef4444' },
                { label: 'Severity', value: maxGlucose > 180 ? 'Critical' : maxGlucose > 140 ? 'Elevated' : 'Normal', color: maxGlucose > 180 ? '#ef4444' : maxGlucose > 140 ? '#f59e0b' : '#34d399' },
              ]}
            />
            <PredictionCard
              title="Insulin Demand"
              color="#f59e0b"
              items={[
                { label: 'Peak Value', value: `${maxInsulin} microU/mL`, color: '#f59e0b' },
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
              color="#a855f7"
              items={[
                { label: 'Highest Organ', value: result.organStress.reduce((a, b) => a.stress > b.stress ? a : b).organ },
                { label: 'Max Stress', value: `${maxStress}%`, color: maxStress > 60 ? '#ef4444' : '#34d399' },
              ]}
            />
          </div>

          <div style={{ ...cardStyle, padding: '16px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>Prediction Timeline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '8px',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '9px',
                  fontWeight: 700,
                  color: '#ef4444',
                  flexShrink: 0,
                }}>1</div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>0-2 Hours</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {maxGlucose > 140
                      ? `Blood glucose rises to ${maxGlucose} mg/dL. Insulin response at ${maxInsulin} microU/mL.`
                      : 'Blood glucose remains stable. Minimal insulin response.'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '8px',
                  background: 'rgba(245,158,11,0.1)',
                  border: '1px solid rgba(245,158,11,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '9px',
                  fontWeight: 700,
                  color: '#f59e0b',
                  flexShrink: 0,
                }}>2</div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>2-4 Hours</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {maxGlucose > 140
                      ? 'Energy crash risk. Focus declines as glucose drops from peak. Organ stress at highest levels.'
                      : 'Stable energy. System processing meal. Moderate digestive activity.'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '8px',
                  background: 'rgba(16,185,129,0.1)',
                  border: '1px solid rgba(16,185,129,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '9px',
                  fontWeight: 700,
                  color: '#34d399',
                  flexShrink: 0,
                }}>3</div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>4-8 Hours</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {maxGlucose > 140
                      ? 'Gradual return to baseline. Late elevated glucose may affect sleep. Full recovery by 8 hours.'
                      : 'Complete metabolic recovery. System returned to homeostasis.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
