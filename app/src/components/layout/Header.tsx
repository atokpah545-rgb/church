import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown, LogOut, User, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/sermons', label: 'Sermons' },
  { to: '/events', label: 'Events' },
  { to: '/announcements', label: 'Announcements' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/prayer', label: 'Prayer' },
  { to: '/give', label: 'Give' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { user, profile, role, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      height: '80px',
      background: scrolled ? 'rgba(10,24,10,0.98)' : 'rgba(10,24,10,0.88)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(217,119,6,0.22)',
      transition: 'background 0.4s ease',
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '0 32px',
        height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>

        {/* ── LOGO ── */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: '58px', height: '58px', borderRadius: '50%',
            overflow: 'hidden', flexShrink: 0,
            boxShadow: '0 0 0 2px #d97706, 0 0 16px rgba(217,119,6,0.4)',
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
                parent.innerHTML = '<span style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:1.3rem;font-weight:800;color:#fff">F</span>'
              }}
            />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'Georgia, serif', color: '#fbbf24', lineHeight: 1.2 }}>
              Fruit of Africa
            </div>
            <div style={{ fontSize: '0.7rem', color: '#86efac', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Church</div>
          </div>
        </Link>

        {/* ── DESKTOP NAV ── */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="desktop-nav">
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              style={({ isActive }) => ({
                padding: '7px 11px',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '0.01em',
                color: isActive ? '#fbbf24' : '#d1fae5',
                textDecoration: 'none',
                background: isActive ? 'rgba(217,119,6,0.12)' : 'transparent',
                borderBottom: isActive ? '2px solid #d97706' : '2px solid transparent',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              })}>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* ── RIGHT SIDE ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          {user ? (
            <div style={{ position: 'relative' }} className="desktop-nav">
              <button onClick={() => setProfileOpen(!profileOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 14px', borderRadius: '10px',
                  background: 'rgba(217,119,6,0.12)', border: '1px solid rgba(217,119,6,0.3)',
                  cursor: 'pointer',
                }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, background: '#d97706', color: '#0d1f0d' }}>
                  {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fbbf24' }}>
                  {profile?.full_name?.split(' ')[0]}
                </span>
                <ChevronDown size={14} style={{ color: '#d97706' }} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    onMouseLeave={() => setProfileOpen(false)}
                    style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: '200px', borderRadius: '14px', padding: '8px', background: '#0e1e0e', border: '1px solid rgba(217,119,6,0.2)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', zIndex: 100 }}>
                    {[
                      { to: '/profile', icon: User, label: 'My Profile', show: true },
                      { to: '/admin', icon: LayoutDashboard, label: 'Admin Dashboard', show: role === 'admin' },
                      { to: '/pastor', icon: LayoutDashboard, label: 'Pastor Dashboard', show: role === 'pastor' || role === 'admin' },
                    ].filter(i => i.show).map(({ to, icon: Icon, label }) => (
                      <Link key={to} to={to} onClick={() => setProfileOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', fontSize: '0.875rem', color: '#86efac', textDecoration: 'none' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(22,101,52,0.3)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <Icon size={15} /> {label}
                      </Link>
                    ))}
                    <div style={{ height: '1px', background: 'rgba(217,119,6,0.15)', margin: '6px 0' }} />
                    <button onClick={handleSignOut}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', fontSize: '0.875rem', color: '#fca5a5', background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.15)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                      <LogOut size={15} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/auth" className="desktop-nav" style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '10px 26px', borderRadius: '999px',
              fontSize: '0.95rem', fontWeight: 700,
              background: 'linear-gradient(135deg,#d97706,#f59e0b)', color: '#0d1f0d',
              textDecoration: 'none', boxShadow: '0 0 20px rgba(217,119,6,0.3)',
              whiteSpace: 'nowrap',
            }}>
              Join Us
            </Link>
          )}

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            style={{ display: 'none', padding: '8px', borderRadius: '8px', background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.2)', cursor: 'pointer', color: '#d97706' }}
            className="mobile-menu-btn">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── MOBILE MENU ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden', background: 'rgba(10,24,10,0.99)', borderTop: '1px solid rgba(217,119,6,0.15)' }}>
            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {navLinks.map(({ to, label }) => (
                <NavLink key={to} to={to} end={to === '/'} onClick={() => setMobileOpen(false)}
                  style={({ isActive }) => ({
                    padding: '12px 16px', borderRadius: '10px', fontSize: '1rem', fontWeight: 600,
                    color: isActive ? '#fbbf24' : '#d1fae5', textDecoration: 'none',
                    background: isActive ? 'rgba(217,119,6,0.1)' : 'transparent',
                  })}>
                  {label}
                </NavLink>
              ))}
              <Link to="/contact" onClick={() => setMobileOpen(false)} style={{ padding: '12px 16px', borderRadius: '10px', fontSize: '1rem', fontWeight: 600, color: '#d1fae5', textDecoration: 'none' }}>Contact</Link>
              <div style={{ height: '1px', background: 'rgba(217,119,6,0.12)', margin: '8px 0' }} />
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setMobileOpen(false)} style={{ padding: '12px 16px', borderRadius: '10px', fontSize: '1rem', fontWeight: 600, color: '#86efac', textDecoration: 'none' }}>My Profile</Link>
                  {role === 'admin' && <Link to="/admin" onClick={() => setMobileOpen(false)} style={{ padding: '12px 16px', borderRadius: '10px', fontSize: '1rem', fontWeight: 600, color: '#86efac', textDecoration: 'none' }}>Admin Dashboard</Link>}
                  {(role === 'pastor' || role === 'admin') && <Link to="/pastor" onClick={() => setMobileOpen(false)} style={{ padding: '12px 16px', borderRadius: '10px', fontSize: '1rem', fontWeight: 600, color: '#86efac', textDecoration: 'none' }}>Pastor Dashboard</Link>}
                  <button onClick={() => { handleSignOut(); setMobileOpen(false) }} style={{ padding: '12px 16px', borderRadius: '10px', fontSize: '1rem', fontWeight: 600, color: '#fca5a5', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>Sign Out</button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setMobileOpen(false)} style={{ marginTop: '8px', padding: '14px 16px', borderRadius: '12px', fontSize: '1rem', fontWeight: 700, textAlign: 'center', background: 'linear-gradient(135deg,#d97706,#f59e0b)', color: '#0d1f0d', textDecoration: 'none' }}>
                  Join Us
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  )
}
