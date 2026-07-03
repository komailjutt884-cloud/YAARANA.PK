import { supabaseClient } from './supabaseClient';

export const isSupabaseConfigured = true;

export const supabase = supabaseClient;

/**
 * DATABASE SCHEMA SQL FOR SUPABASE (Copy & paste into Supabase SQL Editor):
 * 
-- ============================================================================
-- 1. PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  uid text PRIMARY KEY,
  email text NOT NULL,
  phone text,
  name text,
  photo_url text,
  status text CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  role text CHECK (role IN ('user', 'admin')) DEFAULT 'user',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
DROP POLICY IF EXISTS "Allow users to view their own profile" ON public.profiles;
CREATE POLICY "Allow users to view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid()::text = uid);

DROP POLICY IF EXISTS "Allow admins to view all profiles" ON public.profiles;
CREATE POLICY "Allow admins to view all profiles" 
  ON public.profiles FOR SELECT 
  USING ((auth.jwt() ->> 'email') = 'komailjutt884@gmail.com');

DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.profiles;
CREATE POLICY "Allow users to insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid()::text = uid);

DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
CREATE POLICY "Allow users to update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid()::text = uid)
  WITH CHECK (auth.uid()::text = uid);

DROP POLICY IF EXISTS "Allow admins to update any profile status" ON public.profiles;
CREATE POLICY "Allow admins to update any profile status" 
  ON public.profiles FOR UPDATE 
  USING ((auth.jwt() ->> 'email') = 'komailjutt884@gmail.com');


-- ============================================================================
-- 2. COMPANIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.companions (
  id text PRIMARY KEY,
  name text NOT NULL,
  age integer,
  gender text,
  location text,
  city text,
  photo_url text,
  rate numeric,
  services text[], -- Array of services
  about text,
  availability text CHECK (availability IN ('Available', 'Busy', 'Offline')) DEFAULT 'Available',
  rating numeric DEFAULT 5.0,
  reviews_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.companions ENABLE ROW LEVEL SECURITY;

-- Companions RLS Policies
DROP POLICY IF EXISTS "Allow public read access to companions" ON public.companions;
CREATE POLICY "Allow public read access to companions" 
  ON public.companions FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Allow admins to insert companions" ON public.companions;
CREATE POLICY "Allow admins to insert companions" 
  ON public.companions FOR INSERT 
  WITH CHECK ((auth.jwt() ->> 'email') = 'komailjutt884@gmail.com');

DROP POLICY IF EXISTS "Allow admins to update companions" ON public.companions;
CREATE POLICY "Allow admins to update companions" 
  ON public.companions FOR UPDATE 
  USING ((auth.jwt() ->> 'email') = 'komailjutt884@gmail.com');

DROP POLICY IF EXISTS "Allow admins to delete companions" ON public.companions;
CREATE POLICY "Allow admins to delete companions" 
  ON public.companions FOR DELETE 
  USING ((auth.jwt() ->> 'email') = 'komailjutt884@gmail.com');


-- ============================================================================
-- 3. BOOKINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  user_email text NOT NULL,
  user_name text,
  companion_id text NOT NULL,
  companion_name text NOT NULL,
  companion_photo_url text,
  activity text,
  duration integer,
  total_amount numeric,
  payment_method text CHECK (payment_method IN ('JazzCash', 'EasyPaisa')),
  wallet_number text,
  last_4_digits text,
  status text CHECK (status IN ('pending_verification', 'confirmed', 'cancelled')) DEFAULT 'pending_verification',
  booking_date text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Bookings RLS Policies
DROP POLICY IF EXISTS "Allow users and admins to select bookings" ON public.bookings;
CREATE POLICY "Allow users and admins to select bookings" 
  ON public.bookings FOR SELECT 
  USING (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = 'komailjutt884@gmail.com');

DROP POLICY IF EXISTS "Allow users to insert their own bookings" ON public.bookings;
CREATE POLICY "Allow users to insert their own bookings" 
  ON public.bookings FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Allow users and admins to update bookings" ON public.bookings;
CREATE POLICY "Allow users and admins to update bookings" 
  ON public.bookings FOR UPDATE 
  USING (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = 'komailjutt884@gmail.com');

DROP POLICY IF EXISTS "Allow admins to delete bookings" ON public.bookings;
CREATE POLICY "Allow admins to delete bookings" 
  ON public.bookings FOR DELETE 
  USING ((auth.jwt() ->> 'email') = 'komailjutt884@gmail.com');


-- ============================================================================
-- SEED INITIAL DATA
-- ============================================================================
-- (No initial companions are seeded; the database starts empty)
 */

