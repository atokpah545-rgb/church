import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Home, LayoutDashboard, Mic } from 'lucide-react'
import { CinematicBackground } from '../animations/CinematicBackground'
import { useAuth } from '../../contexts/AuthContext'
import { useChurchRealtime } from '../../hooks/useRealtime'

export function AdminLayout() {
  const { profile, role, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  useChurchRealtime()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  const isAdmin = location.pathname.startsWith('/admin')
  const isPastor = location.pathname.startsWith('/pastor')

  return (
    <div style={{ background: '#0d1f0d', minHeight: '100vh', position: 'relative' }}>
      <CinematicBackground />
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* ── TOP BAR ── */}
        <header style={{
          height: '64px',
          background: 'rgba(10,24,10,0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(217,119,6,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          flexShrink: 0,
          gap: '16px',
        }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: '46px', height: '46px', borderRadius: '50%',
              overflow: 'hidden', flexShrink: 0,
              boxShadow: '0 0 0 2px #d97706, 0 0 12px rgba(217,119,6,0.35)',
              background: '#fff',
            }}>
              <img
                src="/logo.png"
                alt="Fruit of Africa"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={e => {
                  const t = e.currentTarget
                  t.style.display = 'none'
                  const parent = t.parentElement!
                  parent.style.background = 'linear-gradient(135deg,#166534,#d97706)'
                  parent.innerHTML = '<span style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:1.1rem;font-weight:800;color:#fff">F</span>'
                }}
              />
            </div>
            <div>
              <div style={{ color: '#fbbf24', fontWeight: 700, fontFamily: 'Georgia, serif', fontSize: '0.95rem', lineHeight: 1 }}>
                Fruit of Africa
              </div>
              <div style={{ color: '#6b7280', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '2px' }}>
                {isAdmin ? 'Admin Panel' : 'Pastor Panel'}
              </div>
            </div>
          </Link>

          {/* Centre nav — dashboard switcher for admins */}
          {role === 'admin' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Link to="/admin" style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '7px 16px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600,
                textDecoration: 'none', transition: 'all 0.15s',
                background: isAdmin ? 'rgba(217,119,6,0.18)' : 'transparent',
                color: isAdmin ? '#fbbf24' : '#6b7280',
                border: isAdmin ? '1px solid rgba(217,119,6,0.35)' : '1px solid transparent',
              }}>
                <LayoutDashboard size={14} /> Admin Dashboard
              </Link>
              <Link to="/pastor" style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '7px 16px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600,
                textDecoration: 'none', transition: 'all 0.15s',
                background: isPastor ? 'rgba(217,119,6,0.18)' : 'transparent',
                color: isPastor ? '#fbbf24' : '#6b7280',
                border: isPastor ? '1px solid rgba(217,119,6,0.35)' : '1px solid transparent',
              }}>
                <Mic size={14} /> Pastor Dashboard
              </Link>
            </div>
          )}

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            {profile?.full_name && (
              <span style={{ color: '#9ca3af', fontSize: '0.82rem' }}>
                {profile.full_name}
              </span>
            )}
            <Link to="/" style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              color: '#86efac', fontSize: '0.8rem', textDecoration: 'none',
              padding: '6px 12px', borderRadius: '8px',
              background: 'rgba(22,101,52,0.15)',
              border: '1px solid rgba(22,101,52,0.3)',
            }}>
              <Home size={13} /> View Site
            </Link>
            <button onClick={handleSignOut} style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '8px',
              background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.25)',
              color: '#fca5a5', cursor: 'pointer', fontSize: '0.8rem',
            }}>
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main style={{ flex: 1 }}>
          <Outlet />
        </main>

      </div>
    </div>
  )
}
