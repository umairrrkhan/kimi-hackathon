import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const card: React.CSSProperties = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '16px',
  padding: '24px',
}

const gradientText: React.CSSProperties = {
  background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}

const steps = [
  {
    num: '01',
    title: 'Upload Food Image',
    desc: 'Snap a photo or type what you ate. Accepts JPG, PNG, WEBP up to 10MB.',
    detail: 'Uses react-dropzone for drag-and-drop with instant preview. Manual text entry also supported.',
    color: '#f59e0b',
    icon: '◎',
  },
  {
    num: '02',
    title: 'AI Analysis (Kimi Model)',
    desc: 'Kimi K2.6 identifies the food and returns structured nutritional data: calories, macros, and nutrients.',
    detail: 'Image is base64-encoded and sent to Moonshot API via OpenAI-compatible chat completions. Returns strict JSON.',
    color: '#d97706',
    icon: '◉',
  },
  {
    num: '03',
    title: 'Simulation Engine',
    desc: 'Multi-factor physiological model: glycemic response, insulin demand, organ stress across 8 systems, cognitive impact over 8 hours.',
    detail: 'Factors: glycemic index, carb/fat/fiber load, age, BMI, activity level, sleep, diabetes status, genetic markers.',
    color: '#fbbf24',
    icon: '◇',
  },
  {
    num: '04',
    title: '3D Body Visualization',
    desc: 'Real-time Three.js body with color-coded glowing organs. Glucose and insulin energy pathways animate in 3D.',
    detail: 'Built with React Three Fiber and custom shaders. Orbit controls for rotation and zoom.',
    color: '#f59e0b',
    icon: '◈',
  },
  {
    num: '05',
    title: 'Charts & Predictions',
    desc: 'Four SVG charts show glucose, insulin, focus, and brain fog over 8 hours. Narrative prediction in plain language.',
    detail: 'Peak values, per-organ stress bars, and genetic modulation notes provide quick-reference summaries.',
    color: '#d97706',
    icon: '▣',
  },
  {
    num: '06',
    title: 'Export & Experiment',
    desc: 'Export full PDF report. Then visit What-If Lab to compare scenarios side-by-side.',
    detail: 'PDF via html2canvas + jsPDF. What-If runs parallel simulations for sleep-deprived, post-workout, or diabetic profiles.',
    color: '#fbbf24',
    icon: '⬇',
  },
]

const dataFlow = [
  { label: 'User', items: ['Uploads photo', 'Sets profile', 'Adds DNA'], color: '#f59e0b' },
  { label: 'Frontend', items: ['React 19', 'Framer Motion', 'Three.js'], color: '#d97706' },
  { label: 'AI Layer', items: ['Kimi K2.6', 'Image recognition', 'JSON output'], color: '#fbbf24' },
  { label: 'Engine', items: ['Glycemic', 'Insulin', 'Organ stress', 'Genetic'], color: '#f59e0b' },
  { label: 'Output', items: ['3D body', 'Charts', 'PDF', 'Comparison'], color: '#d97706' },
]

export default function HowItWorks() {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 16px 60px' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: '36px' }}
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
          Architecture
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '8px' }}>
          How It <span style={gradientText}>Works</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
          From food photo to biological simulation in 6 steps.
        </p>
      </motion.div>

      {/* Steps grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '10px', marginBottom: '40px' }}>
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          >
            <div
              onClick={() => setExpanded(expanded === step.num ? null : step.num)}
              style={{
                ...card,
                padding: '16px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                borderColor: expanded === step.num ? `${step.color}20` : 'var(--border-subtle)',
                transition: 'border-color 0.2s',
              }}
            >
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '3px',
                height: '100%',
                background: `linear-gradient(180deg, ${step.color}, transparent)`,
                opacity: 0.4,
              }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: expanded === step.num ? '10px' : 0 }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 700,
                  background: `${step.color}15`,
                  border: `1px solid ${step.color}25`,
                  color: step.color,
                  flexShrink: 0,
                }}>
                  {step.num}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{step.title}</div>
                </div>
                <motion.span
                  animate={{ rotate: expanded === step.num ? 180 : 0 }}
                  style={{ color: 'var(--text-muted)', fontSize: '10px', flexShrink: 0 }}
                >
                  ▼
                </motion.span>
              </div>

              <AnimatePresence>
                {expanded === step.num && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '6px' }}>
                      {step.desc}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.6, fontStyle: 'italic' }}>
                      {step.detail}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Data Flow Architecture */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{ marginBottom: '40px' }}
      >
        <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', textAlign: 'center' }}>
          Data Flow <span style={gradientText}>Architecture</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '8px' }}>
          {dataFlow.map((layer) => (
            <div key={layer.label} style={{ ...card, padding: '14px', textAlign: 'center' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: layer.color,
                marginBottom: '8px',
              }}>
                {layer.label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {layer.items.map((item) => (
                  <div key={item} style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Kimi API Integration */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{ ...card, marginBottom: '40px' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
              Kimi API Integration
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '6px' }}>
              When a user uploads a food photo, the app sends it to Moonshot's <strong style={{ color: 'var(--text-primary)' }}>Kimi K2.6</strong> model — a multimodal vision-language AI.
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              The image is base64-encoded and sent via fetch to <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 4px', borderRadius: '4px' }}>/v1/chat/completions</code>.
              A system prompt enforces strict JSON output.
            </p>
          </div>
          <div style={{
            flexShrink: 0,
            width: '100%',
            maxWidth: '320px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '10px',
            padding: '12px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono, monospace)',
            color: 'var(--text-muted)',
            lineHeight: 1.8,
            overflow: 'auto',
          }}>
            <pre style={{ margin: 0, fontSize: '11px', lineHeight: 1.8, color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>
{`POST /v1/chat/completions
model: "kimi-k2.6"
→ system prompt enforces JSON
→ user message: image + text
← {
    foodName,
    estimatedCalories,
    estimatedCarbs,
    estimatedProtein,
    estimatedFat,
    nutrients[]
  }`}
            </pre>
          </div>
        </div>
      </motion.div>

      {/* Simulation Engine */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{ ...card, marginBottom: '40px' }}
      >
        <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
          Simulation Engine <span style={gradientText}>Algorithms</span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '10px' }}>
          {[
            { title: 'Glycemic Classification', desc: 'Food name matched against a keyword database of high, medium, and low GI foods. Combined with carb/fat/fiber load.', color: '#ef4444' },
            { title: 'Insulin Sensitivity', desc: 'Profile-based: age, BMI, activity, sleep, diabetes. Returns 0.3–1.0 multiplier.', color: '#f59e0b' },
            { title: 'Genetic Modulation', desc: 'FTO, APOE E4, TCF7L2, PPARG, MTHFR scale glucose/insulin by up to 30%.', color: '#fbbf24' },
            { title: 'Glucose Modeling', desc: 'Gaussian curve with food-dependent peak timing (0.5–2h). Amplitude = GI × carb load × genetics.', color: '#ef4444' },
            { title: 'Organ Stress Scoring', desc: '8 organs scored 0–100% based on food composition + profile modifiers.', color: '#06b6d4' },
            { title: 'Cognitive Prediction', desc: 'Focus and fog from glucose variability. Sigmoid recovery over 3–5h.', color: '#ec4899' },
          ].map((algo) => (
            <div key={algo.title} style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: '10px',
              padding: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: algo.color, flexShrink: 0 }} />
                <span style={{ fontSize: '12px', fontWeight: 600 }}>{algo.title}</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{algo.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{ textAlign: 'center' }}
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
          Ready to see it in action?
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Link
            to="/analyze"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 28px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#000',
              textDecoration: 'none',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              boxShadow: '0 4px 20px rgba(245,158,11,0.2)',
            }}
          >
            Analyze Food →
          </Link>
          <Link
            to="/simulation"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 28px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--accent-light)',
              textDecoration: 'none',
              border: '1px solid rgba(245,158,11,0.2)',
            }}
          >
            View Demo
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
