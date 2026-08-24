import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL_KEY = 'capstoneflow_supabase_url';
const SUPABASE_ANON_KEY = 'capstoneflow_supabase_anon_key';

const DEFAULT_SUPABASE_URL = 'https://xpeeagmvzgkpszxvvyav.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_gKbKbs23SIP1rh__Nn2cgg_iOIFquMC';

export const getSupabaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  if (typeof envUrl === 'string' && envUrl.trim() !== '' && !envUrl.includes('placeholder')) {
    return envUrl.trim();
  }
  const stored = localStorage.getItem(SUPABASE_URL_KEY);
  if (stored && stored.trim() !== '') {
    return stored.trim();
  }
  return DEFAULT_SUPABASE_URL;
};

export const getSupabaseAnonKey = (): string => {
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (typeof envKey === 'string' && envKey.trim() !== '' && !envKey.includes('placeholder')) {
    return envKey.trim();
  }
  const stored = localStorage.getItem(SUPABASE_ANON_KEY);
  if (stored && stored.trim() !== '') {
    return stored.trim();
  }
  return DEFAULT_SUPABASE_ANON_KEY;
};

export const isSupabaseConfigured = (): boolean => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  return (
    url.length > 8 &&
    url.startsWith('http') &&
    key.length > 20
  );
};

let _supabaseClient: SupabaseClient | null = null;

export const initSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    _supabaseClient = null;
    return null;
  }
  try {
    _supabaseClient = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
    return _supabaseClient;
  } catch (err) {
    console.warn('Failed to init Supabase client:', err);
    _supabaseClient = null;
    return null;
  }
};

export const setSupabaseCredentials = (url: string, key: string): boolean => {
  if (url.trim()) {
    localStorage.setItem(SUPABASE_URL_KEY, url.trim());
  } else {
    localStorage.removeItem(SUPABASE_URL_KEY);
  }

  if (key.trim()) {
    localStorage.setItem(SUPABASE_ANON_KEY, key.trim());
  } else {
    localStorage.removeItem(SUPABASE_ANON_KEY);
  }

  initSupabaseClient();
  return isSupabaseConfigured();
};

// Initial creation
initSupabaseClient();

export const getSupabase = (): SupabaseClient | null => {
  if (!_supabaseClient && isSupabaseConfigured()) {
    return initSupabaseClient();
  }
  return _supabaseClient;
};

// Dynamic proxy ensuring access to active Supabase instance
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabase();
    if (!client) return undefined;
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});
