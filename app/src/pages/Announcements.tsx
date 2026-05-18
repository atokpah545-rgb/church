import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Megaphone, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Announcement } from '../types/database'

export function Announcements() {
  const { data: announcements = [], isLoading } = useQuery<Announcement[]>({
    queryKey: ['announcements', 'public'],
    queryFn: async () => {
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
      return (data ?? []) as Announcement[]
    },
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
  })

  return (
    <div style={{ padding: '48px 32px 80px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '52px' }}>
          <Megaphone size={48} style={{ color: '#d97706', margin: '0 auto 16px', display: 'block' }} />
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#d97706', marginBottom: '10px' }}>Stay Informed</p>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, fontFamily: 'Georgia, serif', color: '#f0fdf4', marginBottom: '12px' }}>
            Church Announcements
          </h1>
          <p style={{ color: '#9ca3af', maxWidth: '480px', margin: '0 auto' }}>
            Stay up to date with the latest news and updates from Fruit of Africa Church.
          </p>
        </motion.div>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="glass animate-pulse" style={{ borderRadius: '18px', height: '140px' }} />
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="glass" style={{ textAlign: 'center', padding: '96px 32px', borderRadius: '20px' }}>
            <Megaphone size={56} style={{ color: '#d97706', opacity: 0.3, margin: '0 auto 16px', display: 'block' }} />
            <p style={{ fontWeight: 600, color: '#f0fdf4', marginBottom: '8px' }}>No announcements yet</p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Check back soon for updates from the church.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {announcements.map((a, i) => (
              <motion.div key={a.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}>
                <div className="glass" style={{
                  borderRadius: '18px', padding: '32px',
                  borderLeft: '3px solid #d97706',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '14px', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'Georgia, serif', lineHeight: 1.35 }}>
                      {a.title}
                    </h2>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#6b7280', whiteSpace: 'nowrap', flexShrink: 0, marginTop: '2px' }}>
                      <Clock size={11} style={{ color: '#d97706' }} />
                      {new Date(a.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.85, color: '#9ca3af' }}>{a.content}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
