import { useState } from 'react'
import { motion } from 'framer-motion'
import { generateSimulation } from '../services/simulationEngine'
import { analyzeFoodText } from '../services/kimiApi'
import { useSimulationStore } from '../store/simulationStore'
import type { SimulationResult } from '../store/simulationStore'
import type { KimiAnalysisResult } from '../services/kimiApi'

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '16px',
  padding: '18px',
}

const scenarios = [
  { id: 'normal', label: 'Normal State', desc: 'Well-rested, hydrated, average activity', mods: { sleepHours: 8, activityLevel: 'moderate' as const, hasDiabetes: false } },
  { id: 'sleepDeprived', label: 'Sleep-Deprived', desc: 'Only 4 hours of sleep, stressed', mods: { sleepHours: 4, activityLevel: 'sedentary' as const, hasDiabetes: false } },
  { id: 'postWorkout', label: 'Post-Workout', desc: 'After intense exercise, high metabolism', mods: { sleepHours: 7, activityLevel: 'active' as const, hasDiabetes: false } },
  { id: 'diabetic', label: 'Diabetic Profile', desc: 'Type 2 diabetes, reduced insulin sensitivity', mods: { sleepHours: 7, activityLevel: 'moderate' as const, hasDiabetes: true } },
]

const suggestions = ['Pepperoni Pizza', 'Caesar Salad', 'Double Cheeseburger', 'Sushi Platter', 'Bowl of Oatmeal', 'Chicken Stir-fry']

export default function WhatIfLab() {
  const { profile } = useSimulationStore()
  const [food, setFood] = useState('')
  const [selected, setSelected] = useState<string[]>(['normal'])
  const [results, setResults] = useState<Record<string, SimulationResult | null>>({})
  const [hasRun, setHasRun] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [kimiData, setKimiData] = useState<KimiAnalysisResult | null>(null)

  const toggleScenario = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const handleCompare = async () => {
    if (!food.trim() || selected.length === 0) return
    setIsLoading(true)
    setKimiData(null)

    let kimiResult: KimiAnalysisResult | undefined
    try {
      kimiResult = await analyzeFoodText(food, '')
      setKimiData(kimiResult)
    } catch {
      // Kimi API failed — fall back to keyword-based estimation
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
    setIsLoading(false)
  }

  const getStatus = (maxGlucose: number) => {
    if (maxGlucose > 150) return 'High'
    if (maxGlucose > 120) return 'Moderate'
    return 'Stable'
  }

  const getStatusColor = (maxGlucose: number) => {
    if (maxGlucose > 150) return '#ef4444'
    if (maxGlucose > 120) return '#f59e0b'
    return '#34d399'
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 16px 60px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, marginBottom: '8px' }}>What-If Lab</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '500px', margin: '0 auto' }}>
          See how the same food affects your body differently depending on context — sleep, exercise, health conditions.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '20px' }}>
        <div>
          <div style={cardStyle}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Enter Food</h3>
            <input
              type="text"
              value={food}
              onChange={(e) => setFood(e.target.value)}
              placeholder="Type any food... e.g. Margherita pizza with garlic bread"
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
                  onClick={() => setFood(f)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    border: `1px solid ${food === f ? 'rgba(168,85,247,0.2)' : 'var(--border-subtle)'}`,
                    background: food === f ? 'rgba(168,85,247,0.08)' : 'rgba(255,255,255,0.02)',
                    color: food === f ? 'var(--accent-light)' : 'var(--text-muted)',
                    cursor: 'pointer',
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
                  onClick={() => toggleScenario(s.id)}
                  style={{
                    textAlign: 'left',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: `1px solid ${selected.includes(s.id) ? 'rgba(168,85,247,0.15)' : 'transparent'}`,
                    background: selected.includes(s.id) ? 'rgba(168,85,247,0.06)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    color: selected.includes(s.id) ? 'var(--accent-light)' : 'var(--text-secondary)',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 500 }}>{s.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.desc}</div>
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
              color: '#fff',
              border: 'none',
              cursor: (!food.trim() || selected.length === 0 || isLoading) ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
              opacity: (!food.trim() || selected.length === 0 || isLoading) ? 0.4 : 1,
              transition: 'all 0.2s',
            }}
          >
            {isLoading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} />
                Kimi AI Analyzing...
              </span>
            ) : hasRun ? 'Re-run Comparison →' : 'Run Comparison →'}
          </button>
        </div>

        <div>
          {hasRun && kimiData && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ ...cardStyle, marginBottom: '12px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent-light)' }}>
                  Kimi AI Analysis
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                <div style={{ textAlign: 'center', padding: '8px', borderRadius: '8px', background: 'rgba(168,85,247,0.04)' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700 }}>{kimiData.estimatedCalories}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>kcal</div>
                </div>
                <div style={{ textAlign: 'center', padding: '8px', borderRadius: '8px', background: 'rgba(168,85,247,0.04)' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700 }}>{kimiData.estimatedCarbs}g</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Carbs</div>
                </div>
                <div style={{ textAlign: 'center', padding: '8px', borderRadius: '8px', background: 'rgba(168,85,247,0.04)' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700 }}>{kimiData.estimatedProtein}g</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Protein</div>
                </div>
                <div style={{ textAlign: 'center', padding: '8px', borderRadius: '8px', background: 'rgba(168,85,247,0.04)' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700 }}>{kimiData.estimatedFat}g</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Fat</div>
                </div>
              </div>
            </motion.div>
          )}
          {hasRun && Object.keys(results).length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '12px' }}>
              {scenarios.filter((s) => results[s.id]).map((scenario) => {
                const sim = results[scenario.id]!
                const maxGlucose = Math.max(...sim.glucose.map((g) => g.value))
                const maxInsulin = Math.max(...sim.insulin.map((i) => i.value))
                const avgStress = Math.round(sim.organStress.reduce((a, o) => a + o.stress, 0) / sim.organStress.length)
                const maxFog = Math.max(...sim.cognitive.map((c) => c.fog))
                const status = getStatus(maxGlucose)
                const statusColor = getStatusColor(maxGlucose)

                return (
                  <motion.div
                    key={scenario.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={cardStyle}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h3 style={{ fontSize: '13px', fontWeight: 600 }}>{scenario.label}</h3>
                      <span style={{
                        fontSize: '10px',
                        padding: '2px 8px',
                        borderRadius: '100px',
                        background: `${statusColor}15`,
                        color: statusColor,
                        fontWeight: 600,
                      }}>
                        {status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Peak Glucose</span>
                        <span style={{ color: '#ef4444', fontWeight: 600 }}>{maxGlucose} mg/dL</span>
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
                    </div>
                    <svg viewBox="0 0 100 32" style={{ width: '100%', height: '32px', marginTop: '10px' }}>
                      <polyline
                        points={sim.glucose.map((d, i) => `${(i / (sim.glucose.length - 1)) * 100},${32 - ((d.value - 70) / 150) * 32}`).join(' ')}
                        fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.5"
                      />
                      <polyline
                        points={sim.insulin.map((d, i) => `${(i / (sim.insulin.length - 1)) * 100},${32 - ((d.value - 5) / 80) * 32}`).join(' ')}
                        fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.5"
                      />
                    </svg>
                  </motion.div>
                )
              })}
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
              <div style={{ fontSize: '40px', opacity: 0.2 }}>◇</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Type a food, select scenarios, then click Run Comparison</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
