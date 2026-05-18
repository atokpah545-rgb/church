-- ============================================================
-- FRUIT OF AFRICA — ROW LEVEL SECURITY POLICIES
-- Run AFTER 001_schema.sql in Supabase SQL Editor
-- ============================================================

-- Helper function: get current user's role
create or replace function public.get_my_role()
returns text language sql stable security definer as $$
  select role from public.profiles where id = auth.uid()
$$;

-- ─────────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────────
alter table public.profiles enable row level security;

-- Anyone authenticated can view profiles (for sermon pages, etc.)
create policy "profiles_select_authenticated"
  on public.profiles for select
  using (auth.role() = 'authenticated');

-- Allow public to see basic profile info (pastor bio on About page)
create policy "profiles_select_public"
  on public.profiles for select
  using (true);

-- Users can insert their own profile (triggered by handle_new_user, but belt+suspenders)
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (id = auth.uid());

-- Users can update their own; admin can update any
create policy "profiles_update_own_or_admin"
  on public.profiles for update
  using (id = auth.uid() or get_my_role() = 'admin')
  with check (id = auth.uid() or get_my_role() = 'admin');

-- Only admin can delete profiles
create policy "profiles_delete_admin"
  on public.profiles for delete
  using (get_my_role() = 'admin');

-- ─────────────────────────────────────────────
-- SERMONS
-- ─────────────────────────────────────────────
alter table public.sermons enable row level security;

-- Public can view published sermons
create policy "sermons_select_published"
  on public.sermons for select
  using (is_published = true);

-- Pastors and admins can see all sermons (including unpublished)
create policy "sermons_select_staff"
  on public.sermons for select
  using (get_my_role() in ('pastor','admin'));

-- Pastors and admins can create sermons
create policy "sermons_insert_staff"
  on public.sermons for insert
  with check (get_my_role() in ('pastor','admin'));

-- Pastors can update their own; admins can update any
create policy "sermons_update_pastor_or_admin"
  on public.sermons for update
  using (
    (get_my_role() = 'pastor' and pastor_id = auth.uid())
    or get_my_role() = 'admin'
  );

-- Only admin can delete sermons
create policy "sermons_delete_admin"
  on public.sermons for delete
  using (get_my_role() = 'admin');

-- ─────────────────────────────────────────────
-- EVENTS
-- ─────────────────────────────────────────────
alter table public.events enable row level security;

-- Anyone can view published events
create policy "events_select_published"
  on public.events for select
  using (is_published = true);

-- Staff can see all events
create policy "events_select_staff"
  on public.events for select
  using (get_my_role() in ('pastor','admin'));

-- Staff can create events
create policy "events_insert_staff"
  on public.events for insert
  with check (get_my_role() in ('pastor','admin'));

-- Staff can update events
create policy "events_update_staff"
  on public.events for update
  using (get_my_role() in ('pastor','admin'));

-- Only admin can delete events
create policy "events_delete_admin"
  on public.events for delete
  using (get_my_role() = 'admin');

-- ─────────────────────────────────────────────
-- EVENT RSVPs
-- ─────────────────────────────────────────────
alter table public.event_rsvps enable row level security;

-- Users can see their own RSVPs; admins/pastors can see all
create policy "rsvps_select"
  on public.event_rsvps for select
  using (user_id = auth.uid() or get_my_role() in ('pastor','admin'));

-- Authenticated users can RSVP for themselves only
create policy "rsvps_insert_own"
  on public.event_rsvps for insert
  with check (user_id = auth.uid() and auth.role() = 'authenticated');

-- Users can delete their own RSVP
create policy "rsvps_delete_own"
  on public.event_rsvps for delete
  using (user_id = auth.uid() or get_my_role() = 'admin');

-- ─────────────────────────────────────────────
-- PRAYER REQUESTS
-- ─────────────────────────────────────────────
alter table public.prayer_requests enable row level security;

-- Non-anonymous requests: owner can see own; anonymous: only staff
create policy "prayer_select_own_or_staff"
  on public.prayer_requests for select
  using (
    (user_id = auth.uid() and is_anonymous = false)
    or get_my_role() in ('pastor','admin')
  );

-- Anyone can submit a prayer request (anon or member)
create policy "prayer_insert_anyone"
  on public.prayer_requests for insert
  with check (true);

-- Owners can update their own; staff can update status
create policy "prayer_update"
  on public.prayer_requests for update
  using (
    user_id = auth.uid()
    or get_my_role() in ('pastor','admin')
  );

-- Only admin can delete
create policy "prayer_delete_admin"
  on public.prayer_requests for delete
  using (get_my_role() = 'admin');

-- ─────────────────────────────────────────────
-- ANNOUNCEMENTS
-- ─────────────────────────────────────────────
alter table public.announcements enable row level security;

-- Anyone can view published announcements
create policy "announcements_select_published"
  on public.announcements for select
  using (is_published = true);

-- Staff can see all
create policy "announcements_select_staff"
  on public.announcements for select
  using (get_my_role() in ('pastor','admin'));

-- Staff can insert
create policy "announcements_insert_staff"
  on public.announcements for insert
  with check (get_my_role() in ('pastor','admin'));

-- Staff can update
create policy "announcements_update_staff"
  on public.announcements for update
  using (get_my_role() in ('pastor','admin'));

-- Admin can delete
create policy "announcements_delete_admin"
  on public.announcements for delete
  using (get_my_role() = 'admin');

-- ─────────────────────────────────────────────
-- GALLERY
-- ─────────────────────────────────────────────
alter table public.gallery enable row level security;

-- Anyone can view gallery
create policy "gallery_select_public"
  on public.gallery for select
  using (true);

-- Only admin can manage gallery
create policy "gallery_insert_admin"
  on public.gallery for insert
  with check (get_my_role() = 'admin');

create policy "gallery_delete_admin"
  on public.gallery for delete
  using (get_my_role() = 'admin');

-- ─────────────────────────────────────────────
-- DONATION INFO
-- ─────────────────────────────────────────────
alter table public.donation_info enable row level security;

-- Anyone can view donation info (so visitors know where to send money)
create policy "donation_info_select_public"
  on public.donation_info for select
  using (true);

-- Only admin can manage
create policy "donation_info_insert_admin"
  on public.donation_info for insert
  with check (get_my_role() = 'admin');

create policy "donation_info_update_admin"
  on public.donation_info for update
  using (get_my_role() = 'admin');

create policy "donation_info_delete_admin"
  on public.donation_info for delete
  using (get_my_role() = 'admin');

-- ─────────────────────────────────────────────
-- DONATION RECORDS
-- ─────────────────────────────────────────────
alter table public.donation_records enable row level security;

-- Users see own records; admin sees all
create policy "donation_records_select"
  on public.donation_records for select
  using (user_id = auth.uid() or get_my_role() = 'admin');

-- Authenticated users can log donations
create policy "donation_records_insert"
  on public.donation_records for insert
  with check (auth.role() = 'authenticated');

-- Admin can update/delete
create policy "donation_records_update_admin"
  on public.donation_records for update
  using (get_my_role() = 'admin');

create policy "donation_records_delete_admin"
  on public.donation_records for delete
  using (get_my_role() = 'admin');

-- ─────────────────────────────────────────────
-- SITE SETTINGS
-- ─────────────────────────────────────────────
alter table public.site_settings enable row level security;

-- Anyone can read settings (church name, service times displayed publicly)
create policy "site_settings_select_public"
  on public.site_settings for select
  using (true);

-- Only admin can write settings
create policy "site_settings_insert_admin"
  on public.site_settings for insert
  with check (get_my_role() = 'admin');

create policy "site_settings_update_admin"
  on public.site_settings for update
  using (get_my_role() = 'admin');

-- ─────────────────────────────────────────────
-- ENABLE REALTIME for live updates
-- ─────────────────────────────────────────────
alter publication supabase_realtime add table public.sermons;
alter publication supabase_realtime add table public.events;
alter publication supabase_realtime add table public.prayer_requests;
alter publication supabase_realtime add table public.announcements;
alter publication supabase_realtime add table public.donation_info;
