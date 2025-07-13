# 📘 BookFlow – Full-Stack Appointment Booking System

## 🚀 Overview

**BookFlow** is a modern, multi-tenant appointment booking system tailored for service-based businesses. Built with a robust TypeScript stack, it empowers users to manage businesses, services, staff, and bookings seamlessly. Customers can book appointments without creating accounts, simplifying engagement.

Technologies include a **React 18 + TypeScript** frontend, **Express** backend, **Drizzle ORM**, and **PostgreSQL** with serverless hosting via **Neon**. Designed for performance, scalability, and developer happiness.

---

## 🧠 System Architecture

### 💥 Frontend
| Feature              | Tech Stack                                     |
|----------------------|------------------------------------------------|
| Framework            | React 18 with TypeScript                       |
| Routing              | `wouter`                                       |
| State Management     | `@tanstack/react-query`                        |
| Forms & Validation   | `react-hook-form` + `zod`                      |
| UI Components        | `@radix-ui/react` + `shadcn/ui`               |
| Styling              | Tailwind CSS + CSS variables                   |
| Build Tool           | Vite                                           |

### ⚙️ Backend
| Feature              | Tech Stack                                     |
|----------------------|------------------------------------------------|
| Runtime & Language   | Node.js + Express + TypeScript (ESM)          |
| Authentication       | Passport.js (Local Strategy)                  |
| Password Security    | Node.js `crypto.scrypt` with salt             |
| Sessions             | PostgreSQL via `connect-pg-simple`            |

### 💄 Database
| Feature              | Tech Stack                                     |
|----------------------|------------------------------------------------|
| Database             | PostgreSQL (serverless via Neon)              |
| ORM                  | Drizzle ORM                                    |
| Migrations           | Drizzle Kit                                    |
| Pooling              | Neon serverless connection pool               |

---

## 🧩 Core Features

### 🔐 Authentication
- Session-based auth (username/password)
- Password hashing with `scrypt`
- PostgreSQL-backed session persistence
- Custom middleware to protect routes
- Auth flow built for security and speed

### 🏢 Business Management
- Multi-tenant architecture
- Dynamic business profiles and templates
- Service catalog with pricing and time slots
- Staff management with role permissions
- Availability scheduling

### 🗓️ Booking System
- Public booking page (no login required)
- Staff/service selection and availability
- Slot-based scheduling with conflict prevention
- Customer info collection with confirmation
- Appointment lifecycle tracking

---

## 🧬 Data Models

| Model        | Description                                  |
|--------------|----------------------------------------------|
| `User`       | Credentials, sessions, profile               |
| `Business`   | Business details, settings                   |
| `Service`    | Service catalog entries                      |
| `Staff`      | Team members and working hours               |
| `Customer`   | Booking customers (phone/email-based)        |
| `Appointment`| Booking info: service, time, staff, customer |

---

## 🔄 Data Flow

### 🔐 Auth Flow
```
1. Client ➔ POST /api/login
2. Passport authenticates via DB
3. Session created → stored in Postgres
4. Cookie returned to client
5. All protected routes check session
```

### 🛋️ Business Onboarding
```
1. Authenticated user accesses onboarding
2. Business info + industry selected
3. Service templates created by industry
4. Staff added
5. Dashboard activated
```

### 🗓️ Booking Flow
```
1. Customer opens public booking page
2. Picks service → staff → slot
3. Inputs contact info
4. Appointment stored in DB
5. Confirmation shown
```

### 📡 Sync & Caching
- React Query manages async calls + caching
- Optimistic updates for UX
- Auto refetch on focus/reconnect
- Errors handled via toasts

---

## 📦 Dependencies

### ➜ Frontend
- `@radix-ui/react`
- `shadcn/ui`
- `@tanstack/react-query`
- `wouter`
- `react-hook-form`
- `zod`
- `date-fns`
- `tailwindcss`
- `lucide-react`

### ➜ Backend
- `express`
- `passport`
- `drizzle-orm`
- `@neondatabase/serverless`
- `connect-pg-simple`
- `tsx`

### ➜ Dev Tools
- `vite`
- `esbuild`
- `typescript`
- `drizzle-kit`

---

## 🚢 Deployment Strategy

### 💡 Development
- Vite dev server for frontend
- `tsx` for backend TypeScript
- Neon Postgres via Replit
- `.env` for secrets/config

### 🛠️ Production
- Frontend → built with `vite build`
- Backend → bundled with `esbuild`
- Static files served via Express
- Drizzle migrations run at startup

### 🔧 Replit Config
| Setting           | Value                |
|-------------------|----------------------|
| Node              | v20                  |
| Modules           | Web + PostgreSQL 16  |
| Port              | Internal 5000 → 80   |
| Build Command     | `npm run build`      |
| Start Command     | `npm run start`      |
| Dev Command       | `npm run dev`        |

### 🔑 Environment Variables
```env
DATABASE_URL=your-postgres-url
SESSION_SECRET=your-session-secret
NODE_ENV=development | production
```

---

## 🗓️ Changelog

```plaintext
🗓️ June 23, 2025
- Initial project setup
- Appointment creation in dashboard
- Landing page UI fixes
- Completed customer booking flow (no login required)
```

---

## 💬 Communication Style

> BookFlow is built to be intuitive — both for end users and developers. Simple language, clean architecture, and modern tooling.

---

## 🡩‍💻 Freelance Inquiries

I’m currently accepting **freelance full-stack web development projects** — especially involving:

- React / TypeScript / Tailwind
- Node.js / Express
- Firebase, PostgreSQL, or MongoDB
- Custom SaaS solutions, admin dashboards, and appointment platforms

📨 Reach out at: **[akshat.arora456@gmail.com](mailto:akshat.arora456@gmail.com)**

Let’s build something exceptional.

---
