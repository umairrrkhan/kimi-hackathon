import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'

const containerStyle: React.CSSProperties = {
  maxWidth: '1100px',
  margin: '0 auto',
  padding: '0 16px',
}

const gradientText: React.CSSProperties = {
  background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '14px 32px',
  borderRadius: '14px',
  fontSize: '15px',
  fontWeight: 600,
  color: '#000',
  textDecoration: 'none',
  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.25s ease',
  boxShadow: '0 4px 24px rgba(245,158,11,0.25)',
}

const btnGhost: React.CSSProperties = {
  ...btnPrimary,
  color: '#fbbf24',
  background: 'transparent',
  boxShadow: 'none',
  border: '1px solid rgba(245,158,11,0.25)',
}

const cardHover = {
  rest: { y: 0, boxShadow: '0 0 0 rgba(245,158,11,0)' },
  hover: { y: -4, boxShadow: '0 12px 40px rgba(245,158,11,0.1)', transition: { duration: 0.25, ease: 'easeOut' as const } },
}

const asciiCh = [
  '  __ _            _   _            _    _   _      _ _   ',
  ' / _| |__   ___  | |_| |__   ___  | |  (_) |_  __| | |_ ',
  '| |_| \'_ \\ / _ \\ | __| \'_ \\ / _ \\ | |__| | __|/ _` | __|',
  '|  _| | | |  __/ | |_| | | |  __/ |____| | |_| (_| | |_ ',
  '|_| |_| |_|\\___|  \\__|_| |_|\\___|      |_|\\__|\\__,_|\\__|',
].join('\n')

function CountUp({ end, label }: { end: number; label: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const count = useTransform(
    useScroll({ target: ref, offset: ['start end', 'start center'] }).scrollYProgress,
    [0, 1],
    [0, end]
  )

  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: 'var(--accent)' }}
      >
        {isInView ? (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
          >
            {end}
          </motion.span>
        ) : '0'}
        {end === 100 ? '%' : '+'}
      </motion.div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{label}</div>
    </div>
  )
}

const steps = [
  { num: '01', title: 'Upload', desc: 'Snap or describe your meal' },
  { num: '02', title: 'AI Analysis', desc: 'Kimi K2.6 identifies nutrients' },
  { num: '03', title: 'Simulate', desc: '8hr biological prediction' },
  { num: '04', title: 'Explore', desc: '3D body, charts & export' },
]

export default function Home() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <div>
      {/* ─── HERO ─── */}
      <section
        ref={heroRef}
        style={{
          minHeight: 'calc(100vh - 80px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '60px 16px 80px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background gradient orbs */}
        <motion.div
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.03) 0%, transparent 70%)',
            top: '-200px',
            right: '-200px',
            pointerEvents: 'none',
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.02) 0%, transparent 70%)',
            bottom: '-100px',
            left: '-100px',
            pointerEvents: 'none',
          }}
          animate={{ rotate: [360, 0] }}
          transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
        />

        <motion.div style={{ y: heroY, opacity: heroOpacity, maxWidth: '780px', position: 'relative', zIndex: 1 }}>
          {/* ASCII Logo */}
          <motion.pre
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 0.4, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              fontSize: '7px',
              lineHeight: 1.15,
              color: 'var(--accent)',
              marginBottom: '12px',
              userSelect: 'none',
              textAlign: 'center',
            }}
          >
{asciiCh.trim()}
          </motion.pre>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 14px',
              borderRadius: '100px',
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--accent-light)',
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.12)',
              marginBottom: '24px',
            }}
          >
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }}
            />
            Kimi K2.6 Powered
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            style={{
              fontSize: 'clamp(2rem, 6vw, 4rem)',
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              marginBottom: '16px',
            }}
          >
            <span style={{ color: 'var(--text-primary)' }}>Know exactly what your</span>
            <br />
            <span style={gradientText}>food does to your body</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={{
              fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              maxWidth: '560px',
              margin: '0 auto 32px',
            }}
          >
            Snap a photo of your meal. AI identifies every ingredient, then simulates glucose,
            insulin, organ stress, and brain fog over 8 hours — personalized to your DNA.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5 }}
            style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link to="/analyze" style={btnPrimary}>
              Analyze Your Food <span style={{ fontSize: '18px' }}>→</span>
            </Link>
            <Link to="/how-it-works" style={btnGhost}>
              How It Works
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── STATS ─── */}
      <section style={{ padding: '60px 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={containerStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <CountUp end={8} label="Hour Simulation" />
            <CountUp end={8} label="Organ Systems" />
            <CountUp end={100} label="AI Accuracy" />
            <CountUp end={5} label="Genetic Markers" />
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section style={{ padding: '80px 0' }}>
        <div style={containerStyle}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '44px' }}
          >
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, marginBottom: '10px' }}>
              Everything You <span style={gradientText}>Need</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '480px', margin: '0 auto' }}>
              From AI food recognition to genetic personalization — understand your body like never before.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '14px' }}>
            {[
              { icon: '◎', title: 'AI Food Analysis', desc: 'Upload a photo or type what you ate. Kimi K2.6 identifies ingredients and estimates macros with high precision.', path: '/analyze', color: '#f59e0b' },
              { icon: '◉', title: '3D Body Simulation', desc: 'Watch real-time glucose waves, insulin response, and organ stress across 8 systems in an interactive 3D body.', path: '/simulation', color: '#d97706' },
              { icon: '◇', title: 'What-If Lab', desc: 'Compare the same meal under different conditions — post-workout, sleep-deprived, or diabetic. See how context changes everything.', path: '/what-if', color: '#fbbf24' },
              { icon: '🧬', title: 'Genetic Integration', desc: 'Upload raw DNA data (23andMe). FTO, APOE, TCF7L2 variants modulate your metabolic predictions in real time.', path: '/genetics', color: '#f59e0b' },
              { icon: '📊', title: 'Advanced Charts', desc: 'SVG line charts for glucose, insulin, cognitive focus, and brain fog. Organ stress bars with animated fill.', path: '/simulation', color: '#d97706' },
              { icon: '⬇', title: 'PDF Export', desc: 'Export full reports with charts, predictions, and genetic data. Perfect for sharing with your healthcare provider.', path: '/profile', color: '#fbbf24' },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                whileHover="hover"
              >
                <Link
                  to={f.path}
                  style={{
                    display: 'block',
                    textDecoration: 'none',
                    color: 'inherit',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '16px',
                    padding: '24px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <motion.div
                    variants={cardHover}
                    initial="rest"
                    whileHover="hover"
                    style={{ position: 'relative', zIndex: 1 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        background: `${f.color}10`,
                        border: `1px solid ${f.color}20`,
                        flexShrink: 0,
                      }}>
                        {f.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>{f.title}</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{f.desc}</p>
                      </div>
                    </div>
                    <motion.div
                      initial={{ width: 0 }}
                      whileHover={{ width: '100%' }}
                      transition={{ duration: 0.3 }}
                      style={{
                        height: '2px',
                        background: `linear-gradient(90deg, ${f.color}, transparent)`,
                        marginTop: '16px',
                        borderRadius: '1px',
                      }}
                    />
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMPACT HOW IT WORKS ─── */}
      <section style={{ padding: '60px 0', borderTop: '1px solid var(--border-subtle)', background: 'rgba(245,158,11,0.015)' }}>
        <div style={containerStyle}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '36px' }}
          >
            <h2 style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)', fontWeight: 700, marginBottom: '8px' }}>
              How It <span style={gradientText}>Works</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Four steps from photo to insight</p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'center',
                  position: 'relative',
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: 'rgba(245,158,11,0.1)',
                  border: '1px solid rgba(245,158,11,0.15)',
                  color: 'var(--accent)',
                  margin: '0 auto 8px',
                }}>
                  {step.num}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-primary)' }}>{step.title}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{step.desc}</div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginTop: '20px' }}
          >
            <Link to="/how-it-works" style={{
              ...btnGhost,
              padding: '10px 24px',
              fontSize: '13px',
            }}>
              Full Breakdown →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ padding: '80px 0', textAlign: 'center' }}>
        <div style={containerStyle}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ maxWidth: '480px', margin: '0 auto' }}
          >
            <motion.pre
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.3 }}
              viewport={{ once: true }}
              style={{ fontSize: '7px', lineHeight: 1.2, color: 'var(--accent)', marginBottom: '16px', userSelect: 'none' }}
            >
{['  ___    _     _____   _____ ',
 ' / _ \\  | |   |_   _| |__  / |',
 '| | | | | |     | |     / /| |',
 '| |_| | | |___  | |    / /_| |',
 ' \\___/  |_____| |_|   /____|_|'].join('\n')}
            </motion.pre>
            <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 700, marginBottom: '12px' }}>
              Ready to See Inside?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '28px' }}>
              Every meal tells a story. Find out what yours is saying.
            </p>
            <Link to="/analyze" style={btnPrimary}>
              Start Analysis <span style={{ fontSize: '18px' }}>→</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '32px 16px',
        textAlign: 'center',
      }}>
        <div style={containerStyle}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '16px',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                CH
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Check Health AI</span>
            </div>

            <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
              {[
                { label: 'Analyze', path: '/analyze' },
                { label: 'Simulation', path: '/simulation' },
                { label: 'How It Works', path: '/how-it-works' },
                { label: 'Genetics', path: '/genetics' },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-light)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-muted)', opacity: 0.6 }}>
              Powered by Kimi K2.6
            </div>
          </div>

          <div style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '11px',
            color: 'var(--text-muted)',
            opacity: 0.4,
          }}>
            checkhealth.ai — Biological Simulation Platform
          </div>
        </div>
      </footer>
    </div>
  )
}
