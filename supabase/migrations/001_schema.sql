-- ============================================================
-- FRUIT OF AFRICA CHURCH WEBSITE — DATABASE SCHEMA
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────
-- 1. PROFILES (extends auth.users)
-- ─────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  email       text,
  phone       text,
  avatar_url  text,
  role        text not null default 'member' check (role in ('member','pastor','admin')),
  bio         text,
  joined_at   timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────
-- 2. SERMONS
-- ─────────────────────────────────────────────
create table if not exists public.sermons (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  description       text,
  pastor_id         uuid references public.profiles(id) on delete set null,
  sermon_date       date not null default current_date,
  series            text,
  scripture_ref     text,
  youtube_url       text,
  audio_url         text,
  video_url         text,
  thumbnail_url     text,
  duration_mins     int,
  is_published      boolean default false,
  views             int default 0,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ─────────────────────────────────────────────
-- 3. EVENTS
-- ─────────────────────────────────────────────
create table if not exists public.events (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  location     text,
  event_date   timestamptz not null,
  end_date     timestamptz,
  image_url    text,
  created_by   uuid references public.profiles(id) on delete set null,
  is_featured  boolean default false,
  is_published boolean default true,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ─────────────────────────────────────────────
-- 4. EVENT RSVPs
-- ─────────────────────────────────────────────
create table if not exists public.event_rsvps (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references public.events(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (event_id, user_id)
);

-- ─────────────────────────────────────────────
-- 5. PRAYER REQUESTS
-- ─────────────────────────────────────────────
create table if not exists public.prayer_requests (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.profiles(id) on delete set null,
  name         text,
  request      text not null,
  is_anonymous boolean default false,
  status       text not null default 'pending' check (status in ('pending','praying','answered')),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ─────────────────────────────────────────────
-- 6. ANNOUNCEMENTS
-- ─────────────────────────────────────────────
create table if not exists public.announcements (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  content      text not null,
  created_by   uuid references public.profiles(id) on delete set null,
  is_published boolean default true,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ─────────────────────────────────────────────
-- 7. GALLERY
-- ─────────────────────────────────────────────
create table if not exists public.gallery (
  id         uuid primary key default gen_random_uuid(),
  image_url  text not null,
  caption    text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- 8. DONATION INFO (Admin sets Mobile Money details)
-- ─────────────────────────────────────────────
create table if not exists public.donation_info (
  id           uuid primary key default gen_random_uuid(),
  provider     text not null,
  number       text not null,
  account_name text not null,
  instructions text,
  category     text not null default 'General',
  is_active    boolean default true,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ─────────────────────────────────────────────
-- 9. DONATION RECORDS (members log after donating)
-- ─────────────────────────────────────────────
create table if not exists public.donation_records (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.profiles(id) on delete set null,
  donor_name   text,
  amount       numeric(10,2) not null,
  currency     text default 'LRD',
  category     text default 'General',
  reference    text,
  note         text,
  status       text default 'confirmed' check (status in ('confirmed','pending')),
  created_at   timestamptz default now()
);

-- ─────────────────────────────────────────────
-- 10. SITE SETTINGS (key-value store for admin)
-- ─────────────────────────────────────────────
create table if not exists public.site_settings (
  key        text primary key,
  value      text,
  updated_at timestamptz default now()
);

insert into public.site_settings (key, value) values
  ('church_name', 'Fruit of Africa'),
  ('pastor_name', 'Pastor Prince Bawoh'),
  ('church_address', 'Monrovia, Liberia'),
  ('church_phone', ''),
  ('church_email', ''),
  ('welcome_message', 'Welcome to Fruit of Africa Church — a Spirit-filled community rooted in the love of God.'),
  ('sunday_service_time', 'Sunday 9:00 AM & 11:00 AM'),
  ('midweek_service_time', 'Wednesday 6:00 PM')
on conflict (key) do nothing;
