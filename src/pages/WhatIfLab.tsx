import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { generateSimulation } from '../services/simulationEngine'
import { analyzeFoodText } from '../services/kimiApi'
import { useSimulationStore } from '../store/simulationStore'
import type { SimulationResult } from '../store/simulationStore'
import type { KimiAnalysisResult } from '../services/kimiApi'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

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

const scenarios = [
  { id: 'normal', label: 'Normal State', desc: 'Well-rested, hydrated, average activity', mods: { sleepHours: 8, activityLevel: 'moderate' as const, hasDiabetes: false } },
  { id: 'sleepDeprived', label: 'Sleep-Deprived', desc: 'Only 4 hours of sleep, stressed', mods: { sleepHours: 4, activityLevel: 'sedentary' as const, hasDiabetes: false } },
  { id: 'postWorkout', label: 'Post-Workout', desc: 'After intense exercise, high metabolism', mods: { sleepHours: 7, activityLevel: 'active' as const, hasDiabetes: false } },
  { id: 'diabetic', label: 'Diabetic Profile', desc: 'Type 2 diabetes, reduced insulin sensitivity', mods: { sleepHours: 7, activityLevel: 'moderate' as const, hasDiabetes: true } },
]

const suggestions = ['Pepperoni Pizza', 'Caesar Salad', 'Double Cheeseburger', 'Sushi Platter', 'Bowl of Oatmeal', 'Chicken Stir-fry']

const scenarioColors: Record<string, string> = {
  normal: '#34d399',
  sleepDeprived: '#f59e0b',
  postWorkout: '#06b6d4',
  diabetic: '#ef4444',
}

function GlucoseOverlay({ results }: { results: Record<string, SimulationResult> }) {
  const w = 100
  const h = 60
  const allGlucose = Object.values(results).flatMap((r) => r.glucose.map((g) => g.value))
  const maxG = Math.max(...allGlucose) * 1.15
  const minG = Math.min(...allGlucose) * 0.85
  const range = maxG - minG || 1

  return (
    <div style={cardStyle}>
      <h3 style={{ fontSize: '12px', fontWeight: 600, marginBottom: '10px', color: 'var(--text-muted)' }}>
        Glucose <span style={gradientText}>Overlay</span>
      </h3>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '100px' }}>
        {Object.entries(results).map(([id, sim]) => {
          const pts = sim.glucose.map((d, i) => {
            const x = (i / (sim.glucose.length - 1)) * w
            const y = h - ((d.value - minG) / range) * h
            return `${x},${y}`
          }).join(' ')
          return (
            <polyline key={id} points={pts} fill="none" stroke={scenarioColors[id]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
          )
        })}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
        {Object.keys(results).map((id) => {
          const s = scenarios.find((s) => s.id === id)
          if (!s) return null
          return (
            <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: scenarioColors[id], flexShrink: 0 }} />
              <span style={{ color: 'var(--text-muted)' }}>{s.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function OrganStressComparison({ results }: { results: Record<string, SimulationResult> }) {
  const organs = ['Pancreas', 'Liver', 'Heart', 'Kidneys', 'Brain', 'Stomach', 'Intestines', 'Immune']
  return (
    <div style={cardStyle}>
      <h3 style={{ fontSize: '12px', fontWeight: 600, marginBottom: '10px', color: 'var(--text-muted)' }}>
        Organ Stress <span style={gradientText}>Comparison</span>
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {organs.map((organ) => {
          const values = Object.entries(results).map(([id, sim]) => {
            const o = sim.organStress.find((o) => o.organ === organ)
            return { id, stress: o?.stress || 0, color: o?.color || '#666' }
          })
          const maxVal = Math.max(...values.map((v) => v.stress), 1)
          return (
            <div key={organ}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px', fontWeight: 500 }}>{organ}</div>
              <div style={{ display: 'flex', gap: '4px', height: '12px' }}>
                {values.map((v) => (
                  <div
                    key={v.id}
                    style={{
                      flex: 1,
                      borderRadius: '3px',
                      background: `${v.color}15`,
                      border: `1px solid ${v.color}20`,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(v.stress / maxVal) * 100}%` }}
                      transition={{ duration: 0.6 }}
                      style={{
                        height: '100%',
                        borderRadius: '3px',
                        background: v.color,
                        opacity: 0.7,
                      }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginTop: '1px' }}>
                {values.map((v) => (
                  <span key={v.id} style={{ color: v.color }}>{v.stress}%</span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
        {Object.keys(results).map((id) => {
          const s = scenarios.find((s) => s.id === id)
          if (!s) return null
          return (
            <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '2px', background: scenarioColors[id], flexShrink: 0 }} />
              <span style={{ color: 'var(--text-muted)' }}>{s.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ScenarioCard({ scenario, sim }: { scenario: typeof scenarios[0]; sim: SimulationResult }) {
  const maxGlucose = Math.max(...sim.glucose.map((g) => g.value))
  const minGlucose = Math.min(...sim.glucose.map((g) => g.value))
  const maxInsulin = Math.max(...sim.insulin.map((i) => i.value))
  const avgStress = Math.round(sim.organStress.reduce((a, o) => a + o.stress, 0) / sim.organStress.length)
  const maxFog = Math.max(...sim.cognitive.map((c) => c.fog))
  const minFocus = Math.min(...sim.cognitive.map((c) => c.focus))
  const color = scenarioColors[scenario.id]

  const status = maxGlucose > 150 ? 'High' : maxGlucose > 120 ? 'Moderate' : 'Stable'
  const statusColor = maxGlucose > 150 ? '#ef4444' : maxGlucose > 120 ? '#f59e0b' : '#34d399'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        ...cardStyle,
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 600 }}>{scenario.label}</h3>
        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '100px', background: `${statusColor}15`, color: statusColor, fontWeight: 600 }}>
          {status}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: '11px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Peak Glucose</span>
          <span style={{ color: '#ef4444', fontWeight: 600 }}>{maxGlucose} mg/dL</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Low Glucose</span>
          <span style={{ color: '#06b6d4', fontWeight: 600 }}>{minGlucose} mg/dL</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Peak Insulin</span>
          <span style={{ color: '#f59e0b', fontWeight: 600 }}>{maxInsulin} µU/mL</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Avg Stress</span>
          <span style={{ color: '#a855f7', fontWeight: 600 }}>{avgStress}%</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Brain Fog</span>
          <span style={{ color: '#ec4899', fontWeight: 600 }}>{maxFog}%</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Min Focus</span>
          <span style={{ color: '#06b6d4', fontWeight: 600 }}>{minFocus}%</span>
        </div>
      </div>

      <svg viewBox="0 0 100 32" style={{ width: '100%', height: '28px' }}>
        <polyline
          points={sim.glucose.map((d, i) => `${(i / (sim.glucose.length - 1)) * 100},${32 - ((d.value - 70) / 150) * 32}`).join(' ')}
          fill="none" stroke="#ef4444" strokeWidth="1.2" opacity="0.6"
        />
        <polyline
          points={sim.insulin.map((d, i) => `${(i / (sim.insulin.length - 1)) * 100},${32 - ((d.value - 5) / 80) * 32}`).join(' ')}
          fill="none" stroke="#f59e0b" strokeWidth="1.2" opacity="0.6"
        />
      </svg>
    </motion.div>
  )
}

export default function WhatIfLab() {
  const { profile } = useSimulationStore()
  const [food, setFood] = useState('')
  const [selected, setSelected] = useState<string[]>(['normal'])
  const [results, setResults] = useState<Record<string, SimulationResult>>({})
  const [hasRun, setHasRun] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [kimiData, setKimiData] = useState<KimiAnalysisResult | null>(null)
  const [agentDone, setAgentDone] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  const toggleScenario = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const handleCompare = async () => {
    if (!food.trim() || selected.length === 0) return
    setIsLoading(true)
    setAgentDone(false)
    setKimiData(null)
    setHasRun(false)

    let kimiResult: KimiAnalysisResult | undefined
    try {
      kimiResult = await analyzeFoodText(food, '')
      setKimiData(kimiResult)
    } catch {
      // fall back to keyword-based
    }

    const sims: Record<string, SimulationResult> = {}
    const base = profile || { name: 'User', age: 30, weight: 70, height: 175, gender: 'male' as const, activityLevel: 'moderate' as const, sleepHours: 8, hasDiabetes: false, geneticMarkers: [] }

    for (const s of scenarios) {
      if (selected.includes(s.id)) {
        sims[s.id] = generateSimulation(food, { ...base, ...s.mods }, kimiResult?.rawMarkdown, kimiResult)
      }
    }
    setResults(sims)
    setHasRun(true)
    setAgentDone(true)
    setIsLoading(false)
  }

  const handleExportPDF = async () => {
    if (!reportRef.current) return
    const canvas = await html2canvas(reportRef.current, {
      backgroundColor: '#0a0a0a',
      scale: 2,
    } as any)
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const w = pdf.internal.pageSize.getWidth()
    const h = (canvas.height * w) / canvas.width
    if (h > pdf.internal.pageSize.getHeight()) {
      const pages = Math.ceil(h / pdf.internal.pageSize.getHeight())
      for (let i = 0; i < pages; i++) {
        if (i > 0) pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, -(h / pages) * i, w, h)
      }
    } else {
      pdf.addImage(imgData, 'PNG', 0, 0, w, h)
    }
    pdf.save('what-if-lab-report.pdf')
  }

  const scenarioIds = Object.keys(results)
  const allMaxGlucose = scenarioIds.map((id) => Math.max(...results[id].glucose.map((g) => g.value)))
  const allMaxInsulin = scenarioIds.map((id) => Math.max(...results[id].insulin.map((i) => i.value)))
  const allAvgStress = scenarioIds.map((id) => Math.round(results[id].organStress.reduce((a, o) => a + o.stress, 0) / results[id].organStress.length))
  const allMaxFog = scenarioIds.map((id) => Math.max(...results[id].cognitive.map((c) => c.fog)))

  const bestGlucose = allMaxGlucose.length ? Math.min(...allMaxGlucose) : 0
  const worstGlucose = allMaxGlucose.length ? Math.max(...allMaxGlucose) : 0
  const bestGlucoseId = allMaxGlucose.length ? scenarioIds[allMaxGlucose.indexOf(bestGlucose)] : ''
  const worstGlucoseId = allMaxGlucose.length ? scenarioIds[allMaxGlucose.indexOf(worstGlucose)] : ''

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 16px 60px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: '32px' }}
      >
        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, marginBottom: '8px' }}>
          What-If <span style={gradientText}>Lab</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '500px', margin: '0 auto' }}>
          See how the same food affects your body differently depending on context — sleep, exercise, health conditions.
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
        {/* Left: Controls */}
        <div>
          <div style={cardStyle}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Enter Food</h3>
            <input
              type="text"
              value={food}
              onChange={(e) => setFood(e.target.value)}
              placeholder="Type any food... e.g. Margherita pizza with garlic bread"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                outline: 'none',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                marginBottom: '10px',
              }}
            />
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>Suggestions</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {suggestions.map((f) => (
                <button
                  key={f}
                  onClick={() => !isLoading && setFood(f)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    border: `1px solid ${food === f ? 'rgba(245,158,11,0.2)' : 'var(--border-subtle)'}`,
                    background: food === f ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.02)',
                    color: food === f ? 'var(--accent-light)' : 'var(--text-muted)',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.5 : 1,
                    transition: 'all 0.15s',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div style={{ ...cardStyle, marginTop: '12px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>Scenarios</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {scenarios.map((s) => (
                <button
                  key={s.id}
                  onClick={() => !isLoading && toggleScenario(s.id)}
                  style={{
                    textAlign: 'left',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: `1px solid ${selected.includes(s.id) ? `${scenarioColors[s.id]}30` : 'transparent'}`,
                    background: selected.includes(s.id) ? `${scenarioColors[s.id]}08` : 'transparent',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: selected.includes(s.id) ? scenarioColors[s.id] : 'var(--text-secondary)',
                    transition: 'all 0.15s',
                    opacity: isLoading ? 0.5 : 1,
                  }}
                >
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: selected.includes(s.id) ? scenarioColors[s.id] : 'var(--text-muted)',
                    flexShrink: 0,
                  }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>{s.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCompare}
            disabled={!food.trim() || selected.length === 0 || isLoading}
            style={{
              width: '100%',
              marginTop: '12px',
              padding: '12px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#000',
              border: 'none',
              cursor: (!food.trim() || selected.length === 0 || isLoading) ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              opacity: (!food.trim() || selected.length === 0 || isLoading) ? 0.4 : 1,
              transition: 'all 0.2s',
            }}
          >
            {isLoading ? 'Analyzing...' : hasRun ? 'Re-run Comparison →' : 'Run Comparison →'}
          </button>
        </div>

        {/* Right: Results */}
        <div ref={reportRef}>
          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', minHeight: '200px' }}>
              {[
                { id: 'food', label: 'Food Analysis Agent', desc: 'Identifying food and estimating nutrition via Kimi K2.6', color: '#f59e0b' },
                { id: 'sim', label: 'Comparison Engine Agent', desc: 'Running simulations across all selected scenarios', color: '#d97706' },
              ].map((agent) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    background: agentDone ? `linear-gradient(145deg, ${agent.color}08, ${agent.color}02)` : 'var(--bg-surface)',
                    border: `1px solid ${agentDone ? `${agent.color}25` : `${agent.color}15`}`,
                    borderRadius: '14px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: `linear-gradient(90deg, ${agent.color}, ${agent.color}44, transparent)` }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: agentDone ? '#34d399' : agent.color,
                      boxShadow: agentDone ? '0 0 8px #34d39970' : `0 0 8px ${agent.color}50`,
                      animation: agentDone ? 'none' : 'pulse 1.2s ease-in-out infinite',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: agentDone ? '#34d399' : 'var(--text-primary)' }}>
                        {agentDone ? 'Complete' : agent.label}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>
                        {agentDone ? 'All tasks finished' : agent.desc}
                      </div>
                    </div>
                    {agentDone ? (
                      <span style={{ color: '#34d399', fontSize: '16px', fontWeight: 700 }}>✓</span>
                    ) : (
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: agent.color, animation: 'spin 0.7s linear infinite' }} />
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div key={i} style={{
                        aspectRatio: '1', borderRadius: '50%', transition: 'all 0.3s ease',
                        background: agentDone ? `linear-gradient(135deg, ${agent.color}, transparent)` : `${agent.color}06`,
                        border: `1px solid ${agentDone ? `${agent.color}50` : `${agent.color}10`}`,
                        boxShadow: agentDone ? `inset 0 0 4px ${agent.color}40` : 'none',
                        animation: agentDone ? 'none' : `fillPulse ${1.2 + i * 0.06}s ease-in-out infinite`,
                      }} />
                    ))}
                  </div>
                  <div style={{ marginTop: '10px', height: '2px', borderRadius: '1px', background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                    <motion.div
                      animate={{ width: agentDone ? '100%' : ['0%', '100%'] }}
                      transition={agentDone ? { duration: 0.3 } : { duration: 2.5, ease: 'easeInOut' }}
                      style={{ height: '100%', borderRadius: '1px', background: `linear-gradient(90deg, ${agent.color}, transparent)` }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : hasRun && Object.keys(results).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Export button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{
                  padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                  background: 'rgba(52,211,153,0.1)', color: '#34d399',
                }}>
                  Comparison Results
                </div>
                <button
                  onClick={handleExportPDF}
                  style={{
                    padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
                    color: '#000', border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}
                >
                  <span style={{ fontSize: '14px' }}>⬇</span>
                  Export PDF
                </button>
              </div>

              {/* Kimi nutrition card */}
              {kimiData && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ ...cardStyle }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent-light)' }}>
                      Kimi AI — {kimiData.foodName}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {[
                      { label: 'Calories', value: kimiData.estimatedCalories, unit: 'kcal' },
                      { label: 'Carbs', value: `${kimiData.estimatedCarbs}g`, unit: '' },
                      { label: 'Protein', value: `${kimiData.estimatedProtein}g`, unit: '' },
                      { label: 'Fat', value: `${kimiData.estimatedFat}g`, unit: '' },
                    ].map((d) => (
                      <div key={d.label} style={{ textAlign: 'center', padding: '8px', borderRadius: '8px', background: 'rgba(245,158,11,0.04)' }}>
                        <div style={{ fontSize: '16px', fontWeight: 700 }}>{d.value}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{d.label}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Leaderboard */}
              {scenarioIds.length > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ ...cardStyle }}
                >
                  <h3 style={{ fontSize: '12px', fontWeight: 600, marginBottom: '10px', color: 'var(--text-muted)' }}>
                    <span style={gradientText}>Best vs Worst</span>
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{
                      padding: '10px', borderRadius: '10px',
                      background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.1)',
                    }}>
                      <div style={{ fontSize: '10px', color: '#34d399', fontWeight: 600, marginBottom: '4px' }}>✅ Best Glucose</div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: '#34d399' }}>{bestGlucose} mg/dL</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {scenarios.find((s) => s.id === bestGlucoseId)?.label || bestGlucoseId}
                      </div>
                    </div>
                    <div style={{
                      padding: '10px', borderRadius: '10px',
                      background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)',
                    }}>
                      <div style={{ fontSize: '10px', color: '#ef4444', fontWeight: 600, marginBottom: '4px' }}>⚠️ Worst Glucose</div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: '#ef4444' }}>{worstGlucose} mg/dL</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {scenarios.find((s) => s.id === worstGlucoseId)?.label || worstGlucoseId}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Glucose overlay chart */}
              {scenarioIds.length > 1 && <GlucoseOverlay results={results} />}

              {/* Organ stress comparison */}
              {scenarioIds.length > 1 && <OrganStressComparison results={results} />}

              {/* Per-scenario cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '12px' }}>
                {scenarios.filter((s) => results[s.id]).map((scenario) => (
                  <ScenarioCard key={scenario.id} scenario={scenario} sim={results[scenario.id]!} />
                ))}
              </div>

              {/* Summary stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {[
                  { label: 'Avg Peak Glucose', value: allMaxGlucose.length ? `${Math.round(allMaxGlucose.reduce((a, b) => a + b, 0) / allMaxGlucose.length)} mg/dL` : '—', color: '#ef4444' },
                  { label: 'Avg Peak Insulin', value: allMaxInsulin.length ? `${Math.round(allMaxInsulin.reduce((a, b) => a + b, 0) / allMaxInsulin.length)} µU/mL` : '—', color: '#f59e0b' },
                  { label: 'Avg Stress (all)', value: allAvgStress.length ? `${Math.round(allAvgStress.reduce((a, b) => a + b, 0) / allAvgStress.length)}%` : '—', color: '#a855f7' },
                  { label: 'Avg Brain Fog', value: allMaxFog.length ? `${Math.round(allMaxFog.reduce((a, b) => a + b, 0) / allMaxFog.length)}%` : '—', color: '#ec4899' },
                ].map((stat) => (
                  <div key={stat.label} style={{ ...cardStyle, padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center', fontSize: '10px', color: 'var(--text-muted)', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.04)', opacity: 0.5 }}>
                checkhealth.ai — What-If Lab Comparison Report
              </div>
            </div>
          ) : (
            <div style={{
              ...cardStyle,
              minHeight: '300px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: '8px',
            }}>
              <div style={{ fontSize: '40px', opacity: 0.15 }}>◇</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Type a food, select scenarios, then click Run Comparison</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
