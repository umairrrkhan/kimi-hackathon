import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useSimulationStore } from '../store/simulationStore'
import { analyzeGeneticData } from '../services/kimiApi'
import type { GeneticAnalysisResult } from '../services/kimiApi'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '16px',
  padding: '18px',
}

const gradientText: React.CSSProperties = {
  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}

type Stage = 'idle' | 'fileSelected' | 'analyzing' | 'complete' | 'error'

const knownGenes = [
  { gene: 'FTO', name: 'Fat Mass & Obesity', impact: 'Increases appetite. AA variant amplifies glucose response by ~30%.' },
  { gene: 'APOE', name: 'Apolipoprotein E', impact: 'E4 variant increases lipid response and cognitive sensitivity to high-fat meals.' },
  { gene: 'TCF7L2', name: 'Transcription Factor 7-Like 2', impact: 'Strongly linked to type 2 diabetes risk. Modulates insulin secretion.' },
  { gene: 'PPARG', name: 'PPAR Gamma', impact: 'Pro12Ala variant improves insulin sensitivity by ~10%.' },
  { gene: 'MTHFR', name: 'Methylenetetrahydrofolate Reductase', impact: 'C677T variant affects folate metabolism and detoxification.' },
]

const riskColors: Record<string, string> = {
  low: '#34d399',
  moderate: '#f59e0b',
  high: '#ef4444',
}

const AGENTS = [
  {
    id: 'genetic',
    label: 'Genetic Analysis Agent',
    desc: 'Scanning DNA markers and identifying variants',
    color: '#f59e0b',
  },
  {
    id: 'impact',
    label: 'Metabolic Impact Agent',
    desc: 'Calculating effects on metabolism and nutrition',
    color: '#6366f1',
  },
]

function RiskBarChart({ markers }: { markers: { riskLevel: string }[] }) {
  const levels = ['low', 'moderate', 'high'] as const
  const counts = levels.map((l) => markers.filter((m) => m.riskLevel === l).length)
  const maxCount = Math.max(...counts, 1)
  const total = counts.reduce((a, b) => a + b, 0) || 1

  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', height: '100px', padding: '0 4px' }}>
      {levels.map((level, i) => {
        const h = (counts[i] / maxCount) * 80
        return (
          <div key={level} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: riskColors[level] }}>{counts[i]}</span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${h}px` }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{
                width: '100%',
                maxWidth: '40px',
                borderRadius: '6px 6px 2px 2px',
                background: `linear-gradient(180deg, ${riskColors[level]}, ${riskColors[level]}66)`,
                boxShadow: `0 0 8px ${riskColors[level]}30`,
              }}
            />
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{level}</span>
          </div>
        )
      })}
    </div>
  )
}

function DonutChart({ markers }: { markers: { riskLevel: string }[] }) {
  const levels = ['low', 'moderate', 'high'] as const
  const counts = levels.map((l) => markers.filter((m) => m.riskLevel === l).length)
  const total = counts.reduce((a, b) => a + b, 0) || 1

  let cumulative = 0
  const segments = levels.map((level, i) => {
    const p = counts[i] / total
    const start = cumulative
    cumulative += p
    return { level, p, start, color: riskColors[level] }
  })

  const r = 40
  const cx = 50
  const cy = 50
  const circumference = 2 * Math.PI * r

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <svg viewBox="0 0 100 100" style={{ width: '100px', height: '100px', flexShrink: 0 }}>
        {segments.map((seg, i) => {
          if (seg.p === 0) return null
          const dashLen = seg.p * circumference
          const offset = -seg.start * circumference
          return (
            <circle
              key={seg.level}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="12"
              strokeDasharray={`${dashLen} ${circumference - dashLen}`}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ transition: 'all 0.5s ease' }}
            />
          )
        })}
        <circle cx={cx} cy={cy} r={r - 8} fill="var(--bg-surface)" />
        <text x={cx} y={cy - 4} textAnchor="middle" fill="var(--text-primary)" fontSize="18" fontWeight="700">
          {total}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="var(--text-muted)" fontSize="7">
          markers
        </text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {levels.map((level) => {
          const count = markers.filter((m) => m.riskLevel === level).length
          if (count === 0) return null
          return (
            <div key={level} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: riskColors[level] }} />
              <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{level}</span>
              <span style={{ color: 'var(--text-muted)' }}>{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ImpactBar({ label, value, maxValue, color }: { label: string; value: number; maxValue: number; color: string }) {
  const pct = Math.min(100, (value / maxValue) * 100)
  return (
    <div style={{ marginBottom: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ color, fontWeight: 600 }}>{value}</span>
      </div>
      <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.04)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            height: '100%',
            borderRadius: '2px',
            background: `linear-gradient(90deg, ${color}, ${color}66)`,
            boxShadow: `0 0 4px ${color}30`,
          }}
        />
      </div>
    </div>
  )
}

function getRiskScore(markers: { riskLevel: string }[]): number {
  if (markers.length === 0) return 0
  const score = markers.reduce((sum, m) => {
    if (m.riskLevel === 'high') return sum + 3
    if (m.riskLevel === 'moderate') return sum + 2
    return sum + 1
  }, 0)
  return Math.round((score / (markers.length * 3)) * 100)
}

function getTopConcern(markers: { gene: string; riskLevel: string }[]): string {
  const high = markers.filter((m) => m.riskLevel === 'high')
  if (high.length > 0) return high.map((m) => m.gene).join(', ')
  const mod = markers.filter((m) => m.riskLevel === 'moderate')
  if (mod.length > 0) return mod.map((m) => m.gene).join(', ')
  return 'None'
}

export default function Genetics() {
  const { profile, setProfile } = useSimulationStore()
  const [stage, setStage] = useState<Stage>('idle')
  const [geneticResult, setGeneticResult] = useState<GeneticAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [markers, setMarkers] = useState<{ gene: string; variant: string }[]>(profile?.geneticMarkers || [])
  const [fileName, setFileName] = useState('')
  const [fileContent, setFileContent] = useState('')
  const [agentStatus, setAgentStatus] = useState<'idle' | 'working' | 'done'>('idle')
  const fileRef = useRef<HTMLInputElement>(null)
  const reportRef = useRef<HTMLDivElement>(null)

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setError(null)
    setGeneticResult(null)

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      if (!text) { setError('Failed to read file.'); return }
      setFileContent(text)
      setStage('fileSelected')
    }
    reader.onerror = () => { setError('Failed to read file.'); setStage('error') }
    reader.readAsText(file)
  }

  const handleAnalyze = async () => {
    if (!fileContent) return
    setStage('analyzing')
    setAgentStatus('working')

    try {
      const result = await analyzeGeneticData(fileContent, '')
      setGeneticResult(result)

      const detected = result.markers.map((m) => ({
        gene: m.gene,
        variant: m.variant,
      }))
      setMarkers(detected)
      setProfile?.({
        ...profile || { name: 'User', age: 30, weight: 70, height: 175, gender: 'male' as const, activityLevel: 'moderate' as const, sleepHours: 8, hasDiabetes: false, geneticMarkers: [] },
        geneticMarkers: detected,
      })
      setAgentStatus('done')
      setStage('complete')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Genetic analysis failed.')
      setStage('error')
      setAgentStatus('idle')
    }
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
        const srcY = (canvas.height / pages) * i
        const srcH = canvas.height / pages
        const destH = (srcH * w) / canvas.width
        pdf.addImage(imgData, 'PNG', 0, -destH * i, w, h)
      }
    } else {
      pdf.addImage(imgData, 'PNG', 0, 0, w, h)
    }
    pdf.save('genetic-analysis-report.pdf')
  }

  const addMarker = (gene: string) => {
    const exists = markers.find((m) => m.gene === gene)
    let updated: { gene: string; variant: string }[]
    if (exists) {
      updated = markers.filter((m) => m.gene !== gene)
    } else {
      updated = [...markers, { gene, variant: `${gene} variant detected` }]
    }
    setMarkers(updated)
    setProfile?.({ ...profile!, geneticMarkers: updated })
  }

  const resetAll = () => {
    setStage('idle')
    setGeneticResult(null)
    setError(null)
    setFileName('')
    setFileContent('')
    setAgentStatus('idle')
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 16px 60px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: '32px' }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 14px',
            borderRadius: '100px',
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--accent-light)',
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.1)',
            marginBottom: '12px',
          }}
        >
          DNA Analysis
        </div>
        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, marginBottom: '8px' }}>
          Genetic <span style={gradientText}>Integration</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '500px', margin: '0 auto' }}>
          Upload raw genetic data (23andMe format) and analyze with Kimi AI to discover your metabolic variants.
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '20px' }}>
        <div>
          <div style={cardStyle}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>Upload Genetic Data</h3>
            <input ref={fileRef} type="file" accept=".txt,.csv" onChange={handleFilePick} style={{ display: 'none' }} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={stage === 'analyzing'}
              style={{
                width: '100%',
                padding: '32px 16px',
                borderRadius: '12px',
                border: `1px dashed ${
                  stage === 'complete' ? 'rgba(52,211,153,0.3)' :
                  fileName ? 'rgba(245,158,11,0.3)' : 'rgba(245,158,11,0.2)'
                }`,
                background: stage === 'complete' ? 'rgba(52,211,153,0.04)' : fileName ? 'rgba(245,158,11,0.06)' : 'rgba(245,158,11,0.04)',
                cursor: stage === 'analyzing' ? 'not-allowed' : 'pointer',
                color: 'var(--text-muted)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                transition: 'all 0.2s',
                opacity: stage === 'analyzing' ? 0.5 : 1,
              }}
            >
              <span style={{ fontSize: '28px' }}>
                {stage === 'complete' ? '✓' : stage === 'error' ? '✕' : fileName ? '📄' : '🧬'}
              </span>
              <span>
                {stage === 'complete'
                  ? fileName || 'Analysis complete'
                  : stage === 'error'
                  ? 'Upload failed — try again'
                  : fileName
                  ? fileName
                  : 'Choose a genetic data file'}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {fileName ? 'Click to choose a different file' : '23andMe / AncestryDNA (.txt)'}
              </span>
            </button>

            {stage === 'fileSelected' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: '14px' }}
              >
                <button
                  onClick={handleAnalyze}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    boxShadow: '0 4px 20px rgba(245,158,11,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: '16px' }}>🧬</span>
                  Analyze with Kimi AI
                  <span style={{ fontSize: '16px' }}>→</span>
                </button>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '8px' }}>
                  Your genetic data will be sent to Kimi K2.6 for analysis
                </p>
              </motion.div>
            )}

            {stage === 'complete' && (
              <button
                onClick={resetAll}
                style={{
                  marginTop: '10px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                Start over
              </button>
            )}
          </div>

          <div style={{ ...cardStyle, marginTop: '12px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>
              Active Markers
              {markers.length > 0 && (
                <span style={{ fontSize: '11px', color: 'var(--accent-light)', marginLeft: '8px', fontWeight: 500 }}>
                  ({markers.length})
                </span>
              )}
            </h3>
            {markers.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {markers.map((m) => (
                  <div key={m.gene} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    background: 'rgba(245,158,11,0.04)',
                    border: '1px solid rgba(245,158,11,0.06)',
                  }}>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.gene}</span>
                      <span style={{ color: 'var(--text-muted)', marginLeft: '8px', fontSize: '11px' }}>{m.variant}</span>
                    </div>
                    <button
                      onClick={() => addMarker(m.gene)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '14px',
                        padding: '2px',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', padding: '24px 0' }}>
                No genetic markers added yet.
              </p>
            )}
          </div>

          {stage === 'complete' && geneticResult && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ ...cardStyle, marginTop: '12px' }}
            >
              <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Overview</h3>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '12px',
                background: `${riskColors[geneticResult.overallRisk]}10`,
                border: `1px solid ${riskColors[geneticResult.overallRisk]}20`,
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: riskColors[geneticResult.overallRisk],
                  flexShrink: 0,
                  marginTop: '4px',
                }} />
                {geneticResult.summary}
              </div>
            </motion.div>
          )}

          {stage === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ ...cardStyle, marginTop: '12px' }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '12px',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.15)',
                color: '#f87171',
                lineHeight: 1.6,
              }}>
                <span>✕</span>
                {error || 'An unexpected error occurred.'}
              </div>
            </motion.div>
          )}
        </div>

        <div ref={reportRef}>
          {stage === 'analyzing' ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              minHeight: '200px',
            }}>
              {AGENTS.map((agent) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    background: 'var(--bg-surface)',
                    border: `1px solid ${agent.color}15`,
                    borderRadius: '14px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '2px',
                    background: `linear-gradient(90deg, ${agent.color}, ${agent.color}44, transparent)`,
                  }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: agentStatus === 'done' ? '#34d399' : agent.color,
                      boxShadow: agentStatus === 'working'
                        ? `0 0 8px ${agent.color}70`
                        : agentStatus === 'done'
                        ? '0 0 8px #34d39970'
                        : 'none',
                      animation: agentStatus === 'working' ? 'pulse 1.2s ease-in-out infinite' : 'none',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: agentStatus === 'done' ? '#34d399' : 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {agentStatus === 'done' ? 'Complete' : agent.label}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>
                        {agentStatus === 'done' ? 'All tasks finished' : agent.desc}
                      </div>
                    </div>
                    {agentStatus === 'working' ? (
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.1)',
                        borderTopColor: agent.color,
                        animation: 'spin 0.8s linear infinite',
                      }} />
                    ) : agentStatus === 'done' ? (
                      <span style={{ color: '#34d399', fontSize: '16px', fontWeight: 700 }}>✓</span>
                    ) : null}
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '4px',
                  }}>
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          aspectRatio: '1',
                          borderRadius: '50%',
                          transition: 'all 0.3s ease',
                          background: agentStatus === 'done'
                            ? `linear-gradient(135deg, ${agent.color}, transparent)`
                            : agentStatus === 'working'
                            ? `${agent.color}08`
                            : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${
                            agentStatus === 'done'
                              ? `${agent.color}50`
                              : agentStatus === 'working'
                              ? `${agent.color}15`
                              : 'rgba(255,255,255,0.04)'
                          }`,
                          boxShadow: agentStatus === 'done' ? `inset 0 0 4px ${agent.color}40` : 'none',
                          animation: agentStatus === 'working' ? `fillPulse ${1.2 + i * 0.06}s ease-in-out infinite` : 'none',
                        }}
                      />
                    ))}
                  </div>

                  <div style={{
                    marginTop: '10px',
                    height: '2px',
                    borderRadius: '1px',
                    background: 'rgba(255,255,255,0.04)',
                    overflow: 'hidden',
                  }}>
                    <motion.div
                      animate={{
                        width: agentStatus === 'working' ? ['0%', '100%'] : agentStatus === 'done' ? '100%' : '0%',
                      }}
                      transition={agentStatus === 'working' ? { duration: 2.5, ease: 'easeInOut' } : { duration: 0.3 }}
                      style={{
                        height: '100%',
                        borderRadius: '1px',
                        background: `linear-gradient(90deg, ${agent.color}, transparent)`,
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : stage === 'complete' && geneticResult ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  background: 'rgba(52,211,153,0.1)',
                  color: '#34d399',
                }}>
                  Kimi AI Results
                </div>
                <button
                  onClick={handleExportPDF}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    boxShadow: '0 2px 12px rgba(245,158,11,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span style={{ fontSize: '14px' }}>⬇</span>
                  Export PDF
                </button>
              </div>

              <div style={cardStyle}>
                <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '14px' }}>
                  Detected <span style={gradientText}>Variants</span>
                </h3>
                {geneticResult.markers.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {geneticResult.markers.map((m, i) => (
                      <motion.div
                        key={m.gene}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        style={{
                          padding: '14px',
                          borderRadius: '12px',
                          background: `${riskColors[m.riskLevel]}06`,
                          border: `1px solid ${riskColors[m.riskLevel]}15`,
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = riskColors[m.riskLevel] + '40'
                          e.currentTarget.style.background = riskColors[m.riskLevel] + '0c'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = riskColors[m.riskLevel] + '15'
                          e.currentTarget.style.background = riskColors[m.riskLevel] + '06'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: riskColors[m.riskLevel],
                              flexShrink: 0,
                            }} />
                            <div>
                              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{m.gene}</span>
                              {m.name && (
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>{m.name}</span>
                              )}
                            </div>
                          </div>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '100px',
                            background: `${riskColors[m.riskLevel]}15`,
                            color: riskColors[m.riskLevel],
                            textTransform: 'uppercase',
                          }}>
                            {m.riskLevel}
                          </span>
                        </div>
                        {m.variant && (
                          <div style={{
                            fontSize: '11px',
                            color: 'var(--accent-light)',
                            fontFamily: 'var(--font-mono, monospace)',
                            marginBottom: '6px',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            background: 'rgba(0,0,0,0.15)',
                            display: 'inline-block',
                          }}>
                            {m.variant}
                          </div>
                        )}
                        {m.impact && (
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{m.impact}</p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '24px',
                    color: 'var(--text-muted)',
                    fontSize: '13px',
                  }}>
                    No relevant metabolic variants detected in this sample.
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ ...cardStyle }}>
                  <h3 style={{ fontSize: '12px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-muted)' }}>Risk Distribution</h3>
                  <RiskBarChart markers={geneticResult.markers} />
                </div>
                <div style={{ ...cardStyle }}>
                  <h3 style={{ fontSize: '12px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-muted)' }}>Proportion</h3>
                  <DonutChart markers={geneticResult.markers} />
                </div>
              </div>

              <div style={{ ...cardStyle }}>
                <h3 style={{ fontSize: '12px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-muted)' }}>Impact Breakdown</h3>
                {geneticResult.markers.length > 0 ? (
                  geneticResult.markers.map((m) => (
                    <ImpactBar
                      key={m.gene}
                      label={m.gene}
                      value={m.riskLevel === 'high' ? 3 : m.riskLevel === 'moderate' ? 2 : 1}
                      maxValue={3}
                      color={riskColors[m.riskLevel]}
                    />
                  ))
                ) : (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>
                    No data to display
                  </p>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div style={{
                  ...cardStyle,
                  textAlign: 'center',
                  background: 'rgba(52,211,153,0.03)',
                  border: '1px solid rgba(52,211,153,0.1)',
                }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                    Markers
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#34d399' }}>
                    {geneticResult.markers.length}
                  </div>
                </div>
                <div style={{
                  ...cardStyle,
                  textAlign: 'center',
                  background: `${riskColors[geneticResult.overallRisk]}06`,
                  border: `1px solid ${riskColors[geneticResult.overallRisk]}15`,
                }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                    Risk Score
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: riskColors[geneticResult.overallRisk] }}>
                    {getRiskScore(geneticResult.markers)}%
                  </div>
                </div>
                <div style={{
                  ...cardStyle,
                  textAlign: 'center',
                  background: 'rgba(245,158,11,0.03)',
                  border: '1px solid rgba(245,158,11,0.1)',
                }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                    Top Concern
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-light)' }}>
                    {getTopConcern(geneticResult.markers)}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'center', fontSize: '10px', color: 'var(--text-muted)', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                whatthefood.ai — Genetic Analysis Report
              </div>
            </motion.div>
          ) : stage === 'error' ? (
            <div style={{
              ...cardStyle,
              minHeight: '200px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: '12px',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                background: 'rgba(239,68,68,0.1)',
                color: '#f87171',
              }}>
                ✕
              </div>
              <p style={{ color: '#f87171', fontSize: '13px', maxWidth: '280px' }}>
                {error || 'Analysis failed. Check your connection and try again.'}
              </p>
              <button
                onClick={resetAll}
                style={{
                  padding: '8px 20px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: '1px solid rgba(239,68,68,0.2)',
                  background: 'rgba(239,68,68,0.06)',
                  color: '#f87171',
                  cursor: 'pointer',
                }}
              >
                Try Again
              </button>
            </div>
          ) : (
            <div style={cardStyle}>
              <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '14px' }}>Known Genetic Variants</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {knownGenes.map((gene) => {
                  const isAdded = !!markers.find((m) => m.gene === gene.gene)
                  return (
                    <div key={gene.gene}>
                      <button
                        onClick={() => {
                          const exists = markers.find((m) => m.gene === gene.gene)
                          if (exists) {
                            addMarker(gene.gene)
                          } else {
                            const updated = [...markers, { gene: gene.gene, variant: `${gene.gene} variant detected` }]
                            setMarkers(updated)
                            setProfile?.({ ...profile!, geneticMarkers: updated })
                          }
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: `1px solid ${isAdded ? 'rgba(245,158,11,0.15)' : 'transparent'}`,
                          background: isAdded ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.02)',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          color: 'var(--text-primary)',
                          transition: 'all 0.15s',
                        }}
                      >
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: 600 }}>{gene.gene}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>{gene.name}</span>
                        </div>
                        <span style={{
                          fontSize: '11px',
                          color: isAdded ? 'var(--accent-light)' : 'var(--text-muted)',
                        }}>
                          {isAdded ? '✓' : '+ Add'}
                        </span>
                      </button>
                      {isAdded && (
                        <p style={{
                          fontSize: '11px',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.6,
                          padding: '6px 14px 2px',
                          margin: 0,
                        }}>
                          {gene.impact}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}