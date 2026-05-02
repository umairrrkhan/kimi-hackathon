import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const card: React.CSSProperties = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '16px',
  padding: '24px',
}

const gradientText: React.CSSProperties = {
  background: 'linear-gradient(135deg, #a855f7, #6366f1)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}

const steps = [
  {
    num: '01',
    title: 'Upload Food Image',
    desc: 'Snap a photo of your meal or describe what you ate. The app accepts JPG, PNG, or WEBP files up to 10MB.',
    detail: 'Uses react-dropzone for drag-and-drop file upload with instant preview.',
    color: '#a855f7',
  },
  {
    num: '02',
    title: 'AI Analysis (Kimi Model)',
    desc: 'The image is sent to Moonshot\'s Kimi K2.6 model — a multimodal vision-language AI that identifies the food, estimates macronutrients (calories, carbs, protein, fat), and returns structured JSON data.',
    detail: 'A system prompt enforces strict JSON output with fields: foodName, description, estimatedCalories, estimatedCarbs, estimatedProtein, estimatedFat, and nutrients. The response feeds directly into the simulation engine.',
    color: '#6366f1',
  },
  {
    num: '03',
    title: 'Simulation Engine',
    desc: 'Our engine takes the AI output plus your profile data and runs a multi-factor physiological model. It calculates glycemic response, insulin demand, organ stress across 8 systems, and cognitive impact over 8 hours.',
    detail: 'Factors: glycemic index, carb/fat/fiber load, age, BMI, activity level, sleep, diabetes status, and genetic markers (FTO, APOE, TCF7L2, PPARG, MTHFR).',
    color: '#ec4899',
  },
  {
    num: '04',
    title: '3D Body Visualization',
    desc: 'A real-time Three.js 3D body renders with color-coded glowing organs that pulse based on stress levels. Glucose and insulin energy pathways animate around the body.',
    detail: 'Built with React Three Fiber and custom shaders. Interactive orbit controls let you rotate and zoom into specific organs.',
    color: '#06b6d4',
  },
  {
    num: '05',
    title: 'Charts and Predictions',
    desc: 'Four SVG charts show glucose, insulin, focus level, and brain fog over 8 hours. A narrative prediction explains the biological impact in plain language.',
    detail: 'Peak values and per-organ stress bars provide quick-reference summaries.',
    color: '#f59e0b',
  },
  {
    num: '06',
    title: 'Export and Experiment',
    desc: 'Export the full report as PDF. Then visit the What-If Lab to compare the same meal under different physiological conditions — sleep-deprived, post-workout, or diabetic.',
    detail: 'PDF generated via html2canvas plus jsPDF. What-If Lab runs parallel simulations side-by-side.',
    color: '#10b981',
  },
]

const dataFlow = [
  { label: 'User', items: ['Uploads food photo', 'Sets profile params', 'Adds genetic data'] },
  { label: 'Frontend', items: ['React + TypeScript', 'Framer Motion', 'React Three Fiber'] },
  { label: 'AI Layer', items: ['Kimi K2.6 model', 'Image recognition', 'Structured JSON output', 'Macro & nutrient estimation'] },
  { label: 'Engine', items: ['Glycemic classifier', 'Insulin sensitivity', 'Organ stress model', 'Genetic modifier', 'Cognitive predictor'] },
  { label: 'Output', items: ['3D body simulation', '8h glucose/insulin charts', 'Organ stress bars', 'Prediction text', 'PDF report'] },
]

export default function HowItWorks() {
  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 16px 60px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: '48px' }}
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
            background: 'rgba(168,85,247,0.08)',
            border: '1px solid rgba(168,85,247,0.1)',
            marginBottom: '16px',
          }}
        >
          Architecture Overview
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '12px' }}>
          How It <span style={gradientText}>Works</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '540px', margin: '0 auto', lineHeight: 1.7 }}>
          From food photo to biological simulation — here is exactly what happens behind the scenes.
        </p>
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '48px' }}>
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
          >
            <div
              style={{
                ...card,
                display: 'flex',
                gap: '18px',
                alignItems: 'flex-start',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: '3px',
                  height: '100%',
                  background: `linear-gradient(180deg, ${step.color}, transparent)`,
                  opacity: 0.5,
                }}
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, minWidth: '80px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 700,
                    background: `${step.color}15`,
                    border: `1px solid ${step.color}25`,
                    color: step.color,
                  }}
                >
                  {step.num}
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-primary)' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '6px' }}>
                  {step.desc}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6, fontStyle: 'italic' }}>
                  {step.detail}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{ marginBottom: '48px' }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', textAlign: 'center' }}>
          Data Flow <span style={gradientText}>Architecture</span>
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))',
            gap: '10px',
          }}
        >
          {dataFlow.map((layer) => (
            <div
              key={layer.label}
              style={{
                ...card,
                padding: '16px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: 'var(--accent-light)',
                  marginBottom: '10px',
                }}
              >
                {layer.label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {layer.items.map((item) => (
                  <div
                    key={item}
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '8px',
            fontSize: '20px',
            color: 'var(--text-muted)',
            opacity: 0.4,
          }}
        >
          <span>→</span>
          <span>→</span>
          <span>→</span>
          <span>→</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{ ...card, marginBottom: '48px' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>
              Kimi API Integration
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '8px' }}>
              When a user uploads a food photo, the app sends it to Moonshot's <strong style={{ color: 'var(--text-primary)' }}>Kimi K2.6</strong> model — a multimodal vision-language AI. The image is base64-encoded and sent via the OpenAI-compatible SDK.
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              The model returns structured nutritional data and a detailed biological impact description that feeds directly into the simulation engine. The Kimi model is integrated directly into the platform — no external API configuration required.
            </p>
          </div>
          <div
            style={{
              flexShrink: 0,
              width: '100%',
              maxWidth: '380px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '12px',
              padding: '14px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono, monospace)',
              color: 'var(--text-muted)',
              lineHeight: 1.8,
              overflow: 'auto',
            }}
          >
            <pre style={{ margin: 0, fontSize: '11px', lineHeight: 1.8, color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>
{`// POST /v1/chat/completions
{
  model: "kimi-k2.6",
  thinking: { type: "disabled" },
  messages: [
    { role: "system",
      content: "Identify food from images. Return JSON with foodName, description, estimatedCalories, estimatedCarbs, estimatedProtein, estimatedFat, nutrients." },
    { role: "user",
      content: [
        { type: "image_url",
          image_url: { url: "data:image/jpeg;base64,..." } },
        { type: "text",
          text: "Identify this food item and estimate its nutritional values. Respond with JSON only." }
      ] }
  ]
}
// Returns:
// { foodName, description,
//   estimatedCalories, estimatedCarbs,
//   estimatedProtein, estimatedFat,
//   nutrients[] }`}
            </pre>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{ ...card, marginBottom: '48px' }}
      >
        <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>
          Simulation Engine Algorithms
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '12px' }}>
          {[
            {
              title: 'Glycemic Classification',
              desc: 'Food name is matched against a keyword database of high, medium, and low glycemic index foods. Combined with carb, fat, and fiber load estimation.',
              color: '#ef4444',
            },
            {
              title: 'Insulin Sensitivity',
              desc: 'Profile-based calculation using age, BMI, activity level, sleep hours, and diabetes status. Returns a 0.3 to 1.0 multiplier.',
              color: '#f59e0b',
            },
            {
              title: 'Genetic Modulation',
              desc: 'FTO (rs9939609), APOE E4, TCF7L2, PPARG, and MTHFR variants scale glucose and insulin predictions by up to 30 percent.',
              color: '#a855f7',
            },
            {
              title: 'Glucose Modeling',
              desc: 'Gaussian curve with food-dependent peak timing between 0.5 and 2 hours. Amplitude scaled by GI multiplied by carb load multiplied by genetic modifier.',
              color: '#ef4444',
            },
            {
              title: 'Organ Stress Scoring',
              desc: 'Eight organs scored from 0 to 100 percent based on food composition including processed ingredients, high fat, high sugar, alcohol, and salt, combined with profile modifiers.',
              color: '#06b6d4',
            },
            {
              title: 'Cognitive Prediction',
              desc: 'Focus and brain fog levels derived from glucose variability. A sigmoid recovery function models the 3 to 5 hour rebound period.',
              color: '#ec4899',
            },
          ].map((algo) => (
            <div
              key={algo.title}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
                borderRadius: '10px',
                padding: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: algo.color, flexShrink: 0 }} />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>{algo.title}</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{algo.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
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
              color: '#fff',
              textDecoration: 'none',
              background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
              boxShadow: '0 4px 20px rgba(168,85,247,0.2)',
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
              border: '1px solid rgba(168,85,247,0.2)',
            }}
          >
            View Demo Simulation
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
