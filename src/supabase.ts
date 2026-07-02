import { createClient } from '@supabase/supabase-js';

// Load Supabase URL and Anon Key from environment variables (Vite-prefixed)
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * DATABASE SCHEMA SQL FOR SUPABASE (Copy & paste into Supabase SQL Editor):
 * 
-- 1. PROFILES TABLE
create table if nulls distinct public.profiles (
  uid text primary key,
  email text not null,
  phone text,
  name text,
  photo_url text,
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  role text check (role in ('user', 'admin')) default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;
create policy "Allow public read access to profiles" on public.profiles for select using (true);
create policy "Allow users to insert/update their own profile" on public.profiles for all using (auth.uid() = uid or uid = uid);

-- 2. COMPANIONS TABLE
create table if nulls distinct public.companions (
  id text primary key,
  name text not null,
  age integer,
  gender text,
  location text,
  photo_url text,
  rate numeric,
  services text[], -- Array of services
  about text,
  availability text check (availability in ('Available', 'Busy', 'Offline')) default 'Available',
  rating numeric default 5.0,
  reviews_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for companions
alter table public.companions enable row level security;
create policy "Allow public read access to companions" on public.companions for select using (true);
create policy "Allow write access to companions for all users" on public.companions for all using (true);

-- 3. BOOKINGS TABLE
create table if nulls distinct public.bookings (
  id text primary key,
  user_id text not null,
  user_email text not null,
  user_name text,
  companion_id text not null,
  companion_name text not null,
  companion_photo_url text,
  activity text,
  duration integer,
  total_amount numeric,
  payment_method text check (payment_method in ('JazzCash', 'EasyPaisa')),
  wallet_number text,
  last_4_digits text,
  status text check (status in ('pending_verification', 'confirmed', 'cancelled')) default 'pending_verification',
  booking_date text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for bookings
alter table public.bookings enable row level security;
create policy "Allow all actions on bookings" on public.bookings for all using (true);

-- Seed initial companions (optional)
insert into public.companions (id, name, age, gender, location, photo_url, rate, services, about, availability, rating, reviews_count) values
('comp_1', 'Aliza Sheikh', 23, 'Female', 'Lahore, Pakistan', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400', 3000, array['Dining', 'Movies', 'Travel', 'Spending a Day/Night'], 'Professional host and brilliant conversationalist. Loves exploring Lahore coffee spots and food streets.', 'Available', 4.9, 28),
('comp_2', 'Hamza Butt', 25, 'Male', 'Islamabad, Pakistan', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400', 2500, array['Movies', 'Travel', 'Call Companionship'], 'Nature explorer, photographer, and trekking enthusiast. Great company for long drives and outdoor trips around Margalla Hills.', 'Available', 4.8, 19),
('comp_3', 'Zara Khan', 24, 'Female', 'Karachi, Pakistan', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400', 3500, array['Dining', 'Movies', 'Spending a Day/Night', 'Call Companionship'], 'Fashion designer and gourmet foodie. Let me guide you to the premium seaside dining and entertainment spots in Clifton/DHA.', 'Busy', 5.0, 34);
 */
