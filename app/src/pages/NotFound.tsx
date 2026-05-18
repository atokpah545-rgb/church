import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home } from 'lucide-react'

export function NotFound() {
  return (
    <div style={{ padding: '80px 32px 80px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ maxWidth: '520px', margin: '0 auto', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

          {/* 404 number */}
          <div style={{
            fontSize: 'clamp(6rem, 20vw, 10rem)',
            fontWeight: 900,
            fontFamily: 'Georgia, serif',
            lineHeight: 1,
            background: 'linear-gradient(135deg, #d97706, #f59e0b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '8px',
            userSelect: 'none',
          }}>
            404
          </div>

          {/* Divider */}
          <div style={{ width: '60px', height: '3px', background: 'linear-gradient(135deg,#d97706,#f59e0b)', borderRadius: '999px', margin: '0 auto 28px' }} />

          <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 700, fontFamily: 'Georgia, serif', color: '#f0fdf4', marginBottom: '14px' }}>
            Page Not Found
          </h1>
          <p style={{ color: '#9ca3af', marginBottom: '40px', lineHeight: 1.8, fontSize: '0.95rem' }}>
            The page you're looking for doesn't exist or may have been moved. Let us guide you back to where the Spirit moves.
          </p>

          <Link to="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '13px 32px', borderRadius: '999px',
            fontWeight: 700, fontSize: '0.95rem',
            background: 'linear-gradient(135deg, #d97706, #f59e0b)',
            color: '#0d1f0d', textDecoration: 'none',
            boxShadow: '0 0 24px rgba(217,119,6,0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.04)'
              e.currentTarget.style.boxShadow = '0 0 36px rgba(217,119,6,0.45)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 0 24px rgba(217,119,6,0.3)'
            }}>
            <Home size={16} /> Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
