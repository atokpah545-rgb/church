import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MapPin, Clock, Phone, Mail, Send, CheckCircle, MessageCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

const schema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Enter a valid email').or(z.literal('')),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})
type FormData = z.infer<typeof schema>

const field: React.CSSProperties = {
  width: '100%', padding: '12px 16px', borderRadius: '12px', outline: 'none', fontSize: '0.875rem',
  background: 'rgba(22,101,52,0.1)', border: '1px solid rgba(217,119,6,0.2)', color: '#f0fdf4',
  boxSizing: 'border-box',
}

const infoItems = [
  {
    icon: MapPin,
    label: 'Location',
    value: 'Monrovia, Liberia',
    sub: 'Come worship with us',
  },
  {
    icon: Clock,
    label: 'Service Times',
    value: 'Sun 9:00 AM & 11:00 AM',
    sub: 'Wed Bible Study — 6:00 PM',
  },
  {
    icon: Phone,
    label: 'Phone / WhatsApp',
    value: 'Contact the church office',
    sub: 'Reach us anytime',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'Reach us via the form',
    sub: 'We respond within 24 hours',
  },
]

export function Contact() {
  const [submitted, setSubmitted] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  const sendMessage = useMutation({
    mutationFn: async (data: FormData) => {
      const body = `[CONTACT FORM]\nEmail: ${data.email || 'Not provided'}\nPhone: ${data.phone || 'Not provided'}\n\n${data.message}`
      const { error } = await supabase.from('prayer_requests').insert([{
        user_id: null,
        name: data.name,
        request: body,
        is_anonymous: false,
        status: 'pending',
      }] as never)
      if (error) throw error
    },
    onSuccess: () => { setSubmitted(true); reset() },
  })

  return (
    <div style={{ padding: '48px 32px 80px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '52px' }}>
          <MessageCircle size={48} style={{ color: '#d97706', margin: '0 auto 16px', display: 'block' }} />
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#d97706', marginBottom: '10px' }}>We'd Love to Hear from You</p>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, fontFamily: 'Georgia, serif', color: '#f0fdf4', marginBottom: '12px' }}>
            Get in Touch
          </h1>
          <p style={{ color: '#9ca3af', maxWidth: '480px', margin: '0 auto' }}>
            Whether you have a question, need prayer, or want to visit — our doors and hearts are open.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'start' }}>

          {/* Contact info */}
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {infoItems.map(({ icon: Icon, label, value, sub }) => (
              <div key={label} className="glass" style={{ borderRadius: '16px', padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '10px', flexShrink: 0,
                  background: 'rgba(217,119,6,0.12)', border: '1px solid rgba(217,119,6,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={18} style={{ color: '#d97706' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '3px' }}>{label}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f0fdf4', marginBottom: '2px' }}>{value}</div>
                  <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{sub}</div>
                </div>
              </div>
            ))}

            {/* Scripture */}
            <div className="glass" style={{ borderRadius: '16px', padding: '24px', borderLeft: '3px solid #d97706' }}>
              <p style={{ fontSize: '0.9rem', fontStyle: 'italic', lineHeight: 1.8, color: '#9ca3af' }}>
                "Ask and it will be given to you; seek and you will find; knock and the door will be opened to you."
              </p>
              <p style={{ fontSize: '0.8rem', marginTop: '10px', color: '#d97706', fontWeight: 600 }}>— Matthew 7:7</p>
            </div>
          </motion.div>

          {/* Message form */}
          <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
            <div className="glass" style={{ borderRadius: '20px', padding: '36px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'Georgia, serif', color: '#fbbf24', marginBottom: '28px' }}>
                Send Us a Message
              </h2>

              {submitted ? (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  style={{ textAlign: 'center', padding: '40px 0' }}>
                  <CheckCircle size={56} style={{ color: '#86efac', margin: '0 auto 16px', display: 'block' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f0fdf4', marginBottom: '8px' }}>Message Received!</h3>
                  <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '24px' }}>
                    Thank you for reaching out. We'll get back to you soon. God bless you!
                  </p>
                  <button onClick={() => setSubmitted(false)}
                    style={{ padding: '8px 24px', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 600, background: 'rgba(217,119,6,0.15)', color: '#fbbf24', border: '1px solid rgba(217,119,6,0.3)', cursor: 'pointer' }}>
                    Send Another
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(d => sendMessage.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#9ca3af', marginBottom: '6px' }}>Your Name *</label>
                    <input {...register('name')} placeholder="Full name" style={field} />
                    {errors.name && <p style={{ fontSize: '0.75rem', color: '#fca5a5', marginTop: '4px' }}>{errors.name.message}</p>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#9ca3af', marginBottom: '6px' }}>Email Address</label>
                    <input {...register('email')} type="email" placeholder="your@email.com (optional)" style={field} />
                    {errors.email && <p style={{ fontSize: '0.75rem', color: '#fca5a5', marginTop: '4px' }}>{errors.email.message}</p>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#9ca3af', marginBottom: '6px' }}>Phone / WhatsApp</label>
                    <input {...register('phone')} placeholder="+231... (optional)" style={field} />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#9ca3af', marginBottom: '6px' }}>Your Message *</label>
                    <textarea {...register('message')} rows={5}
                      placeholder="How can we help you? Ask a question, share a testimony, or just say hello..."
                      style={{ ...field, resize: 'none' }} />
                    {errors.message && <p style={{ fontSize: '0.75rem', color: '#fca5a5', marginTop: '4px' }}>{errors.message.message}</p>}
                  </div>

                  {sendMessage.error && (
                    <p style={{ fontSize: '0.75rem', padding: '10px 14px', borderRadius: '10px', background: 'rgba(220,38,38,0.1)', color: '#fca5a5' }}>
                      Something went wrong. Please try again.
                    </p>
                  )}

                  <button type="submit" disabled={sendMessage.isPending}
                    style={{
                      padding: '14px', borderRadius: '999px', fontWeight: 700, fontSize: '0.9rem',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      background: 'linear-gradient(135deg,#d97706,#f59e0b)', color: '#0d1f0d',
                      border: 'none', opacity: sendMessage.isPending ? 0.5 : 1,
                      boxShadow: '0 0 20px rgba(217,119,6,0.25)',
                    }}>
                    <Send size={15} /> {sendMessage.isPending ? 'Sending...' : 'Send Message'}
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
