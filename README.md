# DocLink — Telemedicine Platform for Remote Healthcare

DocLink is a robust, full-stack, enterprise-grade telemedicine application built to streamline remote clinical consulting, patient intake triage, real-time queue management, and secure web video consultations. 

---

## 📋 PROJECT IDENTITY
* **Full Title:** DocLink: A Telemedicine Platform for Remote Healthcare
* **Nature:** Academic project developed during internship at Store Republic
* **Developer:** Solo Developer (3–4 months duration)
* **SDLC Model:** Incremental Model (8 defined phases)

---

## 🛠️ TECHNOLOGY STACK

### Frontend (`/frontend`)
* **Framework:** React 18 (JavaScript) + Vite
* **Styling:** Tailwind CSS + dynamic dark/light Emerald Theme transition
* **Components:** shadcn/ui (primitives: Dialog, Card, Badge, Input, Select, Tabs, Skeleton, Switch, Avatar, Separator)
* **Animation:** Framer Motion
* **Forms & Validation:** React Hook Form + Zod validation schemas (`frontend/src/schemas/`)
* **State & Fetching:** TanStack Query v5 + Axios
* **Real-time & Video:** Socket.io-client + Daily.co Video SDK
* **Alerts:** SweetAlert2 with dynamic custom light/dark theme-aware styling helper (`frontend/src/lib/swal.js`)
* **PDF Engine:** jsPDF

### Backend (`/backend`)
* **Runtime:** Node.js + Express
* **Database:** MongoDB + Mongoose ODM
* **Auth Verification:** Firebase Admin SDK (Token Verification)
* **Real-time Engine:** Socket.io (State-synchronized consultation queues)
* **Video Call Server:** Daily.co REST API Integration

---

## 🚀 ARCHITECTURAL TOPOLOGY & KEY FEATURES

1. **Patient Intake Triage & Booking:** Secure intake forms checking clinical symptoms, age, and weight.
2. **Dynamic Real-Time Queues:** Built on a Socket.io event layer, updating doctor sidebars and letting patients track estimated wait times in real time.
3. **Daily.co WebRTC Consultations:** Instantaneous server-side room creation and secure token verification for WebRTC patient-doctor calls.
4. **Prescription Engine:** Auto-formats prescriptions with jsPDF, supports instant dashboard uploads and local PDF generation.
5. **Theme-Aware SweetAlert2:** All notifications dynamically read the document root `.dark` state to render clean, readable warning/success/confirmation banners across Light/Dark modes.
6. **Consolidated Schema Layer:** Centralized form checkers under `src/schemas/` cleanly separated from display markup.

---

## 🗂️ MONOREPO DIRECTORY STRUCTURE

```text
doclink/
├── backend/                  # Node.js + Express Server
│   ├── api/                  # Daily.co and other external services API helpers
│   ├── db/                   # MongoDB connection configuration
│   ├── middleware/           # Firebase Auth & verification middlewares
│   ├── routes/               # API Router files (auth, rooms, queues)
│   ├── seed/                 # Database seed templates (specialties, doctors)
│   ├── socket/               # Real-time Socket.io signaling & queue handlers
│   └── server.js             # Express API & Socket.io server entry
│
└── frontend/                 # React (Vite) App
    ├── public/               # Static web assets
    └── src/
        ├── api/              # Axios service endpoints
        ├── components/       # Reusable components & shadcn controls
        ├── hooks/            # Custom React hooks (sockets, timers)
        ├── lib/              # Shared helper functions (swal.js theming, socket client)
        ├── pages/            # Core views (patient dashboards, doctor queues, auth)
        ├── schemas/          # Centralized Zod validation modules
        └── routes.jsx        # Navigation routing mappings
```

---

## ⚙️ INSTALLATION & QUICK START

### 1. Prerequisites
* **Node.js** (v18+ recommended)
* **MongoDB** (Local instance or Atlas Connection string)
* **Firebase Project** (Client keys & admin SDK private key credentials)
* **Daily.co API Key** (For video consultations)

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependency modules:
   ```bash
   npm install
   ```
3. Set up environment variables. Create a `.env` file following `.env.example`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/doclink
   DAILY_API_KEY=your_daily_co_api_key
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   FIREBASE_PRIVATE_KEY="your_firebase_private_key"
   ```
4. Seed the database with initial Specialties and Doctor profiles:
   ```bash
   npm run seed
   ```
5. Spin up the Backend API and Socket.io server in development mode:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Create a `.env` file following `.env.example`:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_SOCKET_URL=http://localhost:5000
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   ```
4. Start the Vite development hot-reloaded dev server:
   ```bash
   npm run dev
   ```

---

## 🧪 VALIDATION & TESTING
* **Build Verification:** Run `npm run build` inside the `/frontend` directory to ensure complete module dependency resolution and compiler readiness.
* **Socket Queue Check:** Open concurrent patient and doctor client browsers, queue up a new patient, and inspect the real-time sidebar list updates.
