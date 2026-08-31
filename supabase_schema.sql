-- RapiCredito Supabase SQL Schema
-- Paste this script into your Supabase SQL Editor to initialize your database structure,
-- configure Row Level Security (RLS) policies, and set up user profiles.

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DEFINE ENUMS IF THEY DO NOT EXIST
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('client', 'admin');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'loan_status') THEN
    CREATE TYPE loan_status AS ENUM ('pending', 'under_review', 'approved', 'rejected', 'disbursed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
    CREATE TYPE transaction_type AS ENUM ('disbursement', 'withdrawal', 'repayment');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
    CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'showcase_status') THEN
    CREATE TYPE showcase_status AS ENUM ('approved', 'disbursed');
  END IF;
END$$;

-- 2. CREATE TABLES IF NOT EXISTS
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email text,
    full_name text,
    phone text,
    address text,
    avatar_url text,
    role user_role DEFAULT 'client'::user_role,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.loan_types (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    slug text UNIQUE NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    icon text NOT NULL,
    min_amount numeric NOT NULL,
    max_amount numeric NOT NULL,
    min_duration_months integer NOT NULL,
    max_duration_months integer NOT NULL,
    interest_rate numeric NOT NULL, -- Annual interest rate (e.g. 5.99 for 5.99%)
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.loan_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    loan_type_id uuid REFERENCES public.loan_types(id) ON DELETE RESTRICT NOT NULL,
    amount_requested numeric NOT NULL,
    duration_months integer NOT NULL,
    status loan_status DEFAULT 'pending'::loan_status NOT NULL,
    purpose text NOT NULL,
    monthly_income numeric NOT NULL,
    documents jsonb DEFAULT '[]'::jsonb NOT NULL,
    admin_note text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.bank_accounts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    account_holder text NOT NULL,
    iban text NOT NULL,
    bank_name text NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    loan_request_id uuid REFERENCES public.loan_requests(id) ON DELETE SET NULL,
    type transaction_type NOT NULL,
    amount numeric NOT NULL,
    status transaction_status DEFAULT 'pending'::transaction_status NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    type text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content text NOT NULL,
    is_from_admin boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.contracts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    loan_request_id uuid REFERENCES public.loan_requests(id) ON DELETE CASCADE NOT NULL,
    file_url text,
    content text DEFAULT '' NOT NULL,
    attachments text[] DEFAULT '{}'::text[] NOT NULL,
    status text DEFAULT 'draft' NOT NULL,
    signed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.blog_posts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    slug text UNIQUE NOT NULL,
    excerpt text NOT NULL,
    content text NOT NULL,
    cover_image text,
    category text NOT NULL,
    author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_published boolean DEFAULT false NOT NULL,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text UNIQUE NOT NULL,
    subscribed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);

CREATE TABLE IF NOT EXISTS public.approved_clients_showcase (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    display_name text NOT NULL,
    loan_type text NOT NULL,
    amount_range text NOT NULL,
    testimonial text NOT NULL,
    photo_url text,
    status showcase_status DEFAULT 'approved'::showcase_status NOT NULL,
    is_public boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Pre-seed System Admin Profile to allow messaging foreign key compliance
INSERT INTO public.profiles (id, full_name, role, phone, address, avatar_url, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'RapiCredito Admin',
  'admin'::user_role,
  '+34 900 123 456',
  'Sede Central de Administración',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=admin',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================================

-- Enable RLS everywhere (idempotent)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approved_clients_showcase ENABLE ROW LEVEL SECURITY;

-- Helper Function to check if user is admin (recursion-safe check using public profiles role)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'::user_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger BEFORE UPDATE to prevent non-admins from changing their role
CREATE OR REPLACE FUNCTION public.check_profile_update()
RETURNS trigger AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'::user_role
  ) THEN
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.check_profile_update();


-- POLICIES FOR profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR is_admin());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR is_admin());

DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles" ON public.profiles
    FOR INSERT WITH CHECK (is_admin());

-- POLICIES FOR loan_types
DROP POLICY IF EXISTS "Anyone can view active loan types" ON public.loan_types;
CREATE POLICY "Anyone can view active loan types" ON public.loan_types
    FOR SELECT USING (is_active = true OR is_admin());

DROP POLICY IF EXISTS "Only admins can modify loan types" ON public.loan_types;
CREATE POLICY "Only admins can modify loan types" ON public.loan_types
    FOR ALL USING (is_admin());

-- POLICIES FOR loan_requests
DROP POLICY IF EXISTS "Clients can view their own loan requests" ON public.loan_requests;
CREATE POLICY "Clients can view their own loan requests" ON public.loan_requests
    FOR SELECT USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Clients can insert their own loan requests" ON public.loan_requests;
CREATE POLICY "Clients can insert their own loan requests" ON public.loan_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Only admins can modify loan requests" ON public.loan_requests;
CREATE POLICY "Only admins can modify loan requests" ON public.loan_requests
    FOR UPDATE USING (is_admin());

-- POLICIES FOR bank_accounts
DROP POLICY IF EXISTS "Clients can view their own bank accounts" ON public.bank_accounts;
CREATE POLICY "Clients can view their own bank accounts" ON public.bank_accounts
    FOR SELECT USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Clients can manage their own bank accounts" ON public.bank_accounts;
CREATE POLICY "Clients can manage their own bank accounts" ON public.bank_accounts
    FOR ALL USING (auth.uid() = user_id);

-- POLICIES FOR transactions
DROP POLICY IF EXISTS "Clients can view their own transactions" ON public.transactions;
CREATE POLICY "Clients can view their own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Only admins can manage transactions" ON public.transactions;
CREATE POLICY "Only admins can manage transactions" ON public.transactions
    FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Clients can request withdrawal (insert pending transaction)" ON public.transactions;
CREATE POLICY "Clients can request withdrawal (insert pending transaction)" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id AND type = 'withdrawal'::transaction_type AND status = 'pending'::transaction_status);

-- POLICIES FOR notifications
DROP POLICY IF EXISTS "Clients can view their own notifications" ON public.notifications;
CREATE POLICY "Clients can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Clients can update their own notifications (read status)" ON public.notifications;
CREATE POLICY "Clients can update their own notifications (read status)" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Clients can insert their own notifications" ON public.notifications;
CREATE POLICY "Clients can insert their own notifications" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;
CREATE POLICY "Admins can manage all notifications" ON public.notifications
    FOR ALL USING (is_admin());

-- POLICIES FOR messages
DROP POLICY IF EXISTS "Users can view their own chat messages" ON public.messages;
CREATE POLICY "Users can view their own chat messages" ON public.messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id OR is_admin());

DROP POLICY IF EXISTS "Users can insert chat messages" ON public.messages;
CREATE POLICY "Users can insert chat messages" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id OR is_admin());

-- POLICIES FOR contracts
DROP POLICY IF EXISTS "Users can view their own contracts" ON public.contracts;
CREATE POLICY "Users can view their own contracts" ON public.contracts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.loan_requests
            WHERE public.loan_requests.id = public.contracts.loan_request_id
            AND (
                (public.loan_requests.user_id = auth.uid() AND public.contracts.status = 'sent')
                OR is_admin()
            )
        )
    );

DROP POLICY IF EXISTS "Clients can sign their own contracts" ON public.contracts;
CREATE POLICY "Clients can sign their own contracts" ON public.contracts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.loan_requests
            WHERE public.loan_requests.id = public.contracts.loan_request_id
            AND public.loan_requests.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins can manage contracts" ON public.contracts;
CREATE POLICY "Admins can manage contracts" ON public.contracts
    FOR ALL USING (is_admin());

-- POLICIES FOR blog_posts
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON public.blog_posts;
CREATE POLICY "Anyone can view published blog posts" ON public.blog_posts
    FOR SELECT USING (is_published = true OR is_admin());

DROP POLICY IF EXISTS "Only admins can manage blog posts" ON public.blog_posts;
CREATE POLICY "Only admins can manage blog posts" ON public.blog_posts
    FOR ALL USING (is_admin());

-- POLICIES FOR newsletter_subscribers
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Only admins can view subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Only admins can view subscribers" ON public.newsletter_subscribers
    FOR SELECT USING (is_admin());

-- POLICIES FOR approved_clients_showcase
DROP POLICY IF EXISTS "Anyone can view public showcase" ON public.approved_clients_showcase;
CREATE POLICY "Anyone can view public showcase" ON public.approved_clients_showcase
    FOR SELECT USING (is_public = true OR auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Only admins can manage showcase" ON public.approved_clients_showcase;
CREATE POLICY "Only admins can manage showcase" ON public.approved_clients_showcase
    FOR ALL USING (is_admin());


-- ========================================================================
-- AUTHENTICATION AUTO-PROFILE TRIGGER
-- ========================================================================

-- Automatically create a profile row in public.profiles when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
      new.id,
      new.email,
      COALESCE(new.raw_user_meta_data->>'full_name', new.email, 'Usuario'),
      'client'::user_role
    );
  EXCEPTION WHEN OTHERS THEN
    -- Prevent rolling back the main user creation if profile creation fails
    RAISE WARNING 'Error creating profile for user %: %', new.id, SQLERRM;
  END;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed default loan types with UUID identifiers
INSERT INTO public.loan_types (id, slug, name, description, icon, min_amount, max_amount, min_duration_months, max_duration_months, interest_rate, is_active)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'microcredito-emergencia', 'Microcrédito de Emergencia', 'Préstamos rápidos y de corto plazo para cubrir imprevistos urgentes con aprobación express en 15 minutos.', 'Zap', 500, 3000, 3, 12, 4.99, true),
  ('22222222-2222-2222-2222-222222222222', 'prestamo-personal', 'Préstamo Personal Rápido', 'Crédito flexible y rápido de libre inversión para todas tus necesidades privadas, sin papeleos excesivos.', 'CreditCard', 2000, 15000, 6, 60, 5.49, true),
  ('33333333-3333-3333-3333-333333333333', 'prestamo-hogar', 'Préstamo para el Hogar', 'Financiamiento favorable y destinado a la remodelación, renovación energética o compra de muebles para tu casa.', 'Home', 5000, 40000, 12, 120, 3.89, true),
  ('44444444-4444-4444-4444-444444444444', 'prestamo-vehiculo', 'Préstamo para Vehículos', 'Financiamiento rápido y accesible para vehículos nuevos o usados con tasa de interés fija.', 'Car', 3000, 25000, 12, 84, 4.25, true),
  ('55555555-5555-5555-5555-555555555555', 'prestamo-educativo', 'Préstamo Educativo y Estudios', 'Diseñado para estudiantes y profesionales para financiar matrículas, carreras universitarias o cursos.', 'GraduationCap', 1000, 15000, 6, 60, 3.50, true)
ON CONFLICT (id) DO NOTHING;

-- Enable Realtime safely (recreate publication)
DO $$
BEGIN
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
EXCEPTION WHEN OTHERS THEN
  -- Ignore
END$$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.loan_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contracts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;

-- MIGRATION UPGRADE DES TABLES EXISTANTES SANS PERTE DE DONNÉES
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='contracts' AND column_name='content') THEN
    ALTER TABLE public.contracts ADD COLUMN content text DEFAULT '' NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='contracts' AND column_name='attachments') THEN
    ALTER TABLE public.contracts ADD COLUMN attachments text[] DEFAULT '{}'::text[] NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='contracts' AND column_name='status') THEN
    ALTER TABLE public.contracts ADD COLUMN status text DEFAULT 'draft' NOT NULL;
  END IF;
  ALTER TABLE public.contracts ALTER COLUMN file_url DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN
END$$;
