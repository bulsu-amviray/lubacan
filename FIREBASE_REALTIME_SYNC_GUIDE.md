# LUBA CanFindIT · Firebase Realtime Database Synchronization Guide
### Multi-Client Architecture for Web Admin, Citizen Mobile App & Maintenance Crew App

This guide explains how to connect your **Firebase Realtime Database (RTDB)** to synchronize all pothole reports, assignments, and repair evidence in real time across:
1. **LUBA CanFindIT Admin Web Dashboard** (City of Malolos LGU operations)
2. **Citizen Mobile App** (report submission, GPS coordinates, citizen photos, status tracking)
3. **Maintenance Crew Mobile App** (dispatch alerts, navigation, repair progress, completion evidence)

---

## 1. Quick Setup in Firebase Console (5 Minutes)

### Step 1: Create or Open a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or select your existing project).
3. Name your project (e.g., `luba-canfindit` or `malolos-canfindit`).
4. (Optional) Disable Google Analytics for now or leave default, then click **Create project**.

### Step 2: Create the Realtime Database
1. In the left sidebar of the Firebase Console, go to **Build** → **Realtime Database**.
2. Click **Create Database**.
3. **Database Location**: Choose **`asia-southeast1` (Singapore)** — *this provides the lowest latency (~20-40ms) for Bulacan / Philippines users*.
4. **Security Rules**: Select **Start in test mode** for initial development (allows read/write for 30 days) or apply the production rules below.
5. Click **Enable**.
6. Copy your database URL (e.g. `https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app`).

### Step 3: Copy Web App Credentials for the Admin Portal
1. In Firebase Console, click the **Gear icon ⚙️** (Project Settings) → **General**.
2. Scroll down to **Your apps** and click the **Web icon `</>`**.
3. Register your app (name: `LUBA CanFindIT Admin Web`).
4. You will see a `firebaseConfig` object like:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "your-project.firebaseapp.com",
     databaseURL: "https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app",
     projectId: "your-project",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef..."
   };
   ```

### Step 4: (Optional for Backend) Download Service Account Key
1. In **Project Settings** ⚙️, go to the **Service accounts** tab.
2. Click **Generate new private key**.
3. Save the downloaded `.json` file into `c:\xampp\htdocs\LUBACanFindIT\backend\firebase-service-account.json`.
4. In `backend/.env`, add:
   ```env
   FIREBASE_DATABASE_URL=https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app
   ```

---

## 2. Connecting the Admin Dashboard (1 Click)

1. Open the Admin dashboard at [http://localhost:4000](http://localhost:4000).
2. Look at the top bar next to `City of Malolos · PHT` — click the **"Firebase Sync"** pill button.
3. Paste your **Database URL**, **API Key**, and **Project ID**.
4. Click **"Save & Connect"**.
5. Click **"Seed Initial Reports & Teams to RTDB"** — this will immediately upload Malolos's initial 8 pothole reports, teams, and users to your Firebase database!

---

## 3. Realtime Database JSON Schema (Multi-Client Standard)

Here is the synchronized data structure shared across all three applications:

### 🛣️ `/reports/{reportCode}` (e.g. `reports/RW-2026-0842`)
```json
{
  "code": "RW-2026-0842",
  "road": "MacArthur Highway (Manila North Road)",
  "barangay": "Guinhawa",
  "jurisdiction": "DPWH-National",
  "severity": "High",
  "status": "Under Review",
  "coordinates": "14.8524° N, 120.8168° E",
  "landmark": "Near BSU crossing / Capitol junction, Brgy. Guinhawa, City of Malolos, Bulacan",
  "description": "Deep asphalt pothole along MacArthur Highway northbound lane.",
  "photoUrl": "https://storage.googleapis.com/.../pothole-citizen.jpg",
  "reportedDate": "19 Oct 2026",
  "createdAt": "2026-10-19T01:24:00Z",
  "citizen": {
    "name": "Mika Reyes",
    "email": "mika.reyes@malolos.gov.ph",
    "mobile": "+63 917 000 0184"
  },
  "assignedTeam": "Malolos Team Alpha",
  "repairEvidence": {
    "photoUrl": "https://storage.googleapis.com/.../repair-after.jpg",
    "completedAt": "2026-10-21T02:45:00Z",
    "leadNotes": "Compacted asphalt hot-mix patch applied."
  }
}
```

### 👷 `/teams/{teamId}` (e.g. `teams/team-alpha`)
```json
{
  "id": "team-alpha",
  "name": "Malolos Team Alpha",
  "status": "On duty",
  "district": "District 1 (Poblacion & Guinhawa)",
  "specialty": "Arterial road asphalt patching",
  "activePotholes": 3,
  "resolvedCount": 42,
  "lead": {
    "name": "Engr. Paolo Santos",
    "phone": "+63 917 000 0210"
  }
}
```

---

## 4. Multi-Client Real-Time Workflow

```
[ Citizen Mobile App ]
        │
        │ 1. Citizens take photo with GPS -> writes to /reports/{newId}
        ▼
[ Firebase Realtime Database ] ◄─────────────────────────────────────────────┐
        │                                                                   │
        │ 2. Instant WebSocket trigger to Admin                             │
        ▼                                                                   │
[ LUBA CanFindIT Admin Web ]                                                │
        │                                                                   │
        │ 3. Admin verifies severity, clicks "Assign Team Alpha"             │
        │    Updates /reports/{newId}/status = "Assigned"                   │
        ▼                                                                   │
[ Firebase Realtime Database ]                                              │
        │                                                                   │
        │ 4. Push dispatch notification to Crew                             │
        ▼                                                                   │
[ Maintenance Crew App ]                                                    │
        │                                                                   │
        │ 5. Crew navigates to GPS coordinate, fixes pothole,                │
        │    uploads repair photo -> updates /reports/{newId}/repairEvidence │
        └───────────────────────────────────────────────────────────────────┘
```

---

## 5. Recommended Firebase Realtime Database Security Rules

Paste these rules in **Firebase Console → Realtime Database → Rules**:

```json
{
  "rules": {
    "reports": {
      ".read": true,
      ".indexOn": ["status", "severity", "jurisdiction", "barangay", "assignedTeam"],
      "$reportId": {
        ".write": true
      }
    },
    "teams": {
      ".read": true,
      "$teamId": {
        ".write": "auth != null"
      }
    },
    "users": {
      ".read": true,
      "$userId": {
        ".write": "auth != null"
      }
    }
  }
}
```

---

## 6. What Was Implemented in This System

1. **Frontend Direct Firebase RTDB Sync Client**:
   - Located at [`frontend/js/services/firebaseSync.js`](file:///c:/xampp/htdocs/LUBACanFindIT/frontend/js/services/firebaseSync.js).
   - Bundles Firebase Web SDK compat in [`frontend/index.html`](file:///c:/xampp/htdocs/LUBACanFindIT/frontend/index.html).
   - Subscribes live via WebSockets to `/reports`, `/teams`, `/users`.
   - Displays real-time toast alert whenever a new citizen report arrives.
   - Synchronizes report status changes (Verified, Assigned, Resolved, Rejected, Forwarded) directly to Firebase.

2. **Configuration Modal & 1-Click Seeder**:
   - Located in [`frontend/js/modals/firebaseSettings.js`](file:///c:/xampp/htdocs/LUBACanFindIT/frontend/js/modals/firebaseSettings.js).
   - Accessible via the **"Firebase Sync"** pill button in the topbar.
   - Allows pasting keys and clicking **"Seed Initial Reports & Teams to RTDB"** to populate your Firebase database instantly.

3. **Backend Firebase Admin SDK Bridge**:
   - Installed `firebase-admin` in `backend/`.
   - Configured in [`backend/src/config/firebase.js`](file:///c:/xampp/htdocs/LUBACanFindIT/backend/src/config/firebase.js).
   - Enables server-side exports, privileged maintenance updates, and validation.
