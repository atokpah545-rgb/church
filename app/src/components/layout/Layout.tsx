import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CinematicBackground } from '../animations/CinematicBackground'
import { Header } from './Header'
import { Footer } from './Footer'
import { useChurchRealtime } from '../../hooks/useRealtime'

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('revealed')
        })
      },
      { threshold: 0.1 }
    )
    const els = document.querySelectorAll('.section-reveal')
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  })
}

export function Layout() {
  const location = useLocation()
  useScrollReveal()
  useChurchRealtime()

  return (
    <div className="relative min-h-screen" style={{ background: '#0d1f0d' }}>
      <CinematicBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        {/* Fixed-height spacer — exactly matches nav h-20 so pages never render behind the header */}
        <div style={{ height: '80px', flexShrink: 0 }} />
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            className="flex-1"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
        <Footer />
      </div>
    </div>
  )
}
