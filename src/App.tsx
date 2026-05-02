import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import PageTransition from './components/PageTransition'
import Home from './pages/Home'
import Analyze from './pages/Analyze'
import Simulation from './pages/Simulation'
import HowItWorks from './pages/HowItWorks'
import WhatIfLab from './pages/WhatIfLab'
import Genetics from './pages/Genetics'
import Profile from './pages/Profile'

export default function App() {
  const location = useLocation()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)' }}>
      <Header />
      <div style={{ paddingTop: '88px' }}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/analyze" element={<PageTransition><Analyze /></PageTransition>} />
            <Route path="/simulation" element={<PageTransition><Simulation /></PageTransition>} />
            <Route path="/what-if" element={<PageTransition><WhatIfLab /></PageTransition>} />
            <Route path="/genetics" element={<PageTransition><Genetics /></PageTransition>} />
            <Route path="/how-it-works" element={<PageTransition><HowItWorks /></PageTransition>} />
            <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  )
}
