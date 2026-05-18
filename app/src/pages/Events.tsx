import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Calendar, MapPin } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { ChurchEvent } from '../types/database'

export function Events() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')

  const { data: events = [], isLoading } = useQuery<ChurchEvent[]>({
    queryKey: ['events', 'all'],
    queryFn: async () => {
      const { data } = await supabase.from('events').select('*').eq('is_published', true).order('event_date', { ascending: false })
      return (data ?? []) as ChurchEvent[]
    },
    refetchOnWindowFocus: true,
    refetchInterval: 60000,
  })

  const now = new Date().toISOString()
  const displayed = events.filter(e => tab === 'upcoming' ? e.event_date >= now : e.event_date < now)

  return (
    <div style={{ padding: '48px 32px 80px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#d97706', marginBottom: '10px' }}>What's Happening</p>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, fontFamily: 'Georgia, serif', color: '#f0fdf4', marginBottom: '12px' }}>
            Church Events
          </h1>
          <p style={{ color: '#9ca3af' }}>Join us for worship, fellowship, and community activities</p>
        </motion.div>

        {/* Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '40px' }}>
          {(['upcoming', 'past'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                padding: '10px 28px', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 600,
                cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.2s',
                background: tab === t ? 'linear-gradient(135deg,#d97706,#f59e0b)' : 'rgba(22,101,52,0.1)',
                color: tab === t ? '#0d1f0d' : '#86efac',
                border: tab !== t ? '1px solid rgba(217,119,6,0.2)' : 'none',
              }}>
              {t} Events
            </button>
          ))}
        </div>

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="glass animate-pulse" style={{ borderRadius: '18px', height: '280px' }} />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="glass" style={{ textAlign: 'center', padding: '96px 32px', borderRadius: '20px' }}>
            <Calendar size={56} style={{ color: '#d97706', opacity: 0.3, margin: '0 auto 16px', display: 'block' }} />
            <p style={{ fontWeight: 600, color: '#f0fdf4', marginBottom: '8px' }}>No {tab} events</p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {tab === 'upcoming' ? 'Check back soon for new events.' : 'Past events will appear here.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {displayed.map((event, i) => (
              <motion.div key={event.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} whileHover={{ y: -6 }}>
                <Link to={`/events/${event.id}`} className="glass"
                  style={{ display: 'block', borderRadius: '18px', overflow: 'hidden', height: '100%', textDecoration: 'none' }}>
                  <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: 'linear-gradient(135deg,#0a1a0a,#162616)' }}>
                    {event.image_url
                      ? <img src={event.image_url} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <Calendar size={40} style={{ color: '#d97706', opacity: 0.4 }} />}
                    <div style={{ position: 'absolute', top: '12px', left: '12px', padding: '6px 12px', borderRadius: '10px', fontWeight: 700, background: '#d97706', color: '#0d1f0d', textAlign: 'center', minWidth: '48px' }}>
                      <div style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>{new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}</div>
                      <div style={{ fontSize: '1.2rem', lineHeight: 1 }}>{new Date(event.event_date).getDate()}</div>
                    </div>
                    {event.is_featured && (
                      <div style={{ position: 'absolute', top: '12px', right: '12px', padding: '3px 10px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, background: 'rgba(22,101,52,0.85)', color: '#86efac' }}>
                        Featured
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '20px' }}>
                    <h3 style={{ fontWeight: 600, fontSize: '0.95rem', color: '#f0fdf4', marginBottom: '8px' }}>{event.title}</h3>
                    {event.description && <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{event.description}</p>}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.78rem', color: '#6b7280' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} style={{ color: '#d97706' }} />
                        {new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        {' '}{new Date(event.event_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {event.location && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} style={{ color: '#d97706' }} /> {event.location}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
