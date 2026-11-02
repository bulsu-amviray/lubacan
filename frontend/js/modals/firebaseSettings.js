// Modal dialog for Firebase Realtime Database Configuration & Multi-Client Sync.
// Allows the admin to view connection status, input/update Firebase credentials, and seed initial datasets.

import { getActiveFirebaseConfig, saveFirebaseConfig, isConfigValid } from '../config/firebase.config.js';
import { firebaseSync } from '../services/firebaseSync.js';

export function renderFirebaseSettingsModal(state) {
  const currentConfig = getActiveFirebaseConfig();
  const isValid = isConfigValid(currentConfig);
  const isConnected = firebaseSync.isConnected();

  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div class="bg-white rounded-2xl shadow-2xl border border-luba-border max-w-xl w-full p-6 space-y-5 animate-scaleUp">
        
        <!-- Header -->
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-bold shadow-xs">
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5.002 19.553L8.68 2.607a.64.64 0 0 1 1.18-.088l2.94 5.617 3.518-6.721a.64.64 0 0 1 1.17.067l3.61 18.071-7.85 4.38a.64.64 0 0 1-.61 0l-7.638-4.38z" />
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-bold text-luba-textPrimary">Firebase Realtime Database Sync</h2>
              <p class="text-xs text-luba-textSubtle">Synchronizes data live between Web Admin, Citizen Mobile, and Maintenance Mobile</p>
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
          isConnected
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : isValid
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-slate-50 border-slate-200 text-slate-800'
        }">
          <div class="flex items-center gap-2.5">
            <span class="w-3 h-3 rounded-full ${
              isConnected ? 'bg-emerald-500 animate-pulse' : isValid ? 'bg-amber-500' : 'bg-slate-400'
            }"></span>
            <div>
              <p class="text-xs font-bold">
                ${
                  isConnected
                    ? 'Connected & Live Syncing'
                    : isValid
                      ? 'Configured · Connecting to Realtime Database...'
                      : 'Pending Firebase Configuration'
                }
              </p>
              <p class="text-[11px] opacity-80 truncate max-w-sm">
                ${isValid ? currentConfig.databaseURL : 'Paste your Firebase Web credentials below to enable live sync.'}
              </p>
            </div>
          </div>
          ${
            isConnected
              ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800">ACTIVE</span>`
              : `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">STANDBY</span>`
          }
        </div>

        <!-- Configuration Form -->
        <div class="space-y-3">
          <label class="block text-xs font-bold text-luba-textPrimary">
            Firebase Project Web Credentials
            <span class="text-[11px] font-normal text-luba-textSubtle ml-1">(From Firebase Console → Project Settings → General → Web App)</span>
          </label>
          <div class="space-y-2">
            <div>
              <label class="block text-[11px] text-luba-textSubtle mb-0.5">Database URL *</label>
              <input
                type="text"
                id="cfg-databaseURL"
                value="${currentConfig.databaseURL || ''}"
                placeholder="https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app"
                class="w-full text-xs font-mono px-3 py-2 border border-luba-border rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:border-luba-navy"
              />
              <p class="text-[11px] text-luba-textSubtle mt-1 leading-normal">
                Paste your database URL from Firebase Console (<strong>Build → Realtime Database</strong>).<br/>
                Example: <code class="bg-slate-100 text-[#102D4F] px-1 py-0.5 rounded font-mono">https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app</code>
              </p>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-[11px] text-luba-textSubtle mb-0.5">API Key</label>
                <input
                  type="text"
                  id="cfg-apiKey"
                  value="${currentConfig.apiKey || ''}"
                  placeholder="AIzaSy..."
                  class="w-full text-xs font-mono px-3 py-2 border border-luba-border rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:border-luba-navy"
                />
              </div>
              <div>
                <label class="block text-[11px] text-luba-textSubtle mb-0.5">Project ID</label>
                <input
                  type="text"
                  id="cfg-projectId"
                  value="${currentConfig.projectId || ''}"
                  placeholder="luba-canfindit"
                  class="w-full text-xs font-mono px-3 py-2 border border-luba-border rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:border-luba-navy"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Architecture Schema Guide -->
        <div class="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs text-blue-950 space-y-1">
          <p class="font-bold flex items-center gap-1.5 text-blue-900">
            <span>📱</span> Mobile Sync Architecture
          </p>
          <p class="text-[11px] leading-relaxed text-blue-900/90">
            • <strong>Citizen App:</strong> Writes new pothole reports directly to <code>/reports/{code}</code>.<br/>
            • <strong>Admin Portal:</strong> Listens live via WebSockets, verifies severity & assigns teams.<br/>
            • <strong>Maintenance App:</strong> Listens to assigned reports, submits repair photo evidence & completes work.
          </p>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-between pt-2 border-t border-luba-border">
          <button
            type="button"
            id="btn-seed-firebase"
            class="text-xs font-bold text-luba-navy hover:underline py-2 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
            </svg>
            Seed Initial Reports & Teams to RTDB
          </button>
          
          <div class="flex items-center gap-2">
            <button
              type="button"
              data-close-modal
              class="luba-btn-secondary px-4 py-2 text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              id="btn-save-firebase-config"
              class="luba-btn-primary px-4 py-2 text-xs font-bold shadow-xs cursor-pointer"
            >
              Save & Connect
            </button>
          </div>
        </div>

      </div>
    </div>
  `;
}
