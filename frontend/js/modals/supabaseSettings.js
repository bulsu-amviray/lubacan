// Modal dialog for Supabase PostgreSQL & Storage Configuration.
// Allows the admin to view connection status, input/update Supabase credentials, and test connection.

import { getActiveSupabaseConfig, isSupabaseConfigValid, saveSupabaseConfig } from '../config/supabase.config.js';
import { supabaseSync } from '../services/supabaseSync.js';

export function renderSupabaseSettingsModal(state) {
  const currentConfig = getActiveSupabaseConfig();
  const isValid = isSupabaseConfigValid(currentConfig);

  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div class="bg-white rounded-2xl shadow-2xl border border-luba-border max-w-xl w-full p-6 space-y-5 animate-scaleUp">
        
        <!-- Header -->
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold shadow-xs">
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.362 9.354H12V.396a.396.396 0 0 0-.716-.233L.32 14.152a.396.396 0 0 0 .317.638H12v8.814a.396.396 0 0 0 .716.233l10.963-13.99a.396.396 0 0 0-.317-.638v-.001z"/>
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-bold text-luba-textPrimary">Supabase Realtime & Cloud Database</h2>
              <p class="text-xs text-luba-textSubtle">Synchronizes data live with PostgreSQL & Pothole Photo Storage</p>
            </div>
          </div>
          <button
            type="button"
            data-close-modal
            class="text-luba-textSubtle hover:text-luba-textPrimary text-lg p-1 rounded-lg hover:bg-slate-100 transition"
          >
            ✕
          </button>
        </div>

        <!-- Connection Status Banner -->
        <div class="p-3.5 rounded-xl border flex items-center justify-between ${
          isValid
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-slate-50 border-slate-200 text-slate-800'
        }">
          <div class="flex items-center gap-2.5">
            <span class="w-3 h-3 rounded-full ${
              isValid ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
            }"></span>
            <div>
              <p class="text-xs font-bold">
                ${isValid ? 'Configured & Ready for Live Sync' : 'Using Local Storage (Add your Supabase keys below)'}
              </p>
              <p class="text-[11px] opacity-80 truncate max-w-sm">
                ${currentConfig.supabaseUrl}
              </p>
            </div>
          </div>
          <button
            type="button"
            id="test-supabase-conn-btn"
            class="text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-luba-border hover:bg-slate-50 transition shadow-2xs"
          >
            Test Connection
          </button>
        </div>

        <div id="supabase-test-result" class="hidden text-xs p-3 rounded-lg"></div>

        <!-- Form Fields -->
        <div class="space-y-3.5">
          <div>
            <label class="block text-xs font-bold text-luba-textPrimary mb-1">
              Project URL <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="supabase-url-input"
              value="${currentConfig.supabaseUrl || ''}"
              placeholder="https://your-project-id.supabase.co"
              class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-luba-border focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition"
            />
            <p class="text-[11px] text-luba-textSubtle mt-1">Found under Supabase Dashboard → Settings → API → Project URL</p>
          </div>

          <div>
            <label class="block text-xs font-bold text-luba-textPrimary mb-1">
              Anon Public API Key <span class="text-red-500">*</span>
            </label>
            <textarea
              id="supabase-key-input"
              rows="3"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-luba-border focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition font-mono"
            >${currentConfig.supabaseAnonKey || ''}</textarea>
            <p class="text-[11px] text-luba-textSubtle mt-1">Found under Supabase Dashboard → Settings → API → Project API Keys (anon public)</p>
          </div>
        </div>

        <!-- Notice & Guide -->
        <div class="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs space-y-1">
          <p class="font-bold text-emerald-900 flex items-center gap-1.5">
            <span>💡</span> SQL Database Schema Ready
          </p>
          <p class="text-emerald-800 text-[11px] leading-relaxed">
            Run the pre-generated <code class="font-bold">supabase-schema.sql</code> file in your Supabase SQL Editor to instantly create all tables, realtime channels, and the <code class="font-bold">pothole-photos</code> storage bucket.
          </p>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-luba-border">
          <button
            type="button"
            data-close-modal
            class="text-xs font-semibold px-4 py-2.5 rounded-xl text-luba-textSecondary hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            id="save-supabase-config-btn"
            class="text-xs font-bold px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
          >
            Save & Connect
          </button>
        </div>

      </div>
    </div>
  `;
}
