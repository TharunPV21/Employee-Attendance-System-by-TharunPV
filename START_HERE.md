# How to Start the Project

## Step 1: Start MongoDB
Make sure MongoDB is running on your system (localhost:27017)

## Step 2: Start Backend
Open a terminal in the `backend` folder and run:
```
npm install
npm run dev
```
You should see: "MongoDB connected" and "Server running on port 5000"

## Step 3: (Optional) Load Sample Data
In the `backend` folder, run:
```
npm run seed
```
This creates sample users:
- Manager: manager@company.com / manager123
- Employees: arun@company.com, gopal@company.com, kavitha@company.com, suresh@company.com / employee123

## Step 4: Start Frontend
Open a NEW terminal in the `frontend` folder and run:
```
npm install
npm run dev
```
You should see: "Local: http://localhost:3000/"

## Step 5: Open Browser
Go to: **http://localhost:3000**

You should see the login page!

## Troubleshooting
- If port 5000 is busy, change PORT in backend/.env to another port (e.g., 5001) and update frontend/vite.config.js proxy target
- If you see "nothing", check browser console (F12) for errors
- Make sure both terminals are running (backend + frontend)
