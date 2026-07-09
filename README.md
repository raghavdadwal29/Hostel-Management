# CGC University — Smart Hostel Management System

A full-stack **MERN** (MongoDB, Express, React, Node) application for managing hostel
operations across three roles — **Admin**, **Warden**, and **Student** — themed after the
CGC University Mohali hostel portal (maroon / navy / white).

---

## 1. What's included

| Area | Status |
|---|---|
| JWT auth, bcrypt hashing, role-based access control | ✅ Fully implemented |
| Forgot / reset password via email | ✅ Implemented (Nodemailer). Falls back to console-log in dev if SMTP isn't configured |
| Admin: students, wardens, hostels/rooms, allocation, applications, fees, notices, reports | ✅ Fully implemented |
| Warden: dashboard, complaints, leave approval, attendance, visitors, announcements, occupancy | ✅ Fully implemented |
| Student: apply, room, complaints, leave, attendance, notices, fees, profile, QR ID | ✅ Fully implemented |
| Image uploads (complaints) | ✅ Multer — stores locally in `/backend/uploads`, or Cloudinary if keys are set |
| Online fee payment | ✅ Razorpay if keys configured, otherwise an **instant-success mock** so the flow works out of the box |
| CSV / PDF export | ✅ json2csv + pdfkit |
| QR code for student ID | ✅ `qrcode` package, rendered in Student → Profile |
| Dark / light mode | ✅ Toggle in the top navbar (Tailwind `class` strategy) |
| Charts (Recharts) | ✅ Admin dashboard (fee trend bar chart, complaints pie chart) |
| Notifications (in-app) | ✅ Bell icon + dropdown, generated server-side on key events |
| Activity logs | ✅ `ActivityLog` model included; wire into any controller you want audited |

**Scoped integrations** — these work immediately in a mocked/local form, and become
"real" the moment you drop in credentials in `.env`, with no code changes required:

- **Payments**: without `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`, "Pay Now" completes
  instantly server-side (clearly labeled "demo mode" in the UI) so you can test the
  full fee lifecycle. Add real keys to get the actual Razorpay checkout modal.
- **Image storage**: without Cloudinary keys, complaint images are stored on local disk
  under `backend/uploads` and served at `/uploads/...`. Add Cloudinary keys to switch to
  cloud storage automatically.
- **Email**: without SMTP credentials, password-reset emails are printed to the server
  console instead of sent, so the flow is still fully testable locally.

---

## 2. Tech stack

- **Backend**: Node.js, Express, MongoDB + Mongoose, JWT, bcryptjs, Multer, Nodemailer,
  PDFKit, json2csv, qrcode, Razorpay SDK, Helmet, express-rate-limit
- **Frontend**: React 18 (Vite), React Router v6, Tailwind CSS, Axios, Recharts,
  react-hot-toast, react-icons

---

## 3. Folder structure

```
hostel-management/
├── backend/
│   ├── config/          # DB + Cloudinary config
│   ├── models/           # Mongoose schemas (13 collections)
│   ├── controllers/       # Business logic, grouped by feature
│   ├── routes/            # Express routers
│   ├── middleware/        # auth, role guard, error handler, multer, validation
│   ├── utils/             # email, JWT, pagination/search, notifications, payments
│   ├── seed/seed.js        # Sample data seeder
│   ├── uploads/            # Local image storage (used if Cloudinary isn't configured)
│   ├── .env.example
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/     # Shared UI: DashboardLayout, DataTable, Modal, StatCard...
    │   ├── context/         # AuthContext, ThemeContext
    │   ├── services/api.js  # Axios instance with interceptors
    │   └── pages/
    │       ├── auth/         # Login, Register, Forgot/Reset Password (CGC-themed)
    │       ├── admin/        # 8 pages
    │       ├── warden/       # 6 pages
    │       └── student/      # 9 pages
    ├── .env.example
    └── vite.config.js
```

---

## 4. Prerequisites

- Node.js 18+
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas connection string

---

## 5. Setup

### Backend

```bash
cd backend
cp .env.example .env      # then edit values as needed (MONGO_URI, JWT_SECRET, etc.)
npm install
npm run seed               # optional but recommended — creates sample admin/warden/students
npm run dev                 # starts on http://localhost:5000
```

### Frontend

```bash
cd frontend
cp .env.example .env       # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                 # starts on http://localhost:5173
```

Visit **http://localhost:5173** — you'll land on the CGC-themed login screen.

### Seed login credentials (after `npm run seed`)

| Role | Login Identifier | Password |
|---|---|---|
| Admin | `ADM001` | `Admin@123` |
| Warden (Boys) | `EMP101` | `Warden@123` |
| Warden (Girls) | `EMP102` | `Warden@123` |
| Student | `2101CS001` | `Student@123` |

The login screen accepts **either** the code (Roll/Enrollment/EMP) shown above **or**
the account's email address.

---

## 6. Environment variables

See `backend/.env.example` and `frontend/.env.example` for the full list. Nothing beyond
`MONGO_URI` and `JWT_SECRET` is required to run the app locally — every third-party
integration (email, Cloudinary, Razorpay) has a safe fallback as described above.

---

## 7. API documentation (summary)

All endpoints are prefixed with `/api`. Protected routes require
`Authorization: Bearer <token>`.

### Auth — `/api/auth`
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Student self-registration |
| POST | `/login` | Public | Login with `{ identifier, password }` (code or email) |
| GET | `/me` | Private | Get current user + role profile |
| PUT | `/update-password` | Private | Change password while logged in |
| POST | `/forgot-password` | Public | Send password reset email |
| PUT | `/reset-password/:token` | Public | Reset password using emailed token |

### Admin — `/api/admin` (role: admin)
`GET /dashboard` · `GET/POST/PUT/DELETE /students[/:id]` · `GET /applications` ·
`PUT /applications/:id/review` · `GET/POST/PUT/DELETE /wardens[/:id]` ·
`GET /fees` · `POST /fees/generate`

### Hostel / Rooms — `/api/hostel` (admin write, admin+warden read)
`GET/POST/PUT/DELETE /hostels[/:id]` · `GET/POST/PUT/DELETE /rooms[/:id]` ·
`GET /occupancy` · `GET /allocations` · `POST /allocations` ·
`PUT /allocations/:id/deallocate`

### Warden — `/api/warden` (role: warden)
`GET /dashboard` · `GET /students`

### Student — `/api/student` (role: student)
`GET/PUT /profile` · `POST /apply` · `GET /qr-code`

### Complaints — `/api/complaints`
`GET /` · `GET /:id` · `POST /` (student, multipart images) ·
`PUT /:id/status` (warden/admin) · `POST /:id/comments`

### Visitors — `/api/visitors`
`GET /` · `POST /` (student) · `PUT /:id/review` · `PUT /:id/check-in` · `PUT /:id/check-out`

### Attendance — `/api/attendance`
`GET /` · `GET /stats` (admin/warden) · `POST /mark` (warden/admin, bulk)

### Leave — `/api/leaves`
`GET /` · `POST /` (student) · `PUT /:id/review` (warden/admin)

### Fees — `/api/fees`
`GET /my-fees` (student) · `POST /:id/pay/order` · `POST /:id/pay/confirm` ·
`GET /:id/receipt` (PDF download)

### Notices — `/api/notices`
`GET /` · `POST /` (admin/warden) · `PUT /:id` · `DELETE /:id`

### Notifications — `/api/notifications`
`GET /` · `PUT /:id/read` · `PUT /read-all`

### Reports — `/api/reports` (role: admin)
`GET /students/csv` · `GET /fees/csv` · `GET /summary/pdf`

---

## 8. Database collections

`User`, `Student`, `Warden`, `Hostel`, `Room`, `Allocation`, `Complaint`, `Visitor`,
`Attendance`, `Fee`, `LeaveRequest`, `Notice`, `Notification`, `ActivityLog` — all
defined as Mongoose schemas in `backend/models/`.

---

## 9. Deployment notes

- Set `NODE_ENV=production` and a strong `JWT_SECRET` in production.
- Point `CLIENT_URL` (backend) and `VITE_API_URL` (frontend) at your deployed domains.
- Run `npm run build` in `frontend/` and serve the `dist/` folder via any static host
  (Vercel, Netlify, Nginx) or wire Express to serve it directly.
- Deploy `backend/` to any Node host (Render, Railway, EC2, etc.) with a MongoDB Atlas
  connection string.
- Add real Cloudinary / Razorpay / SMTP credentials for production-grade image storage,
  payments, and email.

---

## 10. Notes on scope

This is a complete, runnable full-stack implementation of every module requested
(auth, admin/warden/student portals, room management, complaints, visitors,
attendance, fees, notices, notifications, dashboard analytics, CSV/PDF export, QR
codes). Two things are intentionally simplified rather than left unbuilt:

- **Payment gateway** ships with a working mock so the entire fee lifecycle (generate →
  pay → receipt) is testable without a merchant account; swap in real Razorpay keys
  for production.
- **Pagination** is implemented server-side (`ApiFeatures`) and used by the students/fees
  list endpoints; the admin UI currently renders the first page of results — extend with
  a `<Pagination />` control if you need multi-page browsing in the UI for very large datasets.
