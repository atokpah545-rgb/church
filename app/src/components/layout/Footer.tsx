import { Link } from 'react-router-dom'
import { Heart, MapPin, Clock } from 'lucide-react'

export function Footer() {
  return (
    <footer style={{ position: 'relative', zIndex: 10, background: '#080f08', borderTop: '1px solid rgba(217,119,6,0.15)', marginTop: '80px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '64px 32px 40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '48px' }}>

        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', fontWeight: 800,
              background: 'linear-gradient(135deg,#166534,#d97706)', color: '#fff',
              boxShadow: '0 0 14px rgba(217,119,6,0.3)',
            }}>F</div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'Georgia, serif', color: '#fbbf24' }}>Fruit of Africa</div>
              <div style={{ fontSize: '0.7rem', color: '#86efac', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Church</div>
            </div>
          </div>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.75, color: '#6b7280', marginBottom: '16px' }}>
            A Spirit-filled Pentecostal community rooted in the love of God, grounded in Scripture, and alive in worship.
          </p>
          <p style={{ fontSize: '0.875rem', color: '#d97706', fontWeight: 600 }}>Pastor Prince Bawoh</p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ fontWeight: 700, marginBottom: '20px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fbbf24' }}>
            Quick Links
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { to: '/about', label: 'About Us' },
              { to: '/sermons', label: 'Sermons' },
              { to: '/events', label: 'Events' },
              { to: '/announcements', label: 'Announcements' },
              { to: '/gallery', label: 'Photo Gallery' },
              { to: '/prayer', label: 'Prayer Requests' },
              { to: '/give', label: 'Give / Donate' },
              { to: '/contact', label: 'Contact Us' },
              { to: '/auth', label: 'Join the Church' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link to={to} style={{ fontSize: '0.875rem', color: '#6b7280', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fbbf24')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Service Times */}
        <div>
          <h4 style={{ fontWeight: 700, marginBottom: '20px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fbbf24' }}>
            Service Times
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <Clock size={14} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#86efac' }}>Sunday Services</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px' }}>9:00 AM &amp; 11:00 AM</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <Clock size={14} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#86efac' }}>Wednesday Bible Study</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px' }}>6:00 PM</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <MapPin size={14} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#86efac' }}>Location</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px' }}>Monrovia, Liberia</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 32px 28px', borderTop: '1px solid rgba(217,119,6,0.1)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <p style={{ fontSize: '0.78rem', color: '#374151' }}>
          © {new Date().getFullYear()} Fruit of Africa Church. All rights reserved.
        </p>
        <p style={{ fontSize: '0.78rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '4px' }}>
          Made with <Heart size={10} style={{ color: '#d97706' }} fill="#d97706" /> in Liberia
        </p>
      </div>
    </footer>
  )
}
