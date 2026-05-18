import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { User, Phone, Mail, Heart, BookOpen, Save } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { DonationRecord, PrayerRequest } from '../types/database'

export function Profile() {
  const { profile, refreshProfile } = useAuth()
  useQueryClient()

  const { register, handleSubmit, formState: { isSubmitting, isDirty } } = useForm({
    defaultValues: {
      full_name: profile?.full_name ?? '',
      phone: profile?.phone ?? '',
      bio: profile?.bio ?? '',
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: { full_name: string; phone: string; bio: string }) => {
      await supabase.from('profiles').update({ ...data, updated_at: new Date().toISOString() } as never).eq('id', profile!.id)
    },
    onSuccess: () => refreshProfile(),
  })

  const { data: donations = [] } = useQuery<DonationRecord[]>({
    queryKey: ['my-donations', profile?.id],
    queryFn: async () => {
      const { data } = await supabase.from('donation_records').select('*')
        .order('created_at', { ascending: false }).limit(5)
      return (data ?? []) as DonationRecord[]
    },
    enabled: !!profile,
  })

  const { data: prayers = [] } = useQuery<PrayerRequest[]>({
    queryKey: ['my-prayers-profile', profile?.id],
    queryFn: async () => {
      const { data } = await supabase.from('prayer_requests').select('*')
        .eq('user_id', profile!.id).order('created_at', { ascending: false }).limit(5)
      return (data ?? []) as PrayerRequest[]
    },
    enabled: !!profile,
    refetchInterval: 30000,
  })

  const roleColor = { member: '#86efac', pastor: '#d97706', admin: '#f59e0b' }[profile?.role ?? 'member']

  return (
    <div style={{ padding: '48px 32px 80px' }}>
      <div style={{ maxWidth: '896px', margin: '0 auto' }}>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>

          {/* Profile Header */}
          <div className="glass" style={{ borderRadius: '20px', padding: '32px', marginBottom: '32px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 800, flexShrink: 0, background: 'linear-gradient(135deg, #166534, #d97706)', color: '#fff' }}>
              {profile?.full_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px', color: '#f0fdf4', fontFamily: 'Georgia, serif' }}>
                {profile?.full_name}
              </h1>
              <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize', marginBottom: '8px', background: `${roleColor}20`, color: roleColor, border: `1px solid ${roleColor}40` }}>
                {profile?.role}
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.875rem', color: '#6b7280' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} /> {profile?.email}</span>
                {profile?.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} /> {profile.phone}</span>}
              </div>
              <p style={{ fontSize: '0.75rem', marginTop: '6px', color: '#374151' }}>
                Member since {profile?.joined_at ? new Date(profile.joined_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

            {/* Edit Profile */}
            <div style={{ flex: '2 1 380px', minWidth: 0 }}>
              <div className="glass" style={{ borderRadius: '20px', padding: '32px' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24' }}>
                  <User size={18} /> Edit Profile
                </h2>
                <form onSubmit={handleSubmit(d => updateMutation.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label className="block text-sm mb-1.5" style={{ color: '#9ca3af' }}>Full Name</label>
                    <input {...register('full_name')} className="w-full px-4 py-3 rounded-xl outline-none text-sm"
                      style={{ background: 'rgba(22,101,52,0.1)', border: '1px solid rgba(217,119,6,0.2)', color: '#f0fdf4' }} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5" style={{ color: '#9ca3af' }}>Phone Number</label>
                    <input {...register('phone')} placeholder="+231..."
                      className="w-full px-4 py-3 rounded-xl outline-none text-sm"
                      style={{ background: 'rgba(22,101,52,0.1)', border: '1px solid rgba(217,119,6,0.2)', color: '#f0fdf4' }} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5" style={{ color: '#9ca3af' }}>Short Bio</label>
                    <textarea {...register('bio')} rows={3}
                      className="w-full px-4 py-3 rounded-xl outline-none text-sm resize-none"
                      style={{ background: 'rgba(22,101,52,0.1)', border: '1px solid rgba(217,119,6,0.2)', color: '#f0fdf4' }} />
                  </div>
                  <button type="submit" disabled={isSubmitting || !isDirty || updateMutation.isPending}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', background: 'linear-gradient(135deg,#d97706,#f59e0b)', color: '#0d1f0d', border: 'none', opacity: (isSubmitting || !isDirty || updateMutation.isPending) ? 0.5 : 1 }}>
                    <Save size={14} /> {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                  {updateMutation.isSuccess && (
                    <p style={{ fontSize: '0.875rem', color: '#86efac' }}>Profile updated!</p>
                  )}
                </form>
              </div>
            </div>

            {/* Activity */}
            <div style={{ flex: '1 1 240px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Prayer history */}
              <div className="glass" style={{ borderRadius: '18px', padding: '24px' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24' }}>
                  <Heart size={14} /> My Prayers
                </h3>
                {prayers.length === 0 ? (
                  <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>No prayer requests yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {prayers.map(p => (
                      <div key={p.id} style={{ borderRadius: '8px', padding: '12px', background: 'rgba(22,101,52,0.08)' }}>
                        <p style={{ fontSize: '0.75rem', color: '#9ca3af', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.request}</p>
                        <span style={{ fontSize: '0.72rem', textTransform: 'capitalize', marginTop: '4px', display: 'inline-block', color: p.status === 'answered' ? '#86efac' : p.status === 'praying' ? '#d97706' : '#6b7280' }}>{p.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Donation history */}
              <div className="glass" style={{ borderRadius: '18px', padding: '24px' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24' }}>
                  <BookOpen size={14} /> My Giving
                </h3>
                {donations.length === 0 ? (
                  <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>No donations logged yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {donations.map(d => (
                      <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '8px', padding: '12px', background: 'rgba(22,101,52,0.08)' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#f0fdf4' }}>{d.category}</div>
                          <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{new Date(d.created_at).toLocaleDateString()}</div>
                        </div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#d97706' }}>
                          {d.currency} {Number(d.amount).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
