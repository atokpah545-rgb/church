import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Images, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { GalleryItem } from '../types/database'

export function Gallery() {
  const [selected, setSelected] = useState<number | null>(null)

  const { data: gallery = [], isLoading } = useQuery<GalleryItem[]>({
    queryKey: ['gallery', 'public'],
    queryFn: async () => {
      const { data } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false })
      return (data ?? []) as GalleryItem[]
    },
  })

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (selected === null) return
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, gallery.length])

  function prev() {
    setSelected(i => i !== null ? (i - 1 + gallery.length) % gallery.length : null)
  }
  function next() {
    setSelected(i => i !== null ? (i + 1) % gallery.length : null)
  }

  return (
    <>
      <div style={{ padding: '48px 32px 80px' }}>
        <div style={{ maxWidth: '1060px', margin: '0 auto' }}>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '52px' }}>
            <Images size={48} style={{ color: '#d97706', margin: '0 auto 16px', display: 'block' }} />
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#d97706', marginBottom: '10px' }}>Moments & Memories</p>
            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, fontFamily: 'Georgia, serif', color: '#f0fdf4', marginBottom: '12px' }}>
              Photo Gallery
            </h1>
            <p style={{ color: '#9ca3af', maxWidth: '480px', margin: '0 auto' }}>
              Glimpses of worship, fellowship, and the family of God at Fruit of Africa Church.
            </p>
          </motion.div>

          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="glass animate-pulse" style={{ borderRadius: '14px', aspectRatio: '1' }} />
              ))}
            </div>
          ) : gallery.length === 0 ? (
            <div className="glass" style={{ textAlign: 'center', padding: '96px 32px', borderRadius: '20px' }}>
              <Images size={56} style={{ color: '#d97706', opacity: 0.3, margin: '0 auto 16px', display: 'block' }} />
              <p style={{ fontWeight: 600, color: '#f0fdf4', marginBottom: '8px' }}>Gallery is empty</p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Photos will appear here as they are added.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {gallery.map((item, i) => (
                <motion.div key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => setSelected(i)}
                  style={{
                    borderRadius: '14px', overflow: 'hidden', aspectRatio: '1',
                    cursor: 'pointer', position: 'relative',
                    background: '#0a1a0a',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  }}>
                  <img
                    src={item.image_url}
                    alt={item.caption ?? ''}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  {/* Caption overlay */}
                  {item.caption && (
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      padding: '24px 14px 12px',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.78), transparent)',
                      color: '#f0fdf4', fontSize: '0.8rem', fontWeight: 500,
                    }}>
                      {item.caption}
                    </div>
                  )}
                  {/* Hover gold tint */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(217,119,6,0.1)',
                    opacity: 0, transition: 'opacity 0.25s',
                    borderRadius: '14px',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── LIGHTBOX ── */}
      <AnimatePresence>
        {selected !== null && gallery[selected] && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSelected(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 300,
              background: 'rgba(0,0,0,0.92)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '24px',
            }}>

            {/* Prev */}
            <button
              onClick={e => { e.stopPropagation(); prev() }}
              style={{
                position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)',
                width: '48px', height: '48px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(217,119,6,0.18)', border: '1px solid rgba(217,119,6,0.35)',
                color: '#d97706', cursor: 'pointer', zIndex: 1,
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(217,119,6,0.35)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(217,119,6,0.18)')}>
              <ChevronLeft size={24} />
            </button>

            {/* Image */}
            <motion.div
              key={selected}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
              style={{
                position: 'relative', borderRadius: '16px', overflow: 'hidden',
                maxWidth: 'min(900px, calc(100vw - 140px))',
                maxHeight: '80vh',
                boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
              }}>
              <img
                src={gallery[selected].image_url}
                alt={gallery[selected].caption ?? ''}
                style={{ display: 'block', maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
              />
              {gallery[selected].caption && (
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: '20px 24px 16px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
                  color: '#f0fdf4', fontSize: '0.9rem', textAlign: 'center',
                }}>
                  {gallery[selected].caption}
                </div>
              )}
            </motion.div>

            {/* Next */}
            <button
              onClick={e => { e.stopPropagation(); next() }}
              style={{
                position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)',
                width: '48px', height: '48px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(217,119,6,0.18)', border: '1px solid rgba(217,119,6,0.35)',
                color: '#d97706', cursor: 'pointer', zIndex: 1,
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(217,119,6,0.35)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(217,119,6,0.18)')}>
              <ChevronRight size={24} />
            </button>

            {/* Close */}
            <button
              onClick={() => setSelected(null)}
              style={{
                position: 'absolute', top: '20px', right: '20px',
                width: '42px', height: '42px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.35)',
                color: '#fca5a5', cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.4)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.2)')}>
              <X size={18} />
            </button>

            {/* Counter */}
            <div style={{
              position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
              fontSize: '0.8rem', color: '#6b7280',
              background: 'rgba(0,0,0,0.5)', padding: '4px 12px', borderRadius: '999px',
            }}>
              {selected + 1} / {gallery.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
