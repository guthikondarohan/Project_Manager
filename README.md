# ProjectFlow | Enterprise SaaS Project Management

ProjectFlow is a high-impact, feature-rich project management application designed with a premium **Dynamic Neumorphic Glass** aesthetic. Built for modern teams, it integrates AI-powered productivity, real-time synchronization, and deep analytics to streamline workflows and provide actionable insights.

**Live Demo**: [https://compassionate-happiness-production-f67c.up.railway.app/](https://compassionate-happiness-production-f67c.up.railway.app/)

---

## 🚀 Enterprise Features

### ✨ AI Task Breakdown (Gemini Powered)
Intelligently decompose large tasks into manageable subtasks with a single click. Uses the Google Gemini API to analyze task titles and descriptions to generate actionable steps.

### 📈 Real-Time Collaboration (Pusher)
Experience instant updates. When a team member creates a task, changes a status, or assigns a user, the dashboard updates across all connected clients in real-time without refreshing.

### 📊 Advanced Analytics (Recharts)
Gain a bird's-eye view of project health with interactive data visualizations:
- **Velocity Tracking**: Monitor task completion rates over the last 7 days.
- **Task Distribution**: Visualize the balance between To Do, In Progress, and Done.
- **Team Load Analysis**: Identify the most overloaded members to balance work.

### 📋 Activity Timeline & Audit Logs
A complete audit trail for your projects. Every status change, assignment, and creation is logged with timestamps, providing a transparent history of project progress.

### 🔔 Smart Notifications
Stay informed with real-time toast notifications (React Hot Toast) for all critical actions and automatic alerts for overdue tasks upon login.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 15+ (App Router), React 19, Vanilla CSS (Premium Glassmorphism)
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Prisma ORM with SQLite (Persistent Volume Support)
- **Real-Time**: Pusher (WebSockets)
- **AI**: Google Gemini Pro (Generative AI SDK)
- **Visualization**: Recharts
- **Authentication**: JWT (JSON Web Tokens) with secure cookie storage

---

## 📦 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file in the root:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your_secret_key"
   GEMINI_API_KEY="your_google_gemini_api_key"
   
   # Pusher (Optional for local dev)
   PUSHER_APP_ID="your_id"
   PUSHER_KEY="your_key"
   PUSHER_SECRET="your_secret"
   PUSHER_CLUSTER="your_cluster"
   NEXT_PUBLIC_PUSHER_KEY="your_key"
   NEXT_PUBLIC_PUSHER_CLUSTER="your_cluster"
   ```

3. **Initialize Database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```

---

## ☁️ Railway Deployment Instructions

1. **Persistent SQLite Setup**:
   To use SQLite on Railway with data persistence:
   - Go to your Railway service -> **Volumes** -> **New Volume**.
   - Set the mount path to `/app/prisma`.

2. **Build Configuration**:
   Set your build command to:
   ```bash
   npx prisma generate && npx prisma db push && next build
   ```

3. **Environment Variables**:
   Add all variables from your `.env` to the Railway **Variables** tab.

---

## 🎨 UI/UX Design Philosophy
- **Glassmorphism 2.0**: High-transparency panels with SVG noise textures and frosted-glass effects.
- **Mesh Gradients**: Dynamic, animated background gradients for a modern, high-end feel.
- **Sequential Animations**: Staggered entrance animations for all dashboard elements to provide a professional, polished user experience.
