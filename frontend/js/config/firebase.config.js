// Firebase Realtime Database Configuration for LUBA CanFindIT (City of Malolos, Bulacan).
// You can replace these placeholder values with your Firebase Project credentials,
// or paste them directly in the Admin Panel (Settings -> Firebase Realtime Sync).

export const defaultFirebaseConfig = {
  apiKey: "AIzaSy_lubacanfindit",
  authDomain: "lubacanfindit-default-rtdb.firebaseapp.com",
  databaseURL: "https://lubacanfindit-default-rtdb.firebaseio.com",
  projectId: "lubacanfindit-default-rtdb",
  storageBucket: "lubacanfindit-default-rtdb.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:lubacanfindit"
};

export function isConfigValid(cfg) {
  if (!cfg || typeof cfg !== 'object') return false;
  if (!cfg.databaseURL || typeof cfg.databaseURL !== 'string') return false;
  const url = cfg.databaseURL.trim().toLowerCase();
  if (url.includes('your_project') || url.includes('placeholder')) {
    return false;
  }
  return url.startsWith('https://') && (url.includes('.firebaseio.com') || url.includes('.firebasedatabase.app'));
}

export function getActiveFirebaseConfig() {
  try {
    const saved = localStorage.getItem('luba_firebase_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (isConfigValid(parsed) && parsed.databaseURL.includes('lubacanfindit')) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[Firebase] Config read warning:', err);
  }
  return defaultFirebaseConfig;
}

export function saveFirebaseConfig(config) {
  try {
    localStorage.setItem('luba_firebase_config', JSON.stringify(config));
    return true;
  } catch (err) {
    console.error('[Firebase] Save error:', err);
    return false;
  }
}
