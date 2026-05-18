import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Heart, Phone, CheckCircle, Copy, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { DonationInfo } from '../types/database'

interface FormData {
  donor_name: string
  amount: number
  category: string
  reference?: string
  note?: string
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="p-1.5 rounded transition-colors hover:bg-green-900/30"
      style={{ color: copied ? '#86efac' : '#6b7280' }}>
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  )
}

export function Give() {
  const { user, profile } = useAuth()
  const qc = useQueryClient()
  const [submitted, setSubmitted] = useState(false)

  const { data: donationInfo = [] } = useQuery<DonationInfo[]>({
    queryKey: ['donation-info'],
    queryFn: async () => {
      const { data } = await supabase.from('donation_info').select('*').eq('is_active', true).order('category')
      return (data ?? []) as DonationInfo[]
    },
    refetchOnWindowFocus: true,
  })

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    defaultValues: {
      donor_name: profile?.full_name ?? '',
      category: 'Tithe',
    },
  })

  const submitRecord = useMutation({
    mutationFn: async (data: FormData) => {
      await supabase.from('donation_records').insert([{
        user_id: user?.id ?? null,
        donor_name: data.donor_name,
        amount: data.amount,
        currency: 'LRD',
        category: data.category,
        reference: data.reference ?? null,
        note: data.note ?? null,
        status: 'confirmed',
      }] as never)
    },
    onSuccess: () => {
      setSubmitted(true)
      reset()
      qc.invalidateQueries({ queryKey: ['donation-records'] })
    },
  })

  const categories = ['Tithe', 'Offering', 'Missions', 'Building Fund', 'Special Offering', 'Other']

  return (
    <div style={{ padding: '48px 32px 80px' }}>
      <div style={{ maxWidth: '896px', margin: '0 auto' }}>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '48px' }}>
          <Heart size={48} style={{ color: '#d97706', margin: '0 auto 16px', display: 'block' }} fill="#d97706" />
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#d97706', marginBottom: '10px' }}>Support the Ministry</p>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, fontFamily: 'Georgia, serif', color: '#f0fdf4', marginBottom: '12px' }}>
            Give to God's Work
          </h1>
          <p style={{ color: '#9ca3af', maxWidth: '480px', margin: '0 auto' }}>
            Your generous giving fuels the gospel, reaches souls, and builds the Kingdom of God in Liberia and beyond.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>

          {/* Mobile Money Instructions */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="glass rounded-2xl p-8 h-full">
              <h2 className="text-xl font-bold mb-6" style={{ color: '#fbbf24', fontFamily: 'Georgia, serif' }}>
                How to Give via Mobile Money
              </h2>

              {donationInfo.length === 0 ? (
                <div className="text-center py-8">
                  <Phone size={40} className="mx-auto mb-3 opacity-30" style={{ color: '#d97706' }} />
                  <p className="text-sm" style={{ color: '#6b7280' }}>
                    Mobile Money donation details will be posted by the admin soon.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {donationInfo.map(info => (
                    <div key={info.id} className="rounded-xl p-5"
                      style={{ background: 'rgba(217,119,6,0.07)', border: '1px solid rgba(217,119,6,0.2)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
                          style={{ background: 'rgba(217,119,6,0.2)', color: '#fbbf24' }}>
                          {info.category}
                        </span>
                        <span className="text-xs font-medium" style={{ color: '#86efac' }}>{info.provider}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm" style={{ color: '#9ca3af' }}>Account Name</div>
                          <div className="font-semibold" style={{ color: '#f0fdf4' }}>{info.account_name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm" style={{ color: '#9ca3af' }}>Number</div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold" style={{ color: '#fbbf24' }}>{info.number}</span>
                            <CopyButton text={info.number} />
                          </div>
                        </div>
                      </div>
                      {info.instructions && (
                        <p className="mt-3 text-xs leading-relaxed pt-3"
                          style={{ color: '#6b7280', borderTop: '1px solid rgba(217,119,6,0.1)' }}>
                          {info.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 p-4 rounded-xl text-sm" style={{ background: 'rgba(22,101,52,0.1)', border: '1px solid rgba(22,101,52,0.2)' }}>
                <p className="font-medium mb-1" style={{ color: '#86efac' }}>Steps to Give:</p>
                <ol className="space-y-1 text-sm" style={{ color: '#9ca3af' }}>
                  <li>1. Open your mobile money app</li>
                  <li>2. Send money to the number above</li>
                  <li>3. Save your transaction reference</li>
                  <li>4. Log it using the form → so we can send you a receipt</li>
                </ol>
              </div>
            </div>
          </motion.div>

          {/* Log Donation Form */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <div className="glass rounded-2xl p-8">
              <h2 className="text-xl font-bold mb-6" style={{ color: '#fbbf24', fontFamily: 'Georgia, serif' }}>
                Log Your Donation
              </h2>

              {submitted ? (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-10">
                  <CheckCircle size={56} className="mx-auto mb-4" style={{ color: '#86efac' }} />
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#f0fdf4' }}>Thank You!</h3>
                  <p className="text-sm mb-6" style={{ color: '#9ca3af' }}>Your donation has been recorded. God bless you!</p>
                  <button onClick={() => setSubmitted(false)}
                    className="px-6 py-2 rounded-full text-sm font-medium"
                    style={{ background: 'rgba(217,119,6,0.15)', color: '#fbbf24', border: '1px solid rgba(217,119,6,0.3)' }}>
                    Log Another
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(d => submitRecord.mutate(d))} className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1.5" style={{ color: '#9ca3af' }}>Your Name *</label>
                    <input {...register('donor_name', { required: 'Please enter your name', minLength: { value: 2, message: 'Name too short' } })} placeholder="Full name"
                      className="w-full px-4 py-3 rounded-xl outline-none text-sm"
                      style={{ background: 'rgba(22,101,52,0.1)', border: '1px solid rgba(217,119,6,0.2)', color: '#f0fdf4' }} />
                    {errors.donor_name && <p className="text-xs mt-1" style={{ color: '#fca5a5' }}>{errors.donor_name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm mb-1.5" style={{ color: '#9ca3af' }}>Amount (LRD) *</label>
                    <input type="number" step="0.01" {...register('amount', { valueAsNumber: true, validate: v => v > 0 || 'Amount must be positive' })} placeholder="0.00"
                      className="w-full px-4 py-3 rounded-xl outline-none text-sm"
                      style={{ background: 'rgba(22,101,52,0.1)', border: '1px solid rgba(217,119,6,0.2)', color: '#f0fdf4' }} />
                    {errors.amount && <p className="text-xs mt-1" style={{ color: '#fca5a5' }}>{errors.amount.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm mb-1.5" style={{ color: '#9ca3af' }}>Category *</label>
                    <select {...register('category')}
                      className="w-full px-4 py-3 rounded-xl outline-none text-sm appearance-none"
                      style={{ background: 'rgba(22,101,52,0.1)', border: '1px solid rgba(217,119,6,0.2)', color: '#f0fdf4' }}>
                      {categories.map(c => <option key={c} value={c} style={{ background: '#0d1f0d' }}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-1.5" style={{ color: '#9ca3af' }}>Transaction Reference</label>
                    <input {...register('reference')} placeholder="From your mobile money receipt"
                      className="w-full px-4 py-3 rounded-xl outline-none text-sm"
                      style={{ background: 'rgba(22,101,52,0.1)', border: '1px solid rgba(217,119,6,0.2)', color: '#f0fdf4' }} />
                  </div>

                  <div>
                    <label className="block text-sm mb-1.5" style={{ color: '#9ca3af' }}>Note (optional)</label>
                    <textarea {...register('note')} rows={2} placeholder="Any message..."
                      className="w-full px-4 py-3 rounded-xl outline-none text-sm resize-none"
                      style={{ background: 'rgba(22,101,52,0.1)', border: '1px solid rgba(217,119,6,0.2)', color: '#f0fdf4' }} />
                  </div>

                  {!user && (
                    <p className="text-xs py-2 px-3 rounded-lg" style={{ background: 'rgba(217,119,6,0.1)', color: '#fbbf24' }}>
                      Sign in to link this donation to your member account.
                    </p>
                  )}

                  <button type="submit" disabled={submitRecord.isPending}
                    className="w-full py-3 rounded-full font-semibold text-sm transition-all hover:scale-105 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg,#d97706,#f59e0b)', color: '#0d1f0d' }}>
                    {submitRecord.isPending ? 'Saving...' : 'Submit Donation Record'}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
