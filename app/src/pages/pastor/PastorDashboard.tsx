import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { BookOpen, Heart, Eye, EyeOff, Trash2, Plus, Mic } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { Sermon, PrayerRequest } from '../../types/database'

const tabs = [
  { id: 'sermons', label: 'My Sermons', icon: BookOpen },
  { id: 'prayers', label: 'Prayer Requests', icon: Heart },
] as const
type Tab = typeof tabs[number]['id']

const inputCls = "w-full px-4 py-3 rounded-xl outline-none text-sm"
const inputStyle = { background: 'rgba(22,101,52,0.1)', border: '1px solid rgba(217,119,6,0.2)', color: '#f0fdf4' }

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.75rem', marginBottom: '6px', color: '#9ca3af', fontWeight: 500,
}
const saveBtn: React.CSSProperties = {
  padding: '10px 22px', borderRadius: '12px', fontSize: '0.875rem', fontWeight: 600,
  background: 'linear-gradient(135deg,#d97706,#f59e0b)', color: '#0d1f0d', border: 'none', cursor: 'pointer',
}
const cancelBtn: React.CSSProperties = {
  padding: '10px 18px', borderRadius: '12px', fontSize: '0.875rem', fontWeight: 500,
  background: 'rgba(107,114,128,0.1)', border: '1px solid rgba(107,114,128,0.2)', color: '#9ca3af', cursor: 'pointer',
}
const iconBtn = (color: string): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '8px', borderRadius: '10px', border: 'none', cursor: 'pointer',
  background: 'rgba(22,101,52,0.08)', color, transition: 'background 0.15s',
})

export function PastorDashboard() {
  const [tab, setTab] = useState<Tab>('sermons')
  const { profile } = useAuth()
  const qc = useQueryClient()

  const { data: sermons = [] } = useQuery<Sermon[]>({
    queryKey: ['pastor-sermons', profile?.id],
    queryFn: async () => {
      const { data } = await supabase.from('sermons')
        .select('*')
        .eq('pastor_id', profile!.id)
        .order('sermon_date', { ascending: false })
      return (data ?? []) as Sermon[]
    },
    enabled: !!profile,
    refetchInterval: 30000,
  })

  const { data: prayers = [] } = useQuery<PrayerRequest[]>({
    queryKey: ['pastor-prayers'],
    queryFn: async () => {
      const { data } = await supabase.from('prayer_requests').select('*').order('created_at', { ascending: false })
      return (data ?? []) as PrayerRequest[]
    },
    refetchInterval: 20000,
  })

  const togglePublish = useMutation({
    mutationFn: async ({ id, current }: { id: string; current: boolean }) => {
      await supabase.from('sermons').update({ is_published: !current } as never).eq('id', id).eq('pastor_id', profile!.id)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pastor-sermons', profile?.id] }),
  })

  const deleteSermon = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('sermons').delete().eq('id', id).eq('pastor_id', profile!.id)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pastor-sermons', profile?.id] }),
  })

  const updatePrayerStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await supabase.from('prayer_requests').update({ status } as never).eq('id', id)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pastor-prayers'] }),
  })

  return (
    <div style={{ padding: '40px 32px 80px' }}>
      <div style={{ maxWidth: '1024px', margin: '0 auto' }}>

        {/* ── HEADER ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem', fontWeight: 800,
              background: 'linear-gradient(135deg,#166534,#d97706)', color: '#fff',
            }}>
              {profile?.full_name?.[0]?.toUpperCase() ?? 'P'}
            </div>
            <div>
              <h1 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, color: '#f0fdf4', fontFamily: 'Georgia, serif', lineHeight: 1.2 }}>
                Pastor Dashboard
              </h1>
              <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '2px' }}>
                Welcome, {profile?.full_name}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── TABS ── */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '11px 22px', borderRadius: '14px', fontSize: '0.9rem', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
                background: tab === id ? 'linear-gradient(135deg,#d97706,#f59e0b)' : 'rgba(22,101,52,0.1)',
                color: tab === id ? '#0d1f0d' : '#9ca3af',
                border: tab === id ? 'none' : '1px solid rgba(217,119,6,0.2)',
              }}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {/* ── CONTENT ── */}
        {tab === 'sermons' && (
          <PastorSermons
            sermons={sermons}
            pastorId={profile?.id ?? ''}
            onToggle={(id, cur) => togglePublish.mutate({ id, current: cur })}
            onDelete={id => { if (confirm('Delete this sermon?')) deleteSermon.mutate(id) }}
            onRefresh={() => qc.invalidateQueries({ queryKey: ['pastor-sermons', profile?.id] })}
          />
        )}
        {tab === 'prayers' && (
          <PastorPrayers prayers={prayers} onStatus={(id, status) => updatePrayerStatus.mutate({ id, status })} />
        )}
      </div>
    </div>
  )
}

// ── PASTOR SERMONS ────────────────────────────────────────
function PastorSermons({ sermons, pastorId, onToggle, onDelete, onRefresh }: {
  sermons: Sermon[]
  pastorId: string
  onToggle: (id: string, current: boolean) => void
  onDelete: (id: string) => void
  onRefresh: () => void
}) {
  const [showForm, setShowForm] = useState(false)
  const { register, handleSubmit, reset } = useForm<Partial<Sermon>>({
    defaultValues: { is_published: false, sermon_date: new Date().toISOString().split('T')[0] },
  })

  const addSermon = useMutation({
    mutationFn: async (data: Partial<Sermon>) => {
      await supabase.from('sermons').insert({ ...data, pastor_id: pastorId } as never)
    },
    onSuccess: () => { reset(); setShowForm(false); onRefresh() },
  })

  return (
    <div>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'Georgia, serif' }}>
          My Sermons ({sermons.length})
        </h2>
        <button onClick={() => setShowForm(!showForm)} style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '10px 22px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600,
          background: 'linear-gradient(135deg,#d97706,#f59e0b)', color: '#0d1f0d', border: 'none', cursor: 'pointer',
        }}>
          <Plus size={16} /> Upload Sermon
        </button>
      </div>

      {/* Upload form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass" style={{ borderRadius: '20px', padding: '28px', marginBottom: '24px' }}>
          <form onSubmit={handleSubmit(d => addSermon.mutate(d))}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>

            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Title *</label>
              <input {...register('title', { required: true })} className={inputCls} style={inputStyle} placeholder="Sermon title" />
            </div>
            <div>
              <label style={labelStyle}>Date</label>
              <input type="date" {...register('sermon_date')} className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Series</label>
              <input {...register('series')} className={inputCls} style={inputStyle} placeholder="Series name" />
            </div>
            <div>
              <label style={labelStyle}>Scripture Reference</label>
              <input {...register('scripture_ref')} className={inputCls} style={inputStyle} placeholder="John 3:16" />
            </div>
            <div>
              <label style={labelStyle}>Duration (minutes)</label>
              <input type="number" {...register('duration_mins', { valueAsNumber: true })} className={inputCls} style={inputStyle} placeholder="45" />
            </div>

            <div style={{ gridColumn: '1/-1' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#d97706', marginBottom: '12px' }}>
                Media — YouTube link OR file URL
              </p>
            </div>
            <div>
              <label style={labelStyle}>YouTube URL</label>
              <input {...register('youtube_url')} className={inputCls} style={inputStyle} placeholder="https://youtube.com/watch?v=..." />
            </div>
            <div>
              <label style={labelStyle}>Audio File URL</label>
              <input {...register('audio_url')} className={inputCls} style={inputStyle} placeholder="From Supabase Storage..." />
            </div>
            <div>
              <label style={labelStyle}>Thumbnail URL</label>
              <input {...register('thumbnail_url')} className={inputCls} style={inputStyle} placeholder="https://..." />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Description</label>
              <textarea {...register('description')} rows={3} className={inputCls} style={{ ...inputStyle, resize: 'none' }} />
            </div>

            <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: '#9ca3af', cursor: 'pointer' }}>
                <input type="checkbox" {...register('is_published')} /> Publish immediately
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setShowForm(false)} style={cancelBtn}>Cancel</button>
                <button type="submit" disabled={addSermon.isPending} style={saveBtn}>
                  {addSermon.isPending ? 'Saving...' : 'Save Sermon'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      )}

      {/* Sermon list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {sermons.map(s => (
          <div key={s.id} className="glass" style={{ borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(217,119,6,0.12)',
              }}>
                <Mic size={18} style={{ color: '#d97706' }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#f0fdf4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px' }}>
                  {new Date(s.sermon_date).toLocaleDateString()}{s.series ? ` · ${s.series}` : ''}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <span style={{
                padding: '3px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700,
                background: s.is_published ? 'rgba(134,239,172,0.12)' : 'rgba(107,114,128,0.15)',
                color: s.is_published ? '#86efac' : '#6b7280',
                border: s.is_published ? '1px solid rgba(134,239,172,0.25)' : '1px solid transparent',
              }}>
                {s.is_published ? 'Live' : 'Draft'}
              </span>
              <button onClick={() => onToggle(s.id, s.is_published)} style={iconBtn('#d97706')} title={s.is_published ? 'Unpublish' : 'Publish'}>
                {s.is_published ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
              <button onClick={() => onDelete(s.id)} style={iconBtn('#fca5a5')} title="Delete">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}

        {sermons.length === 0 && (
          <div className="glass" style={{ borderRadius: '20px', padding: '60px 40px', textAlign: 'center' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(217,119,6,0.1)',
            }}>
              <Mic size={28} style={{ color: '#d97706', opacity: 0.5 }} />
            </div>
            <p style={{ fontSize: '0.95rem', color: '#6b7280' }}>No sermons yet. Upload your first message!</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── PASTOR PRAYERS ────────────────────────────────────────
function PastorPrayers({ prayers, onStatus }: { prayers: PrayerRequest[]; onStatus: (id: string, status: string) => void }) {
  const statusColors = { pending: '#6b7280', praying: '#d97706', answered: '#86efac' }

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'Georgia, serif', marginBottom: '24px' }}>
        Prayer Requests ({prayers.length})
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {prayers.map(p => (
          <div key={p.id} className="glass" style={{ borderRadius: '18px', padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#f0fdf4' }}>
                {p.is_anonymous ? 'Anonymous' : p.name}
              </span>
              <span style={{ fontSize: '0.78rem', color: '#4b5563' }}>
                {new Date(p.created_at).toLocaleDateString()}
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.75, color: '#9ca3af', marginBottom: '16px' }}>{p.request}</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(['pending', 'praying', 'answered'] as const).map(s => (
                <button key={s} onClick={() => onStatus(p.id, s)} style={{
                  padding: '6px 16px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600,
                  textTransform: 'capitalize', cursor: 'pointer',
                  background: p.status === s ? `${statusColors[s]}22` : 'rgba(22,101,52,0.05)',
                  color: p.status === s ? statusColors[s] : '#6b7280',
                  border: p.status === s ? `1px solid ${statusColors[s]}50` : '1px solid rgba(107,114,128,0.15)',
                  transition: 'all 0.15s',
                }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ))}

        {prayers.length === 0 && (
          <div className="glass" style={{ borderRadius: '20px', padding: '60px 40px', textAlign: 'center' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(217,119,6,0.1)',
            }}>
              <Heart size={28} style={{ color: '#d97706', opacity: 0.5 }} />
            </div>
            <p style={{ fontSize: '0.95rem', color: '#6b7280' }}>No prayer requests yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
