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

export default function AgentsLoader({ done, agents }: { done: boolean; agents?: { id: string; label: string; desc: string; color: string }[] }) {
  const AGENTS = agents || DEFAULT_AGENTS

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', minHeight: '200px' }}>
      {AGENTS.map((agent) => (
        <motion.div
          key={agent.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          style={{
            background: done
              ? `linear-gradient(145deg, ${agent.color}08, ${agent.color}02)`
              : 'var(--bg-surface)',
            border: `1px solid ${done ? `${agent.color}25` : `${agent.color}15`}`,
            borderRadius: '14px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '2px',
            background: `linear-gradient(90deg, ${agent.color}, ${agent.color}44, transparent)`,
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: done ? '#34d399' : agent.color,
              boxShadow: done ? '0 0 8px #34d39970' : `0 0 8px ${agent.color}50`,
              animation: done ? 'none' : 'pulse 1.2s ease-in-out infinite',
            }} />
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
            {done ? (
              <span style={{ color: '#34d399', fontSize: '16px', fontWeight: 700 }}>✓</span>
            ) : (
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.1)',
                borderTopColor: agent.color,
                animation: 'spin 0.7s linear infinite',
              }} />
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                style={{
                  aspectRatio: '1',
                  borderRadius: '50%',
                  transition: 'all 0.3s ease',
                  background: done
                    ? `linear-gradient(135deg, ${agent.color}, transparent)`
                    : `${agent.color}06`,
                  border: `1px solid ${done ? `${agent.color}50` : `${agent.color}10`}`,
                  boxShadow: done ? `inset 0 0 4px ${agent.color}40` : 'none',
                  animation: done ? 'none' : `fillPulse ${1.2 + i * 0.06}s ease-in-out infinite`,
                }}
              />
            ))}
          </div>

          <div style={{
            marginTop: '10px',
            height: '2px',
            borderRadius: '1px',
            background: 'rgba(255,255,255,0.04)',
            overflow: 'hidden',
          }}>
            <motion.div
              animate={{
                width: done ? '100%' : ['0%', '100%'],
              }}
              transition={done ? { duration: 0.3 } : { duration: 2.5, ease: 'easeInOut' }}
              style={{
                height: '100%',
                borderRadius: '1px',
                background: `linear-gradient(90deg, ${agent.color}, transparent)`,
              }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}