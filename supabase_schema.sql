-- ============================================================================
-- RAPICREDITO SUPABASE MASTER SQL SCHEMA
-- ============================================================================
-- Ejecuta este script en el SQL Editor de tu proyecto de Supabase para:
-- 1. Crear todas las tablas con sus tipos, restricciones y claves foráneas.
-- 2. Configurar la seguridad de nivel de fila (Row Level Security - RLS).
-- 3. Configurar los triggers automáticos para nuevos usuarios registrados.
-- 4. Insertar los datos semilla oficiales en español (tipos de préstamo, blog, leads).
-- ============================================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. TIPOS ENUM PERSONALIZADOS
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 2. TABLAS DEL SISTEMA
-- ----------------------------------------------------------------------------

-- Perfiles de usuario (Vinculado a auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email text,
    full_name text,
    phone text,
    address text,
    avatar_url text,
    role user_role DEFAULT 'client'::user_role NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tipos de Préstamos
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
    interest_rate numeric NOT NULL, -- Tasa de interés anual (ej. 5.5 para 5.5%)
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Solicitudes de Préstamo
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

-- Cuentas Bancarias Registradas (España e Hispanoamérica)
CREATE TABLE IF NOT EXISTS public.bank_accounts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    account_holder text NOT NULL,
    iban text NOT NULL,
    bank_name text NOT NULL,
    country text DEFAULT 'España' NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Transacciones y Retiros de Fondos
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    loan_request_id uuid REFERENCES public.loan_requests(id) ON DELETE SET NULL,
    type transaction_type NOT NULL,
    amount numeric NOT NULL,
    status transaction_status DEFAULT 'pending'::transaction_status NOT NULL,
    bank_details text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Consultas Web / Leads de Asesoría de la Landing Page
CREATE TABLE IF NOT EXISTS public.consultation_leads (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    loan_type text NOT NULL,
    status text DEFAULT 'new' NOT NULL, -- 'new', 'contacted', 'converted', 'archived'
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Notificaciones del Sistema
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    is_popup boolean DEFAULT false NOT NULL,
    type text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Mensajería Interna / Chat de Soporte
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    message text NOT NULL,
    is_from_admin boolean DEFAULT false NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    attachment_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Contratos Digitales
CREATE TABLE IF NOT EXISTS public.contracts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    loan_request_id uuid REFERENCES public.loan_requests(id) ON DELETE CASCADE NOT NULL,
    file_url text NOT NULL,
    status text DEFAULT 'draft' NOT NULL,
    signed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Artículos de Blog / Consejos Financieros
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    slug text UNIQUE NOT NULL,
    title text NOT NULL,
    excerpt text NOT NULL,
    content text NOT NULL,
    cover_image text,
    category text DEFAULT 'Estrategia' NOT NULL,
    author text DEFAULT 'Equipo RapiCredito' NOT NULL,
    is_published boolean DEFAULT true NOT NULL,
    published_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Suscriptores al Boletín Informativo
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text UNIQUE NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Clientes Aprobados Destacados (Showcase)
CREATE TABLE IF NOT EXISTS public.approved_clients_showcase (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    client_name text NOT NULL,
    loan_type_name text NOT NULL,
    amount numeric NOT NULL,
    country_code text DEFAULT 'ES' NOT NULL,
    approved_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 3. SEGURIDAD Y POLÍTICAS RLS (Row Level Security)
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approved_clients_showcase ENABLE ROW LEVEL SECURITY;

-- Helper para verificar si el usuario actual es Administrador
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'::user_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para Profiles
CREATE POLICY "Users can view their own profile or admins can view all"
ON public.profiles FOR SELECT
USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id OR public.is_admin());

-- Políticas para Loan Types (Público de lectura, Solo Admin edita)
CREATE POLICY "Public read loan types"
ON public.loan_types FOR SELECT
USING (true);

CREATE POLICY "Admins manage loan types"
ON public.loan_types FOR ALL
USING (public.is_admin());

-- Políticas para Loan Requests
CREATE POLICY "Users view own loan requests or admins view all"
ON public.loan_requests FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users create own loan requests"
ON public.loan_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins update loan requests"
ON public.loan_requests FOR UPDATE
USING (public.is_admin());

-- Políticas para Bank Accounts
CREATE POLICY "Users view and manage own bank accounts or admins view"
ON public.bank_accounts FOR ALL
USING (auth.uid() = user_id OR public.is_admin());

-- Políticas para Transactions
CREATE POLICY "Users view own transactions or admins manage"
ON public.transactions FOR ALL
USING (auth.uid() = user_id OR public.is_admin());

-- Políticas para Consultation Leads (Público inserta, Admin gestiona)
CREATE POLICY "Anyone can insert consultation leads"
ON public.consultation_leads FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins manage consultation leads"
ON public.consultation_leads FOR ALL
USING (public.is_admin());

-- Políticas para Blog Posts & Showcase & Newsletter (Público lee, Admin edita)
CREATE POLICY "Public read blog posts"
ON public.blog_posts FOR SELECT
USING (is_published = true OR public.is_admin());

CREATE POLICY "Admins manage blog posts"
ON public.blog_posts FOR ALL
USING (public.is_admin());

-- Políticas para Showcase
CREATE POLICY "Public read showcase"
ON public.approved_clients_showcase FOR SELECT
USING (true);

CREATE POLICY "Anyone can subscribe to newsletter"
ON public.newsletter_subscribers FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins view newsletter subscribers"
ON public.newsletter_subscribers FOR ALL
USING (public.is_admin());

-- Políticas para Notifications & Messages
CREATE POLICY "Users manage own notifications"
ON public.notifications FOR ALL
USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users read and send own messages"
ON public.messages FOR ALL
USING (auth.uid() = sender_id OR auth.uid() = receiver_id OR public.is_admin());

-- ----------------------------------------------------------------------------
-- 4. TRIGGER AUTOMÁTICO: Crear perfil al registrarse en Auth
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'client'::user_role)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 5. DATOS SEMILLA OFICIALES (EN ESPAÑOL)
-- ----------------------------------------------------------------------------

-- Tipos de Préstamo
INSERT INTO public.loan_types (slug, name, description, icon, min_amount, max_amount, min_duration_months, max_duration_months, interest_rate, is_active)
VALUES
('microcredito-emergencia', 'Microcrédito de Emergencia', 'Solución urgente para gastos imprevistos, facturas médicas o reparaciones urgentes con respuesta inmediata en 15 minutos.', 'Zap', 500, 3000, 3, 12, 3.99, true),
('prestamo-personal', 'Préstamo Personal Rápido', 'Financiamiento flexible de libre inversión para tus proyectos, compras importantes, viajes familiares o consolidación.', 'CreditCard', 2000, 15000, 6, 48, 5.50, true),
('prestamo-hogar', 'Préstamo Remodelación de Hogar', 'Crédito preferencial diseñado para reformas de vivienda, obras, eficiencia energética, mobiliario o mejoras del hogar.', 'Home', 5000, 40000, 12, 84, 4.75, true),
('prestamo-vehiculo', 'Crédito Vehicular', 'Financia la compra de tu automóvil nuevo o usado, motocicleta o furgoneta comercial con cuotas fijas y transparentes.', 'Car', 3000, 25000, 12, 60, 5.20, true),
('prestamo-educativo', 'Préstamo Educativo', 'Invierte en tu futuro profesional: matrículas universitarias, posgrados, masters o cursos de especialización.', 'BookOpen', 1000, 15000, 6, 36, 4.25, true),
('prestamo-inversion', 'Préstamo Libre Inversión', 'Impulsa tu negocio, adquiere inventario o capital de trabajo con condiciones adaptadas al flujo de tu actividad.', 'TrendingUp', 3000, 30000, 12, 72, 5.90, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  interest_rate = EXCLUDED.interest_rate;

-- Artículos de Blog Iniciales
INSERT INTO public.blog_posts (slug, title, excerpt, content, cover_image, category, author, is_published)
VALUES
('5-estrategias-gestionar-presupuesto-2026', '5 Estrategias para Gestionar tu Presupuesto Personal en 2026', 'Aprende a planificar tus ingresos y gastos de forma inteligente para alcanzar tus objetivos financieros sin estrés.', 'La gestión eficaz del presupuesto personal es la clave para la estabilidad y el crecimiento financiero...', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80', 'Educación Financiera', 'Equipo RapiCredito', true),
('como-mejorar-tu-historial-crediticio', 'Cómo Mejorar tu Historial Crediticio y Acceder a Mejores Tasas', 'Consejos prácticos para optimizar tu perfil financiero y obtener aprobaciones de crédito inmediatas con condiciones preferenciales.', 'Tener un buen historial crediticio abre las puertas a mejores oportunidades de financiamiento con tasas reducidas...', 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80', 'Crédito & Finanzas', 'Equipo RapiCredito', true),
('guia-reformas-hogar-financiamiento', 'Guía para Reformar tu Vivienda con Financiamiento Inteligente', 'Descubre cómo calcular el retorno de inversión de una remodelación y elegir el préstamo adecuado para tu hogar.', 'Realizar mejoras en el hogar no solo mejora tu calidad de vida diaria, sino que incrementa sustancialmente el valor del inmueble...', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80', 'Hogar', 'Equipo RapiCredito', true)
ON CONFLICT (slug) DO NOTHING;

-- Leads Iniciales de Demostración
INSERT INTO public.consultation_leads (full_name, email, phone, loan_type, status, notes)
VALUES
('Carlos Mendoza', 'carlos.mendoza@email.com', '+34 612 345 678', 'prestamo-personal', 'new', 'Interesado en préstamo de 10.000 € para compra de equipamiento.'),
('Lucía Fernández', 'lucia.fdez@email.com', '+34 654 987 321', 'microcredito-emergencia', 'contacted', 'Llamada realizada. Enviada simulación por WhatsApp.'),
('Javier Castillo', 'j.castillo@gmail.com', '+51 987 654 321', 'prestamo-hogar', 'converted', 'Completó la solicitud formal en línea para reforma de piso.')
ON CONFLICT DO NOTHING;
