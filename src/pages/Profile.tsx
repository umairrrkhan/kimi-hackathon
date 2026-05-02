import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useSimulationStore } from '../store/simulationStore'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '16px',
  padding: '20px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '10px',
  fontSize: '13px',
  outline: 'none',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid var(--border-subtle)',
  color: 'var(--text-primary)',
}

const gradientText: React.CSSProperties = {
  background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}

const asciiProfile = [
  '  _____           _ _   _      _   ',
  ' |  __ \\         | | | (_)    | |  ',
  ' | |__) |__ _  __| | |_ _  ___| |_ ',
  ' |  ___/ _ \\ |/ _` | __| |/ _ \\ __|',
  ' | |  |  __/ | (_| | |_| |  __/ |_ ',
  ' |_|   \\___|_|\\__,_|\\__|_|\\___|\\__|',
].join('\n')

export default function Profile() {
  const { profile, setProfile, result, currentFood } = useSimulationStore()
  const reportRef = useRef<HTMLDivElement>(null)

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
        pdf.addImage(imgData, 'PNG', 0, -srcY * (w / canvas.width), w, (canvas.height * w) / canvas.width)
      }
    } else {
      pdf.addImage(imgData, 'PNG', 0, 0, w, h)
    }
    pdf.save('check-health-report.pdf')
  }

  const updateProfile = (key: string, value: any) => {
    setProfile?.({
      ...profile || { name: '', age: 25, weight: 70, height: 175, gender: 'male' as const, activityLevel: 'moderate' as const, sleepHours: 8, hasDiabetes: false, geneticMarkers: [] },
      [key]: value,
    })
  }

  const maxGlucose = result ? Math.max(...result.glucose.map((g) => g.value)) : 0
  const maxInsulin = result ? Math.max(...result.insulin.map((i) => i.value)) : 0
  const maxFog = result ? Math.max(...result.cognitive.map((c) => c.fog)) : 0

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 16px 60px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '32px', textAlign: 'center' }}
      >
        <motion.pre
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          style={{ fontSize: '6px', lineHeight: 1.15, color: 'var(--accent)', marginBottom: '8px', userSelect: 'none' }}
        >
{asciiProfile}
        </motion.pre>
        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, marginBottom: '6px' }}>
          Your <span style={gradientText}>Profile</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '420px', margin: '0 auto' }}>
          Set biological parameters for personalized simulations and export reports.
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '20px' }}>
        {/* Left: Profile Form */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div style={cardStyle}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>
              Biological Parameters
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { label: 'Name', key: 'name', type: 'text', placeholder: 'Your name' },
                  { label: 'Age', key: 'age', type: 'number', placeholder: '25' },
                  { label: 'Weight (kg)', key: 'weight', type: 'number', placeholder: '70' },
                  { label: 'Height (cm)', key: 'height', type: 'number', placeholder: '175' },
                ].map((f) => (
                  <div key={f.key}>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>{f.label}</label>
                    <input
                      type={f.type}
                      value={(profile as any)?.[f.key] || ''}
                      onChange={(e) => updateProfile(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)}
                      placeholder={f.placeholder}
                      style={inputStyle}
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>Gender</label>
                  <select
                    value={profile?.gender || 'male'}
                    onChange={(e) => updateProfile('gender', e.target.value)}
                    style={inputStyle}
                  >
                    <option value="male" style={{ background: '#111' }}>Male</option>
                    <option value="female" style={{ background: '#111' }}>Female</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>Activity</label>
                  <select
                    value={profile?.activityLevel || 'moderate'}
                    onChange={(e) => updateProfile('activityLevel', e.target.value)}
                    style={inputStyle}
                  >
                    <option value="sedentary" style={{ background: '#111' }}>Sedentary</option>
                    <option value="moderate" style={{ background: '#111' }}>Moderate</option>
                    <option value="active" style={{ background: '#111' }}>Active</option>
                    <option value="very active" style={{ background: '#111' }}>Very Active</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>Sleep (hours/night)</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={profile?.sleepHours || 8}
                  onChange={(e) => updateProfile('sleepHours', Number(e.target.value))}
                  style={inputStyle}
                />
              </div>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(245,158,11,0.04)',
                border: '1px solid rgba(245,158,11,0.08)',
              }}>
                <input
                  type="checkbox"
                  checked={profile?.hasDiabetes || false}
                  onChange={(e) => updateProfile('hasDiabetes', e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }}
                />
                Type 2 Diabetes
              </label>
            </div>
          </div>

          {profile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ ...cardStyle, marginTop: '12px' }}
            >
              <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ textAlign: 'center', padding: '10px', borderRadius: '8px', background: 'rgba(245,158,11,0.04)' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent)' }}>{profile.age}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Age</div>
                </div>
                <div style={{ textAlign: 'center', padding: '10px', borderRadius: '8px', background: 'rgba(245,158,11,0.04)' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent)' }}>{Math.round(profile.weight / ((profile.height / 100) ** 2) * 10) / 10}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>BMI</div>
                </div>
                <div style={{ textAlign: 'center', padding: '10px', borderRadius: '8px', background: 'rgba(245,158,11,0.04)' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-light)', textTransform: 'capitalize' }}>{profile.activityLevel}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Activity</div>
                </div>
                <div style={{ textAlign: 'center', padding: '10px', borderRadius: '8px', background: 'rgba(245,158,11,0.04)' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent)' }}>{profile.sleepHours}h</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Sleep</div>
                </div>
              </div>
              {profile.geneticMarkers.length > 0 && (
                <div style={{ marginTop: '10px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(245,158,11,0.04)', fontSize: '11px', color: 'var(--accent-light)' }}>
                  🧬 {profile.geneticMarkers.length} genetic marker{profile.geneticMarkers.length > 1 ? 's' : ''} active
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Right: Report */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div ref={reportRef} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600 }}>
                {result && currentFood ? 'Simulation Report' : 'Report'}
              </h3>
              {result && (
                <button
                  onClick={handleExportPDF}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#000',
                    border: 'none',
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span style={{ fontSize: '14px' }}>⬇</span>
                  Export PDF
                </button>
              )}
            </div>

            {result && currentFood ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Food header */}
                <div style={{
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'rgba(245,158,11,0.04)',
                  border: '1px solid rgba(245,158,11,0.06)',
                }}>
                  <div style={{ fontSize: '18px', fontWeight: 700 }}>{currentFood}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{new Date().toLocaleDateString()}</div>
                </div>

                {/* Profile snapshot */}
                {profile && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '6px', textAlign: 'center' }}>
                    {[
                      { label: 'Age', value: profile.age, color: 'var(--accent)' },
                      { label: 'BMI', value: Math.round(profile.weight / ((profile.height / 100) ** 2) * 10) / 10, color: 'var(--accent)' },
                      { label: 'Activity', value: profile.activityLevel, color: 'var(--accent-light)' },
                      { label: 'Sleep', value: `${profile.sleepHours}h`, color: 'var(--accent)' },
                    ].map((item) => (
                      <div key={item.label} style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: item.color }}>{item.value}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Peak values */}
                <div>
                  <div style={{
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                    marginBottom: '8px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                  }}>
                    Peak Values
                  </div>
                  {[
                    { label: 'Blood Glucose', value: `${maxGlucose} mg/dL`, color: '#ef4444' },
                    { label: 'Insulin', value: `${maxInsulin} µU/mL`, color: '#f59e0b' },
                    { label: 'Brain Fog', value: `${maxFog}%`, color: '#ec4899' },
                  ].map((item) => (
                    <div key={item.label} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '5px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      fontSize: '12px',
                    }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                      <span style={{ color: item.color, fontWeight: 600 }}>{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Organ stress with mini bars */}
                <div>
                  <div style={{
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                    marginBottom: '8px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                  }}>
                    Organ Stress
                  </div>
                  {result.organStress.map((o) => (
                    <div key={o.organ} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', fontSize: '12px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: o.color, flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-secondary)', flex: 1, fontSize: '11px' }}>{o.organ}</span>
                      <div style={{ width: '80px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.05)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${o.stress}%` }}
                          transition={{ duration: 0.6 }}
                          style={{ height: '100%', borderRadius: '2px', background: o.color }} />
                      </div>
                      <span style={{ color: 'var(--text-muted)', width: '28px', textAlign: 'right', fontSize: '11px' }}>{o.stress}%</span>
                    </div>
                  ))}
                </div>

                {/* Prediction */}
                <div style={{
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  lineHeight: 1.7,
                  background: 'rgba(0,0,0,0.3)',
                  color: 'var(--text-secondary)',
                }}>
                  <div style={{ color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px', fontSize: '11px' }}>Prediction</div>
                  <div dangerouslySetInnerHTML={{ __html: result.prediction.replace(/\n/g, '<br/>') }} />
                </div>

                {/* Footer */}
                <div style={{ textAlign: 'center', fontSize: '10px', color: 'var(--text-muted)', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.04)', opacity: 0.6 }}>
                  checkhealth.ai — Biological Simulation Report
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 0',
                textAlign: 'center',
                gap: '10px',
              }}>
                <div style={{ fontSize: '40px', opacity: 0.15 }}>◆</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No simulation data yet.</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', maxWidth: '280px' }}>
                  Analyze a food on the <a href="/analyze" style={{ color: 'var(--accent-light)' }}>Analyze page</a> to generate a report you can export.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
