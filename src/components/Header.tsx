import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/analyze', label: 'Analyze' },
  { path: '/simulation', label: 'Simulation' },
  { path: '/how-it-works', label: 'How It Works' },
  { path: '/what-if', label: 'What-If' },
  { path: '/genetics', label: 'Genetics' },
  { path: '/profile', label: 'Profile' },
]

export default function Header() {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: 'all 0.4s ease',
        background: scrolled
          ? 'rgba(0, 0, 0, 0.92)'
          : 'rgba(0, 0, 0, 0)',
        backdropFilter: scrolled ? 'blur(20px) saturate(1.3)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(1.3)' : 'none',
        borderBottom: scrolled
          ? '1px solid rgba(245, 158, 11, 0.06)'
          : '1px solid transparent',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 800,
            color: '#000',
          }}>
            CH
          </div>
          <span style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.3px',
          }}>
            Check Health
          </span>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  color: isActive ? 'var(--accent-light)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 400,
                  padding: '6px 14px',
                  borderRadius: '8px',
                  transition: 'all 0.2s',
                  background: isActive ? 'rgba(245,158,11,0.08)' : 'transparent',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent'
                }}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="navPill"
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '16px',
                      height: '2px',
                      borderRadius: '1px',
                      background: 'var(--accent)',
                    }}
                  />
                )}
              </Link>
            )
          })}

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </nav>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              overflow: 'hidden',
              background: 'rgba(0,0,0,0.95)',
              borderBottom: '1px solid rgba(245,158,11,0.06)',
            }}
          >
            <div style={{ padding: '8px 20px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    color: location.pathname === link.path ? 'var(--accent-light)' : 'var(--text-muted)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: location.pathname === link.path ? 'rgba(245,158,11,0.08)' : 'transparent',
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
