# CoWork - Co-working Space Booking System

CoWork is a comprehensive, production-ready, full-stack desk and meeting room booking application built with the **MERN Stack** (MongoDB, Express, React 18, Node.js). 

It features Role-Based Access Control, JWT & Refresh Token Authentication, MongoDB Transaction-backed concurrent booking capabilities, and an ultra-modern aesthetic UI built with Tailwind CSS.

## 🚀 Key Features

* **Concurrency-safe Bookings:** Prevents double-booking and race conditions via ACID MongoDB Transactions (`session.withTransaction`).
* **Role-Based Access (RBAC):** Distinct workflows for `Visitor`, `Member`, and `Admin`.
* **State of the art UI/UX:** Built with React 18, Tailwind CSS, Lucide Icons, featuring micro-animations, glassmorphism, and responsive design.
* **Auto-Rejection logic:** Admin approving a booking automatically rejects all overlapping pending requests for the same slot.
* **Full-text Search:** Built-in MongoDB `$text` search index integrated seamlessly with the UI.
* **Downtime Management:** Admin-manageable `Maintenance` windows effectively blocking bookings during repairs/cleaning.
* **Security & Performance:** Helmet, Express Rate Limiter, Mongoose query sanitization, Joi validation, automated Axios interceptor for transparent JWT rotation.

## 📁 Folder Structure

```
.
├── client/                     # Frontend React Application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # React Contexts (AuthContext)
│   │   ├── hooks/              # Custom Hooks
│   │   ├── layouts/            # Layout wrappers (MainLayout, DashboardLayer)
│   │   ├── pages/              # Views per route 
│   │   │   ├── admin/          # Admin specific pages
│   │   │   └── member/         # Member specific pages
│   │   ├── routes/             # App routing and route guards
│   │   ├── services/           # Axios API integrations
│   │   └── utils/              # Frontend utilities
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── server/                     # Backend API Application
    ├── src/
    │   ├── config/             # DB and Environment config
    │   ├── constants/          # Application-wide constants
    │   ├── controllers/        # Route Handlers
    │   ├── middlewares/        # Auth, Validation, Role Guards, Error Handlers
    │   ├── models/             # Mongoose Schemas (User, Space, Booking, Maintenance)
    │   ├── routes/             # Express API Routes
    │   ├── services/           # Business Logic Layer
    │   ├── utils/              # Utilities (API errors, mailers)
    │   └── validators/         # Joi Request Validation Schemas
    ├── .env
    ├── package.json
    └── app.js                  # Express Entry point
```

## 🛠 Prerequisites

- Node.js (v18+ recommended)
- MongoDB running locally in a Replica Set (`mongodb://localhost:27017/coworking_db`)
*(Note: A MongoDB Replica Set is required to use Transactions.)*

## 📦 Installation & Setup

1. **Clone & Setup the database:**
   Make sure MongoDB is running as a replica set if testing concurrency via transactions.

2. **Backend Setup:**
   ```bash
   cd server
   npm install
   # Ensure .env is properly populated (created automatically on setup)
   npm run dev
   ```
   *The backend will run on `http://localhost:5000`.*

3. **Frontend Setup:**
   ```bash
   cd client
   npm install
   npm run dev
   ```
   *The client will run on `http://localhost:5173`.*

## ⚙️ Environment Variables

The `server/.env` file requires the following structure:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/coworking_db
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
CLIENT_URL=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587...
```

## 📚 API Endpoints
*Complete list available via attached Postman Collection (`Coworking_Space_Postman_Collection.json`)*

**Auth**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh-token`
- `POST /api/auth/logout`

**Spaces**
- `GET /api/spaces` *(Search, filter, paginate)*
- `GET /api/spaces/:id`
- `GET /api/spaces/:id/availability`
- `POST /api/spaces` *(Admin)*
- `PUT /api/spaces/:id` *(Admin)*
- `DELETE /api/spaces/:id` *(Admin)*

**Bookings**
- `POST /api/bookings` *(Member)*
- `GET /api/bookings/me` *(Member)*
- `PATCH /api/bookings/:id/cancel` *(Member)*
- `GET /api/bookings` *(Admin)*
- `PATCH /api/bookings/:id/approve` *(Admin)*
- `PATCH /api/bookings/:id/reject` *(Admin)*

**Maintenance**
- `POST /api/maintenance` *(Admin)*
- `GET /api/maintenance` *(Admin)*
- `PUT /api/maintenance/:id` *(Admin)*
- `DELETE /api/maintenance/:id` *(Admin)*

## 📸 Screenshots

*(Replace with actual URLs once deployed)*
- `Landing Page Placeholder`
- `User Dashboard Placeholder`
- `Admin Booking Approvals Placeholder`

## 👨‍💻 Tested Configurations
- Backend framework standard test: Runs normally on standard express environment.
- Verified on Node v18+, React 18, Vite.
