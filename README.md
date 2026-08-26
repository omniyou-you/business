# Self-Service Printing Kiosk V1 (Backend & Web Portal)

A high-performance, production-ready full-stack web application and REST API system built for automated self-service document printing kiosks.

Live Deployment: [https://business-you.up.railway.app](https://business-you.up.railway.app)

---

## 🛠 Tech Stack

* **Frontend & API Framework**: Next.js 14 (App Router, TypeScript)
* **Styling**: Tailwind CSS + Glassmorphism Design Token System
* **Database & ORM**: PostgreSQL (Supabase) + Prisma ORM
* **Object Storage**: Cloudflare R2 (AWS S3 Client SDK)
* **PDF Processing**: `pdf-parse` & `pdf-lib` (Server-side Page Count & Orientation Analysis)
* **QR & Code Generation**: `qrcode` + Node `crypto` (6-Digit Collision-Free Verification Codes)

---

## 🚀 Core System Workflow

```
[WEBPAGE]
Upload PDF ──► Customize Options ──► Simulate Payment ──► Receive 6-Digit Code & QR

[MINI-PC KIOSK]
Enter Code ──► POST /api/verify-print-code ──► Download PDF ──► Print ──► POST /api/mark-printed (Purges Storage)
```

---

## 📡 REST API Documentation

### 1. Customer API Routes
* `POST /api/upload`: Upload PDF file, parse page count, upload to Cloudflare R2 object storage.
* `POST /api/order`: Calculate print cost and create `PENDING` order record in PostgreSQL.
* `POST /api/pay-simulate`: Verify test payment, generate 6-digit Print Code & scannable QR Code PNG.

### 2. Kiosk / Mini-PC Verification APIs
* `POST /api/verify-print-code`: Kiosk verification gatekeeper. Validates code, payment, expiration, double-print protection, and returns public Cloudflare R2 download URL.
* `POST /api/mark-printed`: Kiosk completion webhook. Marks job `COMPLETED` and purges PDF document from Cloudflare R2.
* `GET /api/download/[file_id]`: Streams PDF binary file to printer.

---

## 🔑 Environment Variables Setup

```env
DATABASE_URL="postgresql://postgres:password@db.xxxx.supabase.co:5432/postgres"
NEXT_PUBLIC_APP_URL="https://business-you.up.railway.app"
R2_ACCOUNT_ID="a62c41a8481627d993a61a7d2705f97d"
R2_ACCESS_KEY_ID="your_access_key"
R2_SECRET_ACCESS_KEY="your_secret_key"
R2_BUCKET_NAME="business"
R2_PUBLIC_DOMAIN="https://pub-xxxx.r2.dev"
```

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Run Prisma database push
npx prisma db push

# Run development server
npm run dev
```

Open `http://localhost:3000` to launch the web portal locally.
