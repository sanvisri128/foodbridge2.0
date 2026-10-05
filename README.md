# FoodBridge 2.0 — Smart Food Rescue & Redistribution Network 🍲🌱

FoodBridge 2.0 is a production-ready real-time platform that connects food providers (restaurants, caterers, hostels, canteens, wedding halls) with registered NGOs, orphanages, and community shelters to eliminate food waste and fight hunger.

---

## 🌟 Key Features & Improvements in 2.0

### 1. 🔐 Secure 4-Digit Handover Verification (OTP)
- When an NGO claims a food donation, a unique **4-digit Pickup Verification Code** is generated.
- The NGO volunteer presents the code upon arrival at the provider location.
- The provider verifies the code in real-time to transition the status from `claimed` to `completed`.
- Prevents no-shows, unauthorized pickups, and tracking disputes.

### 2. 📊 Provider Dashboard & Impact Metrics (`/provider-dashboard`)
- Real-time impact scorecard: **Total Meals Rescued**, **CO2 Emissions Prevented (kg)**, **Active Listings**, and **Claim Status**.
- Fast Handover Verification box directly on the dashboard.
- Filter tabs: *All Listings*, *Active & Available*, *Claimed (Pending Pickup)*, *Completed History*.

### 3. 🚨 Community Urgent Food Requests (`/requests`)
- NGOs in urgent need (e.g., shelters, disaster relief, orphanages) can broadcast specific meal requirements.
- Food providers can browse open requests and click *"I Can Fulfill This Request"* to instantly pair and coordinate delivery.

### 4. ⏳ Real-Time Expiry Countdown & Urgency Badges
- Live second-by-second countdown timers (`CountdownTimer.jsx`) with dynamic color progression:
  - 🚨 **Critical** (< 2 hours remaining with pulsing alerts)
  - ⚡ **Warning** (< 6 hours remaining)
  - 🕒 **Active** (> 6 hours remaining)

### 5. 🛡️ Food Safety & Dietary Metadata
- Food classification: Pure Veg 🌱, Non-Veg 🍗, Vegan 🌿, Egg 🥚.
- Temperature & Storage guidelines: Hot / Freshly Cooked 🔥, Refrigerated ❄️, Frozen 🧊, Room Temperature 📦.
- Estimated meal portions (servings) for exact platform analytics.
- Food safety declaration checklist integrated into every listing.

### 6. 📍 Directions & Driver Coordination
- Integrated **Google Maps Directions** for every pickup address.
- One-click **WhatsApp Direct Message** and phone call links for zero-friction driver communication.

### 7. 🔔 In-App Notification Center
- Real-time notification bell with unread count badges.
- Automatic alerts when food is claimed, verified, cancelled, or requested.

### 8. 👤 User Profile & Impact Modal
- Editable organization contact info, operating address, and lifetime community impact statistics.

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS, React Router v6, Lucide Icons, Axios.
- **Backend**: Node.js, Express.js (ES Modules).
- **Database**: MongoDB with Mongoose ODM (indexed schemas).
- **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` password hashing and role-based access control (`provider` / `ngo`).

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables (`.env`)
```env
MONGODB_URI=mongodb://127.0.0.1:27017/foodbridge
JWT_SECRET=foodbridge_secret_2026
PORT=5000
```

### 3. Run Development Servers
```bash
# Runs Express backend on :5000 and Vite client on :5173 concurrently
npm run dev
```

### 4. Run Automated E2E Test Suite
```bash
node test_e2e.js
```

---

## 📡 API Endpoints Reference

### Authentication & Profile (`/api/auth`)
- `POST /api/auth/register` — Create Provider or NGO account
- `POST /api/auth/login` — Sign in and receive JWT
- `GET /api/auth/me` — Hydrate logged-in user profile
- `PUT /api/auth/profile` — Update organization details
- `GET /api/auth/impact` — User individual impact analytics

### Donations (`/api/donations`)
- `GET /api/donations` — Public unexpired listings (filters: `category`, `dietaryType`, `location`, `maxHours`)
- `GET /api/donations/stats/platform` — Platform-wide impact metrics
- `GET /api/donations/my` — Provider's posted listings
- `GET /api/donations/claimed` — NGO's claimed donations
- `POST /api/donations` — Post a surplus food donation (Provider only)
- `POST /api/donations/:id/claim` — Claim donation with 4-digit OTP (NGO only)
- `POST /api/donations/:id/verify-pickup` — Complete handover via OTP
- `POST /api/donations/:id/cancel` — Cancel claim or listing

### Food Requests (`/api/requests`)
- `GET /api/requests` — List open community food needs
- `POST /api/requests` — Post urgent food request (NGO only)
- `POST /api/requests/:id/fulfill` — Offer to fulfill request (Provider only)
- `DELETE /api/requests/:id` — Close request (NGO only)

### In-App Notifications (`/api/notifications`)
- `GET /api/notifications` — Fetch user alerts and unread count
- `PUT /api/notifications/:id/read` — Mark alert as read
- `PUT /api/notifications/read-all` — Mark all alerts as read
