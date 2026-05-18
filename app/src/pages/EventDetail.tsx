import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Calendar, MapPin, Clock, Users, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { ChurchEvent } from '../types/database'

export function EventDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const qc = useQueryClient()

  const { data: event, isLoading } = useQuery<ChurchEvent | null>({
    queryKey: ['event', id],
    queryFn: async () => {
      if (!id) return null
      const { data } = await supabase.from('events').select('*').eq('id', id).single()
      return (data ?? null) as ChurchEvent | null
    },
  })

  const { data: rsvpCount = 0 } = useQuery<number>({
    queryKey: ['event-rsvps-count', id],
    queryFn: async () => {
      const { count } = await supabase.from('event_rsvps').select('*', { count: 'exact', head: true }).eq('event_id', id!)
      return count ?? 0
    },
    refetchInterval: 30000,
  })

  const { data: hasRsvp = false } = useQuery<boolean>({
    queryKey: ['event-rsvp-user', id, user?.id],
    queryFn: async () => {
      if (!user) return false
      const { data } = await supabase.from('event_rsvps').select('id').eq('event_id', id!).eq('user_id', user.id).single()
      return !!data
    },
    enabled: !!user,
  })

  const rsvpMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in')
      if (hasRsvp) {
        await supabase.from('event_rsvps').delete().eq('event_id', id!).eq('user_id', user.id)
      } else {
        await supabase.from('event_rsvps').insert([{ event_id: id, user_id: user.id }] as never)
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event-rsvps-count', id] })
      qc.invalidateQueries({ queryKey: ['event-rsvp-user', id, user?.id] })
    },
  })

  if (isLoading) {
    return (
      <div style={{ padding: '48px 32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid transparent', borderTopColor: '#d97706', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  if (!event) return <div style={{ padding: '48px 32px', textAlign: 'center' }}><Link to="/events" style={{ color: '#d97706' }}>← Back to Events</Link></div>

  const isPast = new Date(event.event_date) < new Date()

  return (
    <div style={{ padding: '48px 32px 80px' }}>
      <div style={{ maxWidth: '768px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/events" className="inline-flex items-center gap-2 text-sm mb-8 transition-colors hover:text-yellow-400"
            style={{ color: '#86efac' }}>
            <ArrowLeft size={16} /> Back to Events
          </Link>

          {event.image_url && (
            <div className="rounded-2xl overflow-hidden mb-8 aspect-video">
              <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="glass rounded-2xl p-8">
            <div className="flex flex-wrap gap-3 mb-4">
              {event.is_featured && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(217,119,6,0.15)', color: '#fbbf24' }}>Featured Event</span>
              )}
              {isPast && (
                <span className="px-3 py-1 rounded-full text-xs"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#6b7280' }}>Past Event</span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold mb-6" style={{ color: '#f0fdf4', fontFamily: 'Georgia, serif' }}>
              {event.title}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.15)' }}>
                <Calendar size={20} className="mx-auto mb-1" style={{ color: '#d97706' }} />
                <div className="text-sm font-medium" style={{ color: '#f0fdf4' }}>
                  {new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.15)' }}>
                <Clock size={20} className="mx-auto mb-1" style={{ color: '#d97706' }} />
                <div className="text-sm font-medium" style={{ color: '#f0fdf4' }}>
                  {new Date(event.event_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.15)' }}>
                <Users size={20} className="mx-auto mb-1" style={{ color: '#d97706' }} />
                <div className="text-sm font-medium" style={{ color: '#f0fdf4' }}>{rsvpCount} attending</div>
              </div>
            </div>

            {event.location && (
              <div className="flex items-center gap-2 mb-6 text-sm" style={{ color: '#9ca3af' }}>
                <MapPin size={16} style={{ color: '#d97706' }} /> {event.location}
              </div>
            )}

            {event.description && (
              <p className="leading-relaxed mb-8" style={{ color: '#9ca3af' }}>{event.description}</p>
            )}

            {!isPast && (
              user ? (
                <button
                  onClick={() => rsvpMutation.mutate()}
                  disabled={rsvpMutation.isPending}
                  className="flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all hover:scale-105 disabled:opacity-50"
                  style={{
                    background: hasRsvp ? 'rgba(22,101,52,0.2)' : 'linear-gradient(135deg,#d97706,#f59e0b)',
                    color: hasRsvp ? '#86efac' : '#0d1f0d',
                    border: hasRsvp ? '1px solid rgba(22,101,52,0.4)' : 'none',
                  }}>
                  {hasRsvp ? <><CheckCircle size={18} /> I'm Going!</> : 'RSVP — Count Me In'}
                </button>
              ) : (
                <Link to="/auth"
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold"
                  style={{ background: 'linear-gradient(135deg,#d97706,#f59e0b)', color: '#0d1f0d' }}>
                  Sign in to RSVP
                </Link>
              )
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
