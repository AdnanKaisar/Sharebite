# 🍽️ ShareBite — Surplus Food Donation & Distribution Platform

ShareBite is a modern, high-performance web platform designed to reduce food waste and support local shelters. It connects food donors (restaurants, events, households) with verified NGOs and volunteer couriers to streamline food donation logistics, real-time tracking, and verified handovers.

---

## 🌟 Key Capabilities
* **📍 Smart Geo-Matching**: Automatically pairs donors with NGOs within a 5-mile radius to minimize travel time and preserve food freshness.
* **🚚 Real-Time Courier Tracking**: Integrates Google Maps APIs and WebSockets to stream live location coordinates from volunteers to NGOs.
* **🔒 Secure QR Handover**: Multi-party chain of custody verification using dynamic QR code generation for pickups and deliveries.
* **💬 Integrated Delivery Chat**: Live coordination channels (Socket.io) between Donors, Volunteers, and NGO representatives.
* **🧠 AI-Powered Insights**: Built-in AI shelf-life estimator and food categorizer to ensure food safety.
* **🛡️ Administrative Verification**: Secure console dashboard for platform verification of NGO credentials, database audits, and impact analytics.

---

## 🛠️ Technology Stack
* **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Lucide React, Socket.io-client.
* **Backend**: Node.js, Express, Socket.io, JSON Web Tokens (JWT), BcryptJS.
* **Database**: MongoDB (via Mongoose) with an automatic local **JSON file-based database fallback** for lightweight local execution.

---

## 📁 Repository Structure
```text
├── backend/
│   ├── config/          # Database (MongoDB / JSON) configurations
│   ├── controllers/     # Authentication, Donations, Deliveries, Admin, Chat controllers
│   ├── data/            # Local JSON database files (when MONGO_URI is empty)
│   ├── middleware/      # Protected routes and role-based access control (RBAC)
│   ├── models/          # Mongoose & JSON model interfaces
│   ├── routes/          # REST API endpoints
│   └── server.js        # Node server & Socket.io socket handlers
├── frontend/
│   ├── src/
│   │   ├── components/  # Layout, Navigation, and Interactive UI cards
│   │   ├── context/     # Auth and Notifications Context Providers
│   │   ├── pages/       # Donor, NGO, Volunteer, Admin dashboards & Login screens
│   │   └── services/    # Axios-less API query layers
│   ├── vercel.json      # Client-side SPA routing overrides for Vercel
│   └── vite.config.js   # Vite server and local proxy configurations
├── HOW_TO_RUN.txt       # Step-by-step startup guide
├── package.json         # Concurrently script manager
└── run_project.bat      # Windows batch script executor
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.0.0 or higher)

### 1. Install Dependencies
Run the install command from the root folder:
```bash
npm run install-all
```

### 2. Configure Environment Variables
Create a `.env` file in the `/backend` directory:
```env
PORT=5000
JWT_SECRET=your_jwt_secret_key_here

# Leave MONGO_URI empty to run on the local JSON file database fallback.
# Add your MongoDB Atlas connection string for persistent cloud storage.
MONGO_URI=
```

### 3. Launch the Application
Run both the Express backend and the Vite dev server concurrently:
```bash
npm run dev
```
* **Frontend Portal**: [http://localhost:5173/](http://localhost:5173/)
* **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)

---

## 🔑 Demo Access Credentials

### Secure Admin Portal
* **URL**: [http://localhost:5173/admin-login](http://localhost:5173/admin-login)
* **Email**: `adnankaisar112@gmail.com`
* **Password**: `Adnankaisarwani@7780946112`

---

## 🌐 Production Deployment Guides

### Backend Deployment (e.g. Render / Railway)
1. Deploy the `backend` folder as a Node Web Service.
2. In your host environment variables, configure:
   * `PORT`: `10000` (or leave default)
   * `JWT_SECRET`: A strong secret key
   * `MONGO_URI`: Your production MongoDB Atlas URI (required for serverless/ephemeral hosts since local file writes are not persisted).

### Frontend Deployment (Vercel)
1. Import your GitHub repository into Vercel.
2. Configure the deployment settings:
   * **Framework Preset**: `Vite`
   * **Root Directory**: `frontend`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
3. Add the following environment variable in **Vercel Settings**:
   * **Key**: `VITE_API_BASE`
   * **Value**: `https://your-backend-app.onrender.com/api` (your deployed backend base URL)
4. Trigger the deployment! The built-in `vercel.json` will automatically handle SPA routing and direct requests correctly.
