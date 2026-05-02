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

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  color: 'var(--text-muted)',
  display: 'block',
  marginBottom: '4px',
  fontWeight: 500,
}

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
    pdf.addImage(imgData, 'PNG', 0, 0, w, h)
    pdf.save('what-the-food-report.pdf')
  }

  const updateProfile = (key: string, value: any) => {
    setProfile?.({
      ...profile || { name: '', age: 25, weight: 70, height: 175, gender: 'male' as const, activityLevel: 'moderate' as const, sleepHours: 8, hasDiabetes: false, geneticMarkers: [] },
      [key]: value,
    })
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 16px 60px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, marginBottom: '6px' }}>Your Profile</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Set biological parameters for personalized simulations and export reports.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '20px' }}>
        <div>
          <div style={cardStyle}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Biological Parameters</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Name', key: 'name', type: 'text' },
                { label: 'Age', key: 'age', type: 'number' },
                { label: 'Weight (kg)', key: 'weight', type: 'number' },
                { label: 'Height (cm)', key: 'height', type: 'number' },
              ].map((f) => (
                <div key={f.key}>
                  <label style={labelStyle}>{f.label}</label>
                  <input
                    type={f.type}
                    value={(profile as any)?.[f.key] || ''}
                    onChange={(e) => updateProfile(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)}
                    style={inputStyle}
                  />
                </div>
              ))}
              <div>
                <label style={labelStyle}>Gender</label>
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
                <label style={labelStyle}>Activity Level</label>
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
              <div>
                <label style={labelStyle}>Sleep (hours/night)</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={profile?.sleepHours || 8}
                  onChange={(e) => updateProfile('sleepHours', Number(e.target.value))}
                  style={inputStyle}
                />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)' }}>
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
        </div>

        <div>
          <div ref={reportRef} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Simulation Report</h3>
              {result && (
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
                  }}
                >
                  Export PDF
                </button>
              )}
            </div>

            {result && currentFood ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(245,158,11,0.04)',
                  border: '1px solid rgba(245,158,11,0.06)',
                }}>
                  <div style={{ fontSize: '18px', fontWeight: 700 }}>{currentFood}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date().toLocaleDateString()}</div>
                </div>

                {profile && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '6px', textAlign: 'center' }}>
                    {[
                      { label: 'Age', value: profile.age },
                      { label: 'BMI', value: Math.round(profile.weight / ((profile.height / 100) ** 2) * 10) / 10 },
                      { label: 'Activity', value: profile.activityLevel },
                      { label: 'Sleep', value: `${profile.sleepHours}h` },
                    ].map((item) => (
                      <div key={item.label} style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>{item.value}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px', letterSpacing: '0.5px' }}>PEAK VALUES</div>
                  {[
                    { label: 'Blood Glucose', value: `${Math.max(...result.glucose.map((g) => g.value))} mg/dL`, color: '#ef4444' },
                    { label: 'Insulin', value: `${Math.max(...result.insulin.map((i) => i.value))} µU/mL`, color: '#f59e0b' },
                    { label: 'Brain Fog', value: `${Math.max(...result.cognitive.map((c) => c.fog))}%`, color: '#ec4899' },
                  ].map((item) => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '12px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                      <span style={{ color: item.color, fontWeight: 600 }}>{item.value}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px', letterSpacing: '0.5px' }}>ORGAN STRESS</div>
                  {result.organStress.map((o) => (
                    <div key={o.organ} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', fontSize: '12px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: o.color, flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{o.organ}</span>
                      <div style={{ width: '80px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.05)' }}>
                        <div style={{ width: `${o.stress}%`, height: '100%', borderRadius: '2px', background: o.color }} />
                      </div>
                      <span style={{ color: 'var(--text-muted)', width: '28px', textAlign: 'right' }}>{o.stress}%</span>
                    </div>
                  ))}
                </div>

                <div style={{
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  lineHeight: 1.7,
                  background: 'rgba(0,0,0,0.3)',
                  color: 'var(--text-secondary)',
                }}>
                  <div style={{ color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>Prediction</div>
                  <div dangerouslySetInnerHTML={{ __html: result.prediction.replace(/\n/g, '<br/>') }} />
                </div>

                <div style={{ textAlign: 'center', fontSize: '10px', color: 'var(--text-muted)', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  whatthefood.ai — Biological Simulation Report
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '48px 0',
                textAlign: 'center',
                gap: '8px',
              }}>
                <div style={{ fontSize: '36px', opacity: 0.2 }}>◆</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No simulation data yet.</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Analyze a food to generate a report you can export.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
