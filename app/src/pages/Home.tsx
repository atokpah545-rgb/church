import { useEffect, useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Play, Calendar, BookOpen, Heart, Users, Mic, MapPin } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Sermon, ChurchEvent, Announcement } from '../types/database'

function RevealSection({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setTimeout(() => el.classList.add('revealed'), delay)
    }, { threshold: 0.1 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])
  return <div ref={ref} className="section-reveal">{children}</div>
}

/* Shared layout tokens */
const center: React.CSSProperties = { maxWidth: '960px', margin: '0 auto' }
const sectionPad: React.CSSProperties = { padding: '80px 32px' }

export function Home() {
  const { data: sermons = [] } = useQuery<Sermon[]>({
    queryKey: ['sermons', 'recent'],
    queryFn: async () => {
      const { data } = await supabase.from('sermons').select('*, pastor:profiles(full_name)').eq('is_published', true).order('sermon_date', { ascending: false }).limit(3)
      return (data ?? []) as Sermon[]
    },
    refetchInterval: 60000,
  })

  const { data: events = [] } = useQuery<ChurchEvent[]>({
    queryKey: ['events', 'upcoming'],
    queryFn: async () => {
      const { data } = await supabase.from('events').select('*').eq('is_published', true).gte('event_date', new Date().toISOString()).order('event_date', { ascending: true }).limit(3)
      return (data ?? []) as ChurchEvent[]
    },
    refetchInterval: 60000,
  })

  const { data: announcements = [] } = useQuery<Announcement[]>({
    queryKey: ['announcements'],
    queryFn: async () => {
      const { data } = await supabase.from('announcements').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(5)
      return (data ?? []) as Announcement[]
    },
    refetchInterval: 30000,
  })

  const { data: memberCount = 0 } = useQuery<number>({
    queryKey: ['stats-members'],
    queryFn: async () => {
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      return count ?? 0
    },
    refetchInterval: 60000,
  })

  const { data: sermonCount = 0 } = useQuery<number>({
    queryKey: ['stats-sermons'],
    queryFn: async () => {
      const { count } = await supabase.from('sermons').select('*', { count: 'exact', head: true }).eq('is_published', true)
      return count ?? 0
    },
    refetchInterval: 60000,
  })

  const { data: prayerCount = 0 } = useQuery<number>({
    queryKey: ['stats-prayers'],
    queryFn: async () => {
      const { count } = await supabase.from('prayer_requests').select('*', { count: 'exact', head: true }).eq('status', 'answered')
      return count ?? 0
    },
    refetchInterval: 60000,
  })

  const stats = [
    { icon: Users, label: 'Members', value: memberCount > 0 ? `${memberCount}+` : '0' },
    { icon: Mic, label: 'Sermons', value: sermonCount > 0 ? `${sermonCount}+` : '0' },
    { icon: Heart, label: 'Prayers Answered', value: prayerCount > 0 ? `${prayerCount}+` : '0' },
    { icon: Calendar, label: 'Years of Ministry', value: '10+' },
  ]

  return (
    <div>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{
        minHeight: '92vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '60px 32px 40px', position: 'relative',
      }}>
        <motion.span
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            display: 'inline-block', padding: '7px 20px', borderRadius: '999px',
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
            background: 'rgba(217,119,6,0.15)', color: '#fbbf24',
            border: '1px solid rgba(217,119,6,0.35)', marginBottom: '28px',
          }}>
          Welcome to Fruit of Africa Church
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}
          style={{
            fontSize: 'clamp(2.4rem, 6vw, 4.5rem)', fontWeight: 800, lineHeight: 1.15,
            fontFamily: 'Georgia, serif', color: '#f0fdf4',
            maxWidth: '720px', margin: '0 auto 24px',
          }}>
          Rooted in{' '}
          <span className="gold-text">God's Love,</span>
          <br />
          Alive in the{' '}
          <span style={{ color: '#86efac' }}>Spirit</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            fontSize: '1.05rem', lineHeight: 1.8, color: '#9ca3af',
            maxWidth: '520px', margin: '0 auto 40px',
          }}>
          A Spirit-filled Pentecostal community in Monrovia, Liberia — where faith grows,
          lives are transformed, and the presence of God is real.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.55 }}
          style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
          <Link to="/sermons" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '14px 32px', borderRadius: '999px', fontWeight: 700, fontSize: '1rem',
            background: 'linear-gradient(135deg,#d97706,#f59e0b)', color: '#0d1f0d',
            boxShadow: '0 0 30px rgba(217,119,6,0.35)', textDecoration: 'none',
            transition: 'transform 0.2s',
          }}>
            <Play size={16} fill="currentColor" /> Watch Sermons
          </Link>
          <Link to="/about" className="glass" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '14px 32px', borderRadius: '999px', fontWeight: 700, fontSize: '1rem',
            color: '#86efac', border: '1px solid rgba(22,101,52,0.5)', textDecoration: 'none',
          }}>
            Our Story <ArrowRight size={16} />
          </Link>
        </motion.div>

        {/* scroll indicator */}
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
          style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)' }}>
          <div style={{ width: '20px', height: '36px', borderRadius: '999px', border: '2px solid rgba(217,119,6,0.4)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '6px' }}>
            <div style={{ width: '4px', height: '8px', borderRadius: '2px', background: '#d97706' }} />
          </div>
        </motion.div>
      </section>

      {/* ── ANNOUNCEMENTS TICKER ─────────────────────────────── */}
      {announcements.length > 0 && (
        <div style={{ padding: '11px 0', overflow: 'hidden', background: 'rgba(217,119,6,0.08)', borderTop: '1px solid rgba(217,119,6,0.2)', borderBottom: '1px solid rgba(217,119,6,0.2)' }}>
          <div style={{ display: 'flex', width: 'max-content', animation: 'ticker-scroll 20s linear infinite' }}>
            {[0, 1].map(setIdx => (
              <div key={setIdx} style={{ display: 'flex', alignItems: 'center', minWidth: '100vw' }}>
                {announcements.map((a, i) => (
                  <span key={i} style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '10px', color: '#fbbf24', padding: '0 52px', flexShrink: 0 }}>
                    <span style={{ color: '#d97706', fontSize: '0.8rem' }}>✦</span>
                    {a.title}
                  </span>
                ))}
              </div>
            ))}
          </div>
          <style>{`@keyframes ticker-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
        </div>
      )}

      {/* ── STATS ────────────────────────────────────────────── */}
      <RevealSection>
        <section style={sectionPad}>
          <div style={{ ...center, maxWidth: '800px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px' }}>
              {stats.map(({ icon: Icon, label, value }, i) => (
                <motion.div key={label}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="glass" style={{ borderRadius: '18px', padding: '28px 20px', textAlign: 'center' }}>
                  <Icon size={26} style={{ color: '#d97706', margin: '0 auto 12px', display: 'block' }} />
                  <div className="gold-text" style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '4px' }}>{value}</div>
                  <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>{label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ── RECENT SERMONS ───────────────────────────────────── */}
      <RevealSection delay={100}>
        <section style={sectionPad}>
          <div style={center}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#d97706', marginBottom: '10px' }}>Feed Your Spirit</p>
              <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 800, fontFamily: 'Georgia, serif', color: '#f0fdf4', marginBottom: '10px' }}>Recent Sermons</h2>
              <p style={{ color: '#6b7280', maxWidth: '360px', margin: '0 auto' }}>Spirit-filled messages from Pastor Prince Bawoh</p>
            </div>

            {sermons.length === 0 ? (
              <div className="glass" style={{ textAlign: 'center', padding: '64px 32px', borderRadius: '20px', maxWidth: '400px', margin: '0 auto' }}>
                <BookOpen size={40} style={{ color: '#d97706', opacity: 0.3, margin: '0 auto 12px', display: 'block' }} />
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Sermons will appear here after Sunday service.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                {sermons.map((sermon, i) => (
                  <motion.div key={sermon.id}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -6 }}>
                    <Link to={`/sermons/${sermon.id}`} className="glass" style={{ display: 'block', borderRadius: '18px', overflow: 'hidden', height: '100%', textDecoration: 'none' }}>
                      <div style={{ aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: 'linear-gradient(135deg,#0a1a0a,#162616)' }}>
                        {sermon.thumbnail_url
                          ? <img src={sermon.thumbnail_url} alt={sermon.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <BookOpen size={36} style={{ color: '#d97706', opacity: 0.4 }} />}
                      </div>
                      <div style={{ padding: '20px' }}>
                        <p style={{ fontSize: '0.75rem', color: '#d97706', marginBottom: '8px' }}>
                          {new Date(sermon.sermon_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          {sermon.series && ` · ${sermon.series}`}
                        </p>
                        <h3 style={{ fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.4, color: '#f0fdf4', marginBottom: '4px' }}>{sermon.title}</h3>
                        {sermon.scripture_ref && <p style={{ fontSize: '0.78rem', color: '#6b7280' }}>{sermon.scripture_ref}</p>}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <Link to="/sermons" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 600, color: '#86efac', textDecoration: 'none' }}>
                View All Sermons <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ── UPCOMING EVENTS ──────────────────────────────────── */}
      <RevealSection delay={100}>
        <section style={{ ...sectionPad, background: 'rgba(22,101,52,0.04)', borderTop: '1px solid rgba(22,101,52,0.1)', borderBottom: '1px solid rgba(22,101,52,0.1)' }}>
          <div style={center}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#d97706', marginBottom: '10px' }}>Mark Your Calendar</p>
              <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 800, fontFamily: 'Georgia, serif', color: '#f0fdf4', marginBottom: '10px' }}>Upcoming Events</h2>
              <p style={{ color: '#6b7280', maxWidth: '360px', margin: '0 auto' }}>Join us for worship, fellowship, and community</p>
            </div>

            {events.length === 0 ? (
              <div className="glass" style={{ textAlign: 'center', padding: '64px 32px', borderRadius: '20px', maxWidth: '400px', margin: '0 auto' }}>
                <Calendar size={40} style={{ color: '#d97706', opacity: 0.3, margin: '0 auto 12px', display: 'block' }} />
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>No upcoming events. Check back soon!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                {events.map((event, i) => (
                  <motion.div key={event.id}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -4 }}>
                    <Link to={`/events/${event.id}`} className="glass" style={{ display: 'block', borderRadius: '18px', overflow: 'hidden', textDecoration: 'none' }}>
                      <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: 'linear-gradient(135deg,#0a1a0a,#162616)' }}>
                        {event.image_url
                          ? <img src={event.image_url} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <Calendar size={36} style={{ color: '#d97706', opacity: 0.4 }} />}
                        <div style={{ position: 'absolute', top: '12px', left: '12px', padding: '4px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, background: '#d97706', color: '#0d1f0d' }}>
                          {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      <div style={{ padding: '20px' }}>
                        <h3 style={{ fontWeight: 600, fontSize: '0.95rem', color: '#f0fdf4', marginBottom: '4px' }}>{event.title}</h3>
                        {event.location && <p style={{ fontSize: '0.78rem', color: '#6b7280' }}>📍 {event.location}</p>}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <Link to="/events" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 600, color: '#86efac', textDecoration: 'none' }}>
                View All Events <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ── GIVE CTA ─────────────────────────────────────────── */}
      <RevealSection>
        <section style={sectionPad}>
          <div style={{ maxWidth: '560px', margin: '0 auto' }}>
            <div className="glass" style={{ borderRadius: '28px', padding: '56px 40px', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(217,119,6,0.15)', margin: '0 auto 20px' }}>
                <Heart size={28} style={{ color: '#d97706' }} fill="#d97706" />
              </div>
              <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 800, fontFamily: 'Georgia, serif', color: '#f0fdf4', marginBottom: '14px' }}>
                Support the Ministry
              </h2>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.8, color: '#9ca3af', marginBottom: '32px' }}>
                Your generosity fuels the gospel, blesses lives, and builds God's Kingdom in Liberia and beyond.
              </p>
              <Link to="/give" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '14px 32px', borderRadius: '999px', fontWeight: 700,
                background: 'linear-gradient(135deg,#d97706,#f59e0b)', color: '#0d1f0d',
                boxShadow: '0 0 25px rgba(217,119,6,0.3)', textDecoration: 'none',
              }}>
                Give via Mobile Money <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ── PRAYER CTA ───────────────────────────────────────── */}
      <RevealSection>
        <section style={{ ...sectionPad, background: 'rgba(22,101,52,0.04)', borderTop: '1px solid rgba(22,101,52,0.1)' }}>
          <div style={{ maxWidth: '520px', margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#d97706', marginBottom: '10px' }}>We Stand With You</p>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 800, fontFamily: 'Georgia, serif', color: '#f0fdf4', marginBottom: '14px' }}>Need Prayer?</h2>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.8, color: '#9ca3af', marginBottom: '32px' }}>
              Submit your prayer request and our pastoral team will pray with you. You may remain anonymous.
            </p>
            <Link to="/prayer" className="glass" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '14px 32px', borderRadius: '999px', fontWeight: 700,
              color: '#86efac', border: '1px solid rgba(22,101,52,0.5)', textDecoration: 'none',
            }}>
              <Heart size={16} /> Submit a Prayer Request
            </Link>
          </div>
        </section>
      </RevealSection>

      {/* ── VISIT US CTA ─────────────────────────────────────── */}
      <RevealSection>
        <section style={{ ...sectionPad, paddingBottom: '100px' }}>
          <div style={{ maxWidth: '860px', margin: '0 auto' }}>
            <div className="glass" style={{ borderRadius: '28px', padding: '56px 40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '40px', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#d97706', marginBottom: '10px' }}>Come As You Are</p>
                <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, fontFamily: 'Georgia, serif', color: '#f0fdf4', marginBottom: '14px' }}>
                  Visit Fruit of Africa
                </h2>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.8, color: '#9ca3af' }}>
                  We meet in Monrovia, Liberia. Whether you're a first-time visitor or looking for a church home — you are welcome here.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { label: 'Sunday', detail: '9:00 AM & 11:00 AM' },
                  { label: 'Wednesday Bible Study', detail: '6:00 PM' },
                  { label: 'Location', detail: 'Monrovia, Liberia' },
                ].map(({ label, detail }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d97706', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                      <strong style={{ color: '#f0fdf4' }}>{label}</strong> — {detail}
                    </span>
                  </div>
                ))}
                <Link to="/contact" style={{
                  marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '13px 28px', borderRadius: '999px', fontWeight: 700, fontSize: '0.9rem',
                  background: 'linear-gradient(135deg,#d97706,#f59e0b)', color: '#0d1f0d',
                  textDecoration: 'none', boxShadow: '0 0 20px rgba(217,119,6,0.25)',
                }}>
                  <MapPin size={15} /> Get in Touch
                </Link>
              </div>
            </div>
          </div>
        </section>
      </RevealSection>

    </div>
  )
}
