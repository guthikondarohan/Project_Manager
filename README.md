# ProjectFlow: Role-Based Project Management App

A full-stack, aesthetically rich web application for project and task management with role-based access control (Admin/Member).

## Features
- **Authentication**: JWT-based secure signup and login.
- **Role-Based Access Control**:
  - **Admin**: Can create projects, create tasks, and fully edit all tasks (title, description, assignee, due date, status).
  - **Member**: Can only update the status of tasks.
- **Project & Task Management**: View all projects, view tasks scoped to a specific project.
- **Dynamic Task Board**: Tasks are visually organized into To Do, In Progress, and Done.
- **Rich Aesthetics**: Custom dark-mode UI with glassmorphism, smooth animations, and a modern color palette built using Vanilla CSS.

## Tech Stack
- **Framework**: Next.js 15+ App Router (Fullstack)
- **Database**: SQLite (local) via Prisma ORM (Easily switchable to Postgres for production)
- **Styling**: Vanilla CSS (Custom Design System in `globals.css`)
- **Authentication**: Custom JWT with `jsonwebtoken`, `bcryptjs`, and HTTP-only cookies.

## Local Development
1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Initialize Database**:
   ```bash
   npx prisma db push
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```

4. **Access the App**: Navigate to `http://localhost:3000`

## Railway Deployment Instructions

1. **Push to GitHub**:
   Commit and push this repository to your GitHub account.

2. **Railway Setup**:
   - Go to [Railway.app](https://railway.app/).
   - Click **New Project** -> **Deploy from GitHub repo** and select your project.

3. **Database Setup (Optional but Recommended)**:
   - To use PostgreSQL instead of SQLite on Railway:
     - In the Railway dashboard, click **New** -> **Database** -> **Add PostgreSQL**.
     - Open your Next.js app's settings in Railway and go to **Variables**.
     - Add `DATABASE_URL` and point it to the PostgreSQL connection URL.
     - Add `JWT_SECRET` (e.g., `super_secret_key_123`).
     - Update `prisma/schema.prisma` to use `provider = "postgresql"` instead of `"sqlite"`.
     - Update Railway build command to include prisma db push:
       ```bash
       npx prisma generate && npx prisma db push && next build
       ```

   - **Using SQLite on Railway (Alternative)**:
     - If you want to stick with SQLite, you must add a persistent volume to your Railway service to ensure the database isn't lost on restart.
     - Go to your Railway service -> **Volumes** -> **New Volume** -> Mount it to `/app/prisma`.

4. **Live URL**:
   - Once deployed, Railway will generate a public URL. You can map a custom domain if needed.

## Project Structure
- `/app`: Next.js App Router (Pages, API Routes).
- `/app/api`: Backend REST APIs (Auth, Projects, Tasks).
- `/app/globals.css`: Core design system, tokens, and utility classes.
- `/components`: Reusable React components (DashboardClient, TaskCard).
- `/lib`: Utility functions for Prisma and Authentication.
- `/prisma`: Database schema definition.
