import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

/**
 * Subscribes to Supabase Realtime changes and invalidates the matching
 * TanStack Query cache key automatically — zero manual refresh needed.
 */
export function useRealtime(table: string, queryKey: unknown[]) {
  const qc = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel(`realtime-${table}-${queryKey.join('-')}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        qc.invalidateQueries({ queryKey })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [table, qc]) // eslint-disable-line react-hooks/exhaustive-deps
}

/** Realtime hook for all key tables — plug into pages that need live updates */
export function useChurchRealtime() {
  const qc = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel('church-realtime-all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sermons' }, () => {
        qc.invalidateQueries({ queryKey: ['sermons'] })
        qc.invalidateQueries({ queryKey: ['admin-sermons'] })
        qc.invalidateQueries({ queryKey: ['pastor-sermons'] })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        qc.invalidateQueries({ queryKey: ['events'] })
        qc.invalidateQueries({ queryKey: ['admin-events'] })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prayer_requests' }, () => {
        qc.invalidateQueries({ queryKey: ['admin-prayers'] })
        qc.invalidateQueries({ queryKey: ['pastor-prayers'] })
        qc.invalidateQueries({ queryKey: ['my-prayers'] })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => {
        qc.invalidateQueries({ queryKey: ['announcements'] })
        qc.invalidateQueries({ queryKey: ['admin-announcements'] })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'donation_info' }, () => {
        qc.invalidateQueries({ queryKey: ['donation-info'] })
        qc.invalidateQueries({ queryKey: ['admin-donation-info'] })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [qc])
}
