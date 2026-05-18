export type UserRole = 'member' | 'pastor' | 'admin'
export type PrayerStatus = 'pending' | 'praying' | 'answered'
export type DonationStatus = 'confirmed' | 'pending'

export interface Profile {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  avatar_url: string | null
  role: UserRole
  bio: string | null
  joined_at: string
  updated_at: string
}

export interface Sermon {
  id: string
  title: string
  description: string | null
  pastor_id: string | null
  sermon_date: string
  series: string | null
  scripture_ref: string | null
  youtube_url: string | null
  audio_url: string | null
  video_url: string | null
  thumbnail_url: string | null
  duration_mins: number | null
  is_published: boolean
  views: number
  created_at: string
  updated_at: string
  pastor?: Profile
}

export interface ChurchEvent {
  id: string
  title: string
  description: string | null
  location: string | null
  event_date: string
  end_date: string | null
  image_url: string | null
  created_by: string | null
  is_featured: boolean
  is_published: boolean
  created_at: string
  updated_at: string
  rsvp_count?: number
  user_rsvp?: boolean
}

export interface EventRsvp {
  id: string
  event_id: string
  user_id: string
  created_at: string
}

export interface PrayerRequest {
  id: string
  user_id: string | null
  name: string | null
  request: string
  is_anonymous: boolean
  status: PrayerStatus
  created_at: string
  updated_at: string
  profile?: Profile
}

export interface Announcement {
  id: string
  title: string
  content: string
  created_by: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface GalleryItem {
  id: string
  image_url: string
  caption: string | null
  created_by: string | null
  created_at: string
}

export interface DonationInfo {
  id: string
  provider: string
  number: string
  account_name: string
  instructions: string | null
  category: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DonationRecord {
  id: string
  user_id: string | null
  donor_name: string | null
  amount: number
  currency: string
  category: string
  reference: string | null
  note: string | null
  status: DonationStatus
  created_at: string
}

export interface SiteSetting {
  key: string
  value: string | null
  updated_at: string
}

// Supabase Database type (used by createClient generic)
export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> }
      sermons: { Row: Sermon; Insert: Partial<Sermon>; Update: Partial<Sermon> }
      events: { Row: ChurchEvent; Insert: Partial<ChurchEvent>; Update: Partial<ChurchEvent> }
      event_rsvps: { Row: EventRsvp; Insert: Partial<EventRsvp>; Update: Partial<EventRsvp> }
      prayer_requests: { Row: PrayerRequest; Insert: Partial<PrayerRequest>; Update: Partial<PrayerRequest> }
      announcements: { Row: Announcement; Insert: Partial<Announcement>; Update: Partial<Announcement> }
      gallery: { Row: GalleryItem; Insert: Partial<GalleryItem>; Update: Partial<GalleryItem> }
      donation_info: { Row: DonationInfo; Insert: Partial<DonationInfo>; Update: Partial<DonationInfo> }
      donation_records: { Row: DonationRecord; Insert: Partial<DonationRecord>; Update: Partial<DonationRecord> }
      site_settings: { Row: SiteSetting; Insert: Partial<SiteSetting>; Update: Partial<SiteSetting> }
    }
  }
}
