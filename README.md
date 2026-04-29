# Personal Garage - Local Setup Guide

This guide provides step-by-step instructions on how to run the Digital Garage application on your local machine.

## Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js**
- **PostgreSQL** (running locally on port 5432)

---

## Step 1: Database Setup (One-time only)

The backend includes a script to automatically create the database and tables.

1. Open a terminal in VS Code.
2. Navigate into the `backend` folder:
   ```bash
   cd backend
   ```
3. Run the database initialization script:
   ```bash
   npm run db:init
   ```
   *Note: This connects to PostgreSQL using the credentials in `backend/.env`. You should see "Database initialization completed successfully!"*

---

## Step 2: Start the Backend (API)

The backend is an Express.js server that connects to PostgreSQL.

1. In the same terminal (inside the `backend` folder), run the development server:
   ```bash
   npm run dev
   ```
2. The server should start and you will see: `Server is running on port 5000`

---

## Step 3: Start the Frontend (UI)

The frontend is a React application built with Vite.

1. Open a **new, separate terminal tab** in VS Code.
2. Ensure you are in the root directory (`PersonalGarage`).
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the link provided (usually `http://localhost:5173/`).

---

## Troubleshooting

- **Database Connection Error (`password authentication failed`)**: Ensure that your PostgreSQL password matches the one in `backend/.env` (currently set to `admin` for user `postgres`).
- **`npm error Missing script: "db:init"`**: You are running the command in the wrong folder. You must be inside the `backend` folder. Run `cd backend` first.
