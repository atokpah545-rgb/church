import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, BookOpen, Calendar, Clock, Play, Share2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Sermon } from '../types/database'

function getYouTubeId(url: string) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^&\n?#]+)/)
  return match?.[1] ?? null
}

export function SermonDetail() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()

  const { data: sermon, isLoading } = useQuery<Sermon | null>({
    queryKey: ['sermon', id],
    queryFn: async () => {
      if (!id) return null
      const { data } = await supabase
        .from('sermons')
        .select('*, pastor:profiles(full_name)')
        .eq('id', id)
        .single()
      return (data ?? null) as Sermon | null
    },
  })

  const incrementViews = useMutation({
    mutationFn: async () => {
      if (!id || !sermon) return
      await supabase.from('sermons').update({ views: (sermon.views ?? 0) + 1 } as never).eq('id', id)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sermon', id] }),
  })

  if (isLoading) {
    return (
      <div style={{ padding: '48px 32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid transparent', borderTopColor: '#d97706', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  if (!sermon) {
    return (
      <div style={{ padding: '48px 32px', textAlign: 'center' }}>
        <BookOpen size={56} style={{ color: '#d97706', opacity: 0.3, margin: '0 auto 16px', display: 'block' }} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px', color: '#f0fdf4' }}>Sermon Not Found</h1>
        <Link to="/sermons" style={{ color: '#d97706', fontSize: '0.875rem' }}>← Back to Sermons</Link>
      </div>
    )
  }

  const ytId = sermon.youtube_url ? getYouTubeId(sermon.youtube_url) : null

  return (
    <div style={{ padding: '48px 32px 80px' }}>
      <div style={{ maxWidth: '896px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/sermons" className="inline-flex items-center gap-2 text-sm mb-8 transition-colors hover:text-yellow-400"
            style={{ color: '#86efac' }}>
            <ArrowLeft size={16} /> Back to Sermons
          </Link>

          {/* Video / Audio Player */}
          <div className="rounded-2xl overflow-hidden mb-8" style={{ background: '#080f08' }}>
            {ytId ? (
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
                  title={sermon.title}
                  className="w-full h-full"
                  allowFullScreen
                  onLoad={() => incrementViews.mutate()}
                />
              </div>
            ) : sermon.video_url ? (
              <div className="aspect-video">
                <video
                  src={sermon.video_url}
                  controls
                  className="w-full h-full"
                  onPlay={() => incrementViews.mutate()}
                />
              </div>
            ) : sermon.audio_url ? (
              <div className="p-10 flex flex-col items-center gap-6">
                <div className="w-24 h-24 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #166534, #d97706)' }}>
                  <Play size={36} fill="white" style={{ color: '#fff' }} />
                </div>
                <audio src={sermon.audio_url} controls className="w-full max-w-md"
                  onPlay={() => incrementViews.mutate()} />
              </div>
            ) : (
              <div className="aspect-video flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #0d1f0d, #162616)' }}>
                <div className="text-center">
                  <BookOpen size={48} className="mx-auto mb-3 opacity-40" style={{ color: '#d97706' }} />
                  <p className="text-sm" style={{ color: '#6b7280' }}>No media available for this sermon yet.</p>
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="glass rounded-2xl p-8">
            {sermon.series && (
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
                style={{ background: 'rgba(217,119,6,0.15)', color: '#fbbf24' }}>
                {sermon.series}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#f0fdf4', fontFamily: 'Georgia, serif' }}>
              {sermon.title}
            </h1>

            <div className="flex flex-wrap gap-4 mb-6 text-sm" style={{ color: '#6b7280' }}>
              <span className="flex items-center gap-1">
                <Calendar size={14} style={{ color: '#d97706' }} />
                {new Date(sermon.sermon_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              {sermon.duration_mins && (
                <span className="flex items-center gap-1">
                  <Clock size={14} style={{ color: '#d97706' }} /> {sermon.duration_mins} min
                </span>
              )}
              {sermon.scripture_ref && (
                <span className="flex items-center gap-1">
                  <BookOpen size={14} style={{ color: '#d97706' }} /> {sermon.scripture_ref}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Play size={14} style={{ color: '#d97706' }} /> {sermon.views} views
              </span>
            </div>

            {sermon.description && (
              <p className="leading-relaxed" style={{ color: '#9ca3af' }}>{sermon.description}</p>
            )}

            <div className="flex items-center justify-between mt-8 pt-6"
              style={{ borderTop: '1px solid rgba(217,119,6,0.15)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                  style={{ background: 'linear-gradient(135deg, #166534, #d97706)', color: '#fff' }}>
                  {(sermon.pastor as { full_name: string } | undefined)?.full_name?.[0] ?? 'P'}
                </div>
                <div>
                  <div className="font-medium text-sm" style={{ color: '#f0fdf4' }}>
                    {(sermon.pastor as { full_name: string } | undefined)?.full_name ?? 'Pastor Prince Bawoh'}
                  </div>
                  <div className="text-xs" style={{ color: '#6b7280' }}>Senior Pastor</div>
                </div>
              </div>
              <button
                onClick={() => navigator.share?.({ title: sermon.title, url: window.location.href })}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors hover:bg-green-900/30"
                style={{ color: '#86efac' }}>
                <Share2 size={14} /> Share
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
