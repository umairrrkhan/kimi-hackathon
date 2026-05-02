import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const DEFAULT_AGENTS = [
  {
    id: 'recognition',
    label: 'Food Recognition Agent',
    desc: 'Identifying food and calculating nutritional values',
    color: '#f59e0b',
  },
  {
    id: 'biological',
    label: 'Biological Analysis Agent',
    desc: 'Analyzing metabolic impact and organ response',
    color: '#d97706',
  },
]

const TOTAL = 16

export default function AgentsLoader({ onComplete, agents }: { onComplete: () => void; agents?: { id: string; label: string; desc: string; color: string }[] }) {
  const AGENTS = agents || DEFAULT_AGENTS
  const [progress, setProgress] = useState({ recognition: 0, biological: 0 })
  const [done, setDone] = useState(false)

  useEffect(() => {
    let r = 0
    let b = 0
    let step = 0
    const total = TOTAL * 2

    const interval = setInterval(() => {
      step++

      if (step <= TOTAL * 0.55) {
        r++
        b = Math.min(b + 0.25, r - 1)
      } else if (step <= TOTAL * 0.8) {
        r = Math.min(r + 0.4, TOTAL)
        b++
      } else if (step < total) {
        b = Math.min(b + 0.6, TOTAL)
      }

      if (step >= total) {
        r = TOTAL
        b = TOTAL
        clearInterval(interval)
        setProgress({ recognition: TOTAL, biological: TOTAL })
        setDone(true)
        setTimeout(onComplete, 500)
        return
      }

      setProgress({
        recognition: Math.min(r, TOTAL),
        biological: Math.min(b, TOTAL),
      })
    }, 110)

    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      minHeight: '200px',
    }}>
      {AGENTS.map((agent) => {
        const filled = Math.floor(progress[agent.id as keyof typeof progress])

        return (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            style={{
              background: done
                ? `linear-gradient(145deg, ${agent.color}08, ${agent.color}02)`
                : 'var(--bg-surface)',
              border: `1px solid ${
                done ? `${agent.color}25` : `${agent.color}15`
              }`,
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '2px',
                background: `linear-gradient(90deg, ${agent.color}, ${agent.color}44, transparent)`,
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: done ? '#34d399' : agent.color,
                  boxShadow: `0 0 6px ${done ? '#34d399' : agent.color}50`,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: done ? '#34d399' : 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {done ? 'Complete' : agent.label}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>
                  {done ? 'All tasks finished' : agent.desc}
                </div>
              </div>
              <div style={{
                fontSize: '15px',
                fontWeight: 700,
                color: done ? '#34d399' : agent.color,
                fontVariantNumeric: 'tabular-nums',
                flexShrink: 0,
              }}>
                {filled}/{TOTAL}
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '4px',
            }}>
              {Array.from({ length: TOTAL }).map((_, i) => {
                const isFilled = i < filled
                const isActive = i === filled && !done

                return (
                  <div
                    key={i}
                    style={{
                      aspectRatio: '1',
                      borderRadius: '50%',
                      transition: 'all 0.25s ease',
                      background: isFilled
                        ? `linear-gradient(135deg, ${agent.color}, transparent)`
                        : isActive
                        ? `${agent.color}15`
                        : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${
                        isFilled
                          ? `${agent.color}50`
                          : isActive
                          ? `${agent.color}25`
                          : 'rgba(255,255,255,0.04)'
                      }`,
                      boxShadow: isFilled
                        ? `inset 0 0 4px ${agent.color}40`
                        : 'none',
                    }}
                  />
                )
              })}
            </div>

            <div style={{
              marginTop: '10px',
              height: '2px',
              borderRadius: '1px',
              background: 'rgba(255,255,255,0.04)',
              overflow: 'hidden',
            }}>
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${(filled / TOTAL) * 100}%` }}
                transition={{ duration: 0.2 }}
                style={{
                  height: '100%',
                  borderRadius: '1px',
                  background: `linear-gradient(90deg, ${agent.color}, transparent)`,
                }}
              />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
