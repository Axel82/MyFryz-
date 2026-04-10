import { createClient } from '@supabase/supabase-js';

const LS_URL_KEY = 'myfryz_sb_url';
const LS_KEY_KEY = 'myfryz_sb_key';

// 1. User-configured credentials (highest priority)
// 2. Build-time env vars (owner's deployment, baked in)
const getUrl  = () => localStorage.getItem(LS_URL_KEY)  || import.meta.env.VITE_SUPABASE_URL  || '';
const getKey  = () => localStorage.getItem(LS_KEY_KEY)  || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const buildClient = () => {
  const url = getUrl();
  const key = getKey();
  return (url && key) ? createClient(url, key) : null;
};

// Singleton for the current session — call refreshSupabaseClient() after config change
let _client = buildClient();
export const supabase = _client;

// Helpers used by SupabaseConfigModal
export const getSupabaseConfig = () => ({ url: getUrl(), key: getKey() });

export const saveSupabaseConfig = (url, key) => {
  localStorage.setItem(LS_URL_KEY, url.trim());
  localStorage.setItem(LS_KEY_KEY, key.trim());
  // Reload so all modules pick up the new client
  window.location.reload();
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem(LS_URL_KEY);
  localStorage.removeItem(LS_KEY_KEY);
  window.location.reload();
};

export const testSupabaseConnection = async (url, key) => {
  try {
    const client = createClient(url.trim(), key.trim());
    const { error } = await client.from('inventories').select('id').limit(1);
    // error can be "relation does not exist" which still means connection works
    if (error && error.code === 'PGRST116') return { ok: true };
    if (error && error.message.includes('JWT')) return { ok: false, message: 'Clé invalide (JWT)' };
    return { ok: !error, message: error?.message };
  } catch (e) {
    return { ok: false, message: e.message };
  }
};
