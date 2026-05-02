import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/analyze', label: 'Analyze' },
  { path: '/simulation', label: 'Simulation' },
  { path: '/how-it-works', label: 'How It Works' },
  { path: '/what-if', label: 'What-If' },
  { path: '/genetics', label: 'Genetics' },
  { path: '/profile', label: 'Profile' },
]

const linkStyle = (isActive: boolean): React.CSSProperties => ({
  color: isActive ? 'var(--accent-light)' : 'var(--text-muted)',
  textDecoration: 'none',
  fontSize: '13px',
  fontWeight: isActive ? 600 : 400,
  padding: '6px 14px',
  borderRadius: '10px',
  transition: 'all 0.2s',
  background: isActive ? 'rgba(168,85,247,0.1)' : 'transparent',
  border: isActive ? '1px solid rgba(168,85,247,0.15)' : '1px solid transparent',
  letterSpacing: '0.01em',
})

export default function Header() {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      style={{
        position: 'fixed',
        top: '14px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        width: 'calc(100% - 28px)',
        maxWidth: '1200px',
        transition: 'all 0.4s ease',
        opacity: scrolled ? 0.95 : 1,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 20px',
          borderRadius: '20px',
          background: 'rgba(8, 8, 12, 0.78)',
          backdropFilter: 'blur(26px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(26px) saturate(1.5)',
          border: '1px solid rgba(168, 85, 247, 0.1)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              fontSize: '22px',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              background: 'linear-gradient(135deg, #a855f7, #6366f1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            WTF
          </span>
          <span
            className="show-sm"
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-muted)',
              display: 'none',
            }}
          >
            What The Food
          </span>
        </Link>

        <nav style={{ display: 'flex', gap: '2px' }}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={linkStyle(location.pathname === link.path)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
