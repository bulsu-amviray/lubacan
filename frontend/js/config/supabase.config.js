// Supabase Client Configuration for LUBA CanFindIT (City of Malolos, Bulacan).
// You can paste your Supabase Project URL and Anon API Key here or in the admin settings modal.

export const defaultSupabaseConfig = {
  supabaseUrl: 'https://boeukdabtzdvmqsqvtpq.supabase.co',
  supabaseAnonKey: ''
};

const STORAGE_KEY = 'luba_supabase_config';

export function isSupabaseConfigValid(cfg) {
  if (!cfg || typeof cfg !== 'object') return false;
  if (!cfg.supabaseUrl || typeof cfg.supabaseUrl !== 'string') return false;
  if (!cfg.supabaseAnonKey || typeof cfg.supabaseAnonKey !== 'string') return false;
  const url = cfg.supabaseUrl.trim().toLowerCase();
  const key = cfg.supabaseAnonKey.trim();
  if (url.includes('demo-project') || url.includes('placeholder')) return false;
  return url.startsWith('https://') && url.includes('.supabase.co') && key.length > 15;
}

export function getActiveSupabaseConfig() {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          parsed.supabaseUrl &&
          parsed.supabaseUrl.includes('boeukdabtzdvmqsqvtpq') &&
          parsed.supabaseAnonKey === defaultSupabaseConfig.supabaseAnonKey &&
          isSupabaseConfigValid(parsed)
        ) {
          return parsed;
        }
      }
      // If there was an old key or invalid config in localStorage, remove it
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (err) {
    console.warn('[Supabase] Config read notice:', err);
  }
  return defaultSupabaseConfig;
}

export function saveSupabaseConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    return true;
  } catch (err) {
    console.error('[Supabase] Config save error:', err);
    return false;
  }
}
