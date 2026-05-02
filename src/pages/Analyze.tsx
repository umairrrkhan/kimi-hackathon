import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { analyzeFoodImage, type KimiAnalysisResult } from '../services/kimiApi'
import { generateSimulation } from '../services/simulationEngine'
import { useSimulationStore } from '../store/simulationStore'
import AgentsLoader from '../components/AgentsLoader'

const btnBase: React.CSSProperties = {
  padding: '10px 22px',
  borderRadius: '12px',
  fontSize: '13px',
  fontWeight: 600,
  border: '1px solid transparent',
  cursor: 'pointer',
  transition: 'all 0.2s',
}
const cardStyle: React.CSSProperties = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '16px',
  padding: '24px',
}

type Stage = 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error'

export default function Analyze() {
  const navigate = useNavigate()
  const { setResult, setImage, setError, profile, setCurrentFood, error: storeError } = useSimulationStore()
  const [preview, setPreview] = useState<string | null>(null)
  const [manualFood, setManualFood] = useState('')
  const [analysisResult, setAnalysisResult] = useState<KimiAnalysisResult | null>(null)
  const [mode, setMode] = useState<'upload' | 'manual'>('upload')
  const [stage, setStage] = useState<Stage>('idle')
  const [detectedFood, setDetectedFood] = useState('')

  const handleError = (msg: string) => {
    setError(msg)
    setStage('error')
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    try {
      setStage('uploading')
      setError(null)
      setAnalysisResult(null)

      const validTypes = ['image/png', 'image/jpeg', 'image/webp']
      if (!validTypes.includes(file.type)) {
        handleError('Unsupported file type. Please upload PNG, JPG, or WEBP.')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        handleError('File is too large. Maximum size is 10MB.')
        return
      }

      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const base64 = e.target?.result as string
          if (!base64) { handleError('Failed to read image file.'); return }
          setPreview(base64)
          setImage(base64)

          const result = await analyzeFoodImage(base64, '')
          if (!result) { handleError('AI analysis failed. Please try again.'); return }

          setAnalysisResult(result)
          setCurrentFood(result.foodName)
          setDetectedFood(result.foodName)
          setStage('analyzing')
        } catch (err) {
          handleError(err instanceof Error ? err.message : 'Analysis failed. Check your connection.')
        }
      }
      reader.onerror = () => handleError('Failed to read file.')
      reader.readAsDataURL(file)
    } catch (err) {
      handleError('Unexpected error occurred.')
    }
  }, [setResult, setImage, setError, setCurrentFood])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  })

  const handleManualAnalyze = async () => {
    if (!manualFood.trim()) return
    try {
      setStage('uploading')
      setError(null)
      setAnalysisResult(null)
      setCurrentFood(manualFood)
      setDetectedFood(manualFood)
      await new Promise((r) => setTimeout(r, 500))
      setStage('analyzing')
    } catch (err) {
      handleError('Analysis failed. Please try again.')
    }
  }

  const handleAgentsComplete = () => {
    setStage('complete')
    if (analysisResult || detectedFood) {
      const sim = generateSimulation(detectedFood, profile, analysisResult?.rawMarkdown)
      setResult(sim)
    }
  }

  const rightPanel = () => {
    if (stage === 'analyzing') {
      return <AgentsLoader onComplete={handleAgentsComplete} />
    }

    if (stage === 'uploading') {
      return (
        <div style={{ ...cardStyle, minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Contacting AI servers...</p>
        </div>
      )
    }

    if (stage === 'complete' && analysisResult) {
      return (
        <div style={{ ...cardStyle, minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{analysisResult.foodName}</h3>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>AI Analysis Complete</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { label: 'Calories', value: `${analysisResult.estimatedCalories}`, unit: 'kcal' },
                { label: 'Carbs', value: `${analysisResult.estimatedCarbs}`, unit: 'g' },
                { label: 'Protein', value: `${analysisResult.estimatedProtein}`, unit: 'g' },
                { label: 'Fat', value: `${analysisResult.estimatedFat}`, unit: 'g' },
              ].map((item) => (
                <div key={item.label} style={{
                  background: 'rgba(168,85,247,0.04)',
                  border: '1px solid rgba(168,85,247,0.06)',
                  borderRadius: '10px',
                  padding: '12px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.unit}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{item.label}</div>
                </div>
              ))}
            </div>
            <div style={{
              background: 'rgba(99,102,241,0.04)',
              border: '1px solid rgba(99,102,241,0.06)',
              borderRadius: '10px',
              padding: '12px',
            }}>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>Key Nutrients</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {analysisResult.nutrients.map((n) => (
                  <span key={n} style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    background: 'rgba(168,85,247,0.08)',
                    color: 'var(--accent-light)',
                  }}>
                    {n}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => navigate('/simulation')}
              style={{
                ...btnBase,
                padding: '12px',
                width: '100%',
                background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                color: '#fff',
                fontSize: '14px',
              }}
            >
              View Full Simulation →
            </button>
          </div>
        </div>
      )
    }

    if (stage === 'complete' && !analysisResult) {
      return (
        <div style={{ ...cardStyle, minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <div style={{ fontSize: '36px', opacity: 0.2 }}>◎</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Analysis complete for {detectedFood}</p>
          <button
            onClick={() => navigate('/simulation')}
            style={{
              ...btnBase,
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
              color: '#fff',
              fontSize: '13px',
            }}
          >
            View Simulation →
          </button>
        </div>
      )
    }

    return (
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
        <div style={{ fontSize: '36px', opacity: 0.2 }}>◉</div>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Upload a photo or describe a food. AI agents will scan and identify what you ate.</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 16px 60px' }}>
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '10px' }}>Analyze Your Food</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '480px', margin: '0 auto' }}>
          Upload a photo or describe what you ate. AI agents will scan and identify your food.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '28px' }}>
        {(['upload', 'manual'] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setStage('idle'); setError(null) }}
            disabled={stage === 'uploading' || stage === 'analyzing'}
            style={{
              ...btnBase,
              background: mode === m ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.03)',
              borderColor: mode === m ? 'rgba(168,85,247,0.2)' : 'transparent',
              color: mode === m ? 'var(--accent-light)' : 'var(--text-muted)',
              opacity: (stage === 'uploading' || stage === 'analyzing') ? 0.5 : 1,
            }}
          >
            {m === 'upload' ? 'Upload Photo' : 'Describe Food'}
          </button>
        ))}
      </div>

      {storeError && stage === 'error' && (
        <div
          style={{
            padding: '10px 16px',
            borderRadius: '10px',
            marginBottom: '16px',
            fontSize: '13px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.15)',
            color: '#f87171',
          }}
        >
          {storeError}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '20px' }}>
        <div>
          {mode === 'upload' ? (
            <div
              {...getRootProps()}
              style={{
                ...cardStyle,
                cursor: stage === 'uploading' || stage === 'analyzing' ? 'not-allowed' : 'pointer',
                minHeight: '300px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                transition: 'all 0.2s',
                borderColor: isDragActive ? 'var(--accent)' : 'var(--border-subtle)',
                background: isDragActive ? 'rgba(168,85,247,0.05)' : 'var(--bg-surface)',
                opacity: (stage === 'uploading' || stage === 'analyzing') ? 0.5 : 1,
              }}
            >
              <input {...getInputProps()} disabled={stage === 'uploading' || stage === 'analyzing'} />
              {preview ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <img src={preview} alt="Food" style={{ maxHeight: '200px', borderRadius: '12px', maxWidth: '100%', objectFit: 'cover' }} />
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Drop another image or click to replace</p>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '48px', opacity: 0.3, marginBottom: '12px' }}>◎</div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '6px' }}>
                    {isDragActive ? 'Drop your food photo here' : 'Drag and drop a food photo, or click to browse'}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>PNG, JPG, WEBP (max 10MB)</p>
                </>
              )}
            </div>
          ) : (
            <div style={{
              ...cardStyle,
              minHeight: '300px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              opacity: (stage === 'uploading' || stage === 'analyzing') ? 0.5 : 1,
            }}>
              <div style={{ fontSize: '48px', opacity: 0.3 }}>◈</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Describe what you ate</p>
              <textarea
                value={manualFood}
                onChange={(e) => setManualFood(e.target.value)}
                disabled={stage === 'uploading' || stage === 'analyzing'}
                placeholder='e.g. "A slice of pepperoni pizza with fries and a soda"'
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  height: '120px',
                  borderRadius: '12px',
                  padding: '14px',
                  fontSize: '13px',
                  resize: 'none',
                  outline: 'none',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                }}
              />
              <button
                onClick={handleManualAnalyze}
                disabled={!manualFood.trim() || stage === 'uploading' || stage === 'analyzing'}
                style={{
                  ...btnBase,
                  padding: '12px 28px',
                  background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                  color: '#fff',
                  opacity: (!manualFood.trim() || stage === 'uploading' || stage === 'analyzing') ? 0.4 : 1,
                  cursor: (!manualFood.trim() || stage === 'uploading' || stage === 'analyzing') ? 'not-allowed' : 'pointer',
                }}
              >
                {stage === 'uploading' ? 'Contacting AI...' : 'Analyze Description'}
              </button>
            </div>
          )}
        </div>

        <div>
          {rightPanel()}
        </div>
      </div>
    </div>
  )
}
