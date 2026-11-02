import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Universal backend helper to synchronize writes to Supabase PostgreSQL via PostgREST.
 * Runs with native Node.js fetch (Node 18+). Requires zero additional npm dependencies.
 *
 * @param {string} table - e.g. 'reports', 'teams', 'users', 'audit_logs'
 * @param {Record<string, any>} filter - e.g. { code: 'RW-2026-0042' }
 * @param {Record<string, any>} data - snake_case object payload
 * @param {'PATCH'|'POST'|'DELETE'} method - HTTP method
 */
export async function syncToSupabase(table, filter = {}, data = {}, method = 'PATCH') {
  const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return false;
  }

  try {
    let url = `${supabaseUrl}/rest/v1/${table}`;
    const filterKeys = Object.keys(filter);
    if (filterKeys.length > 0) {
      const queryParams = filterKeys.map((k) => `${k}=eq.${encodeURIComponent(filter[k])}`).join('&');
      url += `?${queryParams}`;
    }

    const res = await fetch(url, {
      method,
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: method === 'DELETE' ? undefined : JSON.stringify(data)
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.warn(`[Supabase Backend Sync] ${res.status} ${res.statusText}: ${text}`);
      return false;
    }

    return true;
  } catch (err) {
    console.warn('[Supabase Backend Sync notice]:', err.message);
    return false;
  }
}
