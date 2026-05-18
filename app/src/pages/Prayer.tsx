import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Heart, CheckCircle, Shield, Clock, Star } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { PrayerRequest } from '../types/database'

const schema = z.object({
  name: z.string().min(2, 'Please provide a name or leave anonymous'),
  request: z.string().min(10, 'Please describe your prayer need (min 10 characters)'),
  is_anonymous: z.boolean(),
})
type FormData = z.infer<typeof schema>

const statusConfig = {
  pending: { label: 'Received', color: '#6b7280', icon: Clock },
  praying: { label: 'Being Prayed For', color: '#d97706', icon: Heart },
  answered: { label: 'Answered!', color: '#86efac', icon: Star },
}

const field: React.CSSProperties = {
  width: '100%', padding: '12px 16px', borderRadius: '12px', outline: 'none', fontSize: '0.875rem',
  background: 'rgba(22,101,52,0.1)', border: '1px solid rgba(217,119,6,0.2)', color: '#f0fdf4',
  boxSizing: 'border-box',
}

export function Prayer() {
  const { user, profile } = useAuth()
  const qc = useQueryClient()
  const [submitted, setSubmitted] = useState(false)

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: profile?.full_name ?? '', is_anonymous: false },
  })

  const isAnon = watch('is_anonymous')

  const submitMutation = useMutation({
    mutationFn: async (data: FormData) => {
      await supabase.from('prayer_requests').insert([{
        user_id: user?.id ?? null,
        name: data.is_anonymous ? 'Anonymous' : data.name,
        request: data.request,
        is_anonymous: data.is_anonymous,
        status: 'pending',
      }] as never)
    },
    onSuccess: () => { setSubmitted(true); reset(); qc.invalidateQueries({ queryKey: ['my-prayers'] }) },
  })

  const { data: myRequests = [] } = useQuery<PrayerRequest[]>({
    queryKey: ['my-prayers', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data } = await supabase.from('prayer_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      return (data ?? []) as PrayerRequest[]
    },
    enabled: !!user,
    refetchInterval: 30000,
  })

  return (
    <div style={{ padding: '48px 32px 80px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '48px' }}>
          <Heart size={48} style={{ color: '#d97706', margin: '0 auto 16px', display: 'block' }} />
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#d97706', marginBottom: '10px' }}>We Stand With You</p>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, fontFamily: 'Georgia, serif', color: '#f0fdf4', marginBottom: '12px' }}>Prayer Requests</h1>
          <p style={{ color: '#9ca3af', maxWidth: '480px', margin: '0 auto' }}>Share your prayer need with our pastoral team. We pray over every request. You may remain anonymous.</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)', gap: '32px' }}>

          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="glass" style={{ borderRadius: '20px', padding: '40px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'Georgia, serif', color: '#fbbf24', marginBottom: '28px' }}>Submit Your Request</h2>

              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div key="success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    style={{ textAlign: 'center', padding: '40px 0' }}>
                    <CheckCircle size={56} style={{ color: '#86efac', margin: '0 auto 16px', display: 'block' }} />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f0fdf4', marginBottom: '8px' }}>Request Received</h3>
                    <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '24px' }}>Our team will be praying over your request. God hears every prayer!</p>
                    <button onClick={() => setSubmitted(false)} style={{ padding: '8px 24px', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 600, background: 'rgba(217,119,6,0.15)', color: '#fbbf24', border: '1px solid rgba(217,119,6,0.3)', cursor: 'pointer' }}>
                      Submit Another
                    </button>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={handleSubmit(d => submitMutation.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input type="checkbox" {...register('is_anonymous')} style={{ width: '16px', height: '16px', accentColor: '#d97706' }} />
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: '#9ca3af' }}>
                        <Shield size={14} style={{ color: '#d97706' }} /> Submit anonymously
                      </span>
                    </label>

                    {!isAnon && (
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#9ca3af', marginBottom: '6px' }}>Your Name *</label>
                        <input {...register('name')} placeholder="Your name" style={field} />
                        {errors.name && <p style={{ fontSize: '0.75rem', color: '#fca5a5', marginTop: '4px' }}>{errors.name.message}</p>}
                      </div>
                    )}

                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', color: '#9ca3af', marginBottom: '6px' }}>Your Prayer Request *</label>
                      <textarea {...register('request')} rows={5} placeholder="Share what's on your heart. Our team will pray with you..."
                        style={{ ...field, resize: 'none' }} />
                      {errors.request && <p style={{ fontSize: '0.75rem', color: '#fca5a5', marginTop: '4px' }}>{errors.request.message}</p>}
                    </div>

                    {submitMutation.error && (
                      <p style={{ fontSize: '0.75rem', padding: '12px', borderRadius: '10px', background: 'rgba(220,38,38,0.1)', color: '#fca5a5' }}>Something went wrong. Please try again.</p>
                    )}

                    <button type="submit" disabled={submitMutation.isPending}
                      style={{ padding: '14px', borderRadius: '999px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', background: 'linear-gradient(135deg,#d97706,#f59e0b)', color: '#0d1f0d', opacity: submitMutation.isPending ? 0.5 : 1, border: 'none' }}>
                      {submitMutation.isPending ? 'Submitting...' : 'Submit Prayer Request'}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass" style={{ borderRadius: '18px', padding: '28px' }}>
              <p style={{ fontSize: '0.9rem', fontStyle: 'italic', lineHeight: 1.8, color: '#9ca3af' }}>
                "Therefore I tell you, whatever you ask for in prayer, believe that you have received it, and it will be yours."
              </p>
              <p style={{ fontSize: '0.8rem', marginTop: '12px', color: '#d97706' }}>— Mark 11:24</p>
            </div>

            {user && myRequests.length > 0 && (
              <div className="glass" style={{ borderRadius: '18px', padding: '28px' }}>
                <h3 style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fbbf24', marginBottom: '16px' }}>My Prayer Requests</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {myRequests.map(req => {
                    const cfg = statusConfig[req.status]
                    const Icon = cfg.icon
                    return (
                      <div key={req.id} style={{ borderRadius: '10px', padding: '12px', background: 'rgba(22,101,52,0.1)', border: '1px solid rgba(217,119,6,0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', color: cfg.color }}>
                            <Icon size={11} /> {cfg.label}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#374151' }}>{new Date(req.created_at).toLocaleDateString()}</span>
                        </div>
                        <p style={{ fontSize: '0.78rem', lineHeight: 1.5, color: '#9ca3af', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{req.request}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
