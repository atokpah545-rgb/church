import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import {
  LayoutDashboard, Users, BookOpen, Calendar, Heart, Image,
  Phone, Trash2, Plus, Eye, EyeOff, Megaphone
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Profile, Sermon, ChurchEvent, PrayerRequest, DonationInfo, GalleryItem, Announcement } from '../../types/database'

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'sermons', label: 'Sermons', icon: BookOpen },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'prayers', label: 'Prayers', icon: Heart },
  { id: 'giving', label: 'Giving Info', icon: Phone },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'gallery', label: 'Gallery', icon: Image },
] as const
type Tab = typeof tabs[number]['id']

const inputCls = "w-full px-4 py-3 rounded-xl outline-none text-sm"
const inputStyle = { background: 'rgba(22,101,52,0.1)', border: '1px solid rgba(217,119,6,0.2)', color: '#f0fdf4' }

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('overview')
  const qc = useQueryClient()

  // ── DATA ─────────────────────────────────────────────────
  const { data: members = [] } = useQuery<Profile[]>({
    queryKey: ['admin-members'],
    queryFn: async () => { const { data } = await supabase.from('profiles').select('*').order('joined_at', { ascending: false }); return data ?? [] },
    refetchInterval: 30000,
  })
  const { data: sermons = [] } = useQuery<Sermon[]>({
    queryKey: ['admin-sermons'],
    queryFn: async () => { const { data } = await supabase.from('sermons').select('*, pastor:profiles(full_name)').order('sermon_date', { ascending: false }); return (data ?? []) as Sermon[] },
    refetchInterval: 30000,
  })
  const { data: events = [] } = useQuery<ChurchEvent[]>({
    queryKey: ['admin-events'],
    queryFn: async () => { const { data } = await supabase.from('events').select('*').order('event_date', { ascending: false }); return (data ?? []) as ChurchEvent[] },
    refetchInterval: 30000,
  })
  const { data: prayers = [] } = useQuery<PrayerRequest[]>({
    queryKey: ['admin-prayers'],
    queryFn: async () => { const { data } = await supabase.from('prayer_requests').select('*').order('created_at', { ascending: false }); return (data ?? []) as PrayerRequest[] },
    refetchInterval: 20000,
  })
  const { data: donationInfo = [] } = useQuery<DonationInfo[]>({
    queryKey: ['admin-donation-info'],
    queryFn: async () => { const { data } = await supabase.from('donation_info').select('*').order('created_at'); return (data ?? []) as DonationInfo[] },
  })
  const { data: announcements = [] } = useQuery<Announcement[]>({
    queryKey: ['admin-announcements'],
    queryFn: async () => { const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false }); return (data ?? []) as Announcement[] },
    refetchInterval: 30000,
  })
  const { data: gallery = [] } = useQuery<GalleryItem[]>({
    queryKey: ['admin-gallery'],
    queryFn: async () => { const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false }); return (data ?? []) as GalleryItem[] },
  })

  // ── MUTATIONS ─────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: async ({ table, id }: { table: string; id: string }) => {
      await supabase.from(table as never).delete().eq('id', id)
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [`admin-${vars.table}`] })
    },
  })

  const togglePublish = useMutation({
    mutationFn: async ({ table, id, current }: { table: string; id: string; current: boolean }) => {
      await supabase.from(table as never).update({ is_published: !current } as never).eq('id', id)
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: [`admin-${vars.table}`] }),
  })

  const updatePrayerStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await supabase.from('prayer_requests').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-prayers'] }),
  })

  const updateMemberRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      await supabase.from('profiles').update({ role }).eq('id', id)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-members'] }),
  })

  const stats = [
    { label: 'Members', value: members.length, color: '#86efac' },
    { label: 'Sermons', value: sermons.length, color: '#d97706' },
    { label: 'Events', value: events.length, color: '#60a5fa' },
    { label: 'Prayer Requests', value: prayers.length, color: '#f472b6' },
  ]

  return (
    <div style={{ padding: '48px 32px 80px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: '#f0fdf4', fontFamily: 'Georgia, serif' }}>Admin Dashboard</h1>
          <p className="text-sm" style={{ color: '#6b7280' }}>Fruit of Africa Church Management</p>
        </motion.div>

        <style>{`
          .admin-mobile-tabs { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 24px; }
          .admin-layout { display: block; }
          .admin-sidebar { display: none; }
          @media (min-width: 1024px) {
            .admin-mobile-tabs { display: none; }
            .admin-layout { display: flex; gap: 24px; align-items: flex-start; }
            .admin-sidebar { display: flex; flex-direction: column; gap: 4px; width: 208px; flex-shrink: 0; }
          }
        `}</style>

        {/* Mobile tabs — above content */}
        <div className="admin-mobile-tabs">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '10px', fontSize: '0.78rem', whiteSpace: 'nowrap', flexShrink: 0,
                background: tab === id ? 'rgba(217,119,6,0.15)' : 'rgba(22,101,52,0.1)',
                color: tab === id ? '#fbbf24' : '#6b7280',
                border: 'none', cursor: 'pointer',
              }}>
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>

        <div className="admin-layout">
          {/* Desktop sidebar */}
          <div className="admin-sidebar">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 16px', borderRadius: '12px', fontSize: '0.875rem', fontWeight: 500, textAlign: 'left',
                  background: tab === id ? 'rgba(217,119,6,0.15)' : 'transparent',
                  color: tab === id ? '#fbbf24' : '#6b7280',
                  border: tab === id ? '1px solid rgba(217,119,6,0.25)' : '1px solid transparent',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {tab === 'overview' && (
              <div>
                {/* Stats grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                  {stats.map(s => (
                    <div key={s.label} className="glass" style={{ borderRadius: '20px', padding: '28px 20px', textAlign: 'center' }}>
                      <div style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '6px', color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                {/* Recent items grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                  <div className="glass" style={{ borderRadius: '20px', padding: '28px' }}>
                    <h3 style={{ fontWeight: 600, marginBottom: '16px', fontSize: '0.875rem', color: '#fbbf24' }}>Recent Prayer Requests</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {prayers.slice(0, 5).map(p => (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', fontSize: '0.75rem', padding: '8px', borderRadius: '8px', background: 'rgba(22,101,52,0.08)' }}>
                          <p style={{ color: '#9ca3af', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name ?? 'Anonymous'}: {p.request}</p>
                          <span style={{ flexShrink: 0, textTransform: 'capitalize', color: p.status === 'answered' ? '#86efac' : p.status === 'praying' ? '#d97706' : '#6b7280' }}>{p.status}</span>
                        </div>
                      ))}
                      {prayers.length === 0 && <p style={{ color: '#6b7280', fontSize: '0.8rem' }}>No requests yet.</p>}
                    </div>
                  </div>
                  <div className="glass" style={{ borderRadius: '20px', padding: '28px' }}>
                    <h3 style={{ fontWeight: 600, marginBottom: '16px', fontSize: '0.875rem', color: '#fbbf24' }}>Upcoming Events</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {events.filter(e => e.event_date >= new Date().toISOString()).slice(0, 5).map(e => (
                        <div key={e.id} style={{ fontSize: '0.75rem', padding: '8px', borderRadius: '8px', background: 'rgba(22,101,52,0.08)', color: '#9ca3af' }}>
                          <span style={{ color: '#d97706' }}>{new Date(e.event_date).toLocaleDateString()}</span> — {e.title}
                        </div>
                      ))}
                      {events.length === 0 && <p style={{ color: '#6b7280', fontSize: '0.8rem' }}>No upcoming events.</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === 'sermons' && <AdminSermons sermons={sermons} togglePublish={(id, cur) => togglePublish.mutate({ table: 'sermons', id, current: cur })} onDelete={id => deleteMutation.mutate({ table: 'sermons', id })} onRefresh={() => qc.invalidateQueries({ queryKey: ['admin-sermons'] })} />}
            {tab === 'events' && <AdminEvents events={events} togglePublish={(id, cur) => togglePublish.mutate({ table: 'events', id, current: cur })} onDelete={id => deleteMutation.mutate({ table: 'events', id })} onRefresh={() => qc.invalidateQueries({ queryKey: ['admin-events'] })} />}
            {tab === 'members' && <AdminMembers members={members} onRoleChange={(id, role) => updateMemberRole.mutate({ id, role })} />}
            {tab === 'prayers' && <AdminPrayers prayers={prayers} onStatus={(id, status) => updatePrayerStatus.mutate({ id, status })} onDelete={id => deleteMutation.mutate({ table: 'prayer_requests', id })} />}
            {tab === 'giving' && <AdminGiving donationInfo={donationInfo} onRefresh={() => qc.invalidateQueries({ queryKey: ['admin-donation-info'] })} onDelete={id => deleteMutation.mutate({ table: 'donation_info', id })} />}
            {tab === 'announcements' && <AdminAnnouncements announcements={announcements} togglePublish={(id, cur) => togglePublish.mutate({ table: 'announcements', id, current: cur })} onDelete={id => deleteMutation.mutate({ table: 'announcements', id })} onRefresh={() => qc.invalidateQueries({ queryKey: ['admin-announcements'] })} />}
            {tab === 'gallery' && <AdminGallery gallery={gallery} onDelete={id => deleteMutation.mutate({ table: 'gallery', id })} onRefresh={() => qc.invalidateQueries({ queryKey: ['admin-gallery'] })} />}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── SHARED STYLES ────────────────────────────────────────
const sectionHeader: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  flexWrap: 'wrap', gap: '12px', marginBottom: '24px',
}
const sectionTitle: React.CSSProperties = {
  fontSize: '1.25rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'Georgia, serif',
}
const addBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '8px',
  padding: '10px 20px', borderRadius: '12px', fontSize: '0.875rem', fontWeight: 600,
  background: 'linear-gradient(135deg,#d97706,#f59e0b)', color: '#0d1f0d',
  border: 'none', cursor: 'pointer',
}
const cancelBtn: React.CSSProperties = {
  padding: '10px 18px', borderRadius: '12px', fontSize: '0.875rem', fontWeight: 500,
  background: 'rgba(107,114,128,0.1)', border: '1px solid rgba(107,114,128,0.2)',
  color: '#9ca3af', cursor: 'pointer',
}
const saveBtn: React.CSSProperties = {
  padding: '10px 20px', borderRadius: '12px', fontSize: '0.875rem', fontWeight: 600,
  background: 'linear-gradient(135deg,#d97706,#f59e0b)', color: '#0d1f0d',
  border: 'none', cursor: 'pointer',
}
const formGrid: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px',
}
const fieldFull: React.CSSProperties = { gridColumn: '1 / -1' }
const formRow: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  flexWrap: 'wrap', gap: '12px', gridColumn: '1 / -1',
}
const itemRow: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  gap: '16px', padding: '16px 20px', borderRadius: '14px',
}
const itemActions: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0,
}
const iconBtn = (color: string): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '8px', borderRadius: '10px', border: 'none', cursor: 'pointer',
  background: 'rgba(22,101,52,0.08)', color, transition: 'background 0.15s',
})
const badge = (pub: boolean): React.CSSProperties => ({
  padding: '3px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700,
  background: pub ? 'rgba(134,239,172,0.12)' : 'rgba(107,114,128,0.15)',
  color: pub ? '#86efac' : '#6b7280',
  border: pub ? '1px solid rgba(134,239,172,0.25)' : '1px solid transparent',
})
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.75rem', marginBottom: '6px', color: '#9ca3af', fontWeight: 500,
}

// ── ADMIN SERMONS ────────────────────────────────────────
function AdminSermons({ sermons, togglePublish, onDelete, onRefresh }: {
  sermons: Sermon[]
  togglePublish: (id: string, current: boolean) => void
  onDelete: (id: string) => void
  onRefresh: () => void
}) {
  const [showForm, setShowForm] = useState(false)
  const { register, handleSubmit, reset } = useForm<Partial<Sermon>>({
    defaultValues: { is_published: false, sermon_date: new Date().toISOString().split('T')[0] },
  })

  const addSermon = useMutation({
    mutationFn: async (data: Partial<Sermon>) => {
      await supabase.from('sermons').insert({ ...data } as never)
    },
    onSuccess: () => { reset(); setShowForm(false); onRefresh() },
  })

  return (
    <div>
      <div style={sectionHeader}>
        <h2 style={sectionTitle}>Sermons ({sermons.length})</h2>
        <button onClick={() => setShowForm(!showForm)} style={addBtn}>
          <Plus size={16} /> Add Sermon
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass" style={{ borderRadius: '20px', padding: '28px', marginBottom: '24px' }}>
          <form onSubmit={handleSubmit(d => addSermon.mutate(d))} style={formGrid}>
            <div style={fieldFull}>
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
              <input {...register('scripture_ref')} className={inputCls} style={inputStyle} placeholder="e.g. John 3:16" />
            </div>
            <div>
              <label style={labelStyle}>YouTube URL</label>
              <input {...register('youtube_url')} className={inputCls} style={inputStyle} placeholder="https://youtube.com/watch?v=..." />
            </div>
            <div>
              <label style={labelStyle}>Audio URL</label>
              <input {...register('audio_url')} className={inputCls} style={inputStyle} placeholder="https://..." />
            </div>
            <div>
              <label style={labelStyle}>Thumbnail URL</label>
              <input {...register('thumbnail_url')} className={inputCls} style={inputStyle} placeholder="https://..." />
            </div>
            <div style={fieldFull}>
              <label style={labelStyle}>Description</label>
              <textarea {...register('description')} rows={3} className={inputCls} style={{ ...inputStyle, resize: 'none' }} />
            </div>
            <div style={formRow}>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {sermons.map(s => (
          <div key={s.id} className="glass" style={itemRow}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#f0fdf4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '3px' }}>
                {new Date(s.sermon_date).toLocaleDateString()}{s.series ? ` · ${s.series}` : ''}
              </div>
            </div>
            <div style={itemActions}>
              <span style={badge(s.is_published)}>{s.is_published ? 'Live' : 'Draft'}</span>
              <button onClick={() => togglePublish(s.id, s.is_published)} style={iconBtn('#d97706')} title={s.is_published ? 'Unpublish' : 'Publish'}>
                {s.is_published ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
              <button onClick={() => { if (confirm('Delete this sermon?')) onDelete(s.id) }} style={iconBtn('#fca5a5')} title="Delete">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
        {sermons.length === 0 && <p style={{ textAlign: 'center', padding: '40px 0', fontSize: '0.9rem', color: '#6b7280' }}>No sermons yet. Add your first one!</p>}
      </div>
    </div>
  )
}

// ── ADMIN EVENTS ─────────────────────────────────────────
function AdminEvents({ events, togglePublish, onDelete, onRefresh }: {
  events: ChurchEvent[]
  togglePublish: (id: string, current: boolean) => void
  onDelete: (id: string) => void
  onRefresh: () => void
}) {
  const [showForm, setShowForm] = useState(false)
  const { register, handleSubmit, reset } = useForm<Partial<ChurchEvent>>({
    defaultValues: { is_published: true, is_featured: false },
  })

  const addEvent = useMutation({
    mutationFn: async (data: Partial<ChurchEvent>) => {
      await supabase.from('events').insert({ ...data } as never)
    },
    onSuccess: () => { reset(); setShowForm(false); onRefresh() },
  })

  return (
    <div>
      <div style={sectionHeader}>
        <h2 style={sectionTitle}>Events ({events.length})</h2>
        <button onClick={() => setShowForm(!showForm)} style={addBtn}>
          <Plus size={16} /> Add Event
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass" style={{ borderRadius: '20px', padding: '28px', marginBottom: '24px' }}>
          <form onSubmit={handleSubmit(d => addEvent.mutate(d))} style={formGrid}>
            <div style={fieldFull}>
              <label style={labelStyle}>Title *</label>
              <input {...register('title', { required: true })} className={inputCls} style={inputStyle} placeholder="Event title" />
            </div>
            <div>
              <label style={labelStyle}>Date &amp; Time *</label>
              <input type="datetime-local" {...register('event_date', { required: true })} className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>End Date &amp; Time</label>
              <input type="datetime-local" {...register('end_date')} className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Location</label>
              <input {...register('location')} className={inputCls} style={inputStyle} placeholder="Church hall, Monrovia..." />
            </div>
            <div>
              <label style={labelStyle}>Image URL</label>
              <input {...register('image_url')} className={inputCls} style={inputStyle} placeholder="https://..." />
            </div>
            <div style={fieldFull}>
              <label style={labelStyle}>Description</label>
              <textarea {...register('description')} rows={3} className={inputCls} style={{ ...inputStyle, resize: 'none' }} />
            </div>
            <div style={formRow}>
              <div style={{ display: 'flex', gap: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: '#9ca3af', cursor: 'pointer' }}>
                  <input type="checkbox" {...register('is_published')} /> Published
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: '#9ca3af', cursor: 'pointer' }}>
                  <input type="checkbox" {...register('is_featured')} /> Featured
                </label>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setShowForm(false)} style={cancelBtn}>Cancel</button>
                <button type="submit" disabled={addEvent.isPending} style={saveBtn}>
                  {addEvent.isPending ? 'Saving...' : 'Save Event'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {events.map(e => (
          <div key={e.id} className="glass" style={itemRow}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#f0fdf4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '3px' }}>
                {new Date(e.event_date).toLocaleString()}{e.location ? ` · ${e.location}` : ''}
              </div>
            </div>
            <div style={itemActions}>
              <span style={badge(e.is_published)}>{e.is_published ? 'Live' : 'Hidden'}</span>
              <button onClick={() => togglePublish(e.id, e.is_published)} style={iconBtn('#d97706')} title={e.is_published ? 'Hide' : 'Publish'}>
                {e.is_published ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
              <button onClick={() => { if (confirm('Delete this event?')) onDelete(e.id) }} style={iconBtn('#fca5a5')} title="Delete">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
        {events.length === 0 && <p style={{ textAlign: 'center', padding: '40px 0', fontSize: '0.9rem', color: '#6b7280' }}>No events yet.</p>}
      </div>
    </div>
  )
}

// ── ADMIN MEMBERS ────────────────────────────────────────
function AdminMembers({ members, onRoleChange }: { members: Profile[]; onRoleChange: (id: string, role: string) => void }) {
  return (
    <div>
      <h2 style={{ ...sectionTitle, marginBottom: '24px' }}>Members ({members.length})</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {members.map(m => (
          <div key={m.id} className="glass" style={itemRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', fontWeight: 700,
                background: 'linear-gradient(135deg,#166534,#d97706)', color: '#fff',
              }}>
                {m.full_name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#f0fdf4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.full_name}</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.email}</div>
              </div>
            </div>
            <select
              value={m.role}
              onChange={e => onRoleChange(m.id, e.target.value)}
              style={{ padding: '8px 14px', borderRadius: '10px', fontSize: '0.875rem', outline: 'none', cursor: 'pointer', background: 'rgba(22,101,52,0.15)', border: '1px solid rgba(217,119,6,0.25)', color: '#fbbf24' }}>
              <option value="member" style={{ background: '#0d1f0d' }}>Member</option>
              <option value="pastor" style={{ background: '#0d1f0d' }}>Pastor</option>
              <option value="admin" style={{ background: '#0d1f0d' }}>Admin</option>
            </select>
          </div>
        ))}
        {members.length === 0 && <p style={{ textAlign: 'center', padding: '40px 0', fontSize: '0.9rem', color: '#6b7280' }}>No members yet.</p>}
      </div>
    </div>
  )
}

// ── ADMIN PRAYERS ────────────────────────────────────────
function AdminPrayers({ prayers, onStatus, onDelete }: {
  prayers: PrayerRequest[]
  onStatus: (id: string, status: string) => void
  onDelete: (id: string) => void
}) {
  const [filter, setFilter] = useState<'all' | 'prayer' | 'contact'>('all')
  const statusColors = { pending: '#6b7280', praying: '#d97706', answered: '#86efac' }

  const isContact = (r: PrayerRequest) => r.request.startsWith('[CONTACT FORM]')
  const displayed = prayers.filter(p =>
    filter === 'all' ? true : filter === 'contact' ? isContact(p) : !isContact(p)
  )
  const contactCount = prayers.filter(isContact).length
  const prayerCount = prayers.length - contactCount

  return (
    <div>
      <div style={sectionHeader}>
        <h2 style={sectionTitle}>Prayer &amp; Contact ({prayers.length})</h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {([
            { key: 'all', label: `All (${prayers.length})` },
            { key: 'prayer', label: `Prayers (${prayerCount})` },
            { key: 'contact', label: `Contact (${contactCount})` },
          ] as const).map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)} style={{
              padding: '8px 16px', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 600,
              cursor: 'pointer', border: filter === key ? '1px solid rgba(217,119,6,0.4)' : '1px solid transparent',
              background: filter === key ? 'rgba(217,119,6,0.18)' : 'rgba(22,101,52,0.1)',
              color: filter === key ? '#fbbf24' : '#6b7280',
            }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {displayed.map(p => {
          const isContactMsg = isContact(p)
          const displayRequest = isContactMsg ? p.request.replace('[CONTACT FORM]\n', '') : p.request
          return (
            <div key={p.id} className="glass" style={{ borderRadius: '16px', padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f0fdf4' }}>{p.is_anonymous ? 'Anonymous' : p.name}</span>
                    {isContactMsg && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 10px', borderRadius: '999px', background: 'rgba(96,165,250,0.15)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' }}>
                        Contact Form
                      </span>
                    )}
                    <span style={{ fontSize: '0.78rem', color: '#4b5563' }}>{new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: '#9ca3af', whiteSpace: 'pre-line' }}>{displayRequest}</p>
                </div>
                <button onClick={() => { if (confirm('Delete this?')) onDelete(p.id) }} style={iconBtn('#fca5a5')} title="Delete">
                  <Trash2 size={15} />
                </button>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
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
          )
        })}
        {displayed.length === 0 && (
          <p style={{ textAlign: 'center', padding: '40px 0', fontSize: '0.9rem', color: '#6b7280' }}>
            {filter === 'contact' ? 'No contact messages yet.' : filter === 'prayer' ? 'No prayer requests yet.' : 'Nothing here yet.'}
          </p>
        )}
      </div>
    </div>
  )
}

// ── ADMIN GIVING ─────────────────────────────────────────
function AdminGiving({ donationInfo, onRefresh, onDelete }: { donationInfo: DonationInfo[]; onRefresh: () => void; onDelete: (id: string) => void }) {
  const [showForm, setShowForm] = useState(false)
  const { register, handleSubmit, reset } = useForm<Partial<DonationInfo>>({ defaultValues: { is_active: true } })

  const addInfo = useMutation({
    mutationFn: async (data: Partial<DonationInfo>) => {
      await supabase.from('donation_info').insert({ ...data } as never)
    },
    onSuccess: () => { reset(); setShowForm(false); onRefresh() },
  })

  return (
    <div>
      <div style={sectionHeader}>
        <h2 style={sectionTitle}>Mobile Money Info</h2>
        <button onClick={() => setShowForm(!showForm)} style={addBtn}>
          <Plus size={16} /> Add Account
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass" style={{ borderRadius: '20px', padding: '28px', marginBottom: '24px' }}>
          <form onSubmit={handleSubmit(d => addInfo.mutate(d))} style={formGrid}>
            <div>
              <label style={labelStyle}>Provider *</label>
              <input {...register('provider', { required: true })} className={inputCls} style={inputStyle} placeholder="MTN Mobile Money" />
            </div>
            <div>
              <label style={labelStyle}>Number *</label>
              <input {...register('number', { required: true })} className={inputCls} style={inputStyle} placeholder="+231..." />
            </div>
            <div>
              <label style={labelStyle}>Account Name *</label>
              <input {...register('account_name', { required: true })} className={inputCls} style={inputStyle} placeholder="Fruit of Africa Church" />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <input {...register('category')} className={inputCls} style={inputStyle} placeholder="General / Tithe / Missions..." />
            </div>
            <div style={fieldFull}>
              <label style={labelStyle}>Instructions</label>
              <textarea {...register('instructions')} rows={2} className={inputCls} style={{ ...inputStyle, resize: 'none' }} placeholder="Additional instructions for donors..." />
            </div>
            <div style={{ ...formRow, justifyContent: 'flex-end' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setShowForm(false)} style={cancelBtn}>Cancel</button>
                <button type="submit" disabled={addInfo.isPending} style={saveBtn}>
                  {addInfo.isPending ? 'Saving...' : 'Save Account'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {donationInfo.map(d => (
          <div key={d.id} className="glass" style={{ borderRadius: '16px', padding: '20px 24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f0fdf4' }}>{d.provider}</div>
              <div style={{ fontFamily: 'monospace', fontSize: '1rem', color: '#fbbf24', marginTop: '4px' }}>{d.number}</div>
              <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '2px' }}>{d.account_name}</div>
              {d.category && <div style={{ fontSize: '0.8rem', color: '#d97706', marginTop: '4px' }}>{d.category}</div>}
            </div>
            <button onClick={() => { if (confirm('Delete this account?')) onDelete(d.id) }} style={iconBtn('#fca5a5')} title="Delete">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        {donationInfo.length === 0 && <p style={{ textAlign: 'center', padding: '40px 0', fontSize: '0.9rem', color: '#6b7280' }}>No mobile money accounts added yet.</p>}
      </div>
    </div>
  )
}

// ── ADMIN ANNOUNCEMENTS ───────────────────────────────────
function AdminAnnouncements({ announcements, togglePublish, onDelete, onRefresh }: {
  announcements: Announcement[]
  togglePublish: (id: string, current: boolean) => void
  onDelete: (id: string) => void
  onRefresh: () => void
}) {
  const [showForm, setShowForm] = useState(false)
  const { register, handleSubmit, reset } = useForm<Partial<Announcement>>({ defaultValues: { is_published: true } })

  const addAnnouncement = useMutation({
    mutationFn: async (data: Partial<Announcement>) => {
      await supabase.from('announcements').insert({ ...data } as never)
    },
    onSuccess: () => { reset(); setShowForm(false); onRefresh() },
  })

  return (
    <div>
      <div style={sectionHeader}>
        <h2 style={sectionTitle}>Announcements ({announcements.length})</h2>
        <button onClick={() => setShowForm(!showForm)} style={addBtn}>
          <Plus size={16} /> Add Announcement
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass" style={{ borderRadius: '20px', padding: '28px', marginBottom: '24px' }}>
          <form onSubmit={handleSubmit(d => addAnnouncement.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Title *</label>
              <input {...register('title', { required: true })} className={inputCls} style={inputStyle} placeholder="Announcement title" />
            </div>
            <div>
              <label style={labelStyle}>Content *</label>
              <textarea {...register('content', { required: true })} rows={4} className={inputCls} style={{ ...inputStyle, resize: 'none' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: '#9ca3af', cursor: 'pointer' }}>
                <input type="checkbox" {...register('is_published')} /> Publish immediately
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setShowForm(false)} style={cancelBtn}>Cancel</button>
                <button type="submit" disabled={addAnnouncement.isPending} style={saveBtn}>
                  {addAnnouncement.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {announcements.map(a => (
          <div key={a.id} className="glass" style={{ borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#f0fdf4' }}>{a.title}</div>
              <div style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '4px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{a.content}</div>
            </div>
            <div style={itemActions}>
              <span style={badge(a.is_published)}>{a.is_published ? 'Live' : 'Hidden'}</span>
              <button onClick={() => togglePublish(a.id, a.is_published)} style={iconBtn('#d97706')} title={a.is_published ? 'Unpublish' : 'Publish'}>
                {a.is_published ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
              <button onClick={() => { if (confirm('Delete?')) onDelete(a.id) }} style={iconBtn('#fca5a5')} title="Delete">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
        {announcements.length === 0 && <p style={{ textAlign: 'center', padding: '40px 0', fontSize: '0.9rem', color: '#6b7280' }}>No announcements yet.</p>}
      </div>
    </div>
  )
}

// ── ADMIN GALLERY ─────────────────────────────────────────
function AdminGallery({ gallery, onDelete, onRefresh }: { gallery: GalleryItem[]; onDelete: (id: string) => void; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false)
  const [caption, setCaption] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0]
    if (!picked) return
    setFile(picked)
    setUploadError(null)
    const reader = new FileReader()
    reader.onload = ev => setPreview(ev.target?.result as string)
    reader.readAsDataURL(picked)
  }

  function resetForm() {
    setFile(null)
    setPreview(null)
    setCaption('')
    setUploadError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setShowForm(false)
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) { setUploadError('Please select a photo.'); return }
    setUploading(true)
    setUploadError(null)
    try {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: storageErr } = await supabase.storage.from('gallery').upload(path, file, { upsert: false })
      if (storageErr) throw storageErr
      const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(path)
      const { error: dbErr } = await supabase.from('gallery').insert({ image_url: publicUrl, caption: caption || null } as never)
      if (dbErr) throw dbErr
      resetForm()
      onRefresh()
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed. Check your storage bucket policy.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div style={sectionHeader}>
        <h2 style={sectionTitle}>Gallery ({gallery.length} photos)</h2>
        <button onClick={() => { setShowForm(!showForm); setUploadError(null) }} style={addBtn}>
          <Plus size={16} /> Add Photo
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass" style={{ borderRadius: '20px', padding: '28px', marginBottom: '24px' }}>
          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Drop zone / file picker */}
            <div>
              <label style={labelStyle}>Photo *</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${file ? 'rgba(217,119,6,0.5)' : 'rgba(217,119,6,0.25)'}`,
                  borderRadius: '16px',
                  padding: '32px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: file ? 'rgba(217,119,6,0.05)' : 'rgba(22,101,52,0.05)',
                  transition: 'all 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                {preview ? (
                  <img src={preview} alt="preview" style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '10px', objectFit: 'contain', margin: '0 auto', display: 'block' }} />
                ) : (
                  <div>
                    <div style={{
                      width: '52px', height: '52px', borderRadius: '50%', margin: '0 auto 12px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(217,119,6,0.12)',
                    }}>
                      <Image size={24} style={{ color: '#d97706' }} />
                    </div>
                    <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '4px' }}>Click to select a photo</p>
                    <p style={{ color: '#6b7280', fontSize: '0.78rem' }}>JPG, PNG, WebP — up to 10MB</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>
              {file && (
                <p style={{ fontSize: '0.78rem', color: '#d97706', marginTop: '6px' }}>
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* Caption */}
            <div>
              <label style={labelStyle}>Caption (optional)</label>
              <input
                value={caption}
                onChange={e => setCaption(e.target.value)}
                className={inputCls}
                style={inputStyle}
                placeholder="Describe this photo..."
              />
            </div>

            {/* Error */}
            {uploadError && (
              <p style={{ fontSize: '0.85rem', color: '#fca5a5', background: 'rgba(220,38,38,0.1)', padding: '10px 14px', borderRadius: '10px' }}>
                {uploadError}
              </p>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={resetForm} style={cancelBtn}>Cancel</button>
              <button type="submit" disabled={uploading || !file} style={{ ...saveBtn, opacity: uploading || !file ? 0.6 : 1 }}>
                {uploading ? 'Uploading...' : 'Upload Photo'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Gallery grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
        {gallery.map(item => (
          <div key={item.id} style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', aspectRatio: '1' }}
            onMouseEnter={e => { const ov = e.currentTarget.querySelector<HTMLDivElement>('.gal-ov'); if (ov) ov.style.opacity = '1' }}
            onMouseLeave={e => { const ov = e.currentTarget.querySelector<HTMLDivElement>('.gal-ov'); if (ov) ov.style.opacity = '0' }}>
            <img src={item.image_url} alt={item.caption ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div className="gal-ov" style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.55)', opacity: 0, transition: 'opacity 0.2s',
            }}>
              <button onClick={() => { if (confirm('Remove photo?')) onDelete(item.id) }}
                style={{ padding: '10px', borderRadius: '50%', background: 'rgba(220,38,38,0.85)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                <Trash2 size={16} />
              </button>
            </div>
            {item.caption && (
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '6px 10px', fontSize: '0.75rem', background: 'rgba(0,0,0,0.65)', color: '#f0fdf4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.caption}
              </div>
            )}
          </div>
        ))}
        {gallery.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px 0', fontSize: '0.9rem', color: '#6b7280' }}>
            Gallery is empty. Add your first photo!
          </div>
        )}
      </div>
    </div>
  )
}
