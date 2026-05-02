import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const containerStyle: React.CSSProperties = {
  maxWidth: '1100px',
  margin: '0 auto',
  padding: '0 16px',
}

const sectionStyle: React.CSSProperties = {
  padding: '60px 0',
  borderBottom: '1px solid var(--border-subtle)',
}

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '16px',
  padding: '28px 24px',
  transition: 'all 0.25s ease',
}

const gradientTextStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}

const btnPrimaryStyle: React.CSSProperties = {
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

const features = [
  { icon: '◎', title: 'AI Food Analysis', desc: 'Snap a photo or describe what you ate. Our AI identifies every ingredient and predicts the biological cascade.', path: '/analyze' },
  { icon: '◉', title: '3D Body Simulation', desc: 'Watch a real-time simulation of your body processing food — glucose waves, organ stress, insulin response.', path: '/simulation' },
  { icon: '◇', title: 'What-If Lab', desc: 'Compare scenarios: same meal post-workout vs sleep-deprived. How does context change the outcome?', path: '/what-if' },
  { icon: '🧬', title: 'Genetic Integration', desc: 'Upload raw genetic data (FTO, APOE, TCF7L2) and see how your DNA modulates every metabolic response.', path: '/genetics' },
]

const asciiLogo = `
   ___________    __  __
  / ____/ ___/   / / / /__  __________
 / /    \\__ \\   / /_/ / _ \\/ ___/ ___/
/ /___ ___/ /  / __  /  __/ /  (__  )
\\____//____/  /_/ /_/\\___/_/  /____/
`

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section
        style={{
          minHeight: 'calc(100vh - 88px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '40px 16px 60px',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: 'radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.06) 0%, transparent 50%)',
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: '720px', position: 'relative', zIndex: 1 }}
        >
          <pre style={{
            fontSize: '7px',
            lineHeight: 1.2,
            color: 'var(--accent)',
            opacity: 0.5,
            marginBottom: '16px',
            userSelect: 'none',
          }}>
{asciiLogo}
          </pre>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 16px',
              borderRadius: '100px',
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--accent-light)',
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.12)',
              marginBottom: '24px',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            AI-Powered Biological Simulation
          </div>
          <h1
            style={{
              fontSize: 'clamp(2rem, 6vw, 4rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: '20px',
            }}
          >
            <span style={{ color: 'var(--text-primary)' }}>Check Health</span>
            <br />
            <span style={gradientTextStyle}>AI</span>
          </h1>
          <p
            style={{
              fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              maxWidth: '560px',
              margin: '0 auto 36px',
            }}
          >
            Snap a photo of your meal. Instantly see a 3D biological simulation — glucose spikes,
            insulin load, organ stress, and cognitive effects over the next 8 hours.
          </p>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/analyze" style={btnPrimaryStyle}>
              Analyze Your Food <span style={{ fontSize: '18px' }}>→</span>
            </Link>
            <Link
              to="/simulation"
              style={{
                ...btnPrimaryStyle,
                color: '#000',
                background: 'transparent',
                boxShadow: 'none',
                border: '1px solid rgba(245,158,11,0.25)',
              }}
            >
              View Demo
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ASCII Divider */}
      <div style={{ textAlign: 'center', padding: '0 16px', color: 'var(--text-muted)', opacity: 0.15, fontSize: '10px', userSelect: 'none' }}>
        <pre style={{ margin: 0 }}>
{`══════════════════════════════════════`}
        </pre>
      </div>

      {/* Features */}
      <section style={sectionStyle}>
        <div style={containerStyle}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '44px' }}
          >
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, marginBottom: '10px' }}>
              Everything You Need
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '480px', margin: '0 auto' }}>
              From AI food recognition to genetic personalization — understand your body like never before.
            </p>
          </motion.div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
              gap: '14px',
            }}
          >
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  to={f.path}
                  style={{
                    ...cardStyle,
                    display: 'block',
                    textDecoration: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <span style={{ fontSize: '28px', flexShrink: 0 }}>{f.icon}</span>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>{f.title}</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ASCII Divider */}
      <div style={{ textAlign: 'center', padding: '0 16px', color: 'var(--text-muted)', opacity: 0.15, fontSize: '10px', userSelect: 'none' }}>
        <pre style={{ margin: 0 }}>
{`══════════════════════════════════════`}
        </pre>
      </div>

      {/* CTA */}
      <section style={{ ...sectionStyle, borderBottom: 'none', textAlign: 'center' }}>
        <div style={containerStyle}>
          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <motion.pre
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              style={{
                fontSize: '7px',
                lineHeight: 1.2,
                color: 'var(--accent)',
                opacity: 0.3,
                marginBottom: '16px',
                userSelect: 'none',
              }}
            >
{`  _  _    ___    __  __
 | || |  / _ \\  |  \\/  |
 | || |_| | | | | |\\/| |
 |__   _| |_| | | |  | |
    |_|  \\___/  |_|  |_|`}
            </motion.pre>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 700, marginBottom: '12px' }}
            >
              Ready to See Inside?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '28px' }}
            >
              Every meal tells a story. Find out what yours is saying.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Link to="/analyze" style={btnPrimaryStyle}>
                Start Analysis <span style={{ fontSize: '18px' }}>→</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
