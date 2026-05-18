import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Play, Search, BookOpen, Filter } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Sermon } from '../types/database'

export function Sermons() {
  const [search, setSearch] = useState('')
  const [selectedSeries, setSelectedSeries] = useState('all')

  const { data: sermons = [], isLoading } = useQuery<Sermon[]>({
    queryKey: ['sermons', 'all'],
    queryFn: async () => {
      const { data } = await supabase
        .from('sermons')
        .select('*, pastor:profiles(full_name)')
        .eq('is_published', true)
        .order('sermon_date', { ascending: false })
      return (data ?? []) as Sermon[]
    },
    refetchOnWindowFocus: true,
    refetchInterval: 60000,
  })

  const series = ['all', ...Array.from(new Set(sermons.map(s => s.series).filter(Boolean) as string[]))]

  const filtered = sermons.filter(s => {
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description?.toLowerCase().includes(search.toLowerCase()) ||
      s.scripture_ref?.toLowerCase().includes(search.toLowerCase())
    const matchSeries = selectedSeries === 'all' || s.series === selectedSeries
    return matchSearch && matchSeries
  })

  const inputStyle: React.CSSProperties = {
    background: 'rgba(22,101,52,0.1)', border: '1px solid rgba(217,119,6,0.2)',
    color: '#f0fdf4', borderRadius: '12px', outline: 'none', fontSize: '0.875rem',
    padding: '12px 16px', width: '100%',
  }

  return (
    <div style={{ padding: '48px 32px 80px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#d97706', marginBottom: '10px' }}>Hear the Word</p>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, fontFamily: 'Georgia, serif', color: '#f0fdf4', marginBottom: '12px' }}>
            Sermons &amp; Messages
          </h1>
          <p style={{ color: '#9ca3af' }}>Spirit-filled messages from Pastor Prince Bawoh</p>
        </motion.div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '40px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search sermons, scriptures..."
              style={{ ...inputStyle, paddingLeft: '40px' }}
            />
          </div>
          {series.length > 1 && (
            <div style={{ position: 'relative' }}>
              <Filter size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
              <select value={selectedSeries} onChange={e => setSelectedSeries(e.target.value)}
                style={{ ...inputStyle, width: 'auto', paddingLeft: '36px', paddingRight: '32px', appearance: 'none' }}>
                {series.map(s => <option key={s} value={s} style={{ background: '#0d1f0d' }}>{s === 'all' ? 'All Series' : s}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="glass animate-pulse" style={{ borderRadius: '18px', overflow: 'hidden' }}>
                <div style={{ aspectRatio: '16/9', background: 'rgba(22,101,52,0.2)' }} />
                <div style={{ padding: '20px' }}>
                  <div style={{ height: '12px', borderRadius: '6px', background: 'rgba(217,119,6,0.2)', width: '40%', marginBottom: '10px' }} />
                  <div style={{ height: '18px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', width: '80%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass" style={{ textAlign: 'center', padding: '96px 32px', borderRadius: '20px' }}>
            <BookOpen size={56} style={{ color: '#d97706', opacity: 0.3, margin: '0 auto 16px', display: 'block' }} />
            <p style={{ fontWeight: 600, color: '#f0fdf4', marginBottom: '8px' }}>No sermons found</p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {search ? 'Try a different search term.' : 'Sermons will appear here after services.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {filtered.map((sermon, i) => (
              <motion.div key={sermon.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} whileHover={{ y: -6 }}>
                <Link to={`/sermons/${sermon.id}`} className="glass"
                  style={{ display: 'block', borderRadius: '18px', overflow: 'hidden', height: '100%', textDecoration: 'none' }}>
                  <div style={{ aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: 'linear-gradient(135deg,#0a1a0a,#162616)' }}>
                    {sermon.thumbnail_url
                      ? <img src={sermon.thumbnail_url} alt={sermon.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <BookOpen size={40} style={{ color: '#d97706', opacity: 0.4 }} />}
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', opacity: 0, transition: 'opacity 0.3s' }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Play size={20} fill="white" style={{ color: '#fff' }} />
                      </div>
                    </div>
                    {sermon.series && (
                      <div style={{ position: 'absolute', bottom: '8px', left: '8px', padding: '2px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(217,119,6,0.85)', color: '#0d1f0d' }}>
                        {sermon.series}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <p style={{ fontSize: '0.75rem', color: '#d97706' }}>
                      {new Date(sermon.sermon_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      {sermon.duration_mins && ` · ${sermon.duration_mins} min`}
                    </p>
                    <h3 style={{ fontWeight: 600, lineHeight: 1.4, color: '#f0fdf4', fontSize: '0.95rem' }}>{sermon.title}</h3>
                    {sermon.scripture_ref && <p style={{ fontSize: '0.78rem', color: '#6b7280' }}>📖 {sermon.scripture_ref}</p>}
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
