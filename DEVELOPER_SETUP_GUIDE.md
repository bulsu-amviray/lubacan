# LUBA CanFindIT · Developer Setup & Onboarding Guide

This guide explains how to use **[`LUBA_CanFindIT_Master_Blueprint.md`](./LUBA_CanFindIT_Master_Blueprint.md)** and the **26 exported Figma screens** to set up, build, and run the complete **LUBA CanFindIT (Quezon City LGU Road Operations Admin System)**.

---

## 1. Prerequisites (Required Software)

Before starting, ensure the development machine has the following installed:
1. **Node.js** (v18.18+ or v20+ LTS) — [https://nodejs.org/](https://nodejs.org/)
2. **MySQL Server** (v8.0+) — [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)
3. **Code Editor / AI IDE** — Google Antigravity, VS Code, or Cursor
4. **Git** — For version control

---

## 2. How to Organize the Project Folder

1. Create a new project folder on your machine (for example, `luba-canfindit/`).
2. Place **`LUBA_CanFindIT_Master_Blueprint.md`** and the **26 Figma `.png` screens** into the root (or a `design-specs/` subfolder) so you can reference both the visual screens and the technical specification side by side.
3. Your target workspace layout once built will look like this:

```text
luba-canfindit/
├── LUBA_CanFindIT_Master_Blueprint.md   # Master architectural & code specification
├── DEVELOPER_SETUP_GUIDE.md             # This setup guide
├── design-specs/                        # The 26 exported Figma PNG screens
├── database/
│   ├── schema.sql                       # Extracted from Phase 2 of the Blueprint
│   └── seed.sql                         # Initial roles, permissions & sample QC data
├── backend/
│   ├── package.json
│   ├── .env                             # Local DB & JWT environment variables
│   └── src/
│       ├── server.js
│       ├── config/db.js
│       ├── middleware/
│       │   ├── auth.middleware.js
│       │   ├── rbac.middleware.js
│       │   └── validate.middleware.js
│       ├── controllers/
│       │   ├── reports.controller.js
│       │   ├── teams.controller.js
│       │   ├── users.controller.js
│       │   └── analytics.controller.js
│       └── routes/api.routes.js
└── frontend/
    ├── index.html
    └── js/
        ├── config/tailwind.config.js    # Extracted from Phase 1 of the Blueprint
        ├── state/store.js
        ├── services/api.service.js      # Includes direct local CSV download helper
        └── app.js
```

---

## 3. Option A: Fast-Track Setup Using an AI Coding Agent (Antigravity / IDE)

If the developer is using **Google Antigravity** (or another agentic IDE):

1. Open the project folder containing `LUBA_CanFindIT_Master_Blueprint.md` and the 26 Figma PNGs.
2. Copy and paste the following prompt into the AI chat:

```text
Read @LUBA_CanFindIT_Master_Blueprint.md in full. Execute Tasks 01 through 06 in Phase 5 by scaffolding the `database/`, `backend/`, and `frontend/` directories exactly as specified in Phases 1–4 of the blueprint. Keep the production SVG schematic map and direct local-machine CSV download behavior intact.
```

3. The agent will read the blueprint's embedded SQL DDL, Express controllers, RBAC middleware, and Tailwind tokens and generate all project files automatically.

---

## 4. Option B: Step-by-Step Manual Developer Setup

### Step 1: Set Up the MySQL Database (Phase 2 of Blueprint)

1. Copy the SQL block from **Section 2.2 (`schema.sql`)** of `LUBA_CanFindIT_Master_Blueprint.md` and save it as `database/schema.sql`.
2. Open a terminal and run the schema against your local MySQL 8.0+ server:

```bash
mysql -u root -p < database/schema.sql
```

3. Verify that all 16 tables and the 4 immutability triggers (`trg_prevent_report_history_update`, `trg_prevent_report_history_delete`, `trg_prevent_system_audit_update`, `trg_prevent_system_audit_delete`) were created inside the `luba_canfindit` database.

---

### Step 2: Set Up the Node.js / Express Backend (Phase 3 of Blueprint)

1. Create the `backend/` folder and initialize dependencies:

```bash
mkdir -p backend/src/{config,middleware,controllers,routes}
cd backend
npm init -y
npm install express mysql2 bcrypt jsonwebtoken cookie-parser cors helmet express-rate-limit dotenv
```

2. In `backend/package.json`, set `"type": "module"` so ES6 `import`/`export` syntax works natively.
3. Create a `backend/.env` file with your local database credentials:

```env
PORT=4000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=luba_canfindit
JWT_SECRET=replace_with_a_strong_64_char_secret_key
CORS_ORIGIN=http://localhost:4000
```

4. Implement the files in `backend/src/` using the route contracts and controller templates in **Phase 3** of `LUBA_CanFindIT_Master_Blueprint.md`:
   - `src/config/db.js`: MySQL2 connection pool (`timezone: '+08:00'`) and `withTransaction()` wrapper.
   - `src/middleware/auth.middleware.js`: JWT cookie/header verification + check that `users.account_status === 'Active'`.
   - `src/middleware/rbac.middleware.js`: `requireRole()`, `requirePermission()`, and `recordSystemAudit()`.
   - `src/middleware/validate.middleware.js`: Philippine mobile regex (`/^\+63\s?9\d{2}\s?\d{3}\s?\d{4}$/`) and date-range check (`fromDate <= toDate`).
   - `src/controllers/analytics.controller.js`: Includes `downloadReportsCsv()` which sets `Content-Disposition: attachment` so CSV exports download directly to the user's local `Downloads` folder.

---

### Step 3: Set Up the Frontend (Phase 1 & Phase 4 of Blueprint)

1. Create the `frontend/` folder structure:

```bash
mkdir -p frontend/js/{config,state,services}
```

2. Copy the Tailwind token configuration from **Section 1.4** of `LUBA_CanFindIT_Master_Blueprint.md` into `frontend/js/config/tailwind.config.js`.
3. Copy the SVG Schematic Map component (`renderSchematicMap`) from **Section 4.2** and the local CSV download helper (`triggerLocalCsvDownload`) from **Section 4.3** into your frontend modules.
4. Build the views and modal states matching the **26 Figma screens** listed in **Section 0** and the component state matrix in **Section 1.3**.

---

### Step 4: Run and Verify the Application

1. Start the Express server from the `backend/` folder:

```bash
cd backend
node src/server.js
```

2. Open `http://localhost:4000` in your browser.
3. Run through the **Phase 5 Acceptance Checklist** in `LUBA_CanFindIT_Master_Blueprint.md`:
   - [ ] Confirm `report_status_history` and `system_audit_logs` reject `UPDATE` and `DELETE` queries (`SQLSTATE 45000`).
   - [ ] Confirm incomplete Philippine mobile numbers (`+63 917 000`) trigger the red error state (`#B93838`) and disable the `Save & send invitation` button.
   - [ ] Confirm invalid date ranges (`From: 21 Oct 2026` > `To: 19 Oct 2026`) display the `Invalid range · end precedes start` error banner and disable `Apply range`.
   - [ ] Confirm clicking **Download CSV** downloads `LUBA canFindIT_QC_YYYY-MM-DD.csv` directly into your computer's `Downloads` folder with citizen contact details excluded by default.
