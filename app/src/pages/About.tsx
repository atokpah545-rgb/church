import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Book, Flame, Globe, Clock, MapPin, ArrowRight } from 'lucide-react'

const values = [
  { icon: Flame, title: 'Spirit-Filled Worship', desc: 'We believe in the fullness of the Holy Spirit — in praise, in prayer, and in power.' },
  { icon: Book, title: 'Word-Centered', desc: 'Every sermon, every study is anchored in the living Word of God.' },
  { icon: Heart, title: 'Community & Love', desc: 'We are family. We care for one another, serve each other, and grow together.' },
  { icon: Globe, title: 'African Identity', desc: 'Rooted in African culture and heritage, we celebrate who God made us to be.' },
]

const services = [
  { day: 'Sunday', name: '1st Service', time: '9:00 AM' },
  { day: 'Sunday', name: '2nd Service', time: '11:00 AM' },
  { day: 'Wednesday', name: 'Bible Study', time: '6:00 PM' },
]

const up = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay, duration: 0.55, ease: 'easeOut' as const },
})

export function About() {
  return (
    <div>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ borderBottom: '1px solid rgba(217,119,6,0.15)', padding: '80px 24px 60px' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
          <motion.div {...up(0)}>
            <span style={{
              display: 'inline-block', padding: '6px 18px', borderRadius: '999px',
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
              background: 'rgba(217,119,6,0.12)', color: '#d97706',
              border: '1px solid rgba(217,119,6,0.3)', marginBottom: '24px',
            }}>Our Story</span>
            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 800, lineHeight: 1.2,
              fontFamily: 'Georgia, serif', color: '#f0fdf4', marginBottom: '20px',
            }}>
              About <span className="gold-text">Fruit of Africa</span>
            </h1>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.75, color: '#9ca3af', maxWidth: '540px', margin: '0 auto' }}>
              A Pentecostal church rooted in the heart of Liberia — born from a vision,
              built on prayer, and growing in the power of the Holy Spirit.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── MISSION & VISION ─────────────────────────────────── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#d97706', marginBottom: '10px' }}>
              Why We Exist
            </p>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 800, fontFamily: 'Georgia, serif', color: '#f0fdf4' }}>
              Mission &amp; Vision
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {[
              { title: 'Our Mission', accent: '#d97706', text: 'To preach the gospel of Jesus Christ with boldness, raise up Spirit-filled disciples, and demonstrate the love and power of God in Liberia and across Africa.' },
              { title: 'Our Vision', accent: '#22c55e', text: 'To be a beacon of hope, healing, and transformation — a church where every person encounters the living God and is equipped to change their community.' },
            ].map(({ title, accent, text }, i) => (
              <motion.div key={title} {...up(i * 0.12)} className="glass" style={{ borderRadius: '20px', padding: '40px' }}>
                <div style={{ width: '44px', height: '5px', borderRadius: '4px', background: accent, marginBottom: '24px' }} />
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'Georgia, serif', color: '#f0fdf4', marginBottom: '14px' }}>{title}</h3>
                <p style={{ lineHeight: 1.8, color: '#9ca3af' }}>{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CORE VALUES ──────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: 'rgba(22,101,52,0.05)', borderTop: '1px solid rgba(22,101,52,0.12)', borderBottom: '1px solid rgba(22,101,52,0.12)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#d97706', marginBottom: '10px' }}>
              What We Stand For
            </p>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 800, fontFamily: 'Georgia, serif', color: '#f0fdf4' }}>
              Our Core Values
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {values.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title} {...up(i * 0.08)} whileHover={{ y: -5 }}
                className="glass" style={{ borderRadius: '18px', padding: '32px 24px', textAlign: 'center' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(217,119,6,0.12)', margin: '0 auto 20px',
                }}>
                  <Icon size={22} style={{ color: '#d97706' }} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f0fdf4', marginBottom: '10px' }}>{title}</h3>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.7, color: '#6b7280' }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEADERSHIP ───────────────────────────────────────── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '520px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#d97706', marginBottom: '10px' }}>
            Led by the Spirit
          </p>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 800, fontFamily: 'Georgia, serif', color: '#f0fdf4', marginBottom: '44px' }}>
            Our Leadership
          </h2>
          <motion.div {...up()} className="glass" style={{ borderRadius: '24px', padding: '52px 40px' }}>
            <div style={{
              width: '88px', height: '88px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg,#166534,#d97706)',
              color: '#fff', fontSize: '1.6rem', fontWeight: 800,
              margin: '0 auto 24px',
            }}>PB</div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'Georgia, serif', color: '#f0fdf4', marginBottom: '6px' }}>
              Pastor Prince Bawoh
            </h3>
            <p style={{ color: '#d97706', marginBottom: '20px' }}>Senior Pastor &amp; Founder</p>
            <p style={{ lineHeight: 1.8, color: '#9ca3af' }}>
              Pastor Prince Bawoh is a Spirit-filled man of God with a burning passion to see souls saved
              and lives transformed. He founded Fruit of Africa Church with a vision to raise up a generation
              of believers rooted in God's Word and alive in the Holy Spirit.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── SERVICE TIMES ────────────────────────────────────── */}
      <section style={{ padding: '80px 24px 48px' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <motion.div {...up()} className="glass" style={{ borderRadius: '24px', padding: '52px 40px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#d97706', marginBottom: '10px' }}>
              Join Us in Worship
            </p>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 800, fontFamily: 'Georgia, serif', color: '#f0fdf4', marginBottom: '40px' }}>
              Service Times
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '36px' }}>
              {services.map(({ day, name, time }) => (
                <div key={name} style={{ borderRadius: '14px', padding: '24px 16px', background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '10px' }}>
                    <Clock size={13} style={{ color: '#d97706' }} />
                    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#d97706' }}>{day}</span>
                  </div>
                  <div style={{ fontWeight: 600, color: '#f0fdf4', marginBottom: '6px' }}>{name}</div>
                  <div className="gold-text" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{time}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#6b7280' }}>
              <MapPin size={14} style={{ color: '#d97706' }} />
              <span>Monrovia, Liberia — Everyone is welcome!</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CONTACT CTA ──────────────────────────────────────── */}
      <section style={{ padding: '0 24px 100px' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <motion.div {...up(0.1)} style={{
            borderRadius: '24px', padding: '52px 40px', textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(22,101,52,0.12), rgba(217,119,6,0.07))',
            border: '1px solid rgba(217,119,6,0.22)',
          }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#d97706', marginBottom: '10px' }}>
              Have a Question?
            </p>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, fontFamily: 'Georgia, serif', color: '#f0fdf4', marginBottom: '14px' }}>
              We'd Love to Hear from You
            </h2>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.8, color: '#9ca3af', maxWidth: '400px', margin: '0 auto 32px' }}>
              Reach out with questions, prayer needs, or to plan your first visit. Our doors and hearts are open.
            </p>
            <Link to="/contact" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '13px 32px', borderRadius: '999px', fontWeight: 700, fontSize: '0.95rem',
              background: 'linear-gradient(135deg,#d97706,#f59e0b)', color: '#0d1f0d',
              textDecoration: 'none', boxShadow: '0 0 24px rgba(217,119,6,0.25)',
            }}>
              Get in Touch <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
