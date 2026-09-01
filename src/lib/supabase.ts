import { createClient } from '@supabase/supabase-js';
import { 
  Profile, 
  LoanType, 
  LoanRequest, 
  BankAccount, 
  Transaction, 
  Notification, 
  Message, 
  Contract, 
  BlogPost, 
  NewsletterSubscriber, 
  ApprovedClientShowcase,
  LoanStatus,
  TransactionType,
  TransactionStatus,
  ShowcaseStatus,
  UserRole
} from '../types';

export type { Profile, UserRole };

// Helper to generate a valid version-4 UUID
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Helper functions to map the frontend's 'user-admin-1' string ID to a valid UUID format for Supabase
export const mapUUID = (id: string): string => {
  if (id === 'user-admin-1') {
    return '00000000-0000-0000-0000-000000000001';
  }
  return id;
};

export const unmapUUID = (id: string): string => {
  if (id === '00000000-0000-0000-0000-000000000001') {
    return 'user-admin-1';
  }
  return id;
};

// ============================================================================
// CLEAN UP OLD LOCAL STORAGE CACHES (TO REMOVE PERSISTENT LOCAL DATA)
// ============================================================================
// ============================================================================
// CLEAN UP OLD LOCAL STORAGE CACHES (TO REMOVE PERSISTENT LOCAL DATA)
// ============================================================================
try {
  localStorage.removeItem('rapicredito_db_profiles');
  localStorage.removeItem('rapicredito_db_loan_types');
  localStorage.removeItem('rapicredito_db_loan_requests');
  localStorage.removeItem('rapicredito_db_bank_accounts');
  localStorage.removeItem('rapicredito_db_transactions');
  localStorage.removeItem('rapicredito_db_notifications');
  localStorage.removeItem('rapicredito_db_messages');
  localStorage.removeItem('rapicredito_db_contracts');
  localStorage.removeItem('rapicredito_db_blog_posts');
  localStorage.removeItem('rapicredito_db_newsletter_subscribers');
  localStorage.removeItem('rapicredito_db_approved_clients_showcase');
  localStorage.removeItem('rapicredito_session');
} catch (e) {
  console.warn('Error clearing old localStorage caches:', e);
}

// ============================================================================
// INITIAL REALISTIC DATA (USED AS DEVELOPMENT FALLBACK IF SUPABASE IS OFFLINE)
// ============================================================================

const INITIAL_LOAN_TYPES: LoanType[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    slug: 'microcredito-emergencia',
    name: 'Microcrédito de Emergencia',
    description: 'Pequeños préstamos a corto plazo para cubrir imprevistos con aprobación inmediata en 15 minutos.',
    icon: 'Zap',
    min_amount: 500,
    max_amount: 3000,
    min_duration_months: 3,
    max_duration_months: 12,
    interest_rate: 4.99,
    is_active: true,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: 'https://images.unsplash.com/photo-1616077168079-7e09a677fb2c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    slug: 'prestamo-personal',
    name: 'Préstamo Personal Rápido',
    description: 'Préstamo libre y flexible para todas tus necesidades personales, 100% online y sin papeleos.',
    icon: 'CreditCard',
    min_amount: 2000,
    max_amount: 15000,
    min_duration_months: 6,
    max_duration_months: 60,
    interest_rate: 5.49,
    is_active: true,
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    slug: 'prestamo-hogar',
    name: 'Préstamo Remodelación de Hogar',
    description: 'Financiamiento favorable para reformas, decoración de vivienda o equipamiento del hogar.',
    icon: 'Home',
    min_amount: 5000,
    max_amount: 40000,
    min_duration_months: 12,
    max_duration_months: 120,
    interest_rate: 3.89,
    is_active: true,
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    slug: 'prestamo-vehiculo',
    name: 'Préstamo Vehicular',
    description: 'Financia la compra de vehículos nuevos o seminuevos de forma veloz con tasa de interés fija.',
    icon: 'Car',
    min_amount: 3000,
    max_amount: 25000,
    min_duration_months: 12,
    max_duration_months: 84,
    interest_rate: 4.25,
    is_active: true,
    created_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    slug: 'prestamo-educativo',
    name: 'Préstamo Educativo y Estudios',
    description: 'Diseñado para financiar matrículas académicas, programas universitarios o posgrados.',
    icon: 'GraduationCap',
    min_amount: 1000,
    max_amount: 15000,
    min_duration_months: 6,
    max_duration_months: 60,
    interest_rate: 2.99,
    is_active: true,
    created_at: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'lt-6',
    slug: 'prestamo-libre-inversion',
    name: 'Préstamo de Libres Inversiones',
    description: 'Crédito multipropósito para emprender, realizar viajes en familia o consolidar proyectos.',
    icon: 'Palmtree',
    min_amount: 2000,
    max_amount: 12000,
    min_duration_months: 6,
    max_duration_months: 48,
    interest_rate: 4.75,
    is_active: true,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'
  }
];

const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    title: '5 Consejos para Mejorar tu Historial Crediticio Rápidamente',
    slug: '5-consejos-historial-crediticio',
    excerpt: 'Descubre cómo optimizar tu perfil financiero antes de solicitar tu próximo préstamo digital.',
    content: `El historial crediticio es un factor clave que evalúan las instituciones financieras al recibir tu solicitud de crédito. Mantener un historial positivo te permite acceder a montos más elevados y tasas de interés súper competitivas.

Aquí tienes 5 pasos respaldados por expertos para fortalecer tu perfil:

### 1. Mantén tus ingresos organizados
La estabilidad laboral y la regularidad de tus ingresos demuestran capacidad de pago. Si trabajas de forma independiente, asegúrate de canalizar tus ingresos mediante una cuenta bancaria activa.

### 2. Reduce tus deudas de corto plazo
Los sobregiros y saldos altos en tarjetas de crédito reducen tu capacidad de pago mensual. Antes de solicitar un nuevo préstamo, procura disminuir o saldar compromisos pequeños.

### 3. Paga tus servicios a tiempo
El pago puntual de facturas y obligaciones demuestra responsabilidad financiera. Configura recordatorios o pagos automáticos para evitar mora.

### 4. Evita sobrecargarte como fiador
Recuerda que actuar como garante o aval de terceros compromete tu propia capacidad crediticia. Prioriza tus inversiones y salud financiera personal.

### 5. Prepara tu documentación digital
Tener tus comprobantes de ingresos y documento de identidad listos agiliza el trámite. En **RapiCredito**, la validación de documentos es 100% digital y te garantiza respuesta en 15 minutos.`,
    cover_image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
    category: 'Educación Financiera',
    is_published: true,
    published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'a2222222-2222-2222-2222-222222222222',
    title: '¿Qué es la Consolidación de Deudas y Cuándo Conviene Usarla?',
    slug: 'consolidacion-de-deudas-guia',
    excerpt: 'Aprende a unificar tus cuotas pendientes en un solo préstamo más claro y económico.',
    content: `¿Tienes varios compromisos financieros repartidos en diferentes fechas y cobros de intereses altos? La consolidación de deudas mediante **RapiCredito** puede ser la estrategia ideal para ti.

Consolidar tus deudas consiste en tomar un único préstamo para liquidar todas tus obligaciones pequeñas. De esta forma, reúnes tus pagos en una sola cuota mensual adaptada a tu presupuesto.

### Principales Beneficios:
- **Una sola cuota mensual**: Facilidad total de control sin olvidar fechas límite.
- **Tasa de interés unificada**: Disfruta de condiciones transparentes y fijas.
- **Mejor planificación**: Ajusta el plazo para reducir el pago mensual que desembolsas.`,
    cover_image: 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?auto=format&fit=crop&w=800&q=80',
    category: 'Guías de Préstamos',
    is_published: true,
    published_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_SHOWCASE: ApprovedClientShowcase[] = [
  {
    id: 'b1111111-1111-1111-1111-111111111111',
    user_id: 'client-user-id',
    display_name: 'Carlos M.',
    loan_type: 'Préstamo Personal Rápido',
    amount_range: '5.000 € - 10.000 €',
    testimonial: 'El proceso fue increíblemente sencillo. Completé el formulario en mi teléfono, subí mis documentos y el desembolso se realizó de forma veloz. ¡Transparencia total con RapiCredito!',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
    status: 'disbursed',
    is_public: true,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_PROFILES: Profile[] = [
  {
    id: 'user-client-1',
    full_name: 'Carlos Mendoza',
    phone: '+34 612 345 678',
    address: 'Calle Mayor 14, Madrid',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    role: 'client',
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// ============================================================================
// SUPABASE CLIENT INITIALIZATION
// ============================================================================

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

const isRealSupabaseConfigured = 
  supabaseUrl && 
  supabaseUrl !== 'https://your-project-id.supabase.co' && 
  supabaseAnonKey && 
  supabaseAnonKey !== 'your-anon-api-key';

export const supabase = isRealSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// ============================================================================
// GLOBAL APPLICATION IN-MEMORY DATABASE CACHE (NO LOCALSTORAGE PERSISTENCE)
// ============================================================================

export let memoryCache = {
  profiles: [] as Profile[],
  loanTypes: INITIAL_LOAN_TYPES,
  loanRequests: [] as LoanRequest[],
  bankAccounts: [] as BankAccount[],
  transactions: [] as Transaction[],
  notifications: [] as Notification[],
  messages: [] as Message[],
  contracts: [] as Contract[],
  blogPosts: INITIAL_BLOG_POSTS,
  newsletterSubscribers: [] as NewsletterSubscriber[],
  approvedClientsShowcase: INITIAL_SHOWCASE
};

export let currentUser: SessionUser | null = null;
let isCacheLoaded = false;
const cacheLoadedCallbacks: (() => void)[] = [];

export const onCacheLoaded = (cb: () => void) => {
  if (isCacheLoaded) {
    cb();
  } else {
    cacheLoadedCallbacks.push(cb);
  }
};

// ============================================================================
// REALTIME NOTIFICATIONS AND CHAT BROADCASTER
// ============================================================================

type SubscriptionCallback = (payload: any) => void;
const subscribers: Map<string, Set<SubscriptionCallback>> = new Map();

export const realtimeService = {
  subscribe(channel: string, callback: SubscriptionCallback): () => void {
    if (!subscribers.has(channel)) {
      subscribers.set(channel, new Set());
    }
    subscribers.get(channel)!.add(callback);
    return () => {
      const set = subscribers.get(channel);
      if (set) {
        set.delete(callback);
        if (set.size === 0) subscribers.delete(channel);
      }
    };
  },
  broadcast(channel: string, payload: any): void {
    const set = subscribers.get(channel);
    if (set) {
      set.forEach(cb => cb(payload));
    }
  }
};

// ============================================================================
// APPLICATION CACHE INITIALIZER (CALLED ON BOOTSTRAP IN App.tsx)
// ============================================================================

let isRealtimeListening = false;

export const initializeApplication = async (): Promise<SessionUser | null> => {
  if (!supabase) {
    isCacheLoaded = true;
    cacheLoadedCallbacks.forEach(cb => cb());
    return null;
  }

  // Set up realtime sync for database changes if not already listening
  if (!isRealtimeListening) {
    isRealtimeListening = true;
    supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, async (payload) => {
        console.log('Realtime database change detected:', payload);
        
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
            if (profile) {
              if (profile.role === 'admin') {
                const [profilesRes, requestsRes, bankRes, txsRes, notifsRes, msgsRes, contractsRes, subsRes] = await Promise.all([
                  supabase.from('profiles').select('*'),
                  supabase.from('loan_requests').select('*'),
                  supabase.from('bank_accounts').select('*'),
                  supabase.from('transactions').select('*'),
                  supabase.from('notifications').select('*'),
                  supabase.from('messages').select('*'),
                  supabase.from('contracts').select('*'),
                  supabase.from('newsletter_subscribers').select('*')
                ]);

                if (profilesRes.data) memoryCache.profiles = profilesRes.data.map(p => ({ ...p, id: unmapUUID(p.id) }));
                if (requestsRes.data) memoryCache.loanRequests = requestsRes.data;
                if (bankRes.data) memoryCache.bankAccounts = bankRes.data;
                if (txsRes.data) memoryCache.transactions = txsRes.data.map(t => ({ ...t, user_id: unmapUUID(t.user_id) }));
                if (notifsRes.data) memoryCache.notifications = notifsRes.data.map(n => ({ ...n, user_id: unmapUUID(n.user_id) }));
                if (msgsRes.data) memoryCache.messages = msgsRes.data.map(m => ({ ...m, sender_id: unmapUUID(m.sender_id), receiver_id: unmapUUID(m.receiver_id) }));
                if (contractsRes.data) memoryCache.contracts = contractsRes.data;
                if (subsRes.data) memoryCache.newsletterSubscribers = subsRes.data;
              } else {
                const [requestsRes, bankRes, txsRes, notifsRes, msgsRes, contractsRes] = await Promise.all([
                  supabase.from('loan_requests').select('*').eq('user_id', session.user.id),
                  supabase.from('bank_accounts').select('*').eq('user_id', session.user.id),
                  supabase.from('transactions').select('*').eq('user_id', session.user.id),
                  supabase.from('notifications').select('*').eq('user_id', session.user.id),
                  supabase.from('messages').select('*'),
                  supabase.from('contracts').select('*')
                ]);

                memoryCache.profiles = [{ ...profile, id: unmapUUID(profile.id) }];
                if (requestsRes.data) memoryCache.loanRequests = requestsRes.data;
                if (bankRes.data) memoryCache.bankAccounts = bankRes.data;
                if (txsRes.data) memoryCache.transactions = txsRes.data.map(t => ({ ...t, user_id: unmapUUID(t.user_id) }));
                if (notifsRes.data) memoryCache.notifications = notifsRes.data.map(n => ({ ...n, user_id: unmapUUID(n.user_id) }));
                if (msgsRes.data) memoryCache.messages = msgsRes.data.map(m => ({ ...m, sender_id: unmapUUID(m.sender_id), receiver_id: unmapUUID(m.receiver_id) }));
                if (contractsRes.data && requestsRes.data) {
                  const reqIds = requestsRes.data.map(r => r.id);
                  memoryCache.contracts = contractsRes.data.filter(c => reqIds.includes(c.loan_request_id));
                }
              }
            }
          }
        } catch (err) {
          console.error('Error reloading cache from realtime:', err);
        }

        // Broadcast events to local UI channels
        const { table, eventType, new: newRow } = payload;
        if (table === 'messages') {
          const msg = newRow as any;
          if (msg) {
            const senderId = unmapUUID(msg.sender_id);
            const receiverId = unmapUUID(msg.receiver_id);
            realtimeService.broadcast(`chat_${senderId}_${receiverId}`, msg);
            realtimeService.broadcast(`chat_${receiverId}_${senderId}`, msg);
            realtimeService.broadcast('chat_activity', msg);
          }
        } else if (table === 'notifications') {
          if (eventType === 'INSERT') {
            realtimeService.broadcast('notifications', newRow);
          } else if (eventType === 'UPDATE') {
            realtimeService.broadcast('notifications_read', newRow);
          }
        } else if (table === 'loan_requests') {
          realtimeService.broadcast('loan_requests_change', payload);
        } else if (table === 'contracts') {
          realtimeService.broadcast('contracts_change', payload);
        }
      })
      .subscribe();
  }

  try {
    // 1. Fetch public tables
    const [loanTypesRes, blogPostsRes, showcaseRes] = await Promise.all([
      supabase.from('loan_types').select('*'),
      supabase.from('blog_posts').select('*'),
      supabase.from('approved_clients_showcase').select('*')
    ]);

    if (loanTypesRes.data && loanTypesRes.data.length > 0) memoryCache.loanTypes = loanTypesRes.data;
    if (blogPostsRes.data && blogPostsRes.data.length > 0) memoryCache.blogPosts = blogPostsRes.data;
    if (showcaseRes.data && showcaseRes.data.length > 0) memoryCache.approvedClientsShowcase = showcaseRes.data;
    if (leadsPublicRes.data && leadsPublicRes.data.length > 0) memoryCache.consultationLeads = leadsPublicRes.data;

    // 2. Fetch auth session
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      // Fetch user profile from public table
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profile) {
        currentUser = {
          id: session.user.id,
          email: session.user.email || '',
          full_name: profile.full_name || '',
          role: profile.role || 'client',
          phone: profile.phone || '',
          address: profile.address || '',
          avatar_url: profile.avatar_url || ''
        };

        // Fetch private tables for logged in user (or all if admin)
        if (profile.role === 'admin') {
          const [profilesRes, requestsRes, bankRes, txsRes, notifsRes, msgsRes, contractsRes, subsRes] = await Promise.all([
            supabase.from('profiles').select('*'),
            supabase.from('loan_requests').select('*'),
            supabase.from('bank_accounts').select('*'),
            supabase.from('transactions').select('*'),
            supabase.from('notifications').select('*'),
            supabase.from('messages').select('*'),
            supabase.from('contracts').select('*'),
            supabase.from('newsletter_subscribers').select('*')
          ]);

          if (profilesRes.data) {
            memoryCache.profiles = profilesRes.data.map(p => ({ ...p, id: unmapUUID(p.id) }));
          }
          if (requestsRes.data) memoryCache.loanRequests = requestsRes.data;
          if (bankRes.data) memoryCache.bankAccounts = bankRes.data;
          if (txsRes.data) {
            memoryCache.transactions = txsRes.data.map(t => ({ ...t, user_id: unmapUUID(t.user_id) }));
          }
          if (notifsRes.data) {
            memoryCache.notifications = notifsRes.data.map(n => ({ ...n, user_id: unmapUUID(n.user_id) }));
          }
          if (msgsRes.data) {
            memoryCache.messages = msgsRes.data.map(m => ({
              ...m,
              sender_id: unmapUUID(m.sender_id),
              receiver_id: unmapUUID(m.receiver_id)
            }));
          }
          if (contractsRes.data) memoryCache.contracts = contractsRes.data;
          if (subsRes.data) memoryCache.newsletterSubscribers = subsRes.data;
        } else {
          // Client only fetches their own records
          const [requestsRes, bankRes, txsRes, notifsRes, msgsRes, contractsRes] = await Promise.all([
            supabase.from('loan_requests').select('*').eq('user_id', session.user.id),
            supabase.from('bank_accounts').select('*').eq('user_id', session.user.id),
            supabase.from('transactions').select('*').eq('user_id', session.user.id),
            supabase.from('notifications').select('*').eq('user_id', session.user.id),
            supabase.from('messages').select('*').or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`),
            supabase.from('contracts').select('*')
          ]);

          // Also set the current client profile in the cache
          memoryCache.profiles = [{ ...profile, id: unmapUUID(profile.id) }];

          if (requestsRes.data) memoryCache.loanRequests = requestsRes.data;
          if (bankRes.data) memoryCache.bankAccounts = bankRes.data;
          if (txsRes.data) {
            memoryCache.transactions = txsRes.data.map(t => ({ ...t, user_id: unmapUUID(t.user_id) }));
          }
          if (notifsRes.data) {
            memoryCache.notifications = notifsRes.data.map(n => ({ ...n, user_id: unmapUUID(n.user_id) }));
          }
          if (msgsRes.data) {
            memoryCache.messages = msgsRes.data.map(m => ({
              ...m,
              sender_id: unmapUUID(m.sender_id),
              receiver_id: unmapUUID(m.receiver_id)
            }));
          }

          if (contractsRes.data && requestsRes.data) {
            const reqIds = requestsRes.data.map(r => r.id);
            memoryCache.contracts = contractsRes.data.filter(c => reqIds.includes(c.loan_request_id));
          }
        }
      }
    }
  } catch (err) {
    console.error('Error fetching data from Supabase to Memory Cache:', err);
  } finally {
    isCacheLoaded = true;
    cacheLoadedCallbacks.forEach(cb => cb());
  }

  return currentUser;
};

// ============================================================================
// AUTHENTICATION SERVICES (EXCLUSIVELY LINKED TO SUPABASE)
// ============================================================================

export interface SessionUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone: string;
  address: string;
  avatar_url: string;
}

export const authService = {
  getCurrentUser(): SessionUser | null {
    return currentUser;
  },

  async signUp(
    email: string, 
    password?: string, 
    full_name: string = 'Usuario', 
    role: UserRole = 'client', 
    phone: string = '', 
    address: string = ''
  ): Promise<{ data: SessionUser | null; error: string | null }> {
    if (!email || !full_name) {
      return { data: null, error: 'El correo electrónico y el nombre completo son obligatorios.' };
    }

    if (!supabase || !password) {
      return { data: null, error: 'Supabase no está configurado o falta la contraseña.' };
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (authError) return { data: null, error: authError.message };
      
      if (authData.user) {
        const avatar_url = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(full_name)}`;
        const newProfile: Profile = {
          id: authData.user.id,
          email,
          full_name,
          role,
          phone,
          address,
          avatar_url,
          created_at: new Date().toISOString()
        };

        // Update the profile created automatically by the database trigger
        const { error: dbError } = await supabase.from('profiles').update({
          email,
          full_name,
          phone,
          address,
          avatar_url
        }).eq('id', authData.user.id);
        if (dbError) console.error('Supabase profile update error:', dbError);

        currentUser = {
          id: authData.user.id,
          email,
          full_name,
          role,
          phone,
          address,
          avatar_url
        };
        
        // Push user profile in memory cache
        memoryCache.profiles = [...memoryCache.profiles, newProfile];

        // Trigger cache reload for new session
        await initializeApplication();

        return { data: currentUser, error: null };
      }
    } catch (err: any) {
      return { data: null, error: err.message || 'Error durante el registro en Supabase.' };
    }

    return { data: null, error: 'Error durante el registro.' };
  },

  async signIn(email: string, password?: string): Promise<{ data: SessionUser | null; error: string | null }> {
    if (!supabase || !password) {
      return { data: null, error: 'Supabase no está configurado o falta la contraseña.' };
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) return { data: null, error: authError.message };

      if (authData.user) {
        // Fetch profile details
        const { data: profile, error: dbError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .maybeSingle();

        if (dbError || !profile) {
          // Profile entry missing in public table, let's create a stub
          const avatar_url = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(email)}`;
          const fallbackProfile: Profile = {
            id: authData.user.id,
            full_name: email.split('@')[0],
            role: 'client',
            phone: '',
            address: '',
            avatar_url,
            created_at: new Date().toISOString()
          };
          await supabase.from('profiles').insert(fallbackProfile);
          
          currentUser = {
            id: authData.user.id,
            email: authData.user.email || email,
            full_name: fallbackProfile.full_name,
            role: 'client',
            phone: '',
            address: '',
            avatar_url
          };
        } else {
          currentUser = {
            id: authData.user.id,
            email: authData.user.email || email,
            full_name: profile.full_name || email.split('@')[0],
            role: profile.role || 'client',
            phone: profile.phone || '',
            address: profile.address || '',
            avatar_url: profile.avatar_url || ''
          };
        }

        // Trigger cache reload for the logged-in session
        await initializeApplication();

        return { data: currentUser, error: null };
      }
    } catch (err: any) {
      return { data: null, error: err.message || 'Error durante el inicio de sesión en Supabase.' };
    }

    return { data: null, error: 'El inicio de sesión no tuvo éxito.' };
  },

  async signOut(): Promise<void> {
    if (supabase) {
      await supabase.auth.signOut();
    }
    currentUser = null;
    // Clear private cached tables
    memoryCache.profiles = [];
    memoryCache.loanRequests = [];
    memoryCache.bankAccounts = [];
    memoryCache.transactions = [];
    memoryCache.notifications = [];
    memoryCache.messages = [];
    memoryCache.contracts = [];
    memoryCache.newsletterSubscribers = [];
  },

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile> {
    if (supabase) {
      await supabase.from('profiles').update(updates).eq('id', mapUUID(id));
    }

    // Update memory cache
    memoryCache.profiles = memoryCache.profiles.map(p => {
      if (p.id === id) {
        const up = { ...p, ...updates };
        if (currentUser && currentUser.id === id) {
          currentUser = {
            ...currentUser,
            full_name: up.full_name || currentUser.full_name,
            phone: up.phone || currentUser.phone,
            address: up.address || currentUser.address,
            avatar_url: up.avatar_url || currentUser.avatar_url,
            role: up.role || currentUser.role
          };
        }
        return up;
      }
      return p;
    });

    return memoryCache.profiles.find(p => p.id === id) || { id, ...updates } as Profile;
  },

  async resetPasswordForEmail(email: string): Promise<{ data: any; error: string | null }> {
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/forgot-password`
        });
        if (error) return { data: null, error: error.message };
        return { data, error: null };
      } catch (err: any) {
        return { data: null, error: err.message || 'Error al enviar la solicitud.' };
      }
    }
    return { data: null, error: 'Supabase no está configurado.' };
  },

  async updatePassword(password: string): Promise<{ data: any; error: string | null }> {
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.updateUser({ password });
        if (error) return { data: null, error: error.message };
        return { data, error: null };
      } catch (err: any) {
        return { data: null, error: err.message || 'Error al actualizar la contraseña.' };
      }
    }
    return { data: null, error: 'Supabase no está configurado.' };
  }
};

// ============================================================================
// DATA INTERACTION SERVICES (EXCLUSIVELY LINKED TO SUPABASE)
// ============================================================================

const autoReplies = [
  '¡Gracias por tu mensaje! Uno de nuestros asesores revisará tu solicitud y te responderá a la brevedad.',
  'Entendemos tu consulta. La revisión suele demorar menos de 15 minutos si subiste todos los documentos requeridos.',
  '¡Hola! Tu cuenta bancaria está en proceso de verificación. En cuanto sea aprobada, recibirás una notificación.',
  'Podemos confirmar que tus documentos fueron recibidos correctamente. No se requiere ninguna acción adicional.'
];

export const dataService = {

  // --- CONSULTATION LEADS (LEADS WEB) ---
  getConsultationLeads(): ConsultationLead[] {
    return (memoryCache.consultationLeads || []).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
  },
  createConsultationLead(lead: Omit<ConsultationLead, 'id' | 'status' | 'created_at'>): ConsultationLead {
    const newLead: ConsultationLead = {
      ...lead,
      id: generateUUID(),
      status: 'new',
      created_at: new Date().toISOString()
    };

    if (supabase) {
      supabase.from('consultation_leads').insert(newLead).then();
    }

    memoryCache.consultationLeads = [newLead, ...(memoryCache.consultationLeads || [])];

    // Notification to admin
    this.createNotification(
      'user-admin-1',
      'Nueva Consulta Web Recibida 🚀',
      `${newLead.full_name} ha solicitado información para un préstamo (${newLead.loan_type}). Tel: ${newLead.phone}`,
      'lead'
    );

    return newLead;
  },
  updateConsultationLeadStatus(id: string, status: ConsultationLeadStatus, notes?: string): ConsultationLead {
    memoryCache.consultationLeads = memoryCache.consultationLeads.map(l => {
      if (l.id === id) {
        return {
          ...l,
          status,
          notes: notes !== undefined ? notes : l.notes
        };
      }
      return l;
    });

    const updated = memoryCache.consultationLeads.find(l => l.id === id)!;

    if (supabase) {
      supabase.from('consultation_leads').update({
        status,
        notes: updated.notes
      }).eq('id', id).then();
    }

    return updated;
  },
  deleteConsultationLead(id: string): void {
    memoryCache.consultationLeads = memoryCache.consultationLeads.filter(l => l.id !== id);

    if (supabase) {
      supabase.from('consultation_leads').delete().eq('id', id).then();
    }
  },

  // --- PROFILES ---
  getProfiles(): Profile[] {
    return memoryCache.profiles;
  },

  // --- LOAN TYPES ---
  getLoanTypes(): LoanType[] {
    return memoryCache.loanTypes.filter(lt => lt.is_active);
  },
  getAllLoanTypesAdmin(): LoanType[] {
    return memoryCache.loanTypes;
  },
  getLoanTypeBySlug(slug: string): LoanType | undefined {
    return memoryCache.loanTypes.find(lt => lt.slug === slug);
  },
  saveLoanType(loanType: Partial<LoanType> & { id?: string }): LoanType {
    const newId = loanType.id || generateUUID();
    const item: LoanType = {
      id: newId,
      slug: loanType.slug || 'slug-' + Math.random().toString(36).substr(2, 5),
      name: loanType.name || 'Nuevo crédito',
      description: loanType.description || '',
      icon: loanType.icon || 'HelpCircle',
      min_amount: loanType.min_amount || 100,
      max_amount: loanType.max_amount || 10000,
      min_duration_months: loanType.min_duration_months || 1,
      max_duration_months: loanType.max_duration_months || 12,
      interest_rate: loanType.interest_rate || 5,
      is_active: loanType.is_active !== false,
      created_at: loanType.created_at || new Date().toISOString(),
      image_url: loanType.image_url
    };

    if (supabase) {
      if (loanType.id) {
        supabase.from('loan_types').update(item).eq('id', loanType.id).then();
      } else {
        supabase.from('loan_types').insert(item).then();
      }
    }

    // Update Cache
    if (loanType.id) {
      memoryCache.loanTypes = memoryCache.loanTypes.map(l => l.id === loanType.id ? item : l);
    } else {
      memoryCache.loanTypes = [...memoryCache.loanTypes, item];
    }
    return item;
  },

  // --- LOAN REQUESTS ---
  getLoanRequests(userId?: string): LoanRequest[] {
    const reqs = memoryCache.loanRequests;
    if (userId) {
      return reqs.filter(r => r.user_id === userId).sort((a,b) => b.created_at.localeCompare(a.created_at));
    }
    return reqs.sort((a,b) => b.created_at.localeCompare(a.created_at));
  },
  getLoanRequestById(id: string): LoanRequest | undefined {
    return memoryCache.loanRequests.find(r => r.id === id);
  },
  createLoanRequest(request: Omit<LoanRequest, 'id' | 'status' | 'created_at' | 'updated_at'>): LoanRequest {
    const newReq: LoanRequest = {
      ...request,
      id: generateUUID(),
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (supabase) {
      supabase.from('loan_requests').insert({
        id: newReq.id,
        user_id: newReq.user_id,
        loan_type_id: newReq.loan_type_id,
        amount_requested: newReq.amount_requested,
        duration_months: newReq.duration_months,
        status: newReq.status,
        purpose: newReq.purpose,
        monthly_income: newReq.monthly_income,
        documents: newReq.documents,
        admin_note: newReq.admin_note,
        created_at: newReq.created_at,
        updated_at: newReq.updated_at
      }).then();
    }

    // Update Cache
    memoryCache.loanRequests = [...memoryCache.loanRequests, newReq];

    // Trigger Notification
    this.createNotification(
      newReq.user_id,
      'Solicitud recibida 📝',
      `Tu solicitud de préstamo por un monto de ${newReq.amount_requested.toLocaleString()} € fue recibida y está en revisión.`,
      'info'
    );

    return newReq;
  },
  updateLoanRequestStatus(id: string, status: LoanStatus, adminNote?: string): LoanRequest {
    let targetReq: LoanRequest | undefined;
    memoryCache.loanRequests = memoryCache.loanRequests.map(r => {
      if (r.id === id) {
        targetReq = { 
          ...r, 
          status, 
          admin_note: adminNote !== undefined ? adminNote : r.admin_note,
          updated_at: new Date().toISOString() 
        };
        return targetReq;
      }
      return r;
    });

    if (supabase) {
      supabase.from('loan_requests').update({
        status,
        admin_note: adminNote || '',
        updated_at: new Date().toISOString()
      }).eq('id', id).then();
    }

    if (targetReq) {
      let title = 'Cambio de estado del préstamo 🔔';
      let message = `El estado de tu solicitud de préstamo ha cambiado a: ${status.toUpperCase()}.`;
      
      if (status === 'approved') {
        title = '¡Préstamo aprobado! 🎉';
        message = `¡Felicitaciones! Tu solicitud de préstamo por un monto de ${targetReq.amount_requested.toLocaleString()} € ha sido aprobada. Ahora puedes revisar y firmar el contrato para recibir los fondos.`;
        this.createContract(targetReq.id);
      } else if (status === 'rejected') {
        title = 'Solicitud rechazada 😔';
        message = `Lamentablemente, tu solicitud de préstamo por un monto de ${targetReq.amount_requested.toLocaleString()} € ha sido rechazada. ${adminNote || ''}`;
      } else if (status === 'signed') {
        title = 'Contrato firmado ✍️';
        message = `Has firmado con éxito el contrato para el préstamo de ${targetReq.amount_requested.toLocaleString()} €. El administrador procesará pronto el desembolso a tu saldo.`;
      } else if (status === 'disbursed') {
        title = 'Fondos desembolsados 💸';
        message = `Los fondos del préstamo por un monto de ${targetReq.amount_requested.toLocaleString()} € han sido acreditados exitosamente en tu saldo.`;
        this.createTransaction(targetReq.user_id, 'disbursement', targetReq.amount_requested, 'completed', targetReq.id);
      }
      
      this.createNotification(targetReq.user_id, title, message, `loan_${status}`);
    }

    return targetReq || memoryCache.loanRequests.find(r => r.id === id)!;
  },

  // --- BANK ACCOUNTS ---
  getBankAccounts(userId: string): BankAccount[] {
    return memoryCache.bankAccounts.filter(ba => ba.user_id === userId);
  },
  addBankAccount(account: Omit<BankAccount, 'id' | 'is_verified' | 'created_at'>): BankAccount {
    const newAc: BankAccount = {
      ...account,
      id: generateUUID(),
      is_verified: false,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      supabase.from('bank_accounts').insert(newAc).then();
    }

    // Update Cache
    memoryCache.bankAccounts = [...memoryCache.bankAccounts, newAc];

    // Trigger instant verification timeout
    setTimeout(() => {
      memoryCache.bankAccounts = memoryCache.bankAccounts.map(b => b.id === newAc.id ? { ...b, is_verified: true } : b);
      
      if (supabase) {
        supabase.from('bank_accounts').update({ is_verified: true }).eq('id', newAc.id).then();
      }

      this.createNotification(
        newAc.user_id,
        '¡Cuenta bancaria verificada! ✅',
        `Tu IBAN ${newAc.iban.substring(0, 6)}... ha sido verificado con éxito.`,
        'bank_verified'
      );
    }, 15000);

    return newAc;
  },
  verifyBankAccount(id: string, isVerified: boolean): BankAccount {
    memoryCache.bankAccounts = memoryCache.bankAccounts.map(b => b.id === id ? { ...b, is_verified: isVerified } : b);
    const item = memoryCache.bankAccounts.find(b => b.id === id)!;

    if (supabase) {
      supabase.from('bank_accounts').update({ is_verified: isVerified }).eq('id', id).then();
    }

    if (isVerified) {
      this.createNotification(
        item.user_id,
        'Cuenta verificada por el administrador 💳',
        `Tu cuenta bancaria ${item.bank_name} (${item.iban}) ha sido verificada manualmente por un administrador.`,
        'bank_verified'
      );
    }
    return item;
  },

  // --- TRANSACTIONS ---
  getTransactions(userId?: string): Transaction[] {
    const txs = memoryCache.transactions;
    if (userId) {
      return txs.filter(t => t.user_id === userId).sort((a,b) => b.created_at.localeCompare(a.created_at));
    }
    return txs.sort((a,b) => b.created_at.localeCompare(a.created_at));
  },
  createTransaction(userId: string, type: TransactionType, amount: number, status: TransactionStatus = 'pending', loanRequestId?: string): Transaction {
    const newTx: Transaction = {
      id: generateUUID(),
      user_id: userId,
      loan_request_id: loanRequestId,
      type,
      amount,
      status,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      supabase.from('transactions').insert({
        ...newTx,
        user_id: mapUUID(newTx.user_id)
      }).then();
    }

    // Update Cache
    memoryCache.transactions = [...memoryCache.transactions, newTx];

    if (status === 'completed') {
      const typeStr = type === 'disbursement' ? 'Desembolso de préstamo' : type === 'withdrawal' ? 'Retiro a cuenta bancaria' : 'Abono/Pago de cuota';
      this.createNotification(
        userId,
        `${typeStr} completado 💶`,
        `El monto de ${amount.toLocaleString()} € ha sido procesado exitosamente.`,
        'transaction'
      );
    }

    return newTx;
  },
  updateTransactionStatus(id: string, status: TransactionStatus): Transaction {
    memoryCache.transactions = memoryCache.transactions.map(t => t.id === id ? { ...t, status } : t);
    const tx = memoryCache.transactions.find(t => t.id === id)!;

    if (supabase) {
      supabase.from('transactions').update({ status }).eq('id', id).then();
    }

    if (status === 'completed') {
      const typeStr = tx.type === 'withdrawal' ? 'Retiro a cuenta bancaria' : 'Transacción';
      this.createNotification(
        tx.user_id,
        `¡${typeStr} aprobado! ✅`,
        `El monto de ${tx.amount.toLocaleString()} € ha sido transferido exitosamente a tu IBAN.`,
        'transaction'
      );
    } else if (status === 'failed') {
      this.createNotification(
        tx.user_id,
        `Transacción no exitosa ❌`,
        `Lamentablemente, el retiro del monto de ${tx.amount.toLocaleString()} € no se pudo realizar. Por favor verifica los datos de tu cuenta.`,
        'transaction'
      );
    }
    return tx;
  },

  // --- NOTIFICATIONS ---
  getNotifications(userId: string): Notification[] {
    return memoryCache.notifications.filter(n => n.user_id === userId).sort((a,b) => b.created_at.localeCompare(a.created_at));
  },
  createNotification(userId: string, title: string, message: string, type: string = 'info', isPopup: boolean = false): Notification {
    const newNotif: Notification = {
      id: generateUUID(),
      user_id: userId,
      title,
      message,
      is_read: false,
      type,
      created_at: new Date().toISOString(),
      is_popup: isPopup || false
    };

    if (supabase) {
      supabase.from('notifications').insert({
        id: newNotif.id,
        user_id: mapUUID(newNotif.user_id),
        title: newNotif.title,
        message: newNotif.message,
        is_read: newNotif.is_read,
        type: newNotif.type,
        created_at: newNotif.created_at
      }).then();
    }

    // Update Cache
    memoryCache.notifications = [newNotif, ...memoryCache.notifications];
    
    realtimeService.broadcast('notifications', newNotif);
    return newNotif;
  },
  markAllNotificationsRead(userId: string): void {
    memoryCache.notifications = memoryCache.notifications.map(n => n.user_id === userId ? { ...n, is_read: true } : n);
    
    if (supabase) {
      supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).then();
    }

    realtimeService.broadcast('notifications_read', userId);
  },
  markNotificationRead(id: string): void {
    memoryCache.notifications = memoryCache.notifications.map(n => n.id === id ? { ...n, is_read: true } : n);

    if (supabase) {
      supabase.from('notifications').update({ is_read: true }).eq('id', id).then();
    }

    realtimeService.broadcast('notifications_read', id);
  },

  // --- MESSAGES ---
  getAllAdminMessages(): Message[] {
    return memoryCache.messages || [];
  },
  getMessagesBetween(userA: string, userB: string): Message[] {
    return memoryCache.messages.filter(m => 
      (m.sender_id === userA && m.receiver_id === userB) ||
      (m.sender_id === userB && m.receiver_id === userA)
    ).sort((a,b) => a.created_at.localeCompare(b.created_at));
  },
  getAllActiveConversationsAdmin(): { user: Profile; lastMessage: Message }[] {
    const msgs = memoryCache.messages;
    const profiles = memoryCache.profiles.filter(p => p.role === 'client');
    const list: { user: Profile; lastMessage: Message }[] = [];

    profiles.forEach(user => {
      const userMsgs = msgs.filter(m => m.sender_id === user.id || m.receiver_id === user.id);
      if (userMsgs.length > 0) {
        const sorted = userMsgs.sort((a,b) => b.created_at.localeCompare(a.created_at));
        list.push({
          user,
          lastMessage: sorted[0]
        });
      }
    });

    return list.sort((a,b) => b.lastMessage.created_at.localeCompare(a.lastMessage.created_at));
  },
  sendMessage(senderId: string, receiverId: string, content: string, isFromAdmin: boolean): Message {
    const newMsg: Message = {
      id: generateUUID(),
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      is_from_admin: isFromAdmin,
      is_read: false,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      supabase.from('messages').insert({
        ...newMsg,
        sender_id: mapUUID(newMsg.sender_id),
        receiver_id: mapUUID(newMsg.receiver_id)
      }).then();
    }

    // Update Cache
    memoryCache.messages = [...memoryCache.messages, newMsg];

    realtimeService.broadcast(`chat_${senderId}_${receiverId}`, newMsg);
    realtimeService.broadcast(`chat_activity`, newMsg);

    return newMsg;
  },

  // --- CONTRACTS ---
  getContracts(userId?: string): { contract: Contract; loanRequest: LoanRequest; loanType: LoanType }[] {
    const cts = memoryCache.contracts;
    const reqs = memoryCache.loanRequests;
    const types = memoryCache.loanTypes;
    const list: { contract: Contract; loanRequest: LoanRequest; loanType: LoanType }[] = [];

    cts.forEach(c => {
      const lr = reqs.find(r => r.id === c.loan_request_id);
      if (lr && (!userId || lr.user_id === userId)) {
        const lt = types.find(t => t.id === lr.loan_type_id);
        if (lt) {
          list.push({ contract: c, loanRequest: lr, loanType: lt });
        }
      }
    });

    return list;
  },
  createContract(loanRequestId: string): Contract {
    const lr = memoryCache.loanRequests.find(r => r.id === loanRequestId);
    const client = memoryCache.profiles.find(p => p.id === lr?.user_id);
    const type = memoryCache.loanTypes.find(t => t.id === lr?.loan_type_id);
    
    const defaultContent = `CONTRATO DE PRÉSTAMO DIGITAL - RapiCredito
Referencia del contrato: CTR-${Math.floor(100000 + Math.random() * 900000)}

Concluido entre RapiCredito S.A. (en adelante: El Prestamista) y el cliente:
Nombre y Apellidos: ${client?.full_name || 'Cliente'}
Dirección de residencia: ${client?.address || 'No especificada'}

Artículo 1. Objeto del Contrato
El Prestamista aprueba al cliente un préstamo digital basado en los siguientes parámetros:
- Tipo de financiamiento: ${type?.name || 'Préstamo Estándar'}
- Monto solicitado: ${(lr?.amount_requested || 5000).toLocaleString()} EUR
- Plazo de devolución: ${lr?.duration_months || 24} meses
- Tasa de interés: ${type?.interest_rate || 5.49}% anual (fija)

Artículo 2. Pago y Cuotas Mensuales
El cliente se compromete a reembolsar el préstamo en cuotas mensuales fijas. Cada cuota vence el día 15 de cada mes. El Prestamista se reserva el derecho de aplicar intereses por mora en caso de retraso.

Artículo 3. Disposiciones Finales
El contrato entra en vigor en el momento de la firma digital por parte del cliente. Los fondos se transfieren automáticamente al saldo de la cuenta y quedan disponibles para su retiro a la cuenta bancaria (IBAN) verificada del cliente.`;

    const newCt: Contract = {
      id: generateUUID(),
      loan_request_id: loanRequestId,
      file_url: '#',
      created_at: new Date().toISOString(),
      content: defaultContent,
      attachments: [],
      status: 'draft'
    };

    if (supabase) {
      supabase.from('contracts').insert({
        id: newCt.id,
        loan_request_id: newCt.loan_request_id,
        file_url: newCt.file_url,
        content: newCt.content,
        attachments: newCt.attachments,
        status: newCt.status,
        created_at: newCt.created_at
      }).then();
    }

    // Update Cache
    memoryCache.contracts = [...memoryCache.contracts, newCt];
    return newCt;
  },
  updateContract(id: string, content: string, attachments: string[], status?: 'draft' | 'sent'): Contract {
    let updatedCt: Contract | null = null;
    memoryCache.contracts = memoryCache.contracts.map(c => {
      if (c.id === id) {
        updatedCt = { 
          ...c, 
          content, 
          attachments, 
          status: status !== undefined ? status : c.status 
        };
        return updatedCt;
      }
      return c;
    });

    if (supabase) {
      const payload: any = { content, attachments };
      if (status !== undefined) payload.status = status;
      supabase.from('contracts').update(payload).eq('id', id).then();
    }
    return updatedCt || memoryCache.contracts.find(c => c.id === id)!;
  },
  signContract(id: string): Contract {
    let targetId = '';
    memoryCache.contracts = memoryCache.contracts.map(c => {
      if (c.id === id) {
        targetId = c.loan_request_id;
        return { ...c, signed_at: new Date().toISOString() };
      }
      return c;
    });

    if (supabase) {
      supabase.from('contracts').update({ signed_at: new Date().toISOString() }).eq('id', id).then();
    }

    if (targetId) {
      this.updateLoanRequestStatus(targetId, 'signed');
    }

    return memoryCache.contracts.find(c => c.id === id)!;
  },

  // --- BLOG POSTS ---
  getBlogPosts(): BlogPost[] {
    return memoryCache.blogPosts.filter(p => p.is_published).sort((a,b) => b.published_at!.localeCompare(a.published_at!));
  },
  getAllBlogPostsAdmin(): BlogPost[] {
    return memoryCache.blogPosts;
  },
  getBlogPostBySlug(slug: string): BlogPost | undefined {
    return memoryCache.blogPosts.find(p => p.slug === slug);
  },
  saveBlogPost(post: Partial<BlogPost> & { id?: string }): BlogPost {
    const newId = post.id || generateUUID();
    const item: BlogPost = {
      id: newId,
      title: post.title || 'Nuevo artículo',
      slug: post.slug || 'slug-' + Math.random().toString(36).substr(2, 5),
      excerpt: post.excerpt || '',
      content: post.content || '',
      cover_image: post.cover_image || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
      category: post.category || 'Noticias',
      is_published: post.is_published !== false,
      published_at: post.is_published ? (post.published_at || new Date().toISOString()) : undefined,
      created_at: post.created_at || new Date().toISOString()
    };

    if (supabase) {
      if (post.id) {
        supabase.from('blog_posts').update(item).eq('id', post.id).then();
      } else {
        supabase.from('blog_posts').insert(item).then();
      }
    }

    // Update Cache
    if (post.id) {
      memoryCache.blogPosts = memoryCache.blogPosts.map(p => p.id === post.id ? item : p);
    } else {
      memoryCache.blogPosts = [...memoryCache.blogPosts, item];
    }
    return item;
  },
  deleteBlogPost(id: string): void {
    memoryCache.blogPosts = memoryCache.blogPosts.filter(p => p.id !== id);

    if (supabase) {
      supabase.from('blog_posts').delete().eq('id', id).then();
    }
  },

  // --- NEWSLETTER SUBSCRIBERS ---
  getNewsletterSubscribers(): NewsletterSubscriber[] {
    return memoryCache.newsletterSubscribers;
  },
  subscribeNewsletter(email: string): { success: boolean; message: string } {
    if (!email || !email.includes('@')) {
      return { success: false, message: 'Dirección de correo electrónico no válida.' };
    }
    
    if (memoryCache.newsletterSubscribers.some(s => s.email.toLowerCase() === email.toLowerCase())) {
      return { success: true, message: '¡Ya estás suscrito a nuestro boletín de noticias!' };
    }

    const newSub: NewsletterSubscriber = {
      id: generateUUID(),
      email,
      subscribed_at: new Date().toISOString(),
      is_active: true
    };

    if (supabase) {
      supabase.from('newsletter_subscribers').insert(newSub).then();
    }

    // Update Cache
    memoryCache.newsletterSubscribers = [...memoryCache.newsletterSubscribers, newSub];
    return { success: true, message: '¡Te has suscrito con éxito al boletín de RapiCredito! Muchas gracias.' };
  },

  // --- APPROVED CLIENTS SHOWCASE ---
  getShowcaseClients(): ApprovedClientShowcase[] {
    return memoryCache.approvedClientsShowcase.filter(sc => sc.is_public);
  },
  getAllShowcaseClientsAdmin(): ApprovedClientShowcase[] {
    return memoryCache.approvedClientsShowcase;
  },
  saveShowcaseClient(client: Partial<ApprovedClientShowcase> & { id?: string }): ApprovedClientShowcase {
    const newId = client.id || generateUUID();
    const item: ApprovedClientShowcase = {
      id: newId,
      user_id: client.user_id || 'user-client-1',
      display_name: client.display_name || 'Cliente',
      loan_type: client.loan_type || 'Préstamo Personal',
      amount_range: client.amount_range || '5.000 € - 10.000 €',
      testimonial: client.testimonial || '',
      photo_url: client.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
      status: client.status || 'disbursed',
      is_public: client.is_public !== false,
      created_at: client.created_at || new Date().toISOString()
    };

    if (supabase) {
      if (client.id) {
        supabase.from('approved_clients_showcase').update(item).eq('id', client.id).then();
      } else {
        supabase.from('approved_clients_showcase').insert(item).then();
      }
    }

    // Update Cache
    if (client.id) {
      memoryCache.approvedClientsShowcase = memoryCache.approvedClientsShowcase.map(c => c.id === client.id ? item : c);
    } else {
      memoryCache.approvedClientsShowcase = [...memoryCache.approvedClientsShowcase, item];
    }
    return item;
  },
  deleteShowcaseClient(id: string): void {
    memoryCache.approvedClientsShowcase = memoryCache.approvedClientsShowcase.filter(c => c.id !== id);

    if (supabase) {
      supabase.from('approved_clients_showcase').delete().eq('id', id).then();
    }
  }
};

// ============================================================================
// MEDIA SERVICE (SUPABASE STORAGE BUCKETS WITH SECURE FAIL-SAFE)
// ============================================================================

export const mediaService = {
  async uploadFile(bucketName: string, filePath: string, file: File): Promise<string> {
    if (!supabase) {
      throw new Error('Supabase no está configurado. El almacenamiento de archivos está deshabilitado.');
    }
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (error) {
      console.error(`Supabase storage upload error in bucket ${bucketName}:`, error);
      throw new Error(error.message);
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
      
    return publicUrl;
  }
};
